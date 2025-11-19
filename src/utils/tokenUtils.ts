// ============================================================================
// 토큰 관리 유틸리티
// ============================================================================
import Cookies from "js-cookie";

const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";
const REFRESH_TOKEN_COOKIE_KEY = "refreshToken";

/**
 * Access Token을 localStorage에 저장
 */
export const setAccessToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

/**
 * Access Token을 localStorage에서 가져오기
 */
export const getAccessToken = (): string | null => {
  const token = localStorage.getItem(TOKEN_KEY);
  return token;
};

/**
 * Access Token을 localStorage에서 제거
 */
export const removeAccessToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

/**
 * Refresh Token을 localStorage에 저장
 */
export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
};

/**
 * Refresh Token 가져오기
 * @returns localStorage 또는 cookie에서 가져온 refreshToken
 * @remarks
 * - localStorage를 먼저 확인하고, 없으면 cookie에서 확인합니다.
 * - cookie의 refreshToken은 서버에서 HttpOnly로 설정될 수 있습니다.
 */
export const getRefreshToken = (): string | null => {
  // localStorage에서 먼저 확인
  const localToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (localToken) {
    return localToken;
  }

  // cookie에서 확인
  const cookieToken = Cookies.get(REFRESH_TOKEN_COOKIE_KEY);
  if (cookieToken) {
    return cookieToken;
  }

  return null;
};

/**
 * Refresh Token 제거
 * @remarks
 * - localStorage와 cookie 모두에서 제거합니다.
 */
export const removeRefreshToken = (): void => {
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  Cookies.remove(REFRESH_TOKEN_COOKIE_KEY);
};

/**
 * 모든 토큰 제거
 */
export const clearAllTokens = (): void => {
  removeAccessToken();
  removeRefreshToken();
};

/**
 * 토큰 존재 여부 확인
 */
export const hasToken = (): boolean => {
  const tokenExists = !!getAccessToken();
  return tokenExists;
};
