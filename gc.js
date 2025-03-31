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

// Tab Switching (for gc.html)
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
        // Redirect from gc.html to chat.html
        if (window.location.pathname.includes('gc.html')) {
            window.location.href = 'chat.html';
        }
        
        // Set user initial (for chat.html)
        if (usernameInitial) {
            usernameInitial.textContent = user.email.charAt(0).toUpperCase();
        }
        
        // Load messages (for chat.html)
        if (messageContainer) {
            loadMessages();
        }
    } else {
        // Redirect to gc.html if not authenticated
        if (!window.location.pathname.includes('gc.html')) {
            window.location.href = 'gc.html';
        }
    }
});

// Login Function (for gc.html)
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        try {
            await auth.signInWithEmailAndPassword(email, password);
        } catch (error) {
            showStatusMessage(error.message, 'error');
        }
    });
}

// Register Function (for gc.html)
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

// Chat Page Functions (for chat.html)
if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        auth.signOut();
    });
}

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
                displayMessage(doc.data());
            });
            messageContainer.scrollTop = messageContainer.scrollHeight;
        });
}

function displayMessage(message) {
    const user = auth.currentUser;
    const isCurrentUser = message.sender === user.email;
    
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', isCurrentUser ? 'sent' : 'received');
    
    messageDiv.innerHTML = `
        <div>${message.text}</div>
        <span class="message-time">
            ${message.timestamp ? message.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
        </span>
    `;
    
    messageContainer.appendChild(messageDiv);
    messageContainer.scrollTop = messageContainer.scrollHeight;
}

function showStatusMessage(text, type) {
    if (!statusMessage) return;
    
    statusMessage.textContent = text;
    statusMessage.className = 'status-message ' + type;
    
    setTimeout(() => {
        statusMessage.textContent = '';
        statusMessage.className = 'status-message';
    }, 5000);
}

// Mobile Menu (for chat.html)
if (hamburger) {
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        sidebar.classList.toggle('active');
    });
}
