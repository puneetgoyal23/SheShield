const userSockets = new Map();

/**
 * Initializes Socket.IO connection event listeners.
 */
export const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Register active user connection
    socket.on("register", (userId) => {
      socket.userId = userId.toString();
      if (!userSockets.has(socket.userId)) {
        userSockets.set(socket.userId, new Set());
      }
      userSockets.get(socket.userId).add(socket.id);
      console.log(`User ${socket.userId} registered on socket: ${socket.id}`);
    });

    // Join unique journey room for live location sharing
    socket.on("join-journey", (journeyId) => {
      socket.join(journeyId.toString());
      console.log(`Socket ${socket.id} joined journey: ${journeyId}`);
    });

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.id}`);
      if (socket.userId && userSockets.has(socket.userId)) {
        const sockets = userSockets.get(socket.userId);
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          userSockets.delete(socket.userId);
        }
      }
    });
  });
};

/**
 * Emits a WebSocket event to all active sockets of a specific user.
 */
export const emitToUser = (io, userId, event, data) => {
  if (!io) return;
  const userStr = userId.toString();
  if (userSockets.has(userStr)) {
    const sockets = userSockets.get(userStr);
    sockets.forEach((socketId) => {
      io.to(socketId).emit(event, data);
    });
  }
};

/**
 * Emits a WebSocket event to a shared journey room (all tracking listeners).
 */
export const emitToJourney = (io, journeyId, event, data) => {
  if (!io) return;
  io.to(journeyId.toString()).emit(event, data);
};
