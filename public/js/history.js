// -------------------------
// History panel
// -------------------------
const historyPanel = $("#historyPanel");
const historyToggleBtn = $("#historyToggle");
let historyAutoTimer = null;

function startHistoryAutoRefresh() {
    if (historyAutoTimer) return;
    historyAutoTimer = setInterval(() => {
      if (historyPanel.classList.contains("isHidden")) return;
  
      // ✅ якщо користувач скролить вниз — не чіпаємо
      if (isUserReadingHistory()) return;
  
      loadHistory({ preserveScroll: true });
    }, 1500);
  }

function stopHistoryAutoRefresh() {
  if (!historyAutoTimer) return;
  clearInterval(historyAutoTimer);
  historyAutoTimer = null;
}

$("#historyToggle").addEventListener("click", () => {
  const willOpen = historyPanel.classList.contains("isHidden"); // було сховане -> зараз відкриється
  historyPanel.classList.toggle("isHidden");

  if (willOpen) {
    setHistoryFilter("all");  // ✅ завжди загальні
    loadHistory();            // ✅ одразу підтягуємо
    startHistoryAutoRefresh();// ✅ авто-оновлення
  } else {
    stopHistoryAutoRefresh();
  }
});

document.addEventListener("click", (e) => {
    if (historyPanel.classList.contains("isHidden")) return;
  
    const clickInsideHistory = historyPanel.contains(e.target);
    const clickOnHistoryToggle = historyToggleBtn?.contains(e.target);
  
    if (!clickInsideHistory && !clickOnHistoryToggle) {
      historyPanel.classList.add("isHidden");
      stopHistoryAutoRefresh();
    }
  });

$("#historyClose").addEventListener("click", () => {
  historyPanel.classList.add("isHidden");
  stopHistoryAutoRefresh();
});

$("#historyRefresh").addEventListener("click", () => loadHistory());

$("#historyCopyAll").addEventListener("click", async () => {
    const text = buildHistoryExportText();
  
    try {
      await navigator.clipboard.writeText(text);
      showToast(t("history_copied_ok"), "ok");
    } catch {
        showToast(t("history_copy_error"), "error");
    }
  });

  $("#historyDownload").addEventListener("click", () => {
    const text = buildHistoryExportText();
    const now = new Date();
  
    const pad = (n) => String(n).padStart(2, "0");
    const filename = `history_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}.txt`;
  
    downloadTextFile(filename, text);
    showToast(t("history_saved_ok"), "ok");
  });

$("#historyClear").addEventListener("click", async () => {
    try {
      await fetch("/api/history", { method: "DELETE" });
      loadHistory();
    } catch {
      // якщо сервер не відповів
    }
  });

function normalizeHistoryKey(it) {
  const type = (it.type || "").toLowerCase();

  // Нормалізація під валюту
  if (type === "currency") {
    const input = String(it.input || "").trim();
    const output = String(it.output || "").trim();

    // витягуємо amount + from з input: "125 USD" або "125 USD → CZK"
    const m1 = input.match(/^(-?\d+(?:[.,]\d+)?)\s*([A-Z]{3})/i);
    const amount = m1 ? m1[1].replace(",", ".") : "";
    const from = m1 ? m1[2].toUpperCase() : "";

    // to може бути або в input ("→ CZK"), або в output ("2614 CZK")
    const mToIn = input.match(/→\s*([A-Z]{3})/i);
    const mToOut = output.match(/([A-Z]{3})$/i);
    const to = (mToIn?.[1] || mToOut?.[1] || "").toUpperCase();

    // result: число з output
    const mRes = output.match(/(-?\d+(?:[.,]\d+)?)/);
    const result = mRes ? mRes[1].replace(",", ".") : "";

    // якщо щось не витягнулося — fallback
    if (!amount || !from || !to || !result) {
      return `currency|raw|${input}|${output}`;
    }
    return `currency|${amount}|${from}|${to}|${result}`;
  }

  // Для інших типів — простий ключ
  return `${type}|${String(it.input || "").trim()}|${String(it.output || "").trim()}`;
}

function dedupeHistory(items) {
  const seen = new Set();
  const out = [];

  // припускаємо що сервер віддає нові зверху (як у тебе ?limit=20)
  for (const it of items) {
    const key = normalizeHistoryKey(it);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(it);
  }
  return out;
}

const historyListEl = $("#historyList");

function getHistoryScrollEl() {
  // хто реально скролиться: list чи panel
  const list = $("#historyList");
  const panel = $("#historyPanel");

  // якщо list має overflow і реально скролиться
  if (list && list.scrollHeight > list.clientHeight) return list;

  // інакше, скоріш за все скролиться панель
  return panel || list;
}

