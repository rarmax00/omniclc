// -------------------------
// Units: 2-side (editable both sides)
// -------------------------
const unitTo = $("#unitTo");
const unitLeft = $("#unitLeft");
const unitRight = $("#unitRight");
const unitMsg = $("#unitMsg");
const unitFrom = $("#unitFrom");
const unitTitle = $("#unitTitle");

let currentUnitTab = "length";

const favUnitBtn = $("#favUnitBtn");
favUnitBtn?.addEventListener("click", () => {
  if (!unitFrom?.value || !unitTo?.value) return; // на всяк випадок

  toggleFavorite({
    type: "units",
    tab: currentUnitTab,
    from: unitFrom.value,
    to: unitTo.value
  });

});

const unitTabs = $$(".pill[data-unit-tab]");
unitTabs.forEach((b) => b.addEventListener("click", () => setUnitTab(b.dataset.unitTab)));

let unitIsUpdating = false;
let lastUnitDirection = "L2R";


$("#unitClearBtn").addEventListener("click", () => {
    unitIsUpdating = true;
    unitLeft.value = "";
    unitRight.value = "";
    unitIsUpdating = false;
  
    setMsg(unitMsg, "");
    lastUnitDirection = "L2R";
  
    unitLeft.focus();
  });
  $("#unitSwap").addEventListener("click", () => {
    const a = unitFrom.value;
    unitFrom.value = unitTo.value;
    unitTo.value = a;
  
    const leftVal = unitLeft.value;
    const rightVal = unitRight.value;
  
    unitLeft.value = rightVal;
    unitRight.value = leftVal;
  
    lastUnitDirection = "L2R";
  
    updateFavButtonsUI();
    recalcUnits();
  });
  
  unitLeft.addEventListener("input", () => {
    if (unitIsUpdating) return;
  
    lastUnitDirection = "L2R";
    setMsg(unitMsg, "");
  
    requestAnimationFrame(() => {
      recalcUnits();
    });
  });
  
  unitLeft.addEventListener("input", () => {
    if (unitIsUpdating) return;
  
    lastUnitDirection = "L2R";
    setMsg(unitMsg, "");
  
    requestAnimationFrame(() => {
      recalcUnits();
    });
  });
  
  unitRight.addEventListener("input", () => {
    if (unitIsUpdating) return;
  
    lastUnitDirection = "R2L";
    setMsg(unitMsg, "");
  
    requestAnimationFrame(() => {
      recalcUnits();
    });
  });

  unitFrom.addEventListener("change", () => {
    updateFavButtonsUI();
    recalcUnits();
  });
  
  unitTo.addEventListener("change", () => {
    updateFavButtonsUI();
    recalcUnits();
  });
  
  unitFrom.addEventListener("input", () => {
    updateFavButtonsUI();
    recalcUnits();
  });
  
  unitTo.addEventListener("input", () => {
    updateFavButtonsUI();
    recalcUnits();
  });

const UNITS = {
  length: [
    ["mm", "Міліметр", 0.001],
    ["cm", "Сантиметр", 0.01],
    ["m", "Метр", 1],
    ["km", "Кілометр", 1000],
    ["in", "Дюйм", 0.0254],
    ["ft", "Фут", 0.3048],
    ["yd", "Ярд", 0.9144],
    ["mi", "Миля", 1609.344],
  ],
  mass: [
    ["g", "Грам", 0.001],
    ["kg", "Кілограм", 1],
    ["oz", "Унція", 0.028349523125],
    ["lb", "Фунт", 0.45359237],
    ["t", "Тонна", 1000],
  ],
  volume: [
    ["ml", "Мілілітр", 0.001],
    ["l", "Літр", 1],
    ["m3", "Куб. метр", 1000],
    ["gal", "Галон (US)", 3.785411784],
  ],
  area: [
    ["m2", "м²", 1],
    ["km2", "км²", 1_000_000],
    ["ft2", "ft²", 0.09290304],
    ["acre", "Акр", 4046.8564224],
    ["ha", "Гектар", 10_000],
  ],
  temp: [
    ["C", "°C (Цельсій)"],
    ["F", "°F (Фаренгейт)"],
    ["K", "K (Кельвін)"],
  ],
};

