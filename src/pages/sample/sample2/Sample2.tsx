import React from "react";
import { Article } from "@/pages/sample/sample2/Sample2.styles";
import {
  FilterPanel,
  RecordList,
  DetailView,
  DetailGrid,
} from "@components/features/sample2";
import { SplitLayout } from "@components/ui/layout";
import { Splitter } from "antd";

const Sample2: React.FC = () => {
  return (
    <Article className="page-layout page-layout-splitter">
      {/* 조회 */}
      <FilterPanel className="page-layout__filter-panel" />
      {/* 조회 결과 */}
      <SplitLayout
        left={<RecordList className="page-layout__record-list" />}
        right={
          <Splitter layout="vertical">
            <Splitter.Panel
              defaultSize={179}
              min={80}
              max="40%"
              style={{ overflow: "hidden" }}
            >
              {/*상세 화면 */}
              <DetailView className="page-layout__detail-view" />
            </Splitter.Panel>
            <Splitter.Panel>
              {/*상세 Grid */}
              <DetailGrid className="page-layout__detail-grid" />
            </Splitter.Panel>
          </Splitter>
        }
      />
    </Article>
  );
};

export default Sample2;