function isUserReadingHistory() {
  const sc = getHistoryScrollEl();
  if (!sc) return false;

  return sc.scrollTop > 60; // поріг можеш підкрутити
}

async function loadHistory(opts = {}) {
    const { preserveScroll = false } = opts;
  
    const list = $("#historyList");
    if (!list) return;
  
    const sc = getHistoryScrollEl();
  
    // ✅ зберігаємо скрол ДО оновлення
    const prevTop = preserveScroll && sc ? sc.scrollTop : 0;
    const prevHeight = preserveScroll && sc ? sc.scrollHeight : 0;
  
    // ❗️ВАЖЛИВО: не чіпаємо innerHTML одразу, бо це і скидає скрол
    // Якщо хочеш “loading” — краще зробити маленький індикатор зверху (можу додати)
  
    try {
      const res = await fetch("/api/history?limit=20");
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error("Сервер повернув не JSON (ймовірно HTML). Відкрий сайт через http://localhost:3000");
      }
  
      const items = data.items || [];
      historyCache = dedupeHistory(items);
      renderHistoryList();
  
      // ✅ відновлюємо скрол ПІСЛЯ renderHistoryList()
      if (preserveScroll && sc) {
        const newHeight = sc.scrollHeight;
        const delta = newHeight - prevHeight;
  
        // якщо нові записи додались зверху і висота виросла — компенсуємо
        sc.scrollTop = prevTop + (delta > 0 ? delta : 0);
      }
  
    } catch (e) {
      // тут можна показувати помилку, але обережно: теж не треба валити скрол
      list.innerHTML = `<div class="msg isError">${t("msg_history_load_error")}</div>`;
    }
  }

function renderHistoryItem(it, idx) {
    const ts = it.ts ? new Date(it.ts).toLocaleString() : "";
    return `
      <div class="historyItem">
        <div class="historyLeft">
          <div class="historyType">${escapeHtml(it.type || "")} • ${escapeHtml(ts)}</div>
          <div class="historyMain">${escapeHtml(it.input || "")}  ⇒  ${escapeHtml(it.output || "")}</div>
        </div>
  
        <div class="historyActions">
            <button class="miniBtn" type="button"
            data-h-action="repeat"
            data-h-idx="${idx}">${escapeHtml(t("repeat"))}</button>

            <button class="miniBtn" type="button"
            data-h-action="copy"
            data-h-copy="${escapeHtml(it.output || "")}">${escapeHtml(t("copy"))}</button>
        </div>
      </div>
    `;
  }

  let historyCache = [];
let historyFilter = localStorage.getItem("historyFilter") || "all";

function applyHistoryFilter(items) {
  if (historyFilter === "all") return items;
  return items.filter(it => (it.type || "") === historyFilter);
}

function renderHistoryList() {
    const list = $("#historyList");
    const items = applyHistoryFilter(historyCache);
  
    if (!items.length) {
      list.innerHTML = `<div class="muted">${escapeHtml(t("history_empty"))}</div>`;
      return;
    }
  
    // ✅ передаємо індекс у renderHistoryItem
    list.innerHTML = items.map((it, idx) => renderHistoryItem(it, idx)).join("");
  }

  function buildHistoryExportText(items = historyCache) {
    const list = applyHistoryFilter(items);
  
    if (!list.length) {
        return t("history_empty_export");
    }
  
    return list.map((it, idx) => {
      const ts = it.ts ? new Date(it.ts).toLocaleString() : "";
      const type = String(it.type || "").trim();
      const input = String(it.input || "").trim();
      const output = String(it.output || "").trim();
  
      return [
        `${idx + 1}. [${type}] ${ts}`,
        `   ${input} => ${output}`
      ].join("\n");
    }).join("\n\n");
  }

  function downloadTextFile(filename, text) {
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
  
    URL.revokeObjectURL(url);
  }

function setHistoryFilter(next) {
  historyFilter = next;
  localStorage.setItem("historyFilter", next);

  const box = $("#historyFilters");
  if (box) {
    box.querySelectorAll(".chip").forEach(btn => {
      btn.classList.toggle("isActive", btn.dataset.filter === next);
    });
  }
  renderHistoryList();
}

