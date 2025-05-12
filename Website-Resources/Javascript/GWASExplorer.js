window.onload = function() {
    let link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://www.gwasexplorer.com/Website-Resources/CSS/wandermeadow.css";
    document.head.appendChild(link);
};
// Function to dynamically add Chart.js via CDN
function loadChartJS() {
    // Create a script tag
    let script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/chart.js"; // Chart.js CDN
    script.type = "text/javascript";
    script.onload = function() {
        console.log("Chart.js has been loaded!");
        // Now you can use Chart.js
        renderChart(); // Call the function that initializes your chart
    };
    document.head.appendChild(script); // Append the script tag to the head
}

// Call this function to load Chart.js dynamically
loadChartJS();

const readerModeButton = document.getElementsByClassName("readermode")[0];
if (readerModeButton) {
    readerModeButton.click();
}

const fileInput = document.getElementById('file-input');
const fileContentDisplay = document.getElementById('file-content');
const messageDisplay = document.getElementById('message');
const xAttrSelect = document.getElementById('x-attr');
const yAttrSelect = document.getElementById('y-attr');
const idAttrSelect = document.getElementById('id-attr'); // New selector for ID
let chart = null;
let SNPData = {};
let attributes = [];
let allAttributes = [];
let allSNPData = [];
let colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#A133FF', '#33FFA1', '#FFA133']; // Example colors

fileInput.addEventListener('change', plotChart);
xAttrSelect.addEventListener('change', renderChart);
yAttrSelect.addEventListener('change', renderChart);
idAttrSelect.addEventListener('change', renderChart); // Listen for changes on the ID selector

function showMessage(message, type = 'info') {
    messageDisplay.textContent = message;
    messageDisplay.style.color = type === 'error' ? 'red' : 'green';
}

function populateAttributeSelectors() {
    const createOptions = (select) => {
        select.innerHTML = '';
        attributes.forEach(attr => {
            const option = new Option(attr, attr);
            select.add(option);
        });
        select.value = attributes[0];
    };

    [xAttrSelect, yAttrSelect, idAttrSelect].forEach(createOptions); // Add ID selector as well
}

function plotChart(event) {
    // get files 
    const files = event.target.files;
    fileContentDisplay.textContent = '';
    messageDisplay.textContent = '';

    // check if there are any files 
    if (!files.length) {
        showMessage('No files selected. Please choose at least one TSV file.', 'error');
        return;
    }

    // for each file, read data and add to attributes and SNP data 
    Array.from(files).forEach((file, index) => {
        if (!file.name.endsWith('.tsv')) {
            showMessage(`Unsupported file type: ${file.name}. Please select TSV files only.`, 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            readData(reader.result); // nread and store data 
        };
        reader.onerror = () => showMessage(`Error reading file: ${file.name}`, 'error');
        reader.readAsText(file);
    });
        populateAttributeSelectors(); // Ensure this is called after the data is read
        renderChart(); // Initial chart render
}

function readData(datatext) {
    fileSNPData = {}; // Initialize an empty object to store SNP data
    const datalines = datatext.split('\n').filter(line => line.trim().length > 0); // Split by line and remove empty lines
    attributes = datalines[0].split('\t'); // The first line is the header (attribute names)

    // Create an array to store SNP data
    SNPData = datalines.slice(1).map(line => {
        const lineparts = line.split('\t'); // Split the line by tab to get the values for each attribute

        // Create an object for each data point (Object2)
        const dataPoint = Object.fromEntries(
            attributes.map((attr, idx) => [attr, lineparts[idx]]) // Map attributes to their values
        );

        return dataPoint; // Return the individual data point object (Object2)
    });

    // Add SNPData (list of Object2) to allSNPData
    allSNPData.push(SNPData);

    // Collect all unique attributes (for later use)
    allAttributes = [...new Set([...allAttributes, ...attributes])]; // Collect all attributes
}

function renderChart() {
    if (!xAttrSelect.value || !yAttrSelect.value || !idAttrSelect.value) return;

    const xAttr = xAttrSelect.value;
    const yAttr = yAttrSelect.value;
    const idAttr = idAttrSelect.value;

    // Clean up existing chart before creating a new one
    if (chart) {
        chart.destroy();
    }

    const data = [];

    // Use all SNP data directly without batching
    allSNPData.forEach(entry => {
        const xVal = parseFloat(entry[xAttr]);
        const yVal = parseFloat(entry[yAttr]);
        const id = entry[idAttr] || '';

        // Add data point only if both x and y values are valid
        if (!isNaN(xVal) && !isNaN(yVal)) {
            data.push({ x: xVal, y: yVal, id });
        }
    });

    // Create a single dataset using the entire SNPData
    const dataset = {
        label: 'SNP Data',
        data: data,
        backgroundColor: colors[0], // You can choose a fixed color or randomize it
        borderColor: colors[0],
        pointRadius: 5,
        pointHoverRadius: 7
    };

    const ctx = document.getElementById('scatterplot').getContext('2d');
    chart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [dataset]  // Only one dataset now
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'linear',
                    title: { display: true, text: xAttr }
                },
                y: {
                    type: 'linear',
                    title: { display: true, text: yAttr }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        title: (tooltipItems) => `ID: ${tooltipItems[0].raw.id}`,
                        label: (tooltipItem) => `${xAttr}: ${tooltipItem.raw.x}, ${yAttr}: ${tooltipItem.raw.y}`
                    }
                }
            }
        }
    });
}


