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
    // Create more reliable peer ID
    peer = new Peer(`vidyora-${userId.substring(0, 8)}-${Date.now().toString(36)}`, {
        debug: 3,
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ]
        }
    });
    
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
        showCallRequest(callerName, call);
    });
    
    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        addSystemMessage(`Connection error: ${err.message}`);
        
        // Attempt to reconnect if peer is disconnected
        if (err.type === 'disconnected') {
            setTimeout(() => {
                initializePeer(userId);
            }, 2000);
        }
    });
    
    peer.on('disconnected', () => {
        addSystemMessage('Connection lost. Reconnecting...');
        setTimeout(() => {
            peer.reconnect();
        }, 2000);
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
                if (activeCalls[conn.peer]) {
                    activeCalls[conn.peer].close();
                    delete activeCalls[conn.peer];
                }
                if (Object.keys(activeCalls).length === 0) {
                    remoteVideo.srcObject = null;
                    videoContainer.classList.remove('active');
                }
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
        const username = conn.peer.split('-')[1] || 'Unknown';
        addSystemMessage(`${username} disconnected`);
        delete activeConnections[conn.peer];
        
        // Close any active calls with this peer
        if (activeCalls[conn.peer]) {
            activeCalls[conn.peer].close();
            delete activeCalls[conn.peer];
        }
        
        updateUserList();
        
        // Hide video container if no active calls remain
        if (Object.keys(activeCalls).length === 0) {
            remoteVideo.srcObject = null;
            videoContainer.classList.remove('active');
        }
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
        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 },
                facingMode: 'user'
            },
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }
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
        
        // Stop any existing stream
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }
        
        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        localVideo.srcObject = localStream;
        videoContainer.classList.add('active');
        startVideoBtn.disabled = true;
        endVideoBtn.disabled = false;
        
        // Update media control buttons
        muteMicBtn.innerHTML = '<i class="fas fa-microphone"></i>';
        disableCamBtn.innerHTML = '<i class="fas fa-video"></i>';
        
        // Notify all connections and initiate calls
        Object.values(activeConnections).forEach(conn => {
            conn.send({
                type: 'video-offer',
                status: true,
                user: currentUsername
            });
            
            const call = peer.call(conn.peer, localStream);
            call.on('stream', (remoteStream) => {
                remoteVideo.srcObject = remoteStream;
                activeCalls[conn.peer] = call;
            });
            
            call.on('close', () => {
                if (activeCalls[conn.peer]) {
                    delete activeCalls[conn.peer];
                }
                if (Object.keys(activeCalls).length === 0) {
                    remoteVideo.srcObject = null;
                    videoContainer.classList.remove('active');
                }
            });
            
            call.on('error', (err) => {
                console.error('Call error:', err);
                if (activeCalls[conn.peer]) {
                    delete activeCalls[conn.peer];
                }
            });
        });
        
    } catch (err) {
        console.error("Media error:", err);
        addSystemMessage("Could not access camera/microphone: " + err.message);
        startVideoBtn.disabled = false;
        endVideoBtn.disabled = true;
    }
}

function stopVideoCall() {
    // Stop all local tracks
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
    }
    
    // Close all active calls
    Object.values(activeCalls).forEach(call => {
        call.close();
    });
    activeCalls = {};
    
    // Notify all connections
    Object.values(activeConnections).forEach(conn => {
        conn.send({
            type: 'video-offer',
            status: false,
            user: currentUsername
        });
    });
    
    videoContainer.classList.remove('active');
    startVideoBtn.disabled = false;
    endVideoBtn.disabled = true;
}

// Screen Sharing
screenShareBtn.addEventListener('click', async () => {
    try {
        // Stop any existing screen share
        if (screenStream) {
            screenStream.getTracks().forEach(track => track.stop());
        }
        
        screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: {
                cursor: 'always',
                displaySurface: 'monitor'
            },
            audio: false
        });
        
        // Replace video track in all active calls
        const screenTrack = screenStream.getVideoTracks()[0];
        Object.values(activeCalls).forEach(call => {
            const sender = call.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
            if (sender) {
                sender.replaceTrack(screenTrack);
            }
        });
        
        // Update UI
        screenShareBtn.innerHTML = '<i class="fas fa-times"></i>';
        screenShareBtn.style.backgroundColor = '#d63031';
        
        // Handle when screen sharing is stopped
        screenTrack.onended = () => {
            stopScreenShare();
        };
        
    } catch (err) {
        console.error("Screen share failed:", err);
        addSystemMessage("Screen sharing failed: " + err.message);
    }
});

