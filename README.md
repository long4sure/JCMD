# JCMD — Portfolio Website

**Live site:** [jcmd.online](https://jcmd.online)

JCMD is an open-source passion project based in Calamba City, Laguna. A young, emerging developer initiative focused on continuous learning and open sharing — building free, offline-capable ERP systems, native desktop utilities, and custom static websites.

---

## What's in this repo

### `/demos` — Free ERP & POS Simulators
Simulated ERP dashboards that intercept database calls with browser local storage, running completely offline.

| Demo | Description |
|---|---|
| `demos/fastfood/` | **KarindERP** — POS and viand stock manager for karinderyas and food stalls |
| `demos/store/` | **StoreERP** — Retail inventory, purchase orders, and expense tracker for sari-sari stores |
| `demos/coffee/` | **BrewBooks** — Cafe POS with inventory, sales ledger, and expense log |
| `demos/brew-and-bean/` | **Brew & Bean** — Advanced cafe admin panel with relational order records, staff directory, and analytics |

### `/templates` — Static Website Templates
Handcrafted business website templates deployed via GitHub Pages or Netlify at zero cost.

| Template | Business Type |
|---|---|
| `templates/brew-co/` | Cortado Coffee — Cafe |
| `templates/shear-style/` | Long & Polished — Salon & Beauty |
| `templates/corner-bites/` | Misa's Corner — Neighborhood Retail |
| `templates/music-artist/` | Long Live Showcase — Music Artist |

### `/css` — Shared Styles
- `css/style.css` — Shared ERP dashboard styles (sidebar, mobile header, drawer, modals, POS layout)
- `css/portfolio.css` — Main portfolio page styles

### `/js` — Shared Scripts
- `js/supabase.js` — Supabase auth helpers used by the live ERP demos
- `js/portfolio.js` — Portfolio page animations and interactions

### Root files
- `index.html` — Main JCMD portfolio page
- `schema.sql` — Supabase database schema for the live ERP demos

---

## Tech stack

- Pure HTML, Vanilla CSS, and JavaScript — no frameworks, no build tools
- [Tabler Icons](https://tabler.io/icons) webfont for all UI icons
- [Supabase](https://supabase.com) for auth and database on the live ERP demos
- Browser `localStorage` mock client for the Brew & Bean offline simulator
- GitHub Pages / Netlify for free static hosting

---

## Running locally

No build step required. Open any HTML file directly in a browser, or serve the root with any static file server:

```bash
npx serve .
```

The Brew & Bean demo runs fully offline via localStorage. The other ERP demos (KarindERP, StoreERP, BrewBooks) require a Supabase project with the tables defined in `schema.sql`.

---

## Mobile responsiveness

All ERP dashboards include a responsive sliding sidebar drawer on screens ≤ 768px, triggered by a sticky mobile header with a hamburger toggle. Brew & Bean includes a fixed bottom navigation bar on mobile for tab switching.

---

## Contact

**Jerome Misa** · Calamba City, Laguna
- Email: jeromemisa2020@gmail.com
- Facebook: [facebook.com/jeromemisa2020](https://www.facebook.com/jeromemisa2020/)
- Phone: 0961-497-5156
