export class ConflictError extends Error {
  code = 'CONFLICT';
  status = 409;

  constructor(message: string) {
    super(message);
    this.name = 'ConflictError';
  }
}
