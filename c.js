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
const loginEmail = document.getElementById('login-email');
const loginPassword = document.getElementById('login-password');
const loginBtn = document.getElementById('login-user-btn');
const registerName = document.getElementById('register-name');
const registerEmail = document.getElementById('register-email');
const registerPassword = document.getElementById('register-password');
const registerBtn = document.getElementById('register-user-btn');
const loginTab = document.getElementById('login-tab');
const registerTab = document.getElementById('register-tab');
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
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
const peerIdInput = document.getElementById('peer-id-input');
const connectBtn = document.getElementById('connect-btn');
const peerIdDisplay = document.getElementById('peer-id-display');
const copyIdBtn = document.getElementById('copy-id-btn');
const screenShareBtn = document.getElementById('screen-share-btn');
const muteMicBtn = document.getElementById('mute-mic-btn');
const disableCamBtn = document.getElementById('disable-cam-btn');
const videoQualitySelect = document.getElementById('video-quality');
const connectionQuality = document.getElementById('connection-quality');
const pingDisplay = document.getElementById('ping-display');

// App State
let peer;
let currentUsername = '';
let activeConnections = {};
let activeCalls = {};
let localStream;
let screenStream;
let incomingCall = null;
let lastPingTime = Date.now();
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Mobile adjustments
if (isMobile) {
    document.body.classList.add('mobile');
    videoQualitySelect.value = 'sd';
}

// Viewport height fix
function setAppHeight() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    if (appContainer) {
        appContainer.style.height = window.innerHeight + 'px';
    }
}
setAppHeight();
window.addEventListener('resize', setAppHeight);
window.addEventListener('orientationchange', setAppHeight);

// Android keyboard fix
if (/Android/.test(navigator.userAgent)) {
    document.addEventListener('focusin', () => {
        window.scrollTo(0, 0);
    });
}

// Theme Management
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    themeIcon.classList.replace('fa-moon', 'fa-sun');
}

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

// Cleanup resources function
function cleanupResources() {
    // Clean up all connections
    Object.values(activeConnections).forEach(conn => {
        conn.close();
    });
    activeConnections = {};
    
    // Clean up calls
    Object.values(activeCalls).forEach(call => {
        call.close();
    });
    activeCalls = {};
    
    // Clean up media streams
    stopVideoCall();
    stopScreenShare();
    
    // Clean up peer
    if (peer) {
        peer.destroy();
        peer = null;
    }
}

// Auth State Listener
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUsername = user.displayName || user.email.split('@')[0];
        displayUsername.textContent = currentUsername;
        userAvatar.textContent = currentUsername.charAt(0).toUpperCase();
        initializePeer(user.uid);
        loginScreen.style.display = 'none';
        appContainer.style.display = 'flex';
    } else {
        cleanupResources();
        loginScreen.style.display = 'flex';
        appContainer.style.display = 'none';
    }
});

// Login Handler
loginBtn.addEventListener('click', () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();
    
    if (!email || !password) {
        alert('Please enter both email and password');
        return;
    }
    
    auth.signInWithEmailAndPassword(email, password)
        .catch((error) => {
            alert("Login failed: " + error.message);
        });
});

// Registration Handler
registerBtn.addEventListener('click', () => {
    const name = registerName.value.trim();
    const email = registerEmail.value.trim();
    const password = registerPassword.value.trim();
    
    if (!name || !email || !password) {
        alert('Please fill all fields');
        return;
    }
    
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

// PeerJS Initialization
function initializePeer(userId) {
    try {
        peer = new Peer(`vidyora-${userId.substring(0, 8)}-${Math.floor(Math.random() * 1000)}`, {
            host: '0.peerjs.com',
            port: 443,
            secure: true,
            path: '/',
            debug: 3,
            config: {
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
                ]
            }
        });
    } catch (err) {
        console.error('Failed to create Peer instance:', err);
        addSystemMessage('Failed to initialize connection service. Please refresh the page.');
        return;
    }
    
    peer.on('open', (id) => {
        peerIdDisplay.textContent = id;
        addSystemMessage(`Welcome, ${currentUsername}! Your ID: ${id}`);
        monitorConnection();
    });
    
    peer.on('connection', (conn) => {
        setupConnection(conn);
    });
    
    peer.on('call', (call) => {
        const callerId = call.peer;
        const callerName = callerId.split('-')[1] || 'Unknown';
        
        // Reject if already in a call
        if (Object.keys(activeCalls).length > 0) {
            call.close();
            addSystemMessage(`Rejected call from ${callerName} (already in a call)`);
            return;
        }
        
        showCallRequest(callerName, call);
    });
    
    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        addSystemMessage(`Connection error: ${err.message}`);
    });
}

