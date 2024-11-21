import { LanguageStatusSeverity, type LanguageStatusItem } from "vscode";
import {
  ErrorHandler,
  ErrorAction,
  CloseAction,
  type BaseLanguageClient,
  type ErrorHandlerResult,
  type Message,
  type CloseHandlerResult,
} from "vscode-languageclient";

// Derived from: https://github.com/microsoft/vscode-languageserver-node/blob/a561f1342ba94ad7f550cb15446f65432f5e1367/client/src/common/client.ts#L439
export default class GrainErrorHandler implements ErrorHandler {
  private readonly restarts: number[];

  constructor(
    private name: string,
    private languageStatusItem: LanguageStatusItem,
    private maxRestartCount: number
  ) {
    this.restarts = [];
  }

  public error(
    _error: Error,
    _message: Message,
    count: number
  ): ErrorHandlerResult {
    if (count && count <= 3) {
      return { action: ErrorAction.Continue };
    }
    return { action: ErrorAction.Shutdown };
  }

  public closed(): CloseHandlerResult {
    this.restarts.push(Date.now());
    if (this.restarts.length <= this.maxRestartCount) {
      return { action: CloseAction.Restart };
    } else {
      const diff = this.restarts[this.restarts.length - 1] - this.restarts[0];
      if (diff <= 3 * 60 * 1000) {
        this.languageStatusItem.severity = LanguageStatusSeverity.Error;
        return {
          action: CloseAction.DoNotRestart,
          message: `The ${this.name} server crashed ${
            this.maxRestartCount + 1
          } times in the last 3 minutes. The server will not be restarted. See the output for more information.`,
        };
      } else {
        this.restarts.shift();
        return { action: CloseAction.Restart };
      }
    }
  }
}
