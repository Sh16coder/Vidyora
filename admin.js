// Display current date
document.getElementById("date").innerText = new Date().toDateString();

// Particle Background Animation
particlesJS.load('particles-js', 'particles.json', function () {
    console.log('Particles loaded!');
});

// Hover Effects on Thought Cards
document.querySelectorAll('.thought-card').forEach(card => {
    card.addEventListener('mouseover', function () {
        this.style.transform = "scale(1.1)";
    });

    card.addEventListener('mouseleave', function () {
        this.style.transform = "scale(1)";
    });
});

// Button Click Effect
document.querySelector('.glitch-btn').addEventListener('click', function () {
    this.innerText = "🚀 BLASTING OFF!";
    this.style.boxShadow = "0px 0px 50px red";
    setTimeout(() => {
        this.innerText = "🔥 NEXT LEVEL 🔥";
        this.style.boxShadow = "0px 0px 15px cyan";
    }, 2000);
});

// 🚀 Get Elements for Audio Popup
const popup = document.getElementById("audioPopup");
const overlay = document.querySelector(".popup-overlay");
const closeButton = document.querySelector(".close-btn");
const body = document.body;
const audio = document.getElementById("adminAudio");

// 🔥 Show Popup on Load
window.onload = function () {
    popup.classList.add("show");
    overlay.classList.add("show");
    body.classList.add("no-scroll");
    audio.play(); // Auto-play audio
};

// ❌ Close Popup
closeButton.addEventListener("click", () => {
    popup.classList.remove("show");
    overlay.classList.remove("show");
    body.classList.remove("no-scroll");
    audio.pause(); // Stop audio
});

// Function to Close the Disclaimer Popup
function closePopup() {
    document.getElementById('disclaimerPopup').style.display = 'none';
    document.body.classList.remove("no-scroll");
}

// Scroll Animation for Elements
document.addEventListener("DOMContentLoaded", function () {
    const elements = document.querySelectorAll(".hidden");

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add("visible");
            } else {
                entry.target.classList.remove("visible");
            }
        });
    });

    elements.forEach((el) => observer.observe(el));
});
