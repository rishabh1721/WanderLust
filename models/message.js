// models/message.js - Final Version
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const MAX_MESSAGE_LENGTH = 10000; // Reasonable limit for message content
const MAX_ATTACHMENT_SIZE = 25 * 1024 * 1024; // 25MB limit (consistent with typical web app limits)

const messageSchema = new Schema(
  {
    conversation: {
      type: Types.ObjectId,
      ref: 'Conversation',
      required: true,
      index: true, // Indexing for faster queries related to conversations
    },
    sender: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Indexing for faster queries related to senders
    },
    // The 'recipient' field is useful for 1:1 messaging or direct notifications,
    // but in a group conversation context, the 'conversation' field is primary
    // for targeting messages. For Airbnb-like 1:1 chats, 'recipient' is appropriate.
    recipient: {
      type: Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // Indexing for faster queries related to recipients
    },
    content: {
      type: String,
      trim: true,
      maxlength: [MAX_MESSAGE_LENGTH, `Message cannot exceed ${MAX_MESSAGE_LENGTH} characters.`],
      // Validate that message has content OR an attachment
      validate: {
        validator: function (v) {
          // A message must have content OR an attachment URL
          return (v && v.length > 0) || (this.attachment && this.attachment.url);
        },
        message: 'Message must have content or an attachment.',
      },
    },
    messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'system'], // 'system' for automated messages (e.g., "User X joined")
      default: 'text',
      required: true,
    },
    attachment: {
      url: {
        type: String,
        trim: true,
        // If an attachment exists, its URL should be present.
        // This implicitly validates 'url' if 'attachment' is provided.
      },
      filename: String,
      fileSize: {
        type: Number,
        max: [MAX_ATTACHMENT_SIZE, `File size cannot exceed ${MAX_ATTACHMENT_SIZE / (1024 * 1024)}MB.`],
      },
      mimeType: String,
    },
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'], // Track message delivery and read status
      default: 'sent',
    },
    readAt: {
      type: Date,
      default: null,
      // Only set 'readAt' if the status is 'read'. This ensures consistency.
      validate: {
        validator: function(v) {
          return this.status === 'read' ? v !== null : true;
        },
        message: 'readAt must be set if status is "read".'
      }
    },
    // Array of user IDs for whom this message is "deleted" or hidden (soft delete)
    deletedFor: [{
      type: Types.ObjectId,
      ref: 'User'
    }],
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    // Use `toJSON` and `toObject` to transform the document when converted to JSON/Object.
    // This is useful for removing sensitive data or adding virtuals.
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- Schema Indexes ---
// Indexes for faster queries on common fields
messageSchema.index({ conversation: 1, recipient: 1, readAt: 1 }); // For finding messages for a recipient in a conversation, filtered by read status
messageSchema.index({ conversation: 1, createdAt: -1 }); // For fetching conversation history efficiently (most recent first)
messageSchema.index({ sender: 1, recipient: 1, createdAt: -1 }); // For direct messaging queries, e.g., messages between two specific users

// --- Pre-save Hooks ---
// Pre-save hook to validate attachment size before saving the message
messageSchema.pre('save', function(next) {
  if (this.attachment && this.attachment.fileSize && this.attachment.fileSize > MAX_ATTACHMENT_SIZE) {
    // Using a custom error message for better clarity.
    return next(new Error(`Attachment file size (${(this.attachment.fileSize / (1024 * 1024)).toFixed(2)}MB) exceeds the maximum allowed size of ${MAX_ATTACHMENT_SIZE / (1024 * 1024)}MB.`));
  }

  // Ensure content is null if it's an attachment, and vice-versa for text
  if (this.attachment && this.attachment.url) {
      this.messageType = this.attachment.mimeType.startsWith('image/') ? 'image' : 'file';
      this.content = null; // Clear content if it's an attachment
  } else {
      this.messageType = 'text';
      this.attachment = undefined; // Clear attachment if it's a text message
  }
  next();
});

// The pre('findOneAndUpdate') hook for 'updatedAt' is generally redundant if `timestamps: true` is used.
// Mongoose's `timestamps` option handles `updatedAt` for `save()` and `findOneAndUpdate()`.
// Keeping it might indicate a specific need for manual control, but often it can be removed.
/*
messageSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: Date.now() });
  next();
});
*/

// --- Static Methods ---

/**
 * Static method to fetch unread messages within a specific conversation for a given user.
 * Messages are considered unread if `readAt` is null (or undefined) and they haven't been soft-deleted by the user.
 * @param {Types.ObjectId} conversationId - The ID of the conversation.
 * @param {Types.ObjectId} userId - The ID of the user for whom to fetch unread messages.
 * @returns {Promise<Array<Message>>} A promise that resolves to an array of unread messages.
 */
messageSchema.statics.getUnread = function (conversationId, userId) {
  return this.find({
    conversation: conversationId,
    recipient: userId, // The message was sent to this user
    readAt: { $eq: null }, // Message has not been read (readAt is null)
    deletedFor: { $ne: userId }, // Exclude messages that this user has soft-deleted
  });
};

