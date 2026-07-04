import express from "express";
import { handleAddContact, handleGetContacts, handleRemoveContact, handleUpdateContact } from "../controllers/contactController.js";
import { contactValidator } from "../validators/contactValidator.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

// All contact routes require authentication
router.use(authMiddleware);

router.post("/", contactValidator, handleAddContact);
router.get("/", handleGetContacts);
router.patch("/:id", contactValidator, handleUpdateContact);
router.delete("/:id", handleRemoveContact);

export default router;
