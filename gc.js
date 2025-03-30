// Firebase configuration (replace with your own)
// Initialize Firebase
// Firebase configuration - keep your existing config
const firebaseConfig = {
  apiKey: "AIzaSyBQ2aQZdBhMk6-0hL1JOq05sJfVKtYfmhU",
  authDomain: "group-chat-b2a3c.firebaseapp.com",
  databaseURL: "https://group-chat-b2a3c-default-rtdb.firebaseio.com",
  projectId: "group-chat-b2a3c",
  storageBucket: "group-chat-b2a3c.firebasestorage.app",
  messagingSenderId: "652138733251",
  appId: "1:652138733251:web:c482f131b177a8b5f78c76"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const onlineCount = document.getElementById('online-count');
const signOutBtn = document.getElementById('sign-out-btn');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailLoginBtn = document.getElementById('email-login');
const emailSignupBtn = document.getElementById('email-signup');

// Global variables
let currentUser = null;
let usersOnline = {};

// Initialize the app
function init() {
    // Check auth state
    auth.onAuthStateChanged((user) => {
        if (user) {
            currentUser = {
                id: user.uid,
                name: user.email.split('@')[0], // Use email prefix as username
                email: user.email
            };
            enterChat();
        } else {
            loginScreen.classList.remove('hidden');
            chatScreen.classList.add('hidden');
        }
    });

    // Event listeners
    emailLoginBtn.addEventListener('click', signInWithEmail);
    emailSignupBtn.addEventListener('click', signUpWithEmail);
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });
    signOutBtn.addEventListener('click', signOut);
}

// Email Sign In
function signInWithEmail() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!validateEmailPassword(email, password)) return;
    
    setAuthButtonsDisabled(true);
    
    auth.signInWithEmailAndPassword(email, password)
        .catch((error) => {
            showAuthError(error);
            setAuthButtonsDisabled(false);
        });
}

// Email Sign Up
function signUpWithEmail() {
    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();
    
    if (!validateEmailPassword(email, password)) return;
    
    setAuthButtonsDisabled(true);
    
    auth.createUserWithEmailAndPassword(email, password)
        .then(() => {
            // Clear inputs after successful signup
            emailInput.value = '';
            passwordInput.value = '';
        })
        .catch((error) => {
            showAuthError(error);
            setAuthButtonsDisabled(false);
        });
}

function validateEmailPassword(email, password) {
    if (!email || !password) {
        alert('Please enter both email and password');
        return false;
    }
    if (password.length < 6) {
        alert('Password must be at least 6 characters');
        return false;
    }
    return true;
}

function setAuthButtonsDisabled(disabled) {
    emailLoginBtn.disabled = disabled;
    emailSignupBtn.disabled = disabled;
    emailLoginBtn.innerHTML = disabled 
        ? '<i class="fas fa-spinner fa-spin"></i> Processing...' 
        : '<i class="fas fa-sign-in-alt"></i> Sign In';
    emailSignupBtn.innerHTML = disabled 
        ? '<i class="fas fa-spinner fa-spin"></i> Processing...' 
        : '<i class="fas fa-user-plus"></i> Create Account';
}

function showAuthError(error) {
    console.error("Auth error:", error);
    let message = "Authentication failed. ";
    
    switch (error.code) {
        case 'auth/invalid-email':
            message += "Invalid email address.";
            break;
        case 'auth/user-disabled':
            message += "This account has been disabled.";
            break;
        case 'auth/user-not-found':
            message += "No account found with this email.";
            break;
        case 'auth/wrong-password':
            message += "Incorrect password.";
            break;
        case 'auth/email-already-in-use':
            message += "Email already in use.";
            break;
        case 'auth/weak-password':
            message += "Password is too weak.";
            break;
        default:
            message += "Please try again.";
    }
    
    alert(message);
}

// Rest of your existing chat functions (enterChat, sendMessage, loadMessages, etc.)
// ... keep all these functions exactly the same as in your original code ...

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username');
const googleLoginBtn = document.getElementById('google-login');
const guestLoginBtn = document.getElementById('guest-login');
const chatMessages = document.getElementById('chat-messages');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const onlineCount = document.getElementById('online-count');
const signOutBtn = document.getElementById('sign-out-btn');

