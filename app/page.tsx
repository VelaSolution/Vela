"use client";

import { useEffect, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import { LandingStyles } from "@/app/components/landing/LandingStyles";
import { HeroSection } from "@/app/components/landing/HeroSection";
import { FeaturesSection } from "@/app/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/app/components/landing/HowItWorksSection";
import { PricingSection } from "@/app/components/landing/PricingSection";
import { TestimonialsSection } from "@/app/components/landing/TestimonialsSection";
import { GameBannerSection } from "@/app/components/landing/GameBannerSection";
import { CTASection } from "@/app/components/landing/CTASection";
import { ContactSection } from "@/app/components/landing/ContactSection";
import { FooterSection } from "@/app/components/landing/FooterSection";
import { MemberHome } from "@/app/components/landing/MemberHome";

function LandingContent() {
  return (
    <>
      <LandingStyles />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <PricingSection />
      <TestimonialsSection />
      <GameBannerSection />
      <CTASection />
      <ContactSection />
      <FooterSection />
    </>
  );
}

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const sbKey = Object.keys(localStorage).find(
      k => k.startsWith("sb-") && k.endsWith("-auth-token")
    );
    if (sbKey) {
      try { return !!JSON.parse(localStorage.getItem(sbKey) ?? "null"); } catch { return false; }
    }
    return localStorage.getItem("vela-logged-in") === "1";
  });

  useEffect(() => {
    const sb = createSupabaseBrowserClient();
    sb.auth.getUser().then(({ data }: { data: { user: unknown } }) => {
      const val = !!data.user;
      setLoggedIn(val);
      localStorage.setItem("vela-logged-in", val ? "1" : "0");
    });
  }, []);

  const hasHash = typeof window !== "undefined" && window.location.hash.length > 0;
  if (hasHash) return <LandingContent />;
  return loggedIn ? <MemberHome /> : <LandingContent />;
}
