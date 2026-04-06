// Pretendard 폰트 로드 (홍보 이미지용)
export async function loadFont(): Promise<ArrayBuffer> {
  const res = await fetch(
    "https://cdn.jsdelivr.net/gh/orioncactus/pretendard/packages/pretendard/dist/public/static/Pretendard-Bold.otf"
  );
  return res.arrayBuffer();
}
