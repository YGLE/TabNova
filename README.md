# TabNova

**Gestionnaire de groupes d'onglets Chrome avec visualisation en bulles interactives.**

TabNova remplace le système natif de groupes d'onglets Chrome par une interface graphique innovante : un espace visuel de "bulles" flottantes avec synchronisation multi-appareils.

## Fonctionnalités

- **Visualisation D3.js** — Groupes affichés en bulles colorées avec animation d'entrée
- **Gestion complète** — Créer, renommer, supprimer, fusionner des groupes
- **Undo/Redo** — Annuler les 5 dernières actions
- **Sync multi-appareils** — Google Drive ou iCloud avec chiffrement AES-256
- **Mode hors ligne** — Queue de changements, sync au retour en ligne
- **Recherche instantanée** — Filtrage des groupes en temps réel
- **Clavier accessible** — Navigation complète au clavier

## Installation

### Depuis les sources

```bash
git clone https://github.com/YGLE/TabNova.git
cd TabNova
npm install
npm run build:extension
```

Puis dans `chrome://extensions/` → Mode développeur → Charger l'extension non empaquetée → `dist-extension/`

## Développement

```bash
npm run test          # Tests unitaires
npm run test:coverage # Tests avec couverture
npm run type-check    # Vérification TypeScript
npm run lint          # ESLint
```

## Stack technique

| Couche | Technologie |
|--------|-------------|
| UI | React 18 + TypeScript |
| Visualisation | D3.js v7 |
| État | Zustand |
| Style | Tailwind CSS |
| Build | Vite + Manifest V3 |
| Tests | Vitest + Testing Library |
| Sync | Google Drive API + CloudKit |
| Chiffrement | AES-256-GCM (WebCrypto) |
| Stockage | IndexedDB (idb) |

## Architecture

```
extension/
├── src/
│   ├── background/     # Service Worker Chrome
│   ├── components/     # Composants React (BubbleCluster, Modal, etc.)
│   ├── hooks/          # Hooks React (useMessage, useChromeSync, etc.)
│   ├── services/       # Logique métier (groupService, syncEngine, etc.)
│   ├── storage/        # IndexedDB repositories
│   ├── store/          # Zustand stores
│   ├── types/          # Types TypeScript
│   └── utils/          # Helpers et constantes
├── public/
│   ├── popup.html
│   ├── dashboard.html
│   └── icons/
└── manifest.json
```

## Synchronisation

TabNova supporte 2 providers de sync :
- **Google Drive** — OAuth2 automatique, fichier `tabnova-sync.json` chiffré
- **iCloud** — CloudKit Web Services (Container ID requis)

Les données sont chiffrées avec AES-256-GCM avant upload. La clé de chiffrement est partagée manuellement entre vos appareils.

## Tests

```
270+ tests unitaires
Couverture: ≥ 70%
```

## Licence

MIT
