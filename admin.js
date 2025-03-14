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
