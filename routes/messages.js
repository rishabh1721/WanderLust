// routes/messages.js - Final Version

const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { isLoggedIn } = require('../middleware'); // Assuming you have this middleware for authentication
const { format: timeagoFormat } = require('timeago.js'); // For formatting timestamps
const createError = require('http-errors'); // For creating HTTP errors

// Mongoose Models
const Message = require('../models/message');
const Conversation = require('../models/conversation');
const User = require('../models/user');
const Listing = require('../models/listing');
const Booking = require('../models/booking');

const router = express.Router();

// ================== Multer Setup for File Uploads ==================
// Assuming you have your Cloudinary configuration in ../cloudinary
const { storage } = require('../cloudinary'); // Use Cloudinary storage for multer
const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB limit for attachments, consistent with Message model
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword', // .doc
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel', // .xls
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'text/plain' // .txt
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      // Reject the file with a specific error message
      cb(new Error('Invalid file type. Only images, PDFs, Word documents, Excel sheets, and plain text files are allowed.'), false);
    }
  }
});

// ================== Auth Middleware ==================
/**
 * Middleware to check if the authenticated user has access to a specific conversation.
 * Attaches the found conversation document to `req.conversation`.
 * @param {object} req - Express request object.
 * @param {object} res - Express response object.
 * @param {function} next - Next middleware function.
 */
async function canAccessConversation(req, res, next) {
  try {
    const conversationId = req.params.conversationId;
    const userId = req.user._id; // Assuming req.user is populated by isLoggedIn middleware

    // Validate conversation ID format
    if (!mongoose.Types.ObjectId.isValid(conversationId)) {
      return next(createError(400, 'Invalid conversation ID format.'));
    }

    // Find the conversation by ID and populate necessary fields
    const conversation = await Conversation.findById(conversationId)
      .populate('participants.user', 'username fullName avatar') // Populate participant user details
      .populate('relatedListing') // Populate related listing details
      .populate('relatedBooking'); // Populate related booking details

    if (!conversation) {
      return next(createError(404, 'Conversation not found.'));
    }

    // Check if the current user is a participant in this conversation
    if (!conversation.includesUser(userId)) {
      return next(createError(403, 'You do not have permission to access this conversation.'));
    }

    // Attach the conversation object to the request for subsequent middleware/route handlers
    req.conversation = conversation;
    next();
  } catch (err) {
    console.error('Error in canAccessConversation middleware:', err);
    next(err); // Pass error to the next error-handling middleware
  }
}

// ================== Helper Functions ==================
/**
 * Formats conversation documents for display in the inbox view.
 * Populates necessary user, listing, and booking details.
 * @param {Array<Conversation>} conversations - Array of raw conversation documents.
 * @param {ObjectId|string} currentUserId - The ID of the currently logged-in user.
 * @returns {Array<object>} An array of formatted conversation objects.
 */
