/**
 * 페이지 컴포넌트 모듈 매핑
 * 
 * Vite의 import.meta.glob을 사용하여 모든 페이지 컴포넌트를 동적으로 로드합니다.
 * 이 파일은 프로젝트 루트(src)에 가까운 위치에 있어서 상대 경로가 더 안정적입니다.
 */
import type { ComponentType } from "react";

// src/utils에서 src/pages로의 상대 경로: ../pages
export const pageModules = import.meta.glob<{ default: ComponentType }>(
  "../pages/**/*.{tsx,ts}",
  { eager: false }
);

if (import.meta.env.DEV) {
  const allKeys = Object.keys(pageModules);
  if (allKeys.length === 0) {
    console.error(
      "[pageModules] import.meta.glob이 비어있습니다!",
      "\n경로: ../pages/**/*.{tsx,ts}",
      "\n현재 파일 위치: src/utils/pageModules.ts",
      "\n예상 경로: src/pages/**/*.{tsx,ts}"
    );
  }
}

