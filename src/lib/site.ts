/**
 * Central site configuration.
 * Values that change between environments come from environment variables (see .env.example).
 */
export const site = {
  name: "Blaze Ink",
  artist: "Biagio",
  tagline: "Ornamental & Blackwork Tattoo Artist",
  concept: "Your skin, my vision.",
  url: (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, ""),
  instagram: {
    handle: "@blaze_ink_",
    url: "https://www.instagram.com/blaze_ink_/",
    dm: "https://ig.me/m/blaze_ink_",
  },
  /** Public email shown on the site. Empty string = not configured, the email is hidden. */
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "",
  locations: ["Ibiza · Sant Antoni", "Zanzibar"],
} as const;
