function normalizeText(input) {
    return String(input || "")
      .toLowerCase()
      .trim()
      .replace(/,/g, ".")
      .replace(/\s+/g, " ");
  }
  
  function wordsToExpression(text) {
    let expr = text;
  
    // вступні слова
    expr = expr
      .replace(/^what is\s+/g, "")
      .replace(/^calculate\s+/g, "")
      .replace(/^find\s+/g, "")
      .replace(/^скільки буде\s+/g, "")
      .replace(/^скільки\s+/g, "")
      .replace(/^обчисли\s+/g, "")
      .replace(/^порахуй\s+/g, "")
      .replace(/^підрахуй\s+/g, "")
      .replace(/^будь ласка\s+/g, "")
      .replace(/^please\s+/g, "")
      .replace(/\?+$/g, "")
      .replace(/\bequals?\b/g, "")
      .replace(/\bдорівнює\b/g, "");
  
    // корені
    expr = expr
      .replace(/квадратний\s+корін(?:ь|я)\s*(?:з|із|iз)?\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "sqrt($1)")
      .replace(/кв\.?\s*корін(?:ь|я)\s*(?:з|із|iз)?\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "sqrt($1)")
      .replace(/корін(?:ь|я)\s*(?:з|із|iз)?\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "sqrt($1)")
      .replace(/square\s+root\s*(?:of)?\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "sqrt($1)")
      .replace(/sqrt\s*(?:of)?\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "sqrt($1)");
  
    // квадрати / куби / степені
    expr = expr
      .replace(/квадрат\s+числа\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "($1)^2")
      .replace(/квадрат\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "($1)^2")
      .replace(/\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s+у\s+квадраті/g, "($1)^2")
      .replace(/\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s+в\s+квадраті/g, "($1)^2")
      .replace(/square\s+of\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "($1)^2")
  
      .replace(/куб\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "($1)^3")
      .replace(/\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s+у\s+кубі/g, "($1)^3")
      .replace(/\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s+в\s+кубі/g, "($1)^3")
      .replace(/cube\s+of\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "($1)^3")
  
      .replace(/\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s+в\s+степені\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "($1)^($2)")
      .replace(/\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s+у\s+степені\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "($1)^($2)")
      .replace(/\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s+степін(?:ь|я)\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "($1)^($2)")
      .replace(/\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s+to the power of\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "($1)^($2)");
  
    // відсотки
    expr = expr
      .replace(/(\d+(?:\.\d+)?)\s*відсот(?:ок|ки|ків)\s*(?:від)?\s*(-?\d+(?:\.\d+)?)/g, "($1/100)*$2")
      .replace(/(\d+(?:\.\d+)?)\s*процент(?:и|ів)?\s*(?:від)?\s*(-?\d+(?:\.\d+)?)/g, "($1/100)*$2")
      .replace(/(\d+(?:\.\d+)?)\s*percent\s*of\s*(-?\d+(?:\.\d+)?)/g, "($1/100)*$2")
      .replace(/(\d+(?:\.\d+)?)\s*%\s*(?:of|від)?\s*(-?\d+(?:\.\d+)?)/g, "($1/100)*$2");
  
    // побутові фрази
    expr = expr
      .replace(/половина\s+(?:від)?\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "($1/2)")
      .replace(/half\s+of\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "($1/2)")
      .replace(/подвоїти\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "($1*2)")
      .replace(/double\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "($1*2)")
      .replace(/потроїти\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "($1*3)")
      .replace(/triple\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/g, "($1*3)");
  
    // арифметичні слова
    expr = expr
      .replace(/\bплюс\b/g, " + ")
      .replace(/\bдодати\b/g, " + ")
      .replace(/\bplus\b/g, " + ")
      .replace(/\badd\b/g, " + ")
  
      .replace(/\bмінус\b/g, " - ")
      .replace(/\bвідняти\b/g, " - ")
      .replace(/\bminus\b/g, " - ")
      .replace(/\bsubtract\b/g, " - ")
  
      .replace(/\bпомножити\s+на\b/g, " * ")
      .replace(/\bпомножити\b/g, " * ")
      .replace(/\bмножити\s+на\b/g, " * ")
      .replace(/\bмножити\b/g, " * ")
      .replace(/\bрази\b/g, " * ")
      .replace(/\bразів\b/g, " * ")
      .replace(/\bраз\b/g, " * ")
      .replace(/\btimes\b/g, " * ")
      .replace(/\bmultiplied by\b/g, " * ")
      .replace(/\bmultiply by\b/g, " * ")
  
      .replace(/\bподілити\s+на\b/g, " / ")
      .replace(/\bподілити\b/g, " / ")
      .replace(/\bділити\s+на\b/g, " / ")
      .replace(/\bділити\b/g, " / ")
      .replace(/\bdivide by\b/g, " / ")
      .replace(/\bdivided by\b/g, " / ")
      .replace(/\bover\b/g, " / ");
  
    return expr.replace(/\s+/g, " ").trim();
  }
  
  export async function convertNaturalLanguageToExpression(rawText) {
    const text = normalizeText(rawText);
  
    if (!text) {
      throw new Error("Empty AI input");
    }
  
    const expr = wordsToExpression(text);
  
    if (!expr) {
      throw new Error("AI could not understand the calculation");
    }
  
    if (!/^[0-9+\-*/().%\s_a-z^]+$/i.test(expr)) {
      throw new Error("Unsupported symbols in AI expression");
    }
  
    return expr;
  }