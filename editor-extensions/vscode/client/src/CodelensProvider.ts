import * as vscode from 'vscode';

import { Event, LanguageClient, CodeLensRequest, ExecuteCommandParams, ExecuteCommandRequest, CodeLensParams, CodeLensRegistrationOptions } from "vscode-languageclient";

/**
 * CodelensProvider
 * 
 * Dummy, used to trigger lens updates until LSP protocol supports onDidChangeCodeLenses 
 * (coming in 3.16.0)
 */
export class CodelensProvider implements vscode.CodeLensProvider {



	private codeLenses: vscode.CodeLens[] = [];
	private regex: RegExp;
	public onDidChangeCodeLensesEmitter: vscode.EventEmitter<void> = new vscode.EventEmitter<void>();
	public readonly onDidChangeCodeLenses: vscode.Event<void> = this.onDidChangeCodeLensesEmitter.event;

	constructor(readonly client: LanguageClient
	) {
		this.regex = /(.+)/g;

		vscode.workspace.onDidChangeConfiguration((_) => {
			this.onDidChangeCodeLensesEmitter.fire();
		});
	}

	public async provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): Promise<vscode.CodeLens[]> {


		const args = { textDocument: { uri: document.uri.toString() } };

		const lenses = await this.client.sendRequest(CodeLensRequest.type, args);
		return lenses.map(l => {
			const range = new vscode.Range(
				new vscode.Position(l.range.start.line, l.range.start.character),
				new vscode.Position(l.range.end.line, l.range.end.character)
			);

			const command: vscode.Command = {
				title: l.data,
				command: undefined,
			};
			return new vscode.CodeLens(range, command);
		});
	}

	public resolveCodeLens(codeLens: vscode.CodeLens, token: vscode.CancellationToken) {
		return codeLens;
	}

	public triggerRefresh() {
		this.onDidChangeCodeLensesEmitter.fire();
	}
}

