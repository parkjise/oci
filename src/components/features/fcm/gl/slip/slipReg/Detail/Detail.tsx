import React from "react";
import { SplitLayout } from "@components/ui/layout";
import { DetailStyles } from "./Detail.styles";

type SplitLayoutProps = {
  left: React.ReactNode;
  right: React.ReactNode;
};

const Detail: React.FC<SplitLayoutProps> = ({ left, right }) => {
  return (
    <DetailStyles>
      <SplitLayout
        className="page-layout__detail"
        leftPanelSize={250}
        leftPanelMin={250}
        leftPanelMax="40%"
        left={<div className="detail__pane-left">{left}</div>}
        right={<div className="detail__pane-right">{right}</div>}
      />
    </DetailStyles>
  );
};

export default Detail;
