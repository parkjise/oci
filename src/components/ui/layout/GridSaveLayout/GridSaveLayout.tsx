import React from "react";
import type { ReactNode } from "react";
import { ActionButtonGroup } from "@components/ui/form";
import type { ActionButtonGroupProps } from "@components/ui/form/Button/ActionButtonGroup";
import type { ActionButtonType } from "@components/ui/form/Button/ActionButton";
import {
  GridSaveLayoutContainer,
  ButtonWrapper,
  GridWrapper,
} from "./GridSaveLayout.styles";

export interface GridSaveLayoutProps {
  /** 그리드 영역에 렌더링할 컴포넌트 */
  children: ReactNode;
  /** 저장 버튼 클릭 핸들러 */
  onSave?: () => void;
  /** ActionButtonGroup에 전달할 추가 버튼 핸들러 */
  onButtonClick?: Partial<Record<ActionButtonType, () => void>>;
  /** 숨길 버튼 타입 배열 (기본값: ["create", "edit", "copy", "delete", "expand"]) */
  hideButtons?: ActionButtonType[];
  /** 추가 클래스명 */
  className?: string;
  /** 버튼 영역에 추가로 렌더링할 컴포넌트 */
  buttonExtra?: ReactNode;
  /** ActionButtonGroup에 전달할 추가 옵션 */
  buttonGroupProps?: Omit<
    ActionButtonGroupProps,
    "onButtonClick" | "hideButtons"
  >;
}

const GridSaveLayout: React.FC<GridSaveLayoutProps> = ({
  children,
  onSave,
  onButtonClick,
  hideButtons = ["create", "edit", "copy", "delete", "expand"],
  className,
  buttonGroupProps,
}) => {
  return (
    <GridSaveLayoutContainer className={className}>
      <ButtonWrapper>
        <ActionButtonGroup
          onButtonClick={{
            save: onSave,
            ...onButtonClick,
          }}
          hideButtons={hideButtons}
          {...buttonGroupProps}
        />
      </ButtonWrapper>
      <GridWrapper className="grid-wrapper">{children}</GridWrapper>
    </GridSaveLayoutContainer>
  );
};

export default GridSaveLayout;
