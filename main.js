document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM fully loaded");
    
    // Initialize Firebase
    const firebaseConfig = {
        apiKey: "AIzaSyDnX17qdA2jHUhGuV1lwXDNd9qIlQkC7gg",
        authDomain: "vidya-3a7b0.firebaseapp.com",
        databaseURL: "https://vidya-3a7b0-default-rtdb.firebaseio.com",
        projectId: "vidya-3a7b0",
        storageBucket: "vidya-3a7b0.firebasestorage.app",
        messagingSenderId: "259975629672",
        appId: "1:259975629672:web:37f9ca31c7c70a971724dd"
    };
    
    // Initialize Firebase
    const app = firebase.initializeApp(firebaseConfig);
    const database = firebase.database();
    
    console.log("Firebase initialized");
    
    // Rest of your existing code...
    // All your event listeners and functions go here
    // inside the DOMContentLoaded callba
// DOM Elements
const disclaimerModal = document.getElementById('disclaimer-modal');
const closeModalBtn = document.getElementById('close-modal');
const acceptDisclaimerBtn = document.getElementById('accept-disclaimer');
const welcomeModal = document.getElementById('welcome-modal');
const userNameInput = document.getElementById('user-name');
const submitNameBtn = document.getElementById('submit-name');
const skipWelcomeBtn = document.getElementById('skip-welcome');
const welcomeBackToast = document.getElementById('welcome-back');
const welcomeMessage = document.getElementById('welcome-message');
const toastClose = document.querySelector('.toast-close');

// Particles.js Configuration
particlesJS('particles-js', {
    particles: {
        number: { value: 80, density: { enable: true, value_area: 800 } },
        color: { value: ["#00ffcc", "#00b3ff", "#ff00aa"] },
        shape: { type: "circle" },
        opacity: { value: 0.7, random: true },
        size: { value: 3, random: true, anim: { enable: true, speed: 2, size_min: 0.3 } },
        line_linked: { 
            enable: true, 
            distance: 150, 
            color: "#00ffcc", 
            opacity: 0.4, 
            width: 1,
            shadow: { enable: true, blur: 5, color: "#00ffcc" }
        },
        move: { 
            enable: true, 
            speed: 3, 
            direction: "none", 
            random: true, 
            straight: false, 
            out_mode: "bounce",
            attract: { enable: true, rotateX: 600, rotateY: 1200 }
        }
    },
    interactivity: {
        detect_on: "canvas",
        events: {
            onhover: { enable: true, mode: "repulse" },
            onclick: { enable: true, mode: "push" },
            resize: true
        },
        modes: {
            repulse: { distance: 100, duration: 0.4 },
            push: { particles_nb: 4 }
        }
    },
    retina_detect: true
});

// Audio Context for Sound Effects
let audioContext;
try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
} catch (e) {
    console.log('Web Audio API not supported');
}

function playSound(frequency, type, duration) {
    if (!audioContext) return;
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = type || 'sine';
    oscillator.frequency.value = frequency || 440;
    gainNode.gain.value = 0.1;
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + (duration || 0.5));
    oscillator.stop(audioContext.currentTime + (duration || 0.5));
}

// Modal Functions
function showModal(modal) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    playSound(523.25, 'sine', 0.3);
}

function hideModal(modal) {
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    playSound(392, 'sine', 0.3);
}

// Show Disclaimer Modal on Load
window.addEventListener('load', () => {
    setTimeout(() => {
        showModal(disclaimerModal);
    }, 1000);
});

// Close Disclaimer Modal
closeModalBtn.addEventListener('click', () => {
    hideModal(disclaimerModal);
});

acceptDisclaimerBtn.addEventListener('click', () => {
    hideModal(disclaimerModal);
    // Check if user has already provided name
    setTimeout(() => {
        const userName = localStorage.getItem('userName');
        if (!userName) {
            showModal(welcomeModal);
        } else {
            showWelcomeBack(userName);
        }
    }, 1000);
});

// Welcome Modal Functions
submitNameBtn.addEventListener('click', () => {
    const userName = userNameInput.value.trim();
    if (userName) {
        // Save to localStorage
        localStorage.setItem('userName', userName);
        
        // Save to Firebase
        const userRef = ref(database, 'users/' + generateUserId());
        set(userRef, {
            name: userName,
            timestamp: new Date().toISOString()
        }).then(() => {
            console.log('User data saved to Firebase');
        }).catch((error) => {
            console.error('Error saving user data:', error);
        });
        
        hideModal(welcomeModal);
        showThankYou(userName);
    } else {
        userNameInput.style.borderColor = '#ff00aa';
        setTimeout(() => {
            userNameInput.style.borderColor = 'rgba(255, 255, 255, 0.2)';
        }, 1000);
        playSound(220, 'sine', 0.2);
    }
});

skipWelcomeBtn.addEventListener('click', () => {
    hideModal(welcomeModal);
    playSound(349.23, 'sine', 0.3);
});

function showThankYou(name) {
    welcomeMessage.textContent = `Thank you, ${name}! Enjoy your experience.`;
    welcomeBackToast.classList.add('show');
    playSound(659.25, 'triangle', 0.5);
    
    setTimeout(() => {
        welcomeBackToast.classList.remove('show');
    }, 5000);
}

function showWelcomeBack(name) {
    welcomeMessage.textContent = `Welcome back, ${name}! We missed you.`;
    welcomeBackToast.classList.add('show');
    playSound(523.25, 'sine', 0.5);
    
    setTimeout(() => {
        welcomeBackToast.classList.remove('show');
    }, 5000);
}

toastClose.addEventListener('click', () => {
    welcomeBackToast.classList.remove('show');
});

// Generate unique user ID
function generateUserId() {
    return 'user_' + Math.random().toString(36).substr(2, 9);
}

// 3D Card Tilt Effect
const optionCards = document.querySelectorAll('.option-card');
optionCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const angleX = (y - centerY) / 20;
        const angleY = (centerX - x) / 20;
        
        card.style.transform = `translateZ(30px) rotateX(${angleX}deg) rotateY(${angleY}deg)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateZ(20px) rotateX(0) rotateY(0)';
    });
});

// Audio on hover for cards
optionCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        playSound(880, 'sine', 0.1);
    });
});

// Parallax Effect
window.addEventListener('mousemove', (e) => {
    const x = e.clientX / window.innerWidth;
    const y = e.clientY / window.innerHeight;
    
    document.querySelector('.main-container').style.transform = `
        translateZ(0)
        rotateX(${(y - 0.5) * 2}deg)
        rotateY(${(x - 0.5) * -2}deg)
    `;
});

// Page Load Animation
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.header-3d, .offer-section, .footer-3d, .option-card');
    elements.forEach((el, i) => {
        setTimeout(() => {
            el.style.opacity = '1';
            el.style.transform = 'translateZ(0)';
        }, i * 100);
    });
});

// Service Worker Registration for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}
