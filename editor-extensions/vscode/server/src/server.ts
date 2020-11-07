/* This file is largely copied from vscode's sample library.
	 The original copyright notice is reproduced below. */
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
import {
	createConnection,
	TextDocuments,
	Diagnostic,
	DiagnosticSeverity,
	ProposedFeatures,
	InitializeParams,
	DidChangeConfigurationNotification,
	CompletionItem,
	CompletionItemKind,
	TextDocumentPositionParams,
	TextDocumentSyncKind,
	InitializeResult,
	Position,
	Range,
	CodeLens
} from 'vscode-languageserver';

import {
	TextDocument

} from 'vscode-languageserver-textdocument';

import * as childProcess from 'child_process';
import { compileFunction } from 'vm';

interface LSP_Error {
	file: string;
	line: number;
	startchar: number,
	endline: number,
	endchar: number,
	lsp_message: string
}

interface LSP_Lens {
	line: number,
	signature: string
}

interface LSP_Result {
	errors: LSP_Error[],
	lenses: LSP_Lens[]
}

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager. 
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let changedDocuments = new Set<string>();
let debounceTimer: NodeJS.Timer;

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

interface Dictionary<T> {
	[Key: string]: T;
}

// store lenses per document by uri
let documentLenses: Map<string, LSP_Lens[]> = new Map();

async function processChangedDocuments(): Promise<void> {
	changedDocuments.forEach(uri => { validateWithCompiler(uri); changedDocuments.delete(uri) });
}

connection.onInitialize((params: InitializeParams) => {

	connection.console.log("onInitialize");

	let capabilities = params.capabilities;

	// Does the client support the `workspace/configuration` request?
	// If not, we fall back using global settings.
	hasConfigurationCapability = !!(
		capabilities.workspace && !!capabilities.workspace.configuration
	);
	hasWorkspaceFolderCapability = !!(
		capabilities.workspace && !!capabilities.workspace.workspaceFolders
	);
	hasDiagnosticRelatedInformationCapability = !!(
		capabilities.textDocument &&
		capabilities.textDocument.publishDiagnostics &&
		capabilities.textDocument.publishDiagnostics.relatedInformation
	);

	const result: InitializeResult = {
		capabilities: {
			textDocumentSync: TextDocumentSyncKind.Incremental,
			codeLensProvider: {
				resolveProvider: true
			}
			// Tell the client that this server supports code completion.
			// Coming soon!
			// completionProvider: {
			// 	resolveProvider: true
			// }
		}
	};
	if (hasWorkspaceFolderCapability) {
		result.capabilities.workspace = {
			workspaceFolders: {
				supported: true
			}
		};
	}

	return result;
});

connection.onInitialized(() => {
	if (hasConfigurationCapability) {
		// Register for all configuration changes.
		connection.client.register(DidChangeConfigurationNotification.type, undefined);
	}
	if (hasWorkspaceFolderCapability) {
		connection.workspace.onDidChangeWorkspaceFolders(_event => {
			connection.console.log('Workspace folder change event received.');
		});
	}

	// start the debounce time
	if (hasConfigurationCapability) {
		// get the debounce rate from settings
		connection.workspace.getConfiguration({
			section: 'grain_language_server'
		}).then(settings =>
			debounceTimer = global.setInterval(processChangedDocuments, settings.debounce));
	} else {
		debounceTimer = global.setInterval(processChangedDocuments, globalSettings.debounce);
	};
});

// The grain cli settings
interface GrainSettings {
	maxNumberOfProblems: number;
	cliPath: string;
	enableLSP: boolean;
	trace: string;
	debounce: number;
	enableStatementLenses: boolean;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: GrainSettings = {
	maxNumberOfProblems: 1000, cliPath: "grain",
	enableLSP: true, trace: "off", debounce: 1000, enableStatementLenses: true
};
let globalSettings: GrainSettings = defaultSettings;

// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<GrainSettings>> = new Map();

connection.onDidChangeConfiguration(change => {
	if (hasConfigurationCapability) {
		// Reset all cached document settings
		documentSettings.clear();
	} else {
		globalSettings = <GrainSettings>(
			(change.settings.grain_language_server || defaultSettings)
		);
	}

	// clear down the list as we're going to process them all below.
	changedDocuments = new Set();
	// Revalidate all open text documents
	documents.all().forEach(doc => validateWithCompiler(doc.uri));

});

function getDocumentSettings(resource: string): Thenable<GrainSettings> {
	if (!hasConfigurationCapability) {
		return Promise.resolve(globalSettings);
	}
	let result = documentSettings.get(resource);
	if (!result) {
		result = connection.workspace.getConfiguration({
			scopeUri: resource,
			section: 'grain_language_server'
		})
		documentSettings.set(resource, result);
	}
	return result;
}

// Only keep settings for open documents
// don't process closed documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
	if (changedDocuments.has(e.document.uri)) changedDocuments.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	// Debounce the actual work as we don't want to run a compile on every keystroke
	// So here we store the uri of the document that has changed
	changedDocuments.add(change.document.uri);
});

