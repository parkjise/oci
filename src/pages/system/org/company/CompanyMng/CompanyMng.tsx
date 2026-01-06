// ============================================================================
// 법인 관리 페이지 (CompanyMng)
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)
// - 2024.12.26 : Antigravity (Store 패턴 적용 및 대규모 리팩토링)

import React, { useEffect } from "react";
import TwoGridLayout from "@components/ui/layout/TwoGridLayout/TwoGridLayout";
import {
  Search,
  CompanyGrid,
  CompanyDetailPanel,
} from "@components/features/system/org/company/CompanyMng";
import { useCompanyMngStore } from "@store/system/org/company/companyMngStore";

const CompanyMng: React.FC = () => {
  const { reset } = useCompanyMngStore();

  useEffect(() => {
    return () => reset();
  }, [reset]);

  return (
    <TwoGridLayout
      filterPanel={<Search />}
      leftPanel={<CompanyGrid />}
      rightPanel={<CompanyDetailPanel />}
      leftPanelSize="50%"
    />
  );
};

export default CompanyMng;
