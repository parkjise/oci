export const DEFAULT_VALUES = {
  USE_YN: "Y",
  PRIMARY_CHK: "N",
  ORG_ID: "HO", // 본사
  COUNTRY: "KOR", // 대한민국
  NATION_NAME: "대한민국",
  CURRENCY: "KRW", // 원화 (기본값)
} as const;

export const ROW_STATUS = {
  CREATE: "C",
  UPDATE: "U",
  DELETE: "D",
} as const;

export type RowStatus = (typeof ROW_STATUS)[keyof typeof ROW_STATUS];

export const GRID_COLUMNS = {
  SALES_MAN: "salesMan",
  COUNTRY: "country",
  SHIP_ADDR: "shipAddr",
} as const;

export const NTS_API_KEY =
  "imTWoXp6ft1YZvRpTza%2Bvbqa4UteRzhIQXY1AwWAx%2FQLOXX8olB%2BeUt3fQitrJ3zUYbyticmnNjC%2F06B7vYOxA%3D%3D";
