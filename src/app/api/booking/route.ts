import { FILE_RULES, STYLE_OPTIONS, sniffImageType, validateBooking, type BookingFields } from "@/lib/booking";

/**
 * POST /api/booking
 * Receives the booking form (multipart/form-data), validates it, and delivers it by email through Resend.
 * Nothing is stored on the server. If email delivery is not configured, it answers 503 and the
 * form tells the visitor to use Instagram — the request is never "pretend sent".
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Attachment = { filename: string; content: string };

// ── Basic abuse protection: 5 requests per IP every 10 minutes (per server instance). ──
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear();
  return recent.length > MAX_REQUESTS;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

function str(form: FormData, key: string) {
  const v = form.get(key);
  return typeof v === "string" ? v.trim() : "";
}

const REQUIRED_ENV = ["RESEND_API_KEY", "BOOKING_TO_EMAIL", "BOOKING_FROM_EMAIL"] as const;

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.BOOKING_TO_EMAIL;
  const from = process.env.BOOKING_FROM_EMAIL;
  if (!apiKey || !to || !from) {
    // Diagnostics for the Vercel logs: only variable NAMES and their state, never their values.
    const missing = REQUIRED_ENV.filter((name) => process.env[name] === undefined);
    const empty = REQUIRED_ENV.filter((name) => process.env[name] !== undefined && process.env[name] === "");
    console.error(
      `[booking] not configured — missing: ${missing.join(", ") || "none"}; empty: ${empty.join(", ") || "none"}; ` +
        `environment: ${process.env.VERCEL_ENV || "unknown"}; deployment: ${process.env.VERCEL_URL || "unknown"}`,
    );
    return json({ ok: false, error: "not_configured" }, 503);
  }

  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return json({ ok: false, error: "rate_limited" }, 429);

  const length = Number(request.headers.get("content-length") || 0);
  if (length > FILE_RULES.maxTotalBytes + 64 * 1024) return json({ ok: false, error: "too_large" }, 413);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, error: "bad_request" }, 400);
  }

  // Honeypot: real visitors never see or fill this field. Bots get a quiet 200 and nothing is sent.
  if (str(form, "website")) return json({ ok: true });

  const fields: BookingFields = {
    name: str(form, "name"),
    email: str(form, "email"),
    location: str(form, "location"),
    idea: str(form, "idea"),
    placement: str(form, "placement"),
    size: str(form, "size"),
    style: str(form, "style"),
    budget: str(form, "budget"),
    dates: str(form, "dates"),
    consent: str(form, "consent") === "yes",
  };
  const locale = ["en", "it", "es"].includes(str(form, "locale")) ? str(form, "locale") : "en";

  const errors = validateBooking(fields);
  if (Object.keys(errors).length) return json({ ok: false, error: "invalid", fields: errors }, 422);

  // ── Reference images ──
  const files = form.getAll("references").filter((f): f is File => typeof f === "object" && f !== null && "arrayBuffer" in f && (f as File).size > 0);
  if (files.length > FILE_RULES.maxFiles) return json({ ok: false, error: "file_count" }, 422);

  const attachments: Attachment[] = [];
  let total = 0;
  for (const [i, file] of files.entries()) {
    if (file.size > FILE_RULES.maxBytes) return json({ ok: false, error: "file_size" }, 422);
    total += file.size;
    if (total > FILE_RULES.maxTotalBytes) return json({ ok: false, error: "file_size" }, 422);
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = sniffImageType(bytes);
    if (!type) return json({ ok: false, error: "file_type" }, 422);
    const ext = type === "image/jpeg" ? "jpg" : type.split("/")[1];
    // The original filename is discarded: it can contain personal info and is not needed.
    attachments.push({ filename: `reference-${i + 1}.${ext}`, content: Buffer.from(bytes).toString("base64") });
  }

  const styleLabel = (STYLE_OPTIONS as readonly string[]).includes(fields.style) ? fields.style : "unsure";
  const rows: [string, string][] = [
    ["Name", fields.name],
    ["Email", fields.email],
    ["Country / City", fields.location],
    ["Placement", fields.placement],
    ["Approximate size", fields.size],
    ["Preferred style", styleLabel],
    ["Budget", fields.budget || "—"],
    ["Preferred dates", fields.dates],
    ["Site language", locale.toUpperCase()],
    ["Reference images", attachments.length ? `${attachments.length} attached` : "none"],
  ];

  const html = `
  <div style="font-family:Helvetica,Arial,sans-serif;color:#111;max-width:640px">
    <h2 style="font-weight:600;letter-spacing:.04em">New booking request — Blaze Ink</h2>
    <p style="color:#555">This is a request, not a confirmed appointment. Reply to this email to answer the client.</p>
    <table cellpadding="8" style="border-collapse:collapse;width:100%">
      ${rows.map(([k, v]) => `<tr><td style="border-bottom:1px solid #eee;color:#777;width:38%">${k}</td><td style="border-bottom:1px solid #eee">${escapeHtml(v)}</td></tr>`).join("")}
    </table>
    <h3 style="margin-top:24px">Tattoo idea</h3>
    <p style="white-space:pre-wrap;line-height:1.5">${escapeHtml(fields.idea)}</p>
  </div>`;
  const text = `${rows.map(([k, v]) => `${k}: ${v}`).join("\n")}\n\nTattoo idea:\n${fields.idea}`;

  const send = (payload: Record<string, unknown>) =>
    fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

  try {
    const res = await send({
      from,
      to: [to],
      reply_to: fields.email,
      subject: `Booking request — ${fields.name} · ${fields.placement}`,
      html,
      text,
      attachments: attachments.length ? attachments : undefined,
    });
    if (!res.ok) {
      console.error("[booking] email provider error", res.status, await res.text().catch(() => ""));
      return json({ ok: false, error: "delivery_failed" }, 502);
    }
  } catch (err) {
    console.error("[booking] email provider unreachable", err);
    return json({ ok: false, error: "delivery_failed" }, 502);
  }

  if (process.env.BOOKING_SEND_CONFIRMATION === "true") {
    const copy = {
      en: ["We received your request", "Thank you for your request. Biagio reads every message personally and will reply by email. This is not yet a confirmed appointment."],
      it: ["Abbiamo ricevuto la tua richiesta", "Grazie per la tua richiesta. Biagio legge ogni messaggio personalmente e ti risponderà via email. Non è ancora un appuntamento confermato."],
      es: ["Hemos recibido tu solicitud", "Gracias por tu solicitud. Biagio lee cada mensaje personalmente y te responderá por email. Todavía no es una cita confirmada."],
    }[locale as "en" | "it" | "es"];
    // A failed confirmation does not fail the request: the artist already has it.
    await send({ from, to: [fields.email], subject: `Blaze Ink — ${copy[0]}`, text: copy[1] }).catch(() => undefined);
  }

  return json({ ok: true });
}

export function GET() {
  return json({ ok: false, error: "method_not_allowed" }, 405);
}
