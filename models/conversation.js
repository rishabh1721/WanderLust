// models/conversation.js - Final Version
const mongoose = require('mongoose');
const { Schema, Types } = mongoose;

const conversationSchema = new Schema(
  {
    participants: [
      {
        user: {
          type: Types.ObjectId,
          ref: 'User',
          required: true,
        },
        unreadCount: {
          type: Number,
          default: 0,
          min: 0, // Ensure unreadCount never goes below zero
        },
        isArchived: {
          type: Boolean,
          default: false,
        },
        lastViewedAt: {
          type: Date,
          default: Date.now,
        },
        // Optional: Add a 'deletedAt' field for soft-deleting conversations for a specific user
        // deletedAt: {
        //   type: Date,
        //   default: null,
        // }
      },
    ],
    lastMessage: {
      type: Types.ObjectId,
      ref: 'Message',
      default: null, // Added default null for consistency and clarity
    },
    conversationType: {
      type: String,
      enum: ['direct', 'listing', 'booking', 'system', 'group'], // Added 'group' for potential future expansion
      default: 'direct',
      required: true,
    },
    relatedListing: {
      type: Types.ObjectId,
      ref: 'Listing',
      default: null, // Added default null for consistency
      index: true, // This is sufficient for indexing
    },
    relatedBooking: {
      type: Types.ObjectId,
      ref: 'Booking',
      default: null, // Added default null for consistency
      index: true, // This is sufficient for indexing
    },
    status: {
      type: String,
      enum: ['active', 'resolved', 'blocked', 'archived'], // Added 'archived' for conversation-level archiving
      default: 'active',
    },
    title: { // Optional title for conversations (e.g., "Inquiry about [Listing Name]")
      type: String,
      trim: true,
      maxlength: 100,
      default: null, // Default to null if no title is provided
    },
    // For group conversations, you might want an admin or creator
    // creator: {
    //   type: Types.ObjectId,
    //   ref: 'User',
    //   default: null,
    // },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    toJSON: { virtuals: true }, // Ensure virtuals are included when converting to JSON
    toObject: { virtuals: true }, // Ensure virtuals are included when converting to object
  }
);

// --- Schema Indexes ---
// Index for efficient lookup of conversations by any participant
conversationSchema.index({ 'participants.user': 1 });

// Unique compound index for direct conversations between two specific users
// Ensures only one 'direct' conversation exists between a pair of users, regardless of order.
// The `partialFilterExpression` ensures this uniqueness constraint only applies to 'direct' conversations.
conversationSchema.index(
  { 'participants.user': 1, conversationType: 1 },
  { unique: true, partialFilterExpression: { conversationType: 'direct' } }
);

// Index for sorting by most recent activity (already present and good)
conversationSchema.index({ updatedAt: -1 });

// --- Pre-save Hooks ---

// Pre-save hook to ensure participants array is sorted consistently
// This is crucial for the unique index and `findOrCreate` logic to work reliably.
conversationSchema.pre('save', function (next) {
  if (this.isModified('participants') || this.isNew) {
    // Filter out invalid user entries and ensure unique participants
    const uniqueParticipants = new Map();
    this.participants.forEach(p => {
      if (p.user && mongoose.Types.ObjectId.isValid(p.user)) {
        uniqueParticipants.set(p.user.toString(), p);
      }
    });
    this.participants = Array.from(uniqueParticipants.values())
      .sort((a, b) => a.user.toString().localeCompare(b.user.toString())); // Sort by user ID string
  }
  next();
});

// --- Static Methods ---

/**
 * Static method to find an existing conversation or create a new one.
 * Ensures that for 'direct' conversations, only one thread exists between a pair of users.
 * Handles race conditions by attempting to find the conversation again if a duplicate key error occurs.
 *
 * @param {object} options - Options for finding or creating a conversation.
 * @param {Array<Types.ObjectId|string>} options.participants - An array of user ObjectIds or strings.
 * @param {string} [options.conversationType='direct'] - The type of conversation.
 * @param {Types.ObjectId|string} [options.relatedListing] - Optional ID of a related listing.
 * @param {Types.ObjectId|string} [options.relatedBooking] - Optional ID of a related booking.
 * @param {string} [options.title] - Optional title for the conversation.
 * @returns {Promise<Conversation>} The found or newly created conversation document.
 * @throws {Error} Throws an error if validation fails or other unexpected errors occur.
 */
