// Synchronous theme initialization to prevent flash of wrong theme.
// Must run before first paint. Loaded via <script> tag in layout.tsx.
(function () {
  try {
    var t = localStorage.getItem("chrono-theme");
    if (t === "dark") {
      document.documentElement.classList.add("dark");
    }
    // Default is light — no class needed (CSS :root handles it)
  } catch (e) {
    // localStorage unavailable (private browsing, etc.) — default light theme
  }
})();
