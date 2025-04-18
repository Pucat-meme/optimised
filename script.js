document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const menuBtn = document.getElementById('menu-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const newChatBtn = document.getElementById('new-chat-btn');
    const clearHistoryBtn = document.getElementById('clear-history-btn');
    const chatHistory = document.getElementById('chat-history');
    const chatForm = document.getElementById('chat-form');
    const messageInput = document.getElementById('message-input');
    const messages = document.getElementById('messages');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeToggleMobileBtn = document.getElementById('theme-toggle-mobile-btn');
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalOverlay = document.getElementById('modal-overlay');
    
    // Groq API configuration
    const GROQ_API_KEY = "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"; // Replace with your actual Groq API key
    const GROQ_MODEL = "llama3-8b-8192"; // You can change this to any Groq model
    const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    const GROQ_TTS_URL = "https://api.groq.com/openai/v1/audio/speech"; // Groq TTS endpoint
    
    // Audio player for TTS
    let audioPlayer = new Audio();
    let isPlaying = false;
    let currentPlayingButton = null;
    
    // Theme toggle
    function initTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.className = savedTheme;
    }
    
    function toggleTheme() {
        const isDark = document.documentElement.classList.contains('dark');
        document.documentElement.className = isDark ? 'light' : 'dark';
        localStorage.setItem('theme', isDark ? 'light' : 'dark');
    }
    
    // Init theme on load
    initTheme();
    
    // Sidebar toggle
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            sidebar.classList.add('active');
            sidebarOverlay.classList.add('active');
        });
    }
    
    if (closeSidebarBtn) {
        closeSidebarBtn.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }
    
    // Theme toggle button
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }
    
    if (themeToggleMobileBtn) {
        themeToggleMobileBtn.addEventListener('click', toggleTheme);
    }
    
    // Settings modal
    if (settingsBtn) {
        settingsBtn.addEventListener('click', () => {
            modalOverlay.classList.add('active');
        });
    }
    
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modalOverlay.classList.remove('active');
        });
    }
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                modalOverlay.classList.remove('active');
            }
        });
    }
    
    // Auto-resize text area
    if (messageInput) {
        messageInput.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
            if (this.scrollHeight > 150) {
                this.style.height = '150px';
            }
        });
    }
    
    // Chat functionality
    let chats = loadChats();
    let currentChatId = null;
    
    // Load chats from localStorage
    function loadChats() {
        const savedChats = localStorage.getItem('chats');
        return savedChats ? JSON.parse(savedChats) : {};
    }
    
    // Save chats to localStorage
    function saveChats(chats) {
        localStorage.setItem('chats', JSON.stringify(chats));
    }
    
    // Create a new chat
    function createNewChat() {
        const chatId = 'chat_' + Date.now();
        chats[chatId] = {
            title: 'New Chat',
            messages: []
        };
        currentChatId = chatId;
        saveChats(chats);
        renderChatHistory();
        renderMessages();
        
        // Close sidebar on mobile after creating new chat
        if (window.innerWidth < 768) {
            sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        }
    }
    
    // Create welcome message for new chats
    function renderWelcomeMessage() {
        messages.innerHTML = `
            <div class="welcome-message">
                <div class="welcome-animation">
                    <div class="pulse-circle"></div>
                    <div class="pulse-circle delay-1"></div>
                    <div class="pulse-circle delay-2"></div>
                </div>
                <h2>Welcome to Optimised<span>AI</span></h2>
                <p>Start a conversation by typing a message below.</p>
            </div>
        `;
    }
    
    // Render chat history in sidebar
    function renderChatHistory() {
        chatHistory.innerHTML = '';
        
        Object.keys(chats).forEach(chatId => {
            const chat = chats[chatId];
            const chatItem = document.createElement('div');
            chatItem.classList.add('history-item');
            if (chatId === currentChatId) {
                chatItem.classList.add('active');
            }
            
            chatItem.innerHTML = `
                <span class="history-title">${chat.title}</span>
                <button class="delete-btn" data-id="${chatId}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            `;
            
            chatItem.addEventListener('click', (e) => {
                if (!e.target.closest('.delete-btn')) {
                    currentChatId = chatId;
                    renderChatHistory();
                    renderMessages();
                    
                    // Close sidebar on mobile after selecting chat
                    if (window.innerWidth < 768) {
                        sidebar.classList.remove('active');
                        sidebarOverlay.classList.remove('active');
                    }
                }
            });
            
            chatHistory.appendChild(chatItem);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const chatId = btn.getAttribute('data-id');
                
                if (confirm('Are you sure you want to delete this chat?')) {
                    delete chats[chatId];
                    saveChats(chats);
                    if (chatId === currentChatId) {
                        currentChatId = null;
                        renderWelcomeMessage();
                    }
                    renderChatHistory();
                }
            });
        });
    }
    
    // Generate speech for AI messages
    async function generateSpeech(text) {
        try {
            // Show loading state
            if (currentPlayingButton) {
                currentPlayingButton.classList.add('loading');
                currentPlayingButton.innerHTML = getSpeechButtonIcon('loading');
            }
            
            // Stop any currently playing audio
            stopAudio();
            
            // Make sure text isn't too long for TTS
            const maxTTSLength = 4000; // Groq has a limit on TTS input length
            let processedText = text;
            if (text.length > maxTTSLength) {
                processedText = text.substring(0, maxTTSLength);
                console.warn("Text truncated for TTS as it exceeds maximum length");
            }
            
            // Create Fetch API request
            const response = await fetch(GROQ_TTS_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: "tts-1", // Groq's TTS model
                    input: processedText,
                    voice: "alloy", // You can choose: alloy, echo, fable, onyx, nova, shimmer
                    speed: 1.0,
                    response_format: "mp3"
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Groq TTS API error:', errorData);
                throw new Error(`Groq TTS API error: ${response.status}`);
            }
            
            // Handle the response as a blob
            const audioBlob = await response.blob();
            
            // Verify we got actual audio data and not an error response
            if (!audioBlob || audioBlob.type !== 'audio/mpeg') {
                throw new Error("Invalid audio response received");
            }
            
            const audioUrl = URL.createObjectURL(audioBlob);
            
            // Set up audio player and play
            audioPlayer = new Audio(audioUrl);
            
            // Add event listeners for audio player
            audioPlayer.addEventListener('canplaythrough', () => {
                audioPlayer.play();
                isPlaying = true;
                
                // Update UI
                if (currentPlayingButton) {
                    currentPlayingButton.classList.remove('loading');
                    currentPlayingButton.classList.add('playing');
                    currentPlayingButton.innerHTML = getSpeechButtonIcon('playing');
                }
            });
            
            audioPlayer.addEventListener('error', (e) => {
                console.error('Audio player error:', e);
                throw new Error("Failed to play audio");
            });
            
            // Clean up when audio ends
            audioPlayer.addEventListener('ended', function() {
                isPlaying = false;
                if (currentPlayingButton) {
                    currentPlayingButton.classList.remove('playing');
                    currentPlayingButton.innerHTML = getSpeechButtonIcon('idle');
                }
                URL.revokeObjectURL(audioUrl);
            });
            
            return true;
        } catch (error) {
            console.error('Error generating speech:', error);
            
            // Reset UI on error
            if (currentPlayingButton) {
                currentPlayingButton.classList.remove('loading');
                currentPlayingButton.classList.remove('playing');
                currentPlayingButton.innerHTML = getSpeechButtonIcon('idle');
            }
            
            // Show error toast
            showToast('Speech generation failed. Please try again.');
            
            return false;
        }
    }
    
    // Stop audio playback
    function stopAudio() {
        if (audioPlayer) {
            // Remove all event listeners
            audioPlayer.oncanplaythrough = null;
            audioPlayer.onerror = null;
            audioPlayer.onended = null;
            
            // Stop playback
            audioPlayer.pause();
            audioPlayer.currentTime = 0;
            isPlaying = false;
            
            // Reset previous button if exists
            if (currentPlayingButton) {
                currentPlayingButton.classList.remove('playing');
                currentPlayingButton.classList.remove('loading');
                currentPlayingButton.innerHTML = getSpeechButtonIcon('idle');
            }
        }
    }
    
    // Format code blocks in AI responses
    function formatCodeBlocks(text) {
        const codeBlockRegex = /```([a-zA-Z]*)\n([\s\S]*?)```/g;
        return text.replace(codeBlockRegex, (match, language, code) => {
            return `
                <div class="code-block-container">
                    <div class="code-header">
                        <span>${language || 'code'}</span>
                        <button class="copy-btn" onclick="copyToClipboard(this)">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Copy
                        </button>
                    </div>
                    <pre class="code-block">${code}</pre>
                </div>
            `;
        });
    }
    
    // Copy code to clipboard
    window.copyToClipboard = function(button) {
        const codeBlock = button.closest('.code-block-container').querySelector('.code-block');
        const textToCopy = codeBlock.textContent;
        
        navigator.clipboard.writeText(textToCopy).then(() => {
            const originalText = button.innerHTML;
            button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Copied!
            `;
            
            setTimeout(() => {
                button.innerHTML = originalText;
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            showToast('Failed to copy to clipboard');
        });
    };
    
    // Format markdown in AI responses
    function formatMarkdown(text) {
        // First protect code blocks
        let codeBlocks = [];
        text = text.replace(/```([a-zA-Z]*)\n([\s\S]*?)```/g, (match) => {
            const id = `CODE_BLOCK_${codeBlocks.length}`;
            codeBlocks.push(match);
            return id;
        });
        
        // Basic markdown formatting
        text = text
            // Headers
            .replace(/^# (.*?)$/gm, '<h1>$1</h1>')
            .replace(/^## (.*?)$/gm, '<h2>$1</h2>')
            .replace(/^### (.*?)$/gm, '<h3>$1</h3>')
            .replace(/^#### (.*?)$/gm, '<h4>$1</h4>')
            
            // Bold, italic
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            .replace(/_(.*?)_/g, '<em>$1</em>')
            
            // Links
            .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
            
            // Lists
            .replace(/^\s*\* (.*?)$/gm, '<li>$1</li>')
            .replace(/^\s*- (.*?)$/gm, '<li>$1</li>')
            .replace(/^\s*(\d+)\. (.*?)$/gm, '<li>$2</li>')
            
            // Blockquotes
            .replace(/^\> (.*?)$/gm, '<blockquote>$1</blockquote>')
            
            // Inline code
            .replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Wrap consecutive list items in ul/ol tags
        text = text.replace(/(<li>.*?<\/li>)\s*(<li>)/g, '$1$2');
        text = text.replace(/(<li>.*?<\/li>)(?!\s*<li>)/g, '<ul>$1</ul>');
        
        // Restore code blocks
        codeBlocks.forEach((block, i) => {
            text = text.replace(`CODE_BLOCK_${i}`, formatCodeBlocks(block));
        });
        
        // Handle paragraphs (text separated by empty lines)
        const paragraphs = text.split(/\n\s*\n/);
        text = paragraphs.map(p => {
            // Skip wrapping if paragraph already contains HTML block elements
            if (p.match(/<(h[1-6]|ul|ol|li|blockquote|div|pre|table|code-block-container)[\s>]/)) {
                return p;
            }
            return `<p>${p}</p>`;
        }).join('');
        
        return text;
    }
    
    // Show toast message
    function showToast(message) {
        const toast = document.createElement('div');
        toast.classList.add('toast');
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Show toast
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        // Hide and remove toast
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(toast);
            }, 300);
        }, 3000);
    }
    
    // Get icon for speech button based on state
    function getSpeechButtonIcon(state) {
        switch (state) {
            case 'playing':
                return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>`;
            case 'loading':
                return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="spinner"><circle cx="12" cy="12" r="10"></circle><path d="M12 6v6l4 2"></path></svg>`;
            default: // idle
                return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
        }
    }
    
    // Render messages for current chat
    function renderMessages() {
        if (!currentChatId || !chats[currentChatId]) {
            renderWelcomeMessage();
            return;
        }
        
        const currentChat = chats[currentChatId];
        messages.innerHTML = '';
        
        currentChat.messages.forEach(msg => {
            addMessageToUI(msg.content, msg.isUser);
        });
        
        // Scroll to bottom
        messages.scrollTop = messages.scrollHeight;
    }
    
    // Add message to UI with speech button for AI messages
    function addMessageToUI(content, isUser) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message');
        messageDiv.classList.add(isUser ? 'user-message' : 'ai-message');
        
        const messageBubble = document.createElement('div');
        messageBubble.classList.add('message-bubble');
        
        // Format AI responses with markdown
        if (isUser) {
            messageBubble.textContent = content;
        } else {
            messageBubble.innerHTML = formatMarkdown(content);
            
            // Add speech button for AI messages
            const speechButton = document.createElement('button');
            speechButton.classList.add('speech-btn');
            speechButton.innerHTML = getSpeechButtonIcon('idle');
            speechButton.setAttribute('title', 'Text to Speech');
            
            speechButton.addEventListener('click', async function(e) {
                e.stopPropagation(); // Prevent event bubbling
                
                // If this button is already playing/loading, stop it
                if (this === currentPlayingButton && (isPlaying || this.classList.contains('loading'))) {
                    stopAudio();
                    return;
                }
                
                // Set as current button and generate speech
                currentPlayingButton = this;
                await generateSpeech(content);
            });
            
            messageBubble.appendChild(speechButton);
        }
        
        messageDiv.appendChild(messageBubble);
        messages.appendChild(messageDiv);
        
        // Scroll to bottom
        messages.scrollTop = messages.scrollHeight;
    }
    
    // Show typing indicator
    function showTypingIndicator() {
        const indicatorDiv = document.createElement('div');
        indicatorDiv.classList.add('message', 'ai-message');
        
        const indicator = document.createElement('div');
        indicator.classList.add('typing-indicator');
        indicator.innerHTML = '<span></span><span></span><span></span>';
        
        indicatorDiv.appendChild(indicator);
        messages.appendChild(indicatorDiv);
        
        // Scroll to bottom
        messages.scrollTop = messages.scrollHeight;
        
        return indicatorDiv;
    }
    
    // Generate AI response using Groq API
    async function generateGroqResponse(userMessage, chatHistory, isForTitle = false) {
        try {
            // Format chat history for the API
            const messages = [];
            
            if (isForTitle) {
                // For title generation, use a specific system prompt
                messages.push({
                    role: "system",
                    content: "Create a very concise title (maximum 5 words) that captures the essence of this conversation. Return ONLY the title text with no quotes, explanations, or extra characters."
                });
                
                // Add only the first message from the user for title generation
                if (chatHistory && chatHistory.length > 0) {
                    // Find the first user message
                    const firstUserMessage = chatHistory.find(msg => msg.isUser);
                    if (firstUserMessage) {
                        messages.push({
                            role: "user",
                            content: firstUserMessage.content
                        });
                    }
                    
                    // Add first AI response if available
                    const firstAiResponse = chatHistory.find(msg => !msg.isUser);
                    if (firstAiResponse) {
                        messages.push({
                            role: "assistant",
                            content: firstAiResponse.content
                        });
                    }
                }
                
                // Add a specific prompt for title generation
                messages.push({
                    role: "user",
                    content: "Generate a concise, descriptive title for our conversation (maximum 5 words)."
                });
            } else {
                // For normal conversation, use the standard system prompt
                messages.push({
                    role: "system",
                    content: "You are a helpful AI assistant called OptimisedAI. You provide accurate, concise, and helpful responses."
                });
                
                // Add chat history
                if (chatHistory && chatHistory.length > 0) {
                    chatHistory.forEach(msg => {
                        messages.push({
                            role: msg.isUser ? "user" : "assistant",
                            content: msg.content
                        });
                    });
                }
                
                // Add current user message
                messages.push({
                    role: "user",
                    content: userMessage
                });
            }
            
            // Prepare request
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${GROQ_API_KEY}`
                },
                body: JSON.stringify({
                    model: GROQ_MODEL,
                    messages: messages,
                    temperature: isForTitle ? 0.2 : 0.7, // Lower temperature for more focused titles
                    max_tokens: isForTitle ? 10 : 1024   // Fewer tokens for titles
                })
            });
            
            if (!response.ok) {
                const errorData = await response.json();
                console.error('Groq API error:', errorData);
                throw new Error(`Groq API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('Error calling Groq API:', error);
            return isForTitle ? "New Chat" : "I'm having trouble connecting to my AI services. Please check your API key and try again.";
        }
    }
    
    // Generate smart title for the chat
    async function generateSmartTitle(messages) {
        try {
            // Check if there are enough messages for title generation
            if (messages.length < 2) {
                return null;
            }
            
            const title = await generateGroqResponse(null, messages, true);
            
            // Clean up the title text
            const cleanedTitle = title
                .replace(/^["']|["']$/g, '')  // Remove quotes at start/end
                .replace(/^Title:?\s*/i, '')  // Remove "Title:" prefix
                .trim();
                
            // Enforce length limit
            return cleanedTitle.length > 30 ? 
                cleanedTitle.substring(0, 30) + '...' : 
                cleanedTitle;
                
        } catch (error) {
            console.error('Error generating smart title:', error);
            return null;
        }
    }
    
    // Fallback title generation
    function generateFallbackTitle(messages) {
        try {
            // Find first user message
            const firstUserMsg = messages.find(msg => msg.isUser);
            if (!firstUserMsg) return "New Chat";
            
            // Create title from first user message
            const words = firstUserMsg.content.split(/\s+/);
            if (words.length <= 5) {
                return firstUserMsg.content;
            } else {
                return words.slice(0, 5).join(' ') + '...';
            }
        } catch (error) {
            console.error('Error generating fallback title:', error);
            return "New Chat";
        }
    }
    
    // Update chat title
    async function updateChatTitle() {
        if (!currentChatId || !chats[currentChatId]) return;
        
        const currentChat = chats[currentChatId];
        
        // Only update if title is still default and we have enough messages
        if (currentChat.title === 'New Chat' && currentChat.messages.length >= 2) {
            // Don't update if a title generation is already in progress
            if (currentChat.titleGenerationInProgress) return;
            
            currentChat.titleGenerationInProgress = true;
            
            try {
                // Generate a smart title with timeout handling
                const titlePromise = generateSmartTitle(currentChat.messages);
                const timeoutPromise = new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Title generation timed out')), 5000)
                );
                
                // Race between title generation and timeout
                const smartTitle = await Promise.race([titlePromise, timeoutPromise]);
                
                // Update chat title if we got a valid title
                if (smartTitle && smartTitle.length > 0) {
                    currentChat.title = smartTitle;
                    saveChats(chats);
                    renderChatHistory();
                } else {
                    throw new Error('Invalid title generated');
                }
            } catch (error) {
                console.error('Smart title generation failed:', error);
                
                // Fallback to simpler title generation
                const fallbackTitle = generateFallbackTitle(currentChat.messages);
                currentChat.title = fallbackTitle;
                saveChats(chats);
                renderChatHistory();
            } finally {
                currentChat.titleGenerationInProgress = false;
            }
        }
    }
    
    // Export chats to JSON file
    window.exportChats = function() {
        try {
            const dataStr = JSON.stringify(chats, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'optimised-ai-chats.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            URL.revokeObjectURL(url);
            showToast('Chats exported successfully');
        } catch (error) {
            console.error('Failed to export chats:', error);
            showToast('Failed to export chats');
        }
    };
    
    // Import chats from JSON file
    window.importChats = function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const importedChats = JSON.parse(event.target.result);
                    
                    // Validate imported data
                    if (typeof importedChats !== 'object') {
                        throw new Error('Invalid chat data format');
                    }
                    
                    // Merge with existing chats
                    if (confirm('Do you want to merge with existing chats? Click OK to merge, Cancel to replace all.')) {
                        // Merge
                        chats = { ...chats, ...importedChats };
                    } else {
                        // Replace
                        // Replace
                        chats = importedChats;
                    }
                    
                    // Save merged/replaced chats
                    saveChats(chats);
                    
                    // Reset current chat
                    currentChatId = Object.keys(chats)[0] || null;
                    
                    // Refresh UI
                    renderChatHistory();
                    renderMessages();
                    
                    showToast('Chats imported successfully');
                } catch (error) {
                    console.error('Failed to import chats:', error);
                    showToast('Failed to import file. Invalid format.');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    };
    
    // Event listeners
    if (newChatBtn) {
        newChatBtn.addEventListener('click', createNewChat);
    }
    
    if (clearHistoryBtn) {
        clearHistoryBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
                chats = {};
                currentChatId = null;
                saveChats(chats);
                renderChatHistory();
                renderWelcomeMessage();
                showToast('Chat history cleared');
            }
        });
    }
    
    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const message = messageInput.value.trim();
            if (!message) return;
            
            // Clear input
            messageInput.value = '';
            messageInput.style.height = 'auto';
            
            // Create new chat if none exists
            if (!currentChatId) {
                createNewChat();
            }
            
            // Add user message to chat and UI
            const currentChat = chats[currentChatId];
            currentChat.messages.push({
                content: message,
                isUser: true,
                timestamp: Date.now()
            });
            
            addMessageToUI(message, true);
            
            // Show typing indicator
            const typingIndicator = showTypingIndicator();
            
            // Generate AI response
            try {
                const aiResponse = await generateGroqResponse(message, currentChat.messages);
                
                // Remove typing indicator
                messages.removeChild(typingIndicator);
                
                // Add AI response to chat and UI
                currentChat.messages.push({
                    content: aiResponse,
                    isUser: false,
                    timestamp: Date.now()
                });
                
                addMessageToUI(aiResponse, false);
                
                // Save updated chat
                saveChats(chats);
                
                // Update chat title if needed
                updateChatTitle();
                
            } catch (error) {
                console.error('Error generating response:', error);
                
                // Remove typing indicator
                messages.removeChild(typingIndicator);
                
                // Show error message
                addMessageToUI("I'm sorry, there was an error generating a response. Please try again.", false);
            }
        });
    }
    
    // Initialize on load
    if (Object.keys(chats).length > 0) {
        currentChatId = Object.keys(chats)[0];
        renderChatHistory();
        renderMessages();
    } else {
        renderWelcomeMessage();
    }
    
    // Listen for keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to submit form
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            if (chatForm && messageInput.value.trim()) {
                chatForm.dispatchEvent(new Event('submit'));
            }
        }
        
        // Escape key to close modals/sidebar
        if (e.key === 'Escape') {
            // Close sidebar if open
            if (sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            }
            
            // Close modal if open
            if (modalOverlay.classList.contains('active')) {
                modalOverlay.classList.remove('active');
            }
        }
    });
    
    // Handle model change in settings
    const modelSelect = document.getElementById('model-select');
    if (modelSelect) {
        // Load saved model preference
        const savedModel = localStorage.getItem('ai-model');
        if (savedModel) {
            modelSelect.value = savedModel;
        }
        
        // Save model preference on change
        modelSelect.addEventListener('change', function() {
            localStorage.setItem('ai-model', this.value);
            GROQ_MODEL = this.value;
            showToast(`Model changed to ${this.value}`);
        });
    }
    
    // Handle voice change in settings
    const voiceSelect = document.getElementById('voice-select');
    if (voiceSelect) {
        // Load saved voice preference
        const savedVoice = localStorage.getItem('tts-voice');
        if (savedVoice) {
            voiceSelect.value = savedVoice;
        }
        
        // Save voice preference on change
        voiceSelect.addEventListener('change', function() {
            localStorage.setItem('tts-voice', this.value);
            showToast(`Voice changed to ${this.value}`);
        });
    }
    
    // API key management
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyBtn = document.getElementById('save-api-key-btn');
    
    if (apiKeyInput && saveApiKeyBtn) {
        // Load saved API key
        const savedApiKey = localStorage.getItem('groq-api-key');
        if (savedApiKey) {
            apiKeyInput.value = savedApiKey;
            GROQ_API_KEY = savedApiKey;
        }
        
        // Save API key
        saveApiKeyBtn.addEventListener('click', function() {
            const newApiKey = apiKeyInput.value.trim();
            if (newApiKey) {
                localStorage.setItem('groq-api-key', newApiKey);
                GROQ_API_KEY = newApiKey;
                showToast('API key saved');
            } else {
                showToast('Please enter a valid API key');
            }
        });
    }
    
    // Check if we need to show welcome message or API key setup
    const showInitialApiKeyPrompt = () => {
        const savedApiKey = localStorage.getItem('groq-api-key');
        if (!savedApiKey && !GROQ_API_KEY) {
            // Show API key setup prompt
            modalOverlay.classList.add('active');
            showToast('Please set up your Groq API key to get started');
        }
    };
    
    // Show API key prompt after a short delay
    setTimeout(showInitialApiKeyPrompt, 1000);
});

document.addEventListener('DOMContentLoaded', function() {
    // Fix for the chat history toggle button
    const toggleHistoryBtn = document.getElementById('toggle-history-btn');
    const chatHistory = document.getElementById('chat-history');
    
    // Get saved state or default to visible
    let isHistoryVisible = localStorage.getItem('chat-history-visible') !== 'false';
    
    // Set initial state
    updateHistoryVisibility();
    
    // Add click handler
    if (toggleHistoryBtn) {
        toggleHistoryBtn.addEventListener('click', function() {
            isHistoryVisible = !isHistoryVisible;
            localStorage.setItem('chat-history-visible', isHistoryVisible);
            updateHistoryVisibility();
        });
    }
    
    // Function to update UI based on visibility state
    function updateHistoryVisibility() {
        if (chatHistory) {
            chatHistory.style.display = isHistoryVisible ? 'block' : 'none';
        }
        
        if (toggleHistoryBtn) {
            toggleHistoryBtn.innerHTML = isHistoryVisible ? 
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="18 15 12 9 6 15"></polyline>
                </svg>` : 
                `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                </svg>`;
            
            toggleHistoryBtn.setAttribute('aria-label', isHistoryVisible ? 'Hide history' : 'Show history');
        }
    }
    
    // Star functionality for AI messages
    // Load starred messages from localStorage
    let starredMessages = {};
    try {
        const savedStarred = localStorage.getItem('starred-messages');
        if (savedStarred) {
            starredMessages = JSON.parse(savedStarred);
        }
    } catch (error) {
        console.error('Error loading starred messages:', error);
    }
    
    // Function to add star buttons to AI messages
    function addStarButtonsToMessages() {
        // Get all AI message bubbles
        const aiMessageBubbles = document.querySelectorAll('.ai-message .message-bubble');
        
        aiMessageBubbles.forEach((bubble, index) => {
            // Check if this bubble already has a star button
            if (!bubble.querySelector('.star-btn')) {
                // Create a unique ID for this message
                const messageId = `ai-message-${Date.now()}-${index}`;
                bubble.dataset.messageId = messageId;
                
                // Create star button
                const starButton = document.createElement('button');
                starButton.classList.add('speech-btn', 'star-btn');
                starButton.title = 'Add to favorites';
                
                // Check if this message is already starred
                if (starredMessages[messageId]) {
                    starButton.classList.add('starred');
                    starButton.title = 'Remove from favorites';
                }
                
                // Add star icon
                starButton.innerHTML = `
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="star-icon">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                    </svg>
                `;
                
                // Add click event
                starButton.addEventListener('click', function() {
                    const messageId = bubble.dataset.messageId;
                    
                    if (starredMessages[messageId]) {
                        // Unstar
                        delete starredMessages[messageId];
                        starButton.classList.remove('starred');
                        starButton.title = 'Add to favorites';
                    } else {
                        // Star
                        starredMessages[messageId] = {
                            content: bubble.textContent.trim(),
                            timestamp: Date.now()
                        };
                        starButton.classList.add('starred');
                        starButton.title = 'Remove from favorites';
                    }
                    
                    // Save to localStorage
                    localStorage.setItem('starred-messages', JSON.stringify(starredMessages));
                });
                
                // Add button to bubble
                bubble.appendChild(starButton);
            }
        });
    }
    
    // Add star buttons to existing messages
    addStarButtonsToMessages();
    
    // Observe for new messages to add star buttons
    const messagesContainer = document.getElementById('messages');
    if (messagesContainer) {
        // Create a MutationObserver to watch for new messages
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                if (mutation.addedNodes.length) {
                    // New nodes were added, check if they're AI messages
                    addStarButtonsToMessages();
                }
            });
        });
        
        // Start observing
        observer.observe(messagesContainer, { childList: true, subtree: true });
    }
    
    // Modify the existing addMessageToUI function to add star buttons to new AI messages
    // This assumes you have access to the original function
    const originalAddMessageToUI = window.addMessageToUI;
    if (typeof originalAddMessageToUI === 'function') {
        window.addMessageToUI = function(content, isUser) {
            // Call the original function
            originalAddMessageToUI(content, isUser);
            
            // If it's an AI message, add star button
            if (!isUser) {
                setTimeout(addStarButtonsToMessages, 0);
            }
        };
    }
});