// Loaded in <head> so the saved theme applies before the popup paints (no flash).
const root = document.documentElement;
let saved = null;
try { saved = localStorage.getItem("theme"); } catch {}
root.dataset.theme = saved ?? (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");

addEventListener("DOMContentLoaded", () => {
  document.getElementById("theme").addEventListener("click", () => {
    root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("theme", root.dataset.theme); } catch {}
  });
});
