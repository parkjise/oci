// ============================================================================
// 메시지관리 페이지 (MessageMng)
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)
// - 2025.12.16 : ckkim (SearchGridLayout 적용, 공통 컴포넌트로 교체)
// - 2025.12.16 : ckkim (SlipPost 패턴 적용, 컴포넌트 분리)
// - 2025.12.16 : ckkim (Store 패턴 적용, 페이지 최소화)

import React, { useEffect } from "react";
import { SearchGridLayout } from "@components/ui/layout/SearchGridLayout";
import {
  FilterPanel,
  DetailGrid,
} from "@components/features/system/pgm/lang/message/MessageMng";
import { useMessageMngStore } from "@store/system/pgm/lang/message/messageMngStore";

// ============================================================================
// Component
// ============================================================================
const MessageMng: React.FC = () => {
  const { fetchLangTypeList, fetchIconTypeList, fetchButtonTypeList } =
    useMessageMngStore();

  // 초기 로드
  useEffect(() => {
    fetchLangTypeList();
    fetchIconTypeList();
    fetchButtonTypeList();
  }, [fetchLangTypeList, fetchIconTypeList, fetchButtonTypeList]);

  return (
    <SearchGridLayout filterPanel={<FilterPanel />} grid={<DetailGrid />} />
  );
};

export default MessageMng;
