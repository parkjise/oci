/**
 * 메뉴 데이터 캐싱 유틸리티
 *
 * 로컬스토리지를 사용하여 메뉴 데이터를 캐싱하고 관리합니다.
 * 캐시 만료 시간을 설정하여 일정 시간 후 자동으로 만료되도록 합니다.
 */
import type { MenuItem } from "@/types/api.types";
import {
  MENU_CACHE_KEY,
  MENU_CACHE_EXPIRY_KEY,
  CACHE_DURATION,
} from "@/constants";

/**
 * 메뉴 캐시 데이터 인터페이스
 */
interface MenuCacheData {
  /** 메뉴 배열 */
  menus: MenuItem[];
  /** 캐시 생성 시간 (타임스탬프) */
  timestamp: number;
}

/**
 * 메뉴 데이터를 로컬스토리지에 저장
 *
 * @param menus - 저장할 메뉴 배열
 * @throws localStorage 접근 실패 시 에러를 콘솔에 출력 (예외는 throw하지 않음)
 */
export const setMenuCache = (menus: MenuItem[]): void => {
  if (!menus || !Array.isArray(menus)) {
    if (import.meta.env.DEV) {
      console.warn("[menuCache] 유효하지 않은 메뉴 데이터입니다:", menus);
    }
    return;
  }

  try {
    const cacheData: MenuCacheData = {
      menus,
      timestamp: Date.now(),
    };
    localStorage.setItem(MENU_CACHE_KEY, JSON.stringify(cacheData));
    localStorage.setItem(
      MENU_CACHE_EXPIRY_KEY,
      String(Date.now() + CACHE_DURATION)
    );
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[menuCache] 메뉴 캐시 저장 실패:", error);
    }
  }
};

/**
 * 로컬스토리지에서 메뉴 데이터 가져오기
 *
 * 캐시가 만료되었거나 없으면 null을 반환합니다.
 * 파싱 오류가 발생하면 캐시를 삭제하고 null을 반환합니다.
 *
 * @returns 캐시된 메뉴 데이터 또는 null (만료되었거나 없으면)
 */
export const getMenuCache = (): MenuItem[] | null => {
  try {
    const cacheDataStr = localStorage.getItem(MENU_CACHE_KEY);
    const expiryStr = localStorage.getItem(MENU_CACHE_EXPIRY_KEY);

    // 캐시 데이터나 만료 시간이 없으면 null 반환
    if (!cacheDataStr || !expiryStr) {
      return null;
    }

    // 만료 시간 확인
    const expiry = Number(expiryStr);
    if (isNaN(expiry) || Date.now() > expiry) {
      // 만료된 캐시 삭제
      clearMenuCache();
      return null;
    }

    // 캐시 데이터 파싱
    const cacheData: MenuCacheData = JSON.parse(cacheDataStr);

    // 유효성 검증
    if (!cacheData.menus || !Array.isArray(cacheData.menus)) {
      if (import.meta.env.DEV) {
        console.warn("[menuCache] 유효하지 않은 캐시 데이터 형식입니다.");
      }
      clearMenuCache();
      return null;
    }

    return cacheData.menus;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[menuCache] 메뉴 캐시 조회 실패:", error);
    }
    // 파싱 오류 등이 발생하면 캐시 삭제
    clearMenuCache();
    return null;
  }
};

/**
 * 메뉴 캐시 삭제
 *
 * 로컬스토리지에서 메뉴 캐시 데이터와 만료 시간을 모두 제거합니다.
 */
export const clearMenuCache = (): void => {
  try {
    localStorage.removeItem(MENU_CACHE_KEY);
    localStorage.removeItem(MENU_CACHE_EXPIRY_KEY);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[menuCache] 메뉴 캐시 삭제 실패:", error);
    }
  }
};

/**
 * 캐시 만료 시간 확인
 *
 * 캐시가 존재하고 아직 만료되지 않았는지 확인합니다.
 *
 * @returns 캐시가 유효하면 true, 만료되었거나 없으면 false
 */
export const isMenuCacheValid = (): boolean => {
  try {
    const expiryStr = localStorage.getItem(MENU_CACHE_EXPIRY_KEY);
    if (!expiryStr) {
      return false;
    }

    const expiry = Number(expiryStr);
    if (isNaN(expiry)) {
      return false;
    }

    return Date.now() <= expiry;
  } catch {
    return false;
  }
};
