import Image from "next/image";
import { journey } from "@/content/journey";
import type { Dictionary, Locale } from "@/lib/i18n";

export default function ArtistJourney({ lang, t }: { lang: Locale; t: Dictionary["artist"] }) {
  return (
    <section id="artist" aria-labelledby="artist-title" className="relative overflow-hidden border-y border-white/[0.05] bg-void py-[clamp(96px,13vw,180px)]">
      <div className="mx-auto grid max-w-[1400px] gap-x-[clamp(40px,7vw,110px)] gap-y-10 px-[var(--gutter)] md:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] md:items-end">
        <div className="min-w-0">
          <p className="eyebrow reveal">{t.eyebrow}</p>
          <h2 id="artist-title" className="reveal mt-5 font-display text-[clamp(2.2rem,5vw,4rem)] uppercase leading-none tracking-[0.06em] text-silver">
            {t.title}
          </h2>
          <blockquote className="reveal mt-10 border-l border-ember/70 pl-6 font-script text-[clamp(1.5rem,2.6vw,2.1rem)] italic leading-snug text-bone" style={{ ["--reveal-delay" as string]: "0.1s" }}>
            “{t.quote}”
          </blockquote>
        </div>

        <div className="min-w-0">
          <div className="space-y-5 text-[1rem] leading-relaxed text-ash">
            {t.body.map((p, i) => (
              <p key={i} className="reveal max-w-[60ch]" style={{ ["--reveal-delay" as string]: `${0.15 + i * 0.08}s` }}>
                {p}
              </p>
            ))}
          </div>
          <dl className="reveal mt-10 grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 border-t border-white/[0.08] pt-6 text-sm">
            {t.name.map(([term, def]) => (
              <div key={term} className="contents">
                <dt className="font-display tracking-[0.14em] text-silver">{term}</dt>
                <dd className="text-ash">{def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Black and white portrait of Biagio, full width under the quote */}
      <div className="mx-auto mt-[clamp(48px,6vw,80px)] max-w-[1400px] px-[var(--gutter)]">
        <div className="reveal-img relative aspect-[4/3] w-full overflow-hidden md:aspect-[16/9]" style={{ ["--curtain" as string]: "#000" }}>
          <Image
            src="/images/artist/biagio-portrait-bw.jpg"
            alt={t.portraitAlt}
            fill
            sizes="(min-width: 1400px) 1360px, 100vw"
            className="object-cover object-[62%_12%]"
          />
        </div>
      </div>

      {/* Timeline: horizontal on wide screens, vertical on phones */}
      <div className="mx-auto mt-[clamp(72px,9vw,130px)] max-w-[1400px] px-[var(--gutter)]">
        <h3 className="reveal mb-10 text-[0.68rem] font-medium uppercase tracking-[0.3em] text-ash">{t.timelineLabel}</h3>
        <ol className="relative grid gap-0 lg:grid-cols-8">
          <span aria-hidden="true" className="absolute left-[5px] top-2 bottom-2 w-px bg-graphite lg:left-0 lg:right-0 lg:top-[5px] lg:bottom-auto lg:h-px lg:w-auto" />
          {journey.map((stop, i) => (
            <li key={stop.place.en} className="reveal relative pb-8 pl-8 lg:pb-0 lg:pl-0 lg:pr-4 lg:pt-8" style={{ ["--reveal-delay" as string]: `${i * 0.06}s` }}>
              <span
                aria-hidden="true"
                className={`absolute left-0 top-[1px] h-[11px] w-[11px] rounded-full border lg:top-0 ${
                  stop.next ? "border-ember bg-ember shadow-[0_0_14px_rgba(179,38,30,0.8)]" : stop.current ? "border-silver bg-silver" : "border-ash bg-void"
                }`}
              />
              <p className={`text-[0.64rem] uppercase tracking-[0.22em] tabular-nums ${stop.next ? "text-ember" : "text-ash"}`}>
                {stop.next ? `${t.now} · ` : ""}
                {stop.when[lang]}
              </p>
              <p className="mt-2 font-display text-[1.02rem] uppercase leading-tight tracking-[0.08em] text-silver">{stop.place[lang]}</p>
              {stop.note && <p className="mt-1.5 text-[0.85rem] leading-snug text-ash">{stop.note[lang]}</p>}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
