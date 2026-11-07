import { notFound } from "next/navigation";
import { getDictionary, isLocale } from "@/lib/i18n";
import Intro from "@/components/Intro";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Portfolio from "@/components/Portfolio";
import ArtistJourney from "@/components/ArtistJourney";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";
import Cursor from "@/components/Cursor";
import RevealObserver from "@/components/RevealObserver";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <>
      <Intro t={t.intro} />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[120] focus:bg-bone focus:px-4 focus:py-2 focus:text-ink">
        Skip to content
      </a>
      <Header lang={lang} t={t.nav} />
      <main id="main">
        <Hero lang={lang} t={t.hero} />
        <Portfolio lang={lang} t={t.portfolio} />
        <ArtistJourney lang={lang} t={t.artist} />
        <Booking lang={lang} t={t.booking} />
      </main>
      <Footer lang={lang} t={t.footer} />
      <Cursor />
      <RevealObserver />
    </>
  );
}
