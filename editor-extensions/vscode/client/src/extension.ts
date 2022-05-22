/* This file is largely copied from vscode's sample library.
   The original copyright notice is reproduced below. */
/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import {
  workspace,
  commands,
  ExtensionContext,
  languages,
  Disposable,
  TextDocument,
  WorkspaceFolder,
  Uri,
} from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";

import * as path from "path";

import * as fs from "fs";

import { GrainDocCompletionProvider } from "./GrainDocCompletionProvider";

let buildScriptPath = "script/grainfind.js";
//let client: LanguageClient;

let runArgs: string[] = ["lsp"];

let executablePath = "grain";

const isWindows = /^win32/.test(process.platform);

let defaultClient: LanguageClient;
const clients: Map<string, LanguageClient> = new Map();

let _sortedWorkspaceFolders: string[] | undefined;
function sortedWorkspaceFolders(): string[] {
  if (_sortedWorkspaceFolders === void 0) {
    _sortedWorkspaceFolders = workspace.workspaceFolders
      ? workspace.workspaceFolders
          .map((folder) => {
            let result = folder.uri.toString();
            if (result.charAt(result.length - 1) !== "/") {
              result = result + "/";
            }
            return result;
          })
          .sort((a, b) => {
            return a.length - b.length;
          })
      : [];
  }
  return _sortedWorkspaceFolders;
}
workspace.onDidChangeWorkspaceFolders(
  () => (_sortedWorkspaceFolders = undefined)
);

function getOuterMostWorkspaceFolder(folder: WorkspaceFolder): WorkspaceFolder {
  const sorted = sortedWorkspaceFolders();
  for (const element of sorted) {
    let uri = folder.uri.toString();
    if (uri.charAt(uri.length - 1) !== "/") {
      uri = uri + "/";
    }
    if (uri.startsWith(element)) {
      return workspace.getWorkspaceFolder(Uri.parse(element))!;
    }
  }
  return folder;
}

function filenameFromUri(uri: Uri) {
  let filename = uri.fsPath;

  // Packaged Grain doesn't understand lowercase drive letters.
  // If authority is not empty, then we can skip since this is
  // a UNC path.
  if (isWindows && uri.authority === "") {
    filename = filename[0].toUpperCase() + filename.substring(1);
  }

  return filename;
}

async function startClient(workspace_uri?: Uri) {
  // Not sure if this can technically change between VSCode restarts. Even if it does,
  // it is likely to be swapped with PowerShell, which understands the `.cmd` executables.
  const needsCMD =
    isWindows && process.env.ComSpec && /cmd.exe$/.test(process.env.ComSpec);

  if (
    needsCMD &&
    !executablePath.endsWith(".cmd") &&
    !executablePath.endsWith(".exe")
  ) {
    executablePath += ".cmd";
  }

  let run_path = executablePath;
  let localRunArgs = [...runArgs];

  if (workspace_uri) {
    let workspaceFolder = filenameFromUri(workspace_uri);
    const absoluteBuildScript = path.join(
      workspaceFolder + "/" + buildScriptPath
    );

    if (fs.existsSync(absoluteBuildScript)) {
      run_path = "node";
      localRunArgs = [absoluteBuildScript, ...localRunArgs];
    }
  }
  let serverOptions: ServerOptions = {
    command: run_path,
    args: localRunArgs,
  };

  // Options to control the language client
  let clientOptions: LanguageClientOptions = {
    // Register the server for grain documents
    documentSelector: [{ scheme: "file", language: "grain" }],
    synchronize: {
      // Notify the server about file changes to '.clientrc files contained in the workspace
      fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
    },
  };

  const client = new LanguageClient(
    "grain",
    "Grain Language Server",
    serverOptions,
    clientOptions
  );

  await client.start();

  const grainDocCompletionProvider = new GrainDocCompletionProvider(client);
  languages.registerCompletionItemProvider(
    "grain",
    grainDocCompletionProvider,
    "*"
  );

  return client;
}

const restart = () => {
  const promises: Thenable<void>[] = [];
  if (defaultClient) {
    promises.push(defaultClient.stop());
  }
  for (const client of clients.values()) {
    promises.push(client.stop());
  }

  Promise.all(promises).then(() => {
    if (defaultClient) {
      defaultClient.start();
    }
    for (const client of clients.values()) {
      client.start();
    }
  });
};

commands.registerCommand("grain_language_server.restart", restart);

async function didOpenTextDocument(document: TextDocument): Promise<void> {
  // We are only interested in language mode text
  if (document.languageId !== "grain") {
    return;
  }

  const uri = document.uri;
  // Untitled files go to a default client.
  if (uri.scheme === "untitled" && !defaultClient) {
    defaultClient = await startClient();
    return;
  }
  let folder = workspace.getWorkspaceFolder(uri);
  // Files outside a folder can't be handled. This might depend on the language.
  // Single file languages like JSON might handle files outside the workspace folders.
  if (!folder) {
    return;
  }
  // If we have nested workspace folders we only start a server on the outer most workspace folder.
  folder = getOuterMostWorkspaceFolder(folder);

  if (!clients.has(folder.uri.toString())) {
    // Start the client. This will also launch the server
    const client = await startClient(folder.uri);
    clients.set(folder.uri.toString(), client);
  }
}

export function activate(context: ExtensionContext) {
  workspace.onDidOpenTextDocument(didOpenTextDocument);
  workspace.textDocuments.forEach(didOpenTextDocument);
  workspace.onDidChangeWorkspaceFolders((event) => {
    for (const folder of event.removed) {
      const client = clients.get(folder.uri.toString());
      if (client) {
        clients.delete(folder.uri.toString());
        client.stop();
      }
    }
  });
}

export async function deactivate(): Promise<void> {
  const promises: Thenable<void>[] = [];
  if (defaultClient) {
    promises.push(defaultClient.stop());
  }
  for (const client of clients.values()) {
    promises.push(client.stop());
  }
  await Promise.all(promises);
}
