let allArticles = [];

fetch("JSON/data.json")
  .then(res => res.json())
  .then(data => {
    allArticles = data;
    render(allArticles);
    updateStats(allArticles);
    createCharts(allArticles);
  });

function render(data) {
  const container = document.getElementById("news-container");
  container.innerHTML = "";

  data.forEach(a => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="meta">
        ${a.date} | ${a.type} |
        <span class="${a.severity.toLowerCase()}">${a.severity}</span>
      </div>
      <h3>${a.title}</h3>
      <p>${a.description}</p>
      <a href="${a.link}" target="_blank">Lire →</a>
    `;

    container.appendChild(card);
  });
}

function filterSeverity(level) {
  if (level === "ALL") return render(allArticles);
  render(allArticles.filter(a => a.severity === level));
}

function filterCVE() {
  render(allArticles.filter(a => a.title.toLowerCase().includes("cve")));
}

function updateStats(data) {
  document.getElementById("total").innerText = `Total: ${data.length}`;
  document.getElementById("high").innerText =
    `HIGH: ${data.filter(a => a.severity === "HIGH").length}`;
  document.getElementById("cveCount").innerText =
    `CVE: ${data.filter(a => a.title.toLowerCase().includes("cve")).length}`;
}

function createCharts(data) {

  const severityCounts = { HIGH: 0, MEDIUM: 0, LOW: 0 };

  data.forEach(a => severityCounts[a.severity]++);

  new Chart(document.getElementById("severityChart"), {
    type: "doughnut",
    data: {
      labels: ["HIGH", "MEDIUM", "LOW"],
      datasets: [{
        data: [severityCounts.HIGH, severityCounts.MEDIUM, severityCounts.LOW]
      }]
    }
  });

  const monthly = {};

  data.forEach(a => {
    if (!a.title.toLowerCase().includes("cve")) return;

    const [d, m, y] = a.date.split("-");
    const key = `${m}-${y}`;
    monthly[key] = (monthly[key] || 0) + 1;
  });

  new Chart(document.getElementById("cveChart"), {
    type: "bar",
    data: {
      labels: Object.keys(monthly),
      datasets: [{
        label: "CVE / mois",
        data: Object.values(monthly)
      }]
    }
  });
}