export type Language = "uz" | "ru" | "en";

export interface TranslationDictionary {
  // Navigation & Header
  brandCore: string;
  brandMedicine: string;
  greeting: string;
  aiActive: string;
  searchPlaceholder: string;
  tabDashboard: string;
  tabAnalytics: string;
  tabReports: string;
  historyTitle: string;
  specialistsTitle: string;
  settingsTitle: string;

  // Hero Section
  heroBadge: string;
  heroTitlePrefix: string;
  heroTitleHighlight: string;
  startScanBtn: string;

  // Left Widgets
  facialToneTitle: string;
  toneGrowth: string;
  conditionTitle: string;
  conditionStatus: string;
  pillsCount: string;
  pillsUnit: string;
  bloodTitle: string;
  bloodStatus: string;
  deepSleepTitle: string;
  deepSleepHours: string;

  // Center Stage
  mapTitle: string;
  interactiveBiomarkers: string;
  hdMedicalView: string;
  clickZonePrompt: string;
  toneNormalBadge: string;
  zoneForehead: string;
  zoneForeheadStat: string;
  zoneEyes: string;
  zoneEyesStat: string;
  zoneCheeks: string;
  zoneCheeksStat: string;
  zoneLips: string;
  zoneLipsStat: string;
  heartActivityTitle: string;
  heartActivityValue: string;
  breathActivityTitle: string;
  breathActivityValue: string;
  facialSymmetryTitle: string;
  facialSymmetryValue: string;
  aiHealthIndexTitle: string;
  aiHealthIndexValue: string;

  // Zone Detail Card
  tabBiomarkers: string;
  tabGymnastics: string;
  tabAnatomy: string;
  muscleStateTitle: string;
  muscleStateDesc: string;
  muscleStateSub: string;
  aiRecommendationTitle: string;
  aiRecommendationDesc: string;
  aiRecommendationSub: string;
  exerciseTitle: string;
  exerciseDesc: string;
  anatomyStructureTitle: string;
  anatomyStructureDesc: string;

  // Right Widgets
  restTimeTitle: string;
  restTimeValue: string;
  hydrationTitle: string;
  hydrationValue: string;
  hydrationGrowth: string;
  heartMonitorTitle: string;
  heartMonitorValue: string;
  dailyMoodTitle: string;

  // Numbered Editorial Section (Bottom)
  num1Title: string;
  num1Desc: string;
  num2Title: string;
  num2Desc: string;
  num3Title: string;
  num3Desc: string;

  // Scanner Modal
  scannerModalTitle: string;
  scannerModalSubtitle: string;
  scannerModeCamera: string;
  scannerModeUpload: string;
  scannerCenterFace: string;
  scannerLightingTip: string;
  scannerUploadPrompt: string;
  scannerUploadFormats: string;
  scannerBtnCancel: string;
  scannerBtnStart: string;
  scannerBtnAnalyzing: string;
  scanStep1: string;
  scanStep2: string;
  scanStep3: string;

  // History Modal
  historyModalTitle: string;
  historyModalSubtitle: string;
  historyItem1Date: string;
  historyItem1Status: string;
  historyItem1Note: string;
  historyItem2Date: string;
  historyItem2Status: string;
  historyItem2Note: string;
  historyItem3Date: string;
  historyItem3Status: string;
  historyItem3Note: string;
  modalCloseBtn: string;

  // Specialists Modal
  specialistsModalTitle: string;
  specialistsModalSubtitle: string;
  doc1Name: string;
  doc1Spec: string;
  doc1Exp: string;
  doc2Name: string;
  doc2Spec: string;
  doc2Exp: string;
  doc3Name: string;
  doc3Spec: string;
  doc3Exp: string;
  bookBtn: string;
  bookedAlert: string;

  // Settings Modal
  settingsSensitivityTitle: string;
  settingsSensitivityDesc: string;
  settingsRemindersTitle: string;
  settingsRemindersDesc: string;
  saveBtn: string;

  // Results Modal
  resultsTitle: string;
  resultsSubtitle: string;
  resultsScoreLabel: string;
  resultsScoreStatus: string;
  resultsTipsTitle: string;
  resultsSaveBtn: string;
  resultZone1: string;
  resultZone2: string;
  resultZone3: string;
  resultZone4: string;
  resultStatusRelaxed: string;
  resultStatusFresh: string;
  resultStatusSymmetric: string;
  resultStatusNormal: string;

