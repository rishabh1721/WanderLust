// models/listing.js
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const { isURL } = require('validator');

// Default image if none provided
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

// Listing Schema
const listingSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Listing title is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    images: [
      {
        url: {
          type: String,
          default: DEFAULT_IMAGE,
          validate: {
            validator: (v) =>
              isURL(v, { protocols: ["http", "https"], require_protocol: true }),
            message: (props) => `${props.value} is not a valid URL!`,
          },
        },
        caption: {
          type: String,
          default: "",
        }
      },
    ],
    price: {
      type: Number,
      required: [true, "Price per night is required"],
      min: [0, "Price must be a positive number"],
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    // Optional: More precise location for maps
    coordinates: {
      lat: Number,
      lng: Number,
    },
    guests: {
      type: Number,
      default: 1,
      min: [1, "At least one guest required"],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Listing owner is required"],
    },
    amenities: {
      type: [String],
      enum: ["Wi-Fi", "TV", "Air Conditioning", "Kitchen", "Parking", 
             "Washer", "Dryer", "Pool", "Hot Tub", "Gym", "Elevator",
             "Wheelchair Accessible", "Smoke Alarm", "Carbon Monoxide Alarm"],
      default: [],
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
    // Messaging and availability features
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending_review'],
      default: 'active',
    },
    instantBooking: {
      type: Boolean,
      default: false,
    },
    hostResponseTime: {
      type: Number, // Average response time in minutes
      default: null,
    },
    hostResponseRate: {
      type: Number, // Percentage of inquiries responded to
      default: null,
    },
    availability: {
      type: [{
        startDate: Date,
        endDate: Date,
        booked: Boolean
      }],
      default: [],
    },
    bookingRequests: [{
      type: Schema.Types.ObjectId,
      ref: 'Booking'
    }],
    // Conversation stats (for display in listings)
    messageStats: {
      totalInquiries: {
        type: Number, 
        default: 0
      },
      averageResponseTime: {
        type: Number, // in minutes
        default: null
      }
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Enhanced indexes for better search performance
listingSchema.index({ location: 1 });
listingSchema.index({ country: 1 });
listingSchema.index({ price: 1 });
listingSchema.index({ "owner": 1 });
listingSchema.index({ "coordinates.lat": 1, "coordinates.lng": 1 }, { sparse: true });
listingSchema.index({ status: 1, price: 1 }); // For filtering active listings by price
listingSchema.index({ amenities: 1 }); // For filtering by amenities

// Virtuals
listingSchema.virtual("averageRating").get(function () {
  if (!this.reviews || !this.reviews.length) return null;
  const sum = this.reviews.reduce((total, rev) => total + (rev.rating || 0), 0);
  return sum / this.reviews.length;
});

listingSchema.virtual("reviewCount").get(function () {
  return this.reviews ? this.reviews.length : 0;
});

// Virtual for conversations related to this listing
listingSchema.virtual('conversations', {
  ref: 'Conversation',
  localField: '_id',
  foreignField: 'relatedListing',
  options: { sort: { updatedAt: -1 } }
});

// Pre-save: Ensure at least one image
listingSchema.pre("save", function (next) {
  if (!this.images || this.images.length === 0) {
    this.images = [{ url: DEFAULT_IMAGE }];
  }
  next();
});

// Auto-populate reviews when fetching listings
function autoPopulateReviews(next) {
  this.populate("reviews");
  next();
}

listingSchema.pre("findOne", autoPopulateReviews);
listingSchema.pre("find", autoPopulateReviews);

// Static: Update host response metrics when messages are processed
listingSchema.statics.updateHostResponseMetrics = async function(hostId) {
  // This would be called when a host responds to a message
  try {
    // Get all listings by this host
    const listings = await this.find({ owner: hostId });
    const listingIds = listings.map(listing => listing._id);
    
    // You'd need to inject your Message model here
    const Message = mongoose.model('Message');
    
    // Calculate metrics across conversations for these listings
    const conversations = await mongoose.model('Conversation').find({
      relatedListing: { $in: listingIds }
    });
    
    // For each listing, update response metrics
    for (const listing of listings) {
      const listingConversations = conversations.filter(
        convo => convo.relatedListing && convo.relatedListing.equals(listing._id)
      );
      
      if (listingConversations.length === 0) continue;
      
      // Example calculation - you'd want to customize this based on your needs
      const responseTimes = [];
      
      for (const convo of listingConversations) {
        const messages = await Message.find({ conversation: convo._id }).sort('createdAt');
        
        // Calculate response times for this conversation
        let lastGuestMessage = null;
        for (const msg of messages) {
          const isFromHost = msg.sender.equals(hostId);
          
          if (!isFromHost && !lastGuestMessage) {
            lastGuestMessage = msg;
          } else if (isFromHost && lastGuestMessage) {
            // Calculate response time
            const responseTime = (msg.createdAt - lastGuestMessage.createdAt) / (1000 * 60); // in minutes
            responseTimes.push(responseTime);
            lastGuestMessage = null;
          }
        }
      }
      
      // Update listing metrics
      if (responseTimes.length > 0) {
        const avgResponseTime = responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length;
        
        listing.messageStats.totalInquiries = listingConversations.length;
        listing.messageStats.averageResponseTime = Math.round(avgResponseTime);
        listing.hostResponseTime = Math.round(avgResponseTime);
        
        // Calculate response rate (responded conversations / total conversations)
        const respondedConvos = listingConversations.filter(convo => {
          return convo.participants.some(p => 
            p.user.equals(hostId) && p.lastViewedAt !== null
          );
        });
        
        listing.hostResponseRate = (respondedConvos.length / listingConversations.length) * 100;
        
        await listing.save();
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating host metrics:', error);
    return false;
  }
};

// Method to find all inquiries (conversations) for this listing
listingSchema.methods.findInquiries = function() {
  return mongoose.model('Conversation').find({
    relatedListing: this._id
  })
  .populate('participants.user', 'name email avatar')
  .populate('lastMessage')
  .sort({ updatedAt: -1 });
};

// ✅ Export model safely
module.exports = mongoose.models.Listing || mongoose.model("Listing", listingSchema);