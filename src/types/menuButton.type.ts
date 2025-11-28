/**
 * 메뉴 버튼 관련 타입 정의
 */

/**
 * 메뉴 버튼 정보
 */
export interface MenuButton {
  /** 시스템 ID */
  systemId: string;
  /** 프로그램 번호 */
  pgmNo: string;
  /** 객체 ID */
  objId: string;
  /** 객체 타입 */
  objType: string;
  /** 사용 여부 (Y/N) */
  useYn: string;
  /** 객체 이름 */
  objName: string;
  /** 표시 여부 (Y/N) */
  visibleYn: string;
  /** 행 상태 */
  rowStatus: string;
  /** 생성자 */
  createdBy: string;
  /** 최종 수정자 */
  lastUpdatedBy: string;
  /** 프로그램 ID */
  programId: string;
  /** 터미널 ID */
  terminalId: string;
}
