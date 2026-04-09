# 🎨 TabNova - Design Specifications v1.0

## 📐 PALETTE COULEURS

### Couleurs Primaires
```
Fond Principal (Default):       #000000 (Noir pur)
Fond Alternative:               #0a0e27 (Noir très foncé, pour futur)
Texte Primaire:                 #FFFFFF (Blanc)
Texte Secondaire:               #B0B0B0 (Gris 70%)
Texte Tertiaire:                #6B7280 (Gris 40%)
Border/Divider:                 #1F2937 (Gris très foncé)
```

### Couleurs de Groupe (Palette - 8 couleurs)
```
1. Bleu Dev:                    #3B82F6 (RGB: 59, 130, 246)
2. Rose Design:                 #EC4899 (RGB: 236, 72, 153)
3. Jaune Achats:                #FBBF24 (RGB: 251, 191, 36)
4. Vert Docs:                   #10B981 (RGB: 16, 185, 129)
5. Violet Archive:              #8B5CF6 (RGB: 139, 92, 246)
6. Cyan:                        #06B6D4 (RGB: 6, 182, 212)
7. Orange:                      #F97316 (RGB: 249, 115, 22)
8. Indigo:                      #6366F1 (RGB: 99, 102, 241)
```

### Couleurs Accents
```
Hover State:                    Opacity +15%, Brightness +10%
Active/Focus:                   Glow: 0 0 20px rgba(color, 0.6)
Danger (Delete):                #EF4444 (RGB: 239, 68, 68)
Success (Saved):                #10B981 (RGB: 16, 185, 129)
Warning:                        #F59E0B (RGB: 245, 158, 11)
Badge Nombre:                   #EF4444 (Rouge, style Gmail)
```

### Particles Background
```
Étoiles/Particles:              #FFFFFF @ 20-40% opacity
Animation Speed:                3-5 sec par particle
Direction:                      Aléatoire, lent
Densité:                        ~30-50 particles par viewport
```

---

## 🔤 TYPOGRAPHY

### Font Stack
```
Primary (UI, Labels):           "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
Code/Monospace:                 "Fira Code", "Monaco", "Courier New", monospace
Web Font:                       Google Fonts: Inter + Fira Code (preload)
```

### Text Styles

#### Navbar - App Name
```
Font:           Inter, 18px, Bold (weight 700)
Color:          #FFFFFF
Line-height:    1.2
Letter-spacing: 0.5px
```

#### Groupe Titre (dans la grappe)
```
Font:           Inter, 18px, Bold (weight 700)
Color:          [Couleur du groupe]
Line-height:    1.4
Text-align:     Center
Max-width:      90px
```

#### Badge Nombre Onglets
```
Font:           Inter, 12px, Bold (weight 700)
Color:          #FFFFFF
BG:             #EF4444
Padding:        4px 8px
Border-radius:  12px (pill)
Position:       Top-right du groupe
```

#### Onglet (dans le nuage)
```
Font:           Inter, 12px, Regular (weight 400)
Color:          #FFFFFF
Line-height:    1.4
Max-width:      80px
Ellipsis:       si trop long
```

#### Input Label
```
Font:           Inter, 14px, Medium (weight 500)
Color:          #B0B0B0
Margin-bottom:  8px
```

#### Input Text
```
Font:           Inter, 14px, Regular (weight 400)
Color:          #FFFFFF
BG:             #1F2937
Border:         1px solid #374151
Padding:        10px 12px
Border-radius:  6px
Focus:          Border #3B82F6, Box-shadow 0 0 0 3px rgba(59, 130, 246, 0.1)
```

#### Button Primary
```
Font:           Inter, 14px, Bold (weight 600)
Color:          #FFFFFF
BG:             #3B82F6
Padding:        10px 20px
Border-radius:  6px
Height:         40px
Hover:          BG #2563EB
Active:         Transform scale(0.98)
```

#### Button Secondary
```
Font:           Inter, 14px, Regular (weight 400)
Color:          #B0B0B0
BG:             transparent
Border:         1px solid #374151
Padding:        10px 20px
Border-radius:  6px
Hover:          BG #1F2937, Color #FFFFFF
```

#### Toast Notification
```
Font:           Inter, 14px, Medium (weight 500)
Color:          #FFFFFF
BG:             #1F2937
Border-left:    4px solid #10B981 (success)
Padding:        12px 16px
Border-radius:  4px
Box-shadow:     0 10px 25px rgba(0, 0, 0, 0.5)
```

#### Tooltip
```
Font:           Inter, 12px, Regular (weight 400)
Color:          #FFFFFF
BG:             #2D3748
Padding:        6px 10px
Border-radius:  4px
Max-width:      200px
```

---

## 📏 SPACING & SIZING

### Spacing Scale (8px base)
```
0:   0px      |  5:   20px
1:   4px      |  6:   24px
2:   8px      |  7:   28px
3:   12px     |  8:   32px
4:   16px     |  9:   36px
              | 10:   40px
```

### Component Sizing
```
Popup (default):            400px × 600px
Popup (min-width):          300px
Popup (max-width):          800px
Popup resize handle:        20px (bottom-right corner)

Dashboard:                  100vw × 100vh
Navbar height:              56px
Search bar height:          44px

Groupe bubble:              80px diameter
Onglet bubble:              40px diameter
Favicon:                    24px
Icon (nav):                 18px
Badge:                      16px height
```

