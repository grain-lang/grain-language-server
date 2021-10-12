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
  Hover,
  CompletionItem,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  Position,
  Range,
  CodeLens,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";
import { URI } from "vscode-uri";

import * as childProcess from "child_process";

import * as fs from "fs";
import * as path from "path";

const buildScriptPath = "script/grainfind.js";

const isWindows = /^win32/.test(process.platform);
// Not sure if this can technically change between VSCode restarts. Even if it does,
// it is likely to be swapped with PowerShell, which understands the `.cmd` executables.
const needsCMD =
  isWindows && process.env.ComSpec && /cmd.exe$/.test(process.env.ComSpec);

const fileScheme = "file";

function filenameFromUri(uri: URI) {
  let filename = uri.fsPath;

  // Packaged Grain doesn't understand lowercase drive letters.
  // If authority is not empty, then we can skip since this is
  // a UNC path.
  if (isWindows && uri.authority === "") {
    filename = filename[0].toUpperCase() + filename.substring(1);
  }

  return filename;
}

interface LSP_Error {
  file: string;
  line: number;
  startchar: number;
  endline: number;
  endchar: number;
  lsp_message: string;
}

interface LSP_Warning {
  file: string;
  line: number;
  startchar: number;
  endline: number;
  endchar: number;
  number: number;
  lsp_message: string;
}

interface LSP_Lens {
  sl: number;
  sc: number;
  sb: number;
  el: number;
  ec: number;
  eb: number;
  s: string;
  t: string;
}

interface LSP_Result {
  errors: LSP_Error[];
  warnings: LSP_Warning[];
  values: LSP_Lens[];
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

// The workspace folder this server is operating on
let workspaceFolder: string | null;

// store lenses per document by uri
let documentLenses: Map<string, LSP_Lens[]> = new Map();

async function processChangedDocuments(): Promise<void> {
  changedDocuments.forEach((uri) => {
    validateWithCompiler(uri);
    changedDocuments.delete(uri);
  });
}

connection.onInitialize((params: InitializeParams) => {
  let pathUri: any;
  if (!params.workspaceFolders) {
    pathUri = params.rootUri;
  } else {
    let root: any;
    if (params.workspaceFolders.length === 1) {
      root = params.workspaceFolders[0];
      pathUri = root.uri;
    } else {
      pathUri = params.rootPath;
    }
  }

  let uri = URI.parse(pathUri);
  if (uri.scheme == fileScheme) {
    let workspaceFolder = filenameFromUri(uri);
    buildScriptPath = path.join(workspaceFolder + "/" + buildScriptPath);
  }

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
      // Commented out because currently using a client side lens extension hack
      // to get VSCode to update as needed.   The server is still providing the lenses,
      // but we ask for them manually.  Once LSP 3.16.0 is out we'll revert to advertising
      // being a lense provider again as below.
      // codeLensProvider: {
      // 	resolveProvider: true
      // },
      hoverProvider: true,
      documentFormattingProvider: true,
      // Tell the client that this server supports code completion.
      // Coming soon!
      // completionProvider: {
      // 	resolveProvider: true
      // }
    },
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }

  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }
  if (hasWorkspaceFolderCapability) {
    connection.workspace.onDidChangeWorkspaceFolders((_event) => {
      //	connection.console.log('Workspace folder change event received.');
    });
  }

  // start the debounce time
  if (hasConfigurationCapability) {
    // get the debounce rate from settings
    connection.workspace
      .getConfiguration({
        section: "grain_language_server",
      })
      .then((settings) => settings ?? globalSettings)
      .then(
        (settings) =>
          (debounceTimer = global.setInterval(
            processChangedDocuments,
            settings.debounce
          ))
      );
  } else {
    debounceTimer = global.setInterval(
      processChangedDocuments,
      globalSettings.debounce
    );
  }
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
  maxNumberOfProblems: 1000,
  cliPath: "grain",
  enableLSP: true,
  trace: "off",
  debounce: 1000,
  enableStatementLenses: true,
};
let globalSettings: GrainSettings = defaultSettings;

// Cache the settings of all open documents
let documentSettings: Map<string, Thenable<GrainSettings>> = new Map();

connection.onDidChangeConfiguration((change) => {
  if (hasConfigurationCapability) {
    // Reset all cached document settings
    documentSettings.clear();
  } else {
    globalSettings = <GrainSettings>(
      (change.settings.grain_language_server || defaultSettings)
    );
  }

  documentLenses = new Map();

  // clear down the list as we're going to process them all below.
  changedDocuments = new Set();
  // Revalidate all open text documents
  documents.all().forEach((doc) => validateWithCompiler(doc.uri));
});

