import { Article } from "@/pages/sample/sample2/Sample2.styles";
import FilterPanel from "@/pages/sample/sample2/FelterPanel/FilterPanel";
import RecordList from "@/pages/sample/sample2/RecordList/RecordList";
import DetailView from "@/pages/sample/sample2/DetailView/DetailView";
import DetaiGrid from "@/pages/sample/sample2/DetailGrid/DetailGrid";
import Detail from "@/pages/sample/split/Detail/Detail";

const Sample2: React.FC = () => {
  return (
    <Article className="page-layout">
      {/* 조회 */}
      <FilterPanel className="page-layout__filter-panel" />
      {/* 조회 결과 */}
      <Detail
        left={<RecordList className="page-layout__record-list" />} // 상세 리스트
        rightTop={<DetailView className="page-layout__detail-view" />}
        rightBottom={<DetaiGrid className="page-layout__detail-grid" />}
      />
    </Article>
  );
};

export default Sample2;