conversationSchema.statics.findOrCreate = async function ({ participants, conversationType = 'direct', ...metadata }) {
  // Ensure participants are valid ObjectIds and remove duplicates
  const validParticipants = Array.from(new Set(
    participants.filter(id => mongoose.Types.ObjectId.isValid(id)).map(id => id.toString())
  )).sort();

  // Validate number of participants based on conversation type
  if (conversationType === 'direct' && validParticipants.length !== 2) {
    throw new Error('A direct conversation must have exactly two valid participant IDs.');
  }
  if (conversationType === 'group' && validParticipants.length < 2) {
    throw new Error('A group conversation must have at least two valid participant IDs.');
  }
  // Add more validation for other conversation types if needed

  // Construct query to find existing conversation
  const query = {
    'participants.user': { $all: validParticipants.map(id => new Types.ObjectId(id)) }, // Match all participants
    conversationType: conversationType,
  };

  // Add specific related entity to query if provided for uniqueness
  if (metadata.relatedListing) {
    query.relatedListing = new Types.ObjectId(metadata.relatedListing); // Ensure ObjectId
  }
  if (metadata.relatedBooking) {
    query.relatedBooking = new Types.ObjectId(metadata.relatedBooking); // Ensure ObjectId
  }

  try {
    let conversation = await this.findOne(query);

    if (conversation) {
      return conversation; // Return existing conversation
    }

    // If no conversation found, create a new one
    const newParticipants = validParticipants.map(userId => ({
      user: new Types.ObjectId(userId),
      unreadCount: 0,
      isArchived: false,
      lastViewedAt: Date.now(),
    }));

    conversation = new this({
      participants: newParticipants,
      conversationType,
      ...metadata,
    });

    return await conversation.save();
  } catch (error) {
    // Handle duplicate key error (E11000) specifically for unique index
    if (error.code === 11000) {
      // This means a conversation was created by another concurrent request.
      // Attempt to find it again, as it should now exist.
      console.warn('Race condition detected: Conversation already exists, attempting to retrieve.');
      const existingConversation = await this.findOne(query);
      if (existingConversation) {
        return existingConversation;
      }
      // If still not found, re-throw the original error
      throw error;
    }
    throw error; // Re-throw other errors
  }
};

/**
 * Static method to find conversations for a specific user, with filtering and pagination options.
 * @param {Types.ObjectId} userId - The ID of the user.
 * @param {object} [options={}] - Optional filters and pagination options.
 * @param {boolean} [options.archived] - Filter by archived status for the user.
 * @param {string} [options.type] - Filter by conversation type.
 * @param {string} [options.status] - Filter by conversation status.
 * @param {number} [options.limit=10] - Number of conversations to return.
 * @param {number} [options.skip=0] - Number of conversations to skip.
 * @returns {Promise<Array<Conversation>>} A promise that resolves to an array of conversations.
 */
conversationSchema.statics.findForUser = function (userId, options = {}) {
  const { archived, type, status, limit = 10, skip = 0 } = options;

  const query = {
    'participants.user': userId,
  };

  // Apply archived filter for the specific user's participant subdocument
  if (archived !== undefined) {
    query['participants'] = { $elemMatch: { user: userId, isArchived: archived } };
  }

  // Apply conversation type filter
  if (type) {
    query.conversationType = type;
  }

  // Apply conversation status filter
  if (status) {
    query.status = status;
  }

  return this.find(query)
    .populate('participants.user', 'username fullName avatar') // Populate participant user details
    .populate({
      path: 'lastMessage', // Populate the last message
      populate: { path: 'sender', select: 'username avatar' } // Populate sender of the last message
    })
    .populate('relatedListing', 'title images location price') // Populate relevant listing details
    .populate('relatedBooking', 'startDate endDate status') // Populate relevant booking details
    .sort('-updatedAt') // Sort by most recent activity
    .limit(limit)
    .skip(skip);
};

