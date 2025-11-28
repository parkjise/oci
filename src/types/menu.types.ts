import type { MenuItem } from "@/types/api.types";
import type { ReactNode } from "react";

/**
 * 검색 가능한 메뉴 아이템 인터페이스
 */
export interface SearchableMenuItem {
  /** 프로그램 번호 */
  pgmNo: string;
  /** 메뉴 라벨 (다국어 번역된 이름) */
  label: string;
  /** 라우트 경로 */
  path: string;
  /** 아이콘 컴포넌트 */
  icon?: ReactNode;
  /** 부모 메뉴 경로 (예: "구매재고 > 구매요청") */
  breadcrumb: string;
  /** 원본 메뉴 아이템 */
  menu: MenuItem;
}
