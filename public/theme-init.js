// Synchronous theme initialization to prevent flash of wrong theme.
// Must run before first paint. Loaded via <script> tag in layout.tsx.
(function () {
  try {
    var t = localStorage.getItem("chrono-theme");
    if (t === "light") document.documentElement.classList.add("light");
  } catch (e) {
    // localStorage unavailable (private browsing, etc.) — default dark theme
  }
})();