// Helper function for server-side time ago formatting (moved from routes/messages.js)
function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return Math.floor(seconds) + ' seconds ago';
}

// Static method to format conversation data for display in inbox (moved from routes/messages.js)
conversationSchema.statics.formatConversationsForDisplay = async function(conversations, currentUserId) {
    const formattedConversations = [];
    const User = mongoose.model('User'); // Get User model reference
    const Message = mongoose.model('Message'); // Get Message model reference

    for (const convo of conversations) {
        const otherParticipant = convo.participants.find(p => p.user && p.user._id && p.user._id.toString() !== currentUserId.toString());
        // Handle cases where otherParticipant might not be found (e.g., group chat where current user is only one left, or system message)
        let otherUser = { username: 'System', avatar: '/images/default-avatar.png' }; // Default for system or single-user scenarios
        if (otherParticipant) {
            otherUser = await User.findById(otherParticipant.user).select('username avatar isOnline lastSeen').lean();
            if (!otherUser) {
                otherUser = { username: 'Unknown User', avatar: '/images/default-avatar.png' };
            }
        }

        let lastMessageSnippet = 'No messages yet.';
        let lastMessageTimeAgo = '';
        let isFromCurrentUser = false;

        // Populate lastMessage if it's not already populated (it should be by findForUser)
        let lastMsg = convo.lastMessage;
        if (lastMsg && !lastMsg.content && !lastMsg.attachment) { // Check if it's just an ID and needs full population
            lastMsg = await Message.findById(convo.lastMessage).select('content sender messageType attachment createdAt').lean();
        }

        if (lastMsg) {
            if (lastMsg.messageType === 'text') {
                lastMessageSnippet = lastMsg.content ? (lastMsg.content.length > 70 ? lastMsg.content.substring(0, 70) + '...' : lastMsg.content) : '';
            } else if (lastMsg.messageType === 'image') {
                lastMessageSnippet = `[Image: ${lastMsg.attachment.filename || 'untitled'}]`;
            } else if (lastMsg.messageType === 'file') {
                lastMessageSnippet = `[File: ${lastMsg.attachment.filename || 'untitled'}]`;
            } else if (lastMsg.messageType === 'system') {
                lastMessageSnippet = `[System Message]`;
            }
            lastMessageTimeAgo = formatTimeAgo(lastMsg.createdAt);
            isFromCurrentUser = lastMsg.sender && lastMsg.sender.toString() === currentUserId.toString();
        }

        let listingInfo = null;
        if (convo.relatedListing) {
            const Listing = mongoose.model('Listing');
            listingInfo = await Listing.findById(convo.relatedListing).select('title images').lean();
        }

        let bookingInfo = null;
        if (convo.relatedBooking) {
            const Booking = mongoose.model('Booking');
            bookingInfo = await Booking.findById(convo.relatedBooking).select('startDate endDate status').lean();
        }

        const currentUserParticipant = convo.participants.find(p => p.user && p.user._id && p.user._id.toString() === currentUserId.toString());
        const unreadCount = currentUserParticipant ? currentUserParticipant.unreadCount : 0;
        const isArchived = currentUserParticipant ? currentUserParticipant.isArchived : false;


        formattedConversations.push({
            _id: convo._id,
            otherUser: otherUser,
            lastMessage: lastMsg ? {
                _id: lastMsg._id,
                content: lastMessageSnippet,
                timeAgo: lastMessageTimeAgo,
                isFromCurrentUser: isFromCurrentUser,
                createdAt: lastMsg.createdAt,
                sender: lastMsg.sender // Include sender for client-side prefix logic
            } : null,
            unreadCount: unreadCount,
            isArchived: isArchived,
            relatedListing: listingInfo,
            relatedBooking: bookingInfo,
            updatedAt: convo.updatedAt // For sorting in inbox view
        });
    }
    return formattedConversations;
};


// --- Instance Methods ---