function formatConversationsForDisplay(conversations, currentUserId) {
  return conversations.map(convo => {
    // Find the other participant (not the current user)
    // Ensure p.user and p.user._id exist before comparing
    const otherParticipant = convo.participants.find(p =>
      p.user && p.user._id && !p.user._id.equals(currentUserId)
    );

    // Get user-specific data for the current user from the participants array
    // Ensure p.user and p.user._id exist before comparing
    const userParticipant = convo.participants.find(p =>
      p.user && p.user._id && p.user._id.equals(currentUserId)
    );

    const formatted = {
      _id: convo._id,
      // Populate otherUser details for display, handle cases where user might be null (e.g., deleted user)
      otherUser: (otherParticipant && otherParticipant.user && otherParticipant.user._id) ? {
        _id: otherParticipant.user._id,
        username: otherParticipant.user.username,
        fullName: otherParticipant.user.fullName,
        avatar: otherParticipant.user.avatar,
      } : { _id: null, username: 'Unknown User', fullName: 'Unknown User', avatar: '/images/default-avatar.png' }, // Fallback for deleted/invalid user

      unreadCount: userParticipant ? userParticipant.unreadCount : 0,
      isArchived: userParticipant ? userParticipant.isArchived : false,
      lastViewedAt: userParticipant ? userParticipant.lastViewedAt : null,
      updatedAt: convo.updatedAt,
      createdAt: convo.createdAt,
      type: convo.conversationType,
      status: convo.status,
      title: convo.title, // Include conversation title

      // Populate related listing info for display
      listingInfo: convo.relatedListing ? {
        _id: convo.relatedListing._id,
        title: convo.relatedListing.title,
        images: convo.relatedListing.images,
        location: convo.relatedListing.location,
        price: convo.relatedListing.price,
      } : null,

      // Populate related booking info for display
      bookingInfo: convo.relatedBooking ? {
        _id: convo.relatedBooking._id,
        startDate: convo.relatedBooking.startDate,
        endDate: convo.relatedBooking.endDate,
        status: convo.relatedBooking.status,
      } : null,
    };

    // Add last message info if available
    if (convo.lastMessage) {
      formatted.lastMessage = {
        content: convo.lastMessage.content || (convo.lastMessage.messageType !== 'text' ? '[Attachment]' : ''), // Display content or placeholder for attachments
        // Populate sender details for last message, handle cases where sender might be null
        sender: (convo.lastMessage.sender && convo.lastMessage.sender._id) ? {
          _id: convo.lastMessage.sender._id,
          username: convo.lastMessage.sender.username,
          avatar: convo.lastMessage.sender.avatar,
        } : { _id: null, username: 'Unknown User', avatar: '/images/default-avatar.png' }, // Fallback for deleted/invalid sender
        createdAt: convo.lastMessage.createdAt,
        timeAgo: timeagoFormat(convo.lastMessage.createdAt), // Format time for display
        isFromCurrentUser: (convo.lastMessage.sender && convo.lastMessage.sender._id) ? convo.lastMessage.sender._id.equals(currentUserId) : false,
        messageType: convo.lastMessage.messageType,
        attachment: convo.lastMessage.attachment,
      };
    }

    return formatted;
  });
}

// ================== GET /messages — Inbox View ==================
/**
 * Renders the user's message inbox, displaying a list of conversations.
 * Supports filtering by archived status, conversation type, and searching by participant name.
 * Includes pagination and total unread message count.
 */
router.get('/', isLoggedIn, async (req, res, next) => {
  try {
    const me = req.user._id; // Current authenticated user's ID
    const { filter = 'all', archived = 'false', search } = req.query; // Query parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Build query object based on filters
    let query = { 'participants.user': me }; // Always filter by current user's participation

    // Filter by archived status for the current user's participant subdocument
    query['participants'] = { $elemMatch: { user: me, isArchived: (archived === 'true') } };

    // Filter by conversation type
    if (filter === 'bookings') {
      query.conversationType = 'booking';
    } else if (filter === 'inquiries') {
      query.conversationType = 'listing'; // Assuming 'listing' type for inquiries
    } else if (filter === 'direct') {
      query.conversationType = 'direct';
    } else if (filter === 'support') {
      query.conversationType = 'system'; // Assuming 'system' type for support messages
    }
    // 'all' filter means no specific type filter is applied

    // Search in participants' names (if specified)
    if (search) {
      // Find users whose username, fullName, or email match the search term
      const searchRegex = new RegExp(search, 'i');
      const matchingUsers = await User.find({
        $or: [
          { username: searchRegex },
          { fullName: searchRegex },
          { email: searchRegex }
        ]
      }).select('_id'); // Select only the _id for efficiency

      if (matchingUsers.length > 0) {
        const matchingUserIds = matchingUsers.map(u => u._id);
        // Combine with the existing query to ensure the current user is a participant
        // AND one of the matching users is also a participant.
        query = {
          $and: [
            query, // Existing filters (e.g., archived status for current user)
            { 'participants.user': { $in: matchingUserIds } }
          ]
        };
      } else {
        // If no matching users, return an empty result set immediately
        return res.render('messages/inbox', {
          conversations: [],
          totalPages: 0,
          currentPage: 1,
          totalUnread: 0, // No unread messages if no conversations
          filters: { filter, archived, search }
        });
      }
    }

    // Count total conversations matching the query for pagination
    const total = await Conversation.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Get conversations with pagination and populate necessary fields
    const conversations = await Conversation.find(query)
      .populate('participants.user', 'username fullName avatar') // Populate user details for participants
      .populate({
        path: 'lastMessage', // Populate the last message
        populate: { path: 'sender', select: 'username avatar' } // Populate sender of the last message
      })
      .populate('relatedListing', 'title images location price') // Populate relevant listing details
      .populate('relatedBooking', 'startDate endDate status') // Populate relevant booking details
      .sort('-updatedAt') // Sort by most recent activity
      .skip(skip)
      .limit(limit)
      .lean(); // Return plain JavaScript objects for better performance

    // Format conversations for display in the EJS template
    const formattedConversations = formatConversationsForDisplay(conversations, me);

    // Get total unread message count for the user (for a badge on the inbox icon)
    const totalUnread = await Message.countAllUnread(me); // Uses the static method from Message model

    res.render('messages/inbox', {
      conversations: formattedConversations,
      totalPages,
      currentPage: page,
      totalUnread,
      filters: { filter, archived, search } // Pass current filter settings back to the view
    });
  } catch (err) {
    console.error('Error in GET /messages (Inbox):', err);
    next(err);
  }
});

