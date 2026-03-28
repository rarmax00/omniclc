// -------------------------
// Search (top input)
// -------------------------
const toolSearch = $("#toolSearch");
// 🔥 прибираємо browser history dropdown для пошуку
toolSearch.setAttribute("autocomplete", "off");
toolSearch.setAttribute("autocorrect", "off");
toolSearch.setAttribute("autocapitalize", "off");
toolSearch.setAttribute("spellcheck", "false");

// деякі браузери вперто ігнорять "off", тому робимо унікальне name
toolSearch.setAttribute("name", "toolSearch_" + Math.random().toString(36).slice(2));
const searchHint = $("#searchHint");

const searchExamples = [
  "100 usd",
  "15 km",
  "1010 bin",
  "5(2+3)",
  "100 доларів в гривні",
  "15 км в милях",
  "25 відсотків від 800",
  "2 відсотки від 100",
  "2% від 100",
  "корінь 144",
  "корінь з 144",
  "квадратний корінь 144",
  "sqrt 144",
  "sqrt(144)",
  "квадрат 12",
  "12 у квадраті",
  "2 в степені 8",
  "половина від 20",
  "подвоїти 8",
  "36 цельсія у фаренгейти"
];

function showEmptySearchExamples() {
    searchCursor = -1;
    searchHint.hidden = false;
    searchHint.innerHTML = `
    <div class="searchExamplesTitle">${escapeHtml(t("search_try"))}</div>
    ${searchExamples.map(example => `
        <div class="searchExampleItem" data-example="${escapeHtml(example)}">
          ${escapeHtml(example)}
        </div>
      `).join("")}
    `;
  }

const searchIndex = [
    { key:"calc", nameKey:"nav_calc", terms:["калькулятор","calculator","+","-","*","/"] },
    { key:"currency", nameKey:"nav_currency", terms:["валюта","currency","курс","rate","usd","eur","uah","gbp"] },
    { key:"units", nameKey:"nav_units", terms:["одиниці","units","converter","конвертер","km","kg","mile","миля","маса","довжина","length"] },
    { key:"bases", nameKey:"nav_bases", terms:["bin","hex","oct","dec","двійкова","binary","hexadecimal","number system","системи числення"] },
  ];

  const POPULAR_CURRENCIES = ["UAH", "USD", "EUR", "GBP"];

  const CURRENCY_ALIASES = {
    // гривня
    "грн": "UAH",
    "гривня": "UAH",
    "гривні": "UAH",
    "гривень": "UAH",
    "гривна": "UAH",
    "uah": "UAH",
    "грив": "UAH",
    "гривн": "UAH",
  
    // долар
    "дол": "USD",
    "долар": "USD",
    "долари": "USD",
    "доларів": "USD",
    "доллара": "USD",
    "доллары": "USD",
    "usd": "USD",
    "$": "USD",
    "дола": "USD",
    "долара": "USD",
    "доларах": "USD",
    "бакс": "USD",
  "бакси": "USD",
  "долл": "USD",
  
    // євро
    "євро": "EUR",
    "евро": "EUR",
    "eur": "EUR",
    "€": "EUR",
    "євр": "EUR",
    "єврик": "EUR",
  
    // злотий
    "злотий": "PLN",
    "злоті": "PLN",
    "злотих": "PLN",
    "зл": "PLN",
    "pln": "PLN",
    "злот": "PLN",
    "злоти": "PLN",
  
    // фунт
    "фунт": "GBP",
    "фунти": "GBP",
    "фунтів": "GBP",
    "gbp": "GBP",
    "£": "GBP",
  };

  let searchCursor = -1;
  let searchRunId = 0;

