/**
 * ============================================================================
 * 재무회계 Feature 컴포넌트 (FCM - Financial & Cost Management)
 * ============================================================================
 * 
 * 재무회계 도메인 재사용 가능한 Feature 컴포넌트
 * 
 * 하위 도메인:
 * - gl: 총계정원장 (General Ledger)
 * - ap: 매입채무 (Accounts Payable)
 * - ar: 매출채권 (Accounts Receivable)
 * - fa: 고정자산 (Fixed Assets)
 * - md: 기준정보 (Master Data)
 * 
 * @see FCM-Service 패키지 구조 설계 문서
 */

export * from "./gl";
export * from "./ap";
export * from "./ar";
export * from "./fa";
export * from "./md";

