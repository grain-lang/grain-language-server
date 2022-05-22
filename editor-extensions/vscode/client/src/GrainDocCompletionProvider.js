"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GrainDocCompletionProvider = void 0;
// Based on https://github.com/microsoft/vscode/blob/94c9ea46838a9a619aeafb7e8afd1170c967bb55/extensions/typescript-language-features/src/languageFeatures/jsDocCompletions.ts
const vscode = require("vscode");
const defaultGrainDoc = new vscode.SnippetString(`/**\n * $0\n */`);
class GrainDocCompletionItem extends vscode.CompletionItem {
    document;
    position;
    constructor(document, position) {
        super("/** */", vscode.CompletionItemKind.Text);
        this.document = document;
        this.position = position;
        this.detail = "Grain Doc Comment";
        this.sortText = "\0";
        const line = document.lineAt(position.line).text;
        const prefix = line.slice(0, position.character).match(/\/\**\s*$/);
        const suffix = line.slice(position.character).match(/^\s*\**\//);
        const start = position.translate(0, prefix ? -prefix[0].length : 0);
        const range = new vscode.Range(start, position.translate(0, suffix ? suffix[0].length : 0));
        this.range = { inserting: range, replacing: range };
    }
}
class GrainDocCompletionProvider {
    client;
    constructor(client) {
        this.client = client;
    }
    async provideCompletionItems(document, position, token) {
        if (!this.isPotentiallyValidDocCompletionPosition(document, position)) {
            return undefined;
        }
        const item = new GrainDocCompletionItem(document, position);
        // TODO: Get param and returns details from `grain lsp`
        item.insertText = defaultGrainDoc;
        return [item];
    }
    isPotentiallyValidDocCompletionPosition(document, position) {
        // Only show the GrainDoc completion when the everything before the cursor is whitespace
        // or could be the opening of a comment
        const line = document.lineAt(position.line).text;
        const prefix = line.slice(0, position.character);
        if (!/^\s*$|\/\*\*\s*$|^\s*\/\*\*+\s*$/.test(prefix)) {
            return false;
        }
        // And everything after is possibly a closing comment or more whitespace
        const suffix = line.slice(position.character);
        return /^\s*(\*+\/)?\s*$/.test(suffix);
    }
}
exports.GrainDocCompletionProvider = GrainDocCompletionProvider;
//# sourceMappingURL=GrainDocCompletionProvider.js.map