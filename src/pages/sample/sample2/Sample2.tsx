import React from "react";
import { Article } from "@/pages/sample/sample2/Sample2.styles";
<<<<<<< HEAD
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
=======
import FilterPanel from "@/pages/sample/sample2/FelterPanel/FilterPanel";
import RecordList from "@/pages/sample/sample2/RecordList/RecordList";
import DetailView from "@/pages/sample/sample2/DetailView/DetailView";
import DetaiGrid from "@/pages/sample/sample2/DetailGrid/DetailGrid";
import Detail from "@/pages/sample/sample2/Detail/Detail";
import { Splitter } from "antd";
const Sample2: React.FC = () => {
	return (
		<Article className="page-layout">
			{/* 조회 */}
			<FilterPanel className="page-layout__filter-panel" />
			{/* 조회 결과 */}
			<Detail
				left={<RecordList className="page-layout__record-list" />} // 상세 리스트
				right={
					<Splitter layout="vertical">
						<Splitter.Panel defaultSize={179} min={80} max="30%">
							{/*상세 화면 */}
							<DetailView className="page-layout__detail-view" />
						</Splitter.Panel>
						<Splitter.Panel>
							{/*상세 Grid */}
							<DetaiGrid className="page-layout__detail-grid" />
						</Splitter.Panel>
					</Splitter>
				}
			/>
		</Article>
	);
>>>>>>> 91e8a46ae562b458484506a504bb948ae58e3490
};

export default Sample2;
