import { createNotification, getNotifications, markNotificationRead } from "../services/notificationService.js";
import { successResponse } from "../utils/responseFormatter.js";
import Notification from "../models/Notification.js";

export const handleGetNotifications = async (req, res, next) => {
  try {
    const notifications = await getNotifications(req.user._id);
    return successResponse(res, "Notifications retrieved successfully.", { notifications }, 200);
  } catch (error) {
    next(error);
  }
};

export const handleMarkRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await markNotificationRead(req.user._id, id);
    return successResponse(res, "Notification marked as read.", { notification }, 200);
  } catch (error) {
    next(error);
  }
};

export const handleMarkAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
    return successResponse(res, "All notifications marked as read.", {}, 200);
  } catch (error) {
    next(error);
  }
};

export const handleDeleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Notification.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!deleted) {
      const error = new Error("Notification not found.");
      error.statusCode = 404;
      throw error;
    }
    return successResponse(res, "Notification deleted.", { notification: deleted }, 200);
  } catch (error) {
    next(error);
  }
};
