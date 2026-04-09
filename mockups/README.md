# 🎨 TabNova - Interactive Mockup

## Aperçu

Ceci est un prototype HTML/CSS interactif qui visualise l'interface complète de TabNova.

**Ouvrir en navigateur** : `mockups/index.html`

## 📱 Ce que vous voyez

### **Vue Popup (Gauche)**
```
Size: 450x700px (comme dans Chrome)
├─ Navbar avec titre "✨ TabNova"
├─ Barre de recherche
├─ Liste des groupes:
│  ├─ DEV (12 onglets) - Bleu
│  ├─ DESIGN (8 onglets) - Rose
│  ├─ ACHATS (15 onglets) - Jaune
│  └─ DOCS (22 onglets) - Vert
└─ Footer avec boutons
   ├─ "+ Créer groupe"
   └─ "Ouvrir →"
```

### **Vue Dashboard (Droite)**
```
Size: Fullscreen / new tab
├─ Navbar avec titre
├─ Barre de recherche
├─ Bubble Cluster (visualisation D3-style)
│  ├─ Bulles flottantes (Dev, Design, Achats, Docs)
│  ├─ Badges de nombre d'onglets (rouge)
│  ├─ Fond noir avec particles aléatoires (effet space)
│  ├─ Animation hover sur bulles
│  └─ Indicateur de sync (bas-droit)
└─ Zoom & réorganisation (placeholder)
```

## 🎨 Palette Couleurs

```
Noir Primaire:     #000000
Gris Dark:         #1F2937
Gris clair:        #B0B0B0
Blanc:             #FFFFFF

Groupes:
- Bleu (Dev):      #3B82F6
- Rose (Design):   #EC4899
- Jaune (Achats):  #FBBF24
- Vert (Docs):     #10B981
- Violet:          #8B5CF6
- Cyan:            #06B6D4
- Orange:          #F97316
- Indigo:          #6366F1

Badge rouge:       #EF4444 (style Gmail)
```

## ✨ Caractéristiques du Prototype

✅ **Responsive Design**
- Desktop: 2 colonnes (Popup + Dashboard)
- Mobile: 1 colonne (Popup, puis Dashboard en dessous)

✅ **Animations**
- Particles background (mouvement lent, effet space)
- Hover sur bulles (scale + glow)
- Hover sur items (border highlight)
- Pulse animation sur sync indicator

✅ **Interactif**
- Clic sur groupe → Alerte (SPRINT 1: ouvre onglets)
- Clic "Créer groupe" → Alerte (SPRINT 1: modal inline)
- Clic "Ouvrir" → Alerte (SPRINT 1: new tab dashboard)
- Hover sur bubbles → Show orbit (placeholder)

✅ **Dark Mode Only**
- Aucun light mode
- Tous les contrastes optimisés pour dark

✅ **Typography**
- Inter pour UI
- Fira Code pour code (placeholder)
- Font weights: 400, 500, 600, 700

## 🖥️ Comment Utiliser

### Ouvrir le prototype
```bash
# Option 1: Directement depuis le fichier
open mockups/index.html

# Option 2: Avec un serveur local (recommandé)
cd TabNova
npx serve mockups/
# Puis ouvrir http://localhost:3000
```

### Naviguer
- **Vue Popup** : Voir la liste des groupes
- **Vue Dashboard** : Voir les bulles interactives
- **Hover** : Passez la souris sur les bulles pour voir les interactions
- **Clic** : Cliquez sur les groupes ou boutons pour voir les alertes

## 🔄 Interactions Simulées

| Élément | Interaction | Résultat |
|---------|-------------|----------|
| Groupe item | Clic | Alerte "Groupe cliqué" |
| Bubble (Dev, Design, etc.) | Hover | Scale + Glow effect |
| "+ Créer groupe" | Clic | Alerte "Créer groupe" |
| "Ouvrir →" | Clic | Alerte "Ouvrir gestionnaire" |
| Search input | Focus | Blue border + glow |

## 📝 Notes pour les Agents

Ce prototype sert de **reference visuelle** pour SPRINT 1 :

- **AGENT 3** : Voir le layout React, les couleurs Tailwind, les animations CSS
- **AGENT 1** : Voir la structure des données (groupes, badges, etc.)
- **AGENT 2** : Voir les interactions (popup ↔ dashboard, messages)

Les agents **ne doivent pas copier le HTML**, mais s'inspirer du design et des interactions.

## 🚀 Améliorations pour Phase 2

- [ ] Zoom D3.js interactif (min/max zoom)
- [ ] Drag-drop des bulles (réorganisation)
- [ ] Modal de création de groupe (inline)
- [ ] Modal d'édition (couleur, nom)
- [ ] Affichage des onglets en orbit au hover
- [ ] Indicateur de favorite (star icon)
- [ ] Vue "Favoris" spéciale

## 📱 Mobile Preview

Pour voir sur mobile:
```bash
# Sur le même réseau
npx serve mockups/
# Puis ouvrir http://<your-ip>:3000 sur votre mobile
```

Ou utiliser le responsive mode du navigateur : `F12` → Toggle device toolbar

## ✅ Checklist pour Validation

- ✅ Palette couleurs exacte
- ✅ Typography correcte (Inter 18px navbar, etc.)
- ✅ Animations fluides (60 FPS)
- ✅ Dark mode only
- ✅ Responsive (mobile + desktop)
- ✅ Accessibility basics (focus states, contrast)
- ✅ Performance (no lagging)

---

**Status** : ✅ Prêt pour utilisation par les agents
**Version** : 1.0
**Date** : 2025-04-09