function setUnitTab(tab) {
  currentUnitTab = tab;

  if (unitTitle) {
    const names = {
      length: t("unitTab_length"),
      mass: t("unitTab_mass"),
      volume: t("unitTab_volume"),
      area: t("unitTab_area"),
      temp: t("unitTab_temp"),
    };
    unitTitle.textContent = names[tab] || "Converter";
  }

  unitTabs.forEach((b) => b.classList.toggle("isActive", b.dataset.unitTab === tab));

  fillUnitSelects();

  // при переході на ІНШИЙ тип величин нічого не зберігаємо
  unitIsUpdating = true;
  unitLeft.value = "";
  unitRight.value = "";
  unitIsUpdating = false;

  lastUnitDirection = "L2R";
  setMsg(unitMsg, "");
  updateFavButtonsUI();
}

  function selectAllOnFocus(el) {
    el.addEventListener("focus", () => {
      // маленька затримка, щоб працювало стабільно у різних браузерах
      setTimeout(() => el.select(), 0);
    });
  }
  
  selectAllOnFocus(unitLeft);
  selectAllOnFocus(unitRight);
  selectAllOnFocus(fxLeft);
  selectAllOnFocus(fxRight);

  function fillUnitSelects() {
    const list = UNITS[currentUnitTab];
    unitFrom.innerHTML = "";
    unitTo.innerHTML = "";
  
    if (currentUnitTab === "temp") {
      list.forEach(([code, name]) => {
        unitFrom.insertAdjacentHTML("beforeend", `<option value="${code}">${escapeHtml(name)}</option>`);
        unitTo.insertAdjacentHTML("beforeend", `<option value="${code}">${escapeHtml(name)}</option>`);
      });
      unitFrom.value = "C";
      unitTo.value = "F";
      return;
    }
  
    list.forEach(([code, name]) => {
      unitFrom.insertAdjacentHTML("beforeend", `<option value="${code}">${escapeHtml(code)} — ${escapeHtml(name)}</option>`);
      unitTo.insertAdjacentHTML("beforeend", `<option value="${code}">${escapeHtml(code)} — ${escapeHtml(name)}</option>`);
    });
  
    unitFrom.value = list[0][0];
    unitTo.value = list[2]?.[0] || list[0][0];
  }

  async function recalcUnits() {
    if (unitIsUpdating) return;
  
    if (!unitFrom.value || !unitTo.value) {
      fillUnitSelects();
    }
  
    const tab = currentUnitTab;
    const from = unitFrom.value;
    const to = unitTo.value;
  
    if (!from || !to) return;
  
    const sourceInput = lastUnitDirection === "L2R" ? unitLeft : unitRight;
    const targetInput = lastUnitDirection === "L2R" ? unitRight : unitLeft;
  
    const sourceFrom = lastUnitDirection === "L2R" ? from : to;
    const sourceTo = lastUnitDirection === "L2R" ? to : from;
  
    const rawValue = String(sourceInput.value || "").trim();
  
    // якщо поле-джерело пусте — очищаємо тільки протилежне поле
    if (!rawValue) {
      unitIsUpdating = true;
      targetInput.value = "";
      unitIsUpdating = false;
      setMsg(unitMsg, "");
      return;
    }
  
    const amount = parseNumberLoose(rawValue);
  
    if (amount === null) {
      unitIsUpdating = true;
      targetInput.value = "";
      unitIsUpdating = false;
      setMsg(unitMsg, t("msg_enter_number"));
      return;
    }
  
    try {
      const res = await fetch("/api/convert/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tab,
          amount,
          from: sourceFrom,
          to: sourceTo
        }),
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unit convert error");
  
      unitIsUpdating = true;
      targetInput.value = String(roundSmart(Number(data.result)));
      unitIsUpdating = false;
  
      setMsg(unitMsg, "");
      updateFavButtonsUI();
      debouncedUnitsHistory();
    } catch (e) {
      unitIsUpdating = false;
      setMsg(unitMsg, t("msg_units_error"), "error");
    }
  }

  const debouncedUnitsHistory = debounce(async () => {
    try {
      // визначаємо "що було введено" і "що стало результатом" залежно від напрямку
      const leftVal  = String(unitLeft.value || "").trim();
      const rightVal = String(unitRight.value || "").trim();
  
      if (!leftVal && !rightVal) return;
  
      const inputText =
        lastUnitDirection === "L2R"
          ? `${leftVal} ${unitFrom.value}`
          : `${rightVal} ${unitTo.value}`;
  
      const outputText =
        lastUnitDirection === "L2R"
          ? `${rightVal} ${unitTo.value}`
          : `${leftVal} ${unitFrom.value}`;
  
      if (!inputText.trim()) return;
  
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "units",
          input: inputText,
          output: outputText,
  
          // ✅ головне для "Повтор"
          payload: {
            tab: currentUnitTab,
            from: unitFrom.value,
            to: unitTo.value,
            left: leftVal,
            right: rightVal,
            direction: lastUnitDirection,
          },
        }),
      });
  
      if (!historyPanel.classList.contains("isHidden")) loadHistory();
    } catch {
      // ігноруємо
    }
  }, 1400);

function convertTemp(v, from, to) {
  if (from === to) return roundSmart(v);
  let c = v;
  if (from === "F") c = (v - 32) * (5 / 9);
  if (from === "K") c = v - 273.15;

  if (to === "C") return roundSmart(c);
  if (to === "F") return roundSmart(c * (9 / 5) + 32);
  if (to === "K") return roundSmart(c + 273.15);
  return roundSmart(v);
}

function roundSmart(n) {
  if (!Number.isFinite(n)) return "—";
  const abs = Math.abs(n);
  const digits = abs >= 100 ? 2 : abs >= 1 ? 4 : 6;
  return String(Number(n.toFixed(digits)));
}