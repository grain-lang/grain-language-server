# LSP client for Grain

LSP client for VSCode for https://github.com/grain-lang

## Functionality

This Language Server Protocol client works for grain files. It has the following language features:

- Show compilation warnings and errors
- Code lenses
- Hover support

## Running the extension

- The Grain compiler and cli should be on your path. If not, set the extension cliPath setting to the cli location
- Run `npm install` in this folder. This installs all necessary npm modules in both the client and server folder
- Open VS Code on this folder.
- Press Ctrl+Shift+B to compile the client.
- Switch to the Debug viewlet.
- Select `Launch Client` from the drop down.
- Run the launch config.
- If you want to debug the server as well use the launch configuration `Attach to Server`
- In the [Extension Development Host] instance of VSCode, open a document in 'grain' language mode.
