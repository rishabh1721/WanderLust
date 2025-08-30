// socketHandler.js
const Message = require('./models/message'); // Assuming your Message model path
const Conversation = require('./models/conversation'); // Assuming your Conversation model path
const User = require('./models/user'); // Assuming your User model path
const mongoose = require('mongoose'); // <--- ADDED: Import mongoose

let io; // Declare io variable to be accessible globally within this module

module.exports = {
    init: (httpServer) => {
        io = require('socket.io')(httpServer, {
            cors: {
                origin: "*", // IMPORTANT: Adjust this to your frontend URL in production for security
                methods: ["GET", "POST"]
            }
        });

        // Middleware for Socket.IO to attach user to socket (if using Passport.js sessions)
        io.use(async (socket, next) => {
            const session = socket.request.session; // Access the session from the underlying HTTP request

            if (session && session.passport && session.passport.user) {
                try {
                    // Log the value to understand what's being stored in session.passport.user
                    console.log('session.passport.user:', session.passport.user, 'Type:', typeof session.passport.user);

                    let user;
                    // Attempt to find user by _id first (standard Passport.js behavior)
                    if (mongoose.Types.ObjectId.isValid(session.passport.user)) {
                        user = await User.findById(session.passport.user);
                    } else {
                        // If it's not a valid ObjectId, assume it's an email and try to find by email
                        user = await User.findOne({ email: session.passport.user });
                    }

                    if (user) {
                        socket.request.user = user; // Attach the user object to the socket's request
                        console.log(`Socket ${socket.id} authenticated as user: ${user.username}`);
                        // Join a personal room for the authenticated user for direct notifications
                        socket.join(user._id.toString());
                        next();
                    } else {
                        console.log(`Socket ${socket.id} - User not found for session data: ${session.passport.user}`);
                        next(new Error('Authentication error: User not found.'));
                    }
                } catch (error) {
                    console.error('Socket authentication error:', error);
                    next(new Error('Authentication error: Could not retrieve user.'));
                }
            } else {
                console.log(`Socket ${socket.id} - Unauthenticated connection.`);
                next(); // Allow unauthenticated connections for now, but features will be limited
            }
        });


        io.on('connection', socket => {
            console.log('A user connected:', socket.id);

            // Emit the user's ID to the client upon successful connection/authentication
            if (socket.request.user) {
                socket.emit('connected', { userId: socket.request.user._id.toString() });
            }

            // Client joins a specific conversation room
            socket.on('joinConversation', async (conversationId) => {
                // Ensure user is authenticated and is a participant in the conversation
                if (!socket.request.user) {
                    console.warn(`Socket ${socket.id} tried to join conversation ${conversationId} without authentication.`);
                    return socket.emit('error', 'Authentication required to join conversation.');
                }

                try {
                    const conversation = await Conversation.findById(conversationId);
                    if (!conversation || !conversation.includesUser(socket.request.user._id)) {
                        console.warn(`User ${socket.request.user._id} tried to join non-existent or unauthorized conversation ${conversationId}`);
                        return socket.emit('error', 'Conversation not found or unauthorized.');
                    }

                    socket.join(conversationId);
                    console.log(`User ${socket.request.user.username} (Socket ${socket.id}) joined conversation: ${conversationId}`);

                    // Mark messages as read for the current user when they join the conversation room
                    await Message.updateMany(
                        { conversation: conversationId, recipient: socket.request.user._id, status: { $ne: 'read' } },
                        { $set: { status: 'read', readAt: Date.now() } }
                    );

                    // Reset unread count for this participant in the conversation
                    await conversation.markReadForUser(socket.request.user._id);

                    // Emit 'messagesRead' event to all clients in the conversation room
                    // This will update read receipts for the sender in real-time
                    io.to(conversationId).emit('messagesRead', {
                        conversationId: conversationId,
                        readBy: socket.request.user._id.toString()
                    });

                } catch (error) {
                    console.error(`Error joining conversation ${conversationId}:`, error);
                    socket.emit('error', 'Failed to join conversation.');
                }
            });

            // Client leaves a specific conversation room
            socket.on('leaveConversation', (conversationId) => {
                socket.leave(conversationId);
                console.log(`User ${socket.request.user ? socket.request.user.username : 'Unknown'} (Socket ${socket.id}) left conversation: ${conversationId}`);
            });

            // Typing indicator event
            socket.on('typing', ({ conversationId }) => {
                if (!socket.request.user) return; // Must be authenticated
                // Emit typing event to all other clients in the conversation room
                socket.to(conversationId).emit('typing', {
                    conversationId: conversationId,
                    userId: socket.request.user._id.toString(),
                    username: socket.request.user.username // Send username for display
                });
            });

            // Stopped typing indicator event
            socket.on('stoppedTyping', ({ conversationId }) => {
                if (!socket.request.user) return; // Must be authenticated
                // Emit stopped typing event to all other clients in the conversation room
                socket.to(conversationId).emit('stoppedTyping', {
                    conversationId: conversationId,
                    userId: socket.request.user._id.toString(),
                    username: socket.request.user.username // Send username for display
                });
            });

            // Handle 'markRead' event from client (used for marking messages read without joining room, e.g., from inbox)
            socket.on('markRead', async ({ conversationId }) => {
                if (!socket.request.user) {
                    console.warn(`Socket ${socket.id} tried to mark messages read without authentication.`);
                    return socket.emit('error', 'Authentication required to mark messages as read.');
                }
                const userId = socket.request.user._id; // User who marked messages as read
                console.log(`User ${userId} marked messages in ${conversationId} as read.`);

                try {
                    // Mark messages in the database as read
                    await Message.updateMany(
                        { conversation: conversationId, recipient: userId, readAt: null },
                        { $set: { status: 'read', readAt: Date.now() } }
                    );

                    // Reset unread count for this participant in the conversation
                    const conversation = await Conversation.findById(conversationId);
                    if (conversation) {
                        await conversation.markReadForUser(userId);
                    }

                    // Emit 'messagesRead' event to all clients in the conversation room (if any are listening)
                    // and also to the specific user's personal room (for other devices/tabs)
                    io.to(conversationId).emit('messagesRead', {
                        conversationId: conversationId,
                        readBy: userId.toString()
                    });
                    io.to(userId.toString()).emit('messagesRead', { // Emit to personal room
                        conversationId: conversationId,
                        readBy: userId.toString()
                    });

                } catch (error) {
                    console.error(`Error marking messages in conversation ${conversationId} as read for user ${userId}:`, error);
                    socket.emit('error', 'Failed to mark messages as read.');
                }
            });

            // Handle message deletion from client
            socket.on('deleteMessageForUser', async ({ messageId, conversationId }) => {
                if (!socket.request.user) {
                    console.warn(`Socket ${socket.id} tried to delete message without authentication.`);
                    return socket.emit('error', 'Authentication required to delete messages.');
                }
                const userId = socket.request.user._id;

                try {
                    const message = await Message.findById(messageId);
                    if (!message) {
                        return socket.emit('error', 'Message not found.');
                    }

                    // Ensure user is authorized to soft-delete this message (sender or recipient)
                    if (message.sender.toString() !== userId.toString() && message.recipient.toString() !== userId.toString()) {
                        return socket.emit('error', 'Unauthorized to delete this message.');
                    }

                    await message.softDeleteForUser(userId);
                    console.log(`Message ${messageId} soft-deleted by user ${userId}`);

                    // Emit to the conversation room so other clients can update their UI
                    io.to(conversationId).emit('messageDeletedForUser', {
                        messageId: messageId,
                        conversationId: conversationId,
                        deletedBy: userId.toString()
                    });
                    // Also emit to the deleting user's personal room for multi-device sync
                    io.to(userId.toString()).emit('messageDeletedForUser', {
                        messageId: messageId,
                        conversationId: conversationId,
                        deletedBy: userId.toString()
                    });

                } catch (error) {
                    console.error(`Error deleting message ${messageId} for user ${userId}:`, error);
                    socket.emit('error', 'Failed to delete message.');
                }
            });

            socket.on('disconnect', () => {
                console.log('User disconnected:', socket.id);
                // In a real app, you'd update user's online status in DB here
                // and emit 'userOffline' event.
            });

            socket.on('error', (err) => {
                console.error('Socket error:', err);
            });
        });
        return io;
    },
    getIo: () => {
        if (!io) {
            throw new Error('Socket.IO not initialized! Call init(httpServer) first.');
        }
        return io;
    }
};
