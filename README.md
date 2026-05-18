# BizDemo — Plain HTML/CSS/JS ERP Demos

Three fully working ERP demos for small Philippine businesses.
No npm, no Node.js, no build step. Just open in a browser.

---

## Project structure

```
bizdemo/
├── index.html          ← Homepage / demo selector (no login needed)
├── schema.sql          ← Run this once in Supabase
├── css/
│   └── style.css       ← Shared styles for all 3 demos
├── js/
│   └── supabase.js     ← Shared Supabase client + auth helpers
├── coffee/
│   ├── login.html      ← BrewBooks login/register
│   └── dashboard.html  ← Coffee shop full ERP app
├── fastfood/
│   ├── login.html      ← KarindERP login/register
│   └── dashboard.html  ← Karinderya/fast food full ERP app
└── store/
    ├── login.html      ← StoreERP login/register
    └── dashboard.html  ← Retail/sari-sari store full ERP app
```

---

## Setup (one-time, ~10 minutes)

### Step 1 — Create Supabase project (free)
1. Go to https://supabase.com → sign up
2. Click **New project** → name it `bizdemo` → choose a password
3. Wait ~2 minutes to provision

### Step 2 — Run the database schema
1. Go to **SQL Editor** → **New Query**
2. Paste the entire contents of `schema.sql`
3. Click **Run** — all tables will be created

### Step 3 — Get your credentials
Go to **Settings → API** and copy:
- **Project URL** → looks like `https://xxxx.supabase.co`
- **anon public** key → the shorter one (NOT service_role)

### Step 4 — Add credentials to the project
Open `js/supabase.js` and replace:
```js
export const SUPABASE_URL  = 'YOUR_SUPABASE_URL'
export const SUPABASE_ANON = 'YOUR_SUPABASE_ANON_KEY'
```

### Step 5 — Run locally
Open the project folder in VS Code → right-click `index.html` → **Open with Live Server**

Or open `index.html` directly in any browser (note: ES modules
require a server — Live Server or any local HTTP server).

---

## Deploy to GitHub Pages (free hosting)

1. Create a new repo on https://github.com
2. Upload all files
3. Go to repo **Settings → Pages → Source → main branch → / (root)**
4. Your site will be live at `https://yourusername.github.io/bizdemo`

That's it. Completely free.

---

## Customization guide

### Change the brand name / logo
Each demo's `dashboard.html` has a sidebar brand section:
```html
<div class="sidebar-brand">
  <div style="font-size:22px">☕</div>   ← change emoji
  <div class="brand-name">BrewBooks</div> ← change name
  <div class="brand-sub">Coffee Shop ERP</div>
</div>
```

### Change colors
Each `dashboard.html` has a `<style>` block at the top:
```css
:root {
  --accent: #92400E;   ← main color (sidebar, buttons)
  --accent2: #B45309;  ← secondary color
}
```
Change these hex values to your brand color.

### Add a new module
1. Add a nav button pointing to a new page id
2. Add a new `<div class="page" id="page-newmodule">` section
3. Create a new Supabase table in schema.sql
4. Write fetch + render functions following the same pattern

---

## Monthly cost

| Service      | Cost  |
|--------------|-------|
| Supabase     | ₱0    |
| GitHub Pages | ₱0    |
| Domain (.ph) | ~₱500/yr (optional) |
| **Total**    | **₱0/mo** |

---

## Tech used

- Plain HTML5, CSS3, vanilla JavaScript
- Supabase JS v2 (via CDN — no npm needed)
- Tabler Icons (via CDN)
- Google Fonts — Inter (via CDN)
- Supabase Auth (built-in email/password)
- Supabase PostgreSQL (free tier)
