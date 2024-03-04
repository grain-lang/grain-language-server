# Changelog
All notable changes to the `vscode-grain` extension will be documented in this file.

## [0.19.0](https://www.github.com/grain-lang/grain-language-server/compare/vscode-grain-v0.18.2...vscode-grain-v0.19.0) (2024-03-04)


### ⚠ BREAKING CHANGES

* Replace grainfind with cliFlags setting (#113)
* Upgrade dependencies & require much newer VSCode
* Remove unused plugin options
* Rename settings namespace to just "grain"
* Implement plugin as only an LSP client (#100)
* Add formatter support (#85)

### Features

* Add better autocompletion on block comments ([#168](https://www.github.com/grain-lang/grain-language-server/issues/168)) ([c6e141a](https://www.github.com/grain-lang/grain-language-server/commit/c6e141a9a7861028c2f9f524f560eabadd4c31dc))
* Add bigint syntax highlighting ([#123](https://www.github.com/grain-lang/grain-language-server/issues/123)) ([dab8981](https://www.github.com/grain-lang/grain-language-server/commit/dab89815ba7a1d30300b01dd70136071cf74decb))
* Add formatter support ([#85](https://www.github.com/grain-lang/grain-language-server/issues/85)) ([c1a85e4](https://www.github.com/grain-lang/grain-language-server/commit/c1a85e457e3ec5dee3c1ed6d113bbd2c0ade17e4))
* Add LSP restart command ([8c12b49](https://www.github.com/grain-lang/grain-language-server/commit/8c12b494641fddad4b2488b53febbc312802390c))
* Add support for new float syntax ([#163](https://www.github.com/grain-lang/grain-language-server/issues/163)) ([44851bc](https://www.github.com/grain-lang/grain-language-server/commit/44851bcc64e26b30ec954c738467f9fec7ce71d9))
* Add syntax highlighting for pattern constraints ([#61](https://www.github.com/grain-lang/grain-language-server/issues/61)) ([ecbb40d](https://www.github.com/grain-lang/grain-language-server/commit/ecbb40d4aa7835d418eea173393cea0e615341a1))
* Basic syntax highlighting for type aliases ([#97](https://www.github.com/grain-lang/grain-language-server/issues/97)) ([8af29fd](https://www.github.com/grain-lang/grain-language-server/commit/8af29fd2dde6a06c26da41b9065a953e87d99dac))
* Build extension into a single JS file ([8c12b49](https://www.github.com/grain-lang/grain-language-server/commit/8c12b494641fddad4b2488b53febbc312802390c))
* Check for the existence of a build script and use that if it exists ([#91](https://www.github.com/grain-lang/grain-language-server/issues/91)) ([c603a60](https://www.github.com/grain-lang/grain-language-server/commit/c603a6038ae11653d3076cf8accb0f6e42d8473c))
* Contribute file icons to grain files ([#109](https://www.github.com/grain-lang/grain-language-server/issues/109)) ([77d6691](https://www.github.com/grain-lang/grain-language-server/commit/77d66911ee81e2617da0caa7b64cd1fc2e78d190))
* **docblock:** Continue to add * inside doc comments after return ([#83](https://www.github.com/grain-lang/grain-language-server/issues/83)) ([3f96f20](https://www.github.com/grain-lang/grain-language-server/commit/3f96f20cbe258e4a8b02cede9d421e1fffc8ee13))
* Exception highlighting ([#171](https://www.github.com/grain-lang/grain-language-server/issues/171)) ([59ccb76](https://www.github.com/grain-lang/grain-language-server/commit/59ccb763ca40d2d7c6c6de1e5a204b5a778ed789))
* Graindoc highlighting ([#132](https://www.github.com/grain-lang/grain-language-server/issues/132)) ([11a61af](https://www.github.com/grain-lang/grain-language-server/commit/11a61affa9b51c159b287813fa0beb0cca5b36ee))
* Implement plugin as only an LSP client ([#100](https://www.github.com/grain-lang/grain-language-server/issues/100)) ([8c12b49](https://www.github.com/grain-lang/grain-language-server/commit/8c12b494641fddad4b2488b53febbc312802390c))
* parse warnings from code returned from LSP ([#70](https://www.github.com/grain-lang/grain-language-server/issues/70)) ([78a69cb](https://www.github.com/grain-lang/grain-language-server/commit/78a69cb3625b910cd403ddc436ffcb4ff71913f5))
* Remove the block on CRLF format ([#72](https://www.github.com/grain-lang/grain-language-server/issues/72)) ([905e18e](https://www.github.com/grain-lang/grain-language-server/commit/905e18ea171ec553c45a43d043881bca2ae41423))
* Replace grainfind with cliFlags setting ([#113](https://www.github.com/grain-lang/grain-language-server/issues/113)) ([68c1816](https://www.github.com/grain-lang/grain-language-server/commit/68c1816f9169f7fc250c97e5da2bffe1d3e3f49d))
* Search for a variety of grain CLIs in PATH ([#111](https://www.github.com/grain-lang/grain-language-server/issues/111)) ([28e1e9c](https://www.github.com/grain-lang/grain-language-server/commit/28e1e9c5ec62f662feedadc94d8d72e3f55709c8))
* Support `Infinity` and `NaN` keywords ([#142](https://www.github.com/grain-lang/grain-language-server/issues/142)) ([d940a07](https://www.github.com/grain-lang/grain-language-server/commit/d940a07a34b2302efd1d6c59354e7b81126403b0))
* Support and keyword for data types ([#172](https://www.github.com/grain-lang/grain-language-server/issues/172)) ([a8b556e](https://www.github.com/grain-lang/grain-language-server/commit/a8b556ee879e7e2dc077fb0becf495bb876b54fe))
* Support custom operators ([#149](https://www.github.com/grain-lang/grain-language-server/issues/149)) ([4b4c75e](https://www.github.com/grain-lang/grain-language-server/commit/4b4c75e6b517f27509e323cffb3485ed60a58013))
* Support multiple workspaces & individual files ([8c12b49](https://www.github.com/grain-lang/grain-language-server/commit/8c12b494641fddad4b2488b53febbc312802390c))
* Support new module system ([#151](https://www.github.com/grain-lang/grain-language-server/issues/151)) ([5240131](https://www.github.com/grain-lang/grain-language-server/commit/524013101c8dc843ca8693221c2d606cef23f533))
* Support operator identifiers ([#174](https://www.github.com/grain-lang/grain-language-server/issues/174)) ([5fb6a32](https://www.github.com/grain-lang/grain-language-server/commit/5fb6a32be9a15663eeca431f07e368a7abd47cab))
* Support or-pattern and alias syntax ([#116](https://www.github.com/grain-lang/grain-language-server/issues/116)) ([38e8ed8](https://www.github.com/grain-lang/grain-language-server/commit/38e8ed8698d943e5eb9618efc5a99628e53f4d44))
* Support short and unsigned ints ([#150](https://www.github.com/grain-lang/grain-language-server/issues/150)) ([9998689](https://www.github.com/grain-lang/grain-language-server/commit/999868996f8328210fb6c35f649aa169c73ef4f9))
* Support the `return` keyword ([#146](https://www.github.com/grain-lang/grain-language-server/issues/146)) ([c540e52](https://www.github.com/grain-lang/grain-language-server/commit/c540e52ba401f90b1866b3489e2d116795293ca0))
* Switch to vscode-url library to better support Windows paths ([#62](https://www.github.com/grain-lang/grain-language-server/issues/62)) ([66cfa08](https://www.github.com/grain-lang/grain-language-server/commit/66cfa08c7cd5da538d19e3dd63cb490490fa3d08))
* Update module include syntax ([#170](https://www.github.com/grain-lang/grain-language-server/issues/170)) ([13f5269](https://www.github.com/grain-lang/grain-language-server/commit/13f52692f8e414fc2feb1fb856ab5d4ec53a2060))
* Update scoping operator syntax ([#169](https://www.github.com/grain-lang/grain-language-server/issues/169)) ([e738bb0](https://www.github.com/grain-lang/grain-language-server/commit/e738bb0728ebe0a8ef8abd0231e597871b69ed4c))
* **vscode:** Add completions for Grain Doc comments ([#80](https://www.github.com/grain-lang/grain-language-server/issues/80)) ([d34b4ec](https://www.github.com/grain-lang/grain-language-server/commit/d34b4ec89a4dd20a393c09b4d783c8704345c04f))


### Bug Fixes

* Add naive mutex around config change events ([#125](https://www.github.com/grain-lang/grain-language-server/issues/125)) ([2dd2068](https://www.github.com/grain-lang/grain-language-server/commit/2dd2068d19a857f33f8e8fa3bed12d0bc3ab4eff))
* Adjust icon size ([#119](https://www.github.com/grain-lang/grain-language-server/issues/119)) ([5f7ef16](https://www.github.com/grain-lang/grain-language-server/commit/5f7ef16f32e1b2dc3cd51efa247d5257a2cd47db))
* Avoid handling output scheme messages ([#114](https://www.github.com/grain-lang/grain-language-server/issues/114)) ([b71c7ad](https://www.github.com/grain-lang/grain-language-server/commit/b71c7ada6246d639885755f6413df67fef768441))
* Correct the executable path ([#87](https://www.github.com/grain-lang/grain-language-server/issues/87)) ([cc07e9d](https://www.github.com/grain-lang/grain-language-server/commit/cc07e9d69b4b0448cbd61f33ecc59ae2163a1570))
* Correctly highlight block comments ([#135](https://www.github.com/grain-lang/grain-language-server/issues/135)) ([3d31997](https://www.github.com/grain-lang/grain-language-server/commit/3d319971cacb12224996e5aa617656287c88679a))
* Correctly highlight function type annotations in type vectors ([#131](https://www.github.com/grain-lang/grain-language-server/issues/131)) ([5b025e9](https://www.github.com/grain-lang/grain-language-server/commit/5b025e95351df8f824142abfa256f3c8325caed6))
* Correctly highlight type hovers ([#128](https://www.github.com/grain-lang/grain-language-server/issues/128)) ([51d3e44](https://www.github.com/grain-lang/grain-language-server/commit/51d3e44c9a835983e646f1bcd4e97a35c7180c55))
* enable neovim ([#76](https://www.github.com/grain-lang/grain-language-server/issues/76)) ([7257f21](https://www.github.com/grain-lang/grain-language-server/commit/7257f21526bbfbbedc1bf8aeadb07c0025fbe393))
* Fix the build issue ([#95](https://www.github.com/grain-lang/grain-language-server/issues/95)) ([4a30b83](https://www.github.com/grain-lang/grain-language-server/commit/4a30b831ec5e7e678886154f36c42169abe1e8d3))
* Highlight match keyword correctly ([#121](https://www.github.com/grain-lang/grain-language-server/issues/121)) ([3b40fc4](https://www.github.com/grain-lang/grain-language-server/commit/3b40fc417d6a28230eeeaf32757fb6c6c7740466))
* Highlight module scoped types properly ([#122](https://www.github.com/grain-lang/grain-language-server/issues/122)) ([e046b6b](https://www.github.com/grain-lang/grain-language-server/commit/e046b6bd999274d85258c020eca7d7614939be90))
* No longer recommend \n for grain files ([#74](https://www.github.com/grain-lang/grain-language-server/issues/74)) ([e5ae4a5](https://www.github.com/grain-lang/grain-language-server/commit/e5ae4a50d15a5afe5d3a2d40bc6570b55994aecb))
* Only highlight valid string escapes ([#118](https://www.github.com/grain-lang/grain-language-server/issues/118)) ([d82dea3](https://www.github.com/grain-lang/grain-language-server/commit/d82dea382865f939711567805333c4721ac728fc))
* proper token types for storage keywords ([#82](https://www.github.com/grain-lang/grain-language-server/issues/82)) ([bfde3af](https://www.github.com/grain-lang/grain-language-server/commit/bfde3af7d62652ee82bb0b0cc39b26ddb2ebf118))
* Properly highlight `isnt` ([#137](https://www.github.com/grain-lang/grain-language-server/issues/137)) ([8c4bc7b](https://www.github.com/grain-lang/grain-language-server/commit/8c4bc7b1f1d89f549283b018ef88ab30954c4b79))
* Properly highlight true/false in pattern matching ([#117](https://www.github.com/grain-lang/grain-language-server/issues/117)) ([43d2cba](https://www.github.com/grain-lang/grain-language-server/commit/43d2cba033c3396fb86cb47fa5e55b8aa5fae268))
* Use consistent scope for type variables ([#173](https://www.github.com/grain-lang/grain-language-server/issues/173)) ([ed4b370](https://www.github.com/grain-lang/grain-language-server/commit/ed4b3704de668d201d591c5d54415aefed1a3d2d))


### Miscellaneous Chores

* Remove unused plugin options ([8c12b49](https://www.github.com/grain-lang/grain-language-server/commit/8c12b494641fddad4b2488b53febbc312802390c))
* Rename settings namespace to just "grain" ([8c12b49](https://www.github.com/grain-lang/grain-language-server/commit/8c12b494641fddad4b2488b53febbc312802390c))
* Upgrade dependencies & require much newer VSCode ([8c12b49](https://www.github.com/grain-lang/grain-language-server/commit/8c12b494641fddad4b2488b53febbc312802390c))

### [0.18.2](https://www.github.com/grain-lang/grain-language-server/compare/vscode-grain-v0.18.1...vscode-grain-v0.18.2) (2022-08-01)


### Bug Fixes

* Properly highlight `isnt` ([#137](https://www.github.com/grain-lang/grain-language-server/issues/137)) ([8c4bc7b](https://www.github.com/grain-lang/grain-language-server/commit/8c4bc7b1f1d89f549283b018ef88ab30954c4b79))

### [0.18.1](https://www.github.com/grain-lang/grain-language-server/compare/vscode-grain-v0.18.0...vscode-grain-v0.18.1) (2022-07-26)


### Bug Fixes

* Correctly highlight block comments ([#135](https://www.github.com/grain-lang/grain-language-server/issues/135)) ([3d31997](https://www.github.com/grain-lang/grain-language-server/commit/3d319971cacb12224996e5aa617656287c88679a))

## [0.18.0](https://www.github.com/grain-lang/grain-language-server/compare/vscode-grain-v0.17.2...vscode-grain-v0.18.0) (2022-07-26)


### Features

* Graindoc highlighting ([#132](https://www.github.com/grain-lang/grain-language-server/issues/132)) ([11a61af](https://www.github.com/grain-lang/grain-language-server/commit/11a61affa9b51c159b287813fa0beb0cca5b36ee))


### Bug Fixes

* Correctly highlight function type annotations in type vectors ([#131](https://www.github.com/grain-lang/grain-language-server/issues/131)) ([5b025e9](https://www.github.com/grain-lang/grain-language-server/commit/5b025e95351df8f824142abfa256f3c8325caed6))

### [0.17.2](https://www.github.com/grain-lang/grain-language-server/compare/vscode-grain-v0.17.1...vscode-grain-v0.17.2) (2022-07-15)


### Bug Fixes

* Correctly highlight type hovers ([#128](https://www.github.com/grain-lang/grain-language-server/issues/128)) ([51d3e44](https://www.github.com/grain-lang/grain-language-server/commit/51d3e44c9a835983e646f1bcd4e97a35c7180c55))

### [0.17.1](https://www.github.com/grain-lang/grain-language-server/compare/vscode-grain-v0.17.0...vscode-grain-v0.17.1) (2022-07-01)


### Bug Fixes

* Add naive mutex around config change events ([#125](https://www.github.com/grain-lang/grain-language-server/issues/125)) ([2dd2068](https://www.github.com/grain-lang/grain-language-server/commit/2dd2068d19a857f33f8e8fa3bed12d0bc3ab4eff))

## [0.17.0](https://www.github.com/grain-lang/grain-language-server/compare/vscode-grain-v0.16.1...vscode-grain-v0.17.0) (2022-06-28)


### Features

* Add bigint syntax highlighting ([#123](https://www.github.com/grain-lang/grain-language-server/issues/123)) ([dab8981](https://www.github.com/grain-lang/grain-language-server/commit/dab89815ba7a1d30300b01dd70136071cf74decb))

### [0.16.1](https://www.github.com/grain-lang/grain-language-server/compare/vscode-grain-v0.16.0...vscode-grain-v0.16.1) (2022-06-13)


### Bug Fixes

* Adjust icon size ([#119](https://www.github.com/grain-lang/grain-language-server/issues/119)) ([5f7ef16](https://www.github.com/grain-lang/grain-language-server/commit/5f7ef16f32e1b2dc3cd51efa247d5257a2cd47db))
* Highlight match keyword correctly ([#121](https://www.github.com/grain-lang/grain-language-server/issues/121)) ([3b40fc4](https://www.github.com/grain-lang/grain-language-server/commit/3b40fc417d6a28230eeeaf32757fb6c6c7740466))
* Highlight module scoped types properly ([#122](https://www.github.com/grain-lang/grain-language-server/issues/122)) ([e046b6b](https://www.github.com/grain-lang/grain-language-server/commit/e046b6bd999274d85258c020eca7d7614939be90))

## [0.16.0](https://www.github.com/grain-lang/grain-language-server/compare/vscode-grain-v0.15.0...vscode-grain-v0.16.0) (2022-06-06)


### ⚠ BREAKING CHANGES

* Replace grainfind with cliFlags setting (#113)
* Upgrade dependencies & require much newer VSCode
* Remove unused plugin options
* Rename settings namespace to just "grain"
* Implement plugin as only an LSP client (#100)

### Features

* Add LSP restart command ([8c12b49](https://www.github.com/grain-lang/grain-language-server/commit/8c12b494641fddad4b2488b53febbc312802390c))
* Build extension into a single JS file ([8c12b49](https://www.github.com/grain-lang/grain-language-server/commit/8c12b494641fddad4b2488b53febbc312802390c))
* Contribute file icons to grain files ([#109](https://www.github.com/grain-lang/grain-language-server/issues/109)) ([77d6691](https://www.github.com/grain-lang/grain-language-server/commit/77d66911ee81e2617da0caa7b64cd1fc2e78d190))
* Implement plugin as only an LSP client ([#100](https://www.github.com/grain-lang/grain-language-server/issues/100)) ([8c12b49](https://www.github.com/grain-lang/grain-language-server/commit/8c12b494641fddad4b2488b53febbc312802390c))
* Replace grainfind with cliFlags setting ([#113](https://www.github.com/grain-lang/grain-language-server/issues/113)) ([68c1816](https://www.github.com/grain-lang/grain-language-server/commit/68c1816f9169f7fc250c97e5da2bffe1d3e3f49d))
* Search for a variety of grain CLIs in PATH ([#111](https://www.github.com/grain-lang/grain-language-server/issues/111)) ([28e1e9c](https://www.github.com/grain-lang/grain-language-server/commit/28e1e9c5ec62f662feedadc94d8d72e3f55709c8))
* Support multiple workspaces & individual files ([8c12b49](https://www.github.com/grain-lang/grain-language-server/commit/8c12b494641fddad4b2488b53febbc312802390c))
* Support or-pattern and alias syntax ([#116](https://www.github.com/grain-lang/grain-language-server/issues/116)) ([38e8ed8](https://www.github.com/grain-lang/grain-language-server/commit/38e8ed8698d943e5eb9618efc5a99628e53f4d44))


### Bug Fixes

* Avoid handling output scheme messages ([#114](https://www.github.com/grain-lang/grain-language-server/issues/114)) ([b71c7ad](https://www.github.com/grain-lang/grain-language-server/commit/b71c7ada6246d639885755f6413df67fef768441))
* Only highlight valid string escapes ([#118](https://www.github.com/grain-lang/grain-language-server/issues/118)) ([d82dea3](https://www.github.com/grain-lang/grain-language-server/commit/d82dea382865f939711567805333c4721ac728fc))
* Properly highlight true/false in pattern matching ([#117](https://www.github.com/grain-lang/grain-language-server/issues/117)) ([43d2cba](https://www.github.com/grain-lang/grain-language-server/commit/43d2cba033c3396fb86cb47fa5e55b8aa5fae268))


### Miscellaneous Chores

* Remove unused plugin options ([8c12b49](https://www.github.com/grain-lang/grain-language-server/commit/8c12b494641fddad4b2488b53febbc312802390c))
* Rename settings namespace to just "grain" ([8c12b49](https://www.github.com/grain-lang/grain-language-server/commit/8c12b494641fddad4b2488b53febbc312802390c))
* Upgrade dependencies & require much newer VSCode ([8c12b49](https://www.github.com/grain-lang/grain-language-server/commit/8c12b494641fddad4b2488b53febbc312802390c))

## [0.15.0](https://www.github.com/grain-lang/grain-language-server/compare/vscode-grain-v0.14.1...vscode-grain-v0.15.0) (2021-10-26)


### Features

* Basic syntax highlighting for type aliases ([#97](https://www.github.com/grain-lang/grain-language-server/issues/97)) ([8af29fd](https://www.github.com/grain-lang/grain-language-server/commit/8af29fd2dde6a06c26da41b9065a953e87d99dac))

### [0.14.1](https://www.github.com/grain-lang/grain-language-server/compare/vscode-grain-v0.14.0...vscode-grain-v0.14.1) (2021-10-12)


### Bug Fixes

* Fix the build issue ([#95](https://www.github.com/grain-lang/grain-language-server/issues/95)) ([4a30b83](https://www.github.com/grain-lang/grain-language-server/commit/4a30b831ec5e7e678886154f36c42169abe1e8d3))

## [0.14.0](https://www.github.com/grain-lang/grain-language-server/compare/vscode-grain-v0.13.1...vscode-grain-v0.14.0) (2021-10-12)


### Features

* Check for the existence of a build script and use that if it exists ([#91](https://www.github.com/grain-lang/grain-language-server/issues/91)) ([c603a60](https://www.github.com/grain-lang/grain-language-server/commit/c603a6038ae11653d3076cf8accb0f6e42d8473c))

### [0.13.1](https://www.github.com/grain-lang/grain-language-server/compare/vscode-grain-v0.13.0...vscode-grain-v0.13.1) (2021-09-07)


### Bug Fixes

* Correct the executable path ([#87](https://www.github.com/grain-lang/grain-language-server/issues/87)) ([cc07e9d](https://www.github.com/grain-lang/grain-language-server/commit/cc07e9d69b4b0448cbd61f33ecc59ae2163a1570))

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
