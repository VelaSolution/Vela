import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'VELA — 외식업 경영 파트너';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div style={{
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #0F172A 100%)',
        width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: '60px',
      }}>
        <div style={{ fontSize: 72, fontWeight: 900, color: '#fff', letterSpacing: '-0.03em', marginBottom: 16, display: 'flex' }}>
          VELA<span style={{ color: '#3182F6' }}>.</span>
        </div>
        <div style={{ fontSize: 32, fontWeight: 600, color: '#94A3B8', textAlign: 'center', lineHeight: 1.4, display: 'flex' }}>
          외식업 사장님을 위한 숫자 경영 파트너
        </div>
        <div style={{ display: 'flex', gap: 24, marginTop: 40 }}>
          {['🧮 30+ 경영 도구', '🤖 AI 분석', '📊 수익 시뮬레이터'].map(t => (
            <div key={t} style={{ background: 'rgba(49,130,246,0.15)', color: '#93C5FD', padding: '12px 24px', borderRadius: 12, fontSize: 20, fontWeight: 600, display: 'flex' }}>
              {t}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
