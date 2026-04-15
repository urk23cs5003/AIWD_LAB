function showMsg() {
    alert("Welcome! This portfolio is created using AI tools.");
}

function showSection(sectionId) {
    let sections = document.querySelectorAll(".section");
    
    sections.forEach(section => {
        section.style.display = "none";
    });

    document.getElementById(sectionId).style.display = "block";
}

// Show home section by default
window.onload = function() {
    showSection('home');
}