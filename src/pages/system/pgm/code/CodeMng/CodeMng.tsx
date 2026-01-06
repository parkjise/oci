// ============================================================================
// 공통코드관리 페이지 (CodeMng)
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)
// - 2025.12.16 : ckkim (SearchGridLayout 적용, 공통 컴포넌트로 교체)
// - 2025.12.16 : ckkim (SlipPost 패턴 적용, 컴포넌트 분리)
// - 2025.12.16 : ckkim (Store 패턴 적용, 페이지 최소화)

import React, { useEffect, useState } from "react";
import { SearchGridLayout } from "@components/ui/layout/SearchGridLayout";
import {
  FilterPanel,
  DetailGrid,
  TypeHeaderModal,
} from "@components/features/system/pgm/code/CodeMng";
import { useCodeMngStore } from "@store/system/pgm/code/codeMngStore";

// ============================================================================
// Component
// ============================================================================
const CodeMng: React.FC = () => {
  const { fetchModuleList, selectedModule, insertTypeHeader } =
    useCodeMngStore();
  const [isTypeHeaderModalOpen, setIsTypeHeaderModalOpen] = useState(false);

  // 초기 로드
  useEffect(() => {
    fetchModuleList();
  }, [fetchModuleList]);

  // 공통코드구분 입력 핸들러 (TYPE 헤더 등록)
  const handleInsertTypeHeader = () => {
    if (!selectedModule) {
      // message는 store에서 처리
      return;
    }
    setIsTypeHeaderModalOpen(true);
  };

  // TYPE 헤더 등록 확인 핸들러
  const handleTypeHeaderConfirm = (
    type: string,
    name1: string,
    nameDesc?: string
  ) => {
    insertTypeHeader(type, name1, nameDesc);
    setIsTypeHeaderModalOpen(false);
  };

  return (
    <>
      <SearchGridLayout
        filterPanel={<FilterPanel />}
        grid={<DetailGrid onInsertTypeHeader={handleInsertTypeHeader} />}
      />

      {/* 공통코드구분(TYPE) 헤더 등록 모달 */}
      <TypeHeaderModal
        open={isTypeHeaderModalOpen}
        module={selectedModule}
        onClose={() => setIsTypeHeaderModalOpen(false)}
        onConfirm={handleTypeHeaderConfirm}
      />
    </>
  );
};

export default CodeMng;
