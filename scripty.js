document.addEventListener("DOMContentLoaded", function () {
    // Show identity disclaimer popup on page load
    const identityPopup = document.getElementById("identity-popup");
    identityPopup.style.display = "flex";
});

// Close popup function
function closePopup() {
    document.getElementById("identity-popup").style.display = "none";
}
