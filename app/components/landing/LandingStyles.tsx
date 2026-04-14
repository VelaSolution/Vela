export function LandingStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Pretendard:wght@300;400;500;600;700;800;900&display=swap');
      *{box-sizing:border-box;margin:0;padding:0}
      :root{--blue:#3182F6;--blue-dark:#1B64DA;--blue-light:#EBF3FF;--gray-50:#F9FAFB;--gray-100:#F2F4F6;--gray-200:#E5E8EB;--gray-400:#9EA6B3;--gray-600:#6B7684;--gray-800:#333D4B;--gray-900:#191F28}
      html{scroll-behavior:smooth}
      body{font-family:'Pretendard',-apple-system,sans-serif;color:var(--gray-900);background:#fff;line-height:1.6;overflow-x:hidden}
      @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
      .fade-init{opacity:0;animation:fadeUp .6s ease forwards}
      .d1{animation-delay:.1s}.d2{animation-delay:.25s}.d3{animation-delay:.4s}.d4{animation-delay:.55s}
      .hero{min-height:100vh;display:flex;align-items:center;padding:120px 24px 80px;position:relative;overflow:hidden}
      .hero-bg{position:absolute;top:-200px;right:-200px;width:800px;height:800px;background:radial-gradient(ellipse,#EBF3FF 0%,transparent 70%);pointer-events:none}
      .hero-bg2{position:absolute;bottom:-100px;left:-100px;width:500px;height:500px;background:radial-gradient(ellipse,#F0F4FF 0%,transparent 70%);pointer-events:none}
      .hero-inner{max-width:1100px;margin:0 auto;width:100%;display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:center;position:relative;z-index:1}
      .hero-tag{display:inline-flex;align-items:center;gap:8px;background:var(--blue-light);color:var(--blue);font-size:13px;font-weight:600;padding:6px 14px;border-radius:100px;margin-bottom:24px}
      .hero-tag-dot{width:6px;height:6px;background:var(--blue);border-radius:50%}
      .hero-title{font-size:clamp(36px,4.5vw,58px);font-weight:800;line-height:1.15;color:var(--gray-900);margin-bottom:20px;letter-spacing:-0.02em}
      .hero-title span{color:var(--blue)}
      .hero-desc{font-size:18px;color:var(--gray-600);line-height:1.7;margin-bottom:40px}
      .hero-actions{display:flex;gap:12px;flex-wrap:wrap}
      .btn-primary{background:var(--blue);color:#fff;padding:16px 28px;border-radius:12px;font-size:16px;font-weight:600;text-decoration:none;transition:background .15s,transform .15s;display:inline-flex;align-items:center;gap:8px}
      .btn-primary:hover{background:var(--blue-dark);transform:translateY(-1px)}
      .btn-secondary{background:var(--gray-100);color:var(--gray-800);padding:16px 28px;border-radius:12px;font-size:16px;font-weight:600;text-decoration:none;transition:background .15s;display:inline-flex;align-items:center;gap:8px}
      .btn-secondary:hover{background:var(--gray-200)}
      .hero-stats{display:flex;gap:32px;margin-top:48px;padding-top:40px;border-top:1px solid var(--gray-200)}
      .stat-num{font-size:28px;font-weight:800;color:var(--gray-900);letter-spacing:-0.02em}
      .stat-num span{color:var(--blue)}
      .stat-label{font-size:13px;color:var(--gray-400);margin-top:2px}
      .hero-card{background:var(--gray-50);border-radius:24px;padding:32px;border:1px solid var(--gray-200)}
      .hero-card-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px}
      .hero-card-title{font-size:14px;font-weight:600;color:var(--gray-600)}
      .hero-card-badge{background:#ECFDF5;color:#059669;font-size:12px;font-weight:600;padding:4px 10px;border-radius:100px}
      .hero-metric-label{font-size:13px;color:var(--gray-400);margin-bottom:6px}
      .hero-metric-value{font-size:32px;font-weight:800;letter-spacing:-0.02em;margin-bottom:16px}
      .green{color:#059669}.red{color:#DC2626}
      .hero-bar-wrap{height:8px;background:var(--gray-200);border-radius:100px;overflow:hidden;margin-bottom:24px}
      .hero-bar{height:100%;background:var(--blue);border-radius:100px;width:68%}
      .hero-row{display:flex;justify-content:space-between;align-items:center;padding:12px 0;border-top:1px solid var(--gray-100);font-size:14px}
      .hero-row-label{color:var(--gray-600)}
      .hero-row-value{font-weight:600;color:var(--gray-900)}
      section{padding:100px 24px}
      .section-inner{max-width:1100px;margin:0 auto}
      .section-tag{display:inline-block;background:var(--blue-light);color:var(--blue);font-size:13px;font-weight:600;padding:5px 14px;border-radius:100px;margin-bottom:16px}
      .section-title{font-size:clamp(28px,3.5vw,44px);font-weight:800;letter-spacing:-0.02em;color:var(--gray-900);margin-bottom:16px;line-height:1.2}
      .section-desc{font-size:17px;color:var(--gray-600);line-height:1.7;max-width:500px}
      .features-bg{background:var(--gray-50)}
      .features-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:56px}
      .feature-card{background:#fff;border-radius:20px;padding:32px;border:1px solid var(--gray-200);transition:transform .2s,box-shadow .2s}
      .feature-card:hover{transform:translateY(-4px);box-shadow:0 12px 40px rgba(0,0,0,.08)}
      .feature-icon{width:48px;height:48px;border-radius:14px;background:var(--blue-light);display:flex;align-items:center;justify-content:center;font-size:22px;margin-bottom:20px}
      .feature-title{font-size:18px;font-weight:700;color:var(--gray-900);margin-bottom:10px}
      .feature-desc{font-size:14px;color:var(--gray-600);line-height:1.7}
      .feature-tag{display:inline-block;margin-top:16px;font-size:12px;font-weight:600;color:var(--blue);background:var(--blue-light);padding:4px 10px;border-radius:100px}
      .steps-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:40px;margin-top:56px;text-align:center}
      .step-num{width:56px;height:56px;background:var(--blue);color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;margin:0 auto 20px}
      .step-title{font-size:18px;font-weight:700;color:var(--gray-900);margin-bottom:8px}
      .step-desc{font-size:14px;color:var(--gray-600);line-height:1.7}
      .pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px;margin-top:56px}
      .pricing-card{background:#fff;border:2px solid var(--gray-200);border-radius:24px;padding:36px 32px;position:relative;transition:border-color .2s}
      .pricing-card.popular{border-color:var(--blue)}
      .pricing-popular-badge{position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:var(--blue);color:#fff;font-size:12px;font-weight:700;padding:5px 16px;border-radius:100px;white-space:nowrap}
      .pricing-plan{font-size:14px;font-weight:600;color:var(--gray-600);margin-bottom:8px}
      .pricing-price{font-size:40px;font-weight:800;color:var(--gray-900);letter-spacing:-0.02em;margin-bottom:4px}
      .pricing-price span{font-size:18px;font-weight:500;color:var(--gray-400)}
      .pricing-desc{font-size:14px;color:var(--gray-600);margin-bottom:28px}
      .pricing-features{list-style:none;margin-bottom:28px}
      .pricing-features li{display:flex;align-items:center;gap:10px;font-size:14px;color:var(--gray-700);padding:8px 0;border-bottom:1px solid var(--gray-100)}
      .pricing-features li:last-child{border-bottom:none}
      .pricing-check{width:20px;height:20px;background:#ECFDF5;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:11px;color:#059669}
      .pricing-btn{width:100%;padding:14px;border-radius:12px;font-size:15px;font-weight:600;text-align:center;text-decoration:none;display:block;transition:all .15s;border:none;cursor:pointer;font-family:inherit}
      .pricing-btn-blue{background:var(--blue);color:#fff}
      .pricing-btn-blue:hover{background:var(--blue-dark)}
      .pricing-btn-gray{background:var(--gray-100);color:var(--gray-800)}
      .pricing-btn-gray:hover{background:var(--gray-200)}
      .testi-bg{background:var(--gray-900)}
      .testi-bg .section-title{color:#fff}
      .testi-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:56px}
      .testi-card{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:20px;padding:28px}
      .testi-stars{color:#F59E0B;font-size:14px;margin-bottom:16px}
      .testi-text{font-size:15px;color:rgba(255,255,255,.8);line-height:1.7;margin-bottom:20px}
      .testi-author{display:flex;align-items:center;gap:12px}
      .testi-avatar{width:40px;height:40px;border-radius:50%;background:var(--blue);display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;flex-shrink:0}
      .testi-name{font-size:14px;font-weight:600;color:#fff}
      .testi-role{font-size:12px;color:var(--gray-400)}
      .cta-bg{background:var(--blue);text-align:center}
      .cta-title{font-size:clamp(28px,4vw,48px);font-weight:800;color:#fff;letter-spacing:-0.02em;margin-bottom:16px}
      .cta-desc{font-size:18px;color:rgba(255,255,255,.8);margin-bottom:40px}
      .btn-white{background:#fff;color:var(--blue);padding:16px 32px;border-radius:12px;font-size:16px;font-weight:700;text-decoration:none;display:inline-block;transition:transform .15s}
      .btn-white:hover{transform:translateY(-2px)}
      .contact-layout{display:grid;grid-template-columns:1fr 1.4fr;gap:80px;align-items:start;margin-top:56px}
      .contact-info{display:flex;flex-direction:column;gap:28px}
      .contact-label{font-size:12px;font-weight:600;color:var(--blue);text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px}
      .contact-value{font-size:15px;color:var(--gray-700)}
      .contact-form{display:flex;flex-direction:column;gap:14px}
      .form-row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
      .field-label{display:block;font-size:13px;font-weight:600;color:var(--gray-600);margin-bottom:6px}
      .field-input{width:100%;padding:13px 16px;background:var(--gray-50);border:1.5px solid var(--gray-200);border-radius:10px;font-family:'Pretendard',sans-serif;font-size:14px;color:var(--gray-900);outline:none;transition:border-color .15s,background .15s}
      .field-input:focus{border-color:var(--blue);background:#fff;box-shadow:0 0 0 3px rgba(49,130,246,.1)}
      textarea.field-input{resize:vertical;min-height:120px;line-height:1.6}
      .form-submit{background:var(--blue);color:#fff;padding:15px 28px;border-radius:10px;font-size:15px;font-weight:600;border:none;cursor:pointer;font-family:'Pretendard',sans-serif;transition:background .15s;align-self:flex-start}
      .form-submit:hover{background:var(--blue-dark)}
      .form-msg{font-size:13px;color:var(--blue);display:none;margin-top:4px}
      footer{background:var(--gray-900);padding:60px 24px 40px}
      .footer-inner{max-width:1100px;margin:0 auto}
      .footer-top{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:48px}
      .footer-logo{font-size:22px;font-weight:800;color:#fff;letter-spacing:-0.02em}
      .footer-logo span{color:var(--blue)}
      .footer-links{display:flex;gap:24px}
      .footer-links a{font-size:14px;color:var(--gray-400);text-decoration:none;transition:color .15s}
      .footer-links a:hover{color:#fff}
      .footer-bottom{display:flex;justify-content:space-between;align-items:center;padding-top:24px;border-top:1px solid rgba(255,255,255,.08)}
      .footer-copy{font-size:13px;color:var(--gray-400)}
      .footer-legal{display:flex;gap:16px}
      .footer-legal a{font-size:13px;color:var(--gray-400);text-decoration:none}
      .footer-legal a:hover{color:#fff}
      @media(max-width:1024px){.hero-inner{grid-template-columns:1fr;gap:48px}.features-grid,.pricing-grid,.testi-grid{grid-template-columns:1fr 1fr}.steps-grid{grid-template-columns:1fr 1fr}.contact-layout{grid-template-columns:1fr;gap:48px}}
      @media(max-width:640px){.features-grid,.pricing-grid,.testi-grid,.steps-grid{grid-template-columns:1fr}.hero-stats{flex-direction:column;gap:20px}.form-row{grid-template-columns:1fr}.footer-top{flex-direction:column;gap:24px}.footer-bottom{flex-direction:column;gap:16px;text-align:center}.hero-actions{flex-direction:column}}
    `}</style>
  );
}
