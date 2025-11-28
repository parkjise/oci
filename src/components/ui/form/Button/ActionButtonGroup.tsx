import React from "react";
import { Space } from "antd";
import ActionButton, { type ActionButtonType } from "./ActionButton";

export interface ActionButtonGroupProps {
  /** 각 버튼 타입별 onClick 핸들러 (필요한 것만 설정) */
  onButtonClick?: Partial<Record<ActionButtonType, () => void>>;
  /** 숨길 버튼 타입 배열 (예: ["copy", "delete"]) */
  hideButtons?: ActionButtonType[];
  /** 버튼 간 간격 (기본값: 8) */
  size?: number;
  /** 버튼을 감싸는 컨테이너 클래스명 */
  className?: string;
  /** 버튼을 감싸는 컨테이너 스타일 */
  style?: React.CSSProperties;
  /** 프로그램 번호 (MenuButtonProvider에 전달) */
  pgmNo?: string;
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
};

/**
 * 여러 액션 버튼을 그룹으로 렌더링하는 컴포넌트
 * 기본적으로 모든 버튼(create, edit, copy, delete, save)이 표시되며,
 * hideButtons 옵션으로 특정 버튼을 제거할 수 있습니다.
 * 상위 컴포넌트에서 MenuButtonProvider로 감싸져 있어야 권한 체크가 동작합니다.
 */
const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  onButtonClick = {},
  hideButtons = [],
  size = 8,
  className,
  style,
}) => {
  // 표시할 버튼 타입 필터링
  const visibleButtons = DEFAULT_BUTTON_ORDER.filter(
    (type) => !hideButtons.includes(type)
  );

  return (
    <Space size={size} className={className} style={style}>
      {visibleButtons.map((actionType) => (
        <ActionButton
          key={actionType}
          actionType={actionType}
          onClick={onButtonClick[actionType]}
          objId={DEFAULT_OBJ_IDS[actionType]}
        />
      ))}
    </Space>
  );
};

export default ActionButtonGroup;