// 🔥 Універсальні підказки одиниць (усі таби)
const unitSuggestions = [
    // length
    { tab:"length", unit:"mm", display:"millimeters", words:["mm","millimeter","millimeters","міліметр","міліметри","міліметрів"] },
    { tab:"length", unit:"cm", display:"centimeters", words:["cm","centimeter","centimeters","сантиметр","сантиметри","сантиметрів"] },
    { tab:"length", unit:"m",  display:"meters",      words:["m","meter","meters","метр","метри","метрів"] },
    { tab:"length", unit:"km", display:"kilometers",  words:["km","kilometer","kilometers","кілометр","кілометри","кілометрів"] },
    { tab:"length", unit:"in", display:"inches",      words:["in","inch","inches","дюйм","дюйми","дюймів"] },
    { tab:"length", unit:"ft", display:"feet",        words:["ft","foot","feet","фут","фути","футів"] },
    { tab:"length", unit:"yd", display:"yards",       words:["yd","yard","yards","ярд","ярди","ярдів"] },
    { tab:"length", unit:"mi", display:"miles",       words:["mi","mile","miles","миля","милі","миль"] },
  
    // mass
    { tab:"mass", unit:"g",  display:"grams",      words:["g","gram","grams","грам","грами","грамів"] },
    { tab:"mass", unit:"kg", display:"kilograms",  words:["kg","kilogram","kilograms","кілограм","кілограмів","кіло"] },
    { tab:"mass", unit:"oz", display:"ounces",     words:["oz","ounce","ounces","унція","унції","унцій"] },
    { tab:"mass", unit:"lb", display:"pounds",     words:["lb","pound","pounds","фунт","фунти","фунтів"] },
    { tab:"mass", unit:"t",  display:"tonnes",     words:["t","ton","tons","tonne","тонна","тонни","тонн"] },
  
    // volume
    { tab:"volume", unit:"ml",  display:"milliliters", words:["ml","milliliter","milliliters","мілілітр","мілілітри","мілілітрів"] },
    { tab:"volume", unit:"l",   display:"liters",      words:["l","liter","liters","літр","літри","літрів"] },
    { tab:"volume", unit:"m3",  display:"cubic meters",words:["m3","cubicmeter","cubicmeters","кубометр","кубометри","кубометрів"] },
    { tab:"volume", unit:"gal", display:"gallons",     words:["gal","gallon","gallons","галон","галони","галонів"] },
  
    // area
    { tab:"area", unit:"m2",   display:"square meters", words:["m2","sqm","squaremeter","squaremeters","м2","квм","кв.метр","квметр"] },
    { tab:"area", unit:"km2",  display:"square kilometers", words:["km2","sqkm","км2","квкм","кв.км"] },
    { tab:"area", unit:"ft2",  display:"square feet",   words:["ft2","sqft","кв.фут","квфут"] },
    { tab:"area", unit:"acre", display:"acres",         words:["acre","acres","акр","акри","акрів"] },
    { tab:"area", unit:"ha",   display:"hectares",      words:["ha","hectare","hectares","гектар","гектари","гектарів"] },
  
    // temp
    { tab:"temp", unit:"C", display:"Celsius",    words:["c","°c","celsius","цельсій","цельсія"] },
    { tab:"temp", unit:"F", display:"Fahrenheit", words:["f","°f","fahrenheit","фаренгейт"] },
    { tab:"temp", unit:"K", display:"Kelvin",     words:["k","kelvin","кельвін"] },
  ];

    let currenciesCache = null;

    async function getCurrenciesForSearch() {
    if (currenciesCache) return currenciesCache;
    try {
        const res = await fetch("/api/currencies");
        const data = await res.json();
        currenciesCache = Object.keys(data.data || {});
    } catch {
        currenciesCache = [];
    }
    return currenciesCache;
    }

    function resolveUnitToken(token) {
        const raw = String(token || "").trim().toLowerCase();
        if (!raw) return null;
      
        // 1) exact match by unit code
        const exactCode = unitSuggestions.find(u => u.unit.toLowerCase() === raw);
        if (exactCode) return exactCode;
      
        // 2) exact match by words
        const exactWord = unitSuggestions.find(u =>
          u.words.some(w => w.toLowerCase() === raw)
        );
        if (exactWord) return exactWord;
      
        // 3) unique prefix match
        const matches = unitSuggestions.filter(u =>
          u.unit.toLowerCase().startsWith(raw) ||
          u.words.some(w => w.toLowerCase().startsWith(raw))
        );
      
        if (matches.length === 1) return matches[0];
      
        return null;
      }

      function normalizeNaturalMathQuery(input) {
        let s = String(input || "")
          .trim()
          .toLowerCase()
          .replace(/,/g, ".")
          .replace(/\s+/g, " ");
      
        if (!s) return "";
      
        // прибираємо вступні фрази
        s = s
          .replace(/^скільки буде\s+/i, "")
          .replace(/^скільки\s+/i, "")
          .replace(/^обчисли\s+/i, "")
          .replace(/^порахуй\s+/i, "")
          .replace(/^підрахуй\s+/i, "")
          .replace(/^calculate\s+/i, "")
          .replace(/^what is\s+/i, "")
          .replace(/^find\s+/i, "")
          .replace(/^please\s+/i, "")
          .replace(/^будь ласка\s+/i, "")
          .replace(/\s+please$/i, "")
          .replace(/\s+будь ласка$/i, "")
          .replace(/\?+$/g, "");
      
        // =========================
        // КОРЕНІ — максимально широко
        // =========================
        s = s
          // українські
          .replace(/квадратний\s+корін(?:ь|я)\s*(?:з|із|iз)?\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "sqrt($1)")
          .replace(/кв\.?\s*корін(?:ь|я)\s*(?:з|із|iз)?\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "sqrt($1)")
          .replace(/корін(?:ь|я)\s*(?:з|із|iз)?\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "sqrt($1)")
      
          // англійські
          .replace(/square\s+root\s*(?:of)?\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "sqrt($1)")
          .replace(/sqrt\s*(?:of)?\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "sqrt($1)");
      
        // =========================
        // СТЕПЕНІ / КВАДРАТ / КУБ
        // =========================
        s = s
          .replace(/квадрат\s+числа\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "($1)^2")
          .replace(/квадрат\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "($1)^2")
          .replace(/\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s+у\s+квадраті/gi, "($1)^2")
          .replace(/\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s+в\s+квадраті/gi, "($1)^2")
          .replace(/square\s+of\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "($1)^2")
      
          .replace(/куб\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "($1)^3")
          .replace(/\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s+у\s+кубі/gi, "($1)^3")
          .replace(/\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s+в\s+кубі/gi, "($1)^3")
          .replace(/cube\s+of\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "($1)^3")
      
          .replace(/\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s+в\s+степені\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "($1)^($2)")
          .replace(/\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s+у\s+степені\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "($1)^($2)")
          .replace(/\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s+степін(?:ь|я)\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "($1)^($2)")
          .replace(/\(?\s*(-?\d+(?:\.\d+)?)\s*\)?\s+to the power of\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "($1)^($2)");
      
        // =========================
        // ВІДСОТКИ — багато форм
        // =========================
        s = s
          .replace(/(\d+(?:\.\d+)?)\s*відсот(?:ок|ки|ків)\s*(?:від)?\s*(-?\d+(?:\.\d+)?)/gi, "($1/100)*$2")
          .replace(/(\d+(?:\.\d+)?)\s*процент(?:и|ів)?\s*(?:від)?\s*(-?\d+(?:\.\d+)?)/gi, "($1/100)*$2")
          .replace(/(\d+(?:\.\d+)?)\s*percent\s*of\s*(-?\d+(?:\.\d+)?)/gi, "($1/100)*$2")
          .replace(/(\d+(?:\.\d+)?)\s*%\s*(?:of|від)?\s*(-?\d+(?:\.\d+)?)/gi, "($1/100)*$2");
      
        // =========================
        // ПОБУТОВІ ФРАЗИ
        // =========================
        s = s
          .replace(/половина\s+(?:від)?\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "($1/2)")
          .replace(/half\s+of\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "($1/2)")
          .replace(/подвоїти\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "($1*2)")
          .replace(/double\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "($1*2)")
          .replace(/потроїти\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "($1*3)")
          .replace(/triple\s*\(?\s*(-?\d+(?:\.\d+)?)\s*\)?/gi, "($1*3)");
      
        // =========================
        // АРИФМЕТИЧНІ СЛОВА
        // =========================
        s = s
          // плюс
          .replace(/\bплюс\b/gi, " + ")
          .replace(/\bдодати\b/gi, " + ")
          .replace(/\bplus\b/gi, " + ")
          .replace(/\badd\b/gi, " + ")
      
          // мінус
          .replace(/\bмінус\b/gi, " - ")
          .replace(/\bвідняти\b/gi, " - ")
          .replace(/\bminus\b/gi, " - ")
          .replace(/\bsubtract\b/gi, " - ")
      
          // множення
          .replace(/\bпомножити\s+на\b/gi, " * ")
          .replace(/\bпомножити\b/gi, " * ")
          .replace(/\bмножити\s+на\b/gi, " * ")
          .replace(/\bмножити\b/gi, " * ")
          .replace(/\bрази\b/gi, " * ")
          .replace(/\bразів\b/gi, " * ")
          .replace(/\bраз\b/gi, " * ")
          .replace(/\btimes\b/gi, " * ")
          .replace(/\bmultiplied by\b/gi, " * ")
          .replace(/\bmultiply by\b/gi, " * ")
      
          // ділення
          .replace(/\bподілити\s+на\b/gi, " / ")
          .replace(/\bподілити\b/gi, " / ")
          .replace(/\bділити\s+на\b/gi, " / ")
          .replace(/\bділити\b/gi, " / ")
          .replace(/\bdivide by\b/gi, " / ")
          .replace(/\bdivided by\b/gi, " / ")
          .replace(/\bover\b/gi, " / ");
      
        // прибрати зайві службові слова
        s = s
          .replace(/\bце\b/gi, "")
          .replace(/\bдорівнює\b/gi, "")
          .replace(/\bequals?\b/gi, "");
      
        return s.replace(/\s+/g, " ").trim();
      }
      
      function normalizeNaturalSearchQuery(input) {
        let s = String(input || "")
          .trim()
          .toLowerCase()
          .replace(/,/g, ".")
          .replace(/\s+/g, " ");
      
        if (!s) return "";
      
        s = normalizeNaturalMathQuery(s);
      
        s = s
          .replace(/^переведи\s+/i, "")
          .replace(/^конвертуй\s+/i, "")
          .replace(/^convert\s+/i, "")
          .replace(/^сконвертуй\s+/i, "")
          .replace(/^show me\s+/i, "")
          .replace(/^мені треба\s+/i, "")
          .replace(/^хочу\s+/i, "")
          .replace(/^скільки буде\s+/i, "")
          .replace(/^скільки\s+/i, "")
          .replace(/^будь ласка\s+/i, "")
          .replace(/\s+будь ласка$/i, "");
      
        s = s
          .replace(/\bдолари\b/g, " usd")
          .replace(/\bдолар\b/g, " usd")
          .replace(/\bдоларів\b/g, " usd")
          .replace(/\bдол\b/g, " usd")
          .replace(/\bбакс\b/g, " usd")
          .replace(/\bбакси\b/g, " usd")
      
          .replace(/\bгрн\b/g, " uah")
          .replace(/\bгривня\b/g, " uah")
          .replace(/\bгривні\b/g, " uah")
          .replace(/\bгривень\b/g, " uah")
      
          .replace(/\bєвро\b/g, " eur")
          .replace(/\bфунт\b/g, " gbp")
          .replace(/\bфунти\b/g, " gbp")
          .replace(/\bфунтів\b/g, " gbp")
      
          .replace(/\bзлотий\b/g, " pln")
          .replace(/\bзлоті\b/g, " pln")
          .replace(/\bзлотих\b/g, " pln");
      
        s = s
          .replace(/\bкілометри\b/g, " km")
          .replace(/\bкілометр\b/g, " km")
          .replace(/\bкілометрів\b/g, " km")
      
          .replace(/\bметри\b/g, " m")
          .replace(/\bметр\b/g, " m")
          .replace(/\bметрів\b/g, " m")
      
          .replace(/\bмилі\b/g, " mi")
          .replace(/\bмиля\b/g, " mi")
          .replace(/\bмиль\b/g, " mi")
      
          .replace(/\bсантиметри\b/g, " cm")
          .replace(/\bсантиметр\b/g, " cm")
          .replace(/\bсантиметрів\b/g, " cm")
      
          .replace(/\bміліметри\b/g, " mm")
          .replace(/\bміліметр\b/g, " mm")
          .replace(/\bміліметрів\b/g, " mm")
      
          .replace(/\bлітри\b/g, " l")
          .replace(/\bлітр\b/g, " l")
          .replace(/\bлітрів\b/g, " l")
      
          .replace(/\bмілілітри\b/g, " ml")
          .replace(/\bмілілітр\b/g, " ml")
          .replace(/\bмілілітрів\b/g, " ml")
      
          .replace(/\bкілограми\b/g, " kg")
          .replace(/\bкілограм\b/g, " kg")
          .replace(/\bкілограмів\b/g, " kg")
      
          .replace(/\bграми\b/g, " g")
          .replace(/\bграм\b/g, " g")
          .replace(/\bграмів\b/g, " g")
      
          .replace(/\bградусів цельсія\b/g, " c")
          .replace(/\bградуси цельсія\b/g, " c")
          .replace(/\bградус цельсія\b/g, " c")
          .replace(/\bцельсій\b/g, " c")
          .replace(/\bцельсія\b/g, " c")
          .replace(/\bцельсію\b/g, " c")
      
          .replace(/\bградусів фаренгейта\b/g, " f")
          .replace(/\bградуси фаренгейта\b/g, " f")
          .replace(/\bградус фаренгейта\b/g, " f")
          .replace(/\bфаренгейт\b/g, " f")
          .replace(/\bфаренгейти\b/g, " f")
          .replace(/\bфаренгейта\b/g, " f")
      
          .replace(/\bкельвін\b/g, " k")
          .replace(/\bкельвіни\b/g, " k")
          .replace(/\bкельвіна\b/g, " k");
      
        s = s
          .replace(/\s+(у|в|із|з)\s+/g, " to ")
          .replace(/\s+to\s+/g, " to ")
          .replace(/\s*->\s*/g, " to ");
      
        s = s.replace(/\s+/g, " ").trim();
      
        let m = s.match(/^(-?\d+(?:\.\d+)?)\s+([a-z$€£]{1,12})\s+to\s+([a-z$€£]{1,12})/i);
        if (m) return `${m[1]} ${m[2]} to ${m[3]}`;
      
        m = s.match(/^(-?\d+(?:\.\d+)?)\s+([a-z°0-9]{1,12})\s+to\s+([a-z°0-9]{1,12})/i);
        if (m) return `${m[1]} ${m[2]} to ${m[3]}`;
      
        m = s.match(/^([0-9a-f]+)\s+(bin|oct|dec|hex)\s+to\s+(bin|oct|dec|hex)$/i);
        if (m) return `${m[1]} ${m[2]} to ${m[3]}`;
      
        return s;
      }

      function parseNaturalToQuery(raw) {
        const s = String(raw || "").trim().toLowerCase();
        if (!s) return null;
      
        // 100 usd to uah / 15 km to mi / 36 c to f
        let m = s.match(/^(-?\d+(?:\.\d+)?)\s+([a-zа-яіїєґ°0-9$€£]{1,12})\s+to\s+([a-zа-яіїєґ°0-9$€£]{1,12})$/i);
        if (m) {
          return {
            amount: parseNumberLoose(m[1]),
            fromToken: m[2],
            toToken: m[3],
          };
        }
      
        // 1010 bin to dec
        m = s.match(/^([0-9a-f]+)\s+(bin|oct|dec|hex)\s+to\s+(bin|oct|dec|hex)$/i);
        if (m) {
          return {
            baseValue: m[1],
            fromBase: m[2].toLowerCase(),
            toBase: m[3].toLowerCase(),
          };
        }
      
        return null;
      }

      toolSearch.addEventListener("input", async () => {
        searchCursor = -1;
        const currentSearchRun = ++searchRunId;
      
        const originalRaw = toolSearch.value.trim();
        if (!originalRaw) {
          showEmptySearchExamples();
          return;
        }
      
        const raw = normalizeNaturalSearchQuery(originalRaw);
        const q = raw.toLowerCase();
        const parsedNaturalTo = parseNaturalToQuery(raw);

                // --- EXPLICIT "to" QUERIES FIRST ---
        const TO_SEP_REGEX = "(?:to|в|у|->|-)";
        // examples:
        // 15 km to mi
        // 100 usd to uah
        // 36 c to f
        // 1010 bin to dec
        {
          // 1) bases: 1010 bin to dec
          if (parsedNaturalTo?.baseValue && parsedNaturalTo?.fromBase && parsedNaturalTo?.toBase) {
            const value = parsedNaturalTo.baseValue;
            const fromType = parsedNaturalTo.fromBase;
            const toType = parsedNaturalTo.toBase;
        
            try {
              const res = await fetch("/api/convert/bases", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type: fromType, value }),
              });
        
              const data = await res.json();
              if (!res.ok) throw new Error(data.error || "Base convert error");
        
              const targetValue =
                toType === "bin" ? data.bin :
                toType === "oct" ? data.oct :
                toType === "dec" ? data.dec :
                data.hex;
        
              searchHint.hidden = false;
              searchHint.innerHTML = `
                <div
                  class="smartResultLine"
                  data-kind="bases"
                  data-type="${fromType}"
                  data-value="${escapeHtml(value)}"
                  data-copy="${escapeHtml(targetValue)}"
                >
                  ${escapeHtml(value)} ${fromType.toUpperCase()} = ${escapeHtml(targetValue)} ${toType.toUpperCase()}
                </div>
              `;
              return;
            } catch {
              searchHint.hidden = true;
              searchHint.innerHTML = "";
              return;
            }
          }
        
          // 2) currency / units: 100 usd to uah / 15 km to mi / 36 c to f
          if (parsedNaturalTo?.amount !== null && parsedNaturalTo?.amount !== undefined) {
            const amount = parsedNaturalTo.amount;
            const fromToken = parsedNaturalTo.fromToken;
            const toToken = parsedNaturalTo.toToken;
        
            // спочатку пробуємо валюту
            const list = await getCurrenciesForSearch();
            if (currentSearchRun !== searchRunId) return;
        
            const fromCode = resolveCurrencyPrefix(fromToken, list);
            const toCode = resolveCurrencyPrefix(toToken, list);
        
            if (amount >= 0 && fromCode && toCode) {
              try {
                const res = await fetch("/api/convert/currency", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ amount, from: fromCode, to: toCode }),
                });
        
                const data = await res.json();
                if (currentSearchRun !== searchRunId) return;
                if (!res.ok) throw new Error(data.error || "FX convert error");
        
                const shown = roundSmart(Number(data.result));
        
                searchHint.hidden = false;
                searchHint.innerHTML = `
                  <div
                    class="smartResultLine"
                    data-kind="currencyPick"
                    data-from="${fromCode}"
                    data-to="${toCode}"
                    data-amount="${amount}"
                    data-copy="${shown}"
                  >
                    ${amount} ${fromCode} = ${shown} ${toCode}
                  </div>
                  <div
                    class="smartAction"
                    data-kind="currencyOpen"
                    data-from="${fromCode}"
                    data-amount="${amount}"
                  >
                    ${escapeHtml(t("hint_go_currency"))} ↵
                  </div>
                `;
                return;
              } catch {
                searchHint.hidden = true;
                searchHint.innerHTML = "";
                return;
              }
            }
        
            // якщо не валюта — пробуємо одиниці
            const fromUnit = resolveUnitToken(fromToken);
            const toUnit = resolveUnitToken(toToken);
        
            if (
              amount !== null &&
              fromUnit &&
              toUnit &&
              fromUnit.tab === toUnit.tab
            ) {
              try {
                const res = await fetch("/api/convert/units", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    tab: fromUnit.tab,
                    amount,
                    from: fromUnit.unit,
                    to: toUnit.unit,
                  }),
                });
        
                const data = await res.json();
                if (currentSearchRun !== searchRunId) return;
                if (!res.ok) throw new Error(data.error || "Unit convert error");
        
                const shown = roundSmart(Number(data.result));
        
                searchHint.hidden = false;
                searchHint.innerHTML = `
                  <div
                    class="smartResultLine"
                    data-kind="unitExplicit"
                    data-tab="${fromUnit.tab}"
                    data-from="${fromUnit.unit}"
                    data-to="${toUnit.unit}"
                    data-number="${amount}"
                    data-copy="${shown}"
                  >
                    ${amount} ${escapeHtml(fromUnit.unit)} = ${shown} ${escapeHtml(toUnit.unit)}
                  </div>
                `;
                return;
              } catch {
                searchHint.hidden = true;
                searchHint.innerHTML = "";
                return;
              }
            }
          }
  
            // 2) currency: 100 usd to uah
            const fxToMatch = raw.match(new RegExp(`^(-?\\d+(?:[.,]\\d+)?)\\s*([a-zа-яіїєґ€$£]{2,12})\\s*${TO_SEP_REGEX}\\s*([a-zа-яіїєґ€$£]{2,12})$`, "i"));
            if (fxToMatch) {
              const amount = parseNumberLoose(fxToMatch[1]);
              const fromRaw = fxToMatch[2].toUpperCase();
              const toRaw = fxToMatch[3].toUpperCase();
  
              if (amount !== null && amount >= 0) {
                const list = await getCurrenciesForSearch();
                if (currentSearchRun !== searchRunId) return;
                
                const fromCode = resolveCurrencyPrefix(fromRaw, list);
                const toCode = resolveCurrencyPrefix(toRaw, list);
                if (!fromCode || !toCode) {
                    searchHint.hidden = true;
                    searchHint.innerHTML = "";
                    return;
                  }
  
                if (fromCode && toCode) {
                  try {
                    const res = await fetch("/api/convert/currency", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ amount, from: fromCode, to: toCode }),
                    });
  
                    const data = await res.json();
                    if (currentSearchRun !== searchRunId) return;
                    if (!res.ok) throw new Error(data.error || "FX convert error");
  
                    const shown = roundSmart(Number(data.result));
  
                    searchHint.hidden = false;
                    searchHint.innerHTML = `
                      <div
                        class="smartResultLine"
                        data-kind="currencyPick"
                        data-from="${fromCode}"
                        data-to="${toCode}"
                        data-amount="${amount}"
                        data-copy="${shown}"
                      >
                        ${amount} ${fromCode} = ${shown} ${toCode}
                      </div>
                      <div
                        class="smartAction"
                        data-kind="currencyOpen"
                        data-from="${fromCode}"
                        data-amount="${amount}"
                      >
                        ${escapeHtml(t("hint_go_currency"))} ↵
                      </div>
                    `;
                    return;
                  } catch {
                    searchHint.hidden = true;
                    searchHint.innerHTML = "";
                    return;
                  }
                }
              }
            }

                      // 2.5) currency shorthand: 100 uah eur / 100 грн дол / 100 usd pln
            const fxShortMatch = raw.match(/^(-?\d+(?:[.,]\d+)?)\s+([a-zа-яіїєґ€$£]{2,12})\s+([a-zа-яіїєґ€$£]{2,12})$/i);
            if (fxShortMatch) {
                const amount = parseNumberLoose(fxShortMatch[1]);
                const fromRaw = fxShortMatch[2];
                const toRaw = fxShortMatch[3];

                if (amount !== null && amount >= 0) {
                const list = await getCurrenciesForSearch();
                if (currentSearchRun !== searchRunId) return;

                const fromCode = resolveCurrencyPrefix(fromRaw, list);
                const toCode = resolveCurrencyPrefix(toRaw, list);

                if (!fromCode || !toCode) {
                    searchHint.hidden = true;
                    searchHint.innerHTML = "";
                    return;
                }

                try {
                    const res = await fetch("/api/convert/currency", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ amount, from: fromCode, to: toCode }),
                    });

                    const data = await res.json();
                    if (currentSearchRun !== searchRunId) return;
                    if (!res.ok) throw new Error(data.error || "FX shorthand convert error");

                    const shown = roundSmart(Number(data.result));

                    searchHint.hidden = false;
                    searchHint.innerHTML = `
                    <div
                        class="smartResultLine"
                        data-kind="currencyPick"
                        data-from="${fromCode}"
                        data-to="${toCode}"
                        data-amount="${amount}"
                        data-copy="${shown}"
                    >
                        ${amount} ${fromCode} = ${shown} ${toCode}
                    </div>
                    <div
                        class="smartAction"
                        data-kind="currencyOpen"
                        data-from="${fromCode}"
                        data-amount="${amount}"
                    >
                        ${escapeHtml(t("hint_go_currency"))} ↵
                    </div>
                    `;
                    return;
                } catch {
                    searchHint.hidden = true;
                    searchHint.innerHTML = "";
                    return;
                }
                }
            }
  
            // 3) units: 15 km to mi / 36 c to f
            const unitToMatch = raw.match(new RegExp(`^(-?\\d+(?:[.,]\\d+)?)\\s*([a-zа-яіїєґ°0-9]+)\\s*${TO_SEP_REGEX}\\s*([a-zа-яіїєґ°0-9]+)$`, "i"));
            if (unitToMatch) {
              const amount = parseNumberLoose(unitToMatch[1]);
              const fromToken = unitToMatch[2];
              const toToken = unitToMatch[3];
  
              const fromUnit = resolveUnitToken(fromToken);
              const toUnit = resolveUnitToken(toToken);
  
              if (
                amount !== null &&
                fromUnit &&
                toUnit &&
                fromUnit.tab === toUnit.tab
              ) {
                try {
                  const res = await fetch("/api/convert/units", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      tab: fromUnit.tab,
                      amount,
                      from: fromUnit.unit,
                      to: toUnit.unit,
                    }),
                  });
  
                  const data = await res.json();
                  if (currentSearchRun !== searchRunId) return;
                  if (!res.ok) throw new Error(data.error || "Unit convert error");
  
                  const shown = roundSmart(Number(data.result));
  
                  searchHint.hidden = false;
                  searchHint.innerHTML = `
                    <div
                      class="smartResultLine"
                      data-kind="unitExplicit"
                      data-tab="${fromUnit.tab}"
                      data-from="${fromUnit.unit}"
                      data-to="${toUnit.unit}"
                      data-number="${amount}"
                      data-copy="${shown}"
                    >
                      ${amount} ${escapeHtml(fromUnit.unit)} = ${shown} ${escapeHtml(toUnit.unit)}
                    </div>
                  `;
                  return;
                } catch {
                  searchHint.hidden = true;
                  searchHint.innerHTML = "";
                  return;
                }
              }
            }
          }

        // --- BASES quick FIRST: "bin 1010" або "1010 bin" або просто "bin" ---
        {
            // просто "bin" / "oct" / "dec" / "hex" → кнопка-переход
            const only = q.match(/^(bin|oct|dec|hex)$/i);
            if (only) {
            const type = only[1].toLowerCase();
            searchHint.hidden = false;
            searchHint.innerHTML = `
                <div data-kind="bases" data-type="${type}" data-value="">
                ${type.toUpperCase()} → ${escapeHtml(t("bases_title"))}
                </div>
            `;
            return;
            }
        
            // "bin 1010" або "1010 bin"
            const m = q.match(/^(?:(bin|oct|dec|hex)\s*([0-9a-f]+)|([0-9a-f]+)\s*(bin|oct|dec|hex))$/i);
            if (m) {
            const type = (m[1] || m[4]).toLowerCase();
            const value = (m[2] || m[3]);
        
            // Можна одразу показати всі системи як превʼю:
            try {
                const res = await fetch("/api/convert/bases", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ type, value }),
                  });
                  
                  const data = await res.json();
                  if (currentSearchRun !== searchRunId) return;
                  if (!res.ok) throw new Error(data.error || "Base error");
        
                const order = ["bin", "oct", "dec", "hex"];

                const mapVal = {
                bin: data.bin,
                oct: data.oct,
                dec: data.dec,
                hex: data.hex,
                };

                // 1) ПЕРШИМ — саме те, що ввели
                const first = `
                <div class="smartResultLine"
                    data-kind="bases"
                    data-type="${type}"
                    data-value="${escapeHtml(value)}">
                    ${escapeHtml(value)} ${type.toUpperCase()}
                </div>
                `;

                // 2) Далі — решта систем (без дубля)
                const rest = order
                .filter(t => t !== type)
                .map(t => `
                    <div data-kind="bases" data-type="${type}" data-value="${escapeHtml(value)}">
                    <b>${t.toUpperCase()}</b>: ${escapeHtml(mapVal[t])}
                    </div>
                `)
                .join("");

                searchHint.hidden = false;
                searchHint.innerHTML = `
                ${first}
                ${rest}
                <div class="tiny">${escapeHtml(t("hint_open_bases"))}</div>
                `;
                return;
            } catch {
                searchHint.hidden = true;
                searchHint.innerHTML = "";
                return;
            }
            }
        }

                // --- Units quick FIRST: число + слово (англ/укр) ---
        // щоб "100 m", "100 kg", "100 mi" не перехоплювались валютою
        {
            const match = q.match(/^(\d+(?:[.,]\d+)?)\s*([a-zа-яіїєґ°]+)$/i);
            if (match) {
            const number = match[1];
            const prefix = match[2].toLowerCase();
        
            const ures = unitSuggestions.filter(u =>
                u.words.some(w => w.toLowerCase().startsWith(prefix))
            );
        
            if (ures.length) {
                searchHint.hidden = false;
                searchHint.innerHTML = ures.slice(0, 8).map(r => `
                    <div data-kind="unit" data-tab="${r.tab}" data-unit="${r.unit}" data-number="${number}">
                        ${number} ${escapeHtml(r.display || r.words[0])}
                    </div>
                  `).join("");
                return;
            }
            }
        }

        // ---- SMART FX PREVIEW (100 usd / 100 us / usd 100 / us 100 / $100 / 100€)
        const FX_POPULAR = ["UAH", "USD", "EUR", "PLN", "GBP"];

        function parseSmartCurrency(rawStr) {
            const s = rawStr.trim();
          
            // 100 usd / 100 us / 100 грн / 100 дол / 100 євро / 100 злотий
            let m = s.match(/^(-?\d+(?:[.,]\d+)?)\s*([a-zа-яіїєґ€$£]{2,12})$/i);
            if (m) return { amount: m[1], codeOrPrefix: normalizeCurrencyToken(m[2]) };
          
            // usd 100 / грн 100 / євро 100
            m = s.match(/^([a-zа-яіїєґ€$£]{2,12})\s*(-?\d+(?:[.,]\d+)?)$/i);
            if (m) return { amount: m[2], codeOrPrefix: normalizeCurrencyToken(m[1]) };
          
            // $100 / €20 / £5
            m = s.match(/^([$€£])\s*(-?\d+(?:[.,]\d+)?)$/);
            if (m) {
              const code = normalizeCurrencyToken(m[1]);
              return { amount: m[2], codeOrPrefix: code };
            }
          
            // 100$ / 20€
            m = s.match(/^(-?\d+(?:[.,]\d+)?)\s*([$€£])$/);
            if (m) {
              const code = normalizeCurrencyToken(m[2]);
              return { amount: m[1], codeOrPrefix: code };
            }
          
            return null;
          }


          function normalizeCurrencyToken(token) {
            const raw = String(token || "").trim().toLowerCase();
            if (!raw) return "";
          
            // 1) exact alias
            if (CURRENCY_ALIASES[raw]) {
              return CURRENCY_ALIASES[raw];
            }
          
            // 2) prefix alias match for кирилиця / довші слова
            // наприклад:
            // дола -> долар / долари / доларів
            // злот -> злотий / злоті / злотих
            // грив -> гривня / гривні / гривень
            // євр -> євро
            if (raw.length >= 3) {
              const aliasMatches = Object.keys(CURRENCY_ALIASES).filter(alias =>
                alias.startsWith(raw)
              );
          
              const uniqueCodes = [...new Set(aliasMatches.map(alias => CURRENCY_ALIASES[alias]))];
          
              if (uniqueCodes.length === 1) {
                return uniqueCodes[0];
              }
            }
          
            // 3) fallback: може це вже код типу usd / eur / uah
            return raw.toUpperCase();
          }

        function resolveCurrencyPrefix(prefix, allCodes) {
        const normalized = normalizeCurrencyToken(prefix);

        // 1) якщо вже повний код і існує — повертаємо його
        if (normalized.length === 3 && allCodes.includes(normalized)) return normalized;

        // 2) якщо префікс надто короткий (1 буква) — не “вгадуємо”
        if (normalized.length < 2) return null;

        // 3) спочатку популярні
        const popular = POPULAR_CURRENCIES
            .filter(c => c.startsWith(normalized) && allCodes.includes(c));
        if (popular.length) return popular[0];

        // 4) потім будь-який збіг
        const any = allCodes.find(c => c.startsWith(normalized));
        return any || null;
        }

        const fxParsed = parseSmartCurrency(raw);

        if (fxParsed) {
        const amountNum = parseNumberLoose(fxParsed.amount);

        // негативні / нечисло — нічого не показуємо
        if (amountNum === null || amountNum < 0) {
            searchHint.hidden = true;
            searchHint.innerHTML = "";
            return;
        }

        const list = await getCurrenciesForSearch();
        if (currentSearchRun !== searchRunId) return;
        
        const fromCode = resolveCurrencyPrefix(fxParsed.codeOrPrefix, list);

        // якщо ще не можемо визначити валюту (наприклад "100 u") — просто ховаємо
        if (!fromCode) {
            searchHint.hidden = true;
            searchHint.innerHTML = "";
            return;
        }

        const tos = FX_POPULAR
            .filter(c => c !== fromCode)
            .filter(c => list.includes(c));

        try {
            const res = await fetch("/api/convert/currency/batch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: amountNum, from: fromCode, tos }),
              });
              
              const data = await res.json();
              if (currentSearchRun !== searchRunId) return;
              if (!res.ok) throw new Error(data.error || "FX batch error");

            const guessedNote = "";

            const lines = tos.map((to) => {
            const r = Number(data.rates?.[to]);
            if (!Number.isFinite(r)) return null;
            const shown = roundSmart(r);
            return `
                <div class="smartResultLine"
                data-kind="currencyPick"
                data-from="${fromCode}"
                data-to="${to}"
                data-amount="${amountNum}"
                data-copy="${shown}">
                ${amountNum} ${fromCode} = ${shown} ${to}
                </div>
            `;
            }).filter(Boolean).join("");

            if (!lines) {
            searchHint.hidden = true;
            searchHint.innerHTML = "";
            return;
            }

            searchHint.hidden = false;
            searchHint.innerHTML = `
            ${guessedNote}
            ${lines}
            <div class="smartAction" data-kind="currencyOpen" data-from="${fromCode}" data-amount="${amountNum}">
                ${escapeHtml(t("hint_go_currency"))} ↵
            </div>
            `;
            return;
        } catch {
            searchHint.hidden = true;
            searchHint.innerHTML = "";
            return;
        }
        }

        // якщо просто "bin" або "hex" — показуємо кнопку і перекидаємо в bases
        if (/^(bin|oct|dec|hex)$/.test(q)) {
        searchHint.hidden = false;
        searchHint.innerHTML = `
            <div data-kind="bases" data-type="${q}" data-value="">
            ${q.toUpperCase()} → ${escapeHtml(t("search_bases_open"))}
            </div>
        `;
        return;
        }

        // ✅ якщо введено просто число (в т.ч. відʼємне) — нічого не показуємо
        if (/^-?\d+(?:[.,]\d+)?$/.test(raw)) {
            searchHint.hidden = true;
            searchHint.innerHTML = "";
            return;
        }
      
        // --- SMART CALC PREVIEW ---
        const rawExpr = raw;
        let normalizedSearchExpr = normalizeCalcInput(normalizeExpr(rawExpr)).trim();

        const looksLikeNaturalMath =
          /^sqrt\(-?\d+(?:\.\d+)?\)$/i.test(rawExpr) ||
          /^sqrt\(-?\d+(?:\.\d+)?\)\s*[\+\-\*\/]\s*-?\d+(?:\.\d+)?$/i.test(rawExpr) ||
          /^sqrt\s*-?\d+(?:\.\d+)?$/i.test(rawExpr) ||
          /^sqrt\s*-?\d+(?:\.\d+)?\s*[\+\-\*\/]\s*-?\d+(?:\.\d+)?$/i.test(rawExpr) ||
          /^\(\d+(?:\.\d+)?\/100\)\*-?\d+(?:\.\d+)?$/i.test(rawExpr) ||
          /\bsqrt\(/i.test(rawExpr) ||
          /\^/.test(rawExpr);

        const looksLikeWordMath =
          /\b(plus|minus|times|multiplied by|divided by|add|subtract)\b/i.test(rawExpr);

        if (looksLikeNaturalMath || looksLikeWordMath) {
          try {
            const calcRes = await fetch("/api/calc", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ expr: rawExpr }),
            });

            const calcData = await calcRes.json();
            if (currentSearchRun !== searchRunId) return;

            if (calcRes.ok && typeof calcData.result !== "undefined") {
              searchHint.hidden = false;
              searchHint.innerHTML = `
                <div class="smartResultLine" data-copy="${escapeHtml(String(calcData.result))}">
                  = ${escapeHtml(String(calcData.result))}
                </div>
                <div class="smartAction" data-action="to-calc" data-expr="${escapeHtml(rawExpr)}">
                  ${escapeHtml(t("hint_go_calc"))} ↵
                </div>
              `;
              return;
            }
          } catch {}
        }

        const looksLikeExpr =
        (
          /[+\-*/()%^]/.test(rawExpr) ||
          /(\d|\))\s*\(/.test(rawExpr) ||
          /\)\s*(\d)/.test(rawExpr)
        ) &&
        /^[0-9+\-*/().%^,\s]+$/.test(rawExpr);

        if (looksLikeExpr) {
          try {
            const calcRes = await fetch("/api/calc", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ expr: rawExpr }),
            });

            const calcData = await calcRes.json();
            if (currentSearchRun !== searchRunId) return;

            if (calcRes.ok && typeof calcData.result !== "undefined") {
              searchHint.hidden = false;
              searchHint.innerHTML = `
                <div class="smartResultLine" data-copy="${escapeHtml(String(calcData.result))}">
                  = ${escapeHtml(String(calcData.result))}
                </div>
                <div class="smartAction" data-action="to-calc" data-expr="${escapeHtml(rawExpr)}">
                  ${escapeHtml(t("hint_go_calc"))} ↵
                </div>
              `;
              return;
            }
          } catch {}
        }
      
        if (looksLikeExpr) {
        const r = tryEvalPreview(normalizedSearchExpr);
        if (r !== null) {
            searchHint.hidden = false;
            searchHint.innerHTML = `
            <div class="smartResultLine" data-copy="${roundSmart(r)}">
                = ${roundSmart(r)}
            </div>
            <div class="smartAction" data-action="to-calc" data-expr="${escapeHtml(normalizedSearchExpr)}">
                ${escapeHtml(t("hint_go_calc"))} ↵
            </div>
            `;
            return;
        }
        }
      
        // --- Currency quick (100 usd / $100 / €20) ---
        const curMatch1 = q.match(/^(\d+(?:[.,]\d+)?)\s*([a-z]{3})$/i);
        const curMatch2 = q.match(/^([$€£])\s*(\d+(?:[.,]\d+)?)$/);
        const curMatch3 = q.match(/^(\d+(?:[.,]\d+)?)\s*([$€£])$/);
      
        let codeCur = null;
        let amountCur = null;
      
        if (curMatch1) {
          amountCur = curMatch1[1];
          codeCur = curMatch1[2].toUpperCase();
        } else if (curMatch2) {
          amountCur = curMatch2[2];
          codeCur = curMatch2[1] === "$" ? "USD" : curMatch2[1] === "€" ? "EUR" : "GBP";
        } else if (curMatch3) {
          amountCur = curMatch3[1];
          codeCur = curMatch3[2] === "$" ? "USD" : curMatch3[2] === "€" ? "EUR" : "GBP";
        }
      
        if (amountCur && codeCur) {
          const list = await getCurrenciesForSearch();
          if (list.includes(codeCur)) {
            searchHint.hidden = false;
            searchHint.innerHTML = `
              <div data-kind="currency" data-code="${codeCur}" data-amount="${amountCur}">
                ${amountCur} ${codeCur} → Конвертер валют
              </div>
            `;
            return;
          }
        } 
      
        // --- стандартний пошук інструментів ---
        const results = searchIndex.filter(it =>
          it.terms.some(t => t.includes(q) || q.includes(t))
        );
      
        if (!results.length) {
          searchHint.hidden = false;
          searchHint.innerHTML = `<div>${escapeHtml(t("search_nothing"))}</div>`;
          return;
        }
      
        searchHint.hidden = false;
        searchHint.innerHTML = results.map(r =>
            `<div data-view="${r.key}">${escapeHtml(t(r.nameKey))}</div>`
          ).join("");
      });

      searchHint.addEventListener("click", (e) => {
        const exampleEl = e.target.closest("[data-example]");
        if (exampleEl) {
          const value = exampleEl.dataset.example || "";
          toolSearch.value = value;
          toolSearch.dispatchEvent(new Event("input"));
          toolSearch.focus();
          return;
        }

        // 1) Клік по unit/currency/bases
        const kindEl = e.target.closest("[data-kind]");
        if (kindEl) {
          const kind = kindEl.dataset.kind;

          if (kind === "unitExplicit") {
            openView("units");

            const tab = kindEl.dataset.tab;
            const from = kindEl.dataset.from;
            const to = kindEl.dataset.to;
            const number = kindEl.dataset.number;

            setUnitTab(tab);

            setTimeout(() => {
              unitFrom.value = from;
              unitTo.value = to;
              unitLeft.value = number;

              updateFavButtonsUI();

              lastUnitDirection = "L2R";
              recalcUnits();
            }, 50);

            hideSearchHint();
            toolSearch.blur();
            return;
          }
      
          if (kind === "unit") {
            openView("units");
      
            const tab = kindEl.dataset.tab;
            const unit = kindEl.dataset.unit;
            const number = kindEl.dataset.number;
      
            setUnitTab(tab);
      
            setTimeout(() => {
              unitFrom.value = unit;
      
              const defaultTo =
                tab === "length" ? "km" :
                tab === "mass" ? "kg" :
                tab === "volume" ? "l" :
                tab === "area" ? "m2" :
                tab === "temp" ? "F" : "km";
      
              unitTo.value = defaultTo;
              unitLeft.value = number;

              updateFavButtonsUI();
      
              lastUnitDirection = "L2R";
              recalcUnits();
            }, 50);
      
            hideSearchHint();
            toolSearch.blur();
            return;
          }
      
          if (kind === "currency") {
            openView("currency");
      
            const code = kindEl.dataset.code;
            const amount = kindEl.dataset.amount;
      
            setTimeout(() => {
              fxFrom.value = code;
              fxLeft.value = amount || ""; // може бути пусто (коли просто "usd")
              lastFxDirection = "L2R";
              if (amount) recalcFx();
            }, 50);
      
            hideSearchHint();
            toolSearch.blur();
            return;
          }

          // ✅ Клік по smart-рядку: "100 USD = ... EUR" (з пошуку)
        if (kind === "currencyPick") {
            openView("currency");
        
            const from = kindEl.dataset.from;
            const to = kindEl.dataset.to;
            const amount = kindEl.dataset.amount;
        
            setTimeout(() => {
            fxFrom.value = from;
            fxTo.value = to;
            fxLeft.value = amount;
            lastFxDirection = "L2R";
            recalcFx();
            }, 50);
        
            hideSearchHint();
            toolSearch.blur();
            return;
        }
        
        // ✅ Клік по кнопці: "Перейти в валюту ↵" (з пошуку)
        if (kind === "currencyOpen") {
            openView("currency");
        
            const from = kindEl.dataset.from;
            const amount = kindEl.dataset.amount;
        
            setTimeout(() => {
            fxFrom.value = from;
            fxLeft.value = amount || "";
            lastFxDirection = "L2R";
            if (amount) recalcFx();
            }, 50); 
        
            hideSearchHint();
            toolSearch.blur();
            return;
        }
      
          if (kind === "bases") {
            openView("bases");
      
            const type = kindEl.dataset.type;
            const value = kindEl.dataset.value || "";
      
            setTimeout(() => {
              if (type === "bin") binInput.value = value;
              if (type === "oct") octInput.value = value;
              if (type === "dec") decInput.value = value;
              if (type === "hex") hexInput.value = value;
      
              // якщо value пустий — просто фокус
              if (value) convertFrom(type);
              if (type === "bin") binInput.focus();
              if (type === "oct") octInput.focus();
              if (type === "dec") decInput.focus();
              if (type === "hex") hexInput.focus();
            }, 50);
      
            hideSearchHint();
            toolSearch.blur();
            return;
          }
        }
      
        // 2) Клік по копіюванню (= ...)
        const copyEl = e.target.closest("[data-copy]");
        if (copyEl) {
          const value = copyEl.dataset.copy;
          navigator.clipboard.writeText(value).catch(() => {});
          showToast(t("msg_copy_ok"), "ok");
          return;
        }
      
        // 3) Клік по “Перейти в калькулятор”
        const actionEl = e.target.closest("[data-action]");
        if (actionEl && actionEl.dataset.action === "to-calc") {
          const expr = actionEl.dataset.expr || "";
          openView("calc");
          calcInput.value = expr;
          setCalcMode("edit");
          updateCalcPreview();
          $("#calcEq").click();
          hideSearchHint();
          toolSearch.blur();
          return;
        }
      
        // 4) звичайний пункт меню (data-view)
        const el = e.target.closest("div[data-view]");
        if (!el) return;
        openView(el.dataset.view);
        hideSearchHint();
        toolSearch.blur();
      });
      
      function getSearchHintItems() {
        return [
          ...searchHint.querySelectorAll("[data-kind], [data-action], [data-example], [data-view]")
        ];
      }
      
      function updateSearchCursorUI(items = getSearchHintItems()) {
        items.forEach((el, idx) => {
          el.classList.toggle("searchHintActive", idx === searchCursor);
        });
      
        if (searchCursor >= 0 && items[searchCursor]) {
          items[searchCursor].scrollIntoView({ block: "nearest" });
        }
      }
      
      function hideSearchHint() {
        searchHint.hidden = true;
        searchHint.innerHTML = "";
        searchCursor = -1;
      }

      toolSearch.addEventListener("focus", () => {
        const value = toolSearch.value.trim();
      
        if (!value) {
          showEmptySearchExamples();
          return;
        }
      
        toolSearch.dispatchEvent(new Event("input"));
      });
      
      toolSearch.addEventListener("blur", () => {
        setTimeout(() => {
          hideSearchHint();
        }, 120);
      });

      toolSearch.addEventListener("keydown", (e) => {
        const items = getSearchHintItems();

        if (e.key === "Escape") {
            e.preventDefault();
            toolSearch.value = "";
            searchCursor = -1;
            showEmptySearchExamples();
            return;
          }
      
        if (e.key === "ArrowDown") {
          if (!items.length) return;
          e.preventDefault();
          searchCursor = Math.min(searchCursor + 1, items.length - 1);
          updateSearchCursorUI(items);
          return;
        }
      
        if (e.key === "ArrowUp") {
          if (!items.length) return;
          e.preventDefault();
          searchCursor = Math.max(searchCursor - 1, 0);
          updateSearchCursorUI(items);
          return;
        }
      
        if (e.key === "Enter") {
          if (searchCursor >= 0 && items[searchCursor]) {
            items[searchCursor].click();
            return;
          }
      
          const rawExpr = toolSearch.value.trim();
          const normalizedSearchExpr = normalizeCalcInput(normalizeExpr(rawExpr)).trim();
      
          const looksLikeExpr =
            (
              /[+\-*/()%]/.test(rawExpr) ||
              /(\d|\))\s*\(/.test(rawExpr) ||
              /\)\s*(\d)/.test(rawExpr)
            ) &&
            /^[0-9+\-*/().%\s,]+$/.test(rawExpr);
      
          if (looksLikeExpr && tryEvalPreview(normalizedSearchExpr) !== null) {
            openView("calc");
            calcInput.value = normalizedSearchExpr;
            setCalcMode("edit");
            updateCalcPreview();
            $("#calcEq").click();
            hideSearchHint();
            toolSearch.blur();
            return;
          }
        }
      });