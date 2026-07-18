import type { Locale } from "./themes";

type LocalizedText = Record<Locale, string>;

export type BlogArticle = {
  id: string;
  category: LocalizedText;
  published: LocalizedText;
  readTime: LocalizedText;
  title: LocalizedText;
  excerpt: LocalizedText;
  body: Record<Locale, string[]>;
};

export type CommunityThread = {
  id: string;
  topic: LocalizedText;
  author: string;
  role: LocalizedText;
  posted: LocalizedText;
  replies: number;
  title: LocalizedText;
  excerpt: LocalizedText;
};

export type LocalCommunityThread = {
  id: string;
  topic: string;
  title: string;
  body: string;
};

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: "signature-without-rigidity",
    category: { en: "Practice design", ru: "Развитие практики" },
    published: { en: "July 18, 2026", ru: "18 июля 2026" },
    readTime: { en: "5 min read", ru: "5 минут" },
    title: {
      en: "How to create a signature experience without making it rigid",
      ru: "Как создать узнаваемый сеанс, сохраняя гибкость"
    },
    excerpt: {
      en: "A repeatable structure can strengthen your practice while leaving every pressure, boundary, and sensory choice open to the client.",
      ru: "Повторяемая структура укрепляет практику, сохраняя за клиентом выбор давления, границ и сенсорных деталей."
    },
    body: {
      en: [
        "A signature experience is not a fixed sequence of techniques. It is a recognizable promise about preparation, pacing, communication, and atmosphere that the therapist adapts with each client.",
        "Start by defining what should remain consistent: the arrival conversation, the quality of transitions, room readiness, and the way comfort is checked. Then identify what must always remain flexible, including pressure, aroma, focus areas, conversation, and the option to stop.",
        "The useful test is simple: another trained provider should understand the intended experience, while the client should still feel that every meaningful choice belongs to them."
      ],
      ru: [
        "Узнаваемый сеанс — это не неизменная последовательность техник. Это понятное обещание о подготовке, темпе, общении и атмосфере, которое специалист адаптирует для каждого клиента.",
        "Сначала определите постоянные элементы: беседу перед началом, качество переходов, готовность кабинета и проверку комфорта. Затем обозначьте то, что всегда должно оставаться гибким: давление, аромат, зоны внимания, общение и возможность остановить сеанс.",
        "Простой критерий: другой подготовленный специалист понимает задуманную атмосферу, а клиент по-прежнему контролирует каждый значимый выбор."
      ]
    }
  },
  {
    id: "consent-as-conversation",
    category: { en: "Professional boundaries", ru: "Профессиональные границы" },
    published: { en: "July 12, 2026", ru: "12 июля 2026" },
    readTime: { en: "4 min read", ru: "4 минуты" },
    title: {
      en: "Consent works best as a conversation, not a checkbox",
      ru: "Согласие — это диалог, а не отметка в списке"
    },
    excerpt: {
      en: "Plan the moments when comfort, pressure, aroma, and boundaries can be revisited instead of treating consent as a one-time event.",
      ru: "Заранее определите моменты для повторной проверки комфорта, давления, аромата и границ."
    },
    body: {
      en: [
        "A form can record a preference, but it cannot replace live communication. Comfort can change during a session, and a client may need an easy, consequence-free way to adjust or decline.",
        "A session blueprint can help by planning short check-in moments: before introducing aroma, before changing pressure, before approaching a sensitive boundary, and whenever the client signals uncertainty.",
        "Use plain professional language, avoid preselecting sensitive options, and make stopping or changing direction feel ordinary rather than disruptive."
      ],
      ru: [
        "Форма может зафиксировать предпочтение, но не заменяет живое общение. Комфорт меняется во время сеанса, и клиенту нужен простой способ скорректировать или отклонить действие.",
        "План сеанса помогает заранее отметить короткие проверки: перед использованием аромата, изменением давления, приближением к чувствительной границе и при любом сомнении клиента.",
        "Используйте ясный профессиональный язык, не выбирайте чувствительные варианты заранее и показывайте, что остановить или изменить сеанс — это нормально."
      ]
    }
  },
  {
    id: "room-reset",
    category: { en: "Room and sensory details", ru: "Кабинет и сенсорные детали" },
    published: { en: "July 5, 2026", ru: "5 июля 2026" },
    readTime: { en: "3 min read", ru: "3 минуты" },
    title: {
      en: "A three-minute room reset between clients",
      ru: "Трёхминутная подготовка кабинета между клиентами"
    },
    excerpt: {
      en: "A small repeatable reset protects consistency on a busy day without turning atmosphere into another complicated task.",
      ru: "Короткая повторяемая подготовка помогает сохранять качество даже в насыщенный день."
    },
    body: {
      en: [
        "A room reset should be short enough to use on the busiest day. Divide it into three passes: safety and cleanliness, physical comfort, and sensory choices.",
        "First confirm surfaces, linens, pathways, temperature, and equipment. Then prepare bolsters and the table for the client's stated needs. Last, set lighting and sound and offer aroma only when it has been discussed and approved.",
        "A consistent order reduces mental load. It also makes exceptions visible, which is exactly when a checklist is most valuable."
      ],
      ru: [
        "Подготовка должна быть достаточно короткой даже для самого насыщенного дня. Разделите её на три этапа: безопасность и чистота, физический комфорт и сенсорные детали.",
        "Сначала проверьте поверхности, бельё, проходы, температуру и оборудование. Затем подготовьте стол и валики с учётом пожеланий клиента. В конце настройте свет и звук, а аромат предлагайте только после обсуждения и согласия.",
        "Постоянный порядок снижает нагрузку на внимание и помогает заметить исключения — именно тогда список особенно полезен."
      ]
    }
  }
];

