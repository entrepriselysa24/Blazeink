/**
 * Booking request rules, shared by the form (client) and the API route (server),
 * so both validate exactly the same way. No framework imports: plain TypeScript.
 */

export const STYLE_OPTIONS = ["ornamental", "blackwork", "dark-ornamental", "lettering", "realism", "unsure"] as const;
export type StyleOption = (typeof STYLE_OPTIONS)[number];

export const FILE_RULES = {
  maxFiles: 3,
  /** Per file, after client-side resizing. */
  maxBytes: 1.5 * 1024 * 1024,
  /** Whole request. Stays under the 4.5 MB body limit of serverless platforms such as Vercel. */
  maxTotalBytes: 4 * 1024 * 1024,
  mimeTypes: ["image/jpeg", "image/png", "image/webp"] as const,
  /** Longest side after client-side resizing. */
  maxDimension: 1800,
};

export const TEXT_LIMITS = {
  name: 120,
  email: 254,
  location: 120,
  idea: 3000,
  placement: 200,
  size: 120,
  budget: 120,
  dates: 300,
} as const;

export type BookingFields = {
  name: string;
  email: string;
  location: string;
  idea: string;
  placement: string;
  size: string;
  style: string;
  budget: string;
  dates: string;
  consent: boolean;
};

export type FieldError = "required" | "email" | "tooLong" | "consent" | "style";
export type FieldErrors = Partial<Record<keyof BookingFields, FieldError>>;

const REQUIRED: (keyof BookingFields)[] = ["name", "email", "location", "idea", "placement", "size", "style", "dates"];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateBooking(f: BookingFields): FieldErrors {
  const errors: FieldErrors = {};
  for (const key of REQUIRED) {
    const v = f[key];
    if (typeof v === "string" && v.trim() === "") errors[key] = "required";
  }
  for (const [key, max] of Object.entries(TEXT_LIMITS) as [keyof typeof TEXT_LIMITS, number][]) {
    if (!errors[key] && f[key].length > max) errors[key] = "tooLong";
  }
  if (!errors.email && !EMAIL_RE.test(f.email.trim())) errors.email = "email";
  if (!errors.style && !(STYLE_OPTIONS as readonly string[]).includes(f.style)) errors.style = "style";
  if (!f.consent) errors.consent = "consent";
  return errors;
}

/** Checks the first bytes of a file, so a renamed non-image is rejected even if its MIME type claims otherwise. */
export function sniffImageType(bytes: Uint8Array): (typeof FILE_RULES.mimeTypes)[number] | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47 &&
    bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a
  )
    return "image/png";
  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  )
    return "image/webp";
  return null;
}
