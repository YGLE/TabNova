# TabNova — Guide de déploiement

## Build de production

```bash
npm run build:extension
```

Output: `dist-extension/`

## Packaging (.zip)

```bash
npm run package:zip
```

Output: `tabnova-extension-v0.1.0.zip`

## Installation locale (développement)

1. Ouvre `chrome://extensions/`
2. Active le "Mode développeur"
3. Clique "Charger l'extension non empaquetée"
4. Sélectionne `dist-extension/`

## Chrome Web Store

1. Prérequis :
   - Compte développeur Chrome Web Store ($5 frais uniques)
   - Remplacer `PLACEHOLDER_GOOGLE_CLIENT_ID` dans `manifest.json`
   - Screenshots 1280x800 du Dashboard

2. Soumission :
   - Va sur https://chrome.google.com/webstore/devconsole
   - "Ajouter un nouvel élément"
   - Upload `tabnova-extension-v0.1.0.zip`

## Variables à configurer avant publication

| Variable | Fichier | Description |
|----------|---------|-------------|
| `PLACEHOLDER_GOOGLE_CLIENT_ID` | `manifest.json` | OAuth2 Google Client ID |
| `containerIdentifier` | UI SyncSettings | Container iCloud |
| `apiToken` | UI SyncSettings | Token CloudKit |
