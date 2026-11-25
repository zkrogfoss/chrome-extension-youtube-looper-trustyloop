// Compact loop controls next to the Subscribe button. Sends nothing anywhere, stores nothing.
const state = { whole: false, a: null, b: null };
const video = () => document.querySelector("video.html5-main-video") ?? document.querySelector("video");
const time = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

// YouTube enforces Trusted Types, which blocks innerHTML strings: build nodes by hand.
function el(tag, props = {}, ...kids) {
  const n = Object.assign(document.createElement(tag), props);
  n.append(...kids);
  return n;
}

// YouTube's own color variables don't reach this spot reliably, so the theme comes from html[dark].
const css = new CSSStyleSheet();
css.replaceSync(`
  :host {
    display: inline-flex; font-family: Roboto, Arial, sans-serif;
    --fg: #0f0f0f; --muted: #909090; --chip: rgba(0,0,0,.05); --hover: rgba(0,0,0,.1);
    --line: rgba(0,0,0,.1); --on-bg: #0f0f0f; --on-fg: #fff; --float: #fff;
  }
  :host-context(html[dark]) {
    --fg: #f1f1f1; --muted: #717171; --chip: rgba(255,255,255,.1); --hover: rgba(255,255,255,.2);
    --line: rgba(255,255,255,.2); --on-bg: #f1f1f1; --on-fg: #0f0f0f; --float: #282828;
  }
  .row { display: flex; align-items: center; }
  button {
    height: 36px; display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    border: 0; background: var(--chip); color: var(--fg); cursor: pointer;
    font: 500 14px Roboto, Arial, sans-serif; font-variant-numeric: tabular-nums;
    transition: background .15s, color .15s;
  }
  button:hover { background: var(--hover); }
  button:focus-visible { outline: 2px solid var(--fg); outline-offset: 2px; }
  [hidden] { display: none; }
  /* Loop: a round icon button like Share/Save; filled (like Subscribe) while anything loops. */
  .loop { width: 36px; padding: 0; border-radius: 50%; }
  .loop svg { width: 20px; height: 20px; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
  .loop.on, .loop.on:hover { background: var(--on-bg); color: var(--on-fg); }
  /* A | B slides out to the left of the loop button while looping (0fr→1fr animates the width). */
  .ab {
    display: grid; grid-template-columns: 0fr; opacity: 0; transform: translateX(12px);
    transition: grid-template-columns .25s ease, opacity .2s ease, transform .25s ease;
  }
  .ab.open { grid-template-columns: 1fr; opacity: 1; transform: none; }
  .ab > div { overflow: hidden; min-width: 0; }
  @media (prefers-reduced-motion: reduce) { .ab { transition: none; } }
  /* One pill like Like | Dislike; hover lights the whole pill, not half of it. */
  .pill {
    display: flex; align-items: center; width: max-content; height: 36px; margin-right: 8px;
    border-radius: 18px; background: var(--chip); transition: background .15s;
  }
  .pill:hover { background: var(--hover); }
  .pill button { background: transparent; padding: 0 14px; gap: 7px; color: var(--muted); }
  .pill button:hover { background: transparent; color: var(--fg); }
  .pill button:focus-visible { outline-offset: -2px; border-radius: 18px; }
  /* Letter small and quiet, time in full colour: reads as a label + value, not one word. */
  .k { font-size: 11px; font-weight: 700; letter-spacing: .04em; color: var(--muted); transition: color .15s; }
  button:hover .k { color: var(--fg); }
  .t { color: var(--fg); }
  .t:empty { display: none; }
  .sep { flex: none; width: 1px; height: 16px; background: var(--line); }
  :host(.floating) { position: fixed; left: 50%; bottom: 96px; transform: translateX(-50%); z-index: 9999; }
  :host(.floating) .row { padding: 6px; border-radius: 24px; background: var(--float); box-shadow: 0 4px 16px rgba(0,0,0,.25); }
`);

const NS = "http://www.w3.org/2000/svg";
const icon = document.createElementNS(NS, "svg");
icon.setAttribute("viewBox", "0 0 24 24");
const path = document.createElementNS(NS, "path");
path.setAttribute("d", "M17 3l3 3-3 3M4 11v-1a4 4 0 0 1 4-4h12M7 21l-3-3 3-3M20 13v1a4 4 0 0 1-4 4H4");
icon.append(path);

