import React, { useState } from "react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import ActionButton, { type ActionButtonType } from "./ActionButton";
import FormButton from "./FormButton";

export interface ActionButtonGroupProps {
  /** 각 버튼 타입별 onClick 핸들러 (필요한 것만 설정) */
  onButtonClick?: Partial<Record<ActionButtonType, () => void>>;
  /** 숨길 버튼 타입 배열 (예: ["copy", "delete"]) */
  hideButtons?: ActionButtonType[];
  /** 프로그램 번호 (MenuButtonProvider에 전달) */
  pgmNo?: string;
  /** 접기/펼치기 기능 활성화 여부 */
  enableExpand?: boolean;
  /** 접기/펼치기 상태 (외부에서 제어할 경우) */
  expanded?: boolean;
  /** 접기/펼치기 상태 변경 핸들러 */
  onExpandChange?: (expanded: boolean) => void;
  /** 커스텀 버튼들 (기본 버튼들 뒤에 렌더링됨) */
  customButtons?: React.ReactNode[];
  /** 커스텀 버튼 앞에 구분선 표시 여부 (기본값: true) */
  showCustomButtonsDivider?: boolean;
  /** 커스텀 버튼을 모두 표시할지 여부 (기본값: false - 2개까지 표시, 나머지는 드롭다운) */
  showAllCustomButtons?: boolean;
  /** 기본적으로 표시할 커스텀 버튼 개수 (기본값: 2) */
  maxVisibleCustomButtons?: number;
}

/**
 * 기본 버튼 타입 순서
 */
const DEFAULT_BUTTON_ORDER: ActionButtonType[] = [
  "create",
  "edit",
  "copy",
  "delete",
  "save",
];

/**
 * 기본 objId 매핑
 */
const DEFAULT_OBJ_IDS: Record<ActionButtonType, string> = {
  create: "BTN_CREATE",
  edit: "BTN_EDIT",
  copy: "BTN_COPY",
  delete: "BTN_DELETE",
  save: "BTN_SAVE",
  expand: "BTN_EXPAND",
};

/**
 * 여러 액션 버튼을 그룹으로 렌더링하는 컴포넌트
 * 기본적으로 모든 버튼(create, edit, copy, delete, save)이 표시되며,
 * hideButtons 옵션으로 특정 버튼을 제거할 수 있습니다.
 * customButtons prop으로 커스텀 버튼을 추가할 수 있습니다.
 * 커스텀 버튼이 2개 초과일 경우, 기본적으로 처음 2개만 표시하고 나머지는 ":" 버튼 드롭다운으로 표시합니다.
 * showAllCustomButtons 옵션으로 모든 커스텀 버튼을 표시할 수 있습니다.
 * 상위 컴포넌트에서 MenuButtonProvider로 감싸져 있어야 권한 체크가 동작합니다.
 */
