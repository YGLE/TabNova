# 🌟 TabNova - Web Bookmarks Manager

Une extension Chrome/Edge révolutionnaire qui remplace le système de groupes d'onglets natif avec une interface graphique innovante : une grappe de points flottante et interactive.

## 🎯 Objectif

Transformer la gestion des favoris web en une expérience visuelle fluide et intuitive. Au lieu de listes ennuyeuses, explorez vos groupes sous forme de nuage organique avec animations spectaculaires.

## ✨ Fonctionnalités Principales

- 🌌 **Visualisation en Grappe** : Bubbles flottantes avec fond space étoilé
- 🔄 **Sync Multi-Appareils** : Synchronisation instantanée via Google Drive ou iCloud
- 🎨 **Personnalisation** : Couleurs prédéfinies + custom color picker
- 📱 **PWA Mobile** : Installez sur iPhone/iPad (PHASE 2)
- 🔍 **Recherche Intelligente** : Full-text sur title + URL + groupes
- ⭐ **Favoris** : Épinglez les groupes importants
- 📊 **Gestion Avancée** : Fusion, archivage, élagage automatique (18 mois)
- 🔐 **Chiffrement** : AES-256 pour les données sync
- ⏮️ **Undo/Redo** : Historique 5 actions

## 🚀 Quick Start

```bash
# Clone & Install
git clone https://github.com/ygle/TabNova.git
cd TabNova
npm install

# Development
npm run dev

# Build extension
npm run build:extension

# Build backend (optional)
npm run build:backend
```

## 📋 Project Structure

```
TabNova/
├── extension/              # Chrome/Edge extension
│   ├── src/
│   │   ├── background/     # Service Worker
│   │   ├── popup/          # Popup UI
│   │   ├── dashboard/      # Dashboard fullscreen
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom hooks
│   │   ├── store/          # Zustand stores
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   ├── storage/        # IndexedDB
│   │   └── utils/          # Utilities
│   ├── manifest.json       # Manifest V3
│   └── public/             # Icons, assets
├── backend/                # Optional Node.js backend
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   └── config/         # Configuration
│   └── tests/              # Test suite
├── docs/                   # Documentation
├── mockups/                # Design specs & mockups
└── .github/                # CI/CD workflows
```

## 🎨 Design

- **Palette** : Noir pur (#000) + 8 couleurs de groupes
- **Typography** : Inter (UI) + Fira Code (Code)
- **Animations** : Explosion 800ms, hover 200ms, spring drag-drop
- **Responsive** : 300px min width, fullscreen capable

Voir [Design Specifications](docs/DESIGN-SPECIFICATIONS.md)

## 🏗️ Architecture

- **Frontend** : React 18 + TypeScript + D3.js
- **Extension** : Manifest V3 (Chrome/Edge)
- **Storage** : IndexedDB (offline-first)
- **Sync** : Google Drive API / iCloud CloudKit / Backend custom
- **Build** : Vite (ultra-fast)
- **Testing** : Vitest + React Testing Library

Voir [Architecture](docs/ARCHITECTURE.md)

## 📱 Timeline

- **PHASE 1** (3 semaines) : Extension desktop + core features
- **PHASE 2** (4 semaines) : PWA iOS + polish

## 📝 User Stories

Toutes les US validées et documentées : [USER_STORIES.md](docs/USER_STORIES.md)

## 🤝 Development Status

🚧 **In Planning** - Lancement SPRINT 1 (Foundations)

## 📄 License

MIT

---

**Made with ❤️ by YGLE**
