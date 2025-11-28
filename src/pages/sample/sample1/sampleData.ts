import type { DataNode } from "antd/es/tree";
import type {
  DemoGridData,
  SummaryGridData,
  MultiEditGridData,
} from "@/types/sample.types";

/**
 * Sample1 페이지에서 사용하는 초기 그리드 데이터
 */
export const INITIAL_GRID_DATA: DemoGridData[] = [
  { id: 1, name: "항목 1", category: "카테고리 A", amount: 10000 },
  { id: 2, name: "항목 2", category: "카테고리 B", amount: 20000 },
  { id: 3, name: "항목 3", category: "카테고리 A", amount: 15000 },
];

/**
 * Sample1 페이지에서 사용하는 초기 다중 편집 그리드 데이터
 */
export const INITIAL_MULTI_EDIT_GRID_DATA: MultiEditGridData[] = [
  {
    id: 1,
    name: "프로젝트 A",
    category: "개발",
    status: "진행중",
    startDate: new Date(2024, 0, 15),
    amount: 1000000,
    description: "프로젝트 설명 1",
    isActive: true,
    isApproved: false,
    isPublished: false,
  },
  {
    id: 2,
    name: "프로젝트 B",
    category: "디자인",
    status: "대기",
    startDate: new Date(2024, 1, 20),
    amount: 500000,
    description: "프로젝트 설명 2",
    isActive: false,
    isApproved: true,
    isPublished: false,
  },
  {
    id: 3,
    name: "프로젝트 C",
    category: "기획",
    status: "완료",
    startDate: new Date(2024, 2, 10),
    amount: 2000000,
    description: "프로젝트 설명 3",
    isActive: true,
    isApproved: true,
    isPublished: true,
  },
  {
    id: 4,
    name: "프로젝트 D",
    category: "개발",
    status: "진행중",
    startDate: new Date(2024, 3, 5),
    amount: 1500000,
    description: "프로젝트 설명 4",
    isActive: true,
    isApproved: false,
    isPublished: true,
  },
];

/**
 * Sample1 페이지에서 사용하는 요약 그리드 데이터
 */
export const SUMMARY_GRID_DATA: SummaryGridData[] = [
  {
    id: 1,
    category: "전자제품",
    subCategory: "스마트폰",
    item: "아이폰 15",
    quantity: 5,
    unitPrice: 1200000,
    total: 6000000,
  },
  {
    id: 2,
    category: "전자제품",
    subCategory: "스마트폰",
    item: "갤럭시 S24",
    quantity: 3,
    unitPrice: 1100000,
    total: 3300000,
  },
  {
    id: 3,
    category: "전자제품",
    subCategory: "노트북",
    item: "맥북 프로",
    quantity: 2,
    unitPrice: 2500000,
    total: 5000000,
  },
  {
    id: 4,
    category: "전자제품",
    subCategory: "노트북",
    item: "LG 그램",
    quantity: 4,
    unitPrice: 1500000,
    total: 6000000,
  },
  {
    id: 5,
    category: "의류",
    subCategory: "상의",
    item: "티셔츠",
    quantity: 10,
    unitPrice: 30000,
    total: 300000,
  },
  {
    id: 6,
    category: "의류",
    subCategory: "상의",
    item: "셔츠",
    quantity: 8,
    unitPrice: 50000,
    total: 400000,
  },
  {
    id: 7,
    category: "의류",
    subCategory: "하의",
    item: "청바지",
    quantity: 6,
    unitPrice: 80000,
    total: 480000,
  },
  {
    id: 8,
    category: "의류",
    subCategory: "하의",
    item: "슬랙스",
    quantity: 5,
    unitPrice: 70000,
    total: 350000,
  },
];

/**
 * Sample1 페이지에서 사용하는 트리 데이터
 */
export const TREE_DATA: DataNode[] = [
  {
    title: "부서",
    key: "0-0",
    children: [
      {
        title: "개발팀",
        key: "0-0-0",
        children: [
          { title: "프론트엔드", key: "0-0-0-0" },
          { title: "백엔드", key: "0-0-0-1" },
          { title: "데브옵스", key: "0-0-0-2" },
        ],
      },
      {
        title: "디자인팀",
        key: "0-0-1",
        children: [
          { title: "UI/UX", key: "0-0-1-0" },
          { title: "그래픽", key: "0-0-1-1" },
        ],
      },
      {
        title: "기획팀",
        key: "0-0-2",
        children: [
          { title: "프로덕트", key: "0-0-2-0" },
          { title: "비즈니스", key: "0-0-2-1" },
        ],
      },
    ],
  },
  {
    title: "프로젝트",
    key: "0-1",
    children: [
      { title: "프로젝트 A", key: "0-1-0" },
      { title: "프로젝트 B", key: "0-1-1" },
      { title: "프로젝트 C", key: "0-1-2" },
    ],
  },
];

