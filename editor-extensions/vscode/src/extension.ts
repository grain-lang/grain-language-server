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

import which from "which";

import { GrainDocCompletionProvider } from "./GrainDocCompletionProvider";

let extensionName = "Grain Language Server";

let languageId = "grain";

let outputChannel = window.createOutputChannel(extensionName, languageId);

let fileClients: Map<string, LanguageClient> = new Map();
let workspaceClients: Map<string, LanguageClient> = new Map();

const grainBinaries = [
  "grain",
  "grain-mac-x64",
  "grain-linux-x64",
  "grain-win-x64",
];

function findGrain() {
  for (const bin of grainBinaries) {
    try {
      const grain = which.sync(bin);
      // If it didn't throw, we found a grain binary
      return grain;
    } catch (err) {
      // Not found
    }
  }
  throw new Error("Unable to locate any Grain binary. Did you install it?");
}

function dirpathFromUri(uri: Uri): string {
  let dirPath = uri.toString();
  if (!dirPath.endsWith("/")) {
    return dirPath + "/";
  }
  return dirPath;
}

function globFromUri(uri: Uri, glob: string) {
  // globs always need to use `/`
  return `${uri.fsPath}${glob}`.replaceAll("\\", "/");
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

function getLspCommand(uri: Uri) {
  let config = workspace.getConfiguration("grain", uri);

  let lspEnabled: boolean = config.get("enableLSP");

  if (!lspEnabled) {
    return;
  }

  let command: string = config.get("cliPath") || findGrain();
  // For some reason, if you specify a capitalized EXE extension for our pkg binary,
  // it crashes the LSP so we just lowercase any .EXE ending in the command
  command = command.replace(/\.EXE$/, ".exe");

  let flags = config.get<string | undefined>("cliFlags") || "";

  let args = ["lsp", ...flags.split(" ")];

  return [command, args] as const;
}

async function startFileClient(uri: Uri) {
  let [command, args] = getLspCommand(uri);

  let clientOptions = {
    documentSelector: [
      {
        scheme: uri.scheme,
        language: languageId,
        pattern: `${globFromUri(uri, "")}`,
      },
    ],
    outputChannel,
  };

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

  client.info(
    `Starting LSP client using command: ${command} ${args.join(" ")}`
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

async function addFileClient(uri: Uri) {
  let file = uri.toString();
  if (!fileClients.has(file)) {
    // Start the client. This will also launch the server
    let client = await startFileClient(uri);
    fileClients.set(file, client);
  }
}

async function removeFileClient(uri: Uri) {
  let file = uri.toString();
  let client = fileClients.get(file);
  if (client) {
    await client.stop();
    fileClients.delete(file);
  }
}

async function startWorkspaceClient(workspaceFolder: WorkspaceFolder) {
  let [command, args] = getLspCommand(workspaceFolder.uri);

  let clientOptions: LanguageClientOptions = {
    documentSelector: [
      {
        scheme: "file",
        language: languageId,
        // Glob starts with `/` because it just appends both segments
        pattern: `${globFromUri(workspaceFolder.uri, "/**/*")}`,
      },
    ],
    workspaceFolder,
    outputChannel,
  };

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

  client.info(
    `Starting LSP client using command: ${command} ${args.join(" ")}`
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

async function addWorkspaceClient(workspaceFolder: WorkspaceFolder) {
  let workspacePath = workspaceFolder.uri.toString();
  if (!workspaceClients.has(workspacePath)) {
    // Start the client. This will also launch the server
    let client = await startWorkspaceClient(workspaceFolder);
    workspaceClients.set(workspacePath, client);
  }
}

async function removeWorkspaceClient(workspaceFolder: WorkspaceFolder) {
  let workspacePath = workspaceFolder.uri.toString();
  let client = workspaceClients.get(workspacePath);
  if (client) {
    await client.stop();
    workspaceClients.delete(workspacePath);
  }
}

async function restartAllClients() {
  for (let client of fileClients.values()) {
    await client.restart();
  }
  for (let client of workspaceClients.values()) {
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
  let folder = workspace.getWorkspaceFolder(uri);
  let configHandler;
  if (folder) {
    // If we have nested workspace folders we only start a server on the outer most workspace folder.
    folder = getOuterMostWorkspaceFolder(folder);

    await addWorkspaceClient(folder);

    configHandler = async (e) => {
      if (e.affectsConfiguration("grain.cliFlags", folder.uri)) {
        await removeWorkspaceClient(folder);
        await addWorkspaceClient(folder);
      }

      if (e.affectsConfiguration("grain.cliPath", folder.uri)) {
        await removeWorkspaceClient(folder);
        await addWorkspaceClient(folder);
      }

      if (e.affectsConfiguration("grain.enableLSP", folder.uri)) {
        await removeWorkspaceClient(folder);
        await addWorkspaceClient(folder);
      }
    };
  } else {
    // Each file outside of a workspace gets it's own client
    await addFileClient(uri);

    configHandler = async (e) => {
      if (e.affectsConfiguration("grain.cliFlags", uri)) {
        await removeFileClient(uri);
        await addFileClient(uri);
      }

      if (e.affectsConfiguration("grain.cliPath", uri)) {
        await removeFileClient(uri);
        await addFileClient(uri);
      }

      if (e.affectsConfiguration("grain.enableLSP", uri)) {
        await removeFileClient(uri);
        await addFileClient(uri);
      }
    };
  }

  return workspace.onDidChangeConfiguration(configHandler);
}

async function didChangeWorkspaceFolders(event: WorkspaceFoldersChangeEvent) {
  // Reset the workspace folders so it'll sort them again
  workspaceFolders = [];

  // Do nothing for newly added workspaces because their LSP will be booted
  // up when a file is opened

  // Remove any clients for workspaces that were closed
  for (let folder of event.removed) {
    removeWorkspaceClient(folder);
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
  for (let client of fileClients.values()) {
    await client.stop();
  }
  for (let client of workspaceClients.values()) {
    await client.stop();
  }
}
