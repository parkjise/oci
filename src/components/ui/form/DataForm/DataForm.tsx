import React from "react";
import dayjs from "dayjs";
import { DataFormStyles } from "./DataForm.styles";
import { Tag, Form } from "antd";
import {
  FormButton,
  FormSearchInput,
  FormLabel,
  ActionButtonGroup,
  AttachmentButton,
} from "@components/ui/form";
import { useAttachment } from "@hooks/useAttachment";
import { AttachmentDrawer } from "@components/ui/feedback";
import type { PendingFile } from "@components/ui/feedback";

// 상수 분리
const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const ICON_MAP: Record<HelpIconType, string> = {
  question: "ri-question-line",
  error: "ri-information-line",
  asterisk: "ri-asterisk",
};

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

export interface AttachmentManualModeConfig {
  /** 파일 저장 실패 시 콜백 */
  onSaveError?: (files: PendingFile[], error: unknown) => void;
  /** 파일 선택 시 콜백 (업무 저장과 통합용) */
  onFilesSelected?: (files: PendingFile[]) => void;
  /** 외부에서 관리하는 대기 파일 목록 */
  pendingFiles?: PendingFile[];
  /** 대기 파일 목록 변경 콜백 */
  onPendingFilesChange?: (files: PendingFile[]) => void;
  /** 외부에서 저장 완료 후 호출하는 함수 (파일 목록 새로고침용) */
  onSaveComplete?: () => void;
}

export interface DataFormProps {
  className?: string;
  leftActions?: ActionButton[];
  actionButtonGroup?: {
    onButtonClick?: Partial<Record<SupportedActionButtonType, () => void>>;
    hideButtons?: SupportedActionButtonType[];
    customButtons?: React.ReactNode[];
    showCustomButtonsDivider?: boolean;
    showAllCustomButtons?: boolean;
    maxVisibleCustomButtons?: number;
    /** 아코디언이 시작되는 행 인덱스 배열 (예: [5, 15, 25] → 5, 15, 25번째 행부터 아코디언) */
    accordionAt?: number[];
    /** 화면 로드 시 아코디언 섹션의 기본 확장 상태 (기본값: false - 접혀있음) */
    defaultExpanded?: boolean;
  };
  tableRows: TableRow[];
  tableData?: Record<string, unknown>;
  mode?: "view" | "edit";
  department?: string;
  user?: string;
  status?: string;
  statusClass?: string;
  /** 첨부파일 기능 활성화 여부 (기본값: attachmentKey가 있으면 true) */
  enableAttachment?: boolean;
  /** 첨부파일 키 (식별자) */
  attachmentKey?: string;
  /** 파일 그룹 키 (eatKey) - 내부에서 파일 개수 조회용 */
  attachmentEatKey?: number | string;
  /** 파일 경로 (eatKey 생성 시 사용, 기본값: attachmentKey) */
  attachmentEatPath?: string;
  /** Drawer 닫힐 때 생성된 eatKey를 리턴하는 콜백 */
  attachmentOnClose?: (eatKey?: number) => void;
  /** 자동 업로드 여부 (기본값: false - 수동 모드) */
  attachmentAutoUpload?: boolean;
  /** 수동 모드 설정 (attachmentAutoUpload=false일 때만 사용) */
  attachmentManualMode?: AttachmentManualModeConfig;
  /** 외부에서 onSaveComplete 함수를 받을 수 있도록 ref setter */
  onSaveCompleteRefSetter?: (ref: (() => Promise<void>) | undefined) => void;
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
  /** 외부에서 Form 인스턴스를 주입받을 수 있도록 prop 추가 */
  form?: import("antd").FormInstance;
  /** Form name 속성 */
  formName?: string;
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
  enableAttachment,
  attachmentKey,
  attachmentEatKey,
  attachmentEatPath,
  attachmentOnClose,
  attachmentAutoUpload = false,
  attachmentManualMode,
  onSaveCompleteRefSetter,
  onSearch,
  onLeftAction,
  onValuesChange,
  onFinish,
  onFinishFailed,
  form: propForm,
  formName = "data-form",
}) => {
  // Form 인스턴스 (외부에서 주입받거나 내부에서 생성)
  const [internalForm] = Form.useForm();
  const form = propForm || internalForm;

  // ============================================================================
  // 첨부파일 관련 로직 (useAttachment 훅 사용)
  // ============================================================================

  // 첨부 기능 활성화 여부 (attachmentKey가 있으면 활성화)
  const isAttachmentEnabled = React.useMemo(() => {
    if (enableAttachment !== undefined) return enableAttachment;
    return !!attachmentKey;
  }, [enableAttachment, attachmentKey]);

  // useAttachment 훅 사용 (eatKey 생성, 파일 개수, Drawer 관리)
  const {
    attachmentCount,
    openDrawer,
    drawerProps: baseDrawerProps,
    refreshCount,
  } = useAttachment({
    eatKey: attachmentEatKey,
    eatPath: attachmentEatPath || attachmentKey,
    autoLoad: !!attachmentEatKey,
    onClose: attachmentOnClose,
  });

  // onSaveComplete 핸들러 생성 (useCallback으로 최적화)
  const handleSaveComplete = React.useCallback(async () => {
    await refreshCount();
    attachmentManualMode?.onSaveComplete?.();
  }, [refreshCount, attachmentManualMode]);

  // onSaveCompleteRef 업데이트
  React.useEffect(() => {
    onSaveCompleteRefSetter?.(handleSaveComplete);
  }, [handleSaveComplete, onSaveCompleteRefSetter]);

  // drawerProps 오버라이드 (onUploadSuccess에 onSaveComplete 연결)
  const customDrawerProps = React.useMemo(
    () => ({
      ...baseDrawerProps,
      onUploadSuccess: async () => {
        await baseDrawerProps.onUploadSuccess();
        if (!attachmentAutoUpload) {
          await handleSaveComplete();
        }
      },
    }),
    [baseDrawerProps, attachmentAutoUpload, handleSaveComplete]
  );

  // onLeftAction과 통합
  const handleLeftActionWrapper = React.useCallback(
    (actionType: ActionButtonType) => {
      if (actionType === "attachment") {
        openDrawer();
      }
      onLeftAction?.(actionType);
    },
    [openDrawer, onLeftAction]
  );

  // ============================================================================
  // 테이블 데이터 처리
  // ============================================================================

  // 날짜 필드를 dayjs 객체로 변환
  const processedTableData = React.useMemo(() => {
    const processed = { ...tableData };
    for (const [key, value] of Object.entries(processed)) {
      if (typeof value === "string" && DATE_REGEX.test(value)) {
        const parsed = dayjs(value);
        if (parsed.isValid()) {
          processed[key] = parsed;
        }
      }
    }
    return processed;
  }, [tableData]);

  // tableData 변경 시 Form 필드 값 업데이트
  React.useEffect(() => {
    form.setFieldsValue(processedTableData);
  }, [processedTableData, form]);

  // ============================================================================
  // 테이블 행 제한 처리 (아코디언)
  // ============================================================================

  // 아코디언 시작 인덱스 배열 정규화
  const accordionIndices = React.useMemo(() => {
    const indices = actionButtonGroup?.accordionAt;
    if (!indices || indices.length === 0) return [];
    // 정렬 및 중복 제거, 유효한 인덱스만 필터링
    return [...new Set(indices)]
      .filter((idx) => idx >= 0 && idx < tableRows.length)
      .sort((a, b) => a - b);
  }, [actionButtonGroup?.accordionAt, tableRows.length]);

  // 특정 행이 어느 아코디언 섹션에 속하는지 확인
  const getRowSectionStart = React.useCallback(
    (rowIndex: number): number | null => {
      if (accordionIndices.length === 0) return null;

      for (let i = 0; i < accordionIndices.length; i++) {
        const sectionStart = accordionIndices[i];
        const sectionEnd =
          i < accordionIndices.length - 1
            ? accordionIndices[i + 1]
            : tableRows.length;

        if (rowIndex >= sectionStart && rowIndex < sectionEnd) {
          return sectionStart;
        }
      }

      return null;
    },
    [accordionIndices, tableRows.length]
  );

  // 각 아코디언 섹션별 확장 상태 관리
  const [accordionStates, setAccordionStates] = React.useState<
    Record<number, boolean>
  >({});

  // 초기 확장 상태 설정
  React.useEffect(() => {
    if (accordionIndices.length === 0) return;

    const defaultExpanded = actionButtonGroup?.defaultExpanded ?? false;
    const initialState: Record<number, boolean> = {};

    accordionIndices.forEach((sectionStart) => {
      initialState[sectionStart] = defaultExpanded;
    });

    setAccordionStates(initialState);
  }, [accordionIndices, actionButtonGroup?.defaultExpanded]);

  // 아코디언 섹션의 확장 상태 확인
  const isSectionExpanded = React.useCallback(
    (sectionStart: number): boolean => {
      return accordionStates[sectionStart] ?? false;
    },
    [accordionStates]
  );

  // 아코디언 섹션 토글
  const toggleSection = React.useCallback((sectionStart: number) => {
    setAccordionStates((prev) => ({
      ...prev,
      [sectionStart]: !prev[sectionStart],
    }));
  }, []);

  // 행을 그룹으로 분류 (최적화된 렌더링을 위해)
  const rowGroups = React.useMemo(() => {
    // accordionAt이 지정된 경우
    if (accordionIndices.length > 0) {
      const groups: Array<{
        type: "visible" | "accordion";
        rows: TableRow[];
        startIndex: number;
        sectionStart?: number;
      }> = [];

      let currentGroup: {
        type: "visible" | "accordion";
        rows: TableRow[];
        startIndex: number;
        sectionStart?: number;
      } | null = null;

      tableRows.forEach((row, rowIndex) => {
        const sectionStart = getRowSectionStart(rowIndex);

        if (sectionStart !== null) {
          // 아코디언 섹션
          if (
            currentGroup?.type === "accordion" &&
            currentGroup.sectionStart === sectionStart
          ) {
            // 같은 섹션에 속하는 행
            currentGroup.rows.push(row);
          } else {
            // 새로운 섹션 시작
            if (currentGroup) {
              groups.push(currentGroup);
            }
            currentGroup = {
              type: "accordion",
              rows: [row],
              startIndex: rowIndex,
              sectionStart,
            };
          }
        } else {
          // 일반 표시 행
          if (currentGroup?.type === "visible") {
            currentGroup.rows.push(row);
          } else {
            if (currentGroup) {
              groups.push(currentGroup);
            }
            currentGroup = {
              type: "visible",
              rows: [row],
              startIndex: rowIndex,
            };
          }
        }
      });

      if (currentGroup) {
        groups.push(currentGroup);
      }

      return groups;
    }

    // 모든 행 표시
    return [
      {
        type: "visible" as const,
        rows: tableRows,
        startIndex: 0,
      },
    ];
  }, [tableRows, accordionIndices, getRowSectionStart]);

  // ActionButtonGroup props 처리
  const processedActionButtonGroup = React.useMemo(() => {
    if (!actionButtonGroup) return undefined;

    return actionButtonGroup;
  }, [actionButtonGroup]);

  // ============================================================================
  // 렌더링 함수
  // ============================================================================

  // leftActions 필터링 최적화
  const filteredLeftActions = React.useMemo(
    () => leftActions.filter((action) => action.type !== "attachment"),
    [leftActions]
  );

  // leftActions 렌더링 최적화
  const renderLeftActions = React.useCallback(() => {
    return filteredLeftActions.map((action) => {
      const { type, onClick, visible = true } = action;
      if (!visible) return null;

      const handleClick = () => {
        if (onClick) {
          onClick();
        } else {
          onLeftAction?.(type);
        }
      };

      if (type === "search") {
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
      }

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
    });
  }, [filteredLeftActions, onLeftAction, onSearch]);

  // 필드 값 렌더링
  const renderFieldValue = React.useCallback(
    (field: TableField) => {
      const { key, onChange, label, labelKey, render, inputComponent } = field;
      const fieldValue = processedTableData[key];

      // 필드 값을 문자열로 변환
      let displayValue = "";
      if (fieldValue != null) {
        if (typeof fieldValue === "object" && dayjs.isDayjs(fieldValue)) {
          displayValue = fieldValue.format("YYYY-MM-DD");
        } else {
          displayValue = String(fieldValue);
        }
      }

      // 커스텀 render 함수 사용
      if (render) {
        return render({
          field,
          value: displayValue,
          onChange: onChange || (() => {}),
          mode,
        });
      }

      // input 컴포넌트 사용
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
    },
    [processedTableData, mode]
  );

  // 도움말 아이콘 렌더링
  const renderHelpIcon = React.useCallback((helpIcon?: HelpIconType) => {
    if (!helpIcon) return null;
    return (
      <span className={`helptext ${helpIcon}`}>
        <i className={ICON_MAP[helpIcon]}></i>
      </span>
    );
  }, []);

  // 테이블 셀 렌더링
  const renderTableCell = React.useCallback(
    (
      field: TableField,
      isHeader = false,
      options?: {
        showAccordionButton?: boolean;
        sectionStart?: number;
        onToggleSection?: () => void;
      }
    ) => {
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

      const { showAccordionButton, sectionStart, onToggleSection } =
        options || {};

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
          {showAccordionButton &&
            sectionStart !== undefined &&
            onToggleSection && (
              <button
                type="button"
                className="detail-view__accordion-toggle"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleSection();
                }}
                aria-label={isSectionExpanded(sectionStart) ? "접기" : "펼치기"}
              >
                <i
                  className={
                    isSectionExpanded(sectionStart)
                      ? "ri-arrow-up-s-line"
                      : "ri-arrow-down-s-line"
                  }
                />
              </button>
            )}
        </>
      ) : (
        renderFieldValue(field)
      );

      const Tag = isHeader ? "th" : "td";
      const cellColspan = isHeader
        ? (headerColspan ?? colspan)
        : (dataColspan ?? colspan);
      const cellRowspan = isHeader
        ? (headerRowspan ?? rowspan)
        : (dataRowspan ?? rowspan);

      const colspanProps =
        cellColspan && cellColspan > 1 ? { colSpan: cellColspan } : {};
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
    },
    [renderFieldValue, renderHelpIcon, isSectionExpanded]
  );

  return (
    <>
      <Form
        form={form}
        name={formName}
        initialValues={processedTableData}
        onValuesChange={onValuesChange}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
      >
        <DataFormStyles className={className}>
          <div className="detail-view__actions">
            <div className="detail-view__actions-group detail-view__actions-group--left">
              {renderLeftActions()}
              {department && (
                <span className="detail-view__department">{department}</span>
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
                  <div className="detail-view__divider"></div>
                </>
              )}

              {isAttachmentEnabled && (
                <>
                  <AttachmentButton
                    count={attachmentCount}
                    onClick={() => handleLeftActionWrapper("attachment")}
                    className="detail-view__attachment"
                  />
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
                {rowGroups.map((group) => {
                  if (group.type === "visible") {
                    // 일반 표시 행들
                    return group.rows.map((row, rowIndex) => (
                      <tr key={`visible-${group.startIndex + rowIndex}`}>
                        {row.fields.map((field, fieldIndex) => (
                          <React.Fragment
                            key={`visible-${group.startIndex + rowIndex}-${fieldIndex}`}
                          >
                            {renderTableCell(field, true)}
                            {renderTableCell(field, false)}
                          </React.Fragment>
                        ))}
                      </tr>
                    ));
                  } else {
                    // 아코디언 섹션
                    const isExpanded =
                      group.sectionStart !== undefined
                        ? isSectionExpanded(group.sectionStart)
                        : false;

                    return group.rows.map((row, rowIndex) => {
                      const isFirstRow = rowIndex === 0;
                      const sectionStart = group.sectionStart;

                      return (
                        <tr
                          key={`accordion-${group.startIndex + rowIndex}`}
                          className={`detail-view__accordion-row ${
                            isFirstRow
                              ? "accordion-header"
                              : isExpanded
                                ? "expanded"
                                : "collapsed"
                          }`}
                          data-section-start={sectionStart}
                        >
                          {row.fields.map((field, fieldIndex) => (
                            <React.Fragment
                              key={`accordion-${group.startIndex + rowIndex}-${fieldIndex}`}
                            >
                              {renderTableCell(
                                field,
                                true,
                                isFirstRow &&
                                  fieldIndex === 0 &&
                                  sectionStart !== undefined
                                  ? {
                                      showAccordionButton: true,
                                      sectionStart,
                                      onToggleSection: () =>
                                        toggleSection(sectionStart),
                                    }
                                  : undefined
                              )}
                              {renderTableCell(field, false)}
                            </React.Fragment>
                          ))}
                        </tr>
                      );
                    });
                  }
                })}
              </tbody>
            </table>
          </div>
        </DataFormStyles>
      </Form>

      {/* AttachmentDrawer 내부에서 렌더링 */}
      {isAttachmentEnabled && (
        <AttachmentDrawer
          {...customDrawerProps}
          autoUpload={attachmentAutoUpload}
          onSaveError={attachmentManualMode?.onSaveError}
          onFilesSelected={attachmentManualMode?.onFilesSelected}
          externalPendingFiles={attachmentManualMode?.pendingFiles}
          onPendingFilesChange={attachmentManualMode?.onPendingFilesChange}
        />
      )}
    </>
  );
};

export default DataForm;