  // Theme
  themeDark: string;
  themeLight: string;
  themeToggle: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  uz: {
    // Navigation & Header
    brandCore: "CORE",
    brandMedicine: "MEDITSIYA",
    greeting: "Xayrli tong, Alex",
    aiActive: "AI Faol",
    searchPlaceholder: "Zona va biomarkerlarni qidirish...",
    tabDashboard: "Boshqaruv",
    tabAnalytics: "Tahlillar",
    tabReports: "Hisobotlar",
    historyTitle: "Tekshiruvlar tarixi",
    specialistsTitle: "Mutaxassis konsultatsiyasi",
    settingsTitle: "Parametrlar va sozlamalar",

    // Hero Section
    heroBadge: "BioControl • Sun'iy intellekt tibbiy tahlil platformasi",
    heroTitlePrefix: "Bugungi salomatligingiz",
    heroTitleHighlight: "QANDAY! 🩺",
    startScanBtn: "Yuzni AI diagnostika qilish",

    // Left Widgets
    facialToneTitle: "Yuzning umumiy tonusi",
    toneGrowth: "+4.8%",
    conditionTitle: "Holat",
    conditionStatus: "A'lo darajada",
    pillsCount: "3",
    pillsUnit: "Kapsula",
    bloodTitle: "Qon aylanishi",
    bloodStatus: "Me'yorda",
    deepSleepTitle: "Chuqur uyqu",
    deepSleepHours: "2 soat",

    // Center Stage
    mapTitle: "Yuzning anatomik xaritasi",
    interactiveBiomarkers: "Interaktiv biomarkerlar",
    hdMedicalView: "HD Tibbiy Ko'rinish",
    clickZonePrompt: "Tavsiyalar uchun yuzdagi istalgan nuqtani bosing",
    toneNormalBadge: "Tonus me'yorda (96%)",
    zoneForehead: "Peshona mushaklari",
    zoneForeheadStat: "Bo'shashgan (98%)",
    zoneEyes: "Ko'z atrofi zonasi",
    zoneEyesStat: "Tiniq ko'rinish (94%)",
    zoneCheeks: "Yonoq va mikrosirkulyatsiya",
    zoneCheeksStat: "Me'yorda (96%)",
    zoneLips: "Og'iz aylana mushagi",
    zoneLipsStat: "Simmetriya 99%",
    heartActivityTitle: "Yurak faoliyati",
    heartActivityValue: "68 ur/daq • Me'yorda",
    breathActivityTitle: "Nafas ritmi",
    breathActivityValue: "16 marta/daq • Me'yorda",
    facialSymmetryTitle: "Yuz simmetriyasi",
    facialSymmetryValue: "98.4% Optimal",
    aiHealthIndexTitle: "AI Salomatlik indeksi",
    aiHealthIndexValue: "Eng yuqori ko'rsatkich",

    // Zone Detail Card
    tabBiomarkers: "Biomarkerlar",
    tabGymnastics: "Gimnastika (30 soniya)",
    tabAnatomy: "Anatomiya",
    muscleStateTitle: "MUSHAKLAR HOLATI",
    muscleStateDesc: "Spazm va zo'riqishlar aniqlanmadi",
    muscleStateSub: "Mimik mushaklar yuki to'liq muvozanatlashgan.",
    aiRecommendationTitle: "AI TAVSIYASI",
    aiRecommendationDesc: "Profilaktik parvarish",
    aiRecommendationSub: "Muntazam suv ichish balansiga rioya qiling.",
    exerciseTitle: "Mashq: Yuz zonasini yengil bo'shashtirish",
    exerciseDesc: "Ko'zlaringizni yuming va 4 soniya davomida chuqur nafas oling.",
    anatomyStructureTitle: "Anatomik tuzilishi: Musculus frontalis & Corrugator",
    anatomyStructureDesc: "Yuz nervi (n. facialis, VII juft) orqali innervatsiya qilinadi. Supraorbital arteriyalar orqali qon bilan ta'minlanadi.",

    // Right Widgets
    restTimeTitle: "Dam olish vaqti",
    restTimeValue: "7s 45d",
    hydrationTitle: "Gidratatsiya",
    hydrationValue: "750 ml",
    hydrationGrowth: "Kechagidan +15%",
    heartMonitorTitle: "Yurak faoliyati",
    heartMonitorValue: "68 bpm",
    dailyMoodTitle: "Bugungi kayfiyat:",

    // Numbered Editorial Section (Bottom)
    num1Title: "Sub-millimetrli mushak tonusi xaritasi",
    num1Desc: "Peshona, yonoq va ko'z atrofi mushaklarining mikroskopik zo'riqishini kontaktsiz aniqlash.",
    num2Title: "Mikrosirkulyatsiya va gidratatsiya spektri",
    num2Desc: "Qon perfuziyasi, kapillyarlar kislorodi va teri elastikligini real vaqtda optik tahlil qilish.",
    num3Title: "Regenerativ AI mashqlari va tavsiyalar",
    num3Desc: "Har bir foydalanuvchi uchun moslashuvchan 30 soniyalik yuz mashqlari va shifokor nazorati.",

    // Scanner Modal
    scannerModalTitle: "Yuzni AI Bioskanerlash",
    scannerModalSubtitle: "Yuz zonalari va mushak tonusini kontaktsiz tekshirish",
    scannerModeCamera: "Veb-kamera",
    scannerModeUpload: "Rasm yuklash",
    scannerCenterFace: "Yuzni markazga qo'ying",
    scannerLightingTip: "To'g'ri qarang va yorug'lik yetarli bo'lsin",
    scannerUploadPrompt: "Rasmni tanlash uchun bosing",
    scannerUploadFormats: "JPG, PNG, WEBP formatlari qo'llab-quvvatlanadi",
    scannerBtnCancel: "Bekor qilish",
    scannerBtnStart: "Skriningni boshlash",
    scannerBtnAnalyzing: "Tahlil qilinmoqda...",
    scanStep1: "AI sensorlari kalibrlanmoqda...",
    scanStep2: "Mushaklar tonusi va simmetriya tahlil qilinmoqda...",
    scanStep3: "Mikrosirkulyatsiya va biomarkerlar baholanmoqda...",

    // History Modal
    historyModalTitle: "Skrininglar tarixi",
    historyModalSubtitle: "Yuz biomarkerlari holatining o'zgarish dinamikasi",
    historyItem1Date: "Bugun, 10:54",
    historyItem1Status: "A'lo",
    historyItem1Note: "Mushaklar bo'shashgan, simmetriya 99%",
    historyItem2Date: "Kecha, 18:20",
    historyItem2Status: "Yaxshi",
    historyItem2Note: "Ko'z atrofida biroz zo'riqish aniqlandi",
    historyItem3Date: "24-sentyabr, 09:15",
    historyItem3Status: "A'lo",
    historyItem3Note: "Gimnastikadan so'ng tonus me'yorda",
    modalCloseBtn: "Yopish",

    // Specialists Modal
    specialistsModalTitle: "Mutaxassis konsultatsiyasi",
    specialistsModalSubtitle: "Sertifikatlangan shifokorlar va tibbiy markazlar",
    doc1Name: "Doktor Elena Voronova",
    doc1Spec: "Nevrolog shifokor, t.f.n.",
    doc1Exp: "14 yil",
    doc2Name: "Doktor Mixail Sokolov",
    doc2Spec: "Dermatokosmetolog",
    doc2Exp: "11 yil",
    doc3Name: "Doktor Anna Kim",
    doc3Spec: "Yuz-jag' jarrohi",
    doc3Exp: "18 yil",
    bookBtn: "Yozilish",
    bookedAlert: "qabuliga arizangiz muvaffaqiyatli qabul qilindi!",

    // Settings Modal
    settingsSensitivityTitle: "AI yuqori sezgirligi",
    settingsSensitivityDesc: "Dastlabki bosqichdagi mikrozoriqishlarni aniqlash",
    settingsRemindersTitle: "Gimnastika eslatmalari",
    settingsRemindersDesc: "Har 2 soatda tanaffus qilish haqida eslatma",
    saveBtn: "Saqlash",

    // Results Modal
    resultsTitle: "AI Skrining Natijalari",
    resultsSubtitle: "Muvaffaqiyatli yakunlandi:",
    resultsScoreLabel: "Yuz salomatligining yakuniy indeksi",
    resultsScoreStatus: "A'lo darajada",
    resultsTipsTitle: "Tizim tavsiyalari:",
    resultsSaveBtn: "Qabul qilish va profilga saqlash",
    resultZone1: "Peshona va qoshlar",
    resultZone2: "Ko'z atrofi zonasi",
    resultZone3: "Yonoqlar va yuz",
    resultZone4: "Lablar va og'iz",
    resultStatusRelaxed: "Bo'shashgan (98%)",
    resultStatusFresh: "Tiniq ko'rinish (94%)",
    resultStatusSymmetric: "Simmetriya 99%",
    resultStatusNormal: "Me'yorda (96%)",

    // Theme
    themeDark: "Qorong'i rejim",
    themeLight: "Yorug' rejim",
    themeToggle: "Mavzuni almashtirish",
  },

