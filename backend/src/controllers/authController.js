import { registerUser, loginUser, getUserProfile, updateUserProfile, updateProfileImage } from "../services/authService.js";
import { successResponse } from "../utils/responseFormatter.js";

export const handleRegister = async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body;
    const user = await registerUser({ name, email, phone, password });
    return successResponse(res, "Registration successful.", { user }, 201);
  } catch (error) {
    next(error);
  }
};

export const handleLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const { user, token } = await loginUser({ email, password });
    return successResponse(res, "Login successful.", { user, token }, 200);
  } catch (error) {
    next(error);
  }
};

export const handleGetProfile = async (req, res, next) => {
  try {
    const profile = await getUserProfile(req.user._id);
    return successResponse(res, "Profile retrieved successfully.", { user: profile }, 200);
  } catch (error) {
    next(error);
  }
};

export const handleUpdateProfile = async (req, res, next) => {
  try {
    const { name, phone } = req.body;
    const updatedUser = await updateUserProfile(req.user._id, { name, phone });
    return successResponse(res, "Profile updated successfully.", { user: updatedUser }, 200);
  } catch (error) {
    next(error);
  }
};

export const handleUpdateProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      const error = new Error("No image file provided.");
      error.statusCode = 400;
      throw error;
    }
    const imagePath = `/uploads/${req.file.filename}`;
    const updatedUser = await updateProfileImage(req.user._id, imagePath);
    return successResponse(res, "Profile image updated successfully.", { user: updatedUser }, 200);
  } catch (error) {
    next(error);
  }
};
