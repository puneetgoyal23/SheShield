import { errorResponse } from "../utils/responseFormatter.js";

const errorMiddleware = (err, req, res, next) => {
  console.error("Global Error Handler Catch-All:", err);
  
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const errors = err.errors || [];
  
  return errorResponse(res, message, errors, statusCode);
};

export default errorMiddleware;
