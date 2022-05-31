# VSCode extension for Grain

The VSCode extension for the [Grain programming language](https://github.com/grain-lang/grain).

**Requires:** vscode 1.67+

## Functionality

This LSP Protocol client provides the the following language features for grain (`.gr`) files:

- Show compilation warnings and errors
- Code lenses
- Hover support

## Running the extension

- Run `npm ci` in this folder.
- Open VSCode inside this folder.
- Switch to the "Run and Debug" pane.
- Select "Launch Extension" from the drop down.
- Press the ▶️ button next to "Launch Extension", which will start a TypeScript watcher and launch a new VSCode instance titled `[Extension Development Host]`.
- The Grain CLI needs to be on your path. If not, set the `cliPath` setting inside the `[Extension Development Host]` instance to the location of your Grain CLI.
- In the `[Extension Development Host]` instance of VSCode, open a document in 'grain' language mode.
- After a code change, you'll likely need to trigger a "Developer: Reload Window" action in the `[Extension Development Host]` instance before the extension will pick up the changes.
