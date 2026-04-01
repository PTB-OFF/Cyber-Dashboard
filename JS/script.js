// Charger le JSON et afficher les articles
async function loadArticles() {
    const res = await fetch('JSON/data.json');
    const articles = await res.json();

    const container = document.getElementById('articles');
    container.innerHTML = '';

    const typeFilter = document.getElementById('typeFilter').value;

    const filteredArticles = articles.filter(article => {
        return typeFilter === "All" || article.type === typeFilter;
    });

    filteredArticles.forEach(article => {
        const div = document.createElement('div');
        div.classList.add('article');
        div.innerHTML = `
            <h2>${article.title}</h2>
            <p><strong>Date:</strong> ${article.date} | <strong>Type:</strong> ${article.type}</p>
            <p>${article.description}</p>
            <p><a href="${article.link}" target="_blank">Lire l'article</a></p>
        `;
        container.appendChild(div);
    });

    updateChart(filteredArticles);
}

// Graphique avec Chart.js
function updateChart(articles) {
    const ctx = document.getElementById('typeChart').getContext('2d');

    const counts = { CVE:0, Ransomware:0, "Data Breach":0, Other:0 };
    articles.forEach(a => { counts[a.type] = (counts[a.type] || 0) + 1; });

    if(window.typeChart) {
        window.typeChart.data.datasets[0].data = Object.values(counts);
        window.typeChart.update();
        return;
    }

    window.typeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: 'Nombre d\'articles par type',
                data: Object.values(counts),
                backgroundColor: ['#ff4d4d','#ffcc00','#3399ff','#00ffcc']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// Filtre change
document.getElementById('typeFilter').addEventListener('change', loadArticles);

// Load au démarrage
loadArticles();