function stopScreenShare() {
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        screenStream = null;
    }
    
    // Restore camera if available
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            Object.values(activeCalls).forEach(call => {
                const sender = call.peerConnection.getSenders().find(s => s.track && s.track.kind === 'video');
                if (sender) {
                    sender.replaceTrack(videoTrack);
                }
            });
        }
    }
    
    // Update UI
    screenShareBtn.innerHTML = '<i class="fas fa-desktop"></i>';
    screenShareBtn.style.backgroundColor = '';
}

// Media Controls
muteMicBtn.addEventListener('click', () => {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            muteMicBtn.innerHTML = audioTrack.enabled ? 
                '<i class="fas fa-microphone"></i>' : 
                '<i class="fas fa-microphone-slash"></i>';
            muteMicBtn.style.backgroundColor = audioTrack.enabled ? '' : '#d63031';
        }
    }
});

disableCamBtn.addEventListener('click', () => {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            disableCamBtn.innerHTML = videoTrack.enabled ? 
                '<i class="fas fa-video"></i>' : 
                '<i class="fas fa-video-slash"></i>';
            disableCamBtn.style.backgroundColor = videoTrack.enabled ? '' : '#d63031';
        }
    }
});

videoQualitySelect.addEventListener('change', () => {
    if (!localStream) return;
    
    const videoTrack = localStream.getVideoTracks()[0];
    if (!videoTrack) return;
    
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
        .then(() => {
            addSystemMessage(`Video quality set to ${videoQualitySelect.value.toUpperCase()}`);
        })
        .catch(err => {
            console.error("Error adjusting quality:", err);
            addSystemMessage("Failed to adjust video quality");
        });
});

// Call Request System
function showCallRequest(callerName, call) {
    incomingCall = call;
    callerNameDisplay.textContent = `${callerName} wants to video chat`;
    callRequestModal.style.display = 'block';
    
    // Auto-reject after 30 seconds if no response
    setTimeout(() => {
        if (callRequestModal.style.display === 'block') {
            rejectCallBtn.click();
        }
    }, 30000);
}

acceptCallBtn.addEventListener('click', async () => {
    if (incomingCall) {
        try {
            if (!localStream) {
                await startVideoChat();
            } else {
                videoContainer.classList.add('active');
            }
            
            incomingCall.answer(localStream);
            incomingCall.on('stream', (remoteStream) => {
                remoteVideo.srcObject = remoteStream;
                activeCalls[incomingCall.peer] = incomingCall;
            });
            
            incomingCall.on('close', () => {
                if (activeCalls[incomingCall.peer]) {
                    delete activeCalls[incomingCall.peer];
                }
                if (Object.keys(activeCalls).length === 0) {
                    remoteVideo.srcObject = null;
                    videoContainer.classList.remove('active');
                }
            });
            
            callRequestModal.style.display = 'none';
            incomingCall = null;
            
        } catch (err) {
            console.error("Error answering call:", err);
            callRequestModal.style.display = 'none';
            addSystemMessage("Failed to answer call: " + err.message);
        }
    }
});

rejectCallBtn.addEventListener('click', () => {
    if (incomingCall) {
        incomingCall.close();
        callRequestModal.style.display = 'none';
        addSystemMessage(`You rejected the video call`);
        incomingCall = null;
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
    
    // Add to recent connections
    addRecentConnection(peerId);
});

// Recent connections storage
function addRecentConnection(peerId) {
    let recent = JSON.parse(localStorage.getItem('recentConnections') || '[]');
    recent = recent.filter(id => id !== peerId); // Remove if already exists
    recent.unshift(peerId); // Add to beginning
    recent = recent.slice(0, 5); // Keep only last 5
    localStorage.setItem('recentConnections', JSON.stringify(recent));
}

// Copy ID Function
copyIdBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(peer.id)
        .then(() => {
            const originalText = copyIdBtn.innerHTML;
            copyIdBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
            copyIdBtn.classList.add('pulse');
            setTimeout(() => {
                copyIdBtn.innerHTML = originalText;
                copyIdBtn.classList.remove('pulse');
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            addSystemMessage("Failed to copy ID to clipboard");
        });
});
// Message Handling
function sendMessage() {
    const message = messageInput.value.trim();
    if (!message || !currentUsername) return;
    
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

// Event Listeners for Video Controls
startVideoBtn.addEventListener('click', startVideoChat);
endVideoBtn.addEventListener('click', stopVideoCall);

// File Upload Handler (Basic implementation)
document.getElementById('file-input').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        addSystemMessage("File too large (max 10MB)");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
        const fileData = {
            name: file.name,
            type: file.type,
            size: file.size,
            data: event.target.result
        };
        
        // Send to all active connections
        Object.values(activeConnections).forEach(conn => {
            conn.send({
                type: 'file',
                file: fileData,
                user: currentUsername,
                timestamp: new Date().toISOString()
            });
        });
        
        // Show in local chat
        handleIncomingFile({
            ...fileData,
            user: currentUsername
        });
    };
    reader.readAsDataURL(file);
});

