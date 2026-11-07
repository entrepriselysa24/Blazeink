import type { Locale } from "@/lib/i18n";

/**
 * Portfolio — real work by Biagio only.
 *
 * To add a piece:
 * 1. Put the photo in /public/images/portfolio/ with a descriptive name
 *    (e.g. ornamental-forearm-mandala.jpg). JPG/PNG at ~1600–2400px on the long side is ideal:
 *    Next.js generates AVIF/WebP versions automatically.
 * 2. Add an entry below. `width`/`height` are the real pixel size of the file.
 *    `layout` + `focus` decide how the photo sits in the grid tile; the lightbox always shows it whole.
 *    Keep the grid full: on desktop (3 columns) a "tall" piece counts 2 cells, a "standard" one 1 cell.
 * Order = display order. Ornamental & Blackwork first; other styles stay secondary.
 */

export type PortfolioCategory = "ornamental" | "studio";

type L10n = Record<Locale, string>;

export type PortfolioItem = {
  id: string;
  /** Pieces from the same session share a group id. */
  group: string;
  category: PortfolioCategory;
  type: "image" | "video";
  src: string;
  /** For videos: still image shown before playback. */
  poster?: string;
  width: number;
  height: number;
  /** "tall" spans two rows of the grid; "standard" is one cell. */
  layout: "tall" | "standard";
  /** Which part of the photo stays visible in the grid tile (CSS object-position). The lightbox shows it whole. */
  focus?: string;
  title: L10n;
  alt: L10n;
};

export const portfolio: PortfolioItem[] = [
  {
    id: "bodysuit-three-quarter",
    group: "dark-ornamental-bodysuit",
    category: "ornamental",
    type: "image",
    src: "/images/portfolio/dark-ornamental-bodysuit-three-quarter.jpg",
    width: 720,
    height: 1140,
    layout: "standard",
    focus: "50% 40%",
    title: { en: "Dark ornamental torso", it: "Torso dark ornamental", es: "Torso dark ornamental" },
    alt: {
      en: "Front torso piece in dark ornamental blackwork seen at three-quarter angle: a sternum emblem and serpents following the ribs",
      it: "Pezzo frontale sul torso in dark ornamental blackwork, visto di tre quarti: emblema sullo sterno e serpenti che seguono le costole",
      es: "Pieza frontal en el torso en dark ornamental blackwork, vista de tres cuartos: emblema en el esternón y serpientes que siguen las costillas",
    },
  },
  {
    id: "dark-ornamental-hands",
    group: "dark-ornamental-hands",
    category: "ornamental",
    type: "image",
    src: "/images/portfolio/dark-ornamental-hands.jpg",
    width: 990,
    height: 1399,
    layout: "standard",
    focus: "50% 22%",
    title: { en: "Dark ornamental hands", it: "Mani dark ornamental", es: "Manos dark ornamental" },
    alt: {
      en: "Matching dark ornamental blackwork pieces on the backs of both hands and wrists",
      it: "Due pezzi speculari dark ornamental in blackwork sul dorso di entrambe le mani e sui polsi",
      es: "Dos piezas simétricas dark ornamental en blackwork sobre el dorso de ambas manos y las muñecas",
    },
  },
  {
    id: "blackwork-moth-chest",
    group: "blackwork-moth-chest",
    category: "ornamental",
    type: "image",
    src: "/images/portfolio/blackwork-moth-chest.jpg",
    width: 1257,
    height: 1407,
    layout: "standard",
    focus: "50% 52%",
    title: { en: "Moth, chest", it: "Falena sul petto", es: "Polilla en el pecho" },
    alt: {
      en: "Blackwork moth with ornamental wing patterns spread across the upper chest",
      it: "Falena in blackwork con ali a motivi ornamentali, aperta sulla parte alta del petto",
      es: "Polilla en blackwork con alas de motivos ornamentales, abierta sobre la parte alta del pecho",
    },
  },
  {
    id: "dark-ornamental-collarbone",
    group: "dark-ornamental-collarbone",
    category: "ornamental",
    type: "image",
    src: "/images/portfolio/dark-ornamental-collarbone-neck.jpg",
    width: 1320,
    height: 1590,
    layout: "standard",
    focus: "50% 45%",
    title: { en: "Dark ornamental, neck & collarbone", it: "Dark ornamental, collo e clavicole", es: "Dark ornamental, cuello y clavículas" },
    alt: {
      en: "Thorny dark ornamental blackwork running from the neck across both collarbones",
      it: "Blackwork dark ornamental a spine che scende dal collo e attraversa le clavicole",
      es: "Blackwork dark ornamental con espinas que baja del cuello y cruza las clavículas",
    },
  },
  {
    id: "dark-ornamental-full-back",
    group: "dark-ornamental-full-back",
    category: "ornamental",
    type: "image",
    src: "/images/portfolio/dark-ornamental-full-back.jpg",
    width: 416,
    height: 657,
    layout: "standard",
    focus: "50% 38%",
    title: { en: "Dark ornamental, full back", it: "Dark ornamental, schiena intera", es: "Dark ornamental, espalda completa" },
    alt: {
      en: "Mirrored dark ornamental blackwork flowing from the neck and shoulders down the whole back",
      it: "Blackwork dark ornamental speculare che scende dal collo e dalle spalle lungo tutta la schiena",
      es: "Blackwork dark ornamental simétrico que baja desde el cuello y los hombros por toda la espalda",
    },
  },
  {
    id: "blackwork-leopard-foot",
    group: "blackwork-leopard-foot",
    category: "ornamental",
    type: "image",
    src: "/images/portfolio/blackwork-leopard-foot.jpg",
    width: 1320,
    height: 1691,
    layout: "standard",
    focus: "50% 45%",
    title: { en: "Leopard, foot", it: "Leopardo sul piede", es: "Leopardo en el pie" },
    alt: {
      en: "Blackwork leopard stalking down the top of the foot, its spots shaded in black",
      it: "Leopardo in blackwork che scende sul dorso del piede, con le macchie sfumate in nero",
      es: "Leopardo en blackwork que baja por el empeine del pie, con las manchas sombreadas en negro",
    },
  },
];
