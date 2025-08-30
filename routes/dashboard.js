// routes/dashboard.js - Final Version

const express = require('express');
const router = express.Router();
const Booking = require('../models/booking');
const Listing = require('../models/listing');
const Conversation = require('../models/conversation');
const Message = require('../models/message');
const { isLoggedIn } = require('../middleware'); // Assuming this middleware exists for authentication
const wrapAsync = require('../utils/wrapAsync'); // Utility for handling async errors
const { format: timeagoFormat } = require('timeago.js'); // For formatting timestamps

// ================== Helper Functions ==================
/**
 * Formats conversation documents for display in dashboard previews.
 * Extracts relevant information and populates user details.
 * @param {Array<Conversation>} conversations - Array of raw conversation documents.
 * @param {ObjectId|string} currentUserId - The ID of the currently logged-in user.
 * @returns {Array<object>} An array of formatted conversation objects.
 */
function formatConversationsForDisplay(conversations, currentUserId) {
  return conversations.map(convo => {
    // Find the other participant (not the current user)
    // Access `p.user._id` because `participants.user` is populated
    const otherParticipantEntry = convo.participants.find(p => 
      !p.user._id.equals(currentUserId)
    );
    
    // Get user-specific data for the current user from the participants array
    const currentUserParticipantEntry = convo.participants.find(p => 
      p.user._id.equals(currentUserId)
    );
    
    // If for some reason the other participant is not found or their user data is missing, skip this conversation
    if (!otherParticipantEntry || !otherParticipantEntry.user) {
      console.warn(`Skipping conversation ${convo._id} due to missing other participant data.`);
      return null;
    }
    
    // Format for display
    const formatted = {
      _id: convo._id,
      // Populate otherUser details for display
      otherUser: {
        _id: otherParticipantEntry.user._id,
        username: otherParticipantEntry.user.username,
        avatar: otherParticipantEntry.user.avatar,
        fullName: otherParticipantEntry.user.fullName, // Assuming fullName is populated
      },
      // User-specific conversation data
      unreadCount: currentUserParticipantEntry ? currentUserParticipantEntry.unreadCount : 0,
      isArchived: currentUserParticipantEntry ? currentUserParticipantEntry.isArchived : false,
      updatedAt: convo.updatedAt,
      timeAgo: timeagoFormat(convo.updatedAt),
      conversationType: convo.conversationType,
      title: convo.title,
      // Related listing and booking info (if populated and available)
      relatedListing: convo.relatedListing ? {
        _id: convo.relatedListing._id,
        title: convo.relatedListing.title,
        images: convo.relatedListing.images,
      } : null,
      relatedBooking: convo.relatedBooking ? {
        _id: convo.relatedBooking._id,
        startDate: convo.relatedBooking.startDate,
        endDate: convo.relatedBooking.endDate,
        status: convo.relatedBooking.status,
      } : null,
    };
    
    // Add last message info if available
    if (convo.lastMessage) {
      formatted.lastMessage = {
        content: convo.lastMessage.content ? (convo.lastMessage.content.length > 50 ? convo.lastMessage.content.substring(0, 50) + '...' : convo.lastMessage.content) : '[Attachment]', // Display content or placeholder
        sender: convo.lastMessage.sender ? { // Populate sender details for last message
          _id: convo.lastMessage.sender._id,
          username: convo.lastMessage.sender.username,
          avatar: convo.lastMessage.sender.avatar,
        } : null,
        createdAt: convo.lastMessage.createdAt,
        timeAgo: timeagoFormat(convo.lastMessage.createdAt), // Format time for display
        // Corrected comparison for `isFromCurrentUser`
        isFromCurrentUser: (convo.lastMessage.sender && convo.lastMessage.sender._id) ? 
                           convo.lastMessage.sender._id.toString() === currentUserId.toString() : false,
        messageType: convo.lastMessage.messageType,
        attachment: convo.lastMessage.attachment,
      };
    }
    
    return formatted;
  }).filter(Boolean); // Remove any null entries that resulted from missing participant data
}

// ================== Guest Dashboard ==================
/**
 * Renders the guest user's dashboard.
 * Displays recent bookings and a preview of recent, unarchived conversations.
 */
