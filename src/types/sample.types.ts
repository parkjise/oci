import type { Dayjs } from "dayjs";
import type React from "react";

/**
 * Sample1 페이지에서 사용하는 폼 타입
 */
export interface DemoFormType {
  userName: string;
  userName2: string;
  email?: string;
  password?: string;
  amount?: number;
  search?: string;
  searchWithButton?: string;
  searchWithIcon?: string;
  category: string;
  priority: string;
  singleDate?: Dayjs;
  startDate?: Dayjs;
  endDate?: Dayjs;
  dateRange?: [Dayjs, Dayjs];
  hobbies: string[];
  agree: boolean;
  tag?: string;
  tree?: React.Key[];
}

/**
 * Sample1 페이지에서 사용하는 기본 그리드 데이터 타입
 */
export interface DemoGridData {
  id: number;
  name: string;
  category: string;
  amount: number;
}

/**
 * Sample1 페이지에서 사용하는 요약 그리드 데이터 타입
 */
export interface SummaryGridData {
  id: number;
  category: string;
  subCategory: string;
  item: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

/**
 * Sample1 페이지에서 사용하는 다중 편집 그리드 데이터 타입
 */
export interface MultiEditGridData {
  id: number;
  name: string;
  category: string;
  status: string;
  startDate: Date | null;
  amount: number;
  description: string;
  isActive: boolean;
  isApproved: boolean;
  isPublished: boolean;
}

