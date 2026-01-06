import { Checkbox } from "antd";
import type { ICellRendererParams } from "ag-grid-community";
import { CheckboxContainer } from "./CheckboxCellRenderer.styles";

interface CheckboxCellRendererParams<TData = unknown>
  extends ICellRendererParams<TData> {
  /** Y/N 값을 boolean으로 변환할지 여부 (기본값: true) */
  convertYN?: boolean;
  /** 체크박스 변경 핸들러 */
  onValueChange?: (
    checked: boolean,
    params: ICellRendererParams<TData>
  ) => void;
  /** 체크박스 변경 가능 여부 (기본값: false) */
  editable?: boolean;
}

/**
 * AG-Grid 체크박스 셀 렌더러
 * Y/N 값을 체크박스로 표시하고 편집 가능
 *
 * @example
 * ```typescript
 * {
 *   field: 'isActive',
 *   cellRenderer: CheckboxCellRenderer,
 *   cellRendererParams: {
 *     convertYN: true, // Y/N 문자열을 boolean으로 변환
 *     onValueChange: (checked, params) => {
 *       // 커스텀 변경 핸들러
 *     }
 *   }
 * }
 * ```
 */
export const CheckboxCellRenderer = <TData extends Record<string, unknown>>(
  params: CheckboxCellRendererParams<TData>
) => {
  const {
    value,
    convertYN = true,
    onValueChange,
    node,
    data,
    api,
    column,
    editable = false
  } = params;

  // Y/N 문자열 또는 boolean 값을 체크박스 상태로 변환
  const checked = convertYN ? value === "Y" || value === true : Boolean(value);

  const handleChange = (e: { target: { checked: boolean } }) => {
    const newValue = e.target.checked;

    // 데이터 업데이트
    if (data && column && node && api && editable) {
      const field = column.getColId();

      // convertYN 옵션에 따라 값 저장
      let newFieldValue: unknown;
      if (convertYN) {
        newFieldValue = newValue ? "Y" : "N";
      } else {
        newFieldValue = newValue;
      }

      // node.setDataValue를 사용하면 AG-Grid가 자동으로 onCellValueChanged 이벤트를 발생시킴
      // 이렇게 하면 gridOptions.onCellValueChanged가 정상적으로 호출되어 rowStatus가 업데이트됨
      node.setDataValue(field, newFieldValue);

      // 해당 셀만 리프레시 (성능 최적화)
      api.refreshCells({ rowNodes: [node], columns: [field], force: false });

      // 커스텀 핸들러가 있으면 실행 (데이터 업데이트 후)
      if (onValueChange) {
        onValueChange(newValue, params);
      }
    }
  };

  return (
    <CheckboxContainer>
      <Checkbox
        checked={checked}
        onChange={handleChange}
        disabled={!editable}
      />
    </CheckboxContainer>
  );
};

export default CheckboxCellRenderer;
