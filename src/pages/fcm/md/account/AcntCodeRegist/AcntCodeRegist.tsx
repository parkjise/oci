/** 
 * 계정코드 등록 페이지 (Account Code Registration Page)
 * 
 * @description 계정코드의 조회, 생성, 수정, 삭제 기능을 제공하는 메인 페이지 컴포넌트
 * @author LeeSangChan
 * @date 2025-12-29
 * @last_modified 2025-12-29
 */

import React from "react";
import TwoGridLayout from "@/components/ui/layout/TwoGridLayout";
import {
    FilterPanel,
    DetailView,
    DetailGrid,
} from "@/components/features/fcm/md/account/AcntCodeRegist";

const AcntCodeRegist: React.FC = () => {
    return (
        <TwoGridLayout
            filterPanel={<FilterPanel className="page-layout__filter-panel" />}
            leftPanel={<DetailGrid className="page-layout__detail-grid" />}
            rightPanel={<DetailView className="page-layout__detail-view" />}
        />
    );
};

export default AcntCodeRegist;