function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function buildOptionsWithPopularFirst(items, getValue, getLabel, popularValues = []) {
  const popularSet = new Set(popularValues);
  const popular = [];
  const rest = [];

  items.forEach((item) => {
    const value = getValue(item);
    if (popularSet.has(value)) popular.push(item);
    else rest.push(item);
  });

  const parts = [];

  popular.forEach((item) => {
    parts.push(
      `<option value="${escapeHtml(getValue(item))}">★ ${escapeHtml(getLabel(item))}</option>`
    );
  });

  rest.forEach((item) => {
    parts.push(
      `<option value="${escapeHtml(getValue(item))}">${escapeHtml(getLabel(item))}</option>`
    );
  });

  return parts.join("");
}

function flashField(el) {
    if (!el) return;
  
    el.classList.remove("fieldFlash");
  
    void el.offsetWidth;
  
    el.classList.add("fieldFlash");
  }

function copyTextSafe(text) {
    if (!text || text === "—") return false;
    navigator.clipboard.writeText(String(text)).catch(() => {});
    return true;
  }
  
  function showCopyMsg(targetMsgEl) {
    showToast(t("msg_copy_ok"), "ok");
  }
  
  function attachCopyButtonToInput(inputEl, options = {}) {
    if (!inputEl) return;
    if (inputEl.parentElement?.classList.contains("fieldActionWrap")) return;
  
    const {
        buttonId = "",
        title = t("copy"),
        onCopy = null
      } = options;
  
    const wrap = document.createElement("div");
    wrap.className = "fieldActionWrap";
  
    inputEl.parentNode.insertBefore(wrap, inputEl);
    wrap.appendChild(inputEl);
  
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "fieldCopyBtn";
    btn.textContent = "📋";
    btn.title = title;
    if (buttonId) btn.id = buttonId;
  
    btn.addEventListener("click", () => {
      if (typeof onCopy === "function") {
        onCopy();
      }
    });
  
    wrap.appendChild(btn);
  }

  function initFieldCopyButtons() {
    attachCopyButtonToInput(fxLeft, {
        buttonId: "fxCopyLeftBtn",
        title: "Скопіювати введену суму",
        onCopy: () => {
          if (copyTextSafe(fxLeft.value.trim())) {
            showCopyMsg(fxMsg);
          }
        }
      });

    attachCopyButtonToInput(fxRight, {
      buttonId: "fxCopyBtn",
      title: "Скопіювати результат валюти",
      onCopy: () => {
        if (copyTextSafe(fxRight.value.trim())) {
          showCopyMsg(fxMsg);
        }
      }
    });

    attachCopyButtonToInput(unitLeft, {
        buttonId: "unitCopyLeftBtn",
        title: "Скопіювати введене значення",
        onCopy: () => {
          if (copyTextSafe(unitLeft.value.trim())) {
            showCopyMsg(unitMsg);
          }
        }
      });
  
    attachCopyButtonToInput(unitRight, {
      buttonId: "unitCopyBtn",
      title: "Скопіювати результат одиниць",
      onCopy: () => {
        if (copyTextSafe(unitRight.value.trim())) {
          showCopyMsg(unitMsg);
        }
      }
    });
  
    attachCopyButtonToInput(binInput, {
      buttonId: "binCopyBtn",
      title: "Скопіювати BIN",
      onCopy: () => {
        if (copyTextSafe(binInput.value.trim())) {
          showCopyMsg(baseMsg);
        }
      }
    });
  
    attachCopyButtonToInput(octInput, {
      buttonId: "octCopyBtn",
      title: "Скопіювати OCT",
      onCopy: () => {
        if (copyTextSafe(octInput.value.trim())) {
          showCopyMsg(baseMsg);
        }
      }
    });
  
    attachCopyButtonToInput(decInput, {
      buttonId: "decCopyBtn",
      title: "Скопіювати DEC",
      onCopy: () => {
        if (copyTextSafe(decInput.value.trim())) {
          showCopyMsg(baseMsg);
        }
      }
    });
  
    attachCopyButtonToInput(hexInput, {
      buttonId: "hexCopyBtn",
      title: "Скопіювати HEX",
      onCopy: () => {
        if (copyTextSafe(hexInput.value.trim())) {
          showCopyMsg(baseMsg);
        }
      }
    });
  }


// кліки по фільтрах
const historyFiltersEl = $("#historyFilters");
if (historyFiltersEl) {
  // виставимо активний стан при старті
  setHistoryFilter(historyFilter);

  historyFiltersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip[data-filter]");
    if (!btn) return;
    setHistoryFilter(btn.dataset.filter);
  });
}

