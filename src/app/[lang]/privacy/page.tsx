import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getDictionary, homePath, isLocale } from "@/lib/i18n";
import { site } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const t = getDictionary(lang);
  return { title: `${t.privacy.title} — Blaze Ink`, robots: { index: false, follow: true }, alternates: { canonical: `/${lang}/privacy` } };
}

export default async function PrivacyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <main className="mx-auto min-h-[100svh] max-w-3xl px-[var(--gutter)] py-28">
      <Link href={homePath(lang)} className="inline-flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.24em] text-ash hover:text-bone">
        <ArrowLeft size={14} strokeWidth={1.25} aria-hidden="true" /> {t.privacy.back}
      </Link>
      <h1 className="mt-12 font-display text-[clamp(2rem,4.5vw,3.2rem)] uppercase tracking-[0.06em] text-silver">{t.privacy.title}</h1>
      <p className="mt-4 text-sm text-ash">{t.privacy.updated}</p>
      <div className="mt-14 space-y-10">
        {t.privacy.sections.map(([title, body]) => (
          <section key={title}>
            <h2 className="text-[0.7rem] font-medium uppercase tracking-[0.26em] text-bone">{title}</h2>
            <p className="mt-3 max-w-[65ch] leading-relaxed text-ash">{body}</p>
          </section>
        ))}
        <section>
          <h2 className="text-[0.7rem] font-medium uppercase tracking-[0.26em] text-bone">Contact</h2>
          <p className="mt-3 leading-relaxed text-ash">
            <a href={site.instagram.url} className="text-bone underline underline-offset-4" target="_blank" rel="noopener noreferrer">
              {site.instagram.handle}
            </a>
            {site.contactEmail && (
              <>
                {" · "}
                <a href={`mailto:${site.contactEmail}`} className="text-bone underline underline-offset-4">
                  {site.contactEmail}
                </a>
              </>
            )}
          </p>
        </section>
      </div>
    </main>
  );
}
