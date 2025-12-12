import React, { useRef, useCallback, useMemo } from "react";
import type {
  ColDef,
  GridApi,
  GridReadyEvent,
  RowClickedEvent,
} from "ag-grid-community";
import { FormAgGrid } from "@components/ui/form";
import { useBcncRegistStore } from "@store/bcncRegistStore";
import type { BcncListResponse } from "@/types/fcm/md/partner/bcncRegist.types";

type LeftGridProps = {
  className?: string;
};

const LeftGrid: React.FC<LeftGridProps> = ({ className }) => {
  const { searchData, setGridApi, getDetail, getShipList } =
    useBcncRegistStore();
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

      // 상세 정보 조회
      await getDetail({
        asOfficeId: officeId,
        asCustno: custno,
      });

      // 배송지 목록 조회
      await getShipList({
        asOfficeId: officeId,
        asCustno: custno,
      });
    },
    [getDetail, getShipList]
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
        cellStyle: { textAlign: "center" },
        headerClass: "ag-center-header",
        sortable: false,
        filter: false,
      },
      {
        field: "custno",
        headerName: "거래처",
        width: 80,
      },
      {
        field: "custname",
        headerName: "거래처명",
        width: 300,
        cellStyle: { textAlign: "left" },
      },
      {
        field: "custename",
        headerName: "거래처대외명",
        width: 250,
        cellStyle: { textAlign: "left" },
      },
      {
        field: "custType",
        headerName: "Type",
        width: 100,
      },
      {
        field: "custClass",
        headerName: "유형",
        width: 100,
      },
      {
        field: "custArea",
        headerName: "지역구분",
        width: 90,
      },
      {
        field: "pname",
        headerName: "대표자",
        width: 90,
      },
      {
        field: "tel",
        headerName: "전화번호(1)",
        width: 150,
      },
      {
        field: "shipToCust",
        headerName: "전화번호(2)",
        width: 150,
      },
      {
        field: "fax",
        headerName: "fax",
        width: 150,
      },
      {
        field: "zipcode",
        headerName: "우편번호",
        width: 90,
      },
      {
        field: "addr",
        headerName: "주소",
        width: 300,
        cellStyle: { textAlign: "left" },
      },
      {
        field: "regtno",
        headerName: "사업자번호",
        width: 150,
      },
      {
        field: "regtnoNo",
        headerName: "종사업장",
        width: 150,
      },
      {
        field: "uptae",
        headerName: "업태",
        width: 150,
      },
      {
        field: "jong",
        headerName: "업종",
        width: 150,
      },
      {
        field: "custnoGb",
        headerName: "거래처구분",
        width: 120,
      },
      {
        field: "outsourcingYn",
        headerName: "외주업체",
        width: 90,
      },
      {
        field: "pcustname",
        headerName: "모거래처",
        width: 120,
      },
      {
        field: "acctNum1",
        headerName: "미지급계정",
        width: 120,
      },
      {
        field: "acctName1",
        headerName: "미지급계정명",
        width: 150,
      },
      {
        field: "acctNum2",
        headerName: "선급금계정",
        width: 150,
      },
      {
        field: "acctName2",
        headerName: "선급금계정명",
        width: 150,
      },
      {
        field: "nationalCde",
        headerName: "국가코드",
        width: 100,
      },
      {
        field: "ntnlCde",
        headerName: "지역",
        width: 100,
      },
      {
        field: "currency",
        headerName: "통화",
        width: 90,
      },
      {
        field: "personYn",
        headerName: "직원여부",
        width: 90,
      },
      {
        field: "empyNme",
        headerName: "직원",
        width: 90,
      },
      {
        field: "vatType2",
        headerName: "매출부가세",
        width: 110,
      },
      {
        field: "vatNmeAr",
        headerName: "매출부가세명",
        width: 140,
      },
      {
        field: "billToCust",
        headerName: "Bill To",
        width: 100,
      },
      {
        field: "billToName",
        headerName: "Bill To 명",
        width: 120,
      },
      {
        field: "payToCust",
        headerName: "Pay To",
        width: 100,
      },
      {
        field: "payToName",
        headerName: "Pay To 명",
        width: 120,
      },
      {
        field: "prmShopcd",
        headerName: "PRM 거래처",
        width: 120,
      },
      {
        field: "bank",
        headerName: "지급은행",
        width: 90,
      },
      {
        field: "bankName",
        headerName: "지급은행명",
        width: 120,
      },
      {
        field: "acctNbr",
        headerName: "지급계좌번호",
        width: 140,
      },
      {
        field: "depositor",
        headerName: "예금주",
        width: 100,
      },
      {
        field: "stlmTerm",
        headerName: "지불조건",
        width: 150,
      },
      {
        field: "salesMan",
        headerName: "영업사원",
        width: 120,
      },
      {
        field: "receiptBank",
        headerName: "수금은행",
        width: 150,
      },
      {
        field: "receiptBankName",
        headerName: "수금은행명",
        width: 150,
      },
      {
        field: "receiptBankBranch",
        headerName: "수금은행지점",
        width: 150,
      },
      {
        field: "receiptBankAccount",
        headerName: "수금계좌번호",
        width: 150,
      },
      {
        field: "stlmTermAr",
        headerName: "수금조건",
        width: 150,
      },
      {
        field: "creditLimit",
        headerName: "신용한도액",
        width: 120,
      },
      {
        field: "collateralAmount",
        headerName: "담보설정액",
        width: 120,
      },
      {
        field: "mail",
        headerName: "매출VAT담당자 e-mail",
        width: 200,
      },
      {
        field: "cikNo",
        headerName: "쇼핑몰ID",
        width: 120,
      },
      {
        field: "useYno",
        headerName: "사용구분",
        width: 90,
      },
      {
        field: "oldCustno",
        headerName: "(구)거래처",
        width: 100,
      },
      {
        field: "channel",
        headerName: "채널1",
        width: 100,
      },
      {
        field: "channel2",
        headerName: "채널2",
        width: 100,
      },
      {
        field: "channel3",
        headerName: "채널3",
        width: 100,
      },
      {
        field: "category2",
        headerName: "Territory2",
        width: 100,
      },
      {
        field: "category3",
        headerName: "Territory3",
        width: 100,
      },
      {
        field: "category4",
        headerName: "Territory4",
        width: 100,
      },
      {
        field: "sdate",
        headerName: "거래개시일",
        width: 120,
      },
      {
        field: "iconsCode",
        headerName: "I-CONS CD",
        width: 120,
      },
      {
        field: "createdName",
        headerName: "등록자",
        width: 120,
      },
      {
        field: "creationDate",
        headerName: "등록일시",
        width: 150,
      },
      {
        field: "lastUpdatedName",
        headerName: "최종수정자",
        width: 120,
      },
      {
        field: "lastUpdateDate",
        headerName: "최종수정일시",
        width: 150,
      },
    ],
    []
  );

  return (
    <div className={`left-grid-panel ${className || ""}`}>
      <FormAgGrid<BcncListResponse & { id?: string }>
        rowData={rowData}
        headerHeight={32}
        columnDefs={columnDefs}
        height={600}
        excelFileName="거래처 목록"
        idField="custno"
        showToolbar={false}
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
      />
    </div>
  );
};

export default LeftGrid;
