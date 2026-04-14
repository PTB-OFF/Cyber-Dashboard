const PAGE_SIZE = 6;
let allArticles = [];
let filteredArticles = [];
let displayedCount = PAGE_SIZE;

async function loadArticles() {
    const container = document.getElementById('articles');
    container.innerHTML = '<p>Chargement des actualites...</p>';

    try {
        const response = await fetch('JSON/data.json', { cache: 'no-store' });
        if (!response.ok) {
            throw new Error(`Impossible de charger data.json (${response.status})`);
        }

        const articles = await response.json();
        allArticles = [...articles].sort((a, b) =>
            new Date(b.published_at || b.date).getTime() - new Date(a.published_at || a.date).getTime()
        );

        displayedCount = PAGE_SIZE;
        applyFilterAndRender();
    } catch (error) {
        container.innerHTML = `<p>Erreur lors du chargement des actualites : ${error.message}</p>`;
    }
}

function applyFilterAndRender() {
    const typeFilter = document.getElementById('typeFilter').value;
    filteredArticles = allArticles.filter((article) => typeFilter === 'All' || article.type === typeFilter);
    renderArticles();
    updateLoadMoreButton();

    // Dashboard base sur tout l'historique filtre (pas seulement les 6 visibles).
    try {
        updateDashboard(filteredArticles);
    } catch (dashboardError) {
        // eslint-disable-next-line no-console
        console.error('Erreur dashboard:', dashboardError);
    }
}

function renderArticles() {
    const container = document.getElementById('articles');
    container.innerHTML = '';

    const visibleArticles = filteredArticles.slice(0, displayedCount);
    if (visibleArticles.length === 0) {
        container.innerHTML = '<p>Aucune actualite disponible pour ce filtre.</p>';
        return;
    }

    visibleArticles.forEach((article) => {
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

function updateLoadMoreButton() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (!loadMoreBtn) return;

    const hasMore = displayedCount < filteredArticles.length;
    loadMoreBtn.style.display = filteredArticles.length === 0 ? 'none' : 'inline-block';
    loadMoreBtn.disabled = !hasMore;
    loadMoreBtn.textContent = hasMore
        ? 'Afficher les jours precedents'
        : 'Toutes les actualites sont affichees';
}

function onLoadMore() {
    displayedCount += PAGE_SIZE;
    renderArticles();
    updateLoadMoreButton();
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
document.getElementById('typeFilter').addEventListener('change', () => {
    displayedCount = PAGE_SIZE;
    applyFilterAndRender();
});
document.getElementById('loadMoreBtn').addEventListener('click', onLoadMore);

// Load au démarrage
loadArticles();
