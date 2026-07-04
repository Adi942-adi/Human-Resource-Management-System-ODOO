class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode;
  }
}

const errorMessages = {
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden access',
  NOT_FOUND: 'Resource not found',
  BAD_REQUEST: 'Bad request',
  CONFLICT: 'Resource already exists',
  INTERNAL_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
  INVALID_TOKEN: 'Invalid or expired token',
  INVALID_CREDENTIALS: 'Invalid email or password',
  EMPLOYEE_EXISTS: 'Employee ID or email already exists',
  USER_NOT_FOUND: 'User not found',
};

const createError = (statusCode, message) => {
  return new ApiError(statusCode, message);
};

module.exports = {
  ApiError,
  errorMessages,
  createError,
};
