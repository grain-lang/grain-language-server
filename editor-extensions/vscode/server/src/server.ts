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
	Position
} from 'vscode-languageserver';

import {
	TextDocument

} from 'vscode-languageserver-textdocument';

import * as childProcess from 'child_process';
import { basename } from 'path';


// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager. 
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
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
			// Tell the client that this server supports code completion.
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
});

// The grain cli settings
interface GrainSettings {
	maxNumberOfProblems: number;
	cliPath: string;
}

// The global settings, used when the `workspace/configuration` request is not supported by the client.
// Please note that this is not the case when using this server with the client provided in this example
// but could happen with other clients.
const defaultSettings: GrainSettings = { maxNumberOfProblems: 1000, cliPath: "grain" };
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

	// Revalidate all open text documents
	documents.all().forEach(validateWithCompiler);
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
		});
		documentSettings.set(resource, result);
	}
	return result;
}

// Only keep settings for open documents
documents.onDidClose(e => {
	documentSettings.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent(change => {
	validateWithCompiler(change.document);
});


// simple approach, pass the whole text buffer as stdin to the compiler
async function validateWithCompiler(textDocument: TextDocument): Promise<void> {

	let text = textDocument.getText();
	let name = textDocument.uri;
	let filename = basename(name);
	let diagnostics: Diagnostic[] = [];

	let cliPath = globalSettings.cliPath;

	try {

		let result_json_buffer = childProcess.execFileSync(cliPath, ["lsp", filename], { input: text });

		interface LSP_Error {
			file: string;
			line: number;
			startchar: number,
			endline: number,
			endchar: number,
			lsp_message: string
		}

		let error: LSP_Error = JSON.parse(result_json_buffer.toString());

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

	}


	catch (e) {
		connection.console.log(e)
	}

	// Send the computed diagnostics to VSCode.
	connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
};

connection.onDidChangeWatchedFiles(_change => {
	// Monitored files have change in VSCode
	connection.console.log('We received an file change event');
});

// This handler provides the initial list of the completion items.
connection.onCompletion(
	(_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
		// The pass parameter contains the position of the text document in
		// which code complete got requested. For the example we ignore this
		// info and always provide the same completion items.
		return [
			// {
			// 	label: 'TypeScript',
			// 	kind: CompletionItemKind.Text,
			// 	data: 1
			// },
			// {
			// 	label: 'JavaScript',
			// 	kind: CompletionItemKind.Text,
			// 	data: 2
			// }
		];
	}
);

// This handler resolves additional information for the item selected in
// the completion list.
// connection.onCompletionResolve(
// 	(item: CompletionItem): CompletionItem => {
// 		if (item.data === 1) {
// 			item.detail = 'TypeScript details';
// 			item.documentation = 'TypeScript documentation';
// 		} else if (item.data === 2) {
// 			item.detail = 'JavaScript details';
// 			item.documentation = 'JavaScript documentation';
// 		}
// 		return item;
// 	}
// );

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
