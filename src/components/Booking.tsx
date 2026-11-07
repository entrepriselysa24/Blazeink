"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, ImagePlus, Instagram, Loader2, Mail, X } from "lucide-react";
import { FILE_RULES, STYLE_OPTIONS, TEXT_LIMITS, validateBooking, type BookingFields, type FieldErrors } from "@/lib/booking";
import { site } from "@/lib/site";
import type { Dictionary, Locale } from "@/lib/i18n";

type Status = "idle" | "sending" | "sent" | "error";
type Ref = { id: string; file: File; url: string };

const EMPTY: BookingFields = { name: "", email: "", location: "", idea: "", placement: "", size: "", style: "", budget: "", dates: "", consent: false };

/**
 * Resizes a reference image in the browser and re-encodes it as JPEG.
 * This keeps uploads small and removes EXIF metadata (GPS location, camera data) before anything leaves the device.
 */
async function prepareImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, FILE_RULES.maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close?.();
  const blob: Blob = await new Promise((resolve, reject) => canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode"))), "image/jpeg", 0.85));
  return new File([blob], "reference.jpg", { type: "image/jpeg" });
}

export default function Booking({ lang, t }: { lang: Locale; t: Dictionary["booking"] }) {
  const [fields, setFields] = useState<BookingFields>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [refs, setRefs] = useState<Ref[]>([]);
  const [fileError, setFileError] = useState<string>("");
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string>("");
  const [notConfigured, setNotConfigured] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const formId = useId();

  const refsRef = useRef(refs);
  refsRef.current = refs;
  // Free the image previews when the form unmounts.
  useEffect(() => () => refsRef.current.forEach((r) => URL.revokeObjectURL(r.url)), []);

  const set = <K extends keyof BookingFields>(key: K, value: BookingFields[K]) => {
    setFields((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const errorText = (key: keyof BookingFields) => {
    const e = errors[key];
    if (!e) return "";
    if (e === "style") return t.errors.required;
    return t.errors[e];
  };

  const onFiles = async (list: FileList | null) => {
    setFileError("");
    if (!list?.length) return;
    const incoming = Array.from(list);
    if (refs.length + incoming.length > FILE_RULES.maxFiles) {
      setFileError(t.errors.fileCount);
      return;
    }
    const added: Ref[] = [];
    for (const f of incoming) {
      if (!(FILE_RULES.mimeTypes as readonly string[]).includes(f.type)) {
        setFileError(t.errors.fileType);
        continue;
      }
      if (f.size > 25 * 1024 * 1024) {
        setFileError(t.errors.fileSize);
        continue;
      }
      try {
        const prepared = await prepareImage(f);
        if (prepared.size > FILE_RULES.maxBytes) {
          setFileError(t.errors.fileSize);
          continue;
        }
        added.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, file: prepared, url: URL.createObjectURL(prepared) });
      } catch {
        setFileError(t.errors.fileType);
      }
    }
    setRefs((r) => [...r, ...added]);
    if (fileInput.current) fileInput.current.value = "";
  };

  const removeRef = (id: string) => {
    setRefs((r) => {
      const gone = r.find((x) => x.id === id);
      if (gone) URL.revokeObjectURL(gone.url);
      return r.filter((x) => x.id !== id);
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const honeypot = (e.currentTarget.elements.namedItem("website") as HTMLInputElement | null)?.value || "";
    const v = validateBooking(fields);
    setErrors(v);
    if (Object.keys(v).length) {
      setStatus("error");
      setMessage(t.errors.fix);
      const first = Object.keys(v)[0];
      document.getElementById(`${formId}-${first}`)?.focus();
      return;
    }

    setStatus("sending");
    setMessage("");
    const body = new FormData();
    (Object.keys(fields) as (keyof BookingFields)[]).forEach((k) => body.append(k, k === "consent" ? (fields.consent ? "yes" : "") : String(fields[k])));
    body.append("locale", lang);
    body.append("website", honeypot);
    refs.forEach((r) => body.append("references", r.file, r.file.name));

    try {
      const res = await fetch("/api/booking", { method: "POST", body });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; fields?: FieldErrors };
      if (res.ok && data.ok) {
        setStatus("sent");
        setFields(EMPTY);
        setRefs([]);
        requestAnimationFrame(() => statusRef.current?.focus());
        return;
      }
      setStatus("error");
      if (data.error === "not_configured") {
        setNotConfigured(true);
        setMessage(t.errors.notConfigured);
      } else if (data.error === "rate_limited") setMessage(t.errors.rateLimited);
      else if (data.error === "invalid" && data.fields) {
        setErrors(data.fields);
        setMessage(t.errors.fix);
      } else if (data.error === "file_type") setMessage(t.errors.fileType);
      else if (data.error === "file_size" || data.error === "too_large") setMessage(t.errors.fileSize);
      else if (data.error === "file_count") setMessage(t.errors.fileCount);
      else setMessage(t.errors.server);
    } catch {
      setStatus("error");
      setMessage(t.errors.network);
    }
    requestAnimationFrame(() => statusRef.current?.focus());
  };

  const field = (key: keyof Omit<BookingFields, "consent" | "style">, label: string, opts: { type?: string; hint?: string; optional?: boolean; autoComplete?: string; textarea?: boolean; className?: string } = {}) => {
    const id = `${formId}-${key}`;
    const err = errorText(key);
    const describedBy = [opts.hint && `${id}-hint`, err && `${id}-err`].filter(Boolean).join(" ") || undefined;
    const common = {
      id,
      name: key,
      value: fields[key],
      maxLength: TEXT_LIMITS[key as keyof typeof TEXT_LIMITS],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key, e.target.value),
      "aria-invalid": err ? true : undefined,
      "aria-describedby": describedBy,
      required: !opts.optional,
      autoComplete: opts.autoComplete,
      className: "field",
      placeholder: opts.hint,
    };
    return (
      <div className={opts.className}>
        <label htmlFor={id} className="field-label">
          {label}
          {opts.optional && <span className="ml-2 normal-case tracking-normal text-ash/70">({t.fields.optional})</span>}
        </label>
        {opts.textarea ? <textarea rows={5} {...common} /> : <input type={opts.type || "text"} {...common} />}
        {opts.hint && <span id={`${id}-hint`} className="sr-only">{opts.hint}</span>}
        {err && (
          <p id={`${id}-err`} className="mt-2 text-xs text-[#e0645b]">
            {err}
          </p>
        )}
      </div>
    );
  };

  const styleId = `${formId}-style`;
  const consentId = `${formId}-consent`;

  return (
    <section id="booking" aria-labelledby="booking-title" className="relative bg-ink py-[clamp(96px,13vw,180px)]">
      <div className="mx-auto grid max-w-[1400px] gap-[clamp(48px,7vw,110px)] px-[var(--gutter)] lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)]">
        <div className="min-w-0 lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow reveal">{t.eyebrow}</p>
          <h2 id="booking-title" className="reveal mt-5 font-display text-[clamp(2.2rem,5vw,4rem)] uppercase leading-none tracking-[0.06em] text-silver">
            {t.title}
          </h2>
          <p className="reveal mt-6 max-w-md leading-relaxed text-ash" style={{ ["--reveal-delay" as string]: "0.1s" }}>
            {t.lead}
          </p>
          <p className="reveal mt-4 max-w-md text-sm text-ash/80" style={{ ["--reveal-delay" as string]: "0.15s" }}>
            {t.note}
          </p>

          <div className="reveal mt-12 border-t border-white/[0.08] pt-8" style={{ ["--reveal-delay" as string]: "0.2s" }}>
            <h3 className="text-[0.68rem] font-medium uppercase tracking-[0.3em] text-ash">{t.contact.title}</h3>
            <ul className="mt-6 space-y-4">
              <li>
                <a href={site.instagram.url} target="_blank" rel="noopener noreferrer" className="group flex items-center gap-4 text-bone">
                  <Instagram size={18} strokeWidth={1.25} className="text-silver" aria-hidden="true" />
                  <span className="link-line">{site.instagram.handle}</span>
                  <ArrowUpRight size={14} strokeWidth={1.25} className="text-ash transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
              </li>
              {site.contactEmail && (
                <li>
                  <a href={`mailto:${site.contactEmail}`} className="group flex items-center gap-4 text-bone">
                    <Mail size={18} strokeWidth={1.25} className="text-silver" aria-hidden="true" />
                    <span className="link-line">{site.contactEmail}</span>
                  </a>
                </li>
              )}
            </ul>
            <p className="mt-8 text-[0.66rem] uppercase tracking-[0.24em] text-ash">
              {t.contact.based} · {site.locations.join(" → ")}
            </p>
          </div>
        </div>

        <div className="min-w-0">
          {status === "sent" ? (
            <div ref={statusRef} tabIndex={-1} role="status" className="flex min-h-[420px] flex-col justify-center border border-white/[0.08] p-[clamp(28px,5vw,64px)] outline-none">
              <p className="eyebrow">Blaze Ink</p>
              <p className="mt-6 font-display text-[clamp(1.8rem,3.4vw,2.8rem)] uppercase tracking-[0.06em] text-silver">{t.success.title}</p>
              <p className="mt-5 max-w-md leading-relaxed text-ash">{t.success.body}</p>
              <div className="mt-10">
                <button type="button" className="btn btn-ghost" onClick={() => setStatus("idle")}>
                  {t.success.again}
                </button>
              </div>
            </div>
          ) : (
            <form noValidate onSubmit={onSubmit} className="reveal grid grid-cols-1 gap-x-10 gap-y-9 sm:grid-cols-2" aria-describedby={message ? `${formId}-status` : undefined}>
              {field("name", t.fields.name, { autoComplete: "name" })}
              {field("email", t.fields.email, { type: "email", autoComplete: "email" })}
              {field("location", t.fields.location, { autoComplete: "country-name" })}
              <div>
                <label htmlFor={styleId} className="field-label">
                  {t.fields.style}
                </label>
                <select
                  id={styleId}
                  name="style"
                  value={fields.style}
                  onChange={(e) => set("style", e.target.value)}
                  required
                  aria-invalid={errors.style ? true : undefined}
                  aria-describedby={errors.style ? `${styleId}-err` : undefined}
                  className="field pr-6"
                >
                  <option value="" disabled>
                    —
                  </option>
                  {STYLE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {t.fields.styles[s]}
                    </option>
                  ))}
                </select>
                {errors.style && (
                  <p id={`${styleId}-err`} className="mt-2 text-xs text-[#e0645b]">
                    {t.errors.required}
                  </p>
                )}
              </div>
              {field("idea", t.fields.idea, { textarea: true, hint: t.fields.ideaHint, className: "sm:col-span-2" })}
              {field("placement", t.fields.placement, { hint: t.fields.placementHint })}
              {field("size", t.fields.size, { hint: t.fields.sizeHint })}
              {field("dates", t.fields.dates, { hint: t.fields.datesHint })}
              {field("budget", t.fields.budget, { hint: t.fields.budgetHint, optional: true })}

              {/* Reference images */}
              <div className="sm:col-span-2">
                <span className="field-label" id={`${formId}-files-label`}>
                  {t.fields.files}
                  <span className="ml-2 normal-case tracking-normal text-ash/70">({t.fields.optional})</span>
                </span>
                <p id={`${formId}-files-hint`} className="mb-4 max-w-xl text-xs leading-relaxed text-ash">
                  {t.fields.filesHint}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  {refs.map((r) => (
                    <div key={r.id} className="relative h-20 w-20 overflow-hidden border border-graphite">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.url} alt="" className="h-full w-full object-cover" />
                      <button type="button" onClick={() => removeRef(r.id)} aria-label={t.fields.remove} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center bg-black/70 text-bone hover:bg-ember">
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  {refs.length < FILE_RULES.maxFiles && (
                    <label className="flex h-20 cursor-pointer items-center gap-3 border border-dashed border-graphite px-5 text-[0.68rem] uppercase tracking-[0.2em] text-ash transition-colors hover:border-ash hover:text-bone focus-within:border-silver">
                      <ImagePlus size={18} strokeWidth={1.25} aria-hidden="true" />
                      {t.fields.filesButton}
                      <input
                        ref={fileInput}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        className="sr-only"
                        aria-labelledby={`${formId}-files-label`}
                        aria-describedby={`${formId}-files-hint`}
                        onChange={(e) => onFiles(e.target.files)}
                      />
                    </label>
                  )}
                </div>
                {fileError && <p className="mt-3 text-xs text-[#e0645b]" role="alert">{fileError}</p>}
              </div>

              {/* Honeypot (hidden from people and assistive tech) */}
              <div aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
                <label>
                  Website <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </label>
              </div>

              <div className="sm:col-span-2">
                <label htmlFor={consentId} className="flex cursor-pointer items-start gap-4 text-sm leading-relaxed text-ash">
                  <input
                    id={consentId}
                    type="checkbox"
                    checked={fields.consent}
                    onChange={(e) => set("consent", e.target.checked)}
                    aria-invalid={errors.consent ? true : undefined}
                    aria-describedby={errors.consent ? `${consentId}-err` : undefined}
                    className="mt-1 h-4 w-4 shrink-0 accent-[#b3261e]"
                  />
                  <span>
                    {t.fields.consent}{" "}
                    <Link href={lang === "en" ? "/en/privacy" : `/${lang}/privacy`} className="text-bone underline decoration-graphite underline-offset-4 hover:decoration-bone">
                      {t.fields.privacy}
                    </Link>
                    .
                  </span>
                </label>
                {errors.consent && (
                  <p id={`${consentId}-err`} className="mt-2 text-xs text-[#e0645b]">
                    {t.errors.consent}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-5 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <button type="submit" className="btn justify-center" disabled={status === "sending"} aria-busy={status === "sending"}>
                  {status === "sending" ? (
                    <>
                      <Loader2 size={14} className="animate-spin" aria-hidden="true" /> {t.sending}
                    </>
                  ) : (
                    <>
                      {t.submit} <ArrowRight size={14} strokeWidth={1.5} aria-hidden="true" />
                    </>
                  )}
                </button>
                <div id={`${formId}-status`} ref={statusRef} tabIndex={-1} role="alert" aria-live="assertive" className="text-sm text-[#e0645b] outline-none">
                  {status === "error" && message}
                  {notConfigured && (
                    <a href={site.instagram.dm} target="_blank" rel="noopener noreferrer" className="ml-2 text-bone underline underline-offset-4">
                      {t.contact.dm}
                    </a>
                  )}
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
