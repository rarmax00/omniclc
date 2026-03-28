export class AppError extends Error {
    constructor(message, statusCode = 500) {
      super(message);
      this.name = "AppError";
      this.statusCode = statusCode;
    }
  }
  
  export function asyncHandler(fn) {
    return function wrapped(req, res, next) {
      Promise.resolve(fn(req, res, next)).catch(next);
    };
  }