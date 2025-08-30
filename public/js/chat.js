// public/js/chat.js - Client-side logic for the chat conversation view

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const chatPageWrapper = document.querySelector('.chat-page-wrapper');
    const messagesBox = document.getElementById('messagesBox');
    const chatForm = document.getElementById('chatForm');
    const messageInput = document.getElementById('messageInput');
    const sendBtn = document.getElementById('sendBtn');
    const charCount = document.getElementById('charCount');
    const attachmentInput = document.getElementById('attachmentInput');
    const filePreviewArea = document.getElementById('filePreview');
    const typingIndicator = document.getElementById('typingIndicator');
    const messageBox = document.getElementById('customMessageBox');
    const messageBoxText = document.getElementById('messageBoxText');
    const messageBoxCloseBtn = document.getElementById('messageBoxCloseBtn');

    // --- Data from EJS Template ---
    // Retrieve data passed from the server-side EJS template via data attributes
    const CURRENT_USER_ID = chatPageWrapper ? chatPageWrapper.dataset.currentUserId : null;
    const CONVERSATION_ID = chatPageWrapper ? chatPageWrapper.dataset.conversationId : null;
    const OTHER_USER_ID = chatPageWrapper ? chatPageWrapper.dataset.otherUserId : null;
    let currentPage = chatPageWrapper ? parseInt(chatPageWrapper.dataset.currentPage) : 1;
    let totalPages = chatPageWrapper ? parseInt(chatPageWrapper.dataset.totalPages) : 1;
    let hasMore = currentPage < totalPages; // Boolean flag for "Load More" button

    // --- Socket.IO Setup ---
    // Initialize Socket.IO connection
    const socket = io();

    // --- State Variables ---
    let typingTimeout = null; // To manage typing indicator
    const TYPING_TIMEOUT_DELAY = 3000; // 3 seconds
    let currentAttachment = null; // Stores the file object for attachment

    // --- Utility Functions ---

    /**
     * Displays a custom message box instead of `alert()`.
     * @param {string} message - The message to display.
     * @param {string} [type='info'] - Type of message ('success', 'error', 'info').
     */
    function showMessageBox(message, type = 'info') {
        messageBoxText.textContent = message;
        messageBox.className = 'custom-message-box'; // Reset classes
        messageBox.classList.add(type); // Add type class
        messageBox.style.display = 'block';

        // Automatically hide after 5 seconds
        setTimeout(() => {
            messageBox.style.display = 'none';
        }, 5000);
    }

    // Close button for custom message box
    messageBoxCloseBtn.addEventListener('click', () => {
        messageBox.style.display = 'none';
    });

    /**
     * Scrolls the messages box to the bottom.
     * @param {boolean} smooth - Whether to use smooth scrolling.
     */
    function scrollToBottom(smooth = true) {
        if (messagesBox) {
            messagesBox.scrollTo({
                top: messagesBox.scrollHeight,
                behavior: smooth ? 'smooth' : 'auto'
            });
        }
    }

    /**
     * Renders a new message bubble into the messages display area.
     * @param {object} message - The message object.
     * @param {boolean} prepend - If true, prepends the message (for load more).
     */
    function renderMessage(message, prepend = false) {
        // Check if message already exists to prevent duplicates on real-time updates
        if (document.querySelector(`[data-message-id="${message._id}"]`)) {
            return;
        }

        const isSent = message.sender._id === CURRENT_USER_ID;
        const messageWrapper = document.createElement('div');
        messageWrapper.classList.add('message-bubble-wrapper');
        messageWrapper.classList.add(isSent ? 'sent' : 'received');
        messageWrapper.dataset.messageId = message._id;
        messageWrapper.dataset.createdAt = message.createdAt;

        let avatarHtml = '';
        if (!isSent) { // Only show avatar for received messages
            const avatarSrc = message.sender.avatar && message.sender.avatar.trim() !== '' ? message.sender.avatar : '/images/default-avatar.png';
            avatarHtml = `
                <div class="message-sender-avatar">
                    <img src="${avatarSrc}" alt="${message.sender.username}'s Avatar" class="avatar-small" onerror="handleImageError(this, '/images/default-avatar.png');" loading="lazy">
                </div>
            `;
        }

        let contentHtml = '';
        if (message.messageType === 'text') {
            contentHtml = `<div class="message-text-content">${message.content.replace(/\n/g, '<br>')}</div>`;
        } else if (message.messageType === 'image' && message.attachment && message.attachment.url) {
            contentHtml = `
                <div class="message-image-attachment">
                    <a href="${message.attachment.url}" target="_blank" rel="noopener noreferrer" aria-label="View image attachment">
                        <img src="${message.attachment.url}" alt="Attachment image: ${message.attachment.filename || 'untitled'}" class="attachment-preview-img" loading="lazy" onerror="handleImageError(this, '/images/file-placeholder.png');">
                    </a>
                </div>
            `;
        } else if (message.messageType === 'file' && message.attachment && message.attachment.url) {
            // Helper function getFileIcon is defined in EJS, so it's globally available
            const fileIconClass = typeof getFileIcon === 'function' ? getFileIcon(message.attachment.mimeType) : 'fas fa-file';
            contentHtml = `
                <div class="message-file-attachment">
                    <a class="attachment-link" href="${message.attachment.url}" target="_blank" rel="noopener noreferrer" aria-label="Download file: ${message.attachment.filename || 'untitled'}">
                        <span class="file-icon"><i class="${fileIconClass}"></i></span>
                        <span class="file-name">${message.attachment.filename}</span>
                        <span class="file-size">${(message.attachment.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                    </a>
                </div>
            `;
        } else if (message.messageType === 'system') {
            contentHtml = `<div class="message-text-content system-message"><em>${message.content}</em></div>`;
        }

        const timestamp = new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        let statusHtml = '';
        if (isSent) {
            let statusIcon = '';
            let statusLabel = '';
            if (message.status === 'read') {
                statusIcon = '<i class="fas fa-check-double read"></i>';
                statusLabel = 'Message read';
            } else if (message.status === 'delivered') {
                statusIcon = '<i class="fas fa-check-double"></i>';
                statusLabel = 'Message delivered';
            } else if (message.status === 'failed') {
                statusIcon = '<i class="fas fa-exclamation-circle failed"></i>';
                statusLabel = 'Message failed to send';
            } else { // 'sent'
                statusIcon = '<i class="fas fa-check"></i>';
                statusLabel = 'Message sent';
            }
            statusHtml = `<span class="message-status-icon" aria-label="${statusLabel}" title="${statusLabel}" data-status="${message.status}">${statusIcon}</span>`;
        }

        const deleteButtonHtml = `
            <button class="delete-message-btn" data-message-id="${message._id}" aria-label="Delete message for myself" title="Delete for myself">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;

        messageWrapper.innerHTML = `
            ${avatarHtml}
            <div class="message-bubble">
                ${contentHtml}
                <div class="message-footer">
                    <small class="message-timestamp">${timestamp}</small>
                    ${statusHtml}
                    ${deleteButtonHtml}
                </div>
            </div>
        `;

        // Handle date separators
        const existingDateSeparators = messagesBox.querySelectorAll('.date-separator');
        let lastMessageDate = null;
        if (messagesBox.lastElementChild && messagesBox.lastElementChild.classList.contains('message-bubble-wrapper')) {
            lastMessageDate = new Date(messagesBox.lastElementChild.dataset.createdAt).toLocaleDateString();
        }

        const newMessageDate = new Date(message.createdAt).toLocaleDateString();

        if (newMessageDate !== lastMessageDate && !prepend) {
            const dateSeparator = document.createElement('div');
            dateSeparator.classList.add('date-separator');
            const dateText = newMessageDate === new Date().toLocaleDateString() ? 'Today' : newMessageDate;
            dateSeparator.innerHTML = `<span>${dateText}</span>`;
            messagesBox.appendChild(dateSeparator);
        } else if (prepend && existingDateSeparators.length === 0) {
             // If prepending and no date separators exist, add one for the first message
             const dateSeparator = document.createElement('div');
             dateSeparator.classList.add('date-separator');
             const dateText = newMessageDate === new Date().toLocaleDateString() ? 'Today' : newMessageDate;
             dateSeparator.innerHTML = `<span>${dateText}</span>`;
             messagesBox.prepend(dateSeparator);
        }


        if (prepend) {
            // Prepend the message after the "Load More" button if it exists
            const loadMoreContainer = messagesBox.querySelector('.load-more-messages-container');
            if (loadMoreContainer) {
                loadMoreContainer.after(messageWrapper);
            } else {
                messagesBox.prepend(messageWrapper);
            }
        } else {
            messagesBox.appendChild(messageWrapper);
        }

        // Add event listener for the delete button
        const deleteButton = messageWrapper.querySelector('.delete-message-btn');
        if (deleteButton) {
            deleteButton.addEventListener('click', () => handleDeleteMessage(message._id));
        }
    }

    /**
     * Handles the deletion of a message for the current user.
     * @param {string} messageId - The ID of the message to delete.
     */
    async function handleDeleteMessage(messageId) {
        // Using a custom message box instead of confirm()
        const confirmDelete = await new Promise(resolve => {
            const deleteConfirmBox = document.createElement('div');
            deleteConfirmBox.classList.add('custom-message-box', 'confirm-box');
            deleteConfirmBox.innerHTML = `
                <div class="message-box-content">
                    <p>Are you sure you want to delete this message for yourself?</p>
                    <div class="confirm-buttons">
                        <button id="confirmDeleteYes" class="btn btn-danger">Yes</button>
                        <button id="confirmDeleteNo" class="btn btn-secondary">No</button>
                    </div>
                </div>
            `;
            document.body.appendChild(deleteConfirmBox);

            document.getElementById('confirmDeleteYes').onclick = () => {
                deleteConfirmBox.remove();
                resolve(true);
            };
            document.getElementById('confirmDeleteNo').onclick = () => {
                deleteConfirmBox.remove();
                resolve(false);
            };
        });

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await fetch(`/messages/message/${messageId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            });
            const data = await response.json();

            if (response.ok && data.success) {
                showMessageBox(data.message, 'success');
                // The socket event 'messageDeletedForUser' will handle UI removal
            } else {
                showMessageBox(data.error || 'Failed to delete message.', 'error');
            }
        } catch (error) {
            console.error('Error deleting message:', error);
            showMessageBox('Network error. Failed to delete message.', 'error');
        }
    }

    /**
     * Enables the message input form and send button.
     */
    function enableForm() {
        messageInput.disabled = false;
        sendBtn.disabled = false;
        sendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    }

    /**
     * Disables the message input form and send button.
     */
    function disableForm() {
        messageInput.disabled = true;
        sendBtn.disabled = true;
        sendBtn.classList.add('opacity-50', 'cursor-not-allowed');
    }

    /**
     * Resets the message input form after sending.
     */
    function resetForm() {
        messageInput.value = '';
        charCount.textContent = `0 / ${messageInput.maxLength}`;
        attachmentInput.value = ''; // Clear file input
        currentAttachment = null;
        filePreviewArea.innerHTML = ''; // Clear file preview
        filePreviewArea.style.display = 'none';
        messageInput.style.height = '44px'; // Reset textarea height
    }

    /**
     * Adjusts the height of the message input textarea based on content.
     */
    function adjustTextareaHeight() {
        messageInput.style.height = 'auto'; // Reset height to recalculate
        messageInput.style.height = messageInput.scrollHeight + 'px';
    }

    // --- Event Listeners ---

    // Initial scroll to bottom when page loads
    scrollToBottom(false);

    // Join the conversation room on socket connection
    socket.on('connect', () => {
        console.log('Socket connected. Joining conversation room:', CONVERSATION_ID);
        if (CONVERSATION_ID) {
            socket.emit('joinConversation', CONVERSATION_ID);
        } else {
            showMessageBox('Error: Conversation ID is missing. Real-time features may not work.', 'error');
            console.error('CONVERSATION_ID is null or empty. Cannot join conversation room.');
        }
    });

    // Handle connection errors
    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err);
        showMessageBox('Real-time connection failed. Please refresh.', 'error');
    });

    // Handle general socket errors emitted from server
    socket.on('error', (message) => {
        showMessageBox(`Socket Error: ${message}`, 'error');
    });

    // Listen for new messages
    socket.on('newMessage', (data) => {
        console.log('New message received:', data.message);
        renderMessage(data.message);
        scrollToBottom();
    });

    // Listen for messages read event
    socket.on('messagesRead', (data) => {
        console.log(`Messages in conversation ${data.conversationId} read by user ${data.readBy}`);
        // Update read receipts for messages sent by CURRENT_USER_ID to data.readBy
        if (data.readBy === OTHER_USER_ID) {
            document.querySelectorAll(`.message-bubble-wrapper.sent[data-status="sent"], .message-bubble-wrapper.sent[data-status="delivered"]`).forEach(el => {
                const statusIcon = el.querySelector('.message-status-icon');
                if (statusIcon) {
                    statusIcon.innerHTML = '<i class="fas fa-check-double read"></i>';
                    statusIcon.dataset.status = 'read';
                    statusIcon.setAttribute('aria-label', 'Message read');
                    statusIcon.setAttribute('title', 'READ');
                }
            });
        }
        // Also update unread count in inbox if this is triggered from chat view
        // This would require a separate socket event to update the inbox badge
        // or a page reload for inbox.
    });

    // Listen for message deleted event
    socket.on('messageDeletedForUser', (data) => {
        console.log(`Message ${data.messageId} deleted for user ${data.deletedBy}`);
        const messageElement = document.querySelector(`[data-message-id="${data.messageId}"]`);
        if (messageElement && data.deletedBy === CURRENT_USER_ID) {
            messageElement.remove(); // Remove message from UI for the deleting user
            showMessageBox('Message removed from your view.', 'info');
        } else if (messageElement) {
            // Optionally, show a "message deleted" placeholder for other users
            // messageElement.querySelector('.message-text-content').textContent = 'This message was deleted.';
            // messageElement.classList.add('deleted-message');
        }
    });

    // Typing indicator events
    messageInput.addEventListener('input', () => {
        adjustTextareaHeight();
        charCount.textContent = `${messageInput.value.length} / ${messageInput.maxLength}`;

        if (!CONVERSATION_ID) return; // Prevent typing event if no conversation ID

        socket.emit('typing', { conversationId: CONVERSATION_ID });

        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            socket.emit('stoppedTyping', { conversationId: CONVERSATION_ID });
        }, TYPING_TIMEOUT_DELAY);
    });

    socket.on('typing', (data) => {
        if (data.conversationId === CONVERSATION_ID && data.userId !== CURRENT_USER_ID) {
            typingIndicator.style.display = 'flex';
            typingIndicator.querySelector('.typing-text').textContent = `${data.username} is typing...`;
            scrollToBottom(); // Scroll to show typing indicator
        }
    });

    socket.on('stoppedTyping', (data) => {
        if (data.conversationId === CONVERSATION_ID && data.userId !== CURRENT_USER_ID) {
            typingIndicator.style.display = 'none';
        }
    });

    // Form submission for sending messages
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Prevent default form submission

        disableForm(); // Disable form to prevent double submission

        const content = messageInput.value.trim();
        const file = attachmentInput.files[0];

        if (!content && !file) {
            showMessageBox('Please enter a message or select a file.', 'info');
            enableForm();
            return;
        }

        // IMPORTANT: Added a more explicit check and message here
        if (!CONVERSATION_ID || CONVERSATION_ID === 'null' || CONVERSATION_ID === 'undefined') {
            showMessageBox('Error: Conversation is not active. Please ensure you are in a valid chat.', 'error');
            console.error('CONVERSATION_ID is null or empty when submitting. Cannot send message.');
            enableForm();
            return;
        }

        const formData = new FormData();
        formData.append('content', content);
        if (file) {
            formData.append('attachment', file);
        }

        try {
            const response = await fetch(`/messages/conversation/${CONVERSATION_ID}`, {
                method: 'POST',
                body: formData, // Multer handles multipart/form-data
                // No 'Content-Type' header needed for FormData; browser sets it automatically
                headers: {
                    'Accept': 'application/json' // Explicitly tell the server we expect JSON
                },
            });

            const data = await response.json(); // Expect JSON response

            if (response.ok && data.success) {
                console.log('Message sent successfully:', data.message);
                // Message will be rendered via Socket.IO 'newMessage' event
                resetForm(); // Clear input field and attachment
                showMessageBox('Message sent!', 'success');
            } else {
                // If server returns non-200 but valid JSON error
                showMessageBox(data.error || 'Failed to send message.', 'error');
                console.error('Server error sending message:', data.error);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            showMessageBox('Network error. Could not send message.', 'error');
        } finally {
            enableForm(); // Re-enable form regardless of success/failure
            socket.emit('stoppedTyping', { conversationId: CONVERSATION_ID }); // Ensure typing indicator is off
        }
    });

    // Attachment input change listener
    attachmentInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            currentAttachment = file;
            filePreviewArea.innerHTML = ''; // Clear previous preview

            const fileItem = document.createElement('div');
            fileItem.classList.add('file-preview-item');

            let previewHtml = '';
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewHtml = `<img src="${e.target.result}" alt="File preview" class="file-preview-image">`;
                    fileItem.innerHTML = previewHtml + `<button type="button" class="file-preview-remove" aria-label="Remove attachment">&times;</button>`;
                    filePreviewArea.appendChild(fileItem);
                    filePreviewArea.style.display = 'flex';
                    addRemoveFileListener(fileItem);
                };
                reader.readAsDataURL(file);
            } else {
                const fileIconClass = typeof getFileIcon === 'function' ? getFileIcon(file.type) : 'fas fa-file';
                previewHtml = `
                    <div class="file-preview-icon"><i class="${fileIconClass}"></i></div>
                    <span class="file-name">${file.name}</span>
                `;
                fileItem.innerHTML = previewHtml + `<button type="button" class="file-preview-remove" aria-label="Remove attachment">&times;</button>`;
                filePreviewArea.appendChild(fileItem);
                filePreviewArea.style.display = 'flex';
                addRemoveFileListener(fileItem);
            }
        } else {
            currentAttachment = null;
            filePreviewArea.innerHTML = '';
            filePreviewArea.style.display = 'none';
        }
    });

    /**
     * Adds event listener to the remove file button in the preview area.
     * @param {HTMLElement} fileItem - The HTML element of the file preview item.
     */
    function addRemoveFileListener(fileItem) {
        const removeBtn = fileItem.querySelector('.file-preview-remove');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                attachmentInput.value = ''; // Clear the file input
                currentAttachment = null; // Clear the stored attachment
                filePreviewArea.innerHTML = ''; // Remove the preview
                filePreviewArea.style.display = 'none';
            });
        }
    }

    // Initial check for send button state (disable if no content/attachment)
    const updateSendButtonState = () => {
        if (messageInput.value.trim() === '' && !currentAttachment) {
            sendBtn.disabled = true;
            sendBtn.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            sendBtn.disabled = false;
            sendBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    };

    messageInput.addEventListener('input', updateSendButtonState);
    attachmentInput.addEventListener('change', updateSendButtonState);
    updateSendButtonState(); // Call on load

    // Load More Messages functionality
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', async () => {
            if (!hasMore) {
                showMessageBox('No more messages to load.', 'info');
                return;
            }

            loadMoreBtn.disabled = true;
            loadMoreBtn.textContent = 'Loading...';

            try {
                const nextPage = currentPage + 1;
                const response = await fetch(`/messages/conversation/${CONVERSATION_ID}?page=${nextPage}`);
                const data = await response.json();

                if (response.ok && data.messages) {
                    // Prepend older messages to the top of the messagesBox
                    const currentScrollHeight = messagesBox.scrollHeight;
                    const currentScrollTop = messagesBox.scrollTop;

                    // Reverse the incoming messages to maintain chronological order when prepending
                    const olderMessages = data.messages.reverse();

                    olderMessages.forEach(msg => renderMessage(msg, true));

                    // Adjust scroll position to maintain view
                    messagesBox.scrollTop = messagesBox.scrollHeight - currentScrollHeight + currentScrollTop;

                    currentPage = data.currentPage;
                    totalPages = data.totalPages;
                    hasMore = currentPage < totalPages;

                    if (!hasMore) {
                        loadMoreBtn.style.display = 'none'; // Hide button if no more pages
                    }
                } else {
                    showMessageBox(data.error || 'Failed to load older messages.', 'error');
                }
            } catch (error) {
                console.error('Error loading older messages:', error);
                showMessageBox('Network error. Failed to load older messages.', 'error');
            } finally {
                loadMoreBtn.disabled = false;
                loadMoreBtn.textContent = 'Load Older Messages';
            }
        });
    }
});
