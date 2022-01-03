/* This file is largely copied from vscode's sample library.
   The original copyright notice is reproduced below. */
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import * as path from "path";
import { workspace, commands, ExtensionContext, languages, Disposable, OutputChannel } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient";

//import { CodelensProvider } from "./CodelensProvider";
import { GrainDocCompletionProvider } from "./GrainDocCompletionProvider";

import * as WebSocket from 'ws';

let client: LanguageClient;

let disposables: Disposable[] = [];

let grainDocCompletionProvider: GrainDocCompletionProvider;

export function activate(context: ExtensionContext) {

  const socketPort = workspace.getConfiguration('grain_language_server').get('port', 7000);
  let socket: WebSocket | null = null;

  commands.registerCommand('grain_language_server.startStreaming', () => {
    // Establish websocket connection
    socket = new WebSocket(`ws://localhost:${socketPort}`);
  });

  // The log to send
  let log = '';
  const websocketOutputChannel: OutputChannel = {
    name: 'websocket',
    // Only append the logs but send them later
    append(value: string) {
      log += value;
      console.log(value);
    },
    appendLine(value: string) {
      log += value;
      // Don't send logs until WebSocket initialization
      if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(log);
      }
      log = '';
    },
    clear() { /* empty */ },
    show() { /* empty */ },
    hide() { /* empty */ },
    dispose() { /* empty */ }
  };

  let runArgs: string[] = [];
  let debugArgs: string[] = [];

  let executablePath = "/Users/marcus/Projects/grain/cli/bin/grainlsp.exe";

  let serverOptions: ServerOptions = {
    run: { command: executablePath, transport: TransportKind.stdio, args: runArgs },
    debug: {
      command: executablePath,
      transport: TransportKind.stdio,
      args: debugArgs,
    },
  };



  // Options to control the language client
  let clientOptions: LanguageClientOptions = {
    // Register the server for plain text documents
    documentSelector: [{ scheme: "file", language: "grain" }],
    synchronize: {
      // Notify the server about file changes to '.clientrc files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
    },
    //  outputChannel: websocketOutputChannel
  };

  // Create the language client and start the client.
  client = new LanguageClient(
    "grain_langage_server",
    "Grain Language Server",
    serverOptions,
    clientOptions
  );

  client.onReady().then(() => {
    grainDocCompletionProvider = new GrainDocCompletionProvider(client);
    languages.registerCompletionItemProvider(
      "grain",
      grainDocCompletionProvider,
      "*"
    );
  });

  // Start the client. This will also launch the server
  client.start();
}

export function deactivate(): Thenable<void> | undefined {
  if (disposables) {
    disposables.forEach((item) => item.dispose());
  }
  disposables = [];
  if (!client) {
    return undefined;
  }
  return client.stop();
}
