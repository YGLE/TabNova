# 👤 TabNova - User Stories (Validated)

## US-1 : Découvrir les groupes existants
- Import minimaliste direct (pas d'onboarding)
- Afficher TOUS les groupes (même vides)
- Infos: Nom + Nombre d'onglets + Couleur
- Si aucun groupe: "Pas de groupes trouvés. Créer un groupe ici ?"
- Sync automatique avec IndexedDB local

## US-2 : Visualisation Grappe de Points
- Style: Clouds/bubbles flottantes aléatoires (organique)
- Animation entrée: Explosion depuis le centre (800ms)
- Draggable avec sauvegarde position personnalisée
- Zoomable (afficher tous + zoom pour explorer)
- Badge numérique rouge pour nombre d'onglets
- Fond noir pur avec étoiles/particles aléatoires (effet space)

## US-3 : Explorer Onglets du Groupe
- Déclenchement: Hover (desktop) / Clic (mobile) - adaptatif
- Disposition: Nuage organique (positionnement aléatoire)
- Affichage: TOUS les onglets (scroll si > 20)
- Info onglet: Favicon + Title complet
- Clic onglet: Ouvre onglet + popup se ferme
- **Clic groupe: Ouvre TOUS les onglets en foreground**
- Clic ailleurs: Onglets disparaissent
- Pas de drag-drop onglet entre groupes

## US-4 : CRUD Groupes
- Créer: Bouton navbar + formulaire inline
- Création aussi depuis navigateur (clic droit multi-select)
- Couleurs: Palette 8 + custom color picker
- Pas d'emoji (juste couleurs)
- Renommer: Clic droit → "Renommer"
- Supprimer: Avertir "Les onglets resteront ouverts"
- Undo sur 5 dernières actions
- Toast notification avec Undo (5 sec)

## US-5 : Gestion Avancée
- Fusion: 3 méthodes (checkbox, drag-drop, clic droit)
- Modal pour choisir nom groupe final
- Réorganiser groupes: Drag-drop dans grappe
- Pas de drag-drop onglets (ordre Chrome suffit)
- Épingler favoris (star pour groupes prioritaires)

## US-6 : Synchronisation Multi-Appareils
- Options: iCloud CloudKit OU Google Drive OU Backend Node.js
- Chiffrement avec clé partagée entre appareils
- Sync instantanée (< 1 sec après changement)
- Indicateur: Badge discret (✓ Synced ou ⏳ Syncing)
- Conflits: Last-write-wins (timestamp)
- Offline: Mode lecture+écriture (sync au retour online)
- Un utilisateur par extension (pas de multi-user)
- Historique: 10 derniers changements

## US-7 : PWA Mobile (Phase 2)
- PHASE 2: Après stabiliser desktop (2-3 mois)
- PWA uniquement (pas app native Swift)
- Installation: Safari "Partager" → + Chrome menu "Installer"
- Grappe: Adaptatif (petite mais fonctionnelle)
- Ouverture onglet: À définir PHASE 2
- Offline: Besoin internet (sync offline US-6 suffit)
- iCloud + Google Drive en option
- Clic groupe = ouvre TOUS les onglets
- Futur: miniature onglet au survol (preview page)

## US-8 : Recherche & Filtrage
- Barre permanente en haut
- Cherche: Title + URL + Nom groupe
- Résultats: Highlight matching dans grappe
- Vue spéciale "Favoris" (onglets marqués avec star)
- Groupes intelligents/dynamiques: PLUS TARD (futur)

## US-9 : Popup vs Fullscreen
- Popup: Resizable (utilisateur ajuste taille)
- Afficher: TOUS les groupes (scroll si besoin)
- "Ouvrir gestionnaire": Nouvelle tab chrome-extension://dashboard
- Auto-ferme: Configurable par user (settings)
- Keyboard: Cmd/Ctrl+Shift+Y (ouvrir ext) + Cmd+K (chercher)
- Menu clic droit: "Ajouter au groupe" + "Créer groupe" (multi-select)

## US-10 : Onboarding & Tutorial
- Pas d'onboarding: Directement l'app
- Config sync: Optionnelle (proposer, skip possible)
- Aide: Tooltips contextuel au hover
- Langues: EN + FR au départ, plus tard pour autres

## US-11 : Performance & Qualité
- Taille extension: < 500 KB
- Latence popup: < 200ms
- Volume: 1000 onglets max, groupes illimités
- Cache offline: Persistent (jamais supprimé)
- Élagage: Proposer suppression groupes non-utilisés 18 mois
- Tests: 70-80% coverage

---

**All user stories validated and documented**
**Last Updated**: 2025-04-09
