/* ============================================================
   Explore Universe — cosmic scale explorer
   A slider that steps from a single planet up to the observable
   universe. Visual sizes are logarithmic (clearly labelled),
   real sizes are the true measured values.
   ============================================================ */
(function () {
  "use strict";

  var SCALE = [
    { name: "Earth", real: "12,742 km across", disp: 12, colour: "#3b82f6",
      note: "Our home world — the yardstick we measure everything else against." },
    { name: "Jupiter", real: "139,820 km across", disp: 24, colour: "#d9a878",
      note: "The largest planet — about 11 Earths wide and 1,321 times its volume." },
    { name: "The Sun", real: "1,392,700 km across", disp: 46, colour: "#ffd257",
      note: "Our star — roughly 109 Earths could line up across its face." },
    { name: "Sirius A", real: "≈ 2.4 million km across", disp: 60, colour: "#cfe0ff",
      note: "The brightest star in Earth's night sky, about 1.7 times the Sun's size and 25 times as luminous." },
    { name: "Arcturus", real: "≈ 35 million km across", disp: 88, colour: "#ffb27a",
      note: "A red giant about 25 times the Sun's diameter, racing through the galaxy." },
    { name: "Betelgeuse", real: "≈ 1.0 billion km across", disp: 132, colour: "#ff6b5a",
      note: "A red supergiant so vast it would swallow the orbits of Mercury, Venus, Earth and Mars." },
    { name: "UY Scuti", real: "≈ 2.4 billion km across", disp: 168, colour: "#ff3b6b",
      note: "One of the largest known stars — a hypergiant around 1,700 times the Sun's radius." },
    { name: "Milky Way", real: "≈ 100,000 light-years across", disp: 214, colour: "#b9a4ff",
      note: "Our home galaxy — a spiral of hundreds of billions of stars, with the Sun about two-thirds of the way out." },
    { name: "Observable Universe", real: "≈ 93 billion light-years across", disp: 258, colour: "#22d3ee",
      note: "Everything we can ever see — a web of roughly two trillion galaxies, still expanding." }
  ];

  function init() {
    var slider = document.getElementById("scaleSlider");
    var orb = document.getElementById("scaleOrb");
    var nameEl = document.getElementById("scaleName");
    var sizeEl = document.getElementById("scaleSize");
    var noteEl = document.getElementById("scaleNote");
    var fill = document.getElementById("scaleFill");
    var knob = document.getElementById("scaleKnob");
    if (!slider || !orb) return;

    function update(i) {
      var o = SCALE[i];
      orb.style.width = o.disp + "px";
      orb.style.height = o.disp + "px";
      orb.style.background = "radial-gradient(circle at 34% 30%, #ffffff 0%, " + o.colour + " 42%, rgba(3,4,12,0.9) 100%)";
      orb.style.boxShadow = "0 0 " + (o.disp * 0.9) + "px -4px " + o.colour + ", inset -8px -8px 22px rgba(0,0,0,0.6)";
      nameEl.textContent = o.name;
      sizeEl.textContent = o.real;
      noteEl.textContent = o.note;
      var pct = (i / (SCALE.length - 1)) * 100;
      if (fill) fill.style.width = pct + "%";
      if (knob) knob.style.left = pct + "%";
    }

    slider.min = 0;
    slider.max = SCALE.length - 1;
    slider.value = 0;
    slider.addEventListener("input", function () { update(parseInt(slider.value, 10)); });
    update(0);
  }

  /* ---------- Universe timeline ---------- */
  var TIMELINE = [
    { when: "13.8 billion years ago", title: "The Big Bang", text: "Space, time, matter and energy burst into being from an unimaginably hot, dense point. The universe has been expanding ever since." },
    { when: "13.6 billion years ago", title: "The first stars ignite", text: "Gravity pulls hydrogen and helium together until the first stars switch on, flooding a dark universe with light." },
    { when: "4.6 billion years ago", title: "Birth of the Sun", text: "A cloud of gas and dust collapses to form our Sun, and the leftover material settles into a spinning disc of planets." },
    { when: "4.5 billion years ago", title: "The Moon forms", text: "A Mars-sized body smashes into the young Earth. The debris flung into orbit gathers into our Moon." },
    { when: "3.8 billion years ago", title: "First life on Earth", text: "Simple single-celled organisms appear in the oceans — the beginning of a 3.8-billion-year chain that leads to you." },
    { when: "541 million years ago", title: "Cambrian explosion", text: "In a geological blink, animal life diversifies explosively. Almost every major animal group alive today first appears." },
    { when: "66 million years ago", title: "Dinosaurs go extinct", text: "A city-sized asteroid strikes near Chicxulub, ending the age of dinosaurs and clearing the way for mammals." },
    { when: "300,000 years ago", title: "Modern humans appear", text: "Homo sapiens emerges in Africa — a species that will eventually look up and ask what the universe is." },
    { when: "1957", title: "The Space Age begins", text: "Sputnik 1 becomes the first artificial satellite, opening the door to exploring beyond Earth." },
    { when: "1969", title: "Humans walk on the Moon", text: "Apollo 11 lands on the Sea of Tranquility — the first time anyone has stood on another world." },
    { when: "Today", title: "You are here", text: "On a small blue planet, orbiting an ordinary star, in one of trillions of galaxies — exploring the universe." }
  ];

  function initTimeline() {
    var wrap = document.getElementById("timeline");
    if (!wrap) return;
    wrap.innerHTML = TIMELINE.map(function (t) {
      return '<div class="tl-item reveal"><div class="when">' + t.when + '</div><h3>' + t.title + '</h3><p>' + t.text + '</p></div>';
    }).join("");
    if (window.EUReveal) window.EUReveal();
    else wrap.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  function boot() { init(); initTimeline(); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
