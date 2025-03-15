// Display current date
document.getElementById("date").innerText = new Date().toDateString();

// Particle Background Animation
particlesJS.load('particles-js', 'particles.json', function() {
    console.log('Particles loaded!');
});

// Hover Effects
document.querySelector('.thought-card').addEventListener('mouseover', function() {
    this.style.transform = "scale(1.1)";
});

document.querySelector('.thought-card').addEventListener('mouseleave', function() {
    this.style.transform = "scale(1)";
});

// Button Click Effect
document.querySelector('.glitch-btn').addEventListener('click', function() {
    this.innerText = "🚀 BLASTING OFF!";
    this.style.boxShadow = "0px 0px 50px red";
    setTimeout(() => {
        this.innerText = "🔥 NEXT LEVEL 🔥";
        this.style.boxShadow = "0px 0px 15px cyan";
    }, 2000);
});
// 🚀 Get Elements
const popup = document.getElementById("audioPopup");
const overlay = document.querySelector(".popup-overlay");
const closeButton = document.querySelector(".close-btn");
const body = document.body;
const audio = document.getElementById("adminAudio");

// 🔥 Show Popup on Load
window.onload = function () {
    popup.classList.add("show");
    overlay.classList.add("show");
    body.classList.add("noscroll");
    audio.play();  // Auto-play audio
};

// ❌ Close Popup
closeButton.addEventListener("click", () => {
    popup.classList.remove("show");
    overlay.classList.remove("show");
    body.classList.remove("noscroll");
    audio.pause();  // Stop audio
});