// Connection Management
function setupConnection(conn) {
    conn.on('open', () => {
        activeConnections[conn.peer] = conn;
        updateUserList();
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
        case 'ping':
            conn.send({
                type: 'pong',
                timestamp: data.timestamp
            });
            break;
        case 'pong':
            const ping = Date.now() - data.timestamp;
            pingDisplay.textContent = `Ping: ${ping}ms`;
            updateConnectionQuality(ping);
            break;
        case 'typing':
            // Could add typing indicator UI here
            break;
        case 'file':
            handleIncomingFile(data.file);
            break;
    }
}

function handleConnectionClose(conn) {
    if (activeConnections[conn.peer]) {
        // Remove all event listeners
        conn.off('open');
        conn.off('data');
        conn.off('close');
        conn.off('error');
        
        addSystemMessage(`${conn.peer.split('-')[1]} disconnected`);
        delete activeConnections[conn.peer];
        updateUserList();
    }
}

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

// Video Chat Functions
async function startVideoChat() {
    try {
        // Check if devices are available
        const devices = await navigator.mediaDevices.enumerateDevices();
        const hasVideo = devices.some(device => device.kind === 'videoinput');
        const hasAudio = devices.some(device => device.kind === 'audioinput');
        
        if (!hasVideo || !hasAudio) {
            throw new Error('Required media devices not found');
        }
        
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 }
            },
            audio: true
        };
        
        // Adjust constraints based on quality setting
        switch(videoQualitySelect.value) {
            case 'hd':
                constraints.video.width.ideal = 1920;
                constraints.video.height.ideal = 1080;
                break;
            case 'sd':
                constraints.video.width.ideal = 1280;
                constraints.video.height.ideal = 720;
                break;
            case 'low':
                constraints.video.width.ideal = 640;
                constraints.video.height.ideal = 480;
                constraints.video.frameRate.ideal = 15;
                break;
        }
        
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        localVideo.srcObject = localStream;
        videoContainer.classList.add('active');
        startVideoBtn.disabled = true;
        endVideoBtn.disabled = false;
        
        Object.values(activeConnections).forEach(conn => {
            conn.send({
                type: 'video-offer',
                status: true,
                user: currentUsername
            });
            
            const call = peer.call(conn.peer, localStream);
            call.on('stream', (remoteStream) => {
                remoteVideo.srcObject = remoteStream;
            });
            
            call.on('close', () => {
                delete activeCalls[call.peer];
                remoteVideo.srcObject = null;
                videoContainer.classList.remove('active');
            });
            
            activeCalls[conn.peer] = call;
        });
        
    } catch (err) {
        console.error("Media error:", err);
        let errorMsg = "Could not access camera/microphone";
        
        if (err.name === 'NotAllowedError') {
            errorMsg = "Permission denied. Please allow camera/microphone access.";
        } else if (err.name === 'NotFoundError') {
            errorMsg = "No media devices found.";
        }
        
        addSystemMessage(errorMsg);
        
        // Reset UI state
        startVideoBtn.disabled = false;
        endVideoBtn.disabled = true;
    }
}

function stopVideoCall() {
    // Clean up all active calls
    Object.values(activeCalls).forEach(call => {
        call.close();
    });
    activeCalls = {};
    
    // Clean up local streams
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
        localStream = null;
    }
    
    remoteVideo.srcObject = null;
    videoContainer.classList.remove('active');
    startVideoBtn.disabled = false;
    endVideoBtn.disabled = true;
    
    // Notify peers
    Object.values(activeConnections).forEach(conn => {
        conn.send({
            type: 'video-offer',
            status: false,
            user: currentUsername
        });
    });
}

// Screen Sharing
screenShareBtn.addEventListener('click', async () => {
    try {
        screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true
        });
        
        const screenTrack = screenStream.getVideoTracks()[0];
        Object.values(activeConnections).forEach(conn => {
            const call = peer.call(conn.peer, screenStream);
            call.on('stream', stream => {
                remoteVideo.srcObject = stream;
            });
            activeCalls[conn.peer] = call;
        });
        
        screenTrack.onended = stopScreenShare;
    } catch (err) {
        console.error("Screen share failed:", err);
        addSystemMessage("Screen sharing failed or was canceled");
    }
});

function stopScreenShare() {
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        if (localStream) {
            Object.values(activeConnections).forEach(conn => {
                const call = peer.call(conn.peer, localStream);
                call.on('stream', stream => {
                    remoteVideo.srcObject = stream;
                });
                activeCalls[conn.peer] = call;
            });
        }
        screenStream = null;
    }
}

// Media Controls
muteMicBtn.addEventListener('click', () => {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        audioTrack.enabled = !audioTrack.enabled;
        muteMicBtn.innerHTML = audioTrack.enabled ? 
            '<i class="fas fa-microphone"></i>' : 
            '<i class="fas fa-microphone-slash"></i>';
    }
});

disableCamBtn.addEventListener('click', () => {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        videoTrack.enabled = !videoTrack.enabled;
        disableCamBtn.innerHTML = videoTrack.enabled ? 
            '<i class="fas fa-video"></i>' : 
            '<i class="fas fa-video-slash"></i>';
    }
});