// ================== GET /messages/conversation/:conversationId — Chat View by Conversation ID ==================
/**
 * Renders the chat interface for a specific conversation.
 * Fetches messages, marks them as read, and updates conversation unread counts.
 * Includes pagination for messages.
 */
router.get('/conversation/:conversationId', isLoggedIn, canAccessConversation, async (req, res, next) => {
  try {
    const me = req.user._id; // Current authenticated user's ID
    const conversation = req.conversation; // Conversation object attached by canAccessConversation middleware
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50; // Messages per page
    const skip = (page - 1) * limit;

    // Find the other participant in the conversation
    const otherParticipant = conversation.participants.find(
      p => p.user && p.user._id && !p.user._id.equals(me)
    );

    // Fallback for recipient if otherParticipant is not found or invalid
    const recipient = (otherParticipant && otherParticipant.user) ? otherParticipant.user : null;

    if (!recipient) {
      // This case should ideally be caught by canAccessConversation if it's a direct chat,
      // but good to have a fallback.
      console.warn('Other participant not found or invalid in conversation for chat view.');
      // For group chats, 'recipient' might not be a single user.
    }

    // Related listing and booking are already populated by `canAccessConversation`
    const listing = conversation.relatedListing;
    const booking = conversation.relatedBooking;

    // Count total messages in the conversation that are NOT soft-deleted by the current user
    const totalMessages = await Message.countDocuments({
      conversation: conversation._id,
      deletedFor: { $ne: me } // Only count messages not deleted by the current user
    });

    const totalPages = Math.ceil(totalMessages / limit);

    // Get messages for the conversation with pagination
    // Filter out messages soft-deleted by the current user
    const messages = await Message.find({
        conversation: conversation._id,
        deletedFor: { $ne: me } // Crucial: Filter messages not deleted by the current user
      })
      .sort('-createdAt') // Fetch newest messages first for pagination
      .skip(skip)
      .limit(limit)
      .populate('sender', 'username avatar') // Populate sender details
      .lean(); // Return plain JavaScript objects

    // Reverse the order to display oldest messages at the top (chronological order in chat)
    messages.reverse();

    // Mark all unread messages in this conversation for the current user as read
    // This is a bulk update for efficiency.
    await Message.updateMany(
      { conversation: conversation._id, recipient: me, readAt: null },
      { status: 'read', readAt: Date.now() }
    );

    // Update the conversation's unread count for the current user to zero
    await conversation.markReadForUser(me); // This uses the instance method

    // Note: The Socket.IO 'messagesRead' emission is now handled by the client-side
    // 'markRead' event which is processed by socketHandler.js.
    // This route's responsibility is only to update the DB and render the page.

    res.render('messages/chat', {
      messages,
      recipient, // The other user in the conversation (can be null for group chats)
      conversation,
      listing, // Related listing data
      booking, // Related booking data
      totalPages,
      currentPage: page,
      hasMore: page < totalPages // Flag to indicate if more pages of messages are available
    });
  } catch (err) {
    console.error('Error in GET /messages/conversation/:conversationId (Chat View):', err);
    next(err);
  }
});

