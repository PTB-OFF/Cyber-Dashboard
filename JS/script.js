const url = "https://docs.google.com/spreadsheets/d/1GDHVM7x_J9yY5GKWZwwebNHvepl1uctB6izgRzSJm3w/edit?usp=sharing";

let allArticles = [];

fetch(url)
  .then(res => res.text())
  .then(data => {

    const rows = data.split("\n").slice(1);

    rows.forEach(row => {
      const cols = row.split(",");
      if (cols.length < 6) return;

      const [date, title, type, severity, desc, link] = cols;

      const parts = date.split("-");
      const jsDate = new Date(parts[2], parts[1]-1, parts[0]);

      allArticles.push({ date, jsDate, title, type, severity, desc, link });
    });

    render(allArticles);
    updateStats(allArticles);
  });

function render(data) {
  const container = document.getElementById("news-container");
  container.innerHTML = "";

  data.sort((a, b) => b.jsDate - a.jsDate);

  data.forEach(a => {
    const card = document.createElement("div");
    card.className = "card";

    card.innerHTML = `
      <div class="meta">
        ${a.date} | ${a.type} |
        <span class="${a.severity.toLowerCase()}">${a.severity}</span>
      </div>
      <h3>${a.title}</h3>
      <p>${a.desc}</p>
      <a href="${a.link}" target="_blank">Lire →</a>
    `;

    container.appendChild(card);
  });
}

function filterSeverity(level) {
  if (level === "ALL") return render(allArticles);

  const filtered = allArticles.filter(a => a.severity === level);
  render(filtered);
}

function updateStats(data) {
  document.getElementById("total").innerText = `Total: ${data.length}`;
  document.getElementById("high").innerText =
    `HIGH: ${data.filter(a => a.severity === "HIGH").length}`;
}