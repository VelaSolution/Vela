import type { MetadataRoute } from "next";

const BASE_URL = "https://velaanalytics.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // 공개 페이지 (크롤링 대상)
  const publicPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE_URL}/info`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE_URL}/guide`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/community`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE_URL}/signup`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${BASE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${BASE_URL}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  // 도구 페이지
  const tools = [
    "menu-cost", "labor", "tax", "pl-report", "sns-content",
    "review-reply", "area-analysis", "delivery-menu", "promo-generator",
    "naver-place", "marketing-calendar", "startup-checklist",
  ];

  const toolPages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/tools`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...tools.map((tool) => ({
      url: `${BASE_URL}/tools/${tool}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  // 핵심 기능 페이지
  const featurePages: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/simulator`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/benchmark`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/game`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];

  return [...publicPages, ...featurePages, ...toolPages];
}
