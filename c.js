// Firebase Config (Replace with your actual config)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
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
let localStream;
let screenStream;
let currentCall = null;
let incomingCall = null;
let lastPingTime = Date.now();
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Initialize with more reliable PeerJS configuration
function initializePeer(userId) {
    peer = new Peer(`chat-${userId.substring(0, 8)}-${Math.floor(Math.random() * 1000)}`, {
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' }
            ]
        },
        debug: 3
    });

    peer.on('open', (id) => {
        peerIdDisplay.textContent = id;
        addSystemMessage(`Welcome, ${currentUsername}! Your ID: ${id}`);
        monitorConnection();
    });

    peer.on('connection', (conn) => {
        setupConnection(conn);
    });

    peer.on('call', async (call) => {
        incomingCall = call;
        const callerId = call.peer;
        const callerName = callerId.split('-')[1] || 'Unknown';
        showCallRequest(callerName, call);
    });

    peer.on('error', (err) => {
        console.error('PeerJS error:', err);
        addSystemMessage(`Connection error: ${err.type || err.message}`);
        
        // Attempt to reconnect if connection is lost
        if (err.type === 'disconnected' || err.type === 'network') {
            setTimeout(() => initializePeer(userId), 5000);
        }
    });
}

// Improved video call functions
async function startVideoChat() {
    try {
        if (localStream) {
            localStream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
                frameRate: { ideal: 30 }
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

        localStream = await navigator.mediaDevices.getUserMedia(constraints);
        localVideo.srcObject = localStream;
        videoContainer.classList.add('active');
        startVideoBtn.disabled = true;
        endVideoBtn.disabled = false;
        muteMicBtn.disabled = false;
        disableCamBtn.disabled = false;

        // Update UI for mute/disable buttons
        updateMediaButtonStates();

        // Notify all connections and start calls
        Object.values(activeConnections).forEach(conn => {
            conn.send({
                type: 'video-offer',
                status: true,
                user: currentUsername
            });

            const call = peer.call(conn.peer, localStream);
            setupCallHandlers(call);
            currentCall = call;
        });

    } catch (err) {
        console.error("Media error:", err);
        let errorMessage = "Could not access camera/microphone";
        if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            errorMessage = "No camera/microphone found";
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            errorMessage = "Camera/microphone is already in use";
        } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errorMessage = "Permissions denied for camera/microphone";
        } else if (err.name === 'OverconstrainedError' || err.name === 'ConstraintNotSatisfiedError') {
            errorMessage = "Cannot satisfy video constraints";
        }
        addSystemMessage(errorMessage);
    }
}

function setupCallHandlers(call) {
    call.on('stream', (remoteStream) => {
        remoteVideo.srcObject = remoteStream;
        videoContainer.classList.add('active');
    });

    call.on('close', () => {
        if (remoteVideo.srcObject) {
            remoteVideo.srcObject.getTracks().forEach(track => track.stop());
            remoteVideo.srcObject = null;
        }
        videoContainer.classList.remove('active');
        addSystemMessage("Call ended");
    });

    call.on('error', (err) => {
        console.error('Call error:', err);
        addSystemMessage(`Call failed: ${err.message}`);
    });
}

async function stopVideoCall() {
    if (currentCall) {
        currentCall.close();
        currentCall = null;
    }

    if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        localVideo.srcObject = null;
        localStream = null;
    }

    if (remoteVideo.srcObject) {
        remoteVideo.srcObject.getTracks().forEach(track => track.stop());
        remoteVideo.srcObject = null;
    }

    videoContainer.classList.remove('active');
    startVideoBtn.disabled = false;
    endVideoBtn.disabled = true;
    muteMicBtn.disabled = true;
    disableCamBtn.disabled = true;

    Object.values(activeConnections).forEach(conn => {
        conn.send({
            type: 'video-offer',
            status: false,
            user: currentUsername
        });
    });
}

// Improved screen sharing
async function startScreenSharing() {
    try {
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

        const screenTrack = screenStream.getVideoTracks()[0];
        
        // Replace video track in existing call
        if (currentCall) {
            const sender = currentCall.peerConnection.getSenders()
                .find(s => s.track && s.track.kind === 'video');
            if (sender) {
                sender.replaceTrack(screenTrack);
            }
        }

        // Notify other peers
        Object.values(activeConnections).forEach(conn => {
            conn.send({
                type: 'screen-share',
                status: true,
                user: currentUsername
            });
        });

        screenTrack.onended = () => {
            stopScreenShare();
            addSystemMessage("Screen sharing ended");
        };

    } catch (err) {
        console.error("Screen share failed:", err);
        addSystemMessage("Screen sharing failed or was canceled");
    }
}

function stopScreenShare() {
    if (screenStream) {
        screenStream.getTracks().forEach(track => track.stop());
        screenStream = null;
    }

    // Switch back to camera if available
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (currentCall && videoTrack) {
            const sender = currentCall.peerConnection.getSenders()
                .find(s => s.track && s.track.kind === 'video');
            if (sender) {
                sender.replaceTrack(videoTrack);
            }
        }
    }

    Object.values(activeConnections).forEach(conn => {
        conn.send({
            type: 'screen-share',
            status: false,
            user: currentUsername
        });
    });
}

// Media controls
function updateMediaButtonStates() {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        const videoTrack = localStream.getVideoTracks()[0];
        
        muteMicBtn.innerHTML = audioTrack.enabled ? 
            '<i class="fas fa-microphone"></i>' : 
            '<i class="fas fa-microphone-slash"></i>';
            
        disableCamBtn.innerHTML = videoTrack.enabled ? 
            '<i class="fas fa-video"></i>' : 
            '<i class="fas fa-video-slash"></i>';
    }
}

muteMicBtn.addEventListener('click', () => {
    if (localStream) {
        const audioTrack = localStream.getAudioTracks()[0];
        if (audioTrack) {
            audioTrack.enabled = !audioTrack.enabled;
            updateMediaButtonStates();
        }
    }
});

disableCamBtn.addEventListener('click', () => {
    if (localStream) {
        const videoTrack = localStream.getVideoTracks()[0];
        if (videoTrack) {
            videoTrack.enabled = !videoTrack.enabled;
            updateMediaButtonStates();
        }
    }
});

// Call request handling
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
            setupCallHandlers(incomingCall);
            currentCall = incomingCall;
            callRequestModal.style.display = 'none';
            incomingCall = null;
        } catch (err) {
            console.error("Error answering call:", err);
            callRequestModal.style.display = 'none';
            addSystemMessage("Failed to answer call");
        }
    }
});

rejectCallBtn.addEventListener('click', () => {
    if (incomingCall) {
        incomingCall.close();
        callRequestModal.style.display = 'none';
        incomingCall = null;
        addSystemMessage("You rejected the video call");
    }
});

// Event listeners
screenShareBtn.addEventListener('click', async () => {
    if (!screenStream) {
        await startScreenSharing();
    } else {
        stopScreenShare();
    }
});

startVideoBtn.addEventListener('click', startVideoChat);
endVideoBtn.addEventListener('click', stopVideoCall);

// Rest of your existing code for auth, messaging, etc. remains the same
// (Make sure to include all the other functions like setupConnection, handleIncomingData, etc.)
