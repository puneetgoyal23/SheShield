import express from "express";
import {
  handleRegister,
  handleLogin,
  handleGetProfile,
  handleUpdateProfile,
  handleUpdateProfileImage
} from "../controllers/authController.js";
import { registerValidator, loginValidator } from "../validators/authValidator.js";
import { updateProfileValidator } from "../validators/profileValidator.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// Public routes
router.post("/register", registerValidator, handleRegister);
router.post("/login", loginValidator, handleLogin);

// Protected routes
router.get("/profile", authMiddleware, handleGetProfile);
router.patch("/profile", authMiddleware, updateProfileValidator, handleUpdateProfile);
router.patch("/profile/image", authMiddleware, upload.single("profileImage"), handleUpdateProfileImage);

export default router;
