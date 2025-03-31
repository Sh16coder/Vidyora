document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const authContainer = document.getElementById('auth-container');
    const chatContainer = document.getElementById('chat-container');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    const loginTab = document.getElementById('login-tab');
    const signupTab = document.getElementById('signup-tab');
    const logoutBtn = document.getElementById('logout-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const messageInput = document.getElementById('message-input');
    const sendBtn = document.getElementById('send-btn');
    const messagesContainer = document.getElementById('messages-container');
    const conversations = document.querySelectorAll('.conversation');
    const typingIndicator = document.getElementById('typing-indicator');
    const userAvatar = document.getElementById('user-avatar');
    const avatarText = document.getElementById('avatar-text');
    const sidebarUsername = document.getElementById('sidebar-username');
    const groupName = document.getElementById('group-name');
    const groupIcon = document.getElementById('group-icon');
    const onlineCount = document.getElementById('online-count');
    
    // App State
    let currentUser = null;
    let currentGroup = 'general';
    let isTyping = false;
    let typingTimeout;
    let onlineUsers = [
        { username: 'Alex', status: 'online' },
        { username: 'Sam', status: 'online' },
        { username: 'Jordan', status: 'away' },
        { username: 'Taylor', status: 'online' },
        { username: 'Casey', status: 'offline' }
    ];
    
    // Initialize
    createParticles();
    loadTheme();
    checkAuth();
    
    // Event Listeners
    loginTab.addEventListener('click', () => switchAuthTab('login'));
    signupTab.addEventListener('click', () => switchAuthTab('signup'));
    
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    
    logoutBtn.addEventListener('click', handleLogout);
    themeToggle.addEventListener('click', toggleTheme);
    
    messageInput.addEventListener('input', handleTyping);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    sendBtn.addEventListener('click', sendMessage);
    
    conversations.forEach(conv => {
        conv.addEventListener('click', () => switchGroup(conv.dataset.group));
    });
    
    // Functions
    function checkAuth() {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user) {
            currentUser = user;
            showChat();
            loadMessages();
            updateUserInfo();
            simulateOtherUsers();
        }
    }
    
    function switchAuthTab(tab) {
        if (tab === 'login') {
            loginTab.classList.add('active');
            signupTab.classList.remove('active');
            loginForm.classList.add('active');
            signupForm.classList.remove('active');
        } else {
            loginTab.classList.remove('active');
            signupTab.classList.add('active');
            loginForm.classList.remove('active');
            signupForm.classList.add('active');
        }
    }
    
    function handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            showChat();
            loadMessages();
            updateUserInfo();
            simulateOtherUsers();
            showNotification('Welcome back!', 'You have successfully logged in.');
        } else {
            showNotification('Login failed', 'Invalid username or password', 'error');
        }
    }
    
    function handleSignup(e) {
        e.preventDefault();
        const username = document.getElementById('signup-username').value;
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;
        
        if (password !== confirm) {
            showNotification('Signup failed', 'Passwords do not match', 'error');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        if (users.some(u => u.username === username)) {
            showNotification('Signup failed', 'Username already exists', 'error');
            return;
        }
        
        const newUser = {
            username,
            password,
            joined: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        
        showChat();
        loadMessages();
        updateUserInfo();
        simulateOtherUsers();
        showNotification('Welcome!', 'Your account has been created.');
        
        // Clear form
        signupForm.reset();
        switchAuthTab('login');
    }
    
    function handleLogout() {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showAuth();
        showNotification('Logged out', 'You have been successfully logged out.');
    }
    
    function showAuth() {
        authContainer.style.display = 'flex';
        chatContainer.style.display = 'none';
    }
    
    function showChat() {
        authContainer.style.display = 'none';
        chatContainer.style.display = 'flex';
    }
    
    function updateUserInfo() {
        if (!currentUser) return;
        
        const firstLetter = currentUser.username.charAt(0).toUpperCase();
        avatarText.textContent = firstLetter;
        sidebarUsername.textContent = currentUser.username;
    }
    
    function switchGroup(group) {
        currentGroup = group;
        
        // Update active conversation
        conversations.forEach(conv => {
            conv.classList.remove('active');
            if (conv.dataset.group === group) {
                conv.classList.add('active');
            }
        });
        
        // Update group info
        const activeConv = document.querySelector(`.conversation[data-group="${group}"]`);
        if (activeConv) {
            const name = activeConv.querySelector('.conversation-name').textContent;
            const iconClass = activeConv.querySelector('i').className;
            
            groupName.textContent = name;
            groupIcon.className = iconClass;
            
            // Random online count
            onlineCount.textContent = Math.floor(Math.random() * 10) + 1;
        }
        
        loadMessages();
    }
    
    function loadMessages() {
        if (!currentUser || !currentGroup) return;
        
        // Clear messages
        messagesContainer.innerHTML = '';
        
        // Get messages from localStorage
        const allMessages = JSON.parse(localStorage.getItem('messages')) || {};
        const groupMessages = allMessages[currentGroup] || [];
        
        // Display messages
        groupMessages.forEach(msg => {
            addMessageToChat(msg.sender, msg.text, msg.timestamp, msg.sender === currentUser.username);
        });
        
        // Scroll to bottom
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }
    
    function addMessageToChat(sender, text, timestamp, isCurrentUser = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isCurrentUser ? 'sent' : 'received'}`;
        
        const now = new Date();
        const messageTime = timestamp ? new Date(timestamp) : now;
        const timeString = messageTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        // Random reactions for received messages
        let reactions = '';
        if (!isCurrentUser && Math.random() > 0.7) {
            const reactionTypes = ['👍', '❤️', '😂', '😮', '😢'];
            const count = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < count; i++) {
                reactions += `<span class="reaction">${reactionTypes[Math.floor(Math.random() * reactionTypes.length)]}</span>`;
            }
        }
        
        messageDiv.innerHTML = `
            <div class="message-content">
                ${text}
                <div class="message-info">
                    <span class="message-time">${timeString}</span>
                    ${isCurrentUser ? '<span class="message-status"><i class="fas fa-check"></i></span>' : ''}
                </div>
                ${reactions ? `<div class="message-reactions">${reactions}</div>` : ''}
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    function sendMessage() {
        const text = messageInput.value.trim();
        if (!text || !currentUser || !currentGroup) return;
        
        // Create message object
        const message = {
            sender: currentUser.username,
            text,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        const allMessages = JSON.parse(localStorage.getItem('messages')) || {};
        const groupMessages = allMessages[currentGroup] || [];
        groupMessages.push(message);
        allMessages[currentGroup] = groupMessages;
        localStorage.setItem('messages', JSON.stringify(allMessages));
        
        // Add to chat
        addMessageToChat(currentUser.username, text, new Date().toISOString(), true);
        
        // Clear input
        messageInput.value = '';
        
        // Simulate reply after a delay
        if (Math.random() > 0.3) {
            setTimeout(() => {
                simulateReply();
            }, Math.random() * 3000 + 1000);
        }
    }
    
    function simulateReply() {
        const otherUsers = ['Alex', 'Sam', 'Jordan', 'Taylor', 'Casey'];
        const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
        const messages = [
            "Hey there!",
            "How's it going?",
            "That's interesting!",
            "I was thinking the same thing!",
            "Let's discuss this later.",
            "👍",
            "Can you explain more about that?",
            "I agree with you.",
            "What are your plans for today?",
            "That's awesome!",
            "Have you seen the latest update?",
            "Let me check and get back to you.",
            "😂",
            "No way!",
            "That's hilarious!",
            "I'll be there in 10 minutes.",
            "Thanks for letting me know.",
            "Perfect!",
            "Let's meet up soon.",
            "What do you think about this?"
        ];
        
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        // Create message object
        const message = {
            sender: randomUser,
            text: randomMessage,
            timestamp: new Date().toISOString()
        };
        
        // Save to localStorage
        const allMessages = JSON.parse(localStorage.getItem('messages')) || {};
        const groupMessages = allMessages[currentGroup] || [];
        groupMessages.push(message);
        allMessages[currentGroup] = groupMessages;
        localStorage.setItem('messages', JSON.stringify(allMessages));
        
        // Add to chat
        addMessageToChat(randomUser, randomMessage, new Date().toISOString(), false);
        
        // Show typing indicator briefly before message appears
        showTypingIndicator(randomUser);
    }
    
    function handleTyping() {
        if (!isTyping) {
            isTyping = true;
            // In a real app, you would send a "user is typing" event to other users
        }
        
        clearTimeout(typingTimeout);
        typingTimeout = setTimeout(() => {
            isTyping = false;
            // In a real app, you would send a "user stopped typing" event
        }, 2000);
    }
    
    function showTypingIndicator(user) {
        typingIndicator.style.display = 'flex';
        typingIndicator.setAttribute('data-user', user);
        
        setTimeout(() => {
            typingIndicator.style.display = 'none';
        }, 1500);
    }
    
    function simulateOtherUsers() {
        // Simulate random online status changes
        setInterval(() => {
            onlineUsers.forEach(user => {
                if (Math.random() > 0.7) {
                    const statuses = ['online', 'away', 'offline'];
                    user.status = statuses[Math.floor(Math.random() * statuses.length)];
                }
            });
        }, 10000);
        
        // Simulate random messages from other users
        setInterval(() => {
            if (Math.random() > 0.8) {
                simulateReply();
            }
        }, 15000);
    }
    
    function createParticles() {
        const particlesContainer = document.getElementById('particles');
        const particleCount = 30;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            
            // Random properties
            const size = Math.random() * 10 + 5;
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            const opacity = Math.random() * 0.5 + 0.1;
            const duration = Math.random() * 20 + 10;
            const delay = Math.random() * 5;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.left = `${posX}%`;
            particle.style.top = `${posY}%`;
            particle.style.opacity = opacity;
            particle.style.animationDuration = `${duration}s`;
            particle.style.animationDelay = `${delay}s`;
            
            particlesContainer.appendChild(particle);
        }
    }
    
    function toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }
    
    function loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
    }
    
    function showNotification(title, message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${type === 'error' ? 'fa-exclamation' : 'fa-check'}"></i>
            </div>
            <div class="notification-content">
                <h4>${title}</h4>
                <p>${message}</p>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('active');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('active');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }
    
    // Initialize with some sample messages if none exist
    if (!localStorage.getItem('messages')) {
        const sampleMessages = {
            general: [
                { sender: 'Alex', text: 'Hey everyone! Welcome to the group!', timestamp: new Date(Date.now() - 86400000).toISOString() },
                { sender: 'Sam', text: 'Thanks! Excited to be here.', timestamp: new Date(Date.now() - 86300000).toISOString() },
                { sender: 'Jordan', text: 'What are we discussing today?', timestamp: new Date(Date.now() - 86000000).toISOString() }
            ],
            tech: [
                { sender: 'Taylor', text: 'Did you see the new JavaScript framework?', timestamp: new Date(Date.now() - 86400000).toISOString() },
                { sender: 'Casey', text: 'Yes! It looks promising.', timestamp: new Date(Date.now() - 86300000).toISOString() }
            ],
            gaming: [
                { sender: 'Alex', text: 'Who wants to play tonight?', timestamp: new Date(Date.now() - 86400000).toISOString() },
                { sender: 'Sam', text: 'I\'m in! What time?', timestamp: new Date(Date.now() - 86300000).toISOString() }
            ]
        };
        
        localStorage.setItem('messages', JSON.stringify(sampleMessages));
    }
});