### Padding Standards
```
Container main:             20px (desktop), 16px (mobile)
Card/Modal padding:         20px
Input field padding:        10px 12px
Button padding:             10px 20px
Navbar padding:             12px 16px
```

---

## 🎬 ANIMATIONS & TRANSITIONS

### Entrance Animations

#### Explosion (au chargement de la grappe)
```
Duration:       800ms
Timing:         cubic-bezier(0.34, 1.56, 0.64, 1) [Elastic/Overshoot]
Transform:      From center → final position
Opacity:        0 → 1
Rotation:       Random -180° → 0°
```

#### Hover Onglet
```
Duration:       200ms
Timing:         ease-in-out
Transform:      scale(1) → scale(1.1)
Brightness:     +20%
```

#### Clic Bouton
```
Duration:       100ms
Timing:         ease-out
Transform:      scale(1) → scale(0.95) → scale(1)
Box-shadow:     Expand slightly
```

#### Fade Out
```
Duration:       300ms
Timing:         ease-out
Opacity:        1 → 0
Transform:      scale(1) → scale(0.95)
```

#### Drag-Drop
```
Duration:       Spring animation
Stiffness:      170
Damping:        26
Mass:           1
Cursor:         grab/grabbing
Opacity src:    0.5 while dragging
Target zone:    Highlight on hover (opacity +20%)
```

### Transitions Standards
```
Color/Opacity:      200ms ease-in-out
Position:           300ms ease-in-out
Border/Shadow:      150ms ease-out
```

---

## 🎭 COMPONENT STATES

### Groupe Bubble

#### Default
```
Size:           80px diameter
BG:             [Couleur groupe]
Border:         None
Box-shadow:     0 4px 12px rgba(0, 0, 0, 0.3)
Cursor:         pointer
```

#### Hover
```
Transform:      scale(1.05)
Box-shadow:     0 8px 24px rgba([color], 0.5)
Brightness:     +10%
```

#### Dragging
```
Box-shadow:     0 15px 40px rgba(255, 255, 255, 0.2)
Opacity:        0.8
Cursor:         grabbing
```

#### Pinned
```
Border:         2px solid gold (#FBBF24)
Glow:           0 0 16px rgba(251, 191, 36, 0.4)
```

### Onglet Bubble

#### Default
```
Size:           40px diameter
BG:             [Couleur groupe] @ 60% opacity
Border:         1px solid [Couleur groupe] @ 80%
Box-shadow:     None
Cursor:         pointer
```

#### Hover
```
Transform:      scale(1.15)
Box-shadow:     0 6px 16px rgba([color], 0.6)
BG:             [Couleur groupe] @ 100%
Border:         2px solid [Couleur groupe]
```

#### Clicked
```
Box-shadow:     0 12px 24px rgba([color], 0.7)
Transform:      scale(0.98) briefly
```

### Input Field

#### Default
```
BG:             #1F2937
Border:         1px solid #374151
Color:          #FFFFFF
Placeholder:    #6B7280
```

#### Focus
```
Border:         2px solid #3B82F6
Box-shadow:     0 0 0 3px rgba(59, 130, 246, 0.1)
BG:             #111827
```

#### Error
```
Border:         2px solid #EF4444
Box-shadow:     0 0 0 3px rgba(239, 68, 68, 0.1)
```

### Button

#### Primary (Default)
```
BG:             #3B82F6
Color:          #FFFFFF
Box-shadow:     0 2px 8px rgba(59, 130, 246, 0.3)
```

#### Primary (Hover)
```
BG:             #2563EB
Box-shadow:     0 4px 12px rgba(59, 130, 246, 0.5)
Transform:      translateY(-2px)
```

#### Primary (Active)
```
BG:             #1D4ED8
Transform:      scale(0.98)
Box-shadow:     0 0px 4px rgba(59, 130, 246, 0.3)
```

#### Primary (Disabled)
```
BG:             #6B7280
Color:          #9CA3AF
Cursor:         not-allowed
Opacity:        0.6
```

---

## 📱 Responsive Design

### Breakpoints
```
Mobile:         320px - 767px
Tablet:         768px - 1024px
Desktop:        1025px+
```

### Popup Responsive
```
Mobile (< 500px):       Full width - 16px margin, height auto
Tablet (500-800px):     Flexible, keep proportions
Desktop (> 800px):      Max 800px width
```

### Dashboard Responsive
```
Mobile:         Single column, full width
Tablet:         2 columns if room
Desktop:        Full grappe, no constraints
```

---

## 🎪 Particles Background

### Implementation
```
Type:           Animated SVG or Canvas
Count:          30-50 per viewport
Size:           2-4px radius
Color:          #FFFFFF @ 25% opacity
Speed:          0.5-1.5px/sec (slow)
Duration:       Infinite loop
Path:           Random trajectory, wrap around edges
```

### Effect
```
Should feel:    Organic, unobtrusive, space-like
Not should be:  Distracting, janky, resource-heavy
Performance:    60 FPS target, < 10% CPU impact
```

---

## 🔐 Dark Mode Only

TabNova is dark-mode only. No light mode planned. All colors optimized for dark theme.

---

**Last Updated**: 2025-04-09
**Version**: 1.0
