// Active Link Navbar
document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll("#main-menu li a");
    const currentPage = window.location.pathname; // Use pathname for comparison
    links.forEach(link => {
        // Compare only the pathname part of the URL
        if (link.pathname === currentPage) {
            link.classList.add("activePageLink");
        }
    });
});
