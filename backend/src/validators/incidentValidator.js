import { body } from "express-validator";
import validationMiddleware from "../middlewares/validationMiddleware.js";

export const incidentReportValidator = [
  body("type")
    .trim()
    .notEmpty()
    .withMessage("Incident type is required")
    .isIn([
      "Harassment",
      "Suspicious Activity",
      "Poor Lighting",
      "Road Block",
      "Unsafe Crowd",
      "Police Patrol",
      "Accident"
    ])
    .withMessage("Invalid incident type"),
  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),
  body("latitude")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Latitude must be a valid number between -90 and 90"),
  body("longitude")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Longitude must be a valid number between -180 and 180"),
  body("journeyId")
    .optional()
    .isMongoId()
    .withMessage("Invalid journey ID format"),
  validationMiddleware
];