/**
 * Instance method to update the conversation's last message and increment unread counts.
 * Increments unreadCount for all participants except the sender.
 * @param {Types.ObjectId} messageId - The ID of the new last message.
 * @param {Types.ObjectId} senderId - The ID of the user who sent the message.
 * @returns {Promise<Conversation>} A promise that resolves to the updated conversation document.
 */
conversationSchema.methods.touch = async function (messageId, senderId) {
  this.lastMessage = messageId;
  // `timestamps: true` handles `updatedAt` on `save()`, but explicitly setting it ensures it's fresh.
  // This is good practice if you're modifying subdocuments and want to ensure the parent `updatedAt` is touched.
  this.updatedAt = Date.now();

  // Increment unreadCount for all participants except the sender
  this.participants.forEach(p => {
    // Ensure p.user exists and is not equal to senderId
    if (p.user && !p.user.equals(senderId)) {
      p.unreadCount = (p.unreadCount || 0) + 1;
      // Also unarchive the conversation for the recipient if it was archived
      p.isArchived = false; // New message unarchives for recipient
    }
  });

  return this.save();
};

/**
 * Instance method to check if a user is a participant in this conversation.
 * @param {Types.ObjectId} userId - The ID of the user to check.
 * @returns {boolean} True if the user is a participant, false otherwise.
 */
conversationSchema.methods.includesUser = function (userId) {
  // Use .some() for efficiency, and ensure p.user exists before calling .equals()
  return this.participants.some(p => p.user && p.user.equals(userId));
};

/**
 * Instance method to mark the conversation as read for a specific user.
 * Resets their `unreadCount` to 0 and updates `lastViewedAt`.
 * @param {Types.ObjectId} userId - The ID of the user for whom to mark as read.
 * @returns {Promise<Conversation>} A promise that resolves to the updated conversation document.
 */
conversationSchema.methods.markReadForUser = async function (userId) {
  const participant = this.participants.find(p => p.user && p.user.equals(userId));
  if (participant) {
    participant.unreadCount = 0;
    participant.lastViewedAt = Date.now();
    return this.save();
  }
  return Promise.resolve(this); // If participant not found, return current document
};

/**
 * Instance method to archive the conversation for a specific user.
 * Sets `isArchived` to true for that participant.
 * @param {Types.ObjectId} userId - The ID of the user for whom to archive.
 * @returns {Promise<Conversation>} A promise that resolves to the updated conversation document.
 */
conversationSchema.methods.archiveForUser = async function (userId) {
  const participant = this.participants.find(p => p.user && p.user.equals(userId));
  if (participant) {
    participant.isArchived = true;
    return this.save();
  }
  return Promise.resolve(this);
};

/**
 * Instance method to unarchive the conversation for a specific user.
 * Sets `isArchived` to false for that participant.
 * @param {Types.ObjectId} userId - The ID of the user for whom to unarchive.
 * @returns {Promise<Conversation>} A promise that resolves to the updated conversation document.
 */
conversationSchema.methods.unarchiveForUser = async function (userId) {
  const participant = this.participants.find(p => p.user && p.user.equals(userId));
  if (participant) {
    participant.isArchived = false;
    return this.save();
  }
  return Promise.resolve(this);
};

/**
 * Instance method to get a specific participant's data from the conversation.
 * @param {Types.ObjectId} userId - The ID of the user whose participant data to retrieve.
 * @returns {object|null} The participant object or null if not found.
 */
conversationSchema.methods.getParticipantData = function (userId) {
  return this.participants.find(p => p.user && p.user.equals(userId));
};

// --- Virtuals ---

/**
 * Virtual property to get the total message count for the conversation.
 * This requires populating the 'messages' collection.
 * Note: Virtuals with `count: true` are generally efficient for simple counts.
 * For very large conversations, consider pre-calculating and storing the count
 * in a field if performance becomes an issue.
 */
conversationSchema.virtual('messageCount', {
  ref: 'Message',
  localField: '_id',
  foreignField: 'conversation',
  count: true, // Return the count of matching documents
});

// --- Export Model ---
// Export the Mongoose model, preventing redefinition if already defined (useful in development with hot-reloading)
module.exports = mongoose.models.Conversation || mongoose.model('Conversation', conversationSchema);
