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
  $("note").textContent = ""; // #note collapses when empty
  $("controls").hidden = false;
  $("loop").setAttribute("aria-checked", String(state.whole));
  $("ab").classList.toggle("open", state.whole);
  $("ab").inert = !state.whole; // hidden buttons must not take Tab focus
  $("ta").textContent = state.a === null ? "–:––" : time(state.a);
  $("tb").textContent = state.b === null ? "–:––" : time(state.b);
  $("a").classList.toggle("set", state.a !== null);
  $("b").classList.toggle("set", state.b !== null);
  $("hint").textContent = !state.whole ? "Play this video on repeat" :
    state.a !== null && state.b !== null ? "Looping a part" : // the A and B tiles right below already show the times
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

// "Show button under the video": saved here, the page picks it up from storage. On unless the user turned it off.
const showSwitch = $("show");
const { showButton } = await chrome.storage.local.get("showButton");
// aria-checked is kept in step with checked: tests and the shared design read the switch state from it.
const setShow = (on) => { showSwitch.checked = on; showSwitch.setAttribute("aria-checked", String(on)); };
setShow(showButton !== false);
showSwitch.addEventListener("change", () => {
  setShow(showSwitch.checked);
  chrome.storage.local.set({ showButton: showSwitch.checked });
});
