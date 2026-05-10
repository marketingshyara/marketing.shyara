export type ErrorBody = {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
};

export class HttpError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = "HttpError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  toBody(): ErrorBody {
    return {
      error: {
        code: this.code,
        message: this.message,
        ...(this.details !== undefined ? { details: this.details } : {})
      }
    };
  }
}

/** `instanceof` can fail if multiple copies of this module load; use this in the Fastify error handler. */
export function isHttpError(error: unknown): error is HttpError {
  if (error instanceof HttpError) return true;
  if (typeof error !== "object" || error === null) return false;
  const e = error as HttpError;
  return (
    typeof e.statusCode === "number" &&
    typeof e.code === "string" &&
    typeof e.message === "string" &&
    typeof e.toBody === "function"
  );
}
