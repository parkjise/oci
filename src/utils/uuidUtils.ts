/**
 * ============================================================================
 * UUID 난수 생성 함수
 * ============================================================================
 */

export const getUUID = () => {
  const cryptoObj = window.crypto;

  // 1. randomUUID가 지원되는 환경(HTTPS/Localhost) 처리
  if (cryptoObj && cryptoObj.randomUUID) {
    return cryptoObj.randomUUID();
  }

  // 2. HTTP 환경용 Fallback
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, (c: string) => {
    const n = parseInt(c, 10);
    return (
      n ^
      (cryptoObj.getRandomValues(new Uint8Array(1))[0] & (15 >> (n / 4)))
    ).toString(16);
  });
}