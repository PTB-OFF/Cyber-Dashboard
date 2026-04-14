# Cyber Dashboard

Tableau de bord cyber qui affiche les **6 dernieres actualites** de [The Hacker News](https://thehackernews.com/), du **plus recent au moins recent**, directement dans `index.html`.

## Fonctionnalites

- Recuperation automatique des articles depuis le flux RSS The Hacker News
- Stockage des donnees dans `JSON/data.json`
- Affichage web compatible mobile et desktop
- Tri automatique des articles (recents en haut)
- Workflow GitHub Actions quotidien pour mise a jour des donnees

## Structure du projet

- `Python/fetch_news.py` : recupere et formate les actualites
- `JSON/data.json` : stockage des 6 dernieres actualites
- `index.html` : page principale
- `JS/script.js` : rendu dynamique des actualites
- `CSS/style.css` : style visuel
- `.github/workflows/daily.yml` : mise a jour automatique quotidienne

## Lancer en local

### 1) Installer les dependances Python

```bash
pip install feedparser requests
```

### 2) Generer `data.json`

```bash
python Python/fetch_news.py
```

### 3) Ouvrir le dashboard

Ouvre `index.html` dans ton navigateur.

> Conseil: si le JSON ne se charge pas en ouverture directe, lance un petit serveur local.

Exemple:

```bash
python -m http.server 8000
```

Puis ouvre: [http://localhost:8000](http://localhost:8000)

## Automatisation GitHub Actions

Le workflow `daily.yml`:

- s'execute chaque jour a **08:00 heure de Paris** (prise en charge ete/hiver)
- lance `Python/fetch_news.py`
- met a jour `JSON/data.json`
- commit automatiquement les changements

Tu peux aussi le lancer manuellement depuis l'onglet **Actions** (event `workflow_dispatch`).

## Deploiement (GitHub Pages)

1. Push le projet sur GitHub
2. Active **Settings > Pages**
3. Choisis la branche (`main`) et le dossier racine
4. Accede ensuite au dashboard depuis ton PC ou ton telephone via l'URL GitHub Pages

## Notes

- Le dashboard affiche uniquement les **6 dernieres** news.
- Les donnees sont nettoyees (description sans balises HTML).
- Types et niveau de gravite sont deduits automatiquement a partir du titre/texte.
