export class HTTPError extends Error {
  constructor(readonly status = 500, message?: string) {
    super(message);
  }
}
