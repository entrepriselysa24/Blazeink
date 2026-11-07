import type { Locale } from "@/lib/i18n";

/**
 * The journey, as told by Biagio. Only confirmed facts.
 * `when` is a period label, not a forced date: where the year is not certain, the length of the stay is shown instead.
 */
type L10n = Record<Locale, string>;

export type JourneyStop = { place: L10n; when: L10n; note?: L10n; current?: boolean; next?: boolean };

export const journey: JourneyStop[] = [
  {
    place: { en: "Canosa di Puglia", it: "Canosa di Puglia", es: "Canosa di Puglia" },
    when: { en: "Origins", it: "Origini", es: "Orígenes" },
    note: { en: "Where it starts.", it: "Dove tutto comincia.", es: "Donde empieza todo." },
  },
  {
    place: { en: "Malta", it: "Malta", es: "Malta" },
    when: { en: "c. 2016", it: "2016 circa", es: "h. 2016" },
    note: { en: "First month abroad. English college.", it: "Il primo mese all'estero. College di inglese.", es: "El primer mes fuera. College de inglés." },
  },
  {
    place: { en: "Málaga", it: "Málaga", es: "Málaga" },
    when: { en: "From 2019", it: "Dal 2019", es: "Desde 2019" },
    note: { en: "Almost a year.", it: "Quasi un anno.", es: "Casi un año." },
  },
  {
    place: { en: "Pesaro", it: "Pesaro", es: "Pésaro" },
    when: { en: "3 years", it: "3 anni", es: "3 años" },
    note: { en: "Tattooing, and factory shifts to keep going.", it: "Tatuaggi, e turni in fabbrica per andare avanti.", es: "Tatuajes, y turnos en la fábrica para seguir adelante." },
  },
  {
    place: { en: "Germany", it: "Germania", es: "Alemania" },
    when: { en: "2 months", it: "2 mesi", es: "2 meses" },
  },
  {
    place: { en: "Austria", it: "Austria", es: "Austria" },
    when: { en: "c. 4 months", it: "circa 4 mesi", es: "unos 4 meses" },
  },
  {
    place: { en: "Ibiza · Sant Antoni", it: "Ibiza · Sant Antoni", es: "Ibiza · Sant Antoni" },
    when: { en: "Last 4 years", it: "Ultimi 4 anni", es: "Últimos 4 años" },
    note: { en: "The professional chapter.", it: "Il capitolo professionale.", es: "El capítulo profesional." },
    current: true,
  },
  {
    place: { en: "Zanzibar", it: "Zanzibar", es: "Zanzíbar" },
    when: { en: "From 4 Nov 2026", it: "Dal 4 nov 2026", es: "Desde el 4 nov 2026" },
    note: { en: "The next mark.", it: "Il prossimo segno.", es: "La próxima marca." },
    next: true,
  },
];
