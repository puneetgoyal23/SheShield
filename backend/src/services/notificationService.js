import Notification from "../models/Notification.js";
import { emitToUser } from "../utils/socket.js";

export const createNotification = async (userId, { type, title, message }, io = null) => {
  const notification = new Notification({
    userId,
    type,
    title,
    message
  });

  await notification.save();

  // If socket.io instance is available, send a live notification alert to the user
  if (io) {
    emitToUser(io, userId, "new-notification", notification);
  }

  return notification;
};

export const getNotifications = async (userId) => {
  return await Notification.find({ userId }).sort({ createdAt: -1 });
};

export const markNotificationRead = async (userId, notificationId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
  
  if (!notification) {
    const error = new Error("Notification not found.");
    error.statusCode = 404;
    throw error;
  }
  
  return notification;
};