// Connection Status Monitoring
function checkConnectionStatus() {
    setInterval(() => {
        if (peer && peer.disconnected) {
            addSystemMessage("Connection lost. Attempting to reconnect...");
            peer.reconnect();
        }
    }, 10000);
}

// Bandwidth Monitoring
function monitorBandwidth() {
    if (!peer || !localStream) return;
    
    setInterval(() => {
        if (Object.keys(activeCalls).length > 0) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.getSettings().then(settings => {
                    const bandwidthInfo = `Resolution: ${settings.width}x${settings.height} | FPS: ${settings.frameRate}`;
                    addSystemMessage(bandwidthInfo);
                });
            }
        }
    }, 30000);
}

// Auto-scroll chat to bottom
function setupChatAutoScroll() {
    const observer = new MutationObserver(() => {
        chatBox.scrollTop = chatBox.scrollHeight;
    });
    
    observer.observe(chatBox, {
        childList: true,
        subtree: true
    });
}

// Initialize connection monitoring
function initConnectionMonitoring() {
    monitorConnection();
    checkConnectionStatus();
    monitorBandwidth();
}

// Auto-focus email input on load
window.addEventListener('load', () => {
    loginEmail.focus();
    setupChatAutoScroll();
    initConnectionMonitoring();
    
    // Connection timeout warning
    setTimeout(() => {
        if (Object.keys(activeConnections).length === 0) {
            addSystemMessage("No peers connected. Share your ID with someone!");
        }
    }, 15000);
});

// Keyboard Shortcuts
document.addEventListener('keydown', (e) => {
    // Focus message input when '/' is pressed
    if (e.key === '/' && document.activeElement !== messageInput) {
        e.preventDefault();
        messageInput.focus();
    }
    
    // Start/stop video call with Ctrl+V (Cmd+V on Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        if (startVideoBtn.disabled) {
            stopVideoCall();
        } else {
            startVideoChat();
        }
    }
});

// Notification System
function showNotification(title, message) {
    if (Notification.permission === "granted") {
        new Notification(title, { body: message });
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(title, { body: message });
            }
        });
    }
}

// Handle browser visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        // Reduce bandwidth when tab is inactive
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = false;
            }
        }
    } else {
        // Restore when tab becomes active again
        if (localStream) {
            const videoTrack = localStream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = true;
            }
        }
    }
});

// Error Handling
window.addEventListener('error', (event) => {
    console.error("Global error:", event.error);
    addSystemMessage("An error occurred. Please refresh the page.");
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    // Close all connections and streams
    Object.values(activeConnections).forEach(conn => conn.close());
    Object.values(activeCalls).forEach(call => call.close());
    
    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
    }
    
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
    }
});

// Utility Functions
function getRandomColor() {
    const colors = ['#6c5ce7', '#00b894', '#0984e3', '#e84393', '#fd79a8', '#fdcb6e'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function formatTime(date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function throttle(func, limit) {
    let lastFunc;
    let lastRan;
    return function() {
        const context = this;
        const args = arguments;
        if (!lastRan) {
            func.apply(context, args);
            lastRan = Date.now();
        } else {
            clearTimeout(lastFunc);
            lastFunc = setTimeout(function() {
                if ((Date.now() - lastRan) >= limit) {
                    func.apply(context, args);
                    lastRan = Date.now();
                }
            }, limit - (Date.now() - lastRan));
        }
    };
}

// Initialize user avatar color
function initUserAvatar() {
    if (userAvatar) {
        userAvatar.style.backgroundColor = getRandomColor();
    }
}

// Initialize the app
initUserAvatar();
// 1. Encrypt a message
async function encryptMessage(message, publicKey) {
  const encoded = new TextEncoder().encode(message);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    encoded
  );
  return encrypted;
}

// 2. Record a call
function startRecording(stream) {
  const recorder = new MediaRecorder(stream);
  const chunks = [];
  
  recorder.ondataavailable = (e) => chunks.push(e.data);
  recorder.onstop = async () => {
    const blob = new Blob(chunks, { type: "video/webm" });
    const storageRef = ref(storage, `calls/${Date.now()}.webm`);
    await uploadBytes(storageRef, blob);
  };
  
  recorder.start();
  return recorder;
}

// 3. Save encrypted chat
async function saveChat(messages) {
  await setDoc(doc(db, "chats", chatId), {
    messages: messages.map(msg => ({
      sender: msg.sender,
      encryptedData: msg.encrypted,
      timestamp: new Date()
    }))
  });
}
