import React from "react";
import type { ReactNode } from "react";
import { Splitter } from "antd";
import { SplitLayoutStyles } from "@/components/ui/layout/Styles/SplitLayout.styles";

export interface TwoGridLayoutProps {
  /** 필터 패널 영역에 렌더링할 컴포넌트 */
  filterPanel?: ReactNode;
  /** 왼쪽 그리드 영역에 렌더링할 컴포넌트 */
  leftPanel?: ReactNode;
  /** 오른쪽 그리드 영역에 렌더링할 컴포넌트 */
  rightPanel?: ReactNode;
  /** 추가 클래스명 */
  className?: string;
  /** 왼쪽 패널 기본 크기 (기본값: "50%") */
  leftPanelSize?: number | string;
  /** 왼쪽 패널 최소 크기 (기본값: 150) */
  leftPanelMin?: number;
  /** 왼쪽 패널 최대 크기 (기본값: "80%") */
  leftPanelMax?: string | number;
}

const TowGridLayout: React.FC<TwoGridLayoutProps> = ({
  leftPanel,
  rightPanel,
  leftPanelSize = "50%",
  leftPanelMin = 150,
  leftPanelMax = "80%",
}) => (
  <>
    <SplitLayoutStyles style={{ height: "calc(100% - 45px)" }}>
      <Splitter>
        <Splitter.Panel
          defaultSize={leftPanelSize}
          min={leftPanelMin}
          max={leftPanelMax}
          style={{ overflow: "hidden" }}
          className="page-layout__grid-panel page-layout__grid-panel--left"
        >
          <section className="page-card page-card--grid">{leftPanel}</section>
        </Splitter.Panel>
        <Splitter.Panel className="page-layout__grid-panel page-layout__grid-panel--right">
          <section className="page-card page-card--grid">{rightPanel}</section>
        </Splitter.Panel>
      </Splitter>
    </SplitLayoutStyles>
  </>
);

export default TowGridLayout;
