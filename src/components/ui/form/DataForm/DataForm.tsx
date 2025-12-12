import React from "react";
import dayjs from "dayjs";
import { DataFormStyles } from "./DataForm.styles";
import { Tooltip, Badge, Tag, Form } from "antd";
import {
  FormButton,
  FormSearchInput,
  FormLabel,
  ActionButtonGroup,
} from "@components/ui/form";

export type ActionButtonType =
  | "search"
  | "department"
  | "user"
  | "status"
  | "attachment"
  | "approve"
  | "cancel-approve"
  | "edit"
  | "create" // ActionButton의 "create"와 매핑
  | "copy"
  | "delete"
  | "save"
  | "expand"
  | "more";

// ActionButton.tsx에서 지원하는 타입들 (ActionButtonGroup에서 사용)
export type SupportedActionButtonType =
  | "edit"
  | "create"
  | "copy"
  | "delete"
  | "save"
  | "expand";

export type HelpIconType = "question" | "error" | "asterisk";

export interface ActionButton {
  type: ActionButtonType;
  label?: string;
  icon?: React.ReactNode;
  tooltip?: string;
  onClick?: () => void;
  disabled?: boolean;
  visible?: boolean;
  objId?: string;
  hideIfNoPermission?: boolean;
  showTooltip?: boolean;
}

export interface TableField {
  key: string;
  label?: string;
  labelKey?: string;
  required?: boolean;
  helpIcon?: HelpIconType;
  colspan?: number;
  rowspan?: number;
  headerColspan?: number;
  dataColspan?: number;
  headerRowspan?: number;
  dataRowspan?: number;
  inputComponent?: React.ComponentType<{
    name: string;
    placeholder?: string;
    value?: string;
    onChange?: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => void;
    options?: Array<{ value: string; label: string }>;
    [key: string]: unknown;
  }>;
  render?: (props: {
    field: TableField;
    value: string;
    onChange: (value: string) => void;
    mode: "view" | "edit";
  }) => React.ReactNode;
  onChange?: (value: string) => void;
}

export interface TableRow {
  fields: TableField[];
}

export interface DataFormProps {
  className?: string;
  leftActions?: ActionButton[];
  actionButtonGroup?: {
    onButtonClick?: Partial<Record<SupportedActionButtonType, () => void>>;
    hideButtons?: SupportedActionButtonType[];
    enableExpand?: boolean;
    expanded?: boolean;
    onExpandChange?: (expanded: boolean) => void;
    customButtons?: React.ReactNode[];
    showCustomButtonsDivider?: boolean;
    showAllCustomButtons?: boolean;
    maxVisibleCustomButtons?: number;
    maxVisibleRows?: number; // 최대 표시 행 수 (기본값: 전체 표시)
  };
  tableRows: TableRow[];
  tableData?: Record<string, unknown>;
  mode?: "view" | "edit";
  department?: string;
  user?: string;
  status?: string;
  statusClass?: string;
  attachmentCount?: number;
  attachmentKey?: string;
  onSearch?: (value: string) => void;
  onLeftAction?: (actionType: ActionButtonType) => void;
  onValuesChange?: (
    changedValues: Record<string, unknown>,
    allValues: Record<string, unknown>
  ) => void;
  onFinish?: (values: Record<string, unknown>) => void;
  onFinishFailed?: (errorInfo: {
    errorFields: unknown[];
    outOfDate: boolean;
  }) => void;
}

