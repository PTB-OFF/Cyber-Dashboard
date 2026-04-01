import feedparser
import re
import json
from datetime import datetime

RSS_URL = "https://feeds.feedburner.com/TheHackersNews"

def clean_html(text):
    return re.sub('<[^<]+?>', '', text)

def get_type(title):
    t = title.lower()
    if "cve" in t: return "CVE"
    if "ransomware" in t: return "Ransomware"
    if "phishing" in t: return "Phishing"
    if "malware" in t: return "Malware"
    if "breach" in t: return "Data Breach"
    return "Other"

def get_severity(title):
    t = title.lower()
    if any(x in t for x in ["critical", "exploit", "ransomware"]):
        return "HIGH"
    if any(x in t for x in ["phishing", "malware"]):
        return "MEDIUM"
    return "LOW"

feed = feedparser.parse(RSS_URL)

articles = []

for entry in feed.entries[:20]:
    article = {
        "date": datetime(*entry.published_parsed[:6]).strftime("%d-%m-%Y"),
        "timestamp": datetime(*entry.published_parsed[:6]).isoformat(),
        "title": entry.title,
        "link": entry.link,
        "description": clean_html(entry.summary)[:200],
        "type": get_type(entry.title),
        "severity": get_severity(entry.title)
    }
    articles.append(article)

# TRI
articles.sort(key=lambda x: x["timestamp"], reverse=True)

# 🔥 chemin modifié
with open("JSON/data.json", "w", encoding="utf-8") as f:
    json.dump(articles, f, indent=4, ensure_ascii=False)

print("JSON updated ✅")