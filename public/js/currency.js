// -------------------------
// Currency: 2-side (editable both sides)
// -------------------------
const fxFrom = $("#fxFrom");
const fxTo = $("#fxTo");
const fxLeft = $("#fxLeft");
const fxRight = $("#fxRight");
const fxMsg = $("#fxMsg");
const fxMeta = $("#fxMeta");
const favFxBtn = $("#favFxBtn");


let fxIsUpdating = false;
let lastFxDirection = "L2R"; // who edited last

$("#fxRefresh").addEventListener("click", () => loadCurrencies());
favFxBtn?.addEventListener("click", () => {
    toggleFavorite({
      type: "currency",
      from: fxFrom.value,
      to: fxTo.value
    });
  
    updateFavButtonsUI();
  });

$("#fxClearBtn").addEventListener("click", () => {
    fxIsUpdating = true;
    fxLeft.value = "";
    fxRight.value = "";
    fxIsUpdating = false;
  
    setMsg(fxMsg, "");
    fxMeta.textContent = "";
    lastFxDirection = "L2R";
  
    fxLeft.focus();
  });
$("#fxSwap").addEventListener("click", () => {

    const a = fxFrom.value;
    fxFrom.value = fxTo.value;
    fxTo.value = a;
  
    const leftVal = fxLeft.value;
    const rightVal = fxRight.value;
  
    fxLeft.value = rightVal;
    fxRight.value = leftVal;
  
    lastFxDirection = "L2R";   // ВАЖЛИВО
  
    recalcFx();
  
  });

fxLeft.addEventListener("input", () => { lastFxDirection = "L2R"; recalcFx(); });
fxRight.addEventListener("input", () => { lastFxDirection = "R2L"; recalcFx(); });
fxFrom.addEventListener("change", recalcFx);
fxTo.addEventListener("change", recalcFx);
fxFrom.addEventListener("change", updateFavButtonsUI);
fxTo.addEventListener("change", updateFavButtonsUI);

async function loadCurrencies() {
  setMsg(fxMsg, t("msg_loading_currencies"));
  fxMeta.textContent = "";

  const prevFrom = fxFrom.value;
  const prevTo = fxTo.value;
  const hadLeftValue = String(fxLeft.value || "").trim() !== "";
  const hadRightValue = String(fxRight.value || "").trim() !== "";

  try {
    const res = await fetch("/api/currencies");
    const payload = await res.json();
    const data = payload.data || {};
    const codes = Object.keys(data).sort();

    const optionsHtml = buildOptionsWithPopularFirst(
      codes,
      (c) => c,
      (c) => {
        const name = String(data[c] || "").trim();
        return (!name || name.toUpperCase() === c) ? c : `${c} — ${name}`;
      },
      POPULAR_CURRENCIES
    );

    fxFrom.innerHTML = optionsHtml;
    fxTo.innerHTML = optionsHtml;

    if (prevFrom && codes.includes(prevFrom)) {
      fxFrom.value = prevFrom;
    } else {
      fxFrom.value = "USD";
    }

    if (prevTo && codes.includes(prevTo)) {
      fxTo.value = prevTo;
    } else {
      fxTo.value = "EUR";
    }

    if (fxFrom.value === fxTo.value) {
      const fallbackTo = codes.find((code) => code !== fxFrom.value) || "EUR";
      fxTo.value = fallbackTo;
    }

    setMsg(fxMsg, t("msg_ready"), "ok");
    fxMeta.textContent = `${t("fx_source")}: ${payload.source || "?"}`;

    updateFavButtonsUI();

    if (hadLeftValue || hadRightValue) {
      recalcFx();
    }
  } catch (e) {
    setMsg(fxMsg, t("msg_fx_error"), "error");
  }
}

async function recalcFx() {
  if (fxIsUpdating) return;

  const from = fxFrom.value;
  const to = fxTo.value;
  if (!from || !to) return;

  const amount = lastFxDirection === "L2R"
    ? parseNumberLoose(fxLeft.value)
    : parseNumberLoose(fxRight.value);

  if (amount === null) {
    setMsg(fxMsg, (lastFxDirection === "L2R" ? fxLeft.value : fxRight.value).trim() ? t("msg_enter_number") : "");
    return;
  }

  if (from === to) {
    fxIsUpdating = true;
    if (lastFxDirection === "L2R") fxRight.value = String(amount);
    else fxLeft.value = String(amount);
    fxIsUpdating = false;
    setMsg(fxMsg, t("msg_same_currency"), "ok");
    return;
  }

  try {
    const showFrom = (lastFxDirection === "L2R") ? from : to;
    const showTo   = (lastFxDirection === "L2R") ? to   : from;
    setMsg(fxMsg, `${amount} ${showFrom} → ${showTo}`);
    fxIsUpdating = true;

    const payload = lastFxDirection === "L2R"
      ? { amount, from, to }
      : { amount, from: to, to: from };

    const res = await fetch("/api/convert/currency", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Convert error");

    const result = Number(data.result);

    if (lastFxDirection === "L2R") {
        fxRight.value = String(result);
        flashField(fxRight);
      } else {
        fxLeft.value = String(result);
        flashField(fxLeft);
      }

    const showFrom2 = (lastFxDirection === "L2R") ? from : to;
    const showTo2   = (lastFxDirection === "L2R") ? to   : from;
    setMsg(fxMsg, `${amount} ${showFrom2} → ${showTo2}`, "ok");
        const timeStr = data.serverTime
    ? new Date(data.serverTime).toLocaleTimeString("uk-UA", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    : "";

    fxMeta.textContent =
    `${t("fx_rate_date")}: ${data.providerDate || "—"} • ${t("fx_updated")}: ${timeStr || "—"}`;

    fxIsUpdating = false;
    debouncedFxHistory();
  } catch (e) {
    fxIsUpdating = false;
    setMsg(fxMsg, t("msg_fx_error"), "error");
  }
}

const debouncedFxHistory = debounce(async () => {
    try {
      const from = fxFrom.value;
      const to = fxTo.value;
  
      // беремо число з “останнього напрямку”
      const amount =
        lastFxDirection === "L2R"
          ? parseNumberLoose(fxLeft.value)
          : parseNumberLoose(fxRight.value);
  
      if (amount === null) return;
  
      // для історії хочемо зберігати amount як “ліва сторона” (з from)
      // тому якщо вводили справа (R2L), то amount зараз у to — треба перерахувати назад
      let amountFrom = amount;
      if (lastFxDirection === "R2L") {
        // amount зараз у “to”, тобто це amountTo
        // переводимо назад: amountFrom = amountTo / rate
        const res = await fetch("/api/convert/currency", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, from: to, to: from }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "FX reverse convert error");
        amountFrom = Number(data.result);
        if (!Number.isFinite(amountFrom)) return;
      }
  
      const leftVal = String(roundSmart(amountFrom));
      const rightVal = String(fxRight.value || "").trim();
  
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "currency",
          input: `${leftVal} ${from}`,
          output: `${rightVal} ${to}`,
          payload: {
            from,
            to,
            amount: Number(leftVal), // саме amount з "from"
          },
        }),
      });
  
      if (!historyPanel.classList.contains("isHidden")) loadHistory();
    } catch {
      // ігноруємо
    }
  }, 1400);