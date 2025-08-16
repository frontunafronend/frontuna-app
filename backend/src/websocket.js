const jwt = require('jsonwebtoken');
const { createLogger } = require('./utils/logger');

const logger = createLogger('websocket');

/**
 * Initialize WebSocket handlers
 */
function initializeWebSocket(io) {
  logger.info('Initializing WebSocket server...');

  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.sub;
      
      logger.info('Socket authenticated', { 
        socketId: socket.id, 
        userId: socket.userId 
      });
      
      next();
    } catch (error) {
      logger.warn('Socket authentication failed', { 
        socketId: socket.id, 
        error: error.message 
      });
      next(new Error('Authentication failed'));
    }
  });

  // Handle connections
  io.on('connection', (socket) => {
    logger.info('Client connected', { 
      socketId: socket.id, 
      userId: socket.userId 
    });

    // Join user-specific room
    socket.join(`user_${socket.userId}`);

    // Handle component generation events
    socket.on('start_generation', (data) => {
      logger.info('Generation started', { 
        socketId: socket.id, 
        userId: socket.userId,
        prompt: data.prompt?.substring(0, 50) + '...'
      });

      // TODO: Implement generation progress tracking
      socket.emit('generation_started', { 
        generationId: 'gen_' + Date.now(),
        status: 'processing'
      });
    });

    // Handle real-time notifications
    socket.on('mark_notification_read', (notificationId) => {
      logger.info('Notification marked as read', {
        socketId: socket.id,
        userId: socket.userId,
        notificationId
      });

      // TODO: Update notification status in database
      socket.emit('notification_updated', { 
        notificationId, 
        isRead: true 
      });
    });

    // Handle admin events (if user is admin)
    socket.on('admin_action', (data) => {
      // TODO: Verify admin privileges
      logger.info('Admin action performed', {
        socketId: socket.id,
        userId: socket.userId,
        action: data.action
      });
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info('Client disconnected', { 
        socketId: socket.id, 
        userId: socket.userId,
        reason 
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error', { 
        socketId: socket.id, 
        userId: socket.userId,
        error: error.message 
      });
    });
  });

  logger.info('WebSocket server initialized successfully');
}

/**
 * Send notification to user
 */
function sendNotificationToUser(io, userId, notification) {
  io.to(`user_${userId}`).emit('new_notification', notification);
  logger.info('Notification sent', { userId, notificationId: notification.id });
}

/**
 * Send generation update to user
 */
function sendGenerationUpdate(io, userId, update) {
  io.to(`user_${userId}`).emit('generation_progress', update);
  logger.info('Generation update sent', { userId, generationId: update.generationId });
}

/**
 * Broadcast system alert to all connected users
 */
function broadcastSystemAlert(io, alert) {
  io.emit('system_alert', alert);
  logger.info('System alert broadcasted', { alertType: alert.type });
}

module.exports = {
  initializeWebSocket,
  sendNotificationToUser,
  sendGenerationUpdate,
  broadcastSystemAlert
};