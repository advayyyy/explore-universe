# 🌌 Explore Universe

An interactive, open-source journey through space — right in your browser.
Watch the planets orbit, drift through nebulae, stare into black holes, and
measure yourself against the largest things that exist.

Built with **plain HTML, CSS and JavaScript**. No frameworks, no build step,
no dependencies, no tracking.

---

## ✨ What's inside

| Page | What you can do |
|------|-----------------|
| **Home** (`index.html`) | Animated starfield hero, live cosmic stats, and a tour of the site. |
| **Solar System** (`solar-system.html`) | A live canvas orrery. Planets orbit at their true relative speeds. Hover to identify, click for a full profile. Pause, change speed, toggle orbits and labels. |
| **Deep Space** (`deep-space.html`) | A filterable, searchable gallery of 15 objects — galaxies, nebulae, star clusters, black holes and exoplanets. |
| **Cosmos** (`cosmos.html`) | A cosmic-scale slider that steps from a single planet to the observable universe, plus the 13.8-billion-year universe timeline. |
| **About** (`about.html`) | How it works, and the sources behind the facts. |

Everything is responsive, keyboard-friendly where it matters, and respects
`prefers-reduced-motion`.

---

## 🚀 Run it locally

No installation needed. Either:

**1. Open it directly** — double-click `index.html`.

**2. Serve it (recommended)** — from the project folder run:

```bash
# Python 3
python -m http.server 8000

# or Node
npx serve .
```

Then visit <http://localhost:8000>.

---

## 📁 Project structure

```
explore-universe/
├── index.html            # Home
├── solar-system.html     # Interactive orrery
├── deep-space.html       # Deep-space gallery
├── cosmos.html           # Cosmic scale + timeline
├── about.html            # About + sources
├── 404.html              # Not-found page
├── css/
│   └── style.css         # The whole design system
├── js/
│   ├── starfield.js      # Animated starfield engine (Canvas 2D)
│   ├── main.js           # Nav, scroll reveal, counters, card glow
│   ├── data.js           # Planet + deep-space object data
│   ├── solar-system.js   # The orrery engine
│   ├── deep-space.js     # Gallery rendering + filtering
│   └── cosmos.js         # Scale explorer + timeline
└── assets/
    └── favicon.svg
```

---

## 🛠️ Customising

- **Add a planet** — append an object to `PLANETS` in `js/data.js`. Give it a
  `colour`, `orbit`, `radius` and `period`; the orrery picks it up automatically.
- **Add a deep-space object** — append to `DEEP_SPACE` in the same file and
  reuse one of the `.art.*` background classes (or add your own in `style.css`).
- **Change the theme** — every colour, radius and font lives as a CSS variable
  at the top of `css/style.css`.

---

## 🌍 Deploying

It's a static site, so anywhere works:

- **Cloudflare Pages** — connect the repo, leave the build command empty,
  set the output directory to `/`.
- **GitHub Pages** — Settings → Pages → deploy from the `main` branch root.
- **Netlify / Vercel** — drag the folder in, or point at the repo.

---

## 📚 Sources

Figures are rounded, standard values from public science references:
NASA Solar System Exploration, NASA/ESA (Hubble & James Webb), the NASA
Exoplanet Archive, and the Event Horizon Telescope. For anything precise,
go to those primary sources.

---

## 📄 License

Released under the MIT License — fork it, remix it, ship it.

Made for curious minds. 🔭
