const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  fullName: {
    type: String,
    default: "",
  },
  avatar: {
    type: String,
    default: "/images/10491837.jpg",
  },
  phoneNumber: {
    type: String,
    default: "",
  },
  roles: {
    isGuest: {
      type: Boolean,
      default: true,
    },
    isHost: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
  },
  bio: {
    type: String,
    default: "",
  },
  location: {
    type: String,
    default: "",
  },
  languages: [String],
  // Messaging preferences
  messagingPreferences: {
    emailNotifications: {
      newMessage: {
        type: Boolean,
        default: true,
      },
      bookingRequests: {
        type: Boolean,
        default: true,
      },
      messageReminders: {
        type: Boolean,
        default: true,
      },
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    autoReply: {
      enabled: {
        type: Boolean,
        default: false,
      },
      message: {
        type: String,
        default: "Thanks for your message! I'll get back to you as soon as possible.",
      },
    },
    availability: {
      type: String,
      enum: ["always", "limited", "unavailable"],
      default: "always",
    },
  },
  // Online status tracking
  isOnline: {
    type: Boolean,
    default: false,
  },
  lastActive: {
    type: Date,
    default: Date.now,
  },
  lastSeen: {
    type: Date,
  },
  // Messaging metrics
  messagingStats: {
    responseRate: {
      type: Number, // percentage
      default: 100,
    },
    responseTime: {
      type: Number, // average in minutes
      default: 0,
    },
    totalConversations: {
      type: Number,
      default: 0,
    },
    unreadMessages: {
      type: Number,
      default: 0,
    },
  },
  // Profile completeness
  profileComplete: {
    type: Boolean,
    default: false,
  },
  // Account verification
  verified: {
    email: {
      type: Boolean,
      default: false,
    },
    phone: {
      type: Boolean,
      default: false,
    },
    identity: {
      type: Boolean,
      default: false,
    },
  },
  // Block list for messaging
  blockedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
  }],
  // User settings
  settings: {
    theme: {
      type: String,
      enum: ["light", "dark", "system"],
      default: "system",
    },
    language: {
      type: String,
      default: "en",
    },
    timezone: {
      type: String,
      default: "UTC",
    },
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual for hosted listings
userSchema.virtual('listings', {
  ref: 'Listing',
  localField: '_id',
  foreignField: 'owner',
});

// Virtual for bookings as guest
userSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'guest',
});

// Virtual for active conversations
userSchema.virtual('conversations', {
  ref: 'Conversation',
  localField: '_id',
  foreignField: 'participants.user',
});

// Method to check if user has blocked another user
userSchema.methods.hasBlocked = function(userId) {
  return this.blockedUsers.some(id => id.equals(userId));
};

// Method to block a user
userSchema.methods.blockUser = function(userId) {
  if (!this.hasBlocked(userId)) {
    this.blockedUsers.push(userId);
  }
  return this.save();
};

// Method to unblock a user
userSchema.methods.unblockUser = function(userId) {
  this.blockedUsers = this.blockedUsers.filter(id => !id.equals(userId));
  return this.save();
};

// Method to update last activity
userSchema.methods.updateActivity = function() {
  this.lastActive = new Date();
  this.lastSeen = new Date();
  return this.save();
};

// Method to set online status
userSchema.methods.setOnlineStatus = function(status) {
  this.isOnline = status;
  if (status === false) {
    this.lastSeen = new Date();
  }
  return this.save();
};

// Method to update messaging stats
userSchema.methods.updateMessagingStats = async function() {
  try {
    const Message = mongoose.model('Message');
    const Conversation = mongoose.model('Conversation');
    
    // Get all conversations where user is a participant
    const conversations = await Conversation.find({
      'participants.user': this._id
    });
    
    if (conversations.length === 0) {
      return this;
    }
    
    // Count unread messages
    let unreadCount = 0;
    for (const convo of conversations) {
      const participant = convo.participants.find(p => 
        p.user.toString() === this._id.toString()
      );
      
      if (participant) {
        unreadCount += participant.unreadCount || 0;
      }
    }
    
    // Calculate response metrics (only applicable for hosts)
    if (this.roles.isHost) {
      const conversationIds = conversations.map(c => c._id);
      
      // Get all messages in these conversations
      const messages = await Message.find({
        conversation: { $in: conversationIds }
      }).sort('createdAt');
      
      // Group messages by conversation
      const messagesByConvo = {};
      messages.forEach(msg => {
        if (!messagesByConvo[msg.conversation]) {
          messagesByConvo[msg.conversation] = [];
        }
        messagesByConvo[msg.conversation].push(msg);
      });
      
      // Calculate response times
      let totalResponseTime = 0;
      let responsesCount = 0;
      let responsedConversations = 0;
      
      for (const convoId in messagesByConvo) {
        const convoMessages = messagesByConvo[convoId];
        let responded = false;
        let lastGuestMessage = null;
        
        for (const msg of convoMessages) {
          const isFromUser = msg.sender.equals(this._id);
          
          if (!isFromUser && !lastGuestMessage) {
            lastGuestMessage = msg;
          } else if (isFromUser && lastGuestMessage) {
            // Calculate response time
            const responseTime = (msg.createdAt - lastGuestMessage.createdAt) / (1000 * 60); // in minutes
            totalResponseTime += responseTime;
            responsesCount++;
            responded = true;
            lastGuestMessage = null;
          }
        }
        
        if (responded) {
          responsedConversations++;
        }
      }
      
      // Update stats
      if (responsesCount > 0) {
        this.messagingStats.responseTime = Math.round(totalResponseTime / responsesCount);
      }
      
      if (conversations.length > 0) {
        this.messagingStats.responseRate = Math.round((responsedConversations / conversations.length) * 100);
      }
    }
    
    // Update stats
    this.messagingStats.totalConversations = conversations.length;
    this.messagingStats.unreadMessages = unreadCount;
    
    await this.save();
    return this;
  } catch (error) {
    console.error('Error updating messaging stats:', error);
    return this;
  }
};

// Check profile completeness
userSchema.pre('save', function(next) {
  // Consider profile complete if these fields are filled
  const requiredFields = ['fullName', 'avatar', 'email'];
  const hostRequiredFields = [...requiredFields, 'phoneNumber', 'bio'];
  
  const fieldsToCheck = this.roles.isHost ? hostRequiredFields : requiredFields;
  
  let complete = true;
  for (const field of fieldsToCheck) {
    if (!this[field] || (typeof this[field] === 'string' && this[field].trim() === '')) {
      complete = false;
      break;
    }
  }
  
  this.profileComplete = complete;
  next();
});

// Improved authentication with passport
userSchema.plugin(passportLocalMongoose, { 
  usernameField: "email",
  usernameLowerCase: true, // Always convert email to lowercase
  limitAttempts: true,
  maxAttempts: 5,
  attemptsField: 'loginAttempts',
  interval: 100,
  maxInterval: 300000,
  unlockInterval: 3600000
});

// ✅ Prevent OverwriteModelError
module.exports = mongoose.models.User || mongoose.model("User", userSchema);