import React from "react";
import { Splitter } from "antd";
import { SplitLayoutStyles } from "./SplitLayout.styles";

type SplitLayoutProps = {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
  leftPanelSize?: number;
  leftPanelMin?: number;
  leftPanelMax?: string | number;
};

const SplitLayoutEqual: React.FC<SplitLayoutProps> = ({
  left,
  right,
  className,
  leftPanelSize = "50%",
  leftPanelMin = 150,
  leftPanelMax = "80%",
}) => {
  return (
    <SplitLayoutStyles className={className}>
      <Splitter>
        <Splitter.Panel
          defaultSize={leftPanelSize}
          min={leftPanelMin}
          max={leftPanelMax}
          style={{ overflow: "hidden" }}
          className="split-layout__panel split-layout__panel--left"
        >
          <div className="split-layout__pane-left">{left}</div>
        </Splitter.Panel>
        <Splitter.Panel>
          <div className="split-layout__pane-right">{right}</div>
        </Splitter.Panel>
      </Splitter>
    </SplitLayoutStyles>
  );
};

export default SplitLayoutEqual;
