/* ============================================================
   Explore Universe — data
   Planet + deep-space object facts (figures are standard,
   widely published NASA/ESA values, rounded for readability).
   ============================================================ */
(function (global) {
  "use strict";

  /* ---------------- Solar system ----------------
     radius / orbit are display units (not to scale) so every
     body stays visible on one screen. period drives orbit speed.
     colour = base body colour; glow = halo tint.               */
  global.PLANETS = [
    {
      id: "sun", name: "The Sun", type: "G-type Main-Sequence Star",
      radius: 46, orbit: 0, period: 0,
      colour: "#ffd257", glow: "#ff9d2f", ring: false,
      desc: "The star at the heart of our solar system. It holds 99.86% of all the mass in the system and its gravity keeps every planet in orbit.",
      facts: [
        ["Diameter", "1,392,700 km"],
        ["Mass", "333,000 × Earth"],
        ["Surface temp", "5,505 °C"],
        ["Core temp", "15 million °C"],
        ["Age", "≈ 4.6 billion years"]
      ],
      fun: "Around 1.3 million Earths could fit inside the Sun — yet it is only an average-sized star."
    },
    {
      id: "mercury", name: "Mercury", type: "Terrestrial Planet",
      radius: 7, orbit: 78, period: 4.15,
      colour: "#b7b0a6", glow: "#8a8378", ring: false,
      desc: "The smallest planet and the closest to the Sun. With almost no atmosphere, its surface swings between scorching days and freezing nights.",
      facts: [
        ["Diameter", "4,879 km"],
        ["Distance from Sun", "57.9 million km"],
        ["Day length", "58.6 Earth days"],
        ["Year length", "88 Earth days"],
        ["Moons", "0"],
        ["Temp range", "−173 °C to 427 °C"]
      ],
      fun: "A single day on Mercury lasts about two of its years — it rotates three times for every two orbits of the Sun."
    },
    {
      id: "venus", name: "Venus", type: "Terrestrial Planet",
      radius: 11, orbit: 108, period: 1.62,
      colour: "#e8c98a", glow: "#d9a441", ring: false,
      desc: "Earth's twin in size, Venus is wrapped in thick clouds of carbon dioxide and sulphuric acid that trap heat in a runaway greenhouse effect.",
      facts: [
        ["Diameter", "12,104 km"],
        ["Distance from Sun", "108.2 million km"],
        ["Day length", "243 Earth days"],
        ["Year length", "225 Earth days"],
        ["Moons", "0"],
        ["Average temp", "465 °C"]
      ],
      fun: "Venus spins backwards, and its day is longer than its year. It is the hottest planet — even hotter than Mercury."
    },
    {
      id: "earth", name: "Earth", type: "Terrestrial Planet",
      radius: 12, orbit: 150, period: 1.0,
      colour: "#3b82f6", glow: "#22d3ee", ring: false,
      desc: "Our home — the only world known to support life. Liquid water covers 71% of its surface and a protective magnetic field shields it from solar wind.",
      facts: [
        ["Diameter", "12,742 km"],
        ["Distance from Sun", "149.6 million km"],
        ["Day length", "24 hours"],
        ["Year length", "365.25 days"],
        ["Moons", "1 (the Moon)"],
        ["Average temp", "15 °C"]
      ],
      fun: "Earth is not a perfect sphere — it bulges at the equator and is the densest planet in the solar system."
    },
    {
      id: "mars", name: "Mars", type: "Terrestrial Planet",
      radius: 9, orbit: 190, period: 0.53,
      colour: "#e05a3c", glow: "#ff7a45", ring: false,
      desc: "The Red Planet, rusted by iron oxide dust. It hosts the tallest volcano and the deepest canyon in the solar system, and shows strong signs of ancient water.",
      facts: [
        ["Diameter", "6,779 km"],
        ["Distance from Sun", "227.9 million km"],
        ["Day length", "24.6 hours"],
        ["Year length", "687 Earth days"],
        ["Moons", "2 (Phobos, Deimos)"],
        ["Average temp", "−63 °C"]
      ],
      fun: "Olympus Mons on Mars is about 22 km high — roughly 2.5 times the height of Mount Everest."
    },
    {
      id: "jupiter", name: "Jupiter", type: "Gas Giant",
      radius: 30, orbit: 258, period: 0.084,
      colour: "#d9a878", glow: "#c98a4a", ring: false,
      desc: "The largest planet — a colossal ball of hydrogen and helium. Its Great Red Spot is a storm wider than Earth that has raged for centuries.",
      facts: [
        ["Diameter", "139,820 km"],
        ["Distance from Sun", "778.5 million km"],
        ["Day length", "9.9 hours"],
        ["Year length", "11.9 Earth years"],
        ["Moons", "95 confirmed"],
        ["Average temp", "−110 °C"]
      ],
      fun: "Jupiter is so massive that all the other planets combined could fit inside it — twice over."
    },
    {
      id: "saturn", name: "Saturn", type: "Gas Giant",
      radius: 26, orbit: 330, period: 0.034,
      colour: "#e6d3a3", glow: "#d9b45f", ring: true,
      desc: "Famous for its dazzling ring system of ice and rock. Saturn is the least dense planet — it would float in a big enough bathtub of water.",
      facts: [
        ["Diameter", "116,460 km"],
        ["Distance from Sun", "1.43 billion km"],
        ["Day length", "10.7 hours"],
        ["Year length", "29.4 Earth years"],
        ["Moons", "146 confirmed"],
        ["Average temp", "−140 °C"]
      ],
      fun: "Saturn's rings span up to 282,000 km across, yet in places they are only about 10 metres thick."
    },
    {
      id: "uranus", name: "Uranus", type: "Ice Giant",
      radius: 18, orbit: 396, period: 0.012,
      colour: "#9fe3e6", glow: "#5fd3d9", ring: true,
      desc: "An ice giant tipped on its side, likely by an ancient collision. It rolls around the Sun like a barrel, giving it extreme seasons.",
      facts: [
        ["Diameter", "50,724 km"],
        ["Distance from Sun", "2.87 billion km"],
        ["Day length", "17.2 hours"],
        ["Year length", "84 Earth years"],
        ["Moons", "28 confirmed"],
        ["Average temp", "−195 °C"]
      ],
      fun: "Uranus rotates at a 98° tilt — its poles take turns facing the Sun for 42 years at a time."
    },
    {
      id: "neptune", name: "Neptune", type: "Ice Giant",
      radius: 17, orbit: 456, period: 0.006,
      colour: "#3b6fd4", glow: "#2b57c9", ring: false,
      desc: "The most distant planet, a deep-blue ice giant with the fastest winds in the solar system — gusting past 2,000 km/h.",
      facts: [
        ["Diameter", "49,244 km"],
        ["Distance from Sun", "4.5 billion km"],
        ["Day length", "16.1 hours"],
        ["Year length", "165 Earth years"],
        ["Moons", "16 confirmed"],
        ["Average temp", "−200 °C"]
      ],
      fun: "Neptune was found with mathematics before it was ever seen — astronomers predicted it from wobbles in Uranus's orbit."
    },
    {
      id: "pluto", name: "Pluto", type: "Dwarf Planet",
      radius: 5, orbit: 510, period: 0.004,
      colour: "#cbb89a", glow: "#a98f68", ring: false,
      desc: "Once the ninth planet, now classed as a dwarf planet in the Kuiper Belt. New Horizons revealed a surprisingly active world of nitrogen-ice plains.",
      facts: [
        ["Diameter", "2,377 km"],
        ["Distance from Sun", "5.9 billion km"],
        ["Day length", "153 hours"],
        ["Year length", "248 Earth years"],
        ["Moons", "5"],
        ["Average temp", "−225 °C"]
      ],
      fun: "Pluto is smaller than Earth's Moon, and its largest moon, Charon, is so big the two are sometimes called a double dwarf planet."
    }
  ];

  /* ---------------- Deep space objects ---------------- */
  global.DEEP_SPACE = [
    { name: "Andromeda Galaxy", type: "Galaxy", dist: "2.5 million light-years", art: "galaxy-1",
      desc: "The nearest large galaxy to our own, and the most distant object visible to the naked eye. It is on a slow collision course with the Milky Way." },
    { name: "Whirlpool Galaxy", type: "Galaxy", dist: "31 million light-years", art: "galaxy-2",
      desc: "A grand-design spiral galaxy caught mid-interaction with a smaller companion, its arms sculpted by the gravitational tug-of-war." },
    { name: "Sombrero Galaxy", type: "Galaxy", dist: "31 million light-years", art: "galaxy-3",
      desc: "An edge-on galaxy with a brilliant bulge and a dark dust lane, giving it the unmistakable shape of a wide-brimmed hat." },
    { name: "Orion Nebula", type: "Nebula", dist: "1,344 light-years", art: "nebula-1",
      desc: "The closest massive star-forming region to Earth — a glowing stellar nursery where thousands of new suns are being born." },
    { name: "Pillars of Creation", type: "Nebula", dist: "6,500 light-years", art: "nebula-2",
      desc: "Towering columns of gas and dust in the Eagle Nebula, sculpted by the fierce radiation of young, hot stars around them." },
    { name: "Carina Nebula", type: "Nebula", dist: "8,500 light-years", art: "nebula-3",
      desc: "A vast, chaotic complex of bright stars, dark dust and glowing gas — one of the brightest nebulae in the night sky." },
    { name: "Crab Nebula", type: "Supernova Remnant", dist: "6,500 light-years", art: "nebula-2",
      desc: "The wreckage of a star that exploded in 1054 AD, recorded by astronomers around the world as a daylight-bright guest star." },
    { name: "Pleiades", type: "Star Cluster", dist: "444 light-years", art: "cluster-1",
      desc: "The Seven Sisters — a young open cluster of hot blue stars wrapped in delicate reflection nebulosity, familiar across many cultures." },
    { name: "Omega Centauri", type: "Star Cluster", dist: "17,090 light-years", art: "cluster-1",
      desc: "The largest globular cluster orbiting the Milky Way, packing several million ancient stars into a tight, glittering ball." },
    { name: "Sagittarius A*", type: "Black Hole", dist: "26,000 light-years", art: "blackhole",
      desc: "The supermassive black hole at the centre of our galaxy, about four million times the mass of the Sun." },
    { name: "M87*", type: "Black Hole", dist: "53 million light-years", art: "blackhole",
      desc: "The black hole whose glowing silhouette became the first ever photographed, by the Event Horizon Telescope in 2019." },
    { name: "Proxima Centauri b", type: "Exoplanet", dist: "4.24 light-years", art: "exo-1",
      desc: "The closest known exoplanet, orbiting a red dwarf in the habitable zone. It is our nearest potential stepping-stone beyond the Sun." },
    { name: "TRAPPIST-1e", type: "Exoplanet", dist: "40 light-years", art: "exo-1",
      desc: "One of seven Earth-sized worlds circling a cool red star. Several sit in the habitable zone, making the system a prime target in the search for life." },
    { name: "Kepler-452b", type: "Exoplanet", dist: "1,400 light-years", art: "exo-2",
      desc: "A 'super-Earth' orbiting a Sun-like star at roughly Earth's distance — dubbed a cousin of our own planet." },
    { name: "Kepler-16b", type: "Exoplanet", dist: "245 light-years", art: "exo-2",
      desc: "A real Tatooine — a gas planet that orbits not one star but a pair, circling two suns in a wide binary system." }
  ];
})(window);
