export type Locale = "en" | "ru";

export type SessionThemeCopy = {
  name: string;
  category: string;
  tagline: string;
  summary: string;
  pace: string;
  pressure: string;
  flow: string;
  music: string;
  sequence: string[];
};

export type SessionTheme = {
  id: string;
  copy: Record<Locale, SessionThemeCopy>;
};

export const SESSION_THEMES: SessionTheme[] = [
  {
    id: "relax",
    copy: {
      en: { name: "Deep Relax", category: "Rest & Reset", tagline: "Slow down, soften, restore.", summary: "A grounding, unhurried session designed to help the client settle into rest and release everyday tension.", pace: "Slow", pressure: "Light to moderate", flow: "Long & continuous", music: "ambient piano", sequence: ["Arrival and comfort check", "Grounding back & shoulder work", "Slow leg and arm integration", "Quiet scalp or neck finish"] },
      ru: { name: "Глубокое расслабление", category: "Отдых и восстановление", tagline: "Замедлиться, расслабиться, восстановиться.", summary: "Спокойный, неспешный сеанс, который помогает клиенту настроиться на отдых и отпустить повседневное напряжение.", pace: "Медленный", pressure: "От лёгкого до умеренного", flow: "Длительный и непрерывный", music: "эмбиент с фортепиано", sequence: ["Встреча и проверка комфорта", "Расслабляющая работа со спиной и плечами", "Медленная проработка рук и ног", "Спокойное завершение массажем головы или шеи"] }
    }
  },
  {
    id: "vital",
    copy: {
      en: { name: "Vital Pulse", category: "Energy & Recovery", tagline: "Rhythmic, warm, renewing.", summary: "A bright, rhythmic experience for clients who want to feel refreshed and physically reenergized.", pace: "Moderate", pressure: "Moderate", flow: "Rhythmic & dynamic", music: "uplifting instrumental", sequence: ["Focused intake & pressure check", "Back and shoulder warming", "Rhythmic limb work", "Grounded, slow transition to finish"] },
      ru: { name: "Импульс энергии", category: "Энергия и восстановление", tagline: "Ритмично, тепло, обновляюще.", summary: "Яркий, ритмичный сеанс для клиентов, которые хотят освежиться и ощутить новый прилив физических сил.", pace: "Умеренный", pressure: "Умеренное", flow: "Ритмичный и динамичный", music: "бодрящая инструментальная музыка", sequence: ["Уточнение целей и проверка давления", "Разогрев спины и плеч", "Ритмичная работа с конечностями", "Спокойный, постепенный переход к завершению"] }
    }
  },
  {
    id: "ocean",
    copy: {
      en: { name: "Ocean Bliss", category: "Sensory Escape", tagline: "A gently flowing reset.", summary: "A smooth, wave-like ritual that pairs continuous movement with an optional soft sensory atmosphere.", pace: "Slow", pressure: "Light to moderate", flow: "Fluid & soothing", music: "soft coastal ambient", sequence: ["Scent and sensitivity check", "Broad, flowing back work", "Gentle arms and legs", "Unhurried closure"] },
      ru: { name: "Океан блаженства", category: "Чувственное погружение", tagline: "Мягкое, плавное обновление.", summary: "Плавный, волнообразный ритуал, в котором непрерывные движения сочетаются с ненавязчивой чувственной атмосферой по желанию клиента.", pace: "Медленный", pressure: "От лёгкого до умеренного", flow: "Плавный и успокаивающий", music: "мягкий прибрежный эмбиент", sequence: ["Проверка чувствительности и выбора аромата", "Широкие, плавные движения по спине", "Мягкая работа с руками и ногами", "Неспешное завершение"] }
    }
  },
  {
    id: "restore",
    copy: {
      en: { name: "Muscle Restore", category: "Targeted Comfort", tagline: "Focused attention, clear check-ins.", summary: "A client-led blueprint for areas of non-acute muscular tension, with regular pressure and comfort check-ins.", pace: "Moderate", pressure: "Customizable", flow: "Focused", music: "low-key instrumental", sequence: ["Goals and contraindication check", "General warming sequence", "Focused work by consent", "Integration and aftercare discussion"] },
      ru: { name: "Восстановление мышц", category: "Направленный комфорт", tagline: "Точное внимание и регулярная обратная связь.", summary: "План работы с зонами неострого мышечного напряжения, составленный с учётом пожеланий клиента и регулярной проверкой давления и комфорта.", pace: "Умеренный", pressure: "Настраиваемое", flow: "Направленный", music: "спокойная инструментальная музыка", sequence: ["Уточнение целей и противопоказаний", "Общая разогревающая последовательность", "Направленная работа с согласия клиента", "Объединение техник и обсуждение рекомендаций"] }
    }
  },
  {
    id: "warm",
    copy: {
      en: { name: "Warm Radiance", category: "Sensory Relaxation", tagline: "Comforting, polished, professional.", summary: "A luxurious spa-style experience emphasizing warmth, texture, and a calm, professional sense of care.", pace: "Slow", pressure: "Light to moderate", flow: "Nurturing", music: "warm acoustic ambient", sequence: ["Comfort and draping discussion", "Warm towel preparation", "Nurturing full-body flow", "Slow, settled finish"] },
      ru: { name: "Тёплое сияние", category: "Чувственное расслабление", tagline: "Комфортно, изысканно, профессионально.", summary: "Роскошный сеанс в стиле спа с акцентом на тепло, тактильные ощущения и спокойную профессиональную заботу.", pace: "Медленный", pressure: "От лёгкого до умеренного", flow: "Заботливый", music: "тёплый акустический эмбиент", sequence: ["Обсуждение комфорта и драпировки", "Подготовка тёплых полотенец", "Заботливая работа со всем телом", "Медленное, спокойное завершение"] }
    }
  },
  {
    id: "reset",
    copy: {
      en: { name: "Clear Mind Reset", category: "Rest & Reset", tagline: "Space to exhale.", summary: "A quiet, simple session framework for clients who want less sensory input and a feeling of calm.", pace: "Slow", pressure: "Light", flow: "Minimal & steady", music: "quiet or client choice", sequence: ["Low-sensory room check", "Neck and shoulder easing", "Steady, simple full-body flow", "Stillness before closing"] },
      ru: { name: "Перезагрузка ясного ума", category: "Отдых и восстановление", tagline: "Пространство, чтобы выдохнуть.", summary: "Тихая и простая структура сеанса для клиентов, которым хочется меньше чувственных стимулов и больше спокойствия.", pace: "Медленный", pressure: "Лёгкое", flow: "Минималистичный и ровный", music: "тишина или выбор клиента", sequence: ["Проверка кабинета на минимум раздражителей", "Расслабление шеи и плеч", "Ровная, простая работа со всем телом", "Минута покоя перед завершением"] }
    }
  }
];
