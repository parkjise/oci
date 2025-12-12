import React from "react";
import TwoGridLayout from "@/components/ui/layout/TwoGridLayout";
import {
    FilterPanel,
    DetailView,
    DetailGrid,
} from "@components/features/fcm/md/account/AcntRegist";

const AcntRegist: React.FC = () => {
    return (
        <TwoGridLayout
            filterPanel={<FilterPanel className="page-layout__filter-panel" />}
            leftPanel={<DetailGrid className="page-layout__detail-grid" />}
            rightPanel={<DetailView className="page-layout__detail-view" />}
        />
    );
};

export default AcntRegist;