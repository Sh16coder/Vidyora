document.addEventListener("DOMContentLoaded", function() {
    const hiddenElements = document.querySelectorAll(".hidden");

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("show");
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 });

    hiddenElements.forEach(el => observer.observe(el));
});

// Particle.js Background
particlesJS("particles-js", {
    particles: {
        number: { value: 100, density: { enable: true, value_area: 800 } },
        color: { value: "#00ffcc" },
        shape: { type: "circle" },
        opacity: { value: 0.5, random: true },
        size: { value: 3, random: true },
        line_linked: { enable: true, distance: 150, color: "#00ffcc", opacity: 0.4, width: 1 },
        move: { enable: true, speed: 2, direction: "none", random: false, straight: false, out_mode: "out" }
    }
});

// Disclaimer Popup
function closePopup() {
    document.getElementById("disclaimerPopup").classList.remove("active");
}

// Show Popup on Load
document.addEventListener("DOMContentLoaded", function() {
    setTimeout(function() {
        document.getElementById("disclaimerPopup").classList.add("active");
    }, 1000);
});
