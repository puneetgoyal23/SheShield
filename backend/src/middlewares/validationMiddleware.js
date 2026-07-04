import { validationResult } from "express-validator";
import { errorResponse } from "../utils/responseFormatter.js";

const validationMiddleware = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));
    return errorResponse(res, "Validation failed", formattedErrors, 400);
  }
  next();
};

export default validationMiddleware;
