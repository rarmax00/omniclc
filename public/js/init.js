// -------------------------
// Global search shortcut (Ctrl+K / Cmd+K)
// -------------------------

document.addEventListener("keydown", (e)=>{

    const isMac = navigator.platform.toUpperCase().includes("MAC");
  
    if(
      (isMac && e.metaKey && e.key === "k") ||
      (!isMac && e.ctrlKey && e.key === "k")
    ){
  
      e.preventDefault();
  
      toolSearch.focus();
      toolSearch.select();
  
    }
  
  });

// -------------------------
// Disable browser autofill / suggestions everywhere (mac Chrome/Safari workaround)
// -------------------------
(() => {
    const inputs = document.querySelectorAll("input, textarea");
    inputs.forEach((el) => {
      // якщо є id — робимо унікальне name (браузер часто памʼятає саме по name)
      if (el.id) el.setAttribute("name", el.id);
  
      // найжорсткіший варіант проти підстановок
      el.setAttribute("autocomplete", "new-password");
  
      // дрібні штуки, щоб не лізли авто-виправлення
      el.setAttribute("autocapitalize", "off");
      el.setAttribute("autocorrect", "off");
      el.setAttribute("spellcheck", "false");
    });
  })();

  (function disableBrowserSuggestions() {
    const fields = document.querySelectorAll("input, textarea");
  
    fields.forEach((el, i) => {
      el.setAttribute("autocomplete", "off");
      el.setAttribute("autocorrect", "off");
      el.setAttribute("autocapitalize", "off");
      el.setAttribute("spellcheck", "false");
  
      if (!el.getAttribute("name")) {
        el.setAttribute("name", `field_omni_${i}`);
      }
    });
  })();

// -------------------------
// init
// -------------------------
applyLang(localStorage.getItem("lang") || "ua");

const lastView = localStorage.getItem("lastView") || "calc";
openView(lastView);

setUnitTab("length");
loadCurrencies();
loadHistory();
renderFavoritesRow();
initFieldCopyButtons();