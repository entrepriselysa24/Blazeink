import type { Metadata, Viewport } from "next";
import { Cinzel, Cormorant_Garamond, Inter } from "next/font/google";
import { getDictionary, homePath, isLocale, locales, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import "../globals.css";

const cinzel = Cinzel({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-cinzel", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["300", "400", "500", "600"], variable: "--font-inter", display: "swap" });
const cormorant = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500"], style: ["italic"], variable: "--font-cormorant", display: "swap" });

export const dynamicParams = false;
export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export const viewport: Viewport = {
  themeColor: "#0b0b0b",
  colorScheme: "dark",
  viewportFit: "cover",
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  const languages = Object.fromEntries(locales.map((l) => [l, homePath(l)]));
  return {
    metadataBase: new URL(site.url),
    title: t.meta.title,
    description: t.meta.description,
    alternates: { canonical: homePath(lang), languages: { ...languages, "x-default": "/" } },
    openGraph: {
      type: "website",
      siteName: site.name,
      title: t.meta.title,
      description: t.meta.description,
      url: homePath(lang),
      locale: { en: "en_GB", it: "it_IT", es: "es_ES" }[lang],
      images: [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "Blaze Ink" }],
    },
    twitter: { card: "summary_large_image", title: t.meta.title, description: t.meta.description, images: ["/og-image.jpg"] },
    robots: { index: true, follow: true },
  };
}

/**
 * Runs before first paint: marks JS as available (for scroll reveals) and decides whether the intro plays.
 * The intro is skipped when it has been seen in the last 14 days, with reduced motion, or with data saving on.
 */
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');try{var s=localStorage.getItem('bi-intro-seen');var recent=s&&(Date.now()-Number(s))<12096e5;var rm=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;var c=navigator.connection;var save=c&&(c.saveData||/(^|-)2g$/.test(c.effectiveType||''));if(recent||rm||save||location.hash){d.setAttribute('data-intro','off');}}catch(e){d.setAttribute('data-intro','off');}})();`;

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang: requested } = await params;
  // Unknown segments still render the 404 page inside this layout, in English.
  const lang: Locale = isLocale(requested) ? requested : "en";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Biagio",
    alternateName: site.name,
    jobTitle: "Tattoo Artist",
    description: getDictionary(lang).meta.description,
    url: site.url,
    image: `${site.url}/images/artist/biagio-portrait-close.jpg`,
    sameAs: [site.instagram.url],
    knowsAbout: ["Ornamental tattoo", "Blackwork tattoo"],
    birthPlace: "Canosa di Puglia",
  };

  return (
    <html lang={lang} className={`${cinzel.variable} ${inter.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <noscript>
          <style>{`.intro{display:none!important}`}</style>
        </noscript>
        <link rel="preload" as="image" href="/brand/blaze-ink-emblem.png" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
