// Firebase configuration (replace with your own)
const firebaseConfig = {
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
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailLoginBtn = document.getElementById('email-login');
const emailSignupBtn = document.getElementById('email-signup');
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
            currentUser = {
                id: user.uid,
                name: user.displayName || user.email.split('@')[0],
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
        .then((userCredential) => {
            // Set display name (using email prefix)
            return userCredential.user.updateProfile({
                displayName: email.split('@')[0]
            });
        })
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

// Enter the chat
function enterChat() {
    // Add user to online list
    const userRef = database.ref('online/' + currentUser.id);
    userRef.set({
        name: currentUser.name,
        email: currentUser.email,
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
    auth.signOut()
        .then(() => {
            database.ref('online/' + currentUser.id).remove();
        })
        .catch((error) => {
            console.error("Sign out error:", error);
        });
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
        email: currentUser.email
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
