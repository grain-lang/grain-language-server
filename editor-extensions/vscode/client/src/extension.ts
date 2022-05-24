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
  WorkspaceFoldersChangeEvent,
  Uri,
  window,
} from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
} from "vscode-languageclient/node";

import * as fs from "fs";

import { GrainDocCompletionProvider } from "./GrainDocCompletionProvider";

let extensionName = "Grain Language Server";

let languageId = "grain";

let outputChannel = window.createOutputChannel(extensionName, languageId);

let isWindows = /^win32/.test(process.platform);

let defaultClient: LanguageClient;
let clients: Map<string, LanguageClient> = new Map();

function dirpathFromUri(uri: Uri): string {
  let dirPath = uri.toString();
  if (!dirPath.endsWith("/")) {
    return dirPath + "/";
  }
  return dirPath;
}

function filepathFromUri(uri: Uri) {
  let filename = uri.fsPath;

  // Packaged Grain doesn't understand lowercase drive letters.
  // If authority is not empty, then we can skip since this is
  // a UNC path.
  if (isWindows && uri.authority === "") {
    filename = filename[0].toUpperCase() + filename.substring(1);
  }

  return filename;
}

function globFromUri(uri: Uri, glob: string) {
  // globs always need to use `/`
  return uri.fsPath.replaceAll("\\", "/") + "/" + glob;
}

let workspaceFolders: string[] = [];
function sortWorkspaceFolders(): string[] {
  if (workspaceFolders.length === 0) {
    if (!workspace.workspaceFolders) {
      workspaceFolders = [];
    } else {
      workspaceFolders = workspace.workspaceFolders
        .map((folder) => dirpathFromUri(folder.uri))
        .sort((a, b) => a.length - b.length);
    }
  }
  return workspaceFolders;
}

function getOuterMostWorkspaceFolder(folder: WorkspaceFolder): WorkspaceFolder {
  let sorted = sortWorkspaceFolders();
  for (let element of sorted) {
    let dirpath = dirpathFromUri(folder.uri);
    if (dirpath.startsWith(element)) {
      return workspace.getWorkspaceFolder(Uri.parse(element))!;
    }
  }
  return folder;
}

async function startClient(workspaceFolder?: WorkspaceFolder) {
  let config = workspace.getConfiguration("grain", workspaceFolder?.uri);

  let lspEnabled: boolean = config.get("enableLSP");

  if (!lspEnabled) {
    return;
  }

  let executablePath: string = config.get("cliPath") || "grain";

  // Not sure if this can technically change between VSCode restarts. Even if it does,
  // it is likely to be swapped with PowerShell, which understands the `.cmd` executables.
  let needsCMD =
    isWindows && process.env.ComSpec && /cmd.exe$/.test(process.env.ComSpec);

  if (
    needsCMD &&
    !executablePath.endsWith(".cmd") &&
    !executablePath.endsWith(".exe")
  ) {
    executablePath += ".cmd";
  }

  let command = executablePath;
  let args = ["lsp"];

  let clientOptions: LanguageClientOptions;
  if (workspaceFolder) {
    let buildScriptUri = Uri.joinPath(
      workspaceFolder.uri,
      "script/grainfind.js"
    );
    let buildScriptPath = filepathFromUri(buildScriptUri);

    if (fs.existsSync(buildScriptPath)) {
      command = "node";
      args = [buildScriptPath, ...args];
    }

    clientOptions = {
      documentSelector: [
        {
          scheme: "file",
          language: languageId,
          pattern: `${globFromUri(workspaceFolder.uri, "**/*")}`,
        },
      ],
      workspaceFolder,
      outputChannel,
    };
  } else {
    clientOptions = {
      documentSelector: [
        {
          scheme: "untitled",
          language: languageId,
        },
      ],
      outputChannel,
    };
  }

  let serverOptions: ServerOptions = {
    command,
    args,
  };

  let client = new LanguageClient(
    languageId,
    extensionName,
    serverOptions,
    clientOptions
  );

  await client.start();

  let grainDocCompletionProvider = new GrainDocCompletionProvider(client);
  languages.registerCompletionItemProvider(
    "grain",
    grainDocCompletionProvider,
    "*"
  );

  return client;
}

async function addClient(workspaceFolder: WorkspaceFolder) {
  let workspacePath = workspaceFolder.uri.toString();
  if (!clients.has(workspacePath)) {
    // Start the client. This will also launch the server
    let client = await startClient(workspaceFolder);
    clients.set(workspacePath, client);
  }
}

async function removeClient(workspaceFolder: WorkspaceFolder) {
  let workspacePath = workspaceFolder.uri.toString();
  let client = clients.get(workspacePath);
  if (client) {
    await client.stop();
    clients.delete(workspacePath);
  }
}

async function restartAllClients() {
  if (defaultClient) {
    await defaultClient.restart();
  }
  for (let client of clients.values()) {
    await client.restart();
  }
}

async function didOpenTextDocument(
  document: TextDocument
): Promise<Disposable> {
  // We are only interested in language mode text
  if (document.languageId !== languageId) {
    return Disposable.from();
  }

  let uri = document.uri;
  // Untitled files go to a default client.
  if (uri.scheme === "untitled" && !defaultClient) {
    defaultClient = await startClient();
    return Disposable.from();
  }
  let folder = workspace.getWorkspaceFolder(uri);
  // Files outside a folder can't be handled. This might depend on the language.
  // Single file languages like JSON might handle files outside the workspace folders.
  if (!folder) {
    return Disposable.from();
  }
  // If we have nested workspace folders we only start a server on the outer most workspace folder.
  folder = getOuterMostWorkspaceFolder(folder);

  addClient(folder);

  return workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration("grain.cliPath", folder.uri)) {
      removeClient(folder);
      addClient(folder);
    }

    if (e.affectsConfiguration("grain.enableLSP", folder.uri)) {
      removeClient(folder);
      addClient(folder);
    }
  });
}

async function didChangeWorkspaceFolders(event: WorkspaceFoldersChangeEvent) {
  // Reset the workspace folders so it'll sort them again
  workspaceFolders = [];

  // Do nothing for newly added workspaces because their LSP will be booted
  // up when a file is opened

  // Remove any clients for workspaces that were closed
  for (let folder of event.removed) {
    removeClient(folder);
  }
}

export async function activate(context: ExtensionContext): Promise<void> {
  let didOpenTextDocument$ =
    workspace.onDidOpenTextDocument(didOpenTextDocument);
  let didChangeWorkspaceFolders$ = workspace.onDidChangeWorkspaceFolders(
    didChangeWorkspaceFolders
  );
  let restart$ = commands.registerCommand("grain.restart", restartAllClients);

  context.subscriptions.push(
    didOpenTextDocument$,
    didChangeWorkspaceFolders$,
    restart$
  );

  for (let doc of workspace.textDocuments) {
    const disposable = await didOpenTextDocument(doc);
    context.subscriptions.push(disposable);
  }
}

export async function deactivate(): Promise<void> {
  if (defaultClient) {
    await defaultClient.stop();
  }
  for (let client of clients.values()) {
    await client.stop();
  }
}
