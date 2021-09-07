# Changelog
All notable changes to the `vscode-grain` extension will be documented in this file.

## [0.13.0](https://www.github.com/grain-lang/grain-language-server/compare/vscode-grain-v0.12.0...vscode-grain-v0.13.0) (2021-09-04)


### ⚠ BREAKING CHANGES

* Add formatter support (#85)

### Features

* Add formatter support ([#85](https://www.github.com/grain-lang/grain-language-server/issues/85)) ([c1a85e4](https://www.github.com/grain-lang/grain-language-server/commit/c1a85e457e3ec5dee3c1ed6d113bbd2c0ade17e4))

## [0.12.0](https://www.github.com/grain-lang/grain-language-server/compare/vscode-grain-v0.11.1...vscode-grain-v0.12.0) (2021-06-24)


### Features

* **docblock:** Continue to add * inside doc comments after return ([#83](https://www.github.com/grain-lang/grain-language-server/issues/83)) ([3f96f20](https://www.github.com/grain-lang/grain-language-server/commit/3f96f20cbe258e4a8b02cede9d421e1fffc8ee13))
* **vscode:** Add completions for Grain Doc comments ([#80](https://www.github.com/grain-lang/grain-language-server/issues/80)) ([d34b4ec](https://www.github.com/grain-lang/grain-language-server/commit/d34b4ec89a4dd20a393c09b4d783c8704345c04f))


### Bug Fixes

* proper token types for storage keywords ([#82](https://www.github.com/grain-lang/grain-language-server/issues/82)) ([bfde3af](https://www.github.com/grain-lang/grain-language-server/commit/bfde3af7d62652ee82bb0b0cc39b26ddb2ebf118))

### [0.11.1](https://www.github.com/grain-lang/grain-language-server/compare/vscode-grain-v0.11.0...vscode-grain-v0.11.1) (2021-06-10)


### Bug Fixes

* enable neovim ([#76](https://www.github.com/grain-lang/grain-language-server/issues/76)) ([7257f21](https://www.github.com/grain-lang/grain-language-server/commit/7257f21526bbfbbedc1bf8aeadb07c0025fbe393))
* No longer recommend \n for grain files ([#74](https://www.github.com/grain-lang/grain-language-server/issues/74)) ([e5ae4a5](https://www.github.com/grain-lang/grain-language-server/commit/e5ae4a50d15a5afe5d3a2d40bc6570b55994aecb))

## [0.11.0](https://www.github.com/grain-lang/grain-language-server/compare/vscode-grain-v0.10.3...vscode-grain-v0.11.0) (2021-05-30)


### Features

* Add syntax highlighting for pattern constraints ([#61](https://www.github.com/grain-lang/grain-language-server/issues/61)) ([ecbb40d](https://www.github.com/grain-lang/grain-language-server/commit/ecbb40d4aa7835d418eea173393cea0e615341a1))
* parse warnings from code returned from LSP ([#70](https://www.github.com/grain-lang/grain-language-server/issues/70)) ([78a69cb](https://www.github.com/grain-lang/grain-language-server/commit/78a69cb3625b910cd403ddc436ffcb4ff71913f5))
* Remove the block on CRLF format ([#72](https://www.github.com/grain-lang/grain-language-server/issues/72)) ([905e18e](https://www.github.com/grain-lang/grain-language-server/commit/905e18ea171ec553c45a43d043881bca2ae41423))
* Switch to vscode-url library to better support Windows paths ([#62](https://www.github.com/grain-lang/grain-language-server/issues/62)) ([66cfa08](https://www.github.com/grain-lang/grain-language-server/commit/66cfa08c7cd5da538d19e3dd63cb490490fa3d08))

## v0.10.3
- Fixes syntax highlighting for rational literals.

## v0.10.2
- Fixes syntax highlighting for floats in scientific notation.

## v0.10.1
- Fixes an issue running the language server on Windows.

## v0.10.0
- Adds syntax support for `for` loops.

## v0.9.0
- Adds syntax support for more number literals.

## v0.8.1
- Fixes an issue with using `and` as an identifier.

## v0.8.0
- Adds syntax highlighting support for unicode string escapes, and fixes a number of other syntax highlighting issues.

## v0.7.0
- Adds support for hover types.

## v0.6.3
- Adds syntax highlighting support for bitwise operators and `and` bindings.

## v0.6.2
- Minor fix where the lsp would not work properly on Windows.

## v0.6.1
- Minor fix where code lenses were not picked up on Linux.

## v0.6.0
- Code lenses! See the types of top-level statements in your editor.

## v0.5.1
- Minor bugfix for launching LSP

## v0.5.0
- Adds support for the LSP server which provides type checking

## v0.4.0
- Adds support for the new comment syntax

## v0.2.0
- Adds support for constant patterns when pattern matching

## v0.1.0
- Initial release