export const COMMUNITY_THREADS: CommunityThread[] = [
  {
    id: "quiet-arrival",
    topic: { en: "Session design", ru: "Создание сеанса" },
    author: "Maya R.",
    role: { en: "Independent provider", ru: "Частный специалист" },
    posted: { en: "2 hours ago", ru: "2 часа назад" },
    replies: 8,
    title: {
      en: "What helps a quiet arrival feel welcoming rather than distant?",
      ru: "Как сделать спокойное начало приветливым, но ненавязчивым?"
    },
    excerpt: {
      en: "I'm refining the first five minutes of a low-sensory session and would love to compare non-clinical arrival rituals.",
      ru: "Я совершенствую первые пять минут спокойного сеанса и хочу обсудить профессиональные варианты встречи клиента."
    }
  },
  {
    id: "unscented-default",
    topic: { en: "Room and sensory details", ru: "Кабинет и сенсорные детали" },
    author: "Elena V.",
    role: { en: "Studio owner", ru: "Владелец студии" },
    posted: { en: "Yesterday", ru: "Вчера" },
    replies: 14,
    title: {
      en: "Making unscented the easiest default for the whole team",
      ru: "Как сделать вариант без аромата простым стандартом для команды"
    },
    excerpt: {
      en: "We changed our room-prep order so scent is always an explicit choice. Here is the language that worked for our staff.",
      ru: "Мы изменили порядок подготовки, чтобы аромат всегда был осознанным выбором. Делюсь формулировкой для команды."
    }
  },
  {
    id: "late-policy",
    topic: { en: "Practice operations", ru: "Организация практики" },
    author: "Jordan K.",
    role: { en: "Solo practitioner", ru: "Частный специалист" },
    posted: { en: "2 days ago", ru: "2 дня назад" },
    replies: 11,
    title: {
      en: "A late-arrival policy that protects time without sounding punitive",
      ru: "Как бережно сформулировать правила опоздания"
    },
    excerpt: {
      en: "Looking for clear, humane wording that protects the next client's appointment and sets expectations before booking.",
      ru: "Ищу ясную и уважительную формулировку, которая защищает время следующего клиента."
    }
  }
];