  ru: {
    // Navigation & Header
    brandCore: "CORE",
    brandMedicine: "МЕДИЦИНА",
    greeting: "Доброе утро, Алекс",
    aiActive: "AI Активен",
    searchPlaceholder: "Поиск зон и биомаркеров...",
    tabDashboard: "Дашборд",
    tabAnalytics: "Аналитика",
    tabReports: "Отчёты",
    historyTitle: "История скринингов",
    specialistsTitle: "Консультация специалистов",
    settingsTitle: "Параметры и Настройки",

    // Hero Section
    heroBadge: "BioControl • Платформа клинических AI исследований",
    heroTitlePrefix: "Что с вашим здоровьем",
    heroTitleHighlight: "СЕГОДНЯ! 🩺",
    startScanBtn: "Запустить скрининг лица",

    // Left Widgets
    facialToneTitle: "Общий тонус лица",
    toneGrowth: "+4.8%",
    conditionTitle: "Состояние",
    conditionStatus: "Превосходно",
    pillsCount: "3",
    pillsUnit: "Капсулы",
    bloodTitle: "Кровоток",
    bloodStatus: "В норме",
    deepSleepTitle: "Глубокий сон",
    deepSleepHours: "2 часа",

    // Center Stage
    mapTitle: "Анатомическая карта лица",
    interactiveBiomarkers: "Интерактивные биомаркеры",
    hdMedicalView: "HD Medical View",
    clickZonePrompt: "Нажмите на любую зону лица для рекомендаций",
    toneNormalBadge: "Тонус в норме (96%)",
    zoneForehead: "Лобные мышцы",
    zoneForeheadStat: "Расслаблен (98%)",
    zoneEyes: "Периорбитальная зона",
    zoneEyesStat: "Свежий вид (94%)",
    zoneCheeks: "Скулы & Микроциркуляция",
    zoneCheeksStat: "В норме (96%)",
    zoneLips: "Круговая мышца рта",
    zoneLipsStat: "Симметрия 99%",
    heartActivityTitle: "Активность сердца",
    heartActivityValue: "68 уд/мин • Норма",
    breathActivityTitle: "Частота дыхания",
    breathActivityValue: "16 вд/мин • Норма",
    facialSymmetryTitle: "Симметрия лица",
    facialSymmetryValue: "98.4% Оптимально",
    aiHealthIndexTitle: "AI Индекс здоровья",
    aiHealthIndexValue: "Наилучший показатель",

    // Zone Detail Card
    tabBiomarkers: "Биомаркеры",
    tabGymnastics: "Гимнастика (30 сек)",
    tabAnatomy: "Анатомия",
    muscleStateTitle: "СОСТОЯНИЕ МЫШЦ",
    muscleStateDesc: "Спазмы и зажимы отсутствуют",
    muscleStateSub: "Мимическая нагрузка сбалансирована.",
    aiRecommendationTitle: "РЕКОМЕНДАЦИЯ AI",
    aiRecommendationDesc: "Поддерживающий уход",
    aiRecommendationSub: "Продолжайте регулярную водную гидратацию.",
    exerciseTitle: "Упражнение: Мягкое расслабление зоны",
    exerciseDesc: "Закройте глаза и сделайте глубокий вдох на 4 секунды.",
    anatomyStructureTitle: "Анатомическая структура: Frontalis & Corrugator",
    anatomyStructureDesc: "Иннервация лицевым нервом (n. facialis, VII пара черепных нервов). Васкуляризация надглазничной артерией.",

    // Right Widgets
    restTimeTitle: "Время отдыха",
    restTimeValue: "7ч 45м",
    hydrationTitle: "Гидратация",
    hydrationValue: "750 мл",
    hydrationGrowth: "+15% к вчера",
    heartMonitorTitle: "Активность сердца",
    heartMonitorValue: "68 bpm",
    dailyMoodTitle: "Настроение дня:",

    // Numbered Editorial Section (Bottom)
    num1Title: "Субмиллиметровое картирование тонуса",
    num1Desc: "Бесконтактное высокоточное отслеживание тонуса лобных, скуловых и периорбитальных мышц.",
    num2Title: "Спектрометрия микроциркуляции и гидратации",
    num2Desc: "Оптическая оценка тканевой перфузии, насыщения капилляров кислородом и эластичности кожи.",
    num3Title: "Регенеративные AI упражнения и рекомендации",
    num3Desc: "Персонализированные 30-секундные гимнастические протоколы и мгновенная валидация врачами.",

    // Scanner Modal
    scannerModalTitle: "AI Биосканирование Лица",
    scannerModalSubtitle: "Бесконтактный анализ лицевых зон и тонуса",
    scannerModeCamera: "Веб-камера",
    scannerModeUpload: "Загрузить фото",
    scannerCenterFace: "Лицо в центре",
    scannerLightingTip: "Прямой взгляд и естественное освещение",
    scannerUploadPrompt: "Нажмите для выбора снимка",
    scannerUploadFormats: "Поддерживаются JPG, PNG, WEBP",
    scannerBtnCancel: "Отмена",
    scannerBtnStart: "Запустить скрининг",
    scannerBtnAnalyzing: "Анализируем...",
    scanStep1: "Калибровка AI сенсоров...",
    scanStep2: "Анализ тонуса мышц и симметрии...",
    scanStep3: "Оценка микроциркуляции и биомаркеров...",

    // History Modal
    historyModalTitle: "История скринингов",
    historyModalSubtitle: "Динамика состояния лицевых биомаркеров",
    historyItem1Date: "Сегодня, 10:54",
    historyItem1Status: "Превосходно",
    historyItem1Note: "Мышцы расслаблены, симметрия 99%",
    historyItem2Date: "Вчера, 18:20",
    historyItem2Status: "Хорошо",
    historyItem2Note: "Небольшое напряжение периорбитальной зоны",
    historyItem3Date: "24 сентября, 09:15",
    historyItem3Status: "Отлично",
    historyItem3Note: "Тонус в норме после гимнастики",
    modalCloseBtn: "Закрыть",

    // Specialists Modal
    specialistsModalTitle: "Консультация специалистов",
    specialistsModalSubtitle: "Сертифицированные врачи и медицинские центры",
    doc1Name: "Др. Елена Воронова",
    doc1Spec: "Врач-невролог, к.м.н.",
    doc1Exp: "14 лет",
    doc2Name: "Др. Михаил Соколов",
    doc2Spec: "Дерматолог-косметолог",
    doc2Exp: "11 лет",
    doc3Name: "Др. Анна Ким",
    doc3Spec: "Челюстно-лицевой хиург",
    doc3Exp: "18 лет",
    bookBtn: "Записаться",
    bookedAlert: "Заявка на консультацию принята!",

    // Settings Modal
    settingsSensitivityTitle: "Высокая чувствительность AI",
    settingsSensitivityDesc: "Обнаружение микро-спазмов на ранних этапах",
    settingsRemindersTitle: "Уведомления о гимнастике",
    settingsRemindersDesc: "Напоминание делать перерыв каждые 2 часа",
    saveBtn: "Сохранить",

    // Results Modal
    resultsTitle: "Результаты AI Скрининга",
    resultsSubtitle: "Завершено в:",
    resultsScoreLabel: "Итоговый индекс здоровья лица",
    resultsScoreStatus: "Превосходно",
    resultsTipsTitle: "Рекомендации системы:",
    resultsSaveBtn: "Принять и сохранить в профиль",
    resultZone1: "Лоб и брови",
    resultZone2: "Периорбитальная зона",
    resultZone3: "Скулы и щёки",
    resultZone4: "Губы и рот",
    resultStatusRelaxed: "Расслаблены (98%)",
    resultStatusFresh: "Свежий вид (94%)",
    resultStatusSymmetric: "Симметрия 99%",
    resultStatusNormal: "В норме (96%)",

    // Theme
    themeDark: "Тёмная тема",
    themeLight: "Светлая тема",
    themeToggle: "Переключить тему",
  },

