// Firebase Config (Replace with your actual config)
const firebaseConfig = {
  apiKey: "AIzaSyAn3UHBi8MJcyrf5ujneUCA723premvecY",
  authDomain: "chat-5ce25.firebaseapp.com",
  projectId: "chat-5ce25",
  storageBucket: "chat-5ce25.firebasestorage.app",
  messagingSenderId: "1096945807561",
  appId: "1:1096945807561:web:0627da441c244041f51d18"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();

// DOM Elements
const loginScreen = document.getElementById('auth-screen');
const appContainer = document.getElementById('app-container');
const usernameInput = document.getElementById('login-email');
const loginBtn = document.getElementById('login-user-btn');
const registerBtn = document.getElementById('register-user-btn');
const displayUsername = document.getElementById('display-username');
const userAvatar = document.getElementById('user-avatar');
const chatBox = document.getElementById('chat-box');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const usersList = document.getElementById('users');
const onlineCount = document.getElementById('online-count');
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');
const startVideoBtn = document.getElementById('start-video');
const endVideoBtn = document.getElementById('end-video');
const videoContainer = document.getElementById('video-container');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const callRequestModal = document.getElementById('call-request');
const acceptCallBtn = document.getElementById('accept-call');
const rejectCallBtn = document.getElementById('reject-call');
const callerNameDisplay = document.getElementById('caller-name');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');

// App State
let peer;
let currentUsername = '';
let activeConnections = {};
let localStream;
let videoCall;
let incomingCall = null;

// Auth State Listener
auth.onAuthStateChanged((user) => {
    if (user) {
        // User is logged in
        currentUsername = user.displayName || user.email.split('@')[0];
        displayUsername.textContent = currentUsername;
        userAvatar.textContent = currentUsername.charAt(0).toUpperCase();
        
        // Initialize PeerJS with user's UID for unique identification
        initializePeer(user.uid);
        
        // Hide auth screen, show app
        loginScreen.style.display = 'none';
        appContainer.style.display = 'flex';
    } else {
        // No user logged in
        loginScreen.style.display = 'flex';
        appContainer.style.display = 'none';
    }
});

// Auth Tab Toggle
loginTab.addEventListener('click', () => {
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
});

registerTab.addEventListener('click', () => {
    loginForm.style.display = 'none';
    registerForm.style.display = 'block';
    loginTab.classList.remove('active');
    registerTab.classList.add('active');
});

// Login Handler
loginBtn.addEventListener('click', () => {
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .catch((error) => {
            alert("Login failed: " + error.message);
        });
});

// Registration Handler
registerBtn.addEventListener('click', () => {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            return userCredential.user.updateProfile({
                displayName: name
            });
        })
        .catch((error) => {
            alert("Registration failed: " + error.message);
        });
});

// Theme Toggle
themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        themeIcon.classList.replace('fa-moon', 'fa-sun');
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.classList.replace('fa-sun', 'fa-moon');
        localStorage.setItem('theme', 'light');
    }
});

// Initialize theme from localStorage
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.classList.replace('fa-moon', 'fa-sun');
}

// Initialize PeerJS connection
function initializePeer(userId) {
    peer = new Peer(`vidyora-${userId.substring(0, 8)}-${Math.floor(Math.random() * 1000)}`);
    
    peer.on('open', (id) => {
        addSystemMessage(`Welcome, ${currentUsername}! Your ID: ${id}`);
    });
    
    // Handle incoming connections
    peer.on('connection', (conn) => {
        setupConnection(conn);
    });
    
    // Handle incoming calls
    peer.on('call', (call) => {
        // Show call request instead of auto-answering
        const callerId = call.peer;
        const callerName = callerId.split('-')[1] || 'Unknown';
        showCallRequest(callerName, call);
    });
    
    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        addSystemMessage(`Connection error: ${err.message}`);
    });
}

// Set up a data connection
function setupConnection(conn) {
    conn.on('open', () => {
        // Add to active connections
        activeConnections[conn.peer] = conn;
        updateUserList();
        
        // Send our user info
        conn.send({
            type: 'user-join',
            user: currentUsername,
            timestamp: new Date().toISOString()
        });
    });
    
    conn.on('data', (data) => {
        handleIncomingData(data, conn);
    });
    
    conn.on('close', () => {
        handleConnectionClose(conn);
    });
    
    conn.on('error', (err) => {
        console.error('Connection error:', err);
        handleConnectionClose(conn);
    });
}

// Handle incoming data
function handleIncomingData(data, conn) {
    switch (data.type) {
        case 'message':
            addMessage(data.user, data.text, false, data.timestamp);
            break;
            
        case 'user-join':
            addSystemMessage(`${data.user} joined the chat`);
            updateUserList();
            break;
            
        case 'video-offer':
            if (data.status) {
                addSystemMessage(`${data.user} is starting a video call`);
            } else {
                addSystemMessage(`${data.user} ended the video call`);
                remoteVideo.srcObject = null;
                videoContainer.classList.remove('active');
            }
            break;
    }
}

