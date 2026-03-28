import { AppError } from "../utils/errors.js";

export function calculateExpression(rawExpr) {
  const expr = String(rawExpr || "").trim();

  if (!expr) {
    throw new AppError("Empty expression", 400);
  }

  const prepared = prepareExpression(expr);
  const tokens = tokenizeMath(prepared);
  const rpn = toRPN(tokens);
  const result = evalRPN(rpn);

  if (!Number.isFinite(result)) {
    throw new AppError("Invalid calculation result", 400);
  }

  return result;
}

function prepareExpression(expr) {
  let s = expr.replaceAll("×", "*").replaceAll("÷", "/").trim();
  s = s.replace(/(\d+(?:[.,]\d+)?)%/g, "($1/100)");
  s = s.replaceAll(",", ".");

  // implicit multiplication
  // 5(2+3) -> 5*(2+3)
  s = s.replace(/(\d|\))\s*\(/g, "$1*(");

  // (2+3)5 -> (2+3)*5
  s = s.replace(/\)\s*(\d)/g, ")*$1");

  // 2sqrt(9) -> 2*sqrt(9)
  s = s.replace(/(\d|\))\s*sqrt\(/gi, "$1*sqrt(");

  return s;
}

function tokenizeMath(s) {
  const out = [];
  let i = 0;

  while (i < s.length) {
    const ch = s[i];

    if (ch === " ") {
      i++;
      continue;
    }

    if (/[0-9.]/.test(ch)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j])) j++;
      const num = Number(s.slice(i, j));
      if (!Number.isFinite(num)) throw new AppError("Invalid number", 400);
      out.push({ t: "num", v: num });
      i = j;
      continue;
    }

    if (s.slice(i, i + 5).toLowerCase() === "sqrt(") {
      out.push({ t: "func", v: "sqrt" });
      out.push({ t: "op", v: "(" });
      i += 5;
      continue;
    }

    if ("+-*/()".includes(ch)) {
      out.push({ t: "op", v: ch });
      i++;
      continue;
    }

    throw new AppError("Invalid character in expression", 400);
  }

  const fixed = [];
  for (const current of out) {
    const prev = fixed[fixed.length - 1];

    if (
      current.t === "op" &&
      current.v === "-" &&
      (!prev || (prev.t === "op" && prev.v !== ")"))
    ) {
      fixed.push({ t: "num", v: 0 });
      fixed.push(current);
    } else {
      fixed.push(current);
    }
  }

  return fixed;
}

function precedence(op) {
  if (op === "+" || op === "-") return 1;
  if (op === "*" || op === "/") return 2;
  return 0;
}

function toRPN(tokens) {
  const output = [];
  const stack = [];

  for (const token of tokens) {
    if (token.t === "num") {
      output.push(token);
      continue;
    }

    if (token.t === "func") {
      stack.push(token);
      continue;
    }

    const op = token.v;

    if (op === "(") {
      stack.push(token);
      continue;
    }

    if (op === ")") {
      while (stack.length && stack[stack.length - 1].v !== "(") {
        output.push(stack.pop());
      }

      if (!stack.length) {
        throw new AppError("Mismatched parentheses", 400);
      }

      stack.pop();

      if (stack.length && stack[stack.length - 1].t === "func") {
        output.push(stack.pop());
      }

      continue;
    }

    while (stack.length) {
      const top = stack[stack.length - 1];
      if (
        (top.t === "op" && "+-*/".includes(top.v) && precedence(top.v) >= precedence(op)) ||
        top.t === "func"
      ) {
        output.push(stack.pop());
      } else {
        break;
      }
    }

    stack.push(token);
  }

  while (stack.length) {
    const item = stack.pop();
    if (item.v === "(" || item.v === ")") {
      throw new AppError("Mismatched parentheses", 400);
    }
    output.push(item);
  }

  return output;
}

function evalRPN(rpn) {
  const stack = [];

  for (const token of rpn) {
    if (token.t === "num") {
      stack.push(token.v);
      continue;
    }

    if (token.t === "func" && token.v === "sqrt") {
      const a = stack.pop();
      if (!Number.isFinite(a) || a < 0) {
        throw new AppError("Invalid sqrt argument", 400);
      }
      stack.push(Math.sqrt(a));
      continue;
    }

    if (token.t === "op") {
      const b = stack.pop();
      const a = stack.pop();

      if (!Number.isFinite(a) || !Number.isFinite(b)) {
        throw new AppError("Invalid operation", 400);
      }

      if (token.v === "+") stack.push(a + b);
      if (token.v === "-") stack.push(a - b);
      if (token.v === "*") stack.push(a * b);
      if (token.v === "/") stack.push(a / b);

      continue;
    }

    throw new AppError("Invalid RPN token", 400);
  }

  if (stack.length !== 1) {
    throw new AppError("Invalid expression", 400);
  }

  return stack[0];
}