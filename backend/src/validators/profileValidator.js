import { body } from "express-validator";
import validationMiddleware from "../middlewares/validationMiddleware.js";

export const updateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty"),
  body("phone")
    .optional()
    .trim()
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone must be between 10 and 15 digits"),
  validationMiddleware
];
