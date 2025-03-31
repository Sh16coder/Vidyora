// Firebase Configuration (will be in firebase-config.js)
// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');
const statusMessage = document.querySelector('.status-message');
const logoutBtn = document.getElementById('logoutBtn');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const messageContainer = document.getElementById('messageContainer');
const usernameInitial = document.getElementById('usernameInitial');
const hamburger = document.querySelector('.hamburger');
const sidebar = document.querySelector('.sidebar');

// Tab Switching
if (tabBtns) {
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.getAttribute('data-tab');
            
            // Update active tab
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Show corresponding form
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${tab}Form`) {
                    form.classList.add('active');
                }
            });
        });
    });
}

// Auth State Listener
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        if (window.location.pathname.includes('index.html')) {
            window.location.href = 'chat.html';
        }
        
        // Set user initial
        if (usernameInitial) {
            usernameInitial.textContent = user.email.charAt(0).toUpperCase();
        }
        
        // Load messages
        if (messageContainer) {
            loadMessages();
        }
    } else {
        // No user is signed in
        if (!window.location.pathname.includes('index.html')) {
            window.location.href = 'index.html';
        }
    }
});

// Login Function
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            await auth.signInWithEmailAndPassword(email, password);
            // Success handled by auth state listener
        } catch (error) {
            showStatusMessage(error.message, 'error');
        }
    });
}

// Register Function
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
            showStatusMessage('Passwords do not match', 'error');
            return;
        }
        
        try {
            await auth.createUserWithEmailAndPassword(email, password);
            await auth.currentUser.sendEmailVerification();
            showStatusMessage('Verification email sent. Please check your inbox.', 'success');
        } catch (error) {
            showStatusMessage(error.message, 'error');
        }
    });
}

// Logout Function
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });
}

// Send Message Function
if (sendBtn) {
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

async function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText === '') return;
    
    const user = auth.currentUser;
    if (!user) return;
    
    try {
        await db.collection('messages').add({
            text: messageText,
            sender: user.email,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        messageInput.value = '';
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

function loadMessages() {
    db.collection('messages')
        .orderBy('timestamp')
        .onSnapshot(snapshot => {
            messageContainer.innerHTML = '';
            
            snapshot.forEach(doc => {
                const message = doc.data();
                displayMessage(message);
            });
            
            // Scroll to bottom
            messageContainer.scrollTop = messageContainer.scrollHeight;
        });
}

function displayMessage(message) {
    const user = auth.currentUser;
    const isCurrentUser = message.sender === user.email;
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(isCurrentUser ? 'sent' : 'received');
    
    const messageText = document.createElement('div');
    messageText.textContent = message.text;
    
    const messageTime = document.createElement('span');
    messageTime.classList.add('message-time');
    
    if (message.timestamp) {
        const date = message.timestamp.toDate();
        messageTime.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
        messageTime.textContent = 'Just now';
    }
    
    messageDiv.appendChild(messageText);
    messageDiv.appendChild(messageTime);
    messageContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function showStatusMessage(text, type) {
    statusMessage.textContent = text;
    statusMessage.className = 'status-message';
    statusMessage.classList.add(type);
    
    setTimeout(() => {
        statusMessage.classList.remove(type);
        statusMessage.textContent = '';
    }, 5000);
}

// Mobile Menu Toggle
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        sidebar.classList.toggle('active');
    });
}
