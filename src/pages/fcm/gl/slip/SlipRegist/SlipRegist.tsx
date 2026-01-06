/**
 * 전표등록 페이지 (Slip Registration Page)
 * 
 * @description 회계 전표의 조회, 생성, 수정, 삭제 기능을 제공하는 메인 페이지 컴포넌트
 * @author LeeSangChan
 * @date 2025-12-19
 * @last_modified 2025-12-19
 */

import React from "react";
import { ListDetailLayout } from "@/components/ui/layout/ListDetailLayout";
import {
  FilterPanel,
  RecordList,
  DetailView,
  DetailGrid,
} from "@components/features/fcm/gl/slip/SlipRegist";

const SlipRegist: React.FC = () => {
  return (
    <ListDetailLayout
      filterPanel={<FilterPanel className="page-layout__filter-panel" />}
      listPanel={<RecordList className="page-layout__list-panel" />}
      detailPanel={<DetailView className="page-layout__detail-view" />}
      detailBottomPanel={<DetailGrid className="page-layout__detail-grid" />}
    />
  );
};

export default SlipRegist;
