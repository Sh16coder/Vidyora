document.addEventListener("DOMContentLoaded", function () {
    const classButtons = document.querySelectorAll(".class-btn");

    classButtons.forEach(button => {
        button.addEventListener("click", function () {
            const content = this.nextElementSibling;
            
            // Close all other sections
            document.querySelectorAll(".content").forEach(section => {
                if (section !== content) {
                    section.style.maxHeight = null;
                    section.classList.remove("open");
                }
            });

            // Toggle the clicked section
            if (content.classList.contains("open")) {
                content.style.maxHeight = null;
                content.classList.remove("open");
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
                content.classList.add("open");
            }
        });
    });
});
