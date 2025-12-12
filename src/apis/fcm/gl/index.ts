/**
 * ============================================================================
 * 총계정원장 API (GL - General Ledger)
 * ============================================================================
 *
 * 총계정원장 관련 API 호출 함수
 *
 * 하위 기능:
 * - slip: 전표관리
 * - settlement: 결산관리
 * - closing: 월마감관리
 *
 * 사용 예시:
 * import { slip, closing } from "@apis/fcm/gl";
 * await slip.selectDetailList(...);
 * await closing.selectDetailList(...);
 */

export * as slip from "./slip";
export * from "./settlement";
export * as closing from "./closing";