const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  onButtonClick = {},
  hideButtons = [],
  enableExpand = false,
  expanded: controlledExpanded,
  onExpandChange,
  customButtons,
  showCustomButtonsDivider = true,
  showAllCustomButtons = false,
  maxVisibleCustomButtons = 2,
}) => {
  const [internalExpanded, setInternalExpanded] = useState(false);

  // 외부에서 제어하는지 내부에서 제어하는지 결정
  const isControlled = controlledExpanded !== undefined;
  const expanded = isControlled ? controlledExpanded : internalExpanded;

  const handleExpandToggle = () => {
    const newExpanded = !expanded;
    if (!isControlled) {
      setInternalExpanded(newExpanded);
    }
    onExpandChange?.(newExpanded);
    onButtonClick.expand?.();
  };

  // 표시할 버튼 타입 필터링
  const visibleButtons = DEFAULT_BUTTON_ORDER.filter(
    (type) => !hideButtons.includes(type)
  );

  // 커스텀 버튼에 스타일 적용하는 헬퍼 함수
  const applyButtonStyle = (button: React.ReactNode): React.ReactNode => {
    if (React.isValidElement(button)) {
      // 이미 size가 있으면 유지, 없으면 "small" 추가
      const buttonProps = button.props as {
        size?: "small" | "middle" | "large";
      };
      const currentSize = buttonProps.size;
      return React.cloneElement(
        button as React.ReactElement<{ size?: "small" | "middle" | "large" }>,
        {
          size: currentSize || "small",
        }
      );
    }
    return button;
  };

  // 커스텀 버튼 렌더링 로직
  const renderCustomButtons = () => {
    if (!customButtons || customButtons.length === 0) {
      return null;
    }

    // 모든 버튼을 표시하는 경우
    if (showAllCustomButtons) {
      return (
        <>
          {showCustomButtonsDivider && (
            <div className="detail-view__divider"></div>
          )}
          {customButtons.map((button, index) => (
            <React.Fragment key={index}>
              {applyButtonStyle(button)}
            </React.Fragment>
          ))}
        </>
      );
    }

    // 버튼 개수가 maxVisibleCustomButtons 이하인 경우 모두 표시
    if (customButtons.length <= maxVisibleCustomButtons) {
      return (
        <>
          {showCustomButtonsDivider && (
            <div className="detail-view__divider"></div>
          )}
          {customButtons.map((button, index) => (
            <React.Fragment key={index}>
              {applyButtonStyle(button)}
            </React.Fragment>
          ))}
        </>
      );
    }

    // 버튼 개수가 maxVisibleCustomButtons 초과인 경우
    const visibleButtons = customButtons.slice(0, maxVisibleCustomButtons);
    const dropdownButtons = customButtons.slice(maxVisibleCustomButtons);

    // 드롭다운 메뉴 아이템 생성
    const menuItems: MenuProps["items"] = dropdownButtons.map(
      (button, index) => {
        // 버튼이 React 요소인 경우, 클론하여 드롭다운 메뉴 아이템으로 변환
        if (React.isValidElement(button)) {
          const buttonProps = button.props as {
            onClick?: () => void;
            children?: React.ReactNode;
          };
          const onClick = buttonProps.onClick;
          const children = buttonProps.children;

          return {
            key: `custom-${maxVisibleCustomButtons + index}`,
            label: (
              <FormButton onClick={onClick} size="small">
                {children}
              </FormButton>
            ),
          };
        }
        return {
          key: `custom-${maxVisibleCustomButtons + index}`,
          label: button,
        };
      }
    );

    return (
      <>
        {/* {showCustomButtonsDivider && (
          <div className="action-button-group__divider"></div>
        )} */}
        {/* 표시할 버튼들 */}
        {visibleButtons.map((button, index) => (
          <React.Fragment key={index}>
            {applyButtonStyle(button)}
          </React.Fragment>
        ))}
        {/* 드롭다운 버튼 */}
        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <FormButton
            type="text"
            size="small"
            icon={<i className="ri-more-2-line" style={{ fontSize: 16 }} />}
            className="action-button-group__button action-button-group__button--more"
          ></FormButton>
        </Dropdown>
      </>
    );
  };

  return (
    <>
      {/* 커스텀 버튼을 입력 버튼 앞에 배치 */}
      {renderCustomButtons()}
      {visibleButtons.map((actionType) => (
        <ActionButton
          key={actionType}
          actionType={actionType}
          onClick={onButtonClick[actionType]}
          objId={DEFAULT_OBJ_IDS[actionType]}
        />
      ))}
      {enableExpand && (
        <>
          <div className="detail-view__divider"></div>
          <ActionButton
            actionType="expand"
            onClick={handleExpandToggle}
            objId={DEFAULT_OBJ_IDS.expand}
            icon={
              expanded ? (
                <i className="ri-arrow-up-s-line" style={{ fontSize: 18 }} />
              ) : (
                <i className="ri-arrow-down-s-line" style={{ fontSize: 18 }} />
              )
            }
          ></ActionButton>
        </>
      )}
    </>
  );
};

export default ActionButtonGroup;
