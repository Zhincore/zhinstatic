export class ErrorResponse {
  readonly body: Error;

  constructor(readonly status = 500, message?: string) {
    this.body = new Error(message);
  }
}