// Handle connection close
function handleConnectionClose(conn) {
    if (activeConnections[conn.peer]) {
        addSystemMessage(`${conn.peer.split('-')[1]} disconnected`);
        delete activeConnections[conn.peer];
        updateUserList();
    }
}

// Update user list
function updateUserList() {
    usersList.innerHTML = '';
    const uniqueUsers = new Set();
    
    Object.keys(activeConnections).forEach(peerId => {
        const username = peerId.split('-')[1] || 'Unknown';
        uniqueUsers.add(username);
    });
    
    uniqueUsers.forEach(username => {
        const li = document.createElement('li');
        li.className = 'user-item';
        li.innerHTML = `
            <div class="user-item-avatar">${username.charAt(0).toUpperCase()}</div>
            <div class="user-item-name">${username}</div>
            <div class="user-item-status"></div>
        `;
        usersList.appendChild(li);
    });
    
    onlineCount.textContent = uniqueUsers.size;
}

// Send message handler
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !currentUsername) return;
    
    const timestamp = new Date().toISOString();
    addMessage(currentUsername, message, true, timestamp);
    messageInput.value = '';
    messageInput.focus();
    
    // Broadcast to all connected peers
    Object.values(activeConnections).forEach(conn => {
        conn.send({
            type: 'message',
            user: currentUsername,
            text: message,
            timestamp: timestamp
        });
    });
}

// Start video chat
startVideoBtn.addEventListener('click', async () => {
    try {
        // Get user media
        localStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        
        localVideo.srcObject = localStream;
        videoContainer.classList.add('active');
        startVideoBtn.disabled = true;
        endVideoBtn.disabled = false;
        
        // Notify peers video is available
        Object.values(activeConnections).forEach(conn => {
            conn.send({
                type: 'video-offer',
                status: true,
                user: currentUsername
            });
            
            // Initiate call
            const call = peer.call(conn.peer, localStream);
            call.on('stream', (remoteStream) => {
                remoteVideo.srcObject = remoteStream;
            });
            videoCall = call;
        });
        
    } catch (err) {
        console.error("Media error:", err);
        addSystemMessage("Could not access camera/microphone");
    }
});

// End video chat
endVideoBtn.addEventListener('click', () => {
    stopVideoCall();
});

function stopVideoCall() {
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localStream = null;
    }
    if (videoCall) {
        videoCall.close();
        videoCall = null;
    }
    
    localVideo.srcObject = null;
    remoteVideo.srcObject = null;
    videoContainer.classList.remove('active');
    startVideoBtn.disabled = false;
    endVideoBtn.disabled = true;
    
    // Notify peers video ended
    Object.values(activeConnections).forEach(conn => {
        conn.send({
            type: 'video-offer',
            status: false,
            user: currentUsername
        });
    });
}

// Call Request System
function showCallRequest(callerName, call) {
    incomingCall = call;
    callerNameDisplay.textContent = `${callerName} wants to video chat`;
    callRequestModal.style.display = 'block';
}

acceptCallBtn.addEventListener('click', async () => {
    if (incomingCall) {
        try {
            // Get user media if not already available
            if (!localStream) {
                localStream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });
                localVideo.srcObject = localStream;
            }
            
            videoContainer.classList.add('active');
            startVideoBtn.disabled = true;
            endVideoBtn.disabled = false;
            
            incomingCall.answer(localStream);
            incomingCall.on('stream', (remoteStream) => {
                remoteVideo.srcObject = remoteStream;
            });
            
            callRequestModal.style.display = 'none';
            addSystemMessage(`You accepted the video call from ${callerNameDisplay.textContent.split(' ')[0]}`);
        } catch (err) {
            console.error("Error answering call:", err);
            addSystemMessage("Failed to start video call");
        }
    }
});

rejectCallBtn.addEventListener('click', () => {
    if (incomingCall) {
        incomingCall.close();
        callRequestModal.style.display = 'none';
        addSystemMessage(`You rejected the video call from ${callerNameDisplay.textContent.split(' ')[0]}`);
    }
});

// Add message to chat
function addMessage(user, text, isCurrentUser, timestamp) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isCurrentUser ? 'user' : 'peer'}`;
    
    const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    messageDiv.innerHTML = `
        ${!isCurrentUser ? `<span class="sender">${user}</span>` : ''}
        ${text}
        <span class="timestamp">${time}</span>
    `;
    
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Add system message
function addSystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Event listeners
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Auto-focus email input on load
window.addEventListener('load', () => {
    document.getElementById('login-email').focus();
});
