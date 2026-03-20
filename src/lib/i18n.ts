export type Lang = "fr" | "en" | "ar";

export const DEFAULT_LANG: Lang = "fr";

export const STRINGS: Record<
  Lang,
  {
    categoriesTitle: string;
    catalogSubtitle: string;
    searchPlaceholder: string;
    noSearchResults: string;
    episodesLabel: (n: number) => string;
    open: string;
    download: string;
    unavailable: string;
    backTo: (categoryName: string) => string;
    backToPrefix: string;
    downloadProvided: string;
    pageUrlProvided: string;
    noUrlProvided: string;
  }
> = {
  fr: {
    categoriesTitle: "Catégories",
    catalogSubtitle: "Catalogue ToonTales chargé automatiquement côté serveur.",
    searchPlaceholder: "Rechercher une catégorie...",
    noSearchResults: "Aucun résultat pour cette recherche.",
    episodesLabel: (n) => `${n} épisodes`,
    open: "Lire",
    download: "Télécharger",
    unavailable: "Indisponible",
    backTo: (name) => `← Retour à ${name}`,
    backToPrefix: "← Retour à ",
    downloadProvided: "`downloadUrl` fourni",
    pageUrlProvided: "`pageUrl` fourni",
    noUrlProvided: "Aucune URL fournie pour cet épisode",
  },
  en: {
    categoriesTitle: "Categories",
    catalogSubtitle: "ToonTales catalog loaded server-side.",
    searchPlaceholder: "Search a category...",
    noSearchResults: "No results found for this search.",
    episodesLabel: (n) => `${n} episodes`,
    open: "Play",
    download: "Download",
    unavailable: "Unavailable",
    backTo: (name) => `← Back to ${name}`,
    backToPrefix: "← Back to ",
    downloadProvided: "`downloadUrl` provided",
    pageUrlProvided: "`pageUrl` provided",
    noUrlProvided: "No URL available for this episode",
  },
  ar: {
    categoriesTitle: "الفئات",
    catalogSubtitle: "يتم تحميل كتالوج ToonTales من جهة الخادم تلقائيًا.",
    searchPlaceholder: "ابحث عن فئة...",
    noSearchResults: "لا توجد نتائج لهذا البحث.",
    episodesLabel: (n) => `${n} حلقات`,
    open: "تشغيل",
    download: "تحميل",
    unavailable: "غير متاح",
    backTo: (name) => `← العودة إلى ${name}`,
    backToPrefix: "← العودة إلى ",
    downloadProvided: "تم توفير `downloadUrl`",
    pageUrlProvided: "تم توفير `pageUrl`",
    noUrlProvided: "لا يوجد رابط متاح لهذه الحلقة",
  },
};

export function normalizeLang(value: string | undefined | null): Lang {
  if (value === "en" || value === "ar" || value === "fr") return value;
  return DEFAULT_LANG;
}

export function t(lang: Lang) {
  return STRINGS[lang];
}