// Global variables
let currentUser = null;
let usersOnline = {};

// Initialize the app
function init() {
    // Check auth state
    auth.onAuthStateChanged((user) => {
        if (user) {
            // User is signed in with Google
            currentUser = {
                id: user.uid,
                name: user.displayName || "Google User",
                isGuest: false,
                photoURL: user.photoURL || null
            };
            enterChat();
        } else {
            // No user is signed in
            loginScreen.classList.remove('hidden');
            chatScreen.classList.add('hidden');
        }
    });

    // Event listeners
    googleLoginBtn.addEventListener('click', signInWithGoogle);
    guestLoginBtn.addEventListener('click', signInAsGuest);
    sendBtn.addEventListener('click', sendMessage);
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    signOutBtn.addEventListener('click', signOut);
}

// Google Sign-In
function signInWithGoogle() {
    auth.signInWithPopup(provider)
        .catch((error) => {
            console.error("Google sign-in error:", error);
            alert("Google sign-in failed. Please try again or use guest mode.");
        });
}

// Guest Sign-In
function signInAsGuest() {
    const username = usernameInput.value.trim();
    
    if (username.length < 3) {
        alert('Username must be at least 3 characters');
        return;
    }
    
    if (username.length > 20) {
        alert('Username must be less than 20 characters');
        return;
    }
    
    currentUser = {
        id: 'guest_' + Math.random().toString(36).substr(2, 9),
        name: username,
        isGuest: true,
        photoURL: null
    };
    
    enterChat();
}

// Enter the chat
function enterChat() {
    // Add user to online list
    const userRef = database.ref('online/' + currentUser.id);
    userRef.set({
        name: currentUser.name,
        isGuest: currentUser.isGuest,
        timestamp: firebase.database.ServerValue.TIMESTAMP
    });
    
    userRef.onDisconnect().remove();
    
    // Show chat screen
    loginScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    messageInput.focus();
    
    // Load messages
    loadMessages();
    listenForMessages();
    trackOnlineUsers();
}

// Sign out
function signOut() {
    if (currentUser && !currentUser.isGuest) {
        auth.signOut();
    } else {
        // For guests, just go back to login screen
        database.ref('online/' + currentUser.id).remove();
        currentUser = null;
        loginScreen.classList.remove('hidden');
        chatScreen.classList.add('hidden');
    }
}

// Send message
function sendMessage() {
    const message = messageInput.value.trim();
    
    if (message === '') return;
    
    // Add message to Firebase
    database.ref('messages').push({
        userId: currentUser.id,
        userName: currentUser.name,
        text: message,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        isGuest: currentUser.isGuest
    });
    
    // Clear input
    messageInput.value = '';
}

// Load all previous messages
function loadMessages() {
    database.ref('messages').orderByChild('timestamp').once('value', (snapshot) => {
        chatMessages.innerHTML = '';
        snapshot.forEach((childSnapshot) => {
            const message = childSnapshot.val();
            addMessageToChat(message);
        });
        scrollToBottom();
    });
}

// Listen for new messages
function listenForMessages() {
    database.ref('messages').limitToLast(1).on('child_added', (snapshot) => {
        const message = snapshot.val();
        if (message.userId !== currentUser.id) { // Don't show our own messages twice
            addMessageToChat(message);
            scrollToBottom();
        }
    });
}

// Track online users
function trackOnlineUsers() {
    database.ref('online').on('value', (snapshot) => {
        usersOnline = snapshot.val() || {};
        const count = Object.keys(usersOnline).length;
        onlineCount.textContent = `${count} online`;
    });
}

// Add message to chat UI
function addMessageToChat(message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    const time = new Date(message.timestamp);
    const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageElement.innerHTML = `
        <div>
            <span class="message-user">${message.userName}</span>
            <span class="message-time">${timeString}</span>
        </div>
        <div class="message-content">${message.text}</div>
    `;
    
    chatMessages.appendChild(messageElement);
}

// Scroll to bottom of chat
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
document.addEventListener('DOMContentLoaded', init);
