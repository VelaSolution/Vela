export function LandingStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700;800;900&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      :root{--blue:#3182F6;--blue-dark:#1B64DA;--blue-light:#EBF3FF;--gray-50:#F9FAFB;--gray-100:#F2F4F6;--gray-200:#E5E8EB;--gray-400:#9EA6B3;--gray-600:#6B7684;--gray-800:#333D4B;--gray-900:#191F28;--accent-purple:#7C3AED;--accent-teal:#0D9488;--gradient-primary:linear-gradient(135deg,#3182F6 0%,#7C3AED 100%);--gradient-hero:linear-gradient(135deg,#3182F6 0%,#6366F1 50%,#7C3AED 100%);--shadow-sm:0 1px 2px rgba(0,0,0,0.04),0 1px 3px rgba(0,0,0,0.06);--shadow-md:0 2px 4px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.06),0 12px 24px rgba(0,0,0,0.04);--shadow-lg:0 4px 6px rgba(0,0,0,0.04),0 12px 24px rgba(0,0,0,0.06),0 24px 48px rgba(0,0,0,0.08);--shadow-xl:0 8px 16px rgba(0,0,0,0.06),0 24px 48px rgba(0,0,0,0.08),0 48px 96px rgba(0,0,0,0.06)}
      html{scroll-behavior:smooth}
      body{font-family:'Pretendard',-apple-system,sans-serif;color:var(--gray-900);background:#fff;line-height:1.6;overflow-x:hidden}

      /* ── Premium Animations ───────────────────────── */
      @keyframes fadeUp{from{opacity:0;transform:translateY(28px) scale(0.98)}to{opacity:1;transform:none}}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-16px)}}
      @keyframes float2{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-12px) rotate(3deg)}}
      @keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
      @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
      @keyframes pulse-ring{0%{transform:scale(1);opacity:.4}100%{transform:scale(1.8);opacity:0}}
      @keyframes orb-drift-1{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(60px,-40px) scale(1.1)}50%{transform:translate(-20px,-80px) scale(0.95)}75%{transform:translate(-60px,-20px) scale(1.05)}}
      @keyframes orb-drift-2{0%,100%{transform:translate(0,0) scale(1)}25%{transform:translate(-50px,30px) scale(0.95)}50%{transform:translate(40px,60px) scale(1.1)}75%{transform:translate(70px,-10px) scale(1.02)}}
      @keyframes countUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

      .fade-init{opacity:0;animation:fadeUp .7s cubic-bezier(.16,1,.3,1) forwards}
      .d1{animation-delay:.1s}.d2{animation-delay:.25s}.d3{animation-delay:.4s}.d4{animation-delay:.55s}

      /* ── Gradient Text ────────────────────────────── */
      .gradient-text{background:var(--gradient-hero);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}

      /* ── Hero ──────────────────────────────────────── */
      .hero{min-height:100vh;display:flex;align-items:center;padding:120px 24px 80px;position:relative;overflow:hidden}
      .hero-bg-orb{position:absolute;border-radius:50%;filter:blur(80px);pointer-events:none;will-change:transform}
      .hero-orb-1{top:-120px;right:-80px;width:600px;height:600px;background:radial-gradient(circle,rgba(49,130,246,0.15) 0%,rgba(99,102,241,0.08) 40%,transparent 70%);animation:orb-drift-1 20s ease-in-out infinite}
      .hero-orb-2{bottom:-60px;left:-100px;width:500px;height:500px;background:radial-gradient(circle,rgba(124,58,237,0.1) 0%,rgba(49,130,246,0.06) 40%,transparent 70%);animation:orb-drift-2 25s ease-in-out infinite}
      .hero-orb-3{top:40%;left:50%;width:300px;height:300px;background:radial-gradient(circle,rgba(6,182,212,0.08) 0%,transparent 60%);animation:orb-drift-1 30s ease-in-out infinite reverse}
      .hero-inner{max-width:1100px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;position:relative;z-index:1}
      .hero-tag{display:inline-flex;align-items:center;gap:8px;background:rgba(49,130,246,0.08);color:var(--blue);font-size:13px;font-weight:600;padding:7px 16px;border-radius:100px;margin-bottom:24px;border:1px solid rgba(49,130,246,0.15);backdrop-filter:blur(8px)}
      .hero-tag-dot{width:6px;height:6px;background:var(--blue);border-radius:50%;animation:pulse-ring 2s ease-out infinite}
      .hero-title{font-size:clamp(36px,4.5vw,58px);font-weight:800;line-height:1.15;color:var(--gray-900);margin-bottom:20px;letter-spacing:-0.03em}
      .hero-desc{font-size:18px;color:var(--gray-600);line-height:1.7;margin-bottom:40px}
      .hero-actions{display:flex;gap:12px;flex-wrap:wrap}
      .btn-primary{background:var(--gradient-primary);color:#fff;padding:16px 28px;border-radius:14px;font-size:16px;font-weight:600;text-decoration:none;transition:all .3s cubic-bezier(.16,1,.3,1);display:inline-flex;align-items:center;gap:8px;box-shadow:0 4px 16px rgba(49,130,246,0.3),0 1px 3px rgba(0,0,0,0.08);position:relative;overflow:hidden}
      .btn-primary::after{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.2) 0%,transparent 50%);opacity:0;transition:opacity .3s}
      .btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(49,130,246,0.4),0 2px 6px rgba(0,0,0,0.08)}
      .btn-primary:hover::after{opacity:1}
      .btn-secondary{background:rgba(255,255,255,0.8);color:var(--gray-800);padding:16px 28px;border-radius:14px;font-size:16px;font-weight:600;text-decoration:none;transition:all .3s cubic-bezier(.16,1,.3,1);display:inline-flex;align-items:center;gap:8px;border:1px solid var(--gray-200);backdrop-filter:blur(8px)}
      .btn-secondary:hover{background:#fff;transform:translateY(-2px);box-shadow:var(--shadow-md)}
      .hero-stats{display:flex;gap:32px;margin-top:48px;padding-top:40px;border-top:1px solid rgba(0,0,0,0.06)}
      .hero-stat{position:relative}
      .stat-num{font-size:28px;font-weight:800;color:var(--gray-900);letter-spacing:-0.03em}
      .stat-num span{background:var(--gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
      .stat-label{font-size:13px;color:var(--gray-400);margin-top:2px}

      /* Premium Hero Card */
      .hero-card{background:rgba(255,255,255,0.7);border-radius:24px;padding:32px;border:1px solid rgba(255,255,255,0.8);backdrop-filter:blur(20px);box-shadow:var(--shadow-lg);position:relative;overflow:hidden}
      .hero-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.8),transparent)}
      .hero-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
      .hero-card-title{font-size:14px;font-weight:600;color:var(--gray-600)}
      .hero-card-badge{background:linear-gradient(135deg,#ECFDF5,#D1FAE5);color:#059669;font-size:12px;font-weight:700;padding:4px 12px;border-radius:100px;border:1px solid rgba(5,150,105,0.15)}
      .hero-metric-label{font-size:13px;color:var(--gray-400);margin-bottom:6px}
      .hero-metric-value{font-size:32px;font-weight:800;letter-spacing:-0.03em;margin-bottom:16px}
      .green{color:#059669}.red{color:#DC2626}
      .hero-bar-wrap{height:8px;background:var(--gray-200);border-radius:100px;overflow:hidden;margin-bottom:24px}
      .hero-bar{height:100%;background:var(--gradient-primary);border-radius:100px;width:68%;position:relative}
      .hero-bar::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent);animation:shimmer 2s ease-in-out infinite;background-size:200% 100%}
      .hero-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-top:1px solid rgba(0,0,0,0.04);font-size:14px}
      .hero-row-label{color:var(--gray-600)}
      .hero-row-value{font-weight:600;color:var(--gray-900)}

      /* ── Sections ──────────────────────────────────── */
      section{padding:100px 24px}
      .section-inner{max-width:1100px;margin:0 auto}
      .section-tag{display:inline-block;background:rgba(49,130,246,0.08);color:var(--blue);font-size:13px;font-weight:600;padding:6px 16px;border-radius:100px;margin-bottom:16px;border:1px solid rgba(49,130,246,0.12)}
      .section-title{font-size:clamp(28px,3.5vw,44px);font-weight:800;letter-spacing:-0.03em;color:var(--gray-900);margin-bottom:16px;line-height:1.2}
      .section-desc{font-size:17px;color:var(--gray-600);line-height:1.7;max-width:500px}

      /* ── Features ──────────────────────────────────── */
      .features-bg{background:var(--gray-50);position:relative}
      .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:56px}
      .feature-card{background:rgba(255,255,255,0.8);border-radius:20px;padding:32px;border:1px solid rgba(0,0,0,0.06);transition:all .4s cubic-bezier(.16,1,.3,1);backdrop-filter:blur(10px);position:relative;overflow:hidden}
      .feature-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.9),transparent);opacity:0;transition:opacity .3s}
      .feature-card:hover{transform:translateY(-6px);box-shadow:var(--shadow-lg);border-color:rgba(49,130,246,0.15)}
      .feature-card:hover::before{opacity:1}
      .feature-icon{width:52px;height:52px;border-radius:16px;background:linear-gradient(135deg,rgba(49,130,246,0.1),rgba(124,58,237,0.08));display:flex;align-items:center;justify-content:center;font-size:24px;margin-bottom:20px;border:1px solid rgba(49,130,246,0.08);transition:transform .3s cubic-bezier(.16,1,.3,1)}
      .feature-card:hover .feature-icon{transform:scale(1.08) rotate(-3deg)}
      .feature-title{font-size:18px;font-weight:700;color:var(--gray-900);margin-bottom:10px}
      .feature-desc{font-size:14px;color:var(--gray-600);line-height:1.7}
      .feature-tag{display:inline-block;margin-top:16px;font-size:12px;font-weight:600;color:var(--blue);background:rgba(49,130,246,0.06);padding:4px 12px;border-radius:100px;border:1px solid rgba(49,130,246,0.1)}

      /* ── Steps ──────────────────────────────────────── */
      .steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:56px;text-align:center}
      .step-card{position:relative;padding:0 12px}
      .step-num{width:60px;height:60px;background:var(--gradient-primary);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:22px;font-weight:800;margin:0 auto 20px;box-shadow:0 4px 16px rgba(49,130,246,0.3);position:relative}
      .step-num::after{content:'';position:absolute;inset:-4px;border-radius:50%;border:2px dashed rgba(49,130,246,0.2);animation:spin 20s linear infinite}
      @keyframes spin{to{transform:rotate(360deg)}}
      .step-connector{display:none}
      .step-title{font-size:18px;font-weight:700;color:var(--gray-900);margin-bottom:8px}
      .step-desc{font-size:14px;color:var(--gray-600);line-height:1.7}

      /* ── Pricing ────────────────────────────────────── */
      .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:56px}
      .pricing-card{background:rgba(255,255,255,0.9);border:1px solid rgba(0,0,0,0.06);border-radius:24px;padding:36px 32px;position:relative;transition:all .4s cubic-bezier(.16,1,.3,1);backdrop-filter:blur(10px)}
      .pricing-card:hover{transform:translateY(-4px);box-shadow:var(--shadow-lg)}
      .pricing-card.popular{border:2px solid transparent;background:linear-gradient(#fff,#fff) padding-box,var(--gradient-primary) border-box;box-shadow:var(--shadow-lg)}
      .pricing-card.popular:hover{box-shadow:var(--shadow-xl);transform:translateY(-6px)}
      .pricing-popular-badge{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--gradient-primary);color:#fff;font-size:12px;font-weight:700;padding:5px 20px;border-radius:100px;white-space:nowrap;box-shadow:0 4px 12px rgba(49,130,246,0.3)}
      .pricing-plan{font-size:14px;font-weight:600;color:var(--gray-600);margin-bottom:8px}
      .pricing-price{font-size:40px;font-weight:800;color:var(--gray-900);letter-spacing:-0.03em;margin-bottom:4px}
      .pricing-price span{font-size:18px;font-weight:500;color:var(--gray-400)}
      .pricing-desc{font-size:14px;color:var(--gray-600);margin-bottom:28px}
      .pricing-features{list-style:none;margin-bottom:28px}
      .pricing-features li{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--gray-700,#4E5968);padding:8px 0;border-bottom:1px solid rgba(0,0,0,0.04)}
      .pricing-features li:last-child{border-bottom:none}
      .pricing-check{width:22px;height:22px;background:linear-gradient(135deg,#ECFDF5,#D1FAE5);border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;color:#059669;border:1px solid rgba(5,150,105,0.12)}
      .pricing-btn{width:100%;padding:14px;border-radius:14px;font-size:15px;font-weight:600;text-align:center;text-decoration:none;display:block;transition:all .3s cubic-bezier(.16,1,.3,1);border:none;cursor:pointer;font-family:inherit}
      .pricing-btn-blue{background:var(--gradient-primary);color:#fff;box-shadow:0 4px 12px rgba(49,130,246,0.25)}
      .pricing-btn-blue:hover{box-shadow:0 8px 24px rgba(49,130,246,0.35);transform:translateY(-1px)}
      .pricing-btn-gray{background:var(--gray-100);color:var(--gray-800)}
      .pricing-btn-gray:hover{background:var(--gray-200)}

      /* ── Testimonials ──────────────────────────────── */
      .testi-bg{background:linear-gradient(135deg,#0F172A 0%,#1a1f3a 50%,#0F172A 100%);position:relative;overflow:hidden}
      .testi-bg::before{content:'';position:absolute;top:-200px;right:-200px;width:500px;height:500px;background:radial-gradient(circle,rgba(49,130,246,0.12) 0%,transparent 60%);pointer-events:none}
      .testi-bg::after{content:'';position:absolute;bottom:-150px;left:-150px;width:400px;height:400px;background:radial-gradient(circle,rgba(124,58,237,0.1) 0%,transparent 60%);pointer-events:none}
      .testi-bg .section-title{color:#fff}
      .testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:56px;position:relative;z-index:1}
      .testi-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:28px;backdrop-filter:blur(12px);transition:all .4s cubic-bezier(.16,1,.3,1);position:relative;overflow:hidden}
      .testi-card::before{content:'';position:absolute;top:0;left:0;right:0;height:1px;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)}
      .testi-card:hover{background:rgba(255,255,255,0.07);border-color:rgba(255,255,255,0.15);transform:translateY(-4px)}
      .testi-stars{color:#F59E0B;font-size:14px;margin-bottom:16px;letter-spacing:2px}
      .testi-text{font-size:15px;color:rgba(255,255,255,.75);line-height:1.7;margin-bottom:20px}
      .testi-author{display:flex;align-items:center;gap:12px}
      .testi-avatar{width:42px;height:42px;border-radius:50%;background:var(--gradient-primary);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;flex-shrink:0;box-shadow:0 2px 8px rgba(49,130,246,0.3)}
      .testi-name{font-size:14px;font-weight:600;color:#fff}
      .testi-role{font-size:12px;color:rgba(255,255,255,0.4)}

      /* ── CTA ────────────────────────────────────────── */
      .cta-bg{background:var(--gradient-hero);background-size:200% 200%;animation:gradientShift 6s ease infinite;text-align:center;position:relative;overflow:hidden}
      .cta-bg::before{content:'';position:absolute;inset:0;background:url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")}
      .cta-title{font-size:clamp(28px,4vw,48px);font-weight:800;color:#fff;letter-spacing:-0.03em;margin-bottom:16px;text-shadow:0 2px 24px rgba(0,0,0,0.1)}
      .cta-desc{font-size:18px;color:rgba(255,255,255,.85);margin-bottom:40px}
      .btn-white{background:rgba(255,255,255,0.95);color:var(--blue);padding:16px 32px;border-radius:14px;font-size:16px;font-weight:700;text-decoration:none;display:inline-block;transition:all .3s cubic-bezier(.16,1,.3,1);box-shadow:0 4px 16px rgba(0,0,0,0.1);backdrop-filter:blur(8px)}
      .btn-white:hover{transform:translateY(-3px);box-shadow:0 8px 32px rgba(0,0,0,0.15);background:#fff}

      /* ── Contact ────────────────────────────────────── */
      .contact-layout{display:grid;grid-template-columns:1fr 1.4fr;gap:80px;align-items:start;margin-top:56px}
      .contact-info{display:flex;flex-direction:column;gap:28px}
      .contact-label{font-size:12px;font-weight:600;color:var(--blue);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px}
      .contact-value{font-size:15px;color:var(--gray-700,#4E5968)}
      .contact-form{display:flex;flex-direction:column;gap:14px}
      .form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      .field-label{display:block;font-size:13px;font-weight:600;color:var(--gray-600);margin-bottom:6px}
      .field-input{width:100%;padding:13px 16px;background:rgba(249,250,251,0.8);border:1.5px solid var(--gray-200);border-radius:12px;font-family:'Pretendard',sans-serif;font-size:14px;color:var(--gray-900);outline:none;transition:all .25s cubic-bezier(.16,1,.3,1);backdrop-filter:blur(8px)}
      .field-input:focus{border-color:var(--blue);background:#fff;box-shadow:0 0 0 4px rgba(49,130,246,.08),0 4px 12px rgba(49,130,246,.06)}
      textarea.field-input{resize:vertical;min-height:120px;line-height:1.6}
      .form-submit{background:var(--gradient-primary);color:#fff;padding:15px 28px;border-radius:14px;font-size:15px;font-weight:600;border:none;cursor:pointer;font-family:'Pretendard',sans-serif;transition:all .3s cubic-bezier(.16,1,.3,1);align-self:flex-start;box-shadow:0 4px 12px rgba(49,130,246,0.25)}
      .form-submit:hover{box-shadow:0 8px 24px rgba(49,130,246,0.35);transform:translateY(-1px)}
      .form-msg{font-size:13px;color:var(--blue);display:none;margin-top:4px}

      /* ── Footer ─────────────────────────────────────── */
      footer{background:linear-gradient(180deg,#0F172A 0%,#0a0f1c 100%);padding:60px 24px 40px}
      .footer-inner{max-width:1100px;margin:0 auto}
      .footer-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px}
      .footer-logo{font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.02em}
      .footer-logo span{background:var(--gradient-primary);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
      .footer-links{display:flex;gap:24px}
      .footer-links a{font-size:14px;color:var(--gray-400);text-decoration:none;transition:color .2s}
      .footer-links a:hover{color:#fff}
      .footer-bottom{display:flex;justify-content:space-between;align-items:center;padding-top:24px;border-top:1px solid rgba(255,255,255,.06)}
      .footer-copy{font-size:13px;color:var(--gray-400)}
      .footer-legal{display:flex;gap:16px}
      .footer-legal a{font-size:13px;color:var(--gray-400);text-decoration:none}
      .footer-legal a:hover{color:#fff}

      /* ── Responsive ─────────────────────────────────── */
      @media(max-width:1024px){.hero-inner{grid-template-columns:1fr;gap:48px}.features-grid,.pricing-grid,.testi-grid{grid-template-columns:1fr 1fr}.steps-grid{grid-template-columns:1fr 1fr}.contact-layout{grid-template-columns:1fr;gap:48px}}
      @media(max-width:640px){.features-grid,.pricing-grid,.testi-grid,.steps-grid{grid-template-columns:1fr}.hero-stats{flex-direction:column;gap:20px}.form-row{grid-template-columns:1fr}.footer-top{flex-direction:column;gap:24px}.footer-bottom{flex-direction:column;gap:16px;text-align:center}.hero-actions{flex-direction:column}}
    `}</style>
  );
}