videoQualitySelect.addEventListener('change', () => {
    if (!localStream) return;
    
    const videoTrack = localStream.getVideoTracks()[0];
    const constraints = {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 30 }
    };
    
    switch(videoQualitySelect.value) {
        case 'hd':
            constraints.width.ideal = 1920;
            constraints.height.ideal = 1080;
            break;
        case 'sd':
            constraints.width.ideal = 1280;
            constraints.height.ideal = 720;
            break;
        case 'low':
            constraints.width.ideal = 640;
            constraints.height.ideal = 480;
            constraints.frameRate.ideal = 15;
            break;
    }
    
    videoTrack.applyConstraints(constraints)
        .catch(err => console.error("Error adjusting quality:", err));
});

// Call Request System
function showCallRequest(callerName, call) {
    incomingCall = call;
    callerNameDisplay.textContent = `${callerName} wants to video chat`;
    callRequestModal.style.display = 'block';
}

acceptCallBtn.addEventListener('click', async () => {
    if (incomingCall) {
        try {
            if (!localStream) {
                await startVideoChat();
            }
            incomingCall.answer(localStream);
            activeCalls[incomingCall.peer] = incomingCall;
            
            incomingCall.on('stream', (remoteStream) => {
                remoteVideo.srcObject = remoteStream;
                videoContainer.classList.add('active');
            });
            
            incomingCall.on('close', () => {
                delete activeCalls[incomingCall.peer];
                remoteVideo.srcObject = null;
                videoContainer.classList.remove('active');
            });
            
            callRequestModal.style.display = 'none';
            incomingCall = null;
        } catch (err) {
            console.error("Error answering call:", err);
            callRequestModal.style.display = 'none';
        }
    }
});

rejectCallBtn.addEventListener('click', () => {
    if (incomingCall) {
        incomingCall.close();
        callRequestModal.style.display = 'none';
        addSystemMessage(`You rejected the video call`);
    }
});

// Peer Connection
connectBtn.addEventListener('click', () => {
    const peerId = peerIdInput.value.trim();
    if (!peerId) {
        addSystemMessage("Please enter a Peer ID");
        return;
    }
    
    if (peerId === peer.id) {
        addSystemMessage("Cannot connect to yourself");
        return;
    }
    
    if (activeConnections[peerId]) {
        addSystemMessage("Already connected to this peer");
        return;
    }
    
    const conn = peer.connect(peerId);
    setupConnection(conn);
    peerIdInput.value = "";
});

// Copy ID Function
copyIdBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(peer.id)
        .then(() => {
            const originalText = copyIdBtn.innerHTML;
            copyIdBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            setTimeout(() => {
                copyIdBtn.innerHTML = originalText;
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
        });
});

// Message Handling
function sendMessage() {
    let message = messageInput.value.trim();
    if (!message || !currentUsername) return;
    
    // Basic sanitization
    message = message.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    
    const timestamp = new Date().toISOString();
    addMessage(currentUsername, message, true, timestamp);
    messageInput.value = '';
  Object.values(activeConnections).forEach(conn => {
        conn.send({
            type: 'message',
            user: currentUsername,
            text: message,
            timestamp: timestamp
        });
    });
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Typing Indicator
messageInput.addEventListener('input', () => {
    Object.values(activeConnections).forEach(conn => {
        conn.send({
            type: 'typing',
            isTyping: messageInput.value.length > 0
        });
    });
});

// File Sharing (Basic implementation)
function handleIncomingFile(fileData) {
    const fileType = fileData.type.split('/')[0];
    let message;
  if (fileType === 'image') {
        message = `<a href="${fileData.data}" download="${fileData.name}">
            <img src="${fileData.data}" alt="${fileData.name}" style="max-width: 200px; border-radius: 10px;">
        </a>`;
    } else {
        message = `<a href="${fileData.data}" download="${fileData.name}">
            <i class="fas fa-file-download"></i> ${fileData.name} (${formatFileSize(fileData.size)})
        </a>`;
    }
    
    addMessage(fileData.user, message, false, new Date().toISOString());
}

function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Connection Monitoring
function monitorConnection() {
    setInterval(() => {
        lastPingTime = Date.now();
        Object.values(activeConnections).forEach(conn => {
            conn.send({
              type: 'ping',
                timestamp: lastPingTime
            });
        });
    }, 5000);
}

function updateConnectionQuality(ping) {
    if (ping < 100) {
        connectionQuality.textContent = "🟢 Excellent";
        connectionQuality.style.color = "#00b894";
    } else if (ping < 300) {
        connectionQuality.textContent = "🟡 Good";
        connectionQuality.style.color = "#fdcb6e";
    } else {
        connectionQuality.textContent = "🔴 Poor";
        connectionQuality.style.color = "#d63031";
    }
}

// Message Display Functions
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

function addSystemMessage(text) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message system';
    messageDiv.textContent = text;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Auto-focus email input on load
window.addEventListener('load', () => {
    loginEmail.focus();
    
    // Connection timeout warning
    setTimeout(() => {
        if (Object.keys(activeConnections).length === 0) {
            addSystemMessage("No peers connected. Share your ID with someone!");
        }
    }, 15000);
});
