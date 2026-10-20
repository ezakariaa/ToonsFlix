# ToonsFlix

ToonsFlix est une application web construite avec Next.js pour parcourir et découvrir le catalogue de contenus ToonTales : catégories, séries, épisodes et pages de détail.

L'objectif du projet est de proposer une interface plus lisible et plus moderne que le site source, avec une navigation par catégories, une recherche rapide et une expérience de consultation adaptée au navigateur.

## Fonctionnalités

- Catalogue des catégories et séries ToonTales
- Liste des épisodes par catégorie
- Page détaillée d'un épisode avec description et lien de téléchargement si disponible
- Recherche dans le catalogue
- Support de langue avec traduction de libellés (FR / EN)
- Interface responsive et moderne
- Génération statique des pages de catégorie
- Mise en cache des données pour limiter les appels au site source

## Stack technique

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Scraping HTML léger du site ToonTales pour construire le catalogue

## Prérequis

- Node.js 20+
- npm
- Accès réseau pour récupérer les données depuis ToonTales

## Installation

1. Cloner le projet

```bash
git clone <url-du-projet>
cd toontales-next
```

2. Installer les dépendances

```bash
npm install
```

3. Lancer le serveur de développement

```bash
npm run dev
```

4. Ouvrir l'application dans le navigateur

```text
http://localhost:3000
```

## Démo en ligne

La version déployée du projet est accessible ici :

https://ezakariaa.github.io/ToonsFlix/

Cette page permet de voir la version publique de l'application sans avoir à démarrer le projet localement.

## Scripts disponibles

```bash
npm run dev
npm run build
npm run start
npm run lint
```

## Structure du projet

```text
src/
├── app/
│   ├── category/[slug]/page.tsx
│   ├── episode/[slug]/page.tsx
│   ├── search-index.json/route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── DownloadButton.tsx
│   ├── EpisodeListItem.tsx
│   ├── HeaderSearch.tsx
│   ├── LanguageFlags.tsx
│   ├── LanguageProvider.tsx
│   └── TranslateText.tsx
├── lib/
│   ├── catalog.ts
│   ├── categoryImages.ts
│   ├── i18n.ts
│   └── ...
└── ...
```

## Détails de l'implémentation

La logique principale du catalogue est centralisée dans `src/lib/catalog.ts`.

Elle:

- récupère la page d'accueil de ToonTales
- extrait les séries et catégories
- visite les pages associées à chaque série
- récupère les épisodes et leurs métadonnées
- extrait les URLs de page et les liens directs de téléchargement quand ils sont présents
- met en cache le résultat pendant 30 minutes pour éviter des rechargements inutiles

## Variable d'environnement optionnelle

Le projet supporte une limite optionnelle pour le nombre de pages de série à parcourir :

```bash
TOONTALES_MAX_PAGES_PER_SERIES=3
```

Cette variable permet de réduire le nombre de requêtes effectuées sur le site source pendant le build ou le refresh du catalogue.

## Remarques

- Le projet s'appuie sur la structure publique du site ToonTales et peut être affecté par des changements dans le HTML du site source.
- La fiabilité des liens de téléchargement dépend des données publiées par ToonTales.
- L'application est destinée à un usage de consultation et de navigation de catalogue.

## Licence

Ce projet est livré sans licence explicite dans le dépôt. Vérifier le dépôt GitHub ou les fichiers de configuration si une licence doit être ajoutée avant une mise en production.
