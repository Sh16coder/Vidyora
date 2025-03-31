// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

document.addEventListener('DOMContentLoaded', function() {
    // Tab Switching Functionality
    function setupTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const authForms = document.querySelectorAll('.auth-form');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                const tab = this.dataset.tab;
                
                // Update active tab
                tabBtns.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                // Update active form
                authForms.forEach(form => form.classList.remove('active'));
                document.getElementById(`${tab}Form`).classList.add('active');
            });
        });
    }

    // Authentication State Listener
    auth.onAuthStateChanged(user => {
        if (user) {
            if (window.location.pathname.includes('gc.html')) {
                window.location.href = 'chat.html';
            }
            if (document.getElementById('usernameInitial')) {
                document.getElementById('usernameInitial').textContent = user.email.charAt(0).toUpperCase();
            }
            if (document.getElementById('messageContainer')) {
                loadMessages();
            }
        } else {
            if (!window.location.pathname.includes('gc.html')) {
                window.location.href = 'gc.html';
            }
        }
    });

    // Login Function
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
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

    // Register Function
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showStatusMessage('Passwords do not match', 'error');
                return;
            }
            
            try {
                const userCredential = await auth.createUserWithEmailAndPassword(email, password);
                await userCredential.user.sendEmailVerification();
                showStatusMessage('Verification email sent!', 'success');
            } catch (error) {
                showStatusMessage(error.message, 'error');
            }
        });
    }

    // Chat Functions
    if (document.getElementById('logoutBtn')) {
        document.getElementById('logoutBtn').addEventListener('click', () => auth.signOut());
    }

    if (document.getElementById('sendBtn')) {
        document.getElementById('sendBtn').addEventListener('click', sendMessage);
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }

    // Initialize tabs
    setupTabs();
});

// Message Functions
async function sendMessage() {
    const messageText = document.getElementById('messageInput').value.trim();
    if (!messageText || !auth.currentUser) return;
    
    try {
        await db.collection('messages').add({
            text: messageText,
            sender: auth.currentUser.email,
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        });
        document.getElementById('messageInput').value = '';
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

function loadMessages() {
    db.collection('messages')
        .orderBy('timestamp')
        .onSnapshot(snapshot => {
            const container = document.getElementById('messageContainer');
            container.innerHTML = '';
            
            snapshot.forEach(doc => {
                const message = doc.data();
                const isCurrentUser = message.sender === auth.currentUser.email;
                const time = message.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || 'Now';
                
                container.innerHTML += `
                    <div class="message ${isCurrentUser ? 'sent' : 'received'}">
                        <div>${message.text}</div>
                        <span class="message-time">${time}</span>
                    </div>
                `;
            });
            container.scrollTop = container.scrollHeight;
        });
}

function showStatusMessage(text, type) {
    const element = document.querySelector('.status-message');
    if (!element) return;
    
    element.textContent = text;
    element.className = `status-message ${type}`;
    
    setTimeout(() => {
        element.textContent = '';
        element.className = 'status-message';
    }, 5000);
            }
