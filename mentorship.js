// Load Particles.js
particlesJS("particles-js", {
    particles: {
        number: { value: 80 },
        shape: { type: "circle" },
        opacity: { value: 0.5 },
        size: { value: 3 },
        move: { enable: true, speed: 2 }
    }
});

// Add Parallax Effect
document.addEventListener("mousemove", function(e) {
    let x = (e.clientX / window.innerWidth) * 30;
    let y = (e.clientY / window.innerHeight) * 30;
    document.querySelector("header").style.transform = `translate(${x}px, ${y}px)`;
});

// Scroll Animations (Mentors, Thoughts, Q&A)
const hiddenElements = document.querySelectorAll(".hidden");

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, { threshold: 0.2 });

hiddenElements.forEach(el => observer.observe(el));
// 🚀 Get Elements
const popup = document.getElementById("audioPopup");
const overlay = document.querySelector(".popup-overlay");
const closeButton = document.querySelector(".close-btn");
const body = document.body;
const audio = document.getElementById("adminAudio");
const mentors = document.querySelectorAll(".mentor");

// 🔥 Show Popup on Load
window.onload = function () {
    popup.classList.add("show");
    overlay.classList.add("show");
    body.classList.add("noscroll");
    audio.play();
};

// ❌ Close Popup
closeButton.addEventListener("click", () => {
    popup.classList.remove("show");
    overlay.classList.remove("show");
    body.classList.remove("noscroll");
    audio.pause();
});
