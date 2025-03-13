document.addEventListener("DOMContentLoaded", function () {
    const modal = document.getElementById("disclaimer-modal");
    const closeModal = document.getElementById("close-modal");

    // Show the modal when page loads
    modal.style.display = "flex";

    // Close modal when button is clicked
    closeModal.addEventListener("click", function () {
        modal.style.display = "none";
    });
});
