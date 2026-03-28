// -------------------------
// Calculator: кнопки вводять у поле (движок додамо наступним кроком)
// -------------------------
const calcInput = $("#calcInput");
const calcMsg = $("#calcMsg");
const calcPreview = $("#calcPreview");
let calcMode = "edit"; // "edit" або "result"

calcInput.addEventListener("input", () => {
  setCalcMode("edit");
  setMsg(calcMsg, "");
  updateCalcPreview();
});

function insertAtCursor(input, text) {
  input.focus();

  let start = input.selectionStart ?? input.value.length;
  let end = input.selectionEnd ?? input.value.length;

  let before = input.value.slice(0, start);
  let after = input.value.slice(end);

  const prevChar = before.slice(-1);
  const isOperator = ["+", "-", "*", "/"].includes(text);

  // не даємо вставляти оператори підряд
  if (isOperator) {
    if (!before.length && text !== "-") return;
    if (prevChar === "(" && text !== "-") return;

    if (["+", "-", "*", "/"].includes(prevChar)) {
      before = before.slice(0, -1);
      start -= 1;
      end -= 1;
    }
  }
  
  // крапка / кома — тільки одна в межах поточного числа
  if (text === "." || text === ",") {
    const leftPartMatch = before.match(/[0-9.,]+$/);
    const rightPartMatch = after.match(/^[0-9.,]+/);

    const leftPart = leftPartMatch ? leftPartMatch[0] : "";
    const rightPart = rightPartMatch ? rightPartMatch[0] : "";
    const fullPart = leftPart + rightPart;

    // якщо в поточному числі вже є крапка або кома — другу не даємо
    if (fullPart.includes(".") || fullPart.includes(",")) {
      return;
    }

    // якщо число ще не почалось, вставляємо 0.
    if (!leftPart && !rightPart) {
      text = "0.";
    } else {
      text = ".";
    }
  }

  input.value = before + text + after;

  const pos = before.length + text.length;
  input.setSelectionRange(pos, pos);
  input.focus();

  if (input === calcInput) {
    setCalcMode("edit");
    setMsg(calcMsg, "");
    updateCalcPreview();
  }
}

function backspaceSmart(input) {
  input.focus();

  let start = input.selectionStart ?? input.value.length;
  let end = input.selectionEnd ?? input.value.length;

  // якщо є виділення — видаляємо виділене
  if (start !== end) {
    const before = input.value.slice(0, start);
    const after = input.value.slice(end);
    input.value = before + after;
    input.setSelectionRange(start, start);

    if (input === calcInput) {
      setCalcMode("edit");
      setMsg(calcMsg, "");
      updateCalcPreview();
    }
    return;
  }

  if (start === 0) {
    if (input === calcInput) {
      setCalcMode("edit");
      setMsg(calcMsg, "");
      updateCalcPreview();
    }
    return;
  }

  const before = input.value.slice(0, start);
  const after = input.value.slice(end);

  // якщо перед курсором стоїть sqrt( — видаляємо весь блок одразу
  if (before.toLowerCase().endsWith("sqrt(")) {
    input.value = before.slice(0, -5) + after;
    input.setSelectionRange(start - 5, start - 5);

    if (input === calcInput) {
      setCalcMode("edit");
      setMsg(calcMsg, "");
      updateCalcPreview();
    }
    return;
  }

  // звичайне видалення одного символу
  input.value = before.slice(0, -1) + after;
  input.setSelectionRange(start - 1, start - 1);

  if (input === calcInput) {
    setCalcMode("edit");
    setMsg(calcMsg, "");
    updateCalcPreview();
  }
}

