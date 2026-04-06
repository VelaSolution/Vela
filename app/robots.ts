import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/admin",
          "/dashboard",
          "/profile",
          "/monthly-input",
          "/my-store",
          "/stores",
          "/team",
          "/payment/",
          "/reset-password",
          "/unauthorized",
        ],
      },
    ],
    sitemap: "https://velaanalytics.com/sitemap.xml",
  };
}
