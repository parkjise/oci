import { Tag } from "antd";
import type { ICellRendererParams } from "ag-grid-community";
import { TagContainer } from "./TagCellRenderer.styles";

interface TagConfig {
  value: string | number;
  color: string;
  label: string;
}

interface TagCellRendererParams<TData = unknown>
  extends ICellRendererParams<TData> {
  /** 태그 설정 배열 */
  tagConfigs?: TagConfig[];
  /** 기본 태그 설정 (tagConfigs가 없을 때 사용) */
  defaultTagConfigs?: TagConfig[];
}

/**
 * AG-Grid 태그 셀 렌더러
 * 값에 따라 다른 색상의 태그를 표시
 *
 * @example
 * ```typescript
 * {
 *   field: 'status',
 *   cellRenderer: TagCellRenderer,
 *   cellRendererParams: {
 *     tagConfigs: [
 *       { value: 'ACTIVE', color: 'green', label: '활성' },
 *       { value: 'INACTIVE', color: 'red', label: '비활성' },
 *     ]
 *   }
 * }
 * ```
 */
export const TagCellRenderer = <TData extends Record<string, unknown>>(
  params: TagCellRendererParams<TData>
) => {
  const { value, tagConfigs, defaultTagConfigs } = params;

  // 태그 설정 결정: tagConfigs 우선, 없으면 defaultTagConfigs 사용
  const configs = tagConfigs || defaultTagConfigs || [];

  // 값과 일치하는 태그 설정 찾기
  const tagConfig = configs.find(
    (config) => String(config.value) === String(value)
  );

  // 태그 설정이 없으면 원본 값 표시
  if (!tagConfig) {
    return <TagContainer>{value ?? ""}</TagContainer>;
  }

  return (
    <TagContainer>
      <Tag color={tagConfig.color}>{tagConfig.label}</Tag>
    </TagContainer>
  );
};

/**
 * 상태 태그 렌더러 (rowStatus용)
 * 행 상태(C: 추가, U: 수정, D: 삭제)를 태그로 표시
 *
 * @example
 * ```typescript
 * {
 *   field: 'rowStatus',
 *   cellRenderer: StatusTagRenderer
 * }
 * ```
 */
export const StatusTagRenderer = <TData extends Record<string, unknown>>(
  params: ICellRendererParams<TData>
) => {
  const defaultConfigs: TagConfig[] = [
    { value: "C", color: "blue", label: "추가" },
    { value: "U", color: "orange", label: "수정" },
    { value: "D", color: "red", label: "삭제" },
  ];

  return <TagCellRenderer {...params} defaultTagConfigs={defaultConfigs} />;
};

export default TagCellRenderer;
