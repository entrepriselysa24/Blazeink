import type { MetadataRoute } from "next";
import { homePath, locales } from "@/lib/i18n";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(locales.map((l) => [l, `${site.url}${homePath(l)}`]));
  return locales.map((l) => ({
    url: `${site.url}${homePath(l)}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: l === "en" ? 1 : 0.8,
    alternates: { languages },
  }));
}
