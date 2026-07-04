import { body } from "express-validator";
import validationMiddleware from "../middlewares/validationMiddleware.js";

export const contactValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Contact name is required"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Contact phone number is required")
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be between 10 and 15 digits"),
  body("relationship")
    .trim()
    .notEmpty()
    .withMessage("Relationship status/type is required"),
  body("isPrimaryContact")
    .optional()
    .isBoolean()
    .withMessage("isPrimaryContact must be a boolean"),
  body("isSOSContact")
    .optional()
    .isBoolean()
    .withMessage("isSOSContact must be a boolean"),
  validationMiddleware
];
