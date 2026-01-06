// ============================================================================
// 다국어관리 페이지 (LabelMng)
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)
// - 2025.12.02 : ckkim (SearchGridLayout 적용, 공통 컴포넌트로 교체)
// - 2025.12.16 : ckkim (SlipPost 패턴 적용, 컴포넌트 분리)
// - 2025.12.16 : ckkim (Store 패턴 적용, 페이지 최소화)

import React, { useEffect } from "react";
import { SearchGridLayout } from "@components/ui/layout/SearchGridLayout";
import {
  FilterPanel,
  DetailGrid,
} from "@components/features/system/pgm/lang/label/LabelMng";
import { useLabelMngStore } from "@store/system/pgm/lang/label/labelMngStore";

// ============================================================================
// Component
// ============================================================================
const LabelMng: React.FC = () => {
  const { fetchLangTypeList } = useLabelMngStore();

  // 초기 로드
  useEffect(() => {
    fetchLangTypeList();
  }, [fetchLangTypeList]);

  return (
    <SearchGridLayout
      filterPanel={<FilterPanel />}
      grid={<DetailGrid />}
    />
  );
};

export default LabelMng;
