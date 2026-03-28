// public/i18n.js
(function () {
  const I18N = {
    ua: {
      // common
      app_title: "OmniCalc",
      subtitle: "Калькулятор + конвертери",
      theme_title: "Тема",
      theme_aria: "Перемикач теми",
      searchPlaceholder: "Пошук: 100 usd, 15 km, 1010 bin…",
      label_from: "З",
      label_to: "В",
      swap_title: "Поміняти місцями",
      common_example_number: "Напр. 10",
      common_example_money: "Напр. 100",
      common_result: "Результат",
      clear_fields: "Очистити поля",
      close: "Закрити",
      copy: "Копія",
      repeat: "Повтор",
      save_txt: "Зберегти .txt",
      copy_history: "Скопіювати історію",
      converter: "Конвертер",

      // nav
      nav_calc: "🧮 Калькулятор",
      nav_units: "📏 Конвертер одиниць",
      nav_currency: "💰 Валюта",
      nav_bases: "🔢 Системи числення",
      nav_history: "Історія ⌄",

      // calc
      calc_title: "Калькулятор",
      calc_placeholder: "Наприклад: (2+3)*4",
      calc_preview_title: "Клікни по результату, щоб скопіювати",
      msg_calc_enter_expr: "Введи вираз",
      msg_calc_error: "Помилка у виразі",

      // units
      units_title: "Конвертер одиниць",
      unitTab_length: "Довжина",
      unitTab_mass: "Маса",
      unitTab_volume: "Обʼєм",
      unitTab_area: "Площа",
      unitTab_temp: "Температура",
      unit_center_length: "Довжина",
      unit_center_mass: "Маса",
      unit_center_volume: "Обʼєм",
      unit_center_area: "Площа",
      unit_center_temp: "Температура",

      // currency
      currency_title: "Конвертер валют",
      currency_center: "Валюта",
      fx_refresh: "Оновити список валют",
      fx_source: "Джерело",
      fx_rate_date: "Дата курсу",
      fx_updated: "Оновлено",

      // bases
      bases_title: "Системи числення",

      // history
      history_title: "Останні операції",
      history_refresh: "Оновити",
      history_clear: "Очистити",
      history_loading: "Завантаження…",
      history_empty: "Поки порожньо…",
      history_empty_export: "Історія порожня.",
      history_filter_aria: "Фільтр історії",
      history_filter_all: "Усі",
      history_copied_ok: "Історію скопійовано ✔",
      history_copy_error: "Не вдалося скопіювати історію",
      history_saved_ok: "Файл історії збережено ✔",

      // favorites
      fav_in: "В улюблених",
      fav_add: "Додати в улюблені",

      // search
      search_try: "Спробуй так:",
      search_nothing: "Нічого не знайдено",
      hint_open_bases: "Натисни щоб відкрити “Системи числення”",
      hint_go_currency: "Перейти в валюту",
      hint_go_calc: "Перейти в калькулятор",
      search_bases_open: "Системи числення",

      // messages
      msg_loading_currencies: "Завантажую валюти…",
      msg_ready: "Готово",
      msg_convert: "Конвертую…",
      msg_enter_number: "Введи число",
      msg_same_currency: "Однакові валюти 🙂",
      msg_fx_error: "Помилка конвертації. Перевір інтернет/сервер.",
      msg_units_error: "Помилка конвертації",
      msg_history_load_error: "Не вдалося завантажити історію",
      msg_copy_ok: "Скопійовано ✔",
      msg_error: "Помилка",

      // footer
      footer_guide: "Міні-довідник (як вводити)",
      footer_about: "Про автора",

      // about page
      about_page_title: "OmniCalc — Про автора",
      about_subtitle: "Про автора",
      back: "← Назад",
      about_back_subtitle: "Коротко про автора",
      about_h1: "Про автора",
      about_author_label: "Автор:",
      about_city_label: "Місто:",
      about_project_label: "Проєкт:",
      about_purpose_label: "Призначення:",
      about_author_value: "Максим",
      about_city_value: "Львів",
      about_project_value: "OmniCalc",
      about_purpose_value: "навчальний проєкт з вебпрограмування",
      about_contacts_hint: "Контакт: @note961",

      // guide page
      guide_page_title: "OmniCalc — Міні-довідник",
      guide_subtitle: "Міні-довідник",
      guide_back_subtitle: "Як користуватися",
      guide_h1: "Про програму",
      guide_intro: "Натисни на пункт — внизу з’явиться пояснення.",
      guide_menu_smart: "Розумний пошук",
      guide_menu_calc: "Калькулятор",
      guide_menu_units: "Конвертер одиниць",
      guide_menu_currency: "Конвертер валют",
      guide_menu_bases: "Системи числення",
      guide_menu_history: "Історія та “Повтор”",
      guide_hotkeys: "⌨️ Гарячі клавіші",
      guide_hotkey_open_search: "відкрити пошук",
      guide_hotkey_clear_search: "очистити пошук",
      guide_hotkey_pick_hint: "вибір підказки",
      guide_hotkey_go: "перейти / виконати",

      guide_smart_title: "Розумний пошук",
      guide_smart_body: `
        <ul>
          <li><b>Валюта:</b> <code>100 usd</code>, <code>250 eur</code></li>
          <li><b>Одиниці:</b> <code>15 km</code>, <code>300 mm</code>, <code>2.5 kg</code></li>
          <li><b>Системи числення:</b> <code>1010 bin</code>, <code>2A hex</code>, <code>52 oct</code>, <code>42 dec</code></li>
          <li><b>Калькулятор:</b> <code>5(2+3)</code>, <code>(2+3)*4</code>, <code>sqrt(9)+1</code></li>
        </ul>
        <p class="muted">Порада: краще робити пробіл між числом і позначенням: <code>100 usd</code>, <code>15 km</code>, <code>1010 bin</code>.</p>
      `,
      guide_calc_title: "Калькулятор",
      guide_calc_body: `
        <ul>
          <li>Можна вводити приклад вручну або натискати кнопки.</li>
          <li>Підтримка: <code>+</code> <code>-</code> <code>*</code> <code>/</code>, дужки, <code>%</code>, <code>√</code>.</li>
          <li>Приклади: <code>12/3</code>, <code>(2+3)*7</code>, <code>sqrt(16)+1</code>.</li>
        </ul>
      `,
      guide_units_title: "Конвертер одиниць",
      guide_units_body: `
        <ul>
          <li>Вибери вкладку (довжина/маса/обʼєм/площа/температура).</li>
          <li>Зліва вводиш значення — справа результат.</li>
          <li>Кнопка <b>↔</b> міняє одиниці місцями.</li>
        </ul>
      `,
      guide_currency_title: "Конвертер валют",
      guide_currency_body: `
        <ul>
          <li>Введи суму зліва і вибери <b>з якої</b> та <b>в яку</b> валюту.</li>
          <li>Кнопка <b>↔</b> міняє валюти місцями.</li>
          <li>Якщо є кнопка оновлення валют — можна підтягнути актуальний список.</li>
        </ul>
      `,
      guide_bases_title: "Системи числення",
      guide_bases_body: `
        <ul>
          <li>Вводь число в будь-яке поле (BIN/OCT/DEC/HEX) — інші порахуються автоматично.</li>
          <li>HEX вводиться літерами A–F (без <code>0x</code>).</li>
        </ul>
      `,
      guide_history_title: "Історія та “Повтор”",
      guide_history_body: `
        <ul>
          <li>Історія зберігає останні операції.</li>
          <li><b>Повтор</b> відкриває потрібний модуль і підставляє значення як були.</li>
          <li><b>Копія</b> копіює результат у буфер обміну.</li>
          <li>Фільтри показують тільки потрібний тип (валюта/калькулятор/тощо).</li>
        </ul>
      `
    },

    en: {
      // common
      app_title: "OmniCalc",
      subtitle: "Calculator + converters",
      theme_title: "Theme",
      theme_aria: "Toggle theme",
      searchPlaceholder: "Search: 100 usd, 15 km, 1010 bin…",
      label_from: "From",
      label_to: "To",
      swap_title: "Swap",
      common_example_number: "e.g. 10",
      common_example_money: "e.g. 100",
      common_result: "Result",
      clear_fields: "Clear fields",
      close: "Close",
      copy: "Copy",
      repeat: "Repeat",
      save_txt: "Save .txt",
      copy_history: "Copy history",
      converter: "Converter",

      // nav
      nav_calc: "🧮 Calculator",
      nav_units: "📏 Unit Converter",
      nav_currency: "💰 Currency",
      nav_bases: "🔢 Number Systems",
      nav_history: "History ⌄",

      // calc
      calc_title: "Calculator",
      calc_placeholder: "Example: (2+3)*4",
      calc_preview_title: "Click the result to copy",
      msg_calc_enter_expr: "Enter an expression",
      msg_calc_error: "Expression error",

      // units
      units_title: "Unit Converter",
      unitTab_length: "Length",
      unitTab_mass: "Mass",
      unitTab_volume: "Volume",
      unitTab_area: "Area",
      unitTab_temp: "Temperature",
      unit_center_length: "Length",
      unit_center_mass: "Mass",
      unit_center_volume: "Volume",
      unit_center_area: "Area",
      unit_center_temp: "Temperature",

      // currency
      currency_title: "Currency Converter",
      currency_center: "Currency",
      fx_refresh: "Refresh currency list",
      fx_source: "Source",
      fx_rate_date: "Rate date",
      fx_updated: "Updated",

      // bases
      bases_title: "Number Systems",

      // history
      history_title: "Recent operations",
      history_refresh: "Refresh",
      history_clear: "Clear",
      history_loading: "Loading…",
      history_empty: "Empty for now…",
      history_empty_export: "History is empty.",
      history_filter_aria: "History filter",
      history_filter_all: "All",
      history_copied_ok: "History copied ✔",
      history_copy_error: "Failed to copy history",
      history_saved_ok: "History file saved ✔",

      // favorites
      fav_in: "In favorites",
      fav_add: "Add to favorites",

      // search
      search_try: "Try this:",
      search_nothing: "Nothing found",
      hint_open_bases: "Click to open “Number Systems”",
      hint_go_currency: "Go to currency",
      hint_go_calc: "Go to calculator",
      search_bases_open: "Number Systems",

      // messages
      msg_loading_currencies: "Loading currencies…",
      msg_ready: "Ready",
      msg_convert: "Converting…",
      msg_enter_number: "Enter a number",
      msg_same_currency: "Same currencies 🙂",
      msg_fx_error: "Conversion error. Check internet/server.",
      msg_units_error: "Conversion error",
      msg_history_load_error: "Failed to load history",
      msg_copy_ok: "Copied ✔",
      msg_error: "Error",

      // footer
      footer_guide: "Mini guide (how to type)",
      footer_about: "About author",

      // about page
      about_page_title: "OmniCalc — About Author",
      about_subtitle: "About author",
      back: "← Back",
      about_back_subtitle: "Short info about the author",
      about_h1: "About the author",
      about_author_label: "Author:",
      about_city_label: "City:",
      about_project_label: "Project:",
      about_purpose_label: "Purpose:",
      about_author_value: "Maksym",
      about_city_value: "Lviv",
      about_project_value: "OmniCalc",
      about_purpose_value: "educational web programming project",
      about_contacts_hint: "Contacts: @note961",

      // guide page
      guide_page_title: "OmniCalc — Mini Guide",
      guide_subtitle: "Mini guide",
      guide_back_subtitle: "How to use",
      guide_h1: "About the app",
      guide_intro: "Click an item — the explanation will appear below.",
      guide_menu_smart: "Smart search",
      guide_menu_calc: "Calculator",
      guide_menu_units: "Unit converter",
      guide_menu_currency: "Currency converter",
      guide_menu_bases: "Number systems",
      guide_menu_history: "History and “Repeat”",
      guide_hotkeys: "⌨️ Hotkeys",
      guide_hotkey_open_search: "open search",
      guide_hotkey_clear_search: "clear search",
      guide_hotkey_pick_hint: "pick suggestion",
      guide_hotkey_go: "go / execute",

      guide_smart_title: "Smart search",
      guide_smart_body: `
        <ul>
          <li><b>Currency:</b> <code>100 usd</code>, <code>250 eur</code></li>
          <li><b>Units:</b> <code>15 km</code>, <code>300 mm</code>, <code>2.5 kg</code></li>
          <li><b>Number systems:</b> <code>1010 bin</code>, <code>2A hex</code>, <code>52 oct</code>, <code>42 dec</code></li>
          <li><b>Calculator:</b> <code>5(2+3)</code>, <code>(2+3)*4</code>, <code>sqrt(9)+1</code></li>
        </ul>
        <p class="muted">Tip: it is better to put a space between the number and the marker: <code>100 usd</code>, <code>15 km</code>, <code>1010 bin</code>.</p>
      `,
      guide_calc_title: "Calculator",
      guide_calc_body: `
        <ul>
          <li>You can type the expression manually or use the buttons.</li>
          <li>Supported: <code>+</code> <code>-</code> <code>*</code> <code>/</code>, brackets, <code>%</code>, <code>√</code>.</li>
          <li>Examples: <code>12/3</code>, <code>(2+3)*7</code>, <code>sqrt(16)+1</code>.</li>
        </ul>
      `,
      guide_units_title: "Unit converter",
      guide_units_body: `
        <ul>
          <li>Select a tab (length/mass/volume/area/temperature).</li>
          <li>Enter the value on the left — the result appears on the right.</li>
          <li>The <b>↔</b> button swaps the units.</li>
        </ul>
      `,
      guide_currency_title: "Currency converter",
      guide_currency_body: `
        <ul>
          <li>Enter an amount on the left and choose <b>from which</b> and <b>to which</b> currency.</li>
          <li>The <b>↔</b> button swaps currencies.</li>
          <li>If there is a refresh button, you can reload the currency list.</li>
        </ul>
      `,
      guide_bases_title: "Number systems",
      guide_bases_body: `
        <ul>
          <li>Type a value into any field (BIN/OCT/DEC/HEX) — the others update automatically.</li>
          <li>HEX uses letters A–F (without <code>0x</code>).</li>
        </ul>
      `,
      guide_history_title: "History and “Repeat”",
      guide_history_body: `
        <ul>
          <li>History stores recent operations.</li>
          <li><b>Repeat</b> opens the needed module and restores the values.</li>
          <li><b>Copy</b> copies the result to the clipboard.</li>
          <li>Filters show only the selected type (currency/calculator/etc.).</li>
        </ul>
      `
    }
  };

  function getLang() {
    return localStorage.getItem("lang") || "ua";
  }

  function setLang(lang) {
    localStorage.setItem("lang", lang);
    document.documentElement.setAttribute("lang", lang === "ua" ? "uk" : "en");
  }

  function t(key) {
    const lang = getLang();
    return I18N[lang]?.[key] ?? I18N.ua[key] ?? key;
  }

  function applyI18n() {
    const lang = getLang();
    document.documentElement.setAttribute("lang", lang === "ua" ? "uk" : "en");

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      el.textContent = t(el.dataset.i18n);
    });

    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      el.innerHTML = t(el.dataset.i18nHtml);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      el.setAttribute("placeholder", t(el.dataset.i18nPlaceholder));
    });

    document.querySelectorAll("[data-i18n-title]").forEach((el) => {
      el.setAttribute("title", t(el.dataset.i18nTitle));
    });

    document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
      el.setAttribute("aria-label", t(el.dataset.i18nAria));
    });

    document.querySelectorAll("[data-i18n-page-title]").forEach((el) => {
      document.title = t(el.dataset.i18nPageTitle);
    });

    const langBtns = document.querySelectorAll("[data-lang-btn]");
    langBtns.forEach((btn) => {
      btn.textContent = lang.toUpperCase();
    });
  }

  function toggleLang() {
    setLang(getLang() === "ua" ? "en" : "ua");
    applyI18n();
    document.dispatchEvent(new CustomEvent("app:lang-changed"));
  }

  window.I18N_APP = {
    I18N,
    getLang,
    setLang,
    t,
    applyI18n,
    toggleLang
  };
})();