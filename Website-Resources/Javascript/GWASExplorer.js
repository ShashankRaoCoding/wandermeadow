let link = document.createElement("link");
link.rel = "stylesheet";
link.href = "https://www.gwasexplorer.com/Website-Resources/CSS/wandermeadow.css";
document.head.appendChild(link);

function redirect(url) { 
    window.location.href = `https://www.gwasexplorer.com/${url}`; 
}
