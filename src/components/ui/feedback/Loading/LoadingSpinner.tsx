import React from "react";
import { Spin } from "antd";
import { useTranslation } from "react-i18next";
import {
  StyledContainer,
  StyledFullScreenContainer,
} from "./LoadingSpinner.styles";

interface LoadingSpinnerProps {
  size?: "small" | "default" | "large";
  tip?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "large",
  tip,
  fullScreen = false,
}) => {
  const { t } = useTranslation();
  const tipText = tip || t("loading", "로딩 중...");

  if (fullScreen) {
    // fullScreen일 때는 fullscreen prop을 사용하여 tip을 표시
    return (
      <StyledFullScreenContainer>
        <Spin size={size} tip={tipText} fullscreen />
      </StyledFullScreenContainer>
    );
  }

  // 일반 패턴일 때는 nest 패턴을 사용하여 tip을 표시
  // Spin이 다른 요소를 감싸면 nest 패턴이 되어 tip이 작동합니다
  return (
    <StyledContainer>
      <Spin size={size} tip={tipText}>
        <div style={{ minHeight: "100px", minWidth: "100px" }} />
      </Spin>
    </StyledContainer>
  );
};

export default LoadingSpinner;
