import { Tag, Space } from "antd";

/**
 * 태그 렌더러 (Ant Design Tag)
 *
 * @param color - 태그 색상 (선택사항)
 * @returns CellRenderer 함수
 *
 * @example
 * ```typescript
 * const columnDef = {
 *   field: "status",
 *   cellRenderer: createTagRenderer("blue"),
 * };
 * ```
 */
export const createTagRenderer =
  (color?: string) => (params: { value: string }) => {
    if (!params.value) return "-";
    return (
      <Tag color={color} style={{ margin: 0 }}>
        {params.value}
      </Tag>
    );
  };

/**
 * 링크 렌더러 (클릭 가능한 텍스트)
 *
 * @param onClick - 클릭 핸들러 함수
 * @returns CellRenderer 함수
 *
 * @example
 * ```typescript
 * const columnDef = {
 *   field: "name",
 *   cellRenderer: createLinkRenderer<MyData>((data) => {
 *     console.log("클릭:", data);
 *   }),
 * };
 * ```
 */
export const createLinkRenderer =
  <TData = unknown,>(onClick: (data: TData) => void) =>
  (params: { value: string; data: TData }) => {
    return (
      <span
        style={{
          color: "#1890ff",
          cursor: "pointer",
          textDecoration: "underline",
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick(params.data);
        }}
      >
        {params.value}
      </span>
    );
  };

/**
 * 태그 배열 렌더러 (여러 태그 표시)
 *
 * @param color - 태그 색상 (기본값: "blue")
 * @returns CellRenderer 함수
 *
 * @example
 * ```typescript
 * const columnDef = {
 *   field: "tags",
 *   cellRenderer: createTagArrayRenderer("green"),
 * };
 * ```
 */
export const createTagArrayRenderer =
  (color: string = "blue") =>
  (params: { value: string[] }) => {
    if (!params.value || params.value.length === 0) return "-";
    return (
      <Space size="small" wrap>
        {params.value.map((item: string, index: number) => (
          <Tag key={index} color={color}>
            {item}
          </Tag>
        ))}
      </Space>
    );
  };

/**
 * 상태 렌더러 (활성/비활성 등)
 *
 * @param activeColor - 활성 상태 색상 (기본값: "green")
 * @param inactiveColor - 비활성 상태 색상 (기본값: "red")
 * @param activeValue - 활성 상태 값 (기본값: "활성")
 * @returns CellRenderer 함수
 *
 * @example
 * ```typescript
 * const columnDef = {
 *   field: "status",
 *   cellRenderer: createStatusRenderer("green", "red", "활성"),
 * };
 * ```
 */
export const createStatusRenderer =
  (
    activeColor: string = "green",
    inactiveColor: string = "red",
    activeValue: string = "활성"
  ) =>
  (params: { value: string }) => {
    const color = params.value === activeValue ? activeColor : inactiveColor;
    return (
      <Tag color={color} style={{ margin: 0 }}>
        {params.value}
      </Tag>
    );
  };