export const COMMUNITY_COPY = {
  en: {
    insightsNav: "Journal",
    communityNav: "Community",
    journalEyebrow: "THE SESSIONSCAPE JOURNAL",
    journalTitle: "Ideas for a more intentional practice.",
    journalIntro: "Public, owner-led articles about experience design, professional boundaries, and the details that shape a thoughtful practice.",
    readArticle: "Read article",
    closeArticle: "Close article",
    reviewedNote: "Editorial content · Review date shown",
    communityEyebrow: "PROVIDER COMMUNITY",
    communityTitle: "Build the practice together.",
    communityIntro: "A focused place for massage professionals to exchange practical ideas, ask thoughtful questions, and learn from peers—without sharing client information.",
    providerAccess: "Provider access",
    previewAccess: "Public preview",
    communityPrinciples: "What belongs here",
    principles: ["Session and experience design", "Practice operations and communication", "Room, sensory, and preparation ideas", "Professional boundaries and product feedback"],
    privacyRule: "Never share client names, medical histories, appointment details, images, or other identifying information.",
    sampleDiscussions: "Recent discussions",
    replies: (value: string) => `${value} replies`,
    joinTitle: "Continue inside the provider community",
    joinCopy: "Register for preview access to read full discussions and exchange ideas with other providers.",
    joinButton: "Register as a provider",
    memberBadge: "Provider preview active",
    startDiscussion: "Start a discussion",
    discussionTitle: "Discussion title",
    discussionPlaceholder: "What would you like other providers to explore?",
    topic: "Topic",
    discussionBody: "Context",
    bodyPlaceholder: "Share enough context to invite useful ideas. Do not include client information.",
    publishDiscussion: "Submit for review",
    localPostStatus: "Saved on this device · awaiting prototype moderation",
    prototypeNote: "Prototype note: provider access and discussions are stored only in this browser. The production community will require secure accounts, database persistence, reporting, and moderation.",
    communityRegistrationEyebrow: "PROVIDER PREVIEW",
    communityRegistrationTitle: "Join the SessionScape provider community.",
    communityRegistrationCopy: "Register to preview full discussions and contribute non-client-specific ideas. Production identity verification and moderation are not active in this prototype.",
    communitySuccessTitle: "Your provider preview is ready.",
    communitySuccessCopy: (email: string) => `Preview access for ${email} is stored only on this device.`,
    enterCommunity: "Enter the community",
    selectTopic: "Select a topic",
    topicOptions: ["Session design", "Practice operations", "Room and sensory details", "Professional boundaries", "Product feedback"]
  },
  ru: {
    insightsNav: "Журнал",
    communityNav: "Сообщество",
    journalEyebrow: "ЖУРНАЛ SESSIONSCAPE",
    journalTitle: "Идеи для осознанной практики.",
    journalIntro: "Открытые авторские материалы о создании сеансов, профессиональных границах и деталях внимательной практики.",
    readArticle: "Читать статью",
    closeArticle: "Закрыть статью",
    reviewedNote: "Редакционный материал · дата проверки указана",
    communityEyebrow: "СООБЩЕСТВО СПЕЦИАЛИСТОВ",
    communityTitle: "Развиваем практику вместе.",
    communityIntro: "Профессиональное пространство для обмена практическими идеями, вдумчивых вопросов и обучения у коллег — без данных клиентов.",
    providerAccess: "Доступ специалиста",
    previewAccess: "Открытый обзор",
    communityPrinciples: "Что можно обсуждать",
    principles: ["Создание сеансов и впечатлений", "Организация практики и общение", "Кабинет, сенсорные детали и подготовка", "Профессиональные границы и обратная связь о продукте"],
    privacyRule: "Не публикуйте имена клиентов, медицинскую историю, детали записи, изображения и другие идентифицирующие сведения.",
    sampleDiscussions: "Недавние обсуждения",
    replies: (value: string) => `${value} ответов`,
    joinTitle: "Продолжите в сообществе специалистов",
    joinCopy: "Зарегистрируйтесь для предварительного доступа к полным обсуждениям и обмена идеями с коллегами.",
    joinButton: "Зарегистрироваться как специалист",
    memberBadge: "Предварительный доступ активен",
    startDiscussion: "Начать обсуждение",
    discussionTitle: "Заголовок обсуждения",
    discussionPlaceholder: "Что вы хотите обсудить с другими специалистами?",
    topic: "Тема",
    discussionBody: "Контекст",
    bodyPlaceholder: "Добавьте контекст для полезного обсуждения. Не указывайте данные клиентов.",
    publishDiscussion: "Отправить на проверку",
    localPostStatus: "Сохранено на устройстве · ожидает демонстрационной модерации",
    prototypeNote: "Примечание: доступ и обсуждения сохраняются только в этом браузере. В рабочей версии потребуются защищённые аккаунты, база данных, жалобы и модерация.",
    communityRegistrationEyebrow: "ПРЕДВАРИТЕЛЬНЫЙ ДОСТУП",
    communityRegistrationTitle: "Присоединяйтесь к сообществу SessionScape.",
    communityRegistrationCopy: "Зарегистрируйтесь, чтобы читать полные обсуждения и делиться идеями без данных клиентов. Проверка личности и рабочая модерация в прототипе ещё не действуют.",
    communitySuccessTitle: "Предварительный доступ готов.",
    communitySuccessCopy: (email: string) => `Доступ для ${email} сохранён только на этом устройстве.`,
    enterCommunity: "Перейти в сообщество",
    selectTopic: "Выберите тему",
    topicOptions: ["Создание сеанса", "Организация практики", "Кабинет и сенсорные детали", "Профессиональные границы", "Обратная связь о продукте"]
  }
} satisfies Record<Locale, Record<string, string | string[] | ((value: string) => string)>>;
