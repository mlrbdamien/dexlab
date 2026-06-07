## Stack

- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- Fuse.js (recherche fuzzy)

## Développement local

```bash
npm install
npm run dev
```

Ouvre [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

## Déploiement

Le déploiement sur GitHub Pages est automatique à chaque push sur `main` via GitHub Actions.

Dans les paramètres du repo GitHub → **Pages** → Source : **GitHub Actions**.

## Structure

```
src/
  components/   # UI (Layout, TubeGrid, onglets procédures…)
  data/         # Tubes, protocoles, étiquettes
  hooks/        # Recherche, favoris, thème
  pages/        # HomePage
```
