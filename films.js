/* Revframe — "Watch the films" player for each niche.
   Videos are hosted on Hostinger at media.revframestudio.com/films/<niche>/<file>.
   To add a film: upload it to that folder, then add one line to the list below. */
(function () {
  const BASE = "https://media.revframestudio.com/films/";
  const FILMS = {
    automotive: [
      ["lynkco-03.mp4", "Lynk & Co 03 — Egypt Reveal"],
      ["baic-x55e.mp4", "BAIC X55E"],
    ],
    concerts: [
      ["cairokee-live.mp4", "Cairokee — Live"],
      ["tul8te-live.mp4", "Tul8te — Live"],
      ["concerts-mix.mp4", "Concerts Mix"],
      ["amer-marwan-pablo.mp4", "Amer × Marwan Pablo"],
      ["cairokee-beanos.mp4", "Cairokee — Beanos"],
      ["cairokee-stavolta.mp4", "Cairokee — Stavolta"],
      ["concert-projectmeem.mp4", "Project Meem"],
      ["no-art-recap.mp4", "No Art — Recap"],
      ["stephan-jolk.mp4", "Stephan Jolk"],
    ],
    music: [
      ["ouny-7adana.mp4", "Ouny — 7adana"],
      ["ouny-ego.mp4", "Ouny — EGO"],
      ["ouny-mama.mp4", "Ouny — Mama"],
      ["ouny-3een-aleel.mp4", "Ouny — 3een Aleel"],
      ["ouny-a3da2ii.mp4", "Ouny — A3da2ii"],
      ["showkey-alby-mat.mp4", "Showkey — Alby Mat"],
      ["showkey-aflt-el3dad.mp4", "Showkey — Aflt El3dad"],
      ["showkey-3ada-w-fat.mp4", "Showkey — 3ada w Fat"],
      ["seifkix-ratata.mp4", "Seifkix — RATATA"],
      ["zuksh-basha.mp4", "Zuksh — Basha"],
      ["lethality-taf.mp4", "Lethality — TAF"],
      ["burhvn-mesh-bafa.mp4", "BURHVN — Mesh Bafa"],
      ["edgar.mp4", "Edgar"],
      ["khaled-rabea-3eny.mp4", "Khaled Rabea — 3eny"],
      ["meem-haitham.mp4", "Meem Haitham"],
      ["tag-ezay.mp4", "Tag — Ezay"],
      ["torky-tale3.mp4", "M. Torky — Tale3"],
      ["zaadinero-madrid.mp4", "Zaadinero — Madrid"],
      ["ziadzdan-type-shi.mp4", "Ziad Zdan — Type Shi"],
    ],
    events: [
      ["redbull-event.mp4", "Red Bull — Event"],
      ["9elvn-event.mp4", "9elvn — Event"],
      ["kahio-event.mp4", "Kahio — Event"],
      ["day2-event.mp4", "Day 2 — Event"],
    ],
    fashion: [
      ["cruel-main.mp4", "Cruel — Main Film"],
      ["cruel-teaser.mp4", "Cruel — Teaser"],
    ],
    commercial: [
      ["crave-reel-1.mp4", "Crave — Reel 1"],
      ["crave-reel-2.mp4", "Crave — Reel 2"],
      ["crave-reel-3.mp4", "Crave — Reel 3"],
      ["crave-reel-4.mp4", "Crave — Reel 4"],
    ],
    social: [
      ["social-1.mp4", "Social — 1"],
      ["social-2.mp4", "Social — 2"],
    ],
  };
  const NAMES = { automotive: "Automotive", concerts: "Concerts", music: "Music Videos", events: "Events", fashion: "Fashion", commercial: "Commercial", social: "Social" };

  // modal
  const m = document.createElement("div");
  m.className = "films"; m.hidden = true; m.setAttribute("role", "dialog"); m.setAttribute("aria-modal", "true");
  m.setAttribute("data-lenis-prevent", "");
  m.innerHTML = `
    <div class="films__box">
      <header class="films__head">
        <p class="mono films__niche"></p>
        <button class="films__close" type="button" aria-label="Close">✕</button>
      </header>
      <div class="films__body">
        <div class="films__stage"><video class="films__video" controls playsinline preload="metadata"></video></div>
        <div class="films__side">
          <h3 class="films__title"></h3>
          <ol class="films__list"></ol>
        </div>
      </div>
    </div>`;
  document.body.appendChild(m);
  const vid = m.querySelector(".films__video"), list = m.querySelector(".films__list");
  const title = m.querySelector(".films__title"), niche = m.querySelector(".films__niche");
  let lastFocus = null;

  function play(id, i) {
    const [file, name] = FILMS[id][i];
    vid.src = BASE + id + "/" + file;
    track("film_play", { niche: id, film: name });
    vid.play().catch(() => {});
    title.textContent = name;
    list.querySelectorAll("button").forEach((b, j) => b.setAttribute("aria-current", j === i ? "true" : "false"));
  }
  const track = (event, data) => { if (window.gtag) window.gtag("event", event, data); };
  document.addEventListener("click", e => {
    const a = e.target.closest("a"); if (!a) return;
    if (a.href.includes("wa.me")) track("whatsapp_click", { link_url: a.href });
    else if (a.href.includes("cal.com")) track("book_call_click", { link_url: a.href });
    else if (a.href.includes("instagram.com")) track("instagram_click", { link_url: a.href });
    else if (a.href.startsWith("mailto:")) track("email_click", { link_url: a.href });
  });
  function open(id) {
    track("films_open", { niche: id });
    lastFocus = document.activeElement;
    niche.textContent = NAMES[id] + " · " + FILMS[id].length + (FILMS[id].length === 1 ? " film" : " films");
    list.innerHTML = FILMS[id].map(([, n], i) => `<li><button type="button" data-i="${i}"><span class="mono">${String(i + 1).padStart(2, "0")}</span>${n}</button></li>`).join("");
    list.onclick = e => { const b = e.target.closest("button"); if (b) play(id, +b.dataset.i); };
    m.hidden = false; document.documentElement.classList.add("films-open");
    document.querySelectorAll(".reel video, .hero video").forEach(v => v.pause());
    play(id, 0);
    m.querySelector(".films__close").focus();
  }
  function close() {
    vid.pause(); vid.removeAttribute("src"); vid.load();
    m.hidden = true; document.documentElement.classList.remove("films-open");
    if (lastFocus) lastFocus.focus();
  }
  m.querySelector(".films__close").onclick = close;
  m.addEventListener("click", e => { if (e.target === m) close(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape" && !m.hidden) close(); });

  // a button on every niche that has films
  document.querySelectorAll(".panel[data-id]").forEach(p => {
    const id = p.dataset.id;
    if (!FILMS[id] || !FILMS[id].length) return;
    const b = document.createElement("button");
    b.type = "button"; b.className = "btn btn--films";
    b.innerHTML = `Watch the films <span aria-hidden="true">▶</span> <span class="mono">${FILMS[id].length}</span>`;
    b.onclick = () => open(id);
    const line = p.querySelector(".panel__line");
    (line || p).insertAdjacentElement("afterend", b);
  });
})();
