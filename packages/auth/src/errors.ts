import type { ZodError } from "zod";

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public data: {
      code:
        | "UNAUTHORIZED"
        | "TOKEN_EXPIRED"
        | "REFRESH_FAILED"
        | "INVALID_CREDENTIALS"
        | "NETWORK_ERROR"
        | "VERIFICATION_REQUIRED";
      httpStatus: number;
      stack: string;
      path: string;
      zodError: ZodError | null;
    },
  ) {
    super(message);
    this.name = "AuthError";
  }
}
