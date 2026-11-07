import type { Metadata, Viewport } from "next";
import { getDictionary, homePath, isLocale, locales, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import "../globals.css";

/**
 * Fonts are loaded by the visitor's browser straight from Google Fonts (not downloaded at build time),
 * so a Google Fonts hiccup can never make a Vercel build fail.
 */
const FONTS_CSS =
  "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@1,400;1,500&family=Inter:wght@300;400;500;600&display=swap";
const fontVars = {
  "--font-cinzel": "'Cinzel'",
  "--font-inter": "'Inter'",
  "--font-cormorant": "'Cormorant Garamond'",
} as React.CSSProperties;

/** A wrong NEXT_PUBLIC_SITE_URL (e.g. without https://) must not break the build: fall back to localhost. */
function safeBase(url: string) {
  try {
    return new URL(url);
  } catch {
    try {
      return new URL(`https://${url}`);
    } catch {
      return new URL("http://localhost:3000");
    }
  }
}

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
    metadataBase: safeBase(site.url),
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
    <html lang={lang} style={fontVars} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={FONTS_CSS} />
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
