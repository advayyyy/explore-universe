# 🌌 Explore Universe

An immersive, scroll-driven **flight through the universe** — right in your
browser. You don't browse this site, you fly it: leave Earth's orbit, drift
past the Moon and the gas giants, fly through a nebula, get pulled toward a
black hole, and end up at the edge of the observable universe.

Built with **plain HTML, CSS and JavaScript**. No frameworks, no build step,
no dependencies, no tracking.

---

## ✨ What's inside

| Page | What you can do |
|------|-----------------|
| **Journey** (`index.html`) | The main event. Press **Begin the journey**, then **scroll to travel**. A live HUD tracks your velocity, distance from Earth and current location. The rail on the right jumps you between the ten waypoints. |
| **Solar System** (`solar-system.html`) | A live canvas orrery. Planets orbit at their true relative speeds. Hover to identify, click for a full profile. Pause, change speed, toggle orbits and labels. |
| **Deep Space** (`deep-space.html`) | A filterable, searchable gallery of 15 objects — galaxies, nebulae, star clusters, black holes and exoplanets. |
| **Cosmos** (`cosmos.html`) | A cosmic-scale slider from a single planet to the observable universe, plus the 13.8-billion-year timeline. |
| **About** (`about.html`) | How it works, and the sources behind the facts. |

Everything is responsive, keyboard-friendly where it matters, and respects
`prefers-reduced-motion`.

---

## 🚀 The flight, stop by stop

1. **Leaving Earth** — Low Earth Orbit
2. **Past the Moon** — Cislunar space
3. **A Million Tumbling Rocks** — the asteroid belt
4. **The Gas Giants** — Jupiter and Saturn
5. **Leaving the Solar System** — the Kuiper Belt
6. **A Stellar Nursery** — the Orion Nebula
7. **A Dying Giant** — a red supergiant
8. **Do Not Get Too Close** — Sagittarius A*
9. **The Milky Way** — the whole galaxy
10. **The Edge of Everything** — the observable universe

---

## 🧠 How the flight works

- Scroll position maps to a **camera depth** along a 14,000-unit track. The
  camera eases toward it, so motion feels like a ship settling onto a heading.
- **Stars** live in a wrapping 3D field and streak radially — long trails when
  you scroll fast, dots when you drift. Streak length is capped so a resting
  scene stays calm.
- Each **waypoint** has an "encounter" progress: the moment it passes the
  camera. Its depth is derived from that, so the scene stays in sync with the
  narration, and its opacity is driven by progress (fade in before, out after).
- The **nebula** is a cloud of depth-sorted blobs, knots, sparkle stars and
  pre-rendered wispy filaments, so you fly *through* it rather than past a
  flat picture.
- **Galaxies, black holes and the cosmic web** are generated once into
  offscreen sprites, then drawn scaled. They are placed far enough ahead that
  they loom rather than pass.

---

## 📁 Project structure

```
explore-universe/
├── index.html            # The immersive journey
├── solar-system.html     # Interactive orrery
├── deep-space.html       # Deep-space gallery
├── cosmos.html           # Cosmic scale + timeline
├── about.html            # About + sources
├── 404.html              # Not-found page
├── css/
│   ├── style.css         # Design system + self-hosted fonts
│   └── journey.css       # HUD, captions, launch screen, rail
├── js/
│   ├── starfield.js      # Ambient starfield for the inner pages
│   ├── main.js           # Nav, scroll reveal, counters, card glow
│   ├── journey.js        # The flight engine
│   ├── data.js           # Planet + deep-space object data
│   ├── solar-system.js   # The orrery engine
│   ├── deep-space.js     # Gallery rendering + filtering
│   └── cosmos.js         # Scale explorer + timeline
└── assets/
    └── favicon.svg
```

Fonts (Space Grotesk + Inter) are **self-hosted via `@font-face`** — no
external stylesheet, no third-party requests, and the site works offline.

---

## 🛠️ Customising

- **Change the journey** — edit the `STAGES` and `SPEC` arrays in
  `js/journey.js`. `STAGES` is the narration; `SPEC` places the objects
  (`enc` is the progress at which each one passes the camera).
- **Add a planet** — append to `PLANETS` in `js/data.js`.
- **Add a deep-space object** — append to `DEEP_SPACE` in the same file.
- **Change the theme** — every colour, radius and font is a CSS variable at
  the top of `css/style.css`.

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
