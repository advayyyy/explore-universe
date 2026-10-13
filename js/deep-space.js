/* ============================================================
   Explore Universe — deep space gallery
   Renders the object cards and wires up filtering + search.
   ============================================================ */
(function () {
  "use strict";

  var grid, chipsWrap, search, all = [], activeType = "All", query = "";

  function typeClass(t) {
    return t.toLowerCase().replace(/[^a-z]+/g, "-");
  }

  function cardHTML(o) {
    return '' +
      '<article class="dso reveal" data-type="' + o.type + '" data-name="' + o.name.toLowerCase() + '">' +
        '<div class="thumb">' +
          '<div class="art ' + o.art + '"></div>' +
          '<span class="badge">' + o.type + '</span>' +
        '</div>' +
        '<div class="body">' +
          '<h3>' + o.name + '</h3>' +
          '<div class="dist">' + o.dist + '</div>' +
          '<p>' + o.desc + '</p>' +
        '</div>' +
      '</article>';
  }

  function render() {
    var list = all.filter(function (o) {
      var okType = activeType === "All" || o.type === activeType;
      var okQ = !query || o.name.toLowerCase().indexOf(query) > -1 || o.desc.toLowerCase().indexOf(query) > -1;
      return okType && okQ;
    });
    if (!list.length) {
      grid.innerHTML = '<p style="grid-column:1/-1;color:var(--muted);text-align:center;padding:40px 0">No objects match that search. Try another term.</p>';
      return;
    }
    grid.innerHTML = list.map(cardHTML).join("");
    // reveal the freshly rendered cards
    if (window.EUReveal) {
      window.EUReveal();
    } else {
      grid.querySelectorAll(".dso").forEach(function (el, i) {
        setTimeout(function () { el.classList.add("in"); }, 40 * i);
      });
    }
  }

  function init() {
    grid = document.getElementById("dsoGrid");
    chipsWrap = document.getElementById("dsoChips");
    search = document.getElementById("dsoSearch");
    if (!grid || !window.DEEP_SPACE) return;

    all = window.DEEP_SPACE.slice();

    // build type chips
    var types = ["All"];
    all.forEach(function (o) { if (types.indexOf(o.type) === -1) types.push(o.type); });
    chipsWrap.innerHTML = types.map(function (t) {
      return '<button class="chip' + (t === "All" ? " active" : "") + '" data-type="' + t + '">' + t + '</button>';
    }).join("");

    chipsWrap.addEventListener("click", function (e) {
      var b = e.target.closest(".chip");
      if (!b) return;
      activeType = b.getAttribute("data-type");
      chipsWrap.querySelectorAll(".chip").forEach(function (c) { c.classList.toggle("active", c === b); });
      render();
    });

    if (search) {
      search.addEventListener("input", function () {
        query = search.value.trim().toLowerCase();
        render();
      });
    }

    render();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
