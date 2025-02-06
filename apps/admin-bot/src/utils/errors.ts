export class BotError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "BotError";
  }
}

export class ValidationError extends BotError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "VALIDATION_ERROR", details);
    this.name = "ValidationError";
  }
}

export class FileUploadError extends BotError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, "FILE_UPLOAD_ERROR", details);
    this.name = "FileUploadError";
  }
}