/**
 * Static method to count all unread messages for a specific user across all conversations.
 * @param {Types.ObjectId} userId - The ID of the user for whom to count unread messages.
 * @returns {Promise<number>} A promise that resolves to the count of unread messages.
 */
messageSchema.statics.countAllUnread = function (userId) {
  return this.countDocuments({
    recipient: userId,
    readAt: { $eq: null }, // Message has not been read
    deletedFor: { $ne: userId }, // Exclude messages that this user has soft-deleted
  });
};

/**
 * Static method to send a new message.
 * If saving fails, a 'failed' status message is recorded and the original error is re-thrown.
 * @param {object} messageData - Object containing message details.
 * @param {Types.ObjectId} messageData.conversation - The conversation ID.
 * @param {Types.ObjectId} messageData.sender - The sender's user ID.
 * @param {Types.ObjectId} messageData.recipient - The recipient's user ID.
 * @param {string} messageData.content - The message text content.
 * @param {string} [messageData.messageType='text'] - The type of message (e.g., 'text', 'image', 'file').
 * @param {object} [messageData.attachment={}] - Optional attachment details ({ url, filename, fileSize, mimeType }).
 * @returns {Promise<Message>} A promise that resolves to the saved message document.
 * @throws {Error} Throws an error if message saving fails, after recording a 'failed' message.
 */
messageSchema.statics.send = async function ({
  conversation,
  sender,
  recipient,
  content,
  messageType = 'text',
  attachment = {},
}) {
  try {
    const msg = new this({
      conversation,
      sender,
      recipient,
      content,
      messageType,
      attachment,
    });
    return await msg.save();
  } catch (error) {
    // Record a 'failed' message attempt in the database for auditing/retry mechanisms
    const failedMsg = new this({
      conversation,
      sender,
      recipient,
      content,
      messageType,
      status: 'failed',
      // Optionally store error details for debugging
      // errorDetails: error.message,
    });
    // Attempt to save the failed message, but don't re-throw its error
    await failedMsg.save().catch(err => console.error("Failed to save failed message record:", err));
    throw error; // Re-throw the original error to be handled by the caller service
  }
};

/**
 * Static method to find messages visible to a specific user within a conversation.
 * This method is crucial for pagination and soft-delete functionality.
 * @param {Types.ObjectId} conversationId - The ID of the conversation.
 * @param {Types.ObjectId} userId - The ID of the user for whom to fetch messages.
 * @param {number} page - The current page number (1-indexed).
 * @param {number} limit - The number of messages per page.
 * @returns {Promise<Array<Message>>} A promise that resolves to an array of messages.
 */
messageSchema.statics.findVisibleToUser = function(conversationId, userId, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    return this.find({
        conversation: conversationId,
        deletedFor: { $ne: userId } // Exclude messages that this user has soft-deleted
    })
    .sort({ createdAt: -1 }) // Sort by newest first for fetching (will be reversed on client)
    .skip(skip)
    .limit(limit)
    .populate('sender', 'username avatar') // Populate sender's username and avatar
    .populate('recipient', 'username avatar') // Populate recipient's username and avatar (might not be needed if only sender is displayed)
    .exec();
};


// --- Instance Methods ---

/**
 * Instance method to mark the current message as read.
 * Sets `status` to 'read' and `readAt` to the current timestamp if not already read.
 * @returns {Promise<Message>} A promise that resolves to the updated message document.
 */
messageSchema.methods.markRead = function () {
  // Only mark as read if it hasn't been read already to avoid unnecessary writes
  if (this.readAt === null || this.readAt === undefined) {
    this.status = 'read';
    this.readAt = Date.now();
    return this.save();
  }
  return Promise.resolve(this); // If already read, return the current document as is
};

/**
 * Instance method to "soft delete" (hide) the message for a specific user.
 * Adds the userId to the `deletedFor` array if not already present.
 * The message remains visible to other participants.
 * @param {Types.ObjectId} userId - The ID of the user for whom to hide the message.
 * @returns {Promise<Message>} A promise that resolves to the updated message document.
 */
messageSchema.methods.softDeleteForUser = function (userId) {
  // Convert userId to string for reliable comparison within the array
  const userIdStr = userId.toString();
  if (!this.deletedFor.map(id => id.toString()).includes(userIdStr)) {
    this.deletedFor.push(userId);
  }
  return this.save();
};

// --- Virtuals ---

/**
 * Virtual property to check if the message is unread.
 * @returns {boolean} True if the message has not been read (`readAt` is null or undefined), false otherwise.
 */
messageSchema.virtual('isUnread').get(function() {
  return this.readAt === null || this.readAt === undefined;
});

// --- Export Model ---
// Export the Mongoose model, preventing redefinition if already defined in a hot-reloading environment
module.exports = mongoose.models.Message || mongoose.model('Message', messageSchema);
