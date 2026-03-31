import feedparser
import re
from datetime import datetime
import gspread
from oauth2client.service_account import ServiceAccountCredentials

RSS_URL = "https://feeds.feedburner.com/TheHackersNews"

scope = ["https://spreadsheets.google.com/feeds",
         "https://www.googleapis.com/auth/drive"]

creds = ServiceAccountCredentials.from_json_keyfile_name("credentials.json", scope)
client = gspread.authorize(creds)
sheet = client.open("Cybersecurity News").sheet1

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

for entry in feed.entries[:10]:
    title = entry.title
    link = entry.link
    date = datetime(*entry.published_parsed[:6]).strftime("%d-%m-%Y")
    desc = clean_html(entry.summary)[:200]

    row = [date, title, get_type(title), get_severity(title), desc, link]
    sheet.append_row(row)

print("Done ✅")