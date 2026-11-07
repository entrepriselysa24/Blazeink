import { ArrowDown, ArrowRight } from "lucide-react";
import type { Dictionary, Locale } from "@/lib/i18n";
import Parallax from "./Parallax";
import HeroVideo from "./HeroVideo";

export default function Hero({ t }: { lang: Locale; t: Dictionary["hero"] }) {
  return (
    <section id="top" aria-labelledby="hero-title" className="grain relative isolate flex min-h-[100svh] items-end overflow-hidden bg-void">
      {/* Real footage of Biagio at work, silent and looping, behind the headline */}
      <Parallax className="absolute inset-0 -z-10" speed={0.12}>
        <HeroVideo label={t.photoAlt} />
      </Parallax>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,#000_0%,rgba(0,0,0,0.88)_32%,rgba(0,0,0,0.35)_62%,rgba(0,0,0,0.15)_100%)] max-md:bg-[linear-gradient(0deg,#000_8%,rgba(0,0,0,0.82)_48%,rgba(0,0,0,0.25)_100%)]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-ink to-transparent" />

      <div className="mx-auto w-full max-w-[1400px] px-[var(--gutter)] pb-[clamp(56px,9vh,110px)] pt-40">
        <p className="eyebrow reveal">{t.subtitle}</p>
        <h1 id="hero-title" className="reveal mt-6 font-display text-[clamp(2.6rem,7.4vw,6.6rem)] font-normal uppercase leading-[0.98] tracking-[0.04em] text-silver" style={{ ["--reveal-delay" as string]: "0.1s" }}>
          <span className="block">{t.headline[0]}</span>
          <span className="block text-bone">{t.headline[1]}</span>
        </h1>
        <p className="reveal mt-8 max-w-md font-script text-[clamp(1.35rem,2.2vw,1.75rem)] italic leading-snug text-silver/90" style={{ ["--reveal-delay" as string]: "0.25s" }}>
          {t.intro}
        </p>
        <div className="reveal mt-10 flex flex-wrap gap-3" style={{ ["--reveal-delay" as string]: "0.4s" }}>
          <a href="#booking" className="btn">
            {t.ctaBook} <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
          </a>
          <a href="#work" className="btn btn-ghost">
            {t.ctaWork}
          </a>
        </div>

        <div className="reveal mt-16 flex flex-wrap items-center gap-x-10 gap-y-3 border-t border-white/[0.08] pt-6 text-[0.68rem] uppercase tracking-[0.26em] text-ash" style={{ ["--reveal-delay" as string]: "0.55s" }}>
          <span>{t.based}</span>
          <span className="flex items-center gap-3 text-bone">
            <span className="relative flex h-1.5 w-1.5" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-ember opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ember" />
            </span>
            {t.next}
          </span>
          <a href="#work" className="ml-auto hidden items-center gap-2 text-ash transition-colors hover:text-bone md:flex" aria-label={t.ctaWork}>
            <ArrowDown size={14} strokeWidth={1.25} aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}