const loop = el("button", { className: "loop" }, icon);
const tA = el("span", { className: "t" });
const tB = el("span", { className: "t" });
const btnA = el("button", { title: "Set A: start of the part to loop" }, el("span", { className: "k" }, "A"), tA);
const btnB = el("button", { title: "Set B: end of the part to loop" }, el("span", { className: "k" }, "B"), tB);
const ab = el("div", { className: "ab" },
  el("div", {}, el("div", { className: "pill" }, btnA, el("span", { className: "sep" }), btnB)));

const host = el("div", { id: "yt-looper" });
const root = host.attachShadow({ mode: "closed" });
root.adoptedStyleSheets = [css];
root.append(el("div", { className: "row" }, ab, loop));
// YouTube's own rules override a margin set inside the shadow root, so it goes on the element itself.
host.style.marginLeft = "16px";

function render() {
  const live = state.a !== null && state.b !== null;
  loop.classList.toggle("on", state.whole);
  loop.setAttribute("aria-pressed", String(state.whole));
  loop.title = !state.whole ? "Loop" : live ? "Looping A → B (click to stop)" : "Looping whole video (click to stop)";
  ab.classList.toggle("open", state.whole);
  ab.inert = !state.whole; // hidden buttons must not take Tab focus
  tA.textContent = state.a === null ? "" : time(state.a);
  tB.textContent = state.b === null ? "" : time(state.b);
  btnA.classList.toggle("set", state.a !== null);
  btnB.classList.toggle("set", state.b !== null);
}

// One set of commands for both the bar and the popup, so they always show the same state.
const commands = {
  // Loop on: whole video, with A | B shown to narrow it. Loop off: everything off.
  loop(v) {
    state.whole = !state.whole;
    v.loop = state.whole;
    if (!state.whole) state.a = state.b = null;
  },
  a(v) {
    state.a = v.currentTime;
    if (state.b !== null && state.b <= state.a) state.b = null;
  },
  b(v) {
    if (state.a !== null && v.currentTime > state.a) state.b = v.currentTime;
  },
  state() {},
};

function run(cmd) {
  const v = video();
  if (v) commands[cmd]?.(v);
  render();
  return { ...state };
}

for (const [btn, cmd] of [[loop, "loop"], [btnA, "a"], [btnB, "b"]]) {
  btn.addEventListener("click", (e) => {
    run(cmd);
    // Otherwise the button keeps focus and Space presses it instead of pausing the video.
    e.currentTarget.blur();
  });
}

chrome.runtime.onMessage.addListener((msg, _sender, reply) => {
  if (location.pathname !== "/watch" || !video()) return reply({ error: "Open a YouTube video first." });
  reply(run(msg.cmd));
});

// YouTube swaps videos without reloading the page: listen on the document, act on the main player.
document.addEventListener("timeupdate", (e) => {
  const v = e.target;
  if (v !== video()) return;
  if (state.a !== null && state.b !== null && v.currentTime >= state.b) v.currentTime = state.a;
}, true);

// youtube.com: after Subscribe. music.youtube.com has no such spot, so the pill floats above its player bar.
let tries = 0;
function mount() {
  const watching = location.pathname === "/watch";
  host.style.display = watching ? "" : "none";
  if (!watching) return;
  const owner = document.querySelector("ytd-watch-metadata #owner");
  if (owner) {
    host.classList.remove("floating");
    if (host.parentNode !== owner) owner.append(host);
  } else if (location.hostname === "music.youtube.com" || ++tries > 20) {
    host.classList.add("floating");
    if (!host.isConnected) document.body.append(host);
  } else {
    setTimeout(mount, 300); // the watch layout renders after the script starts
  }
}

// A new video starts with no loop.
document.addEventListener("yt-navigate-finish", () => {
  state.whole = false;
  state.a = state.b = null;
  const v = video();
  if (v) v.loop = false;
  render();
  tries = 0;
  mount();
});

render();
mount();
