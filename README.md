# JCMD — Custom Software, Free ERP & High-Speed Web Applications

Welcome to **JCMD**, a modern, high-speed, and beautifully designed web application hub offering premium custom software and 100% free business management (ERP) tools tailored for small businesses. 

This repository houses the entire JCMD portfolio site, four fully featured simulated ERP business demos, and four premium client landing page templates—all built using a plain, lightweight, and modern **Vanilla HTML/CSS/JS** stack. There are no heavy build systems, npm installs, or complicated configurations. Just clean, highly maintainable, and blistering-fast web code!

🌐 **Live Website:** [misa.jcmd.online](https://misa.jcmd.online)

---

## 📂 Project Structure

The project has been meticulously organized into distinct directories for assets, templates, and active demo environments to maximize scalability and keep the root clean:

```
JCMD/
├── index.html              ← JCMD main portfolio homepage
├── CNAME                   ← Domain configurations (e.g. misa.jcmd.online)
├── schema.sql              ← Supabase DB schema for live ERP upgrades
├── css/
│   ├── portfolio.css       ← JCMD main landing page styles
│   └── style.css           ← Unified styling shared by simulated ERPs
├── js/
│   ├── portfolio.js        ← Interactive features & micro-animations
│   └── supabase.js         ← Shared local Supabase client mock & auth wrappers
├── demos/
│   ├── brew-and-bean/      ← ☕ Brew & Bean: Coffee Shop Manager App (Fully Localized & Tabler Icons)
│   │   ├── index.html
│   │   ├── style.css
│   │   └── app.js
│   ├── coffee/             ← ☕ BrewBooks: Simulated Cafe ERP
│   ├── fastfood/           ← 🍔 KarindERP: Simulated Food/Karinderya ERP
│   └── store/              ← 🏪 StoreERP: Simulated Retail/Sari-Sari Store ERP
└── templates/              ← Premium Client Web Layouts
    ├── brew-co/            ← Cortado Coffee landing page
    ├── corner-bites/       ← Misa's Corner snack bar site
    ├── music-artist/       ← LONG Music official artist site
    └── shear-style/        ← Long & Polished beauty salon site
```

---

## 🚀 Getting Started

### 1. Running Locally
Because this project is written in pure vanilla web technologies, you can run the entire portfolio instantly:
*   **Method A (Direct):** Double-click `index.html` at the root folder to open the site directly in any web browser.
*   **Method B (Live Server - Recommended):** Open the project directory inside VS Code, right-click `index.html`, and select **Open with Live Server** to serve it locally on `http://127.0.0.1:5500`.

### 2. Database Mocks & Supabase Upgrades
All ERP demos (including **Brew & Bean**) are powered by a custom client-side database simulator inside [js/supabase.js](file:///c:/Users/Lonks/Desktop/JCMD-TO-EDIT/js/supabase.js). It mock-saves authentication, orders, menu items, and sales histories directly in the browser's `localStorage` sandbox, allowing the entire suite to run 100% offline out-of-the-box!

If you want to upgrade to a **live PostgreSQL production database**:
1. Sign up for a free project at [Supabase](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and run the entire contents of [schema.sql](file:///c:/Users/Lonks/Desktop/JCMD-TO-EDIT/schema.sql).
3. Copy your project's **API URL** and **Anon Key** from **Settings → API**.
4. Replace the mock environment details inside [js/supabase.js](/js/supabase.js) with your live keys to sync all data instantly!

---

## ✨ Features & Technologies

*   **Vibrant, Fluid Aesthetics:** Curved layouts, glassmorphism headers, dark-mode themes, and subtle CSS transition micro-animations.
*   **Tabler Icon Integration:** Beautiful, high-resolution vector icon fonts (`@tabler/icons-webfont`) are utilized across all applications instead of outdated browser emojis.
*   **Local SEO Schema:** Implemented local JSON-LD professional business schema tags to maximize search engine discoverability and map authority in Laguna/Calamba.
*   **MISA P2P Web Sharing integration:** Links and highlights JCMD's premium high-speed web sharing utility for fast files transfer on local networks.

---

## 💸 Cost Breakdown (100% Free Hosting)

JCMD is designed with an extremely humble beginning, prioritizing zero operating cost for small businesses:

| Service | Technology | Monthly Cost |
|---------|------------|--------------|
| **Frontend Hosting** | GitHub Pages | ₱0.00 |
| **Backend Database** | Supabase Free Tier | ₱0.00 |
| **Design Library** | Tabler Icons / Google Fonts | ₱0.00 |
| **Domain Routing** | CNAME / Custom Subdomains | ₱0.00 |
| **Operating Cost** | **Total Monthly Cost** | **₱0.00 / month** |

---

## 📄 License & Brand
Developed and maintained under the **JCMD** brand. All business solutions, layouts, and scripts are provided as free, open-source resources to empower local micro-entrepreneurs!
