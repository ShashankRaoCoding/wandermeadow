const script = document.createElement('script');
script.src = "https://cdn.jsdelivr.net/npm/chart.js";
document.head.appendChild(script);
const fileInput = document.getElementById(`file-input`);
const fileContentDisplay = document.getElementById(`file-content`);
const messageDisplay = document.getElementById(`message`);
const xAttrSelect = document.getElementById(`x-attr`);
const yAttrSelect = document.getElementById(`y-attr`);
let chart = null;
let SNPData = {};
let attributes = [];
fileInput.addEventListener(`change`, handleFileSelection);
xAttrSelect.addEventListener(`change`, renderChart);
yAttrSelect.addEventListener(`change`, renderChart);
function handleFileSelection(event) {
    const file = event.target.files[0];
    fileContentDisplay.textContent = ``;
    messageDisplay.textContent = ``;
    if (!file) {
        showMessage(`No file selected. Please choose a file.`, `error`);
        return;
    }
    if (!file.name.endsWith(`.tsv`)) {
        showMessage(`Unsupported file type. Please select a TSV file.`, `error`);
        return;
    }
    const reader = new FileReader();
    reader.onload = () => process(reader.result);
    reader.onerror = () => showMessage(`Error reading the file. Please try again.`, `error`);
    reader.readAsText(file);
}
function showMessage(message, type = 'info') {
    messageDisplay.textContent = message;
    messageDisplay.style.color = type === `error` ? `red` : `green`;
}
function process(datatext) {
const datalines = datatext.split('\n').filter(line => line.trim().length > 0);
attributes = datalines[0].split('\t');

// Use map to create SNPData
SNPData = datalines.slice(1).map(line => {
    const lineparts = line.split('\t');
    return Object.fromEntries(
        attributes.map((attr, idx) => [attr, lineparts[idx]])
    );
});
populateAttributeSelectors();
renderChart(); // Initial chart
showMessage('Successfully loaded data. Choose attributes to plot.', 'success');
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
[xAttrSelect, yAttrSelect].forEach(createOptions);
}
function renderChart() {
    const xAttr = xAttrSelect.value;
    const yAttr = yAttrSelect.value;
    const chartData = {
        datasets: [{
            label: `${yAttr} vs ${xAttr}`,
            data: [],
            backgroundColor: 'rgba(75, 192, 192, 0.6)',
            borderColor: 'rgba(75, 192, 192, 1)',
            pointRadius: 5,
            pointHoverRadius: 7
        }]
    };

    for (let key in SNPData) {
    const entry = SNPData[key];
    const xVal = parseFloat(entry[xAttr]);
    const yVal = parseFloat(entry[yAttr]);
        const rsid = entry.rsid || '';
    chartData.datasets[0].data.push({ x: xVal, y: yVal, rsid });
    }
    if (chart) chart.destroy();
    const ctx = document.getElementById('myChart').getContext('2d');
    chart = new Chart(ctx, {
        type: 'scatter',
        data: chartData,
        options: {
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const point = context.raw;
                            return `rsid: ${point.rsid}, ${xAttr}: ${point.x}, ${yAttr}: ${point.y}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: xAttr
                    },
                    type: 'linear'
                },
                y: {
                    title: {
                        display: true,
                        text: yAttr
                    }
                }
            }
        }
    });
}