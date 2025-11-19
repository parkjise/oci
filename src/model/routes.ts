import type { ComponentType, ReactNode } from "react";

/**
 * 라우트 타입 정의
 */
export interface RouteConfig {
  /** 라우트 경로 */
  path: string;
  /** 라우트에 표시할 컴포넌트 */
  element?: ComponentType | ReactNode;
  /** 중첩 라우트 (자식 라우트) */
  children?: RouteConfig[];
  /** 인덱스 라우트 여부 */
  index?: boolean;
  /** 라우트 메타데이터 (권한, 제목 등) */
  meta?: {
    title?: string;
    requiresAuth?: boolean;
    roles?: string[];
    menu?: boolean;
  };
}

/**
 * 라우트 설정 타입 (라우트 설정 배열에서 사용)
 */
export type RoutesConfig = RouteConfig[];
