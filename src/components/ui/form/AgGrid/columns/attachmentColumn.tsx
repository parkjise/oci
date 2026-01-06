import { AttachmentButton } from "../../AttachmentButton";
import type { ICellRendererParams, ColDef } from "ag-grid-community";

export interface AttachmentRendererParams<TData = unknown> {
  /** eatKey 필드명 또는 eatKey 값을 반환하는 함수 */
  eatKeyField?: string | ((data: TData) => number | string | undefined);
  /** 파일 개수 필드명 또는 파일 개수를 반환하는 함수 */
  countField?: string | ((data: TData) => number);
  /** 클릭 핸들러 */
  onClick?: (data: TData, eatKey?: number | string) => void;
}

/**
 * 첨부파일 렌더러 생성 함수
 *
 * @example
 * ```typescript
 * const columnDef = {
 *   field: "attachment",
 *   headerName: "첨부파일",
 *   cellRenderer: createAttachmentRenderer<MyDataType>({
 *     eatKeyField: "eatKey", // 또는 (data) => data.fileKey
 *     countField: "fileCount", // 또는 (data) => data.attachments?.length
 *     onClick: (data, eatKey) => {
 *       // 첨부파일 Drawer 열기
 *       openAttachmentDrawer(data, eatKey);
 *     },
 *   }),
 * };
 * ```
 */
export const createAttachmentRenderer =
  <TData = unknown,>(params: AttachmentRendererParams<TData>) =>
  (cellParams: ICellRendererParams<TData>) => {
    if (!cellParams.data) return null;

    const { eatKeyField, countField, onClick } = params;
    const data = cellParams.data;

    // eatKey 추출
    let eatKey: number | string | undefined;
    if (typeof eatKeyField === "function") {
      eatKey = eatKeyField(data);
    } else if (eatKeyField && typeof data === "object") {
      eatKey = (data as Record<string, unknown>)[eatKeyField] as
        | number
        | string
        | undefined;
    }

    // 파일 개수 추출
    let count = 0;
    if (typeof countField === "function") {
      count = countField(data) || 0;
    } else if (countField && typeof data === "object") {
      count = ((data as Record<string, unknown>)[countField] as number) || 0;
    }

    const handleClick = () => {
      onClick?.(data, eatKey);
    };

    return (
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <AttachmentButton count={count} onClick={handleClick} />
      </div>
    );
  };

/**
 * 첨부파일 컬럼 생성 함수
 *
 * @example
 * ```typescript
 * const columnDef = createAttachmentColumn<MyDataType>({
 *   field: "attachment",
 *   headerName: "첨부파일",
 *   width: 100,
 *   eatKeyField: "eatKey",
 *   countField: "fileCount",
 *   onClick: (data, eatKey) => openAttachmentDrawer(data, eatKey),
 * });
 * ```
 */
export const createAttachmentColumn = <TData = unknown,>(
  options: {
    field: string;
    headerName: string;
    width?: number;
    /** 컬럼 숨김 여부 (기본값: false) */
    hide?: boolean;
  } & AttachmentRendererParams<TData>
): ColDef<TData> => {
  const { field, headerName, width, hide = false, ...rendererParams } = options;

  return {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: field as any, // 타입 캐스팅 (AG-Grid의 엄격한 타입 처리)
    headerName,
    width,
    cellRenderer: createAttachmentRenderer<TData>(rendererParams),
    sortable: false,
    filter: false,
    resizable: true,
    hide,
  };
};
