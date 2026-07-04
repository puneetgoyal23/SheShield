import { body } from "express-validator";
import validationMiddleware from "../middlewares/validationMiddleware.js";

export const registerValidator = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required"),
  body("email")
    .trim()
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .isLength({ min: 10, max: 15 })
    .withMessage("Phone number must be between 10 and 15 digits"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  validationMiddleware
];

export const loginValidator = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required"),
  validationMiddleware
];
