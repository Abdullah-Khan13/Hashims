//active Link Navabar
document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll("nav ul li a");
    const currentPage = window.location.pathname;
    links.forEach(link => {
        if(link.pathname === currentPage){
            link.classList.add("activePageLink");
        }
    })
})