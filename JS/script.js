// Charge le JSON puis affiche uniquement les 6 plus recentes actualites.
async function loadArticles() {
    const container = document.getElementById('articles');
    container.innerHTML = '<p>Chargement des actualites...</p>';

    try {
        const response = await fetch('JSON/data.json', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Impossible de charger data.json (${response.status})`);
        }

        const articles = await response.json();
        const typeFilter = document.getElementById('typeFilter').value;

        const sortedArticles = [...articles].sort((a, b) =>
            new Date(b.published_at || b.date).getTime() - new Date(a.published_at || a.date).getTime()
        );

        const filteredArticles = sortedArticles
            .filter((article) => typeFilter === 'All' || article.type === typeFilter)
            .slice(0, 6);

        container.innerHTML = '';

        if (filteredArticles.length === 0) {
            container.innerHTML = '<p>Aucune actualite disponible pour ce filtre.</p>';
        } else {
            filteredArticles.forEach((article) => {
                const div = document.createElement('article');
                div.classList.add('article');
                const severity = (article.severity || 'LOW').toUpperCase();
                const severityBadgeClass = getSeverityBadgeClass(severity);

                div.innerHTML = `
                    <h2>${article.title}</h2>
                    <div class="article-meta">
                        <span class="badge badge-type">${article.type}</span>
                        <span class="badge ${severityBadgeClass}">${severity}</span>
                    </div>
                    <p><strong>Date:</strong> ${article.date}</p>
                    <p>${article.description}</p>
                    <p><a href="${article.link}" target="_blank" rel="noopener noreferrer">Lire l'article</a></p>
                `;
                container.appendChild(div);
            });
        }

        // Le dashboard ne doit jamais bloquer l'affichage des articles.
        try {
            updateDashboard(filteredArticles);
        } catch (dashboardError) {
            // eslint-disable-next-line no-console
            console.error('Erreur dashboard:', dashboardError);
        }
    } catch (error) {
        container.innerHTML = `<p>Erreur lors du chargement des actualites : ${error.message}</p>`;
    }
}

function getSeverityBadgeClass(severity) {
    if (severity === 'HIGH') return 'badge-severity-high';
    if (severity === 'MEDIUM') return 'badge-severity-medium';
    return 'badge-severity-low';
}

function updateDashboard(articles) {
    updateSummaryCards(articles);
    updateTypeChart(articles);
    updateSeverityChart(articles);
}

function updateSummaryCards(articles) {
    const severityCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };
    articles.forEach((article) => {
        const sev = (article.severity || 'LOW').toUpperCase();
        if (severityCounts[sev] !== undefined) {
            severityCounts[sev] += 1;
        } else {
            severityCounts.LOW += 1;
        }
    });

    document.getElementById('countTotal').textContent = String(articles.length);
    document.getElementById('countHigh').textContent = String(severityCounts.HIGH);
    document.getElementById('countMedium').textContent = String(severityCounts.MEDIUM);
    document.getElementById('countLow').textContent = String(severityCounts.LOW);
}

function updateTypeChart(articles) {
    const ctx = document.getElementById('typeChart').getContext('2d');

    const counts = { CVE: 0, Ransomware: 0, 'Data Breach': 0, Other: 0 };
    articles.forEach((article) => {
        counts[article.type] = (counts[article.type] || 0) + 1;
    });

    if (window.typeChartInstance && typeof window.typeChartInstance.destroy === 'function') {
        window.typeChartInstance.destroy();
    }

    window.typeChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: 'Nombre d\'articles par type',
                data: Object.values(counts),
                backgroundColor: ['#49b9ff', '#ff8f5c', '#c87cff', '#65e3c2']
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

function updateSeverityChart(articles) {
    const ctx = document.getElementById('severityChart').getContext('2d');
    const counts = { HIGH: 0, MEDIUM: 0, LOW: 0 };

    articles.forEach((article) => {
        const severity = (article.severity || 'LOW').toUpperCase();
        if (counts[severity] !== undefined) {
            counts[severity] += 1;
        } else {
            counts.LOW += 1;
        }
    });

    if (window.severityChartInstance && typeof window.severityChartInstance.destroy === 'function') {
        window.severityChartInstance.destroy();
    }

    window.severityChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                label: 'Nombre d\'articles par severite',
                data: Object.values(counts),
                backgroundColor: ['#ff6767', '#ffbf49', '#45d98f'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Filtre change
document.getElementById('typeFilter').addEventListener('change', loadArticles);

// Load au démarrage
loadArticles();