function getDocumentSettings(resource: string): Thenable<GrainSettings> {
  if (!hasConfigurationCapability) {
    return Promise.resolve(globalSettings);
  }
  let result = documentSettings.get(resource);
  if (!result) {
    result = connection.workspace
      .getConfiguration({
        scopeUri: resource,
        section: "grain_language_server",
      })
      .then((settings) => settings ?? globalSettings);
    documentSettings.set(resource, result);
  }
  return result;
}

// Only keep settings for open documents
// don't process closed documents
documents.onDidClose((e) => {
  documentSettings.delete(e.document.uri);
  if (changedDocuments.has(e.document.uri))
    changedDocuments.delete(e.document.uri);
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
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

    let uri = URI.parse(textDocumentUri);
    if (uri.scheme == fileScheme) {
      let filename = filenameFromUri(uri);
      let cliPath = settings.cliPath;

      // If we are executing Grain on Windows in `cmd.exe`,
      // the command must end in `.cmd` otherwise it fails
      // However, if we are running grain-win-x64.exe we don't
      // want to append it because otherwise it breaks
      if (needsCMD && !cliPath.endsWith(".cmd") && !cliPath.endsWith(".exe")) {
        cliPath += ".cmd";
      }

      try {
        // get the latest text from the cache

        let textDocument = documents.get(textDocumentUri);

        if (textDocument != undefined) {
          let text = textDocument.getText();

          let json_string = "";

          let cwd = path.dirname(filename);

          let run_path = cliPath;
          let args = [];

          // check every run in case it's added or removed
          if (fs.existsSync(buildScriptPath)) {
            run_path = "node";
            args = [buildScriptPath, "lsp", filename];
          } else {
            args = ["lsp", filename];
          }

          let result_json_buffer = childProcess.execFileSync(run_path, args, {
            input: text,
            cwd,
          });

          json_string = result_json_buffer.toString();

          if (json_string.length > 0) {
            try {
              let result: LSP_Result = JSON.parse(json_string);
              let errors = result.errors;
              let warnings = result.warnings;
              // backwards compatibility
              if (warnings == null) {
                warnings = [];
              }

              let lenses = result.values;
              if (settings.enableStatementLenses) {
                if (documentLenses.has(textDocumentUri)) {
                  documentLenses.delete(textDocumentUri);
                }

                // always set it, it may just be empty
                documentLenses.set(textDocumentUri, lenses);

                // work around LSP not having an onDidChangeCodeLenses yet
                // If we don' call this we are always one step behind

                connection.sendNotification("grainlsp/lensesLoaded", []);
              } else {
                // clear the lenses the first time we find any left over
                // after a switch to no lenses
                if (documentLenses.keys.length > 0) {
                  documentLenses = new Map();
                }
              }

              if (errors.length > 0) {
                let error = errors[0];

                let schar = error.startchar < 0 ? 0 : error.startchar;
                let echar = error.endchar < 0 ? 0 : error.endchar;

                let spos = Position.create(error.line - 1, schar);
                let epos = Position.create(error.endline - 1, echar);

                let diagnostic: Diagnostic = {
                  severity: DiagnosticSeverity.Error,
                  range: {
                    start: spos,
                    end: epos,
                  },
                  message: "Error: " + error.lsp_message,
                  source: "grainc",
                };

                diagnostics.push(diagnostic);
              }
              if (warnings.length > 0) {
                warnings.forEach((warning) => {
                  let schar = warning.startchar < 0 ? 0 : warning.startchar;
                  let echar = warning.endchar < 0 ? 0 : warning.endchar;

                  let spos = Position.create(warning.line - 1, schar);
                  let epos = Position.create(warning.endline - 1, echar);

                  let diagnostic: Diagnostic = {
                    severity: DiagnosticSeverity.Warning,
                    range: {
                      start: spos,
                      end: epos,
                    },
                    message:
                      "Warning " + warning.number + ": " + warning.lsp_message,
                    source: "grainc",
                  };

                  diagnostics.push(diagnostic);
                });
              }
            } catch (ex: any) {
              if (settings.trace == "verbose") {
                connection.console.log("Json Exception:");
                connection.console.log(ex.message());
                connection.console.log(ex.stack());
              }
            }
          }
        } else {
          if (settings.trace == "verbose") {
            connection.console.log(
              "Warning: Text document queued but not defined"
            );
          }
        }
      } catch (e: any) {
        if (settings.trace == "verbose" || settings.trace == "messages") {
          connection.console.log("Exception:");
          connection.console.log(e);
        }
      }
    }
  }

  // Send the computed diagnostics to VSCode.
  connection.sendDiagnostics({ uri: textDocumentUri, diagnostics });
}

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

