export class DomainError extends Error {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message);
    this.name = "DomainError";
  }
}

export class NotFoundError extends DomainError {
  constructor(entity: string, id: string) {
    super(`${entity} with id ${id} not found`, "NOT_FOUND");
  }
}

export class ValidationError extends DomainError {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message, "VALIDATION_ERROR");
  }
}

export class BadRequestError extends DomainError {
  constructor(
    message: string,
    public code: string,
  ) {
    super(message, "BAD_REQUEST");
  }
}
