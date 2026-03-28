// -------------------------
// helpers
// -------------------------
function debounce(fn, ms = 500) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), ms);
    };
  }
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function getToastRoot() {
    let root = document.querySelector("#toastRoot");
  
    if (!root) {
      root = document.createElement("div");
      root.id = "toastRoot";
      root.className = "toastRoot";
      root.setAttribute("aria-live", "polite");
      root.setAttribute("aria-atomic", "true");
      document.body.appendChild(root);
    }
  
    return root;
  }

// -------------------------
// Favorites (row above active tool)
// -------------------------
const favoritesRow = $("#favoritesRow");
const favoritesBtns = $("#favoritesBtns");

function loadFavorites() {
  try {
    return JSON.parse(localStorage.getItem("favorites") || "[]");
  } catch {
    return [];
  }
}

function saveFavorites(list) {
  localStorage.setItem("favorites", JSON.stringify(list));
}

// key = unique id (no duplicates)
function favKey(f) {
  if (f.type === "units") return `units:${f.tab}:${f.from}:${f.to}`;
  if (f.type === "currency") return `currency:${f.from}:${f.to}`;
  if (f.type === "bases") return `bases`;
  return JSON.stringify(f);
}

function isFavorite(fav) {
    const list = loadFavorites();
    const key = favKey(fav);
    return list.some(x => favKey(x) === key);
  }

function updateFavButtonsUI() {
    // Units
    if (typeof favUnitBtn !== "undefined" && favUnitBtn && unitFrom && unitTo) {
      const fav = { type: "units", tab: currentUnitTab, from: unitFrom.value, to: unitTo.value };
      const active = isFavorite(fav);
      favUnitBtn.textContent = active ? "★" : "☆";
      favUnitBtn.classList.toggle("isActiveStar", active);
      favUnitBtn.title = active ? t("fav_in") : t("fav_add");
    }
  
    // Currency
    const favFxBtn = $("#favFxBtn");
    if (favFxBtn && fxFrom && fxTo) {
      const fav = { type: "currency", from: fxFrom.value, to: fxTo.value };
      const active = isFavorite(fav);
      favFxBtn.textContent = active ? "★" : "☆";
      favFxBtn.classList.toggle("isActiveStar", active);
      favFxBtn.title = active ? t("fav_in") : t("fav_add");
    }
}

function toggleFavorite(fav) {
  let list = loadFavorites();

  const key = favKey(fav);
  const idx = list.findIndex(x => favKey(x) === key);

  if (idx >= 0) {
    list.splice(idx, 1);
  } else {
    // max 5
    if (list.length >= 5) list.shift();
    list.push(fav);
  }

  saveFavorites(list);
  renderFavoritesRow();
  updateFavButtonsUI();
}

function removeFavoriteByKey(key) {
  const list = loadFavorites().filter(x => favKey(x) !== key);
  saveFavorites(list);
  renderFavoritesRow();
}

function labelForFav(f) {
    // максимально коротко, без "конвертер ..."
    if (f.type === "units") {
      // приклад: "mi → km" або "kg → lb"
      return `⭐ ${f.from} → ${f.to}`;
    }
  
    if (f.type === "currency") {
      // приклад: "UAH → USD"
      return `⭐ ${f.from} → ${f.to}`;
    }
  
    if (f.type === "bases") {
      // якщо хочеш коротко:
      return `⭐ BIN/OCT/DEC/HEX`;
    }
  
    return "⭐";
  }

  function applyFavorite(f) {
    if (f.type === "units") {
      openView("units");
      setUnitTab(f.tab);
  
      setTimeout(() => {
        unitFrom.value = f.from;
        unitTo.value = f.to;
        updateFavButtonsUI();
        unitLeft.focus();
      }, 50);
  
      return;
    }
  
    if (f.type === "currency") {
      openView("currency");
  
      setTimeout(() => {
        fxFrom.value = f.from;
        fxTo.value = f.to;
        updateFavButtonsUI();
        fxLeft.focus();
      }, 50);
  
      return;
    }
  
    if (f.type === "bases") {
      openView("bases");
      setTimeout(() => {
        updateFavButtonsUI();
        binInput.focus();
      }, 50);
      return;
    }
  }

function renderFavoritesRow() {
    const list = loadFavorites().slice(-5);
  
    // якщо порожньо — ховаємо
    if (!list.length) {
      favoritesRow.hidden = true;
      favoritesBtns.innerHTML = "";
      updateFavButtonsUI(); // ✅ оновити зірочки
      return;
    }
  
    favoritesRow.hidden = false;
    favoritesBtns.innerHTML = list.map(f => {
      const key = favKey(f);
      return `
        <div class="favPill" data-fav-key="${escapeHtml(key)}">
          ${escapeHtml(labelForFav(f))}
          <div class="favPillX" data-fav-x="${escapeHtml(key)}">✕</div>
        </div>
      `;
    }).join("");
  
    updateFavButtonsUI(); // ✅ оновити зірочки
  }

// clicks
favoritesRow?.addEventListener("click", (e) => {
  const x = e.target.closest("[data-fav-x]");
  if (x) {
    removeFavoriteByKey(x.dataset.favX);
    return;
  }

  const pill = e.target.closest("[data-fav-key]");
  if (!pill) return;

  const key = pill.dataset.favKey;
  const list = loadFavorites();
  const fav = list.find(f => favKey(f) === key);
  if (fav) applyFavorite(fav);
});

function showToast(text, kind = "muted", duration = 1800) {
    if (!text) return;
  
    const toastRoot = getToastRoot();
  
    const toast = document.createElement("div");
    toast.className = `toast ${kind === "error" ? "isError" : kind === "ok" ? "isOk" : "isMuted"}`;
    toast.textContent = text;
  
    toastRoot.appendChild(toast);
  
    requestAnimationFrame(() => {
      toast.classList.add("isVisible");
    });
  
    setTimeout(() => {
      toast.classList.remove("isVisible");
  
      setTimeout(() => {
        toast.remove();
      }, 220);
    }, duration);
  }

function setMsg(el, text, kind = "muted") {
  el.textContent = text || "";
  el.classList.remove("isError", "isOk");
  if (kind === "error") el.classList.add("isError");
  if (kind === "ok") el.classList.add("isOk");
}

function parseNumberLoose(value) {
  // дозволяємо "10,5" і "10.5"
  const v = String(value).trim().replace(",", ".");
  if (v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}