  en: {
    // Navigation & Header
    brandCore: "CORE",
    brandMedicine: "MEDICINE",
    greeting: "Good Morning, Alex",
    aiActive: "AI Active",
    searchPlaceholder: "Search zones and biomarkers...",
    tabDashboard: "Dashboard",
    tabAnalytics: "Analytics",
    tabReports: "Reports",
    historyTitle: "Screening History",
    specialistsTitle: "Medical Specialists",
    settingsTitle: "Preferences & Settings",

    // Hero Section
    heroBadge: "BioControl • AI Health Research Platform",
    heroTitlePrefix: "What's Up With Your Health,",
    heroTitleHighlight: "TODAY! 🩺",
    startScanBtn: "Start Facial AI Screening",

    // Left Widgets
    facialToneTitle: "Facial Muscular Tone",
    toneGrowth: "+4.8%",
    conditionTitle: "Condition",
    conditionStatus: "Excellent",
    pillsCount: "3",
    pillsUnit: "Pills",
    bloodTitle: "Blood Flow",
    bloodStatus: "Normal",
    deepSleepTitle: "Deep Sleep",
    deepSleepHours: "2 hours",

    // Center Stage
    mapTitle: "Facial Anatomy Map",
    interactiveBiomarkers: "Interactive Biomarkers",
    hdMedicalView: "HD Medical View",
    clickZonePrompt: "Click any facial area for bio-recommendations",
    toneNormalBadge: "Tone Optimal (96%)",
    zoneForehead: "Frontalis Muscles",
    zoneForeheadStat: "Relaxed (98%)",
    zoneEyes: "Periorbital Zone",
    zoneEyesStat: "Fresh View (94%)",
    zoneCheeks: "Zygomatic & Microflow",
    zoneCheeksStat: "Optimal (96%)",
    zoneLips: "Orbicularis Oris",
    zoneLipsStat: "Symmetry 99%",
    heartActivityTitle: "Heart Activity",
    heartActivityValue: "68 bpm • Normal",
    breathActivityTitle: "Breath Rate",
    breathActivityValue: "16 rpm • Normal",
    facialSymmetryTitle: "Facial Symmetry",
    facialSymmetryValue: "98.4% Optimal",
    aiHealthIndexTitle: "AI Health Index",
    aiHealthIndexValue: "Best Performance",

    // Zone Detail Card
    tabBiomarkers: "Biomarkers",
    tabGymnastics: "Gymnastics (30s)",
    tabAnatomy: "Anatomy",
    muscleStateTitle: "MUSCLE STATUS",
    muscleStateDesc: "No spasms or micro-tension detected",
    muscleStateSub: "Mimic muscular load is perfectly balanced.",
    aiRecommendationTitle: "AI RECOMMENDATION",
    aiRecommendationDesc: "Preventative Maintenance",
    aiRecommendationSub: "Maintain consistent cellular hydration balance.",
    exerciseTitle: "Exercise: Gentle Zone Relaxation",
    exerciseDesc: "Close your eyes and breathe in deeply for 4 seconds.",
    anatomyStructureTitle: "Anatomical Structure: Frontalis & Corrugator",
    anatomyStructureDesc: "Innervated by the facial nerve (CN VII). Vascularized by supraorbital and supratrochlear arteries.",

    // Right Widgets
    restTimeTitle: "Rest Time",
    restTimeValue: "7h 45m",
    hydrationTitle: "Hydration",
    hydrationValue: "750 ml",
    hydrationGrowth: "+15% vs yesterday",
    heartMonitorTitle: "Heart Activity",
    heartMonitorValue: "68 bpm",
    dailyMoodTitle: "Daily Mood:",

    // Numbered Editorial Section (Bottom)
    num1Title: "Sub-Millimeter Tension Mapping",
    num1Desc: "Contactless high-resolution tracking of frontalis, zygomaticus, and orbicularis oculi muscular tone.",
    num2Title: "Micro-Circulation & Hydration",
    num2Desc: "Real-time optical spectrometry assessing blood perfusion, capillary oxygen, and epidermal elasticity.",
    num3Title: "Regenerative AI Interventions",
    num3Desc: "Personalized 30-second facial gymnastics routines and instantaneous medical specialist validation.",

    // Scanner Modal
    scannerModalTitle: "AI Facial Bio-Screening",
    scannerModalSubtitle: "Contactless analysis of facial zones and tone",
    scannerModeCamera: "Webcam",
    scannerModeUpload: "Upload Photo",
    scannerCenterFace: "Center face in oval",
    scannerLightingTip: "Direct gaze and natural lighting recommended",
    scannerUploadPrompt: "Click to choose portrait photo",
    scannerUploadFormats: "JPG, PNG, WEBP supported",
    scannerBtnCancel: "Cancel",
    scannerBtnStart: "Start Screening",
    scannerBtnAnalyzing: "Analyzing...",
    scanStep1: "Calibrating AI sensors...",
    scanStep2: "Evaluating muscular tone and symmetry...",
    scanStep3: "Assessing microcirculation and biomarkers...",

    // History Modal
    historyModalTitle: "Screening History",
    historyModalSubtitle: "Facial biomarker progression and trends",
    historyItem1Date: "Today, 10:54",
    historyItem1Status: "Excellent",
    historyItem1Note: "Muscles relaxed, symmetry 99%",
    historyItem2Date: "Yesterday, 18:20",
    historyItem2Status: "Good",
    historyItem2Note: "Mild periorbital fatigue detected",
    historyItem3Date: "Sep 24, 09:15",
    historyItem3Status: "Optimal",
    historyItem3Note: "Tone restored after routine gymnastics",
    modalCloseBtn: "Close",

    // Specialists Modal
    specialistsModalTitle: "Medical Specialists",
    specialistsModalSubtitle: "Board-certified doctors and clinical centers",
    doc1Name: "Dr. Elena Voronova",
    doc1Spec: "Neurologist, MD, PhD",
    doc1Exp: "14 yrs",
    doc2Name: "Dr. Mikhail Sokolov",
    doc2Spec: "Dermatologist-Cosmetologist",
    doc2Exp: "11 yrs",
    doc3Name: "Dr. Anna Kim",
    doc3Spec: "Maxillofacial Surgeon",
    doc3Exp: "18 yrs",
    bookBtn: "Book Appointment",
    bookedAlert: "Consultation request successfully submitted!",

    // Settings Modal
    settingsSensitivityTitle: "High AI Sensitivity",
    settingsSensitivityDesc: "Detect micro-spasms in earliest formation stage",
    settingsRemindersTitle: "Gymnastics Reminders",
    settingsRemindersDesc: "Notify to take a 30-second rest every 2 hours",
    saveBtn: "Save Preferences",

    // Results Modal
    resultsTitle: "AI Screening Results",
    resultsSubtitle: "Completed at:",
    resultsScoreLabel: "Overall Facial Health Score",
    resultsScoreStatus: "Excellent",
    resultsTipsTitle: "System Recommendations:",
    resultsSaveBtn: "Accept & Save to Medical Profile",
    resultZone1: "Forehead & Brow",
    resultZone2: "Periorbital Zone",
    resultZone3: "Cheeks & Midface",
    resultZone4: "Lips & Mouth",
    resultStatusRelaxed: "Relaxed (98%)",
    resultStatusFresh: "Fresh View (94%)",
    resultStatusSymmetric: "Symmetric 99%",
    resultStatusNormal: "Optimal (96%)",

    // Theme
    themeDark: "Dark Mode",
    themeLight: "Light Mode",
    themeToggle: "Toggle Theme",
  },
};
