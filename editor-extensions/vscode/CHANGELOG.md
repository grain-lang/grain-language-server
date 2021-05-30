# Changelog
All notable changes to the `vscode-grain` extension will be documented in this file.

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
