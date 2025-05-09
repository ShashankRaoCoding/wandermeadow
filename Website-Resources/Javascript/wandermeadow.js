let link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://shashankraocoding.github.io/wandermeadow/Website-Resources/CSS/wandermeadow.css";
document.head.appendChild(link);

const currentDomain = window.location.hostname;

if (currentDomain === 'www.gwasexplorer.com') {
    window.location.href = 'https://www.gwasexplorer.com/Projects/GWAS-Explorer/'; // Redirect to the page for www.gwasexplorer.com visitors
}

function redirect(url) {
    window.location.href = `https://shashankraocoding.github.io/wandermeadow/${url}`;
}
