const langBtn = $("#langBtn");

function t(key) {
  return window.I18N_APP?.t(key) ?? key;
}

function applyLang(lang) {
  window.I18N_APP.setLang(lang);
  window.I18N_APP.applyI18n();

  if (langBtn) {
    langBtn.textContent = String(lang).toUpperCase();
  }

  if (typeof currentUnitTab !== "undefined" && typeof setUnitTab === "function") {
    const savedLeft = typeof unitLeft !== "undefined" ? unitLeft.value : "";
    const savedRight = typeof unitRight !== "undefined" ? unitRight.value : "";
    const savedFrom = typeof unitFrom !== "undefined" ? unitFrom.value : "";
    const savedTo = typeof unitTo !== "undefined" ? unitTo.value : "";

    setUnitTab(currentUnitTab);

    if (typeof unitFrom !== "undefined" && savedFrom) unitFrom.value = savedFrom;
    if (typeof unitTo !== "undefined" && savedTo) unitTo.value = savedTo;
    if (typeof unitLeft !== "undefined") unitLeft.value = savedLeft;
    if (typeof unitRight !== "undefined") unitRight.value = savedRight;
  }

  if (typeof renderHistoryList === "function") renderHistoryList();
  if (typeof updateFavButtonsUI === "function") updateFavButtonsUI();
  if (typeof renderFavoritesRow === "function") renderFavoritesRow();
}

function toggleLang() {
  const current = window.I18N_APP.getLang();
  const next = current === "ua" ? "en" : "ua";
  applyLang(next);
}

langBtn?.addEventListener("click", toggleLang);