const DataForm: React.FC<DataFormProps> = ({
  className,
  leftActions = [],
  actionButtonGroup,
  tableRows,
  tableData = {},
  mode = "view",
  department,
  user,
  status,
  statusClass,
  attachmentCount = 0,
  attachmentKey,
  onSearch,
  onLeftAction,
  onValuesChange,
  onFinish,
  onFinishFailed,
}) => {
  // 날짜 필드를 dayjs 객체로 변환
  const processedTableData = React.useMemo(() => {
    const processed = { ...tableData };
    Object.keys(processed).forEach((key) => {
      const value = processed[key];
      if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const parsed = dayjs(value);
        if (parsed.isValid()) {
          processed[key] = parsed;
        }
      }
    });
    return processed;
  }, [tableData]);

  // 표시할 행 제한
  const visibleRows = React.useMemo(() => {
    // 확장 상태이거나 maxVisibleRows가 유효하지 않은 경우 모든 행 표시
    if (
      actionButtonGroup?.expanded || // 확장 상태일 때
      !actionButtonGroup?.maxVisibleRows ||
      actionButtonGroup?.maxVisibleRows <= 0 ||
      tableRows.length <= actionButtonGroup?.maxVisibleRows
    ) {
      return tableRows;
    }
    return tableRows.slice(0, actionButtonGroup?.maxVisibleRows);
  }, [
    tableRows,
    actionButtonGroup?.maxVisibleRows,
    actionButtonGroup?.expanded,
  ]);

  // 행 개수에 따라 확장 버튼 자동 숨김 처리
  const processedActionButtonGroup = React.useMemo(() => {
    if (!actionButtonGroup) return undefined;

    // enableExpand가 true일 때만 행 개수 체크 (false면 애초에 확장 버튼 없음)
    const needsExpansion = actionButtonGroup.enableExpand
      ? tableRows.length > (actionButtonGroup?.maxVisibleRows ?? 0)
      : false;

    return {
      ...actionButtonGroup,
      enableExpand: needsExpansion,
    };
  }, [actionButtonGroup, tableRows.length]);

  const renderFieldValue = (field: TableField) => {
    const { key, onChange, label, labelKey, render, inputComponent } = field;
    const fieldValue = processedTableData[key];

    // fieldValue를 안전하게 문자열로 변환
    let displayValue = "";
    if (fieldValue != null) {
      // dayjs 객체인 경우 format을 사용, 그 외는 String 변환
      if (typeof fieldValue === "object" && dayjs.isDayjs(fieldValue)) {
        displayValue = fieldValue.format("YYYY-MM-DD");
      } else {
        displayValue = String(fieldValue);
      }
    }

    // 외부 render 함수 우선 사용 (커스텀 렌더링)
    if (render) {
      return render({
        field,
        value: displayValue,
        onChange: onChange || (() => {}),
        mode,
      });
    }

    // 외부 input 컴포넌트 사용
    if (inputComponent) {
      const InputComponent = inputComponent;
      const placeholderText = labelKey
        ? `${label || labelKey}을(를) 입력하세요`
        : `${label || key}을(를) 입력하세요`;

      return (
        <InputComponent
          name={key}
          placeholder={placeholderText}
          value={displayValue}
          onChange={(e) => onChange?.(e.target.value)}
          mode={mode}
        />
      );
    }

    return null;
  };

  // 아이콘 매핑 최적화
  const iconMap = React.useMemo(
    () => ({
      question: "ri-question-line",
      error: "ri-information-line",
      asterisk: "ri-asterisk",
    }),
    []
  );

  const renderHelpIcon = (helpIcon?: HelpIconType) => {
    if (!helpIcon) return null;

    return (
      <span className={`helptext ${helpIcon}`}>
        <i className={iconMap[helpIcon]}></i>
      </span>
    );
  };

  const renderTableCell = (field: TableField, isHeader = false) => {
    const {
      label,
      labelKey,
      required,
      helpIcon,
      colspan,
      rowspan,
      headerColspan,
      dataColspan,
      headerRowspan,
      dataRowspan,
    } = field;

    const content = isHeader ? (
      <>
        {labelKey ? (
          <FormLabel labelKey={labelKey} label={label} required={required} />
        ) : (
          <>
            {label}
            {required && (
              <span className="helptext asterisk">
                <i className="ri-asterisk"></i>
              </span>
            )}
            {renderHelpIcon(helpIcon)}
          </>
        )}
      </>
    ) : (
      renderFieldValue(field)
    );

    const Tag = isHeader ? "th" : "td";
    const cellColspan = isHeader
      ? headerColspan ?? colspan
      : dataColspan ?? colspan;
    const colspanProps =
      cellColspan && cellColspan > 1 ? { colSpan: cellColspan } : {};

    const cellRowspan = isHeader
      ? headerRowspan ?? rowspan
      : dataRowspan ?? rowspan;
    const rowspanProps =
      cellRowspan && cellRowspan > 1 ? { rowSpan: cellRowspan } : {};

    return (
      <Tag
        key={`${field.key}-${isHeader ? "header" : "data"}`}
        {...colspanProps}
        {...rowspanProps}
      >
        {content}
      </Tag>
    );
  };

  return (
    <Form
      initialValues={processedTableData}
      onValuesChange={onValuesChange}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
    >
      <DataFormStyles className={className}>
        <div className="detail-view__actions">
          <div className="detail-view__actions-group detail-view__actions-group--left">
            {leftActions
              .filter((action) => action.type !== "attachment")
              .map((action) => {
                const { type, onClick, visible = true } = action;
                if (!visible) return null;

                const handleClick = () => {
                  if (onClick) onClick();
                  else if (onLeftAction) onLeftAction(type);
                };

                switch (type) {
                  case "search":
                    return (
                      <FormSearchInput
                        key={type}
                        name="search"
                        label=""
                        placeholder="검색어를 입력하세요"
                        style={{ width: 160, marginRight: 10 }}
                        className="form-input form-input--search"
                        onSearch={onSearch}
                      />
                    );
                  default:
                    return (
                      <FormButton
                        key={type}
                        size="small"
                        className={`detail-view__button detail-view__button--${type}`}
                        onClick={handleClick}
                      >
                        {action.label || type}
                      </FormButton>
                    );
                }
              })}
            {department && (
              <>
                <div className="detail-view__divider"></div>
                <span className="detail-view__department">{department}</span>
              </>
            )}

            {user && (
              <>
                <div className="detail-view__divider"></div>
                <span className="detail-view__user">{user}</span>
              </>
            )}

            {status && (
              <>
                <div className="detail-view__divider"></div>
                <span className="detail-view__status">
                  <Tag
                    className={`detail-view__status-tag${
                      statusClass
                        ? ` detail-view__status-tag--${statusClass}`
                        : ""
                    }`}
                  >
                    {status}
                  </Tag>
                </span>
              </>
            )}

            {attachmentKey && (
              <>
                <div className="detail-view__divider"></div>
                <div className="detail-view__attachment">
                  <Tooltip title="첨부파일">
                    <FormButton
                      icon={
                        <i
                          className="ri-attachment-2"
                          style={{ fontSize: 20 }}
                        />
                      }
                      size="small"
                      className="detail-view__button detail-view__button--more"
                      onClick={() => onLeftAction?.("attachment")}
                    />
                  </Tooltip>
                  <Badge
                    className="detail-view__attachment--badge"
                    count={attachmentCount}
                    color="#DC3545"
                  />
                </div>
              </>
            )}
          </div>

          <div className="detail-view__actions-group detail-view__actions-group--right">
            {processedActionButtonGroup && (
              <ActionButtonGroup {...processedActionButtonGroup} />
            )}
          </div>
        </div>

        <div className="detail-view__table">
          <table>
            <tbody>
              {visibleRows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.fields.map((field, fieldIndex) => (
                    <React.Fragment key={`${rowIndex}-${fieldIndex}`}>
                      {renderTableCell(field, true)}
                      {renderTableCell(field, false)}
                    </React.Fragment>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </DataFormStyles>
    </Form>
  );
};

export default DataForm;
