# CSS Styling Reference - Alumni Search Redesign

## 🎨 Complete Style System

### Hero Section
```css
.heroSection {
  padding: 80px 24px 60px;      /* Generous vertical spacing */
  text-align: center;
  margin-bottom: 40px;
}

.heroTitle {
  font-size: clamp(40px, 6vw, 64px);  /* Responsive: 40px min, 6vw fluid, 64px max */
  font-weight: 700;
  line-height: 1.05;
  color: var(--text-primary);
  margin-bottom: 20px;
  letter-spacing: -0.03em;      /* Tight letter spacing for premium feel */
}

.heroDescription {
  font-size: clamp(18px, 2vw, 22px);  /* Responsive description size */
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 40px;
}
```

### Search Card
```css
.searchCard {
  background: var(--surface);            /* Off-white */
  border-radius: 24px;                   /* Premium rounding */
  padding: 40px;                         /* Spacious padding */
  box-shadow: 0 8px 24px rgba(47, 33, 26, 0.08);  /* Soft shadow */
  border: 1px solid var(--border);
}

.filterInput {
  width: 100%;
  height: 56px;                          /* Generous height for touch targets */
  padding: 0 18px;
  border: 1px solid var(--border);
  border-radius: 16px;
  background: white;
  color: var(--text-primary);
  font-size: 15px;
  outline: none;
  transition: all 0.25s ease;
}

.filterInput:focus {
  border-color: var(--primary);          /* Brown focus */
  box-shadow: 0 0 0 4px rgba(106, 68, 48, 0.08);  /* Focus ring */
}
```

### Company Pills
```css
.companyPill {
  padding: 12px 24px;
  border: 2px solid var(--primary);      /* Brown outline */
  border-radius: 999px;                  /* Full pill shape */
  background: transparent;
  color: var(--primary);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  white-space: nowrap;
}

.companyPill:hover {
  background: var(--primary);            /* Solid brown on hover */
  color: white;
  transform: translateY(-2px);           /* Slight elevation */
  box-shadow: 0 8px 20px rgba(106, 68, 48, 0.16);
}
```

### Feature Cards
```css
.featureCard {
  background: white;
  border-radius: 24px;                   /* Premium rounding */
  padding: 40px 32px;
  text-align: center;
  border: 1px solid var(--border);
  box-shadow: 0 4px 16px rgba(47, 33, 26, 0.04);  /* Subtle shadow */
  transition: all 0.3s ease;
}

.featureCard:hover {
  transform: translateY(-8px);           /* Larger elevation on hover */
  box-shadow: 0 16px 40px rgba(47, 33, 26, 0.12);  /* Stronger shadow */
  border-color: var(--primary);          /* Brown border on hover */
}

.featureIcon {
  font-size: 48px;
  margin-bottom: 20px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.featureTitle {
  font-size: 18px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}
```

### Alumni Cards
```css
.alumniCard {
  background: white;
  border: 1px solid var(--border);
  border-radius: 24px;                   /* Premium rounding */
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  box-shadow: 0 4px 16px rgba(47, 33, 26, 0.04);
  transition: all 0.3s ease;
  height: 100%;
}

.alumniCard:hover {
  transform: translateY(-8px);           /* Elevation on hover */
  box-shadow: 0 16px 40px rgba(47, 33, 26, 0.12);
  border-color: var(--primary);
}

.profileImageElement {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid var(--border);
}

.primaryButton {
  width: 100%;
  height: 48px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.primaryButton:hover {
  background: var(--primary-hover);      /* Darker brown on hover */
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(106, 68, 48, 0.16);
}

.secondaryButton {
  width: 100%;
  height: 48px;
  background: white;
  color: var(--text-primary);
  border: 1px solid var(--border);
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.secondaryButton:hover {
  background: var(--surface);
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
}
```

### Grid Layouts
```css
.alumniGrid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
  margin-top: 32px;
}

/* Tablet: 2 columns */
@media (max-width: 1024px) {
  .alumniGrid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  }
}

/* Mobile: 1 column */
@media (max-width: 640px) {
  .alumniGrid {
    grid-template-columns: 1fr;
  }
}
```

### Empty State
```css
.emptyStateContainer {
  background: linear-gradient(135deg, rgba(106, 68, 48, 0.04) 0%, rgba(106, 68, 48, 0.02) 100%);
  border: 2px dashed var(--border);
  border-radius: 28px;
  padding: 80px 40px;
  text-align: center;
  margin: 60px 0;
}

.emptyStateIcon {
  font-size: 64px;
  margin-bottom: 24px;
  opacity: 0.5;
}

.emptyStateTitle {
  font-size: 28px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 12px;
}

.emptyStateButton {
  padding: 14px 32px;
  background: var(--primary);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}

.emptyStateButton:hover {
  background: var(--primary-hover);
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(106, 68, 48, 0.2);
}
```