// ================== GET /messages/:userId — Initiate Chat / Chat View by User ID ==================
/**
 * Initiates a new conversation with a specific user, or redirects to an existing one.
 * Can include context like a listing or booking ID to create a specific conversation type.
 */
router.get('/:userId', isLoggedIn, async (req, res, next) => {
  try {
    // Defensive check for req.user and req.user._id
    if (!req.user || !req.user._id) {
      console.error('Authenticated user (req.user) or its ID is missing in /messages/:userId route.');
      return next(createError(401, 'Authentication required. Please log in.'));
    }

    const me = req.user._id; // Current authenticated user's ID
    const other = req.params.userId; // The ID of the other user to chat with
    const listingId = req.query.listing; // Optional listing context
    const bookingId = req.query.booking; // Optional booking context

    // Validate the other user's ID format
    if (!mongoose.Types.ObjectId.isValid(other)) {
      return next(createError(400, 'Invalid user ID format for recipient.'));
    }

    // Ensure the other user exists
    const recipient = await User.findById(other);
    if (!recipient) {
      return next(createError(404, 'Recipient user not found.'));
    }

    // Prevent a user from messaging themselves
    if (me.equals(other)) {
      return next(createError(400, 'You cannot message yourself directly.'));
    }

    // Prepare metadata for conversation creation
    const metadata = {
      participants: [me, other],
      conversationType: 'direct', // Default to direct
    };

    // Handle listing context
    if (listingId && mongoose.Types.ObjectId.isValid(listingId)) {
      const listing = await Listing.findById(listingId);
      if (listing) {
        // Verify that the current user or the recipient is the owner of the listing
        // This logic assumes a direct chat between a potential guest and the listing owner.
        const isMeOwner = listing.owner.equals(me);
        const isOtherOwner = listing.owner.equals(other);

        // Ensure one of the participants is the owner, and the other is not the owner
        // (to prevent owner messaging themselves about their own listing via this flow).
        // Or, more simply: ensure the other user is the listing owner.
        if (!isOtherOwner) {
          return next(createError(403, 'You can only start a listing inquiry with the listing owner.'));
        }

        metadata.relatedListing = listingId;
        metadata.conversationType = 'listing'; // Changed type for listing inquiries
        metadata.title = `Inquiry about ${listing.title}`;
      } else {
        console.warn(`Listing with ID ${listingId} not found, ignoring listing context.`);
      }
    }

    // Handle booking context
    if (bookingId && mongoose.Types.ObjectId.isValid(bookingId)) {
      const booking = await Booking.findById(bookingId);
      if (booking) {
        // Verify that both participants are involved in the booking (guest or host)
        const isMeInvolved = booking.user.equals(me) || booking.host.equals(me);
        const isOtherInvolved = booking.user.equals(other) || booking.host.equals(other);

        if (!isMeInvolved || !isOtherInvolved) {
          return next(createError(403, 'You do not have permission to start a conversation about this booking.'));
        }

        metadata.relatedBooking = bookingId;
        metadata.conversationType = 'booking';
        metadata.title = `Conversation about Booking #${booking._id}`;
      } else {
        console.warn(`Booking with ID ${bookingId} not found, ignoring booking context.`);
      }
    }

    // Use the Conversation model's static findOrCreate method
    const conversation = await Conversation.findOrCreate(metadata);

    if (!conversation) {
      return next(createError(500, 'Failed to create or find conversation.'));
    }

    // Redirect to the dedicated conversation view URL
    res.redirect(`/messages/conversation/${conversation._id}`);
  } catch (err) {
    console.error('Error in GET /messages/:userId:', err);
    next(err);
  }
});

// ================== POST /messages/conversation/:conversationId — Send Message ==================
/**
 * Handles sending a new message within a specific conversation.
 * Supports text messages and file attachments.
 * Updates conversation's last message, user messaging stats, and emits real-time updates via Socket.IO.
 */
router.post('/conversation/:conversationId', isLoggedIn, canAccessConversation, upload.single('attachment'), async (req, res, next) => {
  try {
    const sender = req.user._id; // Current authenticated user's ID
    const conversation = req.conversation; // Conversation object attached by middleware

    // Find the other participant to determine the recipient of the message
    // This logic assumes a 1:1 chat for the 'recipient' field.
    // For group chats, you'd iterate through participants excluding sender.
    const recipientParticipant = conversation.participants.find(
      p => p.user && p.user._id && !p.user._id.equals(sender)
    );

    if (!recipientParticipant || !recipientParticipant.user || !recipientParticipant.user._id) {
      // This case should ideally not happen for direct/listing/booking conversations if setup correctly.
      // For group chats, this would need different logic.
      return next(createError(404, 'Recipient participant not found in conversation.'));
    }

    const recipient = recipientParticipant.user; // The actual recipient User ID
    const isFile = !!req.file; // Check if a file was uploaded
    const content = (req.body.content || '').trim(); // Get message content, trim whitespace

    // Validate that either content or an attachment is present
    if (!isFile && !content) {
      return next(createError(400, 'Message must have content or an attachment.'));
    }

    // Check if the sender is blocked by the recipient
    const recipientUser = await User.findById(recipient);
    // Assuming recipientUser.blockedUsers is an array of ObjectIds
    if (recipientUser && recipientUser.blockedUsers &&
        recipientUser.blockedUsers.some(blockedId => blockedId.equals(sender))) {
      // If the sender is in the recipient's blocked list, prevent sending
      return next(createError(403, 'You cannot send messages to this user as you are blocked.'));
    }

    // Determine the message type based on whether a file was uploaded
    let messageType = 'text';
    if (isFile) {
      const mimeType = req.file.mimetype;
      if (mimeType.startsWith('image/')) {
        messageType = 'image';
      } else {
        messageType = 'file';
      }
    }

    // Construct the message payload
    const payload = {
      conversation: conversation._id,
      sender,
      recipient, // This is specific for 1:1. For group, you might store an array or rely on conversation ID.
      messageType,
      content,
      attachment: isFile
        ? {
            url: req.file.path, // Cloudinary provides the full URL here
            filename: req.file.originalname,
            fileSize: req.file.size,
            mimeType: req.file.mimetype,
          }
        : undefined, // No attachment if not a file message
    };

    // Send the message using the Message model's static method
    const message = await Message.send(payload);

    // Update the conversation's last message and increment unread counts for recipient
    await conversation.touch(message._id, sender);

    // Update messaging statistics for both sender and recipient (assuming User model has messagingStats)
    // Consider adding error handling or ensuring these fields exist on the User model.
    await User.findByIdAndUpdate(sender, { $inc: { 'messagingStats.totalSent': 1 } }).catch(err => console.error("Failed to update sender's messaging stats:", err));
    await User.findByIdAndUpdate(recipient, { $inc: { 'messagingStats.totalReceived': 1 } }).catch(err => console.error("Failed to update recipient's messaging stats:", err));

    // --- Socket.IO Real-time Updates ---
    const io = req.app.get('io'); // Get the Socket.IO instance attached to the app

    // Emit 'newMessage' event to all clients in the conversation's room
    // This updates the chat view for both sender and recipient if they are in the chat
    io.to(conversation._id.toString()).emit('newMessage', {
      message: {
        ...message.toObject(), // Convert Mongoose document to plain object
        sender: { _id: req.user._id, username: req.user.username, avatar: req.user.avatar }, // Include sender details
        timeAgo: timeagoFormat(message.createdAt) // Add formatted time for immediate display
      }
    });

    // Emit 'messageNotification' to the specific recipient's personal room
    // Ensure recipient and its _id exist before calling toString()
    if (recipient && recipient._id) {
      io.to(recipient._id.toString()).emit('messageNotification', {
        conversationId: conversation._id,
        message: {
          _id: message._id,
          content: message.content || (message.messageType !== 'text' ? '[Attachment]' : ''), // Use message.content or placeholder
          sender: { _id: req.user._id, username: req.user.username, avatar: req.user.avatar }
        }
      });
    }

    // Handle response based on request type (AJAX vs. regular form submission)
    if (req.xhr || req.headers.accept.includes('json')) {
      // If it's an AJAX request, send JSON response
      return res.json({
        success: true,
        message: {
          ...message.toObject(),
          sender: { _id: req.user._id, username: req.user.username, avatar: req.user.avatar },
          timeAgo: timeagoFormat(message.createdAt)
        }
      });
    }

    // Otherwise, redirect back to the conversation page
    res.redirect(`/messages/conversation/${conversation._id}`);
  } catch (err) {
    console.error('Error in POST /messages/conversation/:conversationId:', err);
    // If it's an AJAX request, return error as JSON
    if (req.xhr || req.headers.accept.includes('json')) {
      return res.status(500).json({
        success: false,
        error: err.message || 'Failed to send message.'
      });
    }
    next(err); // Pass error to the next error-handling middleware
  }
});

// ================== PATCH /messages/read/:conversationId — Mark conversation as read ==================
/**
 * API endpoint to mark all unread messages in a conversation for the current user as read.
 */
router.patch('/read/:conversationId', isLoggedIn, canAccessConversation, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const conversation = req.conversation;

    // Mark messages as read using Message model's updateMany
    await Message.updateMany(
      { conversation: conversation._id, recipient: userId, readAt: null },
      { status: 'read', readAt: Date.now() }
    );

    // Update the conversation's unread count for the user
    await conversation.markReadForUser(userId);

    // Emit a socket event to notify other participants (e.g., sender) that messages were read
    const io = req.app.get('io');
    const otherParticipant = conversation.participants.find(p => p.user && p.user._id && !p.user._id.equals(userId));

    // Explicitly check if otherParticipant.user and its _id exist before calling toString()
    if (otherParticipant && otherParticipant.user && otherParticipant.user._id) {
      io.to(otherParticipant.user._id.toString()).emit('messagesRead', {
        conversationId: conversation._id.toString(),
        readBy: userId.toString() // ID of the user who read the messages
      });
    }

    res.json({ success: true, message: 'Conversation marked as read.' });
  } catch (err) {
    console.error('Error in PATCH /messages/read/:conversationId:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to mark conversation as read.' });
  }
});

// ================== PATCH /messages/archive/:conversationId — Archive conversation ==================
/**
 * API endpoint to archive a conversation for the current user.
 */
router.patch('/archive/:conversationId', isLoggedIn, canAccessConversation, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const conversation = req.conversation;

    await conversation.archiveForUser(userId); // Use the instance method

    res.json({ success: true, message: 'Conversation archived.' });
  } catch (err) {
    console.error('Error in PATCH /messages/archive/:conversationId:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to archive conversation.' });
  }
});

// ================== PATCH /messages/unarchive/:conversationId — Unarchive conversation ==================
/**
 * API endpoint to unarchive a conversation for the current user.
 */
router.patch('/unarchive/:conversationId', isLoggedIn, canAccessConversation, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const conversation = req.conversation;

    await conversation.unarchiveForUser(userId); // Use the instance method

    res.json({ success: true, message: 'Conversation unarchived.' });
  } catch (err) {
    console.error('Error in PATCH /messages/unarchive/:conversationId:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to unarchive conversation.' });
  }
});

// ================== DELETE /messages/message/:messageId — Soft Delete message for user ==================
/**
 * API endpoint to soft delete (hide) a specific message for the current user.
 * The message remains visible to other participants unless they also delete it.
 */
router.delete('/message/:messageId', isLoggedIn, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const messageId = req.params.messageId;

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ success: false, error: 'Invalid message ID format.' });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({ success: false, error: 'Message not found.' });
    }

    // Ensure the user attempting to delete is either the sender or the recipient of the message.
    if (!message.sender.equals(userId) && !message.recipient.equals(userId)) {
      return res.status(403).json({ success: false, error: 'You do not have permission to delete this message.' });
    }

    // Soft delete the message for the current user using the instance method
    await message.softDeleteForUser(userId);

    // Optionally, emit a socket event to notify the user's client that the message was hidden
    const io = req.app.get('io');
    // Emit only to the user who performed the deletion
    io.to(userId.toString()).emit('messageDeletedForUser', {
      messageId: message._id.toString(),
      conversationId: message.conversation.toString()
    });

    res.json({ success: true, message: 'Message deleted for your view.' });
  } catch (err) {
    console.error('Error in DELETE /messages/message/:messageId:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to delete message.' });
  }
});

module.exports = router;
