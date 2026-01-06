import React, { useRef, useCallback, useMemo, memo } from "react";
import type {
  ColDef,
  GridApi,
  GridReadyEvent,
  RowClickedEvent,
} from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import { confirm } from "@components/ui/feedback/Message";
import { useBcncRegistStore } from "@store/fcm/md/partner/BcncRegist/BcncRegistStore";
import type { BcncListResponse } from "@/types/fcm/md/partner/BcncRegist/BcncRegist.types";
import { useTranslation } from "react-i18next";

type LeftGridProps = {
  className?: string;
};

const LeftGrid: React.FC<LeftGridProps> = ({ className }) => {
  const { t } = useTranslation();
  // ✅ Store 통구독 문제 해결: 필요한 상태만 개별 selector로 구독
  const searchData = useBcncRegistStore((state) => state.searchData);
  const setGridApi = useBcncRegistStore((state) => state.setGridApi);
  // 🚀 통합 액션 사용 (연쇄 리렌더링 방지)
  const selectRow = useBcncRegistStore((state) => state.selectRow);
  const gridRef = useRef<GridApi | null>(null);

  const rowData = useMemo(() => {
    const rawRowData = searchData || [];
    return rawRowData.map((item) => ({
      ...item,
      id: item.custno ?? undefined,
    }));
  }, [searchData]);

  const handleGridReady = useCallback(
    (params: GridReadyEvent) => {
      gridRef.current = params.api;
      setGridApi(params.api);
    },
    [setGridApi]
  );

  const handleRowClick = useCallback(
    async (event: RowClickedEvent<BcncListResponse>) => {
      if (!event.data) return;

      const { officeId, custno } = event.data;
      if (!officeId || !custno) return;

      // 🚀 통합 액션 호출 함수 (5회 렌더링 → 2회 렌더링)
      const performSelect = () => selectRow(officeId, custno);

      const { detailViewMode, detailData } = useBcncRegistStore.getState();

      if (detailViewMode === "edit") {
        // 이전에 선택된 Row 정보 저장
        const previousOfficeId = detailData?.officeId;
        const previousCustno = detailData?.custno;

        confirm({
          title: "확인",
          content: "수정 중인 데이터가 있습니다. 이동하시겠습니까?",
          onOk: performSelect, // ✅ 통합 액션 호출
          onCancel: () => {
            // 취소 시 이전에 선택된 Row를 다시 선택
            if (gridRef.current && previousOfficeId && previousCustno) {
              gridRef.current.deselectAll();

              gridRef.current.forEachNode((node) => {
                if (
                  node.data?.officeId === previousOfficeId &&
                  node.data?.custno === previousCustno
                ) {
                  node.setSelected(true);
                  gridRef.current?.ensureNodeVisible(node, "middle");
                }
              });
            }
          },
        });
      } else {
        await performSelect(); // ✅ 통합 액션 호출
      }
    },
    [selectRow] // 의존성 단순화
  );

  const columnDefs: ColDef<BcncListResponse>[] = useMemo(
    () => [
      {
        headerName: "No.",
        width: 60,
        pinned: "left",
        valueGetter: (params) => {
          if (params.node?.rowIndex != null) {
            return params.node.rowIndex + 1;
          }
          return "";
        },
        cellStyle: { textAlign: "right" },
        headerClass: "ag-right-header",
        sortable: false,
        filter: false,
      },
      {
        field: "custno",
        headerName: t("거래처"),
        width: 80,
        hide: true,
      },
      {
        field: "custname",
        headerName: t("거래처명"),
        width: 300,
        headerClass: "ag-center-header",
        bodyAlign: "left", // 바디 값 오른쪽 정렬 (간편 설정!)
      },
      {
        field: "custename",
        headerName: t("거래처대외명"),
        width: 250,
        cellStyle: { textAlign: "left" },
        hide: true,
      },
      {
        field: "custType",
        headerName: "Type",
        width: 100,
        hide: true,
      },
      {
        field: "custClass",
        headerName: t("유형"),
        width: 100,
        hide: true,
      },
      {
        field: "custArea",
        headerName: t("지역구분"),
        width: 90,
        hide: true,
      },
      {
        field: "pname",
        headerName: t("대표자"),
        width: 90,
        hide: true,
      },
      {
        field: "tel",
        headerName: t("전화번호") + "(1)",
        width: 150,
        hide: true,
      },
      {
        field: "shipToCust",
        headerName: t("전화번호") + "(2)",
        width: 150,
        hide: true,
      },
      {
        field: "fax",
        headerName: "fax",
        width: 150,
        hide: true,
      },
      {
        field: "zipcode",
        headerName: t("우편번호"),
        width: 90,
        hide: true,
      },
      {
        field: "addr",
        headerName: t("주소"),
        width: 300,
        cellStyle: { textAlign: "left" },
        hide: true,
      },
      {
        field: "regtno",
        headerName: t("사업자등록번호"),
        width: 150,
        hide: true,
      },
      {
        field: "regtnoNo",
        headerName: t("종사업장"),
        width: 150,
        hide: true,
      },
      {
        field: "uptae",
        headerName: t("업태"),
        width: 150,
        hide: true,
      },
      {
        field: "jong",
        headerName: t("종목"),
        width: 150,
        hide: true,
      },
      {
        field: "custnoGb",
        headerName: t("거래처구분"),
        width: 120,
        hide: true,
      },
      {
        field: "outsourcingYn",
        headerName: t("외주업체"),
        width: 90,
        hide: true,
      },
      {
        field: "pcustname",
        headerName: t("모거래처"),
        width: 120,
        hide: true,
      },
      {
        field: "acctNum1",
        headerName: t("미지급금계정"),
        width: 120,
        hide: true,
        cellStyle: { textAlign: "right" },
        headerClass: "ag-right-header",
      },
      {
        field: "acctName1",
        headerName: t("미지급금계정명"),
        width: 150,
        hide: true,
      },
      {
        field: "acctNum2",
        headerName: t("선급금계정"),
        width: 150,
        hide: true,
        cellStyle: { textAlign: "right" },
        headerClass: "ag-right-header",
      },
      {
        field: "acctName2",
        headerName: t("선급금계정명"),
        width: 150,
        hide: true,
      },
      {
        field: "nationalCde",
        headerName: t("국가코드"),
        width: 100,
        hide: true,
      },
      {
        field: "ntnlCde",
        headerName: t("지역"),
        width: 100,
        hide: true,
      },
      {
        field: "currency",
        headerName: t("통화"),
        width: 90,
        hide: true,
      },
      {
        field: "personYn",
        headerName: t("직원여부"),
        width: 90,
        hide: true,
      },
      {
        field: "empyNme",
        headerName: t("직원"),
        width: 90,
        hide: true,
      },
      {
        field: "vatType2",
        headerName: t("매출부가세"),
        width: 110,
        hide: true,
      },
      {
        field: "vatNmeAr",
        headerName: t("매출부가세명"),
        width: 140,
        hide: true,
      },
      {
        field: "billToCust",
        headerName: "Bill To",
        width: 100,
        hide: true,
      },
      {
        field: "billToName",
        headerName: t("Bill_To_명"),
        width: 120,
        hide: true,
      },
      {
        field: "payToCust",
        headerName: "Pay To",
        width: 100,
        hide: true,
      },
      {
        field: "payToName",
        headerName: t("Pay_To_명"),
        width: 120,
        hide: true,
      },
      {
        field: "prmShopcd",
        headerName: t("PRM_거래처"),
        width: 120,
        hide: true,
      },
      {
        field: "bank",
        headerName: t("지급은행"),
        width: 90,
        hide: true,
      },
      {
        field: "bankName",
        headerName: t("지급은행명"),
        width: 120,
        hide: true,
      },
      {
        field: "acctNbr",
        headerName: t("지급계좌번호"),
        width: 140,
        hide: true,
        cellStyle: { textAlign: "right" },
        headerClass: "ag-right-header",
      },
      {
        field: "depositor",
        headerName: t("예금주"),
        width: 100,
        hide: true,
      },
      {
        field: "stlmTerm",
        headerName: t("지급조건"),
        width: 150,
        hide: true,
      },
      {
        field: "salesMan",
        headerName: t("영업사원"),
        width: 120,
        hide: true,
      },
      {
        field: "receiptBank",
        headerName: t("수금은행"),
        width: 150,
        hide: true,
      },
      {
        field: "receiptBankName",
        headerName: t("수금은행명"),
        width: 150,
        hide: true,
      },
      {
        field: "receiptBankBranch",
        headerName: t("수금은행지점"),
        width: 150,
        hide: true,
      },
      {
        field: "receiptBankAccount",
        headerName: t("수금계좌번호"),
        width: 150,
        hide: true,
        cellStyle: { textAlign: "right" },
        headerClass: "ag-right-header",
      },
      {
        field: "stlmTermAr",
        headerName: t("수금조건"),
        width: 150,
        hide: true,
      },
      {
        field: "creditLimit",
        headerName: t("신용한도금액"),
        width: 120,
        hide: true,
        cellStyle: { textAlign: "right" },
        headerClass: "ag-right-header",
      },
      {
        field: "collateralAmount",
        headerName: t("담보한도금액"),
        width: 120,
        hide: true,
        cellStyle: { textAlign: "right" },
        headerClass: "ag-right-header",
      },
      {
        field: "mail",
        headerName: t("매출VAT담당자_e-mail"),
        width: 200,
        hide: true,
      },
      {
        field: "cikNo",
        headerName: t("쇼핑몰ID"),
        width: 120,
        hide: true,
      },
      {
        field: "useYno",
        headerName: t("사용구분"),
        width: 90,
        hide: true,
      },
      {
        field: "oldCustno",
        headerName: t("(구)거래처"),
        width: 100,
        hide: true,
      },
      {
        field: "channel",
        headerName: t("채널") + "1",
        width: 100,
        hide: true,
      },
      {
        field: "channel2",
        headerName: t("채널") + "2",
        width: 100,
        hide: true,
      },
      {
        field: "channel3",
        headerName: t("채널") + "3",
        width: 100,
        hide: true,
      },
      {
        field: "category1",
        headerName: "Territory1",
        width: 100,
        hide: true,
      },
      {
        field: "category2",
        headerName: "Territory2",
        width: 100,
        hide: true,
      },
      {
        field: "category3",
        headerName: "Territory3",
        width: 100,
        hide: true,
      },
      {
        field: "category4",
        headerName: "Territory4",
        width: 100,
        hide: true,
      },
      {
        field: "sdate",
        headerName: t("거래개시일"),
        width: 120,
        hide: true,
      },
      {
        field: "iconsCode",
        headerName: "I-CONS CD",
        width: 120,
        hide: true,
      },
      {
        field: "createdName",
        headerName: t("등록자"),
        width: 120,
        hide: true,
      },
      {
        field: "creationDate",
        headerName: t("등록일시"),
        width: 150,
        hide: true,
      },
      {
        field: "lastUpdatedName",
        headerName: t("최종수정자"),
        width: 120,
        hide: true,
      },
      {
        field: "lastUpdateDate",
        headerName: t("최종수정일시"),
        width: 150,
        hide: true,
      },
    ],
    [t]
  );

  return (
    <FormAgGrid<BcncListResponse & { id?: string }>
      className={className}
      rowData={rowData}
      headerHeight={32}
      columnDefs={columnDefs}
      height={650}
      excelFileName="거래처 목록"
      idField="custno"
      showToolbar={true}
      gridOptions={useMemo(
        () => ({
          defaultColDef: {
            flex: undefined,
          },
          rowSelection: "single",
          animateRows: true,
          pagination: false,
          rowHeight: 32,
          onGridReady: handleGridReady,
          onRowClicked: handleRowClick,
        }),
        [handleGridReady, handleRowClick]
      )}
      toolbarButtons={{
        showDelete: false,
        showCopy: false,
        showAdd: false, // 추가는 선택 여부와 관계없음
        // enableDelete: isEditMode && hasSelection, // 수정 모드이고 행이 선택되어야 함
        // enableCopy: isEditMode && hasSelection, // 수정 모드이고 행이 선택되어야 함
        // enableAdd: isEditMode, // 수정 모드이면 가능
        enableExcelDownload: true,
        showExcelDownload: true,
        showExcelUpload: false,
        // showSave: true,
      }}
    />
  );
};

// React.memo로 감싸서 불필요한 리렌더링 방지
export default memo(LeftGrid);