// кліки по списку історії (repeat/copy)
$("#historyList").addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-h-action]");
  if (!btn) return;

  const action = btn.dataset.hAction;

  if (action === "copy") {
    const value = btn.dataset.hCopy || "";
    if (!value) return;
    navigator.clipboard.writeText(value).catch(()=>{});
    showToast(t("msg_copy_ok"), "ok");
    return;
  }

  if (action === "repeat") {
    const idx = Number(btn.dataset.hIdx);
    if (!Number.isInteger(idx) || idx < 0) return;
  
    const item = applyHistoryFilter(historyCache)[idx];
    if (!item) return;
  
    await repeatFromHistory(item);
  }
});


async function repeatFromHistory(it) {
    const type = it.type;
    const p = it.payload || null;
  
    // закриємо панель, щоб не заважала
    historyPanel.classList.add("isHidden");
  
    // -------------------------
    // CURRENCY
    // -------------------------
    if (type === "currency") {
        let from = p?.from;
        let to = p?.to;
        let amount = p?.amount;
      
        // ✅ fallback для старих записів без payload:
        // input: "100 USD"
        // output: "92.3 EUR"
        if (!from || !to || amount === undefined || amount === null) {
          const m1 = String(it.input || "").match(/(-?\d+(?:[.,]\d+)?)\s*([A-Z]{3})/i);
          const m2 = String(it.output || "").match(/([A-Z]{3})\s*$/i) || String(it.output || "").match(/(-?\d+(?:[.,]\d+)?)\s*([A-Z]{3})/i);
      
          if (m1) {
            amount = parseNumberLoose(m1[1]);
            from = m1[2].toUpperCase();
          }
          if (m2) {
            to = (m2[2] || m2[1]).toUpperCase();
          }
        }
  
      if (!from || !to || amount === undefined || amount === null) return;
  
      openView("currency");
  
      // ✅ якщо валюти ще не завантажені — завантажити і дочекатись
      if (!fxFrom.options.length || !fxTo.options.length) {
        try { await loadCurrencies(); } catch {}
      }
  
      // ✅ якщо раптом потрібної валюти нема серед option — додамо
      ensureSelectOption(fxFrom, from);
      ensureSelectOption(fxTo, to);
  
      fxFrom.value = from;
      fxTo.value = to;
      fxLeft.value = String(amount);
  
      lastFxDirection = "L2R";
      updateFavButtonsUI();
      await recalcFx();
      fxLeft.focus();
      return;
    }
  
    // -------------------------
    // UNITS
    // -------------------------
    if (type === "units") {
      const tab = p?.tab || "length";
      const from = p?.from;
      const to = p?.to;
      const left = p?.left;
  
      if (!from || !to) return;
  
      openView("units");
      setUnitTab(tab);
  
      setTimeout(() => {
        unitFrom.value = from;
        unitTo.value = to;
        unitLeft.value = String(left ?? "");
        lastUnitDirection = "L2R";
        updateFavButtonsUI();
        recalcUnits();
        unitLeft.focus();
      }, 50);
      return;
    }
  
    // -------------------------
    // BASES
    // -------------------------
    if (type === "bases") {
      // payload: { type: "bin|oct|dec|hex", value: "..." }
      let baseType = p?.type;
      let value = p?.value;
  
      // ✅ fallback для старих записів без payload: "dec: 42"
      if (!baseType || value == null) {
        const m = String(it.input || "").match(/^(bin|oct|dec|hex)\s*:\s*(.+)$/i);
        if (m) {
          baseType = m[1].toLowerCase();
          value = m[2].trim();
        }
      }
  
      if (!baseType) return;
  
      openView("bases");
      setTimeout(() => {
        if (baseType === "bin") binInput.value = value || "";
        if (baseType === "oct") octInput.value = value || "";
        if (baseType === "dec") decInput.value = value || "";
        if (baseType === "hex") hexInput.value = value || "";
  
        if (value) convertFrom(baseType);
  
        (baseType === "bin" ? binInput :
         baseType === "oct" ? octInput :
         baseType === "dec" ? decInput : hexInput).focus();
      }, 50);
      return;
    }
  
    // -------------------------
    // CALC
    // -------------------------
    if (type === "calc") {
      const expr = p?.expr || it.input || "";
      if (!expr) return;
  
      openView("calc");
      setTimeout(() => {
        calcInput.value = expr;
        setCalcMode("edit");
        updateCalcPreview();
        calcInput.focus();
      }, 50);
      return;
    }
  }
  
  // ✅ helper: якщо option нема — додає
  function ensureSelectOption(sel, value) {
    if (!sel) return;
    const exists = Array.from(sel.options).some(o => o.value === value);
    if (!exists) {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = value;
      sel.appendChild(opt);
    }
  }