export class AuthError extends Error {
  public statusCode: number;
  public code: string;

  constructor(message: string, statusCode = 401, code = "AUTH_ERROR") {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export class UnauthorizedError extends AuthError {
  constructor(message = "Authentication required") {
    super(message, 401, "UNAUTHORIZED");
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AuthError {
  constructor(message = "Access forbidden: insufficient permissions or scope") {
    super(message, 403, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

export class AccountStatusError extends AuthError {
  constructor(message = "Account is inactive or suspended") {
    super(message, 403, "ACCOUNT_RESTRICTED");
    this.name = "AccountStatusError";
  }
}
