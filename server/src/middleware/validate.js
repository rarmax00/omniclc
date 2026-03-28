export function validateBody(validator) {
  return function validationMiddleware(req, res, next) {
    req.validatedBody = validator(req.body);
    next();
  };
}

export function validateQuery(validator) {
  return function validationMiddleware(req, res, next) {
    req.validatedQuery = validator(req.query);
    next();
  };
}