import feedparser
import json
from datetime import datetime

# URL du flux RSS
RSS_URL = "https://thehackernews.com/feeds/posts/default"

# Charger le JSON existant
try:
    with open("../JSON/data.json", "r", encoding="utf-8") as f:
        data = json.load(f)
except FileNotFoundError:
    data = []

# Parser le RSS
feed = feedparser.parse(RSS_URL)
for entry in feed.entries:
    article = {
        "date": datetime(*entry.published_parsed[:6]).strftime("%d-%m-%Y"),
        "title": entry.title,
        "link": entry.link,
        "description": entry.summary,
        "type": "CVE" if "CVE" in entry.title else "Other",
        "severity": "HIGH" if "critical" in entry.title.lower() else "MEDIUM" if "warning" in entry.title.lower() else "LOW"
    }

    # Vérifier si l'article est déjà dans le JSON
    if not any(d["link"] == article["link"] for d in data):
        data.append(article)

# Sauvegarder le JSON mis à jour
with open("../JSON/data.json", "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"{len(feed.entries)} articles récupérés, JSON mis à jour avec {len(data)} articles.")