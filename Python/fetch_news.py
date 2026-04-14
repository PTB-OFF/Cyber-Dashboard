import html
import json
import re
from datetime import datetime, timezone
from pathlib import Path

import feedparser

RSS_URL = "https://thehackernews.com/feeds/posts/default"
MAX_ARTICLES = 6
ROOT_DIR = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT_DIR / "JSON" / "data.json"


def clean_html(raw_text: str) -> str:
    text = re.sub(r"<[^>]+>", "", raw_text or "")
    text = html.unescape(text)
    return " ".join(text.split())


def detect_type(title: str, description: str) -> str:
    content = f"{title} {description}".lower()
    if "cve-" in content:
        return "CVE"
    if "ransomware" in content:
        return "Ransomware"
    if "data breach" in content or "breach" in content:
        return "Data Breach"
    return "Other"


def detect_severity(title: str, description: str) -> str:
    content = f"{title} {description}".lower()
    if any(keyword in content for keyword in ["critical", "actively exploited", "zero-day"]):
        return "HIGH"
    if any(keyword in content for keyword in ["warning", "alert", "vulnerability"]):
        return "MEDIUM"
    return "LOW"


def parse_entries():
    feed = feedparser.parse(RSS_URL)
    articles = []

    for entry in feed.entries:
        published = getattr(entry, "published_parsed", None) or getattr(entry, "updated_parsed", None)
        if published:
            published_dt = datetime(*published[:6], tzinfo=timezone.utc)
        else:
            published_dt = datetime.now(timezone.utc)

        title = getattr(entry, "title", "Sans titre").strip()
        description = clean_html(getattr(entry, "summary", ""))

        article = {
            "published_at": published_dt.isoformat(),
            "date": published_dt.strftime("%d-%m-%Y %H:%M UTC"),
            "title": title,
            "link": getattr(entry, "link", ""),
            "description": description,
            "source": "The Hacker News",
            "type": detect_type(title, description),
            "severity": detect_severity(title, description),
        }
        if article["link"]:
            articles.append(article)

    articles.sort(key=lambda item: item["published_at"], reverse=True)
    return articles[:MAX_ARTICLES]


def main():
    latest_articles = parse_entries()
    JSON_PATH.parent.mkdir(parents=True, exist_ok=True)
    with JSON_PATH.open("w", encoding="utf-8") as file:
        json.dump(latest_articles, file, indent=2, ensure_ascii=False)

    print(f"{len(latest_articles)} articles sauvegardes dans {JSON_PATH}")


if __name__ == "__main__":
    main()
