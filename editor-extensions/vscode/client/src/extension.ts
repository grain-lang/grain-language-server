/* This file is largely copied from vscode's sample library.
	 The original copyright notice is reproduced below. */
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from 'path';
import { workspace, ExtensionContext, languages, Disposable } from 'vscode';


import {
	LanguageClient,
	LanguageClientOptions,
	ServerOptions,
	TransportKind
} from 'vscode-languageclient';

import { CodelensProvider } from './CodelensProvider';


let client: LanguageClient;

let disposables: Disposable[] = [];

let codelensProvider: CodelensProvider;

export function activate(context: ExtensionContext) {

	// The server is implemented in node
	let serverModule = context.asAbsolutePath(
		path.join('server', 'out', 'server.js')
	);
	// The debug options for the server
	// --inspect=6009: runs the server in Node's Inspector mode so VS Code can attach to the server for debugging
	let debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

	// If the extension is launched in debug mode then the debug server options are used
	// Otherwise the run options are used
	let serverOptions: ServerOptions = {
		run: { module: serverModule, transport: TransportKind.ipc },
		debug: {
			module: serverModule,
			transport: TransportKind.ipc,
			options: debugOptions
		}
	};


	// Options to control the language client
	let clientOptions: LanguageClientOptions = {
		// Register the server for plain text documents
		documentSelector: [{ scheme: 'file', language: 'grain' }],
		synchronize: {
			// Notify the server about file changes to '.clientrc files contained in the workspace
			fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
		}
	};

	// Create the language client and start the client.
	client = new LanguageClient(
		'grainLangageServer',
		'Grain Language Server',
		serverOptions,
		clientOptions
	);

	client.onReady().then(() => {
		// register a dummy code lens provider
		// so I can trigger lens updates
		// until LSP 3.16.0 arrives
		codelensProvider = new CodelensProvider(client);
		languages.registerCodeLensProvider("grain", codelensProvider);

		codelensProvider.triggerRefresh();
		client.onNotification("grainlsp/lensesLoaded", (files: Array<String>) => {
			codelensProvider.triggerRefresh();
		});
	});

	// Start the client. This will also launch the server
	client.start();

}

export function deactivate(): Thenable<void> | undefined {
	if (disposables) {
		disposables.forEach(item => item.dispose());
	}
	disposables = [];
	if (!client) {
		return undefined;
	}
	return client.stop();
}
