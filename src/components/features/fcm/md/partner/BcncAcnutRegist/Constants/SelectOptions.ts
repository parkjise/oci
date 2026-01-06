export const INOUT_TYPE = {
  DEPOSIT: "1",
  WITHDRAWAL: "2",
} as const;

export const INOUT_TYPE_LABEL = {
  [INOUT_TYPE.DEPOSIT]: "입금",
  [INOUT_TYPE.WITHDRAWAL]: "출금",
} as const;

export const CURRENCY_TYPE = {
  KRW: "KRW",
  USD: "USD",
  JPY: "JPY",
  EUR: "EUR",
  CNY: "CNY",
} as const;

export const CURRENCY_TYPE_LABEL = {
  [CURRENCY_TYPE.KRW]: "KRW",
  [CURRENCY_TYPE.USD]: "USD",
  [CURRENCY_TYPE.JPY]: "JPY",
  [CURRENCY_TYPE.EUR]: "EUR",
  [CURRENCY_TYPE.CNY]: "CNY",
} as const;
