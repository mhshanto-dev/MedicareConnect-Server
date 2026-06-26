import Notification from '../models/Notification.js';

// GET /api/notifications — Get all notifications for current user
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) { next(error); }
};

// PATCH /api/notifications/:id — Mark single notification as read
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update this notification');
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (error) { next(error); }
};

// PATCH /api/notifications/mark-all-read — Mark all as read for current user
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) { next(error); }
};

// DELETE /api/notifications/:id — Delete notification (owner only)
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      res.status(404);
      throw new Error('Notification not found');
    }

    if (notification.userId.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete this notification');
    }

    await notification.deleteOne();

    res.json({ message: 'Notification deleted successfully' });
  } catch (error) { next(error); }
};

// POST /api/notifications — Create a notification (internal helper / test route)
export const createNotification = async (req, res, next) => {
  try {
    const { userId, title, message, type } = req.body;

    if (!title || !message) {
      res.status(400);
      throw new Error('title and message are required');
    }

    // If no userId provided, target the current user
    const targetUserId = userId || req.user._id;

    const notification = await Notification.create({
      userId: targetUserId,
      title,
      message,
      type: type || 'system',
    });

    res.status(201).json(notification);
  } catch (error) { next(error); }
};

// Internal helper: create a notification programmatically (no req/res)
export const createNotificationInternal = async ({ userId, title, message, type = 'system' }) => {
  try {
    await Notification.create({ userId, title, message, type });
  } catch (error) {
    console.error('Failed to create notification:', error.message);
  }
};
