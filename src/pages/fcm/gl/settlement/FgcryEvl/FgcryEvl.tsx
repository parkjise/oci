import React, { useState, useCallback, useMemo } from "react";
import { Article } from "@/components/ui/layout/Styles/PageLayout.styles";
import {
  FilterPanel,
  RecordList,
  DetailGrid
} from "@/components/features/fcm/gl/settlement/fgcryEvl";
import { Splitter } from "antd";
import { SplitLayoutStyles } from "@/components/ui/layout/Styles/SplitLayout.styles";
import type { FgcryEvlListResponse } from "@/components/features/fcm/gl/settlement/fgcryEvl/RecordList/RecordList";
import { mockFgcryEvlList, mockFgcryEvlDetail, type FgcryEvlDetailResponse } from "@/components/features/fcm/gl/settlement/fgcryEvl/mockData";
import dayjs from "dayjs";

type SplitLayoutProps = {
  className?: string;
  leftPanelSize?: number;
  leftPanelMin?: number;
  leftPanelMax?: string | number;
};

const FgcryEvl: React.FC<SplitLayoutProps> = ({
  className,
  leftPanelSize = 250,
  leftPanelMin = 250,
  leftPanelMax = "40%",
}) => {
  // 상태 관리
  const [listData, setListData] = useState<FgcryEvlListResponse[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [editingId] = useState<string | null>(null);
  const [detailDataMap, setDetailDataMap] = useState<Record<string, FgcryEvlDetailResponse[]>>({});

  // 항목 선택 핸들러
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  // 조회 핸들러 (FilterPanel에서 사용)
  const handleSearch = useCallback(async (_searchParams: any) => {
    try {
      // TODO: 실제 API 호출로 대체
      // const response = await searchFgcryEvlList(searchParams);
      // if (response.success && response.data) {
      //   setListData(response.data);
      // }
      // Mock 데이터 사용
      setListData(mockFgcryEvlList);
      // 첫 번째 항목 자동 선택
      if (mockFgcryEvlList.length > 0 && mockFgcryEvlList[0].id) {
        setSelectedId(String(mockFgcryEvlList[0].id));
      }
    } catch (error) {
      console.error("조회 중 오류 발생:", error);
    }
  }, []);
  // Create 버튼 핸들러
  const handleCreate = useCallback(() => {
    // 오늘 날짜로 전표번호 생성 (MSD-YYYYMMDD-번호)
    const today = dayjs().format("YYYYMMDD");
    
    // 기존 전표 중 같은 날짜의 전표 찾기
    const todaySlips = listData.filter(
      (slip) => slip.slipNo?.startsWith(`MSD-${today}`)
    );
    
    // 다음 번호 계산
    const nextNumber = todaySlips.length > 0
      ? Math.max(
          ...todaySlips.map((slip) => {
            const match = slip.slipNo?.match(/MSD-\d{8}-(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          })
        ) + 1
      : 1;
    
    const newSlipNo = `MSD-${today}-${nextNumber}`;
    
    // 새 전표 생성 (GL 구분)
    const newSlip: FgcryEvlListResponse = {
      id: newSlipNo,
      dvs: "GL",
      slipNo: newSlipNo,
      reverseSlipNo: "",
      posted: "N",
    };
    
    // 새 상세 데이터 생성 (이미지 기준)
    const newDetailData: FgcryEvlDetailResponse[] = [
      {
        id: 1,
        status: "",
        invNo: "산업_본점_외보_USD_9574",
        currency: "USD",
        account: "1110103",
        accountName: "현금성자산(외화보통_USD)",
        customer: "002",
        customerName: "산업",
        manageNo2: "",
        exchangeRate: 0,
        foreignAmount: 0,
        localAmount: 0,
        evaluationRate: 0,
        evaluationAmount: 0,
        evaluationProfit: 0,
        businessUnit: "",
        slipHeaderId: newSlipNo,
        slipNo: newSlipNo,
      },
    ];
    
    // 상태 업데이트
    setListData((prev) => [...prev, newSlip]);
    setDetailDataMap((prev) => ({
      ...prev,
      [newSlipNo]: newDetailData,
    }));
    setSelectedId(newSlipNo);
  }, [listData]);
  

// 선택된 전표의 상세 데이터
const detailData = useMemo<FgcryEvlDetailResponse[]>(() => {
  if (!selectedId) return [];
  return detailDataMap[selectedId] || mockFgcryEvlDetail[selectedId] || [];
}, [selectedId, detailDataMap]);

  return (
    <Article className="page-layout page-layout--search-list-detail-grid">
      <section className="page-card page-card--filter">
        <FilterPanel className="page-layout__filter-panel" onSearch={handleSearch} />
      </section>
      <SplitLayoutStyles className={className}>
        <Splitter>
          <Splitter.Panel
            defaultSize={leftPanelSize}
            min={leftPanelMin}
            max={leftPanelMax}
            style={{ overflow: "hidden" }}
            className="split-layout__panel split-layout__panel--left"
          >
            <section className="page-card page-card--list">
              {/* 리스트 */}
              <RecordList 
                className="page-layout__record-list"
                items={listData}
                selectedId={selectedId}
                editingId={editingId}
                onSelect={handleSelect}
              />
            </section>
          </Splitter.Panel>
          <Splitter.Panel>
            <div className="split-layout__pane-right">
              <div className="page-layout__detail-grid page-card  page-card--detail-grid">
                <DetailGrid className="page-layout__detail-grid" rowData={detailData} onCreate={handleCreate} />
              </div>
            </div>
          </Splitter.Panel>
        </Splitter>
      </SplitLayoutStyles>
    </Article>
  );
};

export default FgcryEvl;