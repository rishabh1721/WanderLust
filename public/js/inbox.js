// public/js/inbox.js - Enhanced Version
document.addEventListener('DOMContentLoaded', () => {
    // Ensure Socket.IO client library is loaded in your EJS template (e.g., boilerplate.ejs or chat.ejs)
    // Example: <script src="/socket.io/socket.io.js"></script>
    // Also ensure timeago.js is loaded: <script src="https://cdnjs.cloudflare.com/ajax/libs/timeago.js/4.0.2/timeago.min.js"></script>

    const socket = io(); // Connect to the Socket.IO server
    const inboxList = document.getElementById('inbox-list'); // Element containing conversation cards
    const globalUnreadBadge = document.getElementById('unread-message-count-badge'); // Global unread count badge (e.g., in header)

    // --- Helper Functions ---

    /**
     * Updates or creates a conversation card in the inbox list.
     * This function is crucial for real-time updates without full page reloads.
     * @param {object} conversationData - The conversation data received from the server.
     */
    function updateConversationCard(conversationData) {
        let card = inboxList.querySelector(`.conversation-card[data-conversation-id="${conversationData._id}"]`);
        const isNewCard = !card;

        if (isNewCard) {
            card = document.createElement('a');
            card.href = `/messages/conversation/${conversationData._id}`;
            card.classList.add('conversation-card', 'message-card');
            card.dataset.conversationId = conversationData._id;
            // Prepend new cards to ensure the most recent conversations are at the top
            inboxList.prepend(card);
        }

        // Determine the other user's details for display
        const otherUserAvatar = (conversationData.otherUser && conversationData.otherUser.avatar && conversationData.otherUser.avatar.trim() !== '') ?
                                conversationData.otherUser.avatar : '/images/default-avatar.png';
        const otherUsername = (conversationData.otherUser && conversationData.otherUser.username) ?
                              conversationData.otherUser.username : 'Unknown User';

        // Format the last message snippet
        let lastMessageSnippet = '[No messages yet]';
        if (conversationData.lastMessage) {
            if (conversationData.lastMessage.content) {
                lastMessageSnippet = conversationData.lastMessage.content.length > 50 ?
                                     conversationData.lastMessage.content.substring(0, 50) + '...' :
                                     conversationData.lastMessage.content;
            } else if (conversationData.lastMessage.messageType !== 'text') {
                lastMessageSnippet = `[Attachment: ${conversationData.lastMessage.filename || conversationData.lastMessage.mimeType.split('/')[0]}]`;
            }
        } else if (conversationData.lastMessageSnippet) { // Fallback for notification data
             lastMessageSnippet = conversationData.lastMessageSnippet;
        }

        // Get unread count for the current user from the conversation data
        // This assumes conversationData includes the participant subdocument for the current user
        const currentUserParticipant = conversationData.participants ?
            conversationData.participants.find(p => p.user && p.user._id && p.user._id.toString() === conversationData.currentUserId) :
            null;
        const unreadCount = currentUserParticipant ? currentUserParticipant.unreadCount : (conversationData.unreadCount || 0); // Fallback for notification data

        const unreadBadgeHtml = unreadCount > 0 ?
            `<span class="badge bg-danger ms-auto" aria-label="${unreadCount} unread messages">${unreadCount}</span>` : '';

        let contextDetailsHtml = '';
        if (conversationData.relatedListing) {
            contextDetailsHtml += `
                <div class="context-item">
                    <i class="fas fa-home me-1"></i> About: <a href="/listings/${conversationData.relatedListing._id}" class="text-decoration-none text-dark">${conversationData.relatedListing.title}</a>
                </div>
            `;
        }
        if (conversationData.relatedBooking) {
            contextDetailsHtml += `
                <div class="context-item">
                    <i class="fas fa-calendar-alt me-1"></i> Booking: ${new Date(conversationData.relatedBooking.startDate).toLocaleDateString()} - ${new Date(conversationData.relatedBooking.endDate).toLocaleDateString()}
                </div>
            `;
        }

        // Use timeago.js for formatting, fallback to custom if not available
        const timeAgoText = conversationData.updatedAt ?
                            (typeof timeago !== 'undefined' ? timeago.format(conversationData.updatedAt) : formatTimeAgo(conversationData.updatedAt)) :
                            '';

        card.innerHTML = `
            <div class="message-body">
                <div class="message-header d-flex align-items-center">
                    <img
                        src="${otherUserAvatar}"
                        alt="${otherUsername}'s avatar"
                        class="rounded-circle me-3"
                        onerror="this.onerror=null;this.src='/images/default-avatar.png';"
                        loading="lazy"
                        width="50" height="50"
                    >
                    <h5 class="mb-0 me-auto">${otherUsername}</h5>
                    ${unreadBadgeHtml}
                </div>
                <p class="message-content-preview text-muted mt-2 mb-1">
                    ${lastMessageSnippet}
                </p>
                <div class="context-details small text-secondary">
                    ${contextDetailsHtml}
                </div>
                <div class="message-time small text-end text-muted">${timeAgoText}</div>
            </div>
        `;

        // If it's an existing card and the last message changed, re-order to top
        if (!isNewCard && conversationData.lastMessage && conversationData.lastMessage._id !== card.dataset.lastMessageId) {
             inboxList.prepend(card);
        }
        // Update the data-last-message-id attribute for future checks
        if (conversationData.lastMessage && conversationData.lastMessage._id) {
            card.dataset.lastMessageId = conversationData.lastMessage._id;
        }
    }

    /**
     * Helper function to format time ago (fallback if timeago.js is not loaded).
     * @param {string|Date} dateInput - The date string or Date object.
     * @returns {string} Formatted time ago string.
     */
    function formatTimeAgo(dateInput) {
        const date = new Date(dateInput);
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

    /**
     * Displays a custom message box for user feedback.
     * @param {string} message - The message to display.
     * @param {string} type - 'success', 'error', 'info'. (Optional, for styling)
     */
    function showMessageBox(message, type = 'info') {
        if (messageBoxText && customMessageBox) {
            messageBoxText.textContent = message;
            customMessageBox.className = `custom-message-box ${type}`; // Apply type for styling
            customMessageBox.style.display = 'block';
            setTimeout(() => {
                customMessageBox.style.display = 'none';
            }, 5000);
        } else {
            console.warn('Custom message box elements not found. Falling back to console.log:', message);
        }
    }

    // Close button for custom message box
    if (messageBoxCloseBtn) {
        messageBoxCloseBtn.addEventListener('click', () => {
            if (customMessageBox) {
                customMessageBox.style.display = 'none';
            }
        });
    }

    // --- Socket.IO Event Handlers ---

    // 1. Listen for new message notifications (when a message is sent to the current user)
    socket.on('messageNotification', async (notificationData) => {
        console.log('New message notification received for inbox:', notificationData);
        // notificationData will contain: { conversationId, message: { _id, content, sender: { _id, username, avatar } } }
        // We need to fetch the full conversation data to update the card accurately.

        try {
            const response = await fetch(`/api/conversations/${notificationData.conversationId}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest' // Indicate AJAX request
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const conversation = await response.json();
            // Ensure the fetched conversation has the current user's ID for proper participant data extraction
            conversation.currentUserId = socket.id; // Assuming socket.id is used as currentUserId for this client
            // IMPORTANT: The backend should return `currentUserId` in the populated `conversation` object
            // or you need to pass it from your EJS template as a global JS variable.
            // For now, let's assume `req.user._id` is available in your EJS and passed as a global JS variable.
            // Let's assume a global `CURRENT_USER_ID` variable is set in the EJS template.
            conversation.currentUserId = typeof CURRENT_USER_ID !== 'undefined' ? CURRENT_USER_ID : null;


            if (conversation) {
                updateConversationCard(conversation);
                // Optionally, trigger a visual notification (e.g., desktop notification, sound)
                if (document.visibilityState === 'hidden') {
                    new Notification('New Message', {
                        body: `${conversation.otherUser.username}: ${notificationData.message.content || '[Attachment]'}`,
                        icon: conversation.otherUser.avatar || '/images/default-avatar.png'
                    });
                }
            }

            // Update the global unread message count badge in the header/sidebar
            // This should ideally be fetched from the server for accuracy.
            // For now, we'll increment.
            if (globalUnreadBadge) {
                let currentCount = parseInt(globalUnreadBadge.textContent) || 0;
                globalUnreadBadge.textContent = currentCount + 1;
                globalUnreadBadge.style.display = 'inline-block'; // Show if hidden
            }

        } catch (error) {
            console.error('Error fetching conversation for notification:', error);
            showMessageBox('Failed to update inbox for new message.', 'error');
        }
    });

    // 2. Listen for messages being marked as read (e.g., if recipient reads it in another tab or the chat view)
    socket.on('messagesRead', async ({ conversationId: convoId, readBy }) => {
        // This event is emitted by the chat view when messages are marked read.
        // We need to fetch the updated conversation data to reflect the correct unread count.
        console.log(`Messages in conversation ${convoId} marked read by ${readBy}`);

        try {
            const response = await fetch(`/api/conversations/${convoId}`, {
                headers: {
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const conversation = await response.json();
            conversation.currentUserId = typeof CURRENT_USER_ID !== 'undefined' ? CURRENT_USER_ID : null;

            if (conversation) {
                updateConversationCard(conversation); // Update the card with new unread count
            }

            // Update the global unread message count badge
            // This should ideally be fetched from the server for accuracy.
            // For now, we'll decrement.
            if (globalUnreadBadge) {
                let currentGlobalCount = parseInt(globalUnreadBadge.textContent) || 0;
                if (currentGlobalCount > 0) {
                    globalUnreadBadge.textContent = currentGlobalCount - 1;
                    if (currentGlobalCount - 1 === 0) {
                        globalUnreadBadge.style.display = 'none';
                    }
                }
            }

        } catch (error) {
            console.error('Error fetching conversation for read update:', error);
            showMessageBox('Failed to update inbox for read messages.', 'error');
        }
    });

    // 3. Handle generic Socket.IO errors
    socket.on('error', (errorMessage) => {
        console.error('Socket error for inbox:', errorMessage);
        showMessageBox(`Real-time error: ${errorMessage}`, 'error');
    });

    // Handle initial connection
    socket.on('connect', () => {
        console.log('Connected to Socket.IO for inbox updates.');
        // If you have a way to get the current user's ID on connect, you could emit it
        // to join their personal room for notifications if not already handled by middleware.
        // E.g., socket.emit('joinPersonalRoom', CURRENT_USER_ID);
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from Socket.IO for inbox updates.');
    });

    // Request Notification permission on page load
    if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
            } else {
                console.log('Notification permission denied.');
            }
        });
    }
});
