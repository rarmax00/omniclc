// -------------------------
// views navigation
// -------------------------
const viewMap = {
  calc: "#view-calc",
  units: "#view-units",
  currency: "#view-currency",
  bases: "#view-bases",
};

function focusViewInput(viewKey) {
    setTimeout(() => {
      if (viewKey === "calc" && calcInput) {
        calcInput.focus();
        return;
      }
  
      if (viewKey === "currency" && fxLeft) {
        fxLeft.focus();
        return;
      }
  
      if (viewKey === "units" && unitLeft) {
        unitLeft.focus();
        return;
      }
  
      if (viewKey === "bases" && decInput) {
        decInput.focus();
        return;
      }
    }, 30);
  }

  function openView(viewKey) {
    const safeView = viewMap[viewKey] ? viewKey : "calc";
    localStorage.setItem("lastView", safeView);
  
    $$(".navBtn[data-view]").forEach((btn) => {
      btn.classList.toggle("isActive", btn.dataset.view === safeView);
    });
  
    Object.entries(viewMap).forEach(([k, sel]) => {
      const el = $(sel);
      if (!el) return;
  
      if (k === safeView) {
        el.style.display = "block";
        el.classList.add("isVisible");
      } else {
        el.classList.remove("isVisible");
        el.style.display = "none";
      }
    });
  
    renderFavoritesRow();
  
    const sh = $("#searchHint");
    if (sh) {
      sh.hidden = true;
      sh.innerHTML = "";
    }
  
    focusViewInput(safeView);
  }

$$(".navBtn[data-view]").forEach((btn) => {
  btn.addEventListener("click", () => openView(btn.dataset.view));
});
