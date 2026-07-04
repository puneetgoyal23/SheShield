import express from "express";
import {
  handleGetNotifications,
  handleMarkRead,
  handleMarkAllRead,
  handleDeleteNotification
} from "../controllers/notificationController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/", handleGetNotifications);
router.patch("/read-all", handleMarkAllRead);
router.patch("/:id/read", handleMarkRead);
router.delete("/:id", handleDeleteNotification);

export default router;
