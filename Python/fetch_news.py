import feedparser
import json
from datetime import datetime

RSS_URL = "https://thehackernews.com/feeds/posts/default"

# 🔥 chemin corrigé (IMPORTANT)
JSON_PATH = "JSON/data.json"

# Charger JSON existant
try:
    with open(JSON_PATH, "r", encoding="utf-8") as f:
        data = json.load(f)
except:
    data = []

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

    if not any(d["link"] == article["link"] for d in data):
        data.append(article)

# TRI (important pour ton dashboard)
data.sort(key=lambda x: datetime.strptime(x["date"], "%d-%m-%Y"), reverse=True)

# Sauvegarde
with open(JSON_PATH, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print(f"{len(data)} articles dans le JSON ✅")