router.get('/guest', isLoggedIn, wrapAsync(async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // Get bookings with pagination for the current guest
  const totalBookings = await Booking.countDocuments({ user: userId });
  const totalPages = Math.ceil(totalBookings / limit);
  
  const bookings = await Booking.find({ user: userId })
    .populate({
      path: 'listing', // Populate the listing first
      select: 'title location images price owner', // Select necessary listing fields including owner
      populate: { // Then populate the owner (host) within the listing
        path: 'owner',
        select: 'username avatar' // Select necessary owner (host) fields
      }
    })
    // Removed direct .populate('host') as host is accessed via listing.owner
    .sort('-createdAt') // Sort by most recent booking
    .skip(skip)
    .limit(limit)
    .exec();
  
  // Get total unread message count for notification badge
  // Filter messages that are not soft-deleted by the current user
  const unreadMessageCount = await Message.countDocuments({
    recipient: userId,
    readAt: null,
    deletedFor: { $ne: userId } // Exclude messages soft-deleted by this user
  });
  
  // Get recent conversations for the guest (limit to 3 for dashboard preview)
  // Filter for conversations that are NOT archived for the current user
  const recentConversations = await Conversation.find({ 
    'participants.user': userId,
    'participants': { $elemMatch: { user: userId, isArchived: false } } // Ensure not archived for current user
  })
    .populate('participants.user', 'username avatar fullName') // Populate user details for participants
    .populate({
      path: 'lastMessage',
      // Ensure the last message displayed is not soft-deleted by the current user
      match: { deletedFor: { $ne: userId } }, 
      populate: { path: 'sender', select: 'username avatar' } // Populate sender of the last message
    })
    .populate('relatedListing', 'title images') // Populate relevant listing details for context
    .populate('relatedBooking', 'startDate endDate status') // Populate relevant booking details for context
    .sort('-updatedAt') // Sort by most recent activity
    .limit(3)
    .lean(); // Return plain JavaScript objects
  
  // Format conversations for display in the EJS template
  const formattedConversations = formatConversationsForDisplay(recentConversations, userId);
  
  res.render("dashboard/guest", { 
    bookings,
    conversations: formattedConversations,
    unreadMessageCount,
    pagination: {
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
}));

// ================== Host Dashboard ==================
/**
 * Renders the host user's dashboard.
 * Displays their listings, booking statistics, and a preview of recent, unarchived conversations.
 */
router.get('/host', isLoggedIn, wrapAsync(async (req, res) => {
  const userId = req.user._id;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  // 1. Fetch listings owned by this user
  const listings = await Listing.find({ owner: userId }).exec();
  const listingIds = listings.map(l => l._id);
  
  // 2. Fetch total booking count for listings owned by this user
  const totalBookings = await Booking.countDocuments({ listing: { $in: listingIds } });
  const totalPages = Math.ceil(totalBookings / limit);
  
  // 3. Fetch bookings with pagination for listings owned by this user
  const bookings = await Booking.find({ listing: { $in: listingIds } })
    .populate('listing', 'title location images price') // Populate relevant listing details
    .populate('user', 'username avatar email') // Populate guest user details
    .sort('-createdAt') // Sort by most recent booking
    .skip(skip)
    .limit(limit)
    .exec();
  
  // 4. Get total unread message count for notification badge
  // Filter messages that are not soft-deleted by the current user
  const unreadMessageCount = await Message.countDocuments({
    recipient: userId,
    readAt: null,
    deletedFor: { $ne: userId } // Exclude messages soft-deleted by this user
  });
  
  // 5. Fetch recent conversations for the host (limit to 5 for dashboard preview)
  // Filter for conversations that are NOT archived for the current user
  const recentConversations = await Conversation.find({ 
    'participants.user': userId,
    'participants': { $elemMatch: { user: userId, isArchived: false } } // Ensure not archived for current user
  })
    .populate('participants.user', 'username avatar fullName') // Populate user details for participants
    .populate({
      path: 'lastMessage',
      // Ensure the last message displayed is not soft-deleted by the current user
      match: { deletedFor: { $ne: userId } }, 
      populate: { path: 'sender', select: 'username avatar' } // Populate sender of the last message
    })
    .populate('relatedListing', 'title images') // Populate relevant listing details for context
    .populate('relatedBooking', 'startDate endDate status') // Populate relevant booking details for context
    .sort('-updatedAt') // Sort by most recent activity
    .limit(5)
    .lean(); // Return plain JavaScript objects
  
  // Format conversations for display in the EJS template
  const formattedConversations = formatConversationsForDisplay(recentConversations, userId);
  
  // 6. Get booking statistics for listings owned by this user
  const pendingBookings = await Booking.countDocuments({ 
    listing: { $in: listingIds },
    status: 'pending'
  });
  
  const confirmedBookings = await Booking.countDocuments({ 
    listing: { $in: listingIds },
    status: 'confirmed'
  });
  
  const cancelledBookings = await Booking.countDocuments({ 
    listing: { $in: listingIds },
    status: 'cancelled'
  });
  
  // 7. Render host dashboard with all the data
  res.render("dashboard/host", { 
    listings, 
    bookings,
    conversations: formattedConversations,
    unreadMessageCount,
    stats: {
      totalListings: listings.length,
      pendingBookings,
      confirmedBookings,
      cancelledBookings
    },
    pagination: {
      currentPage: page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  });
}));

module.exports = router;