function setCalcMode(mode) {
    calcMode = mode;
    if (mode === "result") calcPreview.classList.add("isResult");
    else calcPreview.classList.remove("isResult");
  }
  
  function normalizeExpr(raw) {
    return String(raw || "")
      .replaceAll("×", "*")
      .replaceAll("÷", "/");
  }

  function normalizeCalcInput(raw) {
    let s = String(raw || "").trim();
  
    // 1) неявне множення:
    // 5(2+3) => 5*(2+3)
    s = s.replace(/(\d|\))\s*\(/g, "$1*(");
    // (2+3)4 => (2+3)*4
    s = s.replace(/\)\s*(\d)/g, ")*$1");
  
    // 2) якщо вираз закінчився оператором — дописуємо "правий операнд"
    // + або - -> 0
    s = s.replace(/[+\-]\s*$/g, (m) => m.trim() + "0");
  
    // * або / -> 1 (це найменш "шоковий" варіант)
    s = s.replace(/[*\/]\s*$/g, (m) => m.trim() + "1");
  
    return s;
  }

  function isClearlyInvalidExpr(raw) {
    const s = String(raw || "").trim();
  
    if (!s) return true;
  
    // дозволені символи (цифри, пробіли, кома/крапка, дужки, оператори, %, sqrt)
    // (sqrt ми далі нормально обробляємо, тут просто фільтр)
    if (!/^[0-9+\-*/().%\s,abcdefghijklmnopqrstuvwxyz]*$/i.test(s)) return true;
  
    // 1) не може починатись з * / )
    if (/^[*/)]/.test(s)) return true;
  
    // 2) не може закінчуватись на ( або на оператор (крім випадків які ми самі “долікуємо” в normalizeCalcInput)
    // але preview краще ховати, якщо людина ще друкує:
    if (/[(*\/+\-]\s*$/.test(s)) return true;
  
    // 3) заборона "два оператори підряд", крім:
    //   - унарного мінуса після ( або після іншого оператора
    //   - "+" унарний ми НЕ підтримуємо (щоб не було каші)
    // приклади, які мають бути invalid: "5*/", "5+-*", "*/2"
    const cleaned = s.replace(/\s+/g, "");
    if (/[+\-*/]{2,}/.test(cleaned)) {
      // дозволимо тільки випадки "...* -2" або "...(-2" або ".../ -2"
      // тобто оператор + мінус + число/дужка
      // якщо всередині є щось типу "*/" або "*-" не перед числом — invalid
      // простий (але ефективний) фільтр:
      const okUnaryMinus = cleaned.replace(/([+\-*/(])-/g, "$1~"); // ~ як маркер "унарного -"
      if (/[+\-*/]{2,}/.test(okUnaryMinus.replace(/~/g, ""))) return true;
      // якщо лишились комбінації типу "*/" — теж invalid
      if (/\*[+/]/.test(cleaned) || /\/[+*/]/.test(cleaned) || /\+[*/]/.test(cleaned) || /-[+*/]/.test(cleaned)) {
        return true;
      }
    }
  
    // 4) баланс дужок (без фанатизму — просто не дозволяємо закриття без відкриття і фінальний баланс 0)
    let bal = 0;
    for (const ch of cleaned) {
      if (ch === "(") bal++;
      if (ch === ")") {
        bal--;
        if (bal < 0) return true;
      }
    }
    if (bal !== 0) return true;
  
    return false;
  }
  
  function tryEvalPreview(expr) {
    const s0 = normalizeCalcInput(normalizeExpr(expr)).trim();
    if (!s0) return null;
  
    // підтримка відсотків: 50% => (50/100)
    const s1 = s0.replace(/(\d+(?:[.,]\d+)?)%/g, "($1/100)");
  
    // підтримка коми як десяткового розділювача
    const s = s1.replaceAll(",", ".");
  
    // токенізація
    const tokens = tokenizeMath(s);
    if (!tokens) return null;
  
    // RPN (Shunting Yard)
    const rpn = toRPN(tokens);
    if (!rpn) return null;
  
    // обчислення RPN
    const result = evalRPN(rpn);
    if (!Number.isFinite(result)) return null;
  
    return result;
  }
  
  function tokenizeMath(s) {
    const out = [];
    let i = 0;
  
    while (i < s.length) {
      const ch = s[i];
  
      // пробіли
      if (ch === " ") { i++; continue; }
  
      // числа
      if (/[0-9.]/.test(ch)) {
        let j = i;
        while (j < s.length && /[0-9.]/.test(s[j])) j++;
        const num = Number(s.slice(i, j));
        if (!Number.isFinite(num)) return null;
        out.push({ t: "num", v: num });
        i = j;
        continue;
      }
  
      // sqrt(
      if (s.slice(i, i+5).toLowerCase() === "sqrt(") {
        out.push({ t: "func", v: "sqrt" });
        out.push({ t: "op", v: "(" });
        i += 5;
        continue;
      }
  
      // оператори та дужки
      if ("+-*/()".includes(ch)) {
        out.push({ t: "op", v: ch });
        i++;
        continue;
      }
  
      return null;
    }
  
    // обробка унарного мінуса (наприклад: -2 або 5*-2)
    const fixed = [];
    for (let k = 0; k < out.length; k++) {
      const cur = out[k];
      const prev = fixed[fixed.length - 1];
  
      if (cur.t === "op" && cur.v === "-" && (!prev || (prev.t === "op" && prev.v !== ")"))) {
        // унарний мінус => додаємо 0 перед ним
        fixed.push({ t: "num", v: 0 });
        fixed.push(cur);
        continue;
      }
      fixed.push(cur);
    }
  
    return fixed;
  }
  
  function prec(op) {
    if (op === "+" || op === "-") return 1;
    if (op === "*" || op === "/") return 2;
    return 0;
  }
  
  function toRPN(tokens) {
    const out = [];
    const stack = [];
  
    for (const tok of tokens) {
      if (tok.t === "num") {
        out.push(tok);
        continue;
      }
  
      if (tok.t === "func") {
        stack.push(tok);
        continue;
      }
  
      if (tok.t === "op") {
        const op = tok.v;
  
        if (op === "(") {
          stack.push(tok);
          continue;
        }
  
        if (op === ")") {
          while (stack.length && stack[stack.length - 1].v !== "(") {
            out.push(stack.pop());
          }
          if (!stack.length) return null; // немає відкриваючої дужки
          stack.pop(); // прибрати "("
  
          // якщо перед дужками була функція sqrt
          if (stack.length && stack[stack.length - 1].t === "func") {
            out.push(stack.pop());
          }
          continue;
        }
  
        // звичайний оператор
        while (stack.length) {
          const top = stack[stack.length - 1];
          if ((top.t === "op" && "+-*/".includes(top.v) && prec(top.v) >= prec(op)) || top.t === "func") {
            out.push(stack.pop());
          } else break;
        }
        stack.push(tok);
        continue;
      }
  
      return null;
    }
  
    while (stack.length) {
      const x = stack.pop();
      if (x.v === "(" || x.v === ")") return null;
      out.push(x);
    }
  
    return out;
  }
  
  function evalRPN(rpn) {
    const st = [];
  
    for (const tok of rpn) {
      if (tok.t === "num") {
        st.push(tok.v);
        continue;
      }
  
      if (tok.t === "func" && tok.v === "sqrt") {
        const a = st.pop();
        if (!Number.isFinite(a) || a < 0) return NaN;
        st.push(Math.sqrt(a));
        continue;
      }
  
      if (tok.t === "op") {
        const b = st.pop();
        const a = st.pop();
        if (!Number.isFinite(a) || !Number.isFinite(b)) return NaN;
  
        if (tok.v === "+") st.push(a + b);
        if (tok.v === "-") st.push(a - b);
        if (tok.v === "*") st.push(a * b);
        if (tok.v === "/") st.push(a / b);
        continue;
      }
  
      return NaN;
    }
  
    return st.length === 1 ? st[0] : NaN;
  }
  
  function updateCalcPreview() {
    if (calcMode === "result") return;
  
    const expr = calcInput.value;
  
    // ✅ якщо вираз явно битий — не показуємо нічого
    if (isClearlyInvalidExpr(expr)) {
      calcPreview.textContent = "—";
      return;
    }
  
    const r = tryEvalPreview(expr);
    if (r === null) {
      calcPreview.textContent = "—";
      return;
    }
    calcPreview.textContent = String(roundSmart(r));
  }

  $$(".calcGrid .cbtn").forEach((btn) => {
    btn.addEventListener("mousedown", (e) => {
      e.preventDefault();
    });
  
    btn.addEventListener("click", () => {
      const k = btn.dataset.k;
      if (k === undefined) return;
  
      if (k === "AC") {
        calcInput.value = "";
        calcPreview.textContent = "—";
        setCalcMode("edit");
        setMsg(calcMsg, "");
        calcInput.focus();
        return;
      }
  
      if (k === "⌫") {
        backspaceSmart(calcInput);
        return;
      }
  
      if (k === "sqrt") {
        insertAtCursor(calcInput, "sqrt(");
        return;
      }
  
      if (k === "%") {
        insertAtCursor(calcInput, "%");
        return;
      }
  
      insertAtCursor(calcInput, k);
    });
  });

  async function runCalcEquals() {
    const v = normalizeCalcInput(calcInput.value);
    if (!v) {
      setMsg(calcMsg, t("msg_calc_enter_expr"), "error");
      return;
    }
  
    try {
      const res = await fetch("/api/calc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expr: v }),
      });
  
      const data = await res.json();
      if (data.ok) {
        calcPreview.textContent = String(data.result);
      
        if (data.usedAi && data.parsedExpression) {
          setMsg(calcMsg, `AI: ${data.parsedExpression}`);
        } else {
          setMsg(calcMsg, "");
        }
      
        setCalcMode("result");
      }
      if (!res.ok) throw new Error(data.error || "Calc error");
  
      calcPreview.textContent = String(roundSmart(Number(data.result)));
      setCalcMode("result"); // це і робить шрифт більшим
      setMsg(calcMsg, "", "muted");
      loadHistory();
    } catch {
      calcPreview.textContent = "—";
      setCalcMode("edit");
      setMsg(calcMsg, t("msg_calc_error"), "error");
    }
  }
  
  $("#calcEq").addEventListener("click", runCalcEquals);

  calcInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      runCalcEquals();
      return;
    }
  
    if (e.key === "Backspace") {
      const start = calcInput.selectionStart ?? 0;
      const end = calcInput.selectionEnd ?? 0;
  
      if (start === end) {
        const before = calcInput.value.slice(0, start);
  
        if (before.toLowerCase().endsWith("sqrt(")) {
          e.preventDefault();
          backspaceSmart(calcInput);
          return;
        }
      }
    }
  
    if (e.key === "." || e.key === ",") {
      const start = calcInput.selectionStart ?? 0;
      const end = calcInput.selectionEnd ?? 0;
      const value = calcInput.value;
  
      const part = getCurrentNumberPart(value, start, end);
      const selected = value.slice(start, end);
      const partWithoutSelected = (part.text || "").replace(selected, "");
  
      if (partWithoutSelected.includes(".") || partWithoutSelected.includes(",")) {
        e.preventDefault();
      }
    }
  });

  calcPreview.addEventListener("click", () => {
    const value = calcPreview.textContent.replace("=", "").trim();
  
    if (!value || value === "—") return;
  
    navigator.clipboard.writeText(value).catch(()=>{});
    showToast(t("msg_copy_ok"), "ok");
  });

  setCalcMode("edit");
  updateCalcPreview();