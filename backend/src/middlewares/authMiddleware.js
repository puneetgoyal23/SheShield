import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { errorResponse } from "../utils/responseFormatter.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Access denied. No token provided.", [], 401);
    }

    const token = authHeader.split(" ")[1];
    const jwtSecret = process.env.JWT_SECRET || "sheshield_secret_key";
    
    let decoded;
    try {
      decoded = jwt.verify(token, jwtSecret);
    } catch (err) {
      return errorResponse(res, "Invalid or expired token.", [], 401);
    }

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return errorResponse(res, "User not found or authorization failed.", [], 401);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return errorResponse(res, "Authentication error.", [], 500);
  }
};

export default authMiddleware;
