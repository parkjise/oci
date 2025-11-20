import { Article } from "@/pages/sample/sample2/Sample2.styles";
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
					<Splitter layout="vertical" style={{ height: "100%" }}>
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
};

export default Sample2;
