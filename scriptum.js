document.addEventListener("DOMContentLoaded", function () {
    const elements = document.querySelectorAll(".fade-in");

    function checkScroll() {
        const triggerBottom = window.innerHeight * 0.85;

        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < triggerBottom) {
                el.classList.add("visible");
            }
        });
    }

    window.addEventListener("scroll", checkScroll);
    checkScroll(); // Run on page load
});