### Error State
```css
.errorContainer {
  background: linear-gradient(135deg, rgba(217, 119, 96, 0.08) 0%, rgba(193, 111, 61, 0.04) 100%);
  border: 1px solid rgba(193, 111, 61, 0.2);
  border-radius: 24px;
  padding: 40px;
  text-align: center;
  margin: 40px 0;
}

.errorIcon {
  font-size: 48px;
  margin-bottom: 16px;
}

.errorTitle {
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}
```

---

## 📏 Sizing Reference

### Typography Sizes
| Element | Size | Weight | Line-height | Letter-spacing |
|---------|------|--------|-------------|-----------------|
| Hero Title | 64px (clamp) | 700 | 1.05 | -0.03em |
| Section Title | 24px | 700 | - | -0.02em |
| Card Title | 18px | 700 | - | - |
| Profile Name | 18px | 700 | 1.3 | - |
| Body Text | 15-16px | 400 | 1.6-1.7 | - |
| Labels | 14px | 600 | - | 0.5px |
| Profile Role | 14px | 400 | 1.5 | - |
| Small | 13px | 600 | - | - |

### Spacing Values
| Property | Size | Use |
|----------|------|-----|
| Hero padding | 80px (top/bottom) | Section separation |
| Section gap | 80px | Between sections |
| Card padding | 32px-40px | Internal spacing |
| Grid gap | 24px | Card spacing |
| Element gap | 12px-18px | Within components |
| Button group gap | 12px | Button spacing |

### Border Radius
| Component | Radius | Notes |
|-----------|--------|-------|
| Cards | 24px | Main cards |
| Buttons | 12-16px | CTA and secondary |
| Inputs | 16px | Form fields |
| Pills | 999px | Full circle shape |

### Shadows
| Level | CSS | Use |
|-------|-----|-----|
| Subtle | 0 4px 16px rgba(47,33,26,0.04) | Quiet emphasis |
| Medium | 0 8px 24px rgba(47,33,26,0.08) | Card default |
| Strong | 0 16px 40px rgba(47,33,26,0.12) | Hover states |
| Box Button | 0 12px 24px rgba(106,68,48,0.18) | Button shadow |

---

## 🎨 Color Palette

### Primary Colors
```css
--primary: #6a4430;              /* Brown */
--primary-hover: #553425;        /* Darker brown */
--accent: #c16f3d;               /* Accent brown */
```

### Backgrounds
```css
--background: #e9ddd0;           /* Warm beige (page bg) */
--surface: #f5eee5;              /* Off-white (cards) */
--surface-secondary: #dbc5ad;    /* Secondary surface */
```

### Text
```css
--text-primary: #2b1d16;         /* Dark brown (headings) */
--text-secondary: #6a5648;       /* Muted brown (body) */
```

### Borders
```css
--border: #d3c0ad;               /* Light brown */
```

---

## ⏱️ Timing & Animations

### Transitions
```css
transition: all 0.25s ease;      /* Standard */
transition: all 0.3s ease;       /* Feature cards */
```

### Transform Effects
| Action | Transform | Notes |
|--------|-----------|-------|
| Pill hover | translateY(-2px) | Slight lift |
| Button hover | translateY(-2px) | Slight lift |
| Card hover | translateY(-8px) | Larger lift |
| Feature hover | translateY(-8px) | Larger lift |

---

## 📱 Responsive Breakpoints

### Desktop
```css
/* 1200px+ */
.alumniGrid {
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));  /* 3 cols */
}
```

### Tablet
```css
@media (max-width: 1024px) {
  .alumniGrid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));  /* 2 cols */
  }
}
```

### Mobile
```css
@media (max-width: 640px) {
  .alumniGrid {
    grid-template-columns: 1fr;  /* 1 col */
  }
  
  .heroTitle {
    font-size: clamp(32px, 5vw, 48px);  /* Smaller on mobile */
  }
  
  .searchCard {
    padding: 24px;  /* Tighter padding */
  }
}
```

---

## ✨ CSS Features Used

- ✓ CSS Grid (responsive with auto-fill)
- ✓ Flexbox (flexible layouts)
- ✓ CSS Variables (theming)
- ✓ Clamp() function (responsive sizing)
- ✓ Gradients (empty/error states)
- ✓ Box-shadow (depth)
- ✓ Transitions (smooth animations)
- ✓ Media queries (responsive)
- ✓ Pseudo-classes (:hover, :focus)
- ✓ CSS modules (scoped styling)

All modern CSS with no dependencies beyond what's already in the project! 🚀