connection.onDocumentFormatting(async (handler) => {
  let uri = URI.parse(handler.textDocument.uri);
  let settings = await getDocumentSettings(handler.textDocument.uri);
  if (uri.scheme == fileScheme) {
    let filename = filenameFromUri(uri);
    let cliPath = settings.cliPath;

    // If we are executing Grain on Windows in `cmd.exe`,
    // the command must end in `.cmd` otherwise it fails
    // However, if we are running grain-win-x64.exe we don't
    // want to append it because otherwise it breaks
    if (needsCMD && !cliPath.endsWith(".cmd") && !cliPath.endsWith(".exe")) {
      cliPath += ".cmd";
    }

    try {
      // get the latest text from the cache

      let textDocument = documents.get(handler.textDocument.uri);
      let cwd = path.dirname(filename);

      if (textDocument != undefined) {
        let text = textDocument.getText();

        let run_path = cliPath;
        let args = [];

        if (fs.existsSync(buildScriptPath)) {
          run_path = "node";
          args = [buildScriptPath, "format"];
        } else {
          args = ["format"];
        }

        let result_buffer = childProcess.execFileSync(run_path, args, {
          input: text,
          cwd,
        });

        let res = result_buffer.toString();

        return Promise.resolve([
          {
            range: {
              start: Position.create(0, 0),
              end: Position.create(
                Number.MAX_SAFE_INTEGER,
                Number.MAX_SAFE_INTEGER
              ),
            },
            newText: res,
          },
        ]);
      }
    } catch (e: any) {
      connection.console.log("Exception:");
      connection.console.log(e);
    }
  }
  return null;
});

// look the lenses up from the info from the last compile

connection.onCodeLens((handler) => {
  let codeLenses: CodeLens[] = [];

  if (documentLenses.has(handler.textDocument.uri)) {
    let docLenses = documentLenses.get(handler.textDocument.uri);
    if (docLenses && docLenses.length > 0) {
      docLenses.forEach((lens, index, lenses) => {
        // check the previous lens to see if it was a statement
        // if so, we use this value for it if the line numbers
        // are the same

        if (index > 0) {
          let previous = lenses[index - 1];
          if (previous.t == "S") {
            if (previous.sl == lens.sl) {
              const sposition1 = Position.create(lens.sl - 1, 1);
              const eposition1 = Position.create(lens.sl - 1, 1);
              const range1 = Range.create(sposition1, eposition1);
              let alens: CodeLens = CodeLens.create(range1, lens.s);
              codeLenses.push(alens);
            }
          }
        }
      });
    }
  }

  return codeLenses;
});

// we already know the info to return so this is a simple function
connection.onCodeLensResolve((codeLens) => {
  let data = codeLens.data;

  codeLens.command = {
    title: data,
    command: "",
    arguments: [],
  };
  return codeLens;
});

connection.onHover((params: TextDocumentPositionParams): Hover | undefined => {
  //let bestmatch: LSP_Lens | undefined = undefined;
  let bestmatch: any = undefined;
  let bestrange = 0;

  let line = params.position.line + 1; // editor is offset 0
  let pos = params.position.character + 1;

  if (documentLenses.has(params.textDocument.uri)) {
    let docLenses = documentLenses.get(params.textDocument.uri);

    if (docLenses && docLenses.length > 0) {
      docLenses.forEach((lens) => {
        if (line >= lens.sl && line <= lens.el) {
          // need to take account which line we are on
          // when looking at position

          let match = false;

          // easy case when all on one line
          if (lens.sl == lens.el) {
            if (pos >= lens.sc && pos <= lens.ec) {
              match = true;
            }
          } else {
            if (line > lens.sl && line < lens.el) {
              match = true;
            } else {
              if (line == lens.sl && pos >= lens.sc) {
                match = true;
              }
              if (line == lens.el && pos <= lens.ec) {
                match = true;
              }
            }
          }

          if (match) {
            if (lens.t != "S") {
              // don't hover for top level statements

              // if the same line, just use the start/end characters

              let range = lens.ec - lens.sc;

              // if on different lines take bol into account

              if (lens.sl != lens.el) {
                range = lens.eb - lens.sb + range;
              }

              if (bestrange == 0 || range <= bestrange) {
                bestmatch = lens;
                bestrange = range;
              }
            }
          }
        }
      });
    }
  }

  if (bestmatch == undefined) {
    return undefined;
  } else {
    let doc = [{ language: "grain-type", value: bestmatch!.s }];
    return {
      contents: doc,
    };
  }
});

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