async function clearDiagnostics(textDocument: TextDocument): Promise<void> {
	let diagnostics: Diagnostic[] = [];
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}


// simple approach, pass the whole text buffer as stdin to the compiler
async function validateWithCompiler(textDocumentUri: string): Promise<void> {

	let settings = await getDocumentSettings(textDocumentUri);
	let diagnostics: Diagnostic[] = [];

	if (settings.enableLSP) {

		if (settings.trace == "verbose") {
			connection.console.log("Validating " + textDocumentUri);
		}

		let fileProtocol = "file://"

		if (textDocumentUri.startsWith(fileProtocol)) {

			let filename = textDocumentUri.substring(fileProtocol.length);
			let cliPath = settings.cliPath;

			try {

				// get the latest text from the cache

				let textDocument = documents.get(textDocumentUri);

				if (textDocument != undefined) {

					let text = textDocument.getText();
					let result_json_buffer = childProcess.execFileSync(cliPath, ["lsp", filename], { input: text });

					let json_string = result_json_buffer.toString();

					if (json_string.length > 0) {

						let result: LSP_Result = JSON.parse(json_string);

						let errors = result.errors;
						let lenses = result.lenses;



						if (settings.enableStatementLenses) {

							if (lenses.length > 0) {
								connection.console.log("We have lenses");
								if (documentLenses.has(textDocumentUri)) {
									documentLenses.delete(textDocumentUri);
								}
								documentLenses.set(textDocumentUri, result.lenses);

								// work around LSP not having an onDidChangeCodeLenses yet
								// If we don' call this we are always one step behind
								connection.console.log("Sending notification");
								connection.sendNotification("grainlsp/lensesLoaded", []);
							}
						} else {
							// clear the lenses the first time we find any left over
							// after a switch to no lenses
							if (documentLenses.keys.length > 0) {
								documentLenses = new Map();
							}
						}

						if (errors.length > 0) {

							let error = errors[0];
							let spos = Position.create(error.line - 1, error.startchar);
							let epos = Position.create(error.endline - 1, error.endchar);

							let diagnostic: Diagnostic = {
								severity: DiagnosticSeverity.Error,
								range: {
									start: spos,
									end: epos,
								},
								message: "Error: " + error.lsp_message,
								source: 'grainc'
							};

							diagnostics.push(diagnostic);
						} else {
							//connection.console.log("No errors");
						}
					}
				}
				else {
					if (settings.trace == "verbose") {
						connection.console.log("Warning: Text document queued but not defined")
					}
				}
			}
			catch (e) {
				if (settings.trace == "verbose" || settings.trace == "messages") {
					connection.console.log("Exception:");
					connection.console.log(e)
				}
			}

		}
	}

	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocumentUri, diagnostics });
};


// This handler provides the initial list of the completion items.
// Leaving this commented for when work on completion is done
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		// The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
		// info and always provide the same completion items.
		return [];
	}
);

// look the lenses up from the info from the last compile

connection.onCodeLens(handler => {

	let codeLenses: CodeLens[] = [];

	if (documentLenses.has(handler.textDocument.uri)) {

		let docLenses = documentLenses.get(handler.textDocument.uri);
		if (docLenses && docLenses.length > 0) {

			docLenses.forEach(lens => {
				const sposition1 = Position.create(lens.line - 1, 1);
				const eposition1 = Position.create(lens.line - 1, 1);
				const range1 = Range.create(sposition1, eposition1);
				let alens: CodeLens = CodeLens.create(range1);
				alens.data = lens.signature;
				codeLenses.push(alens);
			})
		}

	}

	return codeLenses;

});

// we already know the info to return so this is a simple function
connection.onCodeLensResolve(codeLens => {

	let data = codeLens.data;

	codeLens.command = {
		title: data,
		command: "",
		arguments: []
	};
	return codeLens;
});


// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();




