// The popup only sends commands; the page keeps the state, shared with the bar under the video.
const $ = (id) => document.getElementById(id);
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
const time = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

function show(state) {
  if (!state || state.error) {
    $("note").textContent = state?.error ?? "Open a YouTube video first.";
    $("note").hidden = false;
    $("controls").hidden = true;
    return;
  }
  $("controls").hidden = false;
  $("loop").setAttribute("aria-checked", String(state.whole));
  $("ab").classList.toggle("open", state.whole);
  $("ab").inert = !state.whole; // hidden buttons must not take Tab focus
  $("ta").textContent = state.a === null ? "–:––" : time(state.a);
  $("tb").textContent = state.b === null ? "–:––" : time(state.b);
  $("a").classList.toggle("set", state.a !== null);
  $("b").classList.toggle("set", state.b !== null);
  $("hint").textContent =
    state.a !== null && state.b !== null ? `Looping ${time(state.a)} → ${time(state.b)}` :
    state.a !== null ? "Now set the end." : "Whole video. Set A and B to loop a part.";
}

async function send(cmd) {
  try {
    show(await chrome.tabs.sendMessage(tab.id, { cmd }));
  } catch {
    show(null); // no content script here: not YouTube, or the tab was open before the extension loaded
  }
}

for (const id of ["loop", "a", "b"]) $(id).addEventListener("click", () => send(id));
send("state");
