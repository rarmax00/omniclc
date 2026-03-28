// -------------------------
// Number systems converter
// -------------------------

const baseMsg = $("#baseMsg");

const binInput = $("#bin");
const octInput = $("#oct");
const decInput = $("#dec");
const hexInput = $("#hex");

let baseUpdating = false;

$("#baseClearBtn").addEventListener("click", () => {
    baseUpdating = true;
    binInput.value = "";
    octInput.value = "";
    decInput.value = "";
    hexInput.value = "";
    baseUpdating = false;
  
    setMsg(baseMsg, "");
    decInput.focus();
  });

binInput.addEventListener("input", () => convertFrom("bin"));
octInput.addEventListener("input", () => convertFrom("oct"));
decInput.addEventListener("input", () => convertFrom("dec"));
hexInput.addEventListener("input", () => convertFrom("hex"));

async function convertFrom(type) {
    if (baseUpdating) return;
  
    const value =
      type === "bin" ? binInput.value.trim() :
      type === "oct" ? octInput.value.trim() :
      type === "dec" ? decInput.value.trim() :
      hexInput.value.trim();
  
    if (!value) {
      // очищаємо інші поля, але не те, що редагують
      baseUpdating = true;
      if (type !== "bin") binInput.value = "";
      if (type !== "oct") octInput.value = "";
      if (type !== "dec") decInput.value = "";
      if (type !== "hex") hexInput.value = "";
      baseUpdating = false;
      setMsg(baseMsg, "");
      return;
    }
  
    try {
      baseUpdating = true;
  
      const res = await fetch("/api/convert/bases", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, value }),
      });
  
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Base convert error");
  
      if (type !== "bin") {
        binInput.value = data.bin;
        flashField(binInput);
      }
      if (type !== "oct") {
        octInput.value = data.oct;
        flashField(octInput);
      }
      if (type !== "dec") {
        decInput.value = data.dec;
        flashField(decInput);
      }
      if (type !== "hex") {
        hexInput.value = data.hex;
        flashField(hexInput);
      }
  
      setMsg(baseMsg, "");
      baseUpdating = false;
  
      debouncedBasesHistory(type, value, data);
    } catch (e) {
      baseUpdating = false;
      setMsg(baseMsg, String(e.message || t("msg_error")), "error");
  
      // інші поля чистимо, але поле-джерело лишаємо
      baseUpdating = true;
      if (type !== "bin") binInput.value = "";
      if (type !== "oct") octInput.value = "";
      if (type !== "dec") decInput.value = "";
      if (type !== "hex") hexInput.value = "";
      baseUpdating = false;
    }
  }

  const debouncedBasesHistory = debounce(async (type, value, data) => {
    try {
      await fetch("/api/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            type: "bases",
            input: `${type}: ${value}`,
            output: `bin:${data.bin} oct:${data.oct} dec:${data.dec} hex:${data.hex}`,
            payload: { type, value },
          }),
      });
  
      if (!historyPanel.classList.contains("isHidden")) {
        loadHistory();
      }
    } catch {}
  }, 1400);