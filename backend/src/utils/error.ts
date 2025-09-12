export function createErrorResponse(status: number, errors: string[]) {
  return {
    errors,
    meta: { status },
  };
}

export class AppError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}


