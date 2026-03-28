// -------------------------
// Theme toggle (dark/light)
// -------------------------
const themeBtn = $("#themeBtn");

function loadTheme() {
  const t = localStorage.getItem("theme") || "dark";
  document.documentElement.setAttribute("data-theme", t);
  themeBtn.textContent = t === "dark" ? "🌙" : "☀️";
}
function toggleTheme() {
  const cur = document.documentElement.getAttribute("data-theme") || "dark";
  const next = cur === "dark" ? "light" : "dark";
  localStorage.setItem("theme", next);
  loadTheme();
}
themeBtn.addEventListener("click", toggleTheme);
loadTheme();