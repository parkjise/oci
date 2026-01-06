/**
 * 거래처조회 팝업 (Business Partner Inquiry Popup)
 * 
 * @description 거래처(고객/협력사) 정보 조회를 위한 공통 팝업
 * @reference 구시스템: selectCustomerList.xml, commPop_mapper.xml (selectCustomerList 쿼리)
 * @author 이상찬
 * @date 2025-12-19
 * @last_modified 2025-12-22
 */

import { useState, useEffect, useCallback, useRef } from "react";
import type { FC } from "react";
import { Form } from "antd";
import type { InjectedProps } from "@/components/ui/feedback/Modal";
import { showError, error } from "@/components/ui/feedback";
import {
  FormInput,
  SearchActions,
  FormAgGrid,
} from "@components/ui/form";
import type { ExtendedColDef } from "@components/ui/form/AgGrid/FormAgGrid";
import type {
  GridApi,
  RowDoubleClickedEvent,
} from "ag-grid-community";
import { selectBcncInqirePopupList } from "@apis/com/popup";
import { createGridReadyHandlerRef } from "@utils/agGridUtils";
import type {
  BcncInqirePopupProps,
  BcncInqirePopupSrchRequest,
  BcncInqirePopupListResponse,
  SelectedBcnc,
} from "@/types/com/popup/BcncInqirePopup.types";

export type { SelectedBcnc };

const BcncInqirePopup: FC<
  BcncInqirePopupProps & InjectedProps<SelectedBcnc>
> = ({ asOfficeId, initialCustno, asUseYno, asCustType, returnValue, close, onConfirm }) => {
  const [bcncList, setBcncList] = useState<BcncInqirePopupListResponse[]>([]);
  const [, setLoading] = useState<boolean>(false);
  const gridApiRef = useRef<GridApi | null>(null);
  const [form] = Form.useForm();
  const hasInitialized = useRef(false);

  const onGridReady = createGridReadyHandlerRef(gridApiRef);

  // 검색 함수
  const handleSearch = useCallback(async (values?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const asCustno = values?.asCustno as string | undefined;

      // 검색어 필수 검증 (구시스템 기준)
      if (!asCustno) {
        showError("검색어 입력은 필수입니다.");
        setLoading(false);
        return;
      }

      const apiParams: BcncInqirePopupSrchRequest = {
        asOfficeId: asOfficeId,
        asUseYno: asUseYno === "all" ? undefined : asUseYno,
        asCustType: asCustType || undefined,
        asCustno: asCustno || undefined,
      };

      const response = await selectBcncInqirePopupList(apiParams);

      if (response.success && response.data) {
        // 구시스템 selectCustomerList 쿼리 결과 필드 매핑
        const transformedData: BcncInqirePopupListResponse[] = response.data.map((item: any) => {
          const custno = item.CUSTNO || item.custno || "";
          const custname = item.CUSTNAME || item.custname || "";

          return {
            ...item,
            id: custno || `row-${Math.random()}`,
            custno,
            custname,
            regtno: item.REGTNO || item.regtno || "",
            pname: item.PNAME || item.pname || "",
            custnoGbName: item.CUSTNO_GB_NAME || item.custnoGbName || "",
            custStatus: item.CUST_STATUS || item.custStatus || "",
            custType: item.CUST_TYPE || item.custType || "",
            custClass: item.CUST_CLASS || item.custClass || "",
            custArea: item.CUST_AREA || item.custArea || "",
            ipsStatus: item.IPS_STATUS || item.ipsStatus || "",
            addr: item.ADDR || item.addr || "",
            uptae: item.UPTAE || item.uptae || "",
            jong: item.JONG || item.jong || "",
            useYno: item.USE_YNO || item.useYno || "Y",
            currUnit: item.CURR_UNIT || item.currUnit || "",
            salesMan: item.SALES_MAN || item.salesMan || "",
          };
        });
        setBcncList(transformedData);
      } else {
        showError(response.message || "거래처 목록 조회 중 오류가 발생했습니다.");
        setBcncList([]);
      }
    } catch (error) {
      console.error("거래처 목록 조회 오류:", error);
      showError("거래처 목록 조회 중 오류가 발생했습니다.");
      setBcncList([]);
    } finally {
      setLoading(false);
    }
  }, [asOfficeId, asUseYno, asCustType]);

  // 초기 거래처번호가 있으면 자동 조회
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    if (initialCustno) {
      form.setFieldsValue({ asCustno: initialCustno });
      handleSearch(form.getFieldsValue());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 거래처 데이터 변환 헬퍼 함수
  const createBcncData = useCallback(
    (data: BcncInqirePopupListResponse): SelectedBcnc => ({
      custno: data.custno,
      custname: data.custname || "",
    }),
    []
  );

  // 그리드 더블클릭 이벤트
  const handleRowDoubleClick = useCallback(
    (params: RowDoubleClickedEvent<BcncInqirePopupListResponse>) => {
      const data = params.data;
      if (data && data.custno && returnValue) {
        returnValue(createBcncData(data));
        close();
      }
    },
    [returnValue, close, createBcncData]
  );

  // 확인 버튼 클릭 시 호출할 함수
  const handleConfirm = useCallback(() => {
    if (!gridApiRef.current || !returnValue) return;

    const selectedRows = gridApiRef.current.getSelectedRows();
    if (selectedRows.length === 0) {
      error({ content: "거래처를 선택해주세요.", title: "안내" });
      return;
    }

    returnValue(createBcncData(selectedRows[0]));
    close();
  }, [returnValue, close, createBcncData]);

  // onConfirm이 전달되면 handleConfirm을 등록
  useEffect(() => {
    onConfirm?.(handleConfirm);
  }, [onConfirm, handleConfirm]);

  // ESC 키 처리
  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        close();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => {
      window.removeEventListener("keydown", handleEscKey);
    };
  }, [close]);

  // 그리드 컬럼 정의 (구시스템 selectCustomerList.xml 기준)
  const columnDefs: ExtendedColDef<BcncInqirePopupListResponse>[] = [
    {
      field: "custno",
      headerName: "거래처",
      width: 125,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.CUSTNO || params.data?.custno || "";
      }
    },
    {
      field: "custname",
      headerName: "거래처명",
      width: 267,
      sortable: true,
      filter: true,
      headerAlign: "center",
      valueGetter: (params) => {
        return params.data?.CUSTNAME || params.data?.custname || "";
      }
    },
    {
      field: "regtno",
      headerName: "사업자번호",
      width: 190,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.REGTNO || params.data?.regtno || "";
      }
    },
    {
      field: "pname",
      headerName: "대표자",
      width: 106,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.PNAME || params.data?.pname || "";
      }
    },
    {
      field: "custnoGbName",
      headerName: "구분",
      width: 90,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.CUSTNO_GB_NAME || params.data?.custnoGbName || "";
      }
    },
    {
      field: "custStatus",
      headerName: "상태",
      width: 93,
      sortable: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.CUST_STATUS || params.data?.custStatus || "";
      }
    },
    {
      field: "custType",
      headerName: "Type",
      width: 85,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.CUST_TYPE || params.data?.custType || "";
      }
    },
    {
      field: "custClass",
      headerName: "유형",
      width: 100,
      sortable: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.CUST_CLASS || params.data?.custClass || "";
      }
    },
    {
      field: "custArea",
      headerName: "지역구분",
      width: 150,
      sortable: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.CUST_AREA || params.data?.custArea || "";
      }
    },
    {
      field: "ipsStatus",
      headerName: "IPS상태",
      width: 90,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.IPS_STATUS || params.data?.ipsStatus || "";
      }
    },
    {
      field: "addr",
      headerName: "주소",
      width: 259,
      sortable: true,
      filter: true,
      headerAlign: "center",
      valueGetter: (params) => {
        return params.data?.ADDR || params.data?.addr || "";
      }
    },
    {
      field: "uptae",
      headerName: "업태",
      width: 100,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.UPTAE || params.data?.uptae || "";
      }
    },
    {
      field: "jong",
      headerName: "업종",
      width: 150,
      sortable: true,
      filter: true,
      headerAlign: "center",
      valueGetter: (params) => {
        return params.data?.JONG || params.data?.jong || "";
      }
    },
    {
      field: "useYno",
      headerName: "사용",
      width: 70,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.USE_YNO || params.data?.useYno || "Y";
      }
    },
    {
      field: "currUnit",
      headerName: "통화",
      width: 70,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.CURR_UNIT || params.data?.currUnit || "";
      }
    },
    {
      field: "salesMan",
      headerName: "영업사원",
      width: 200,
      sortable: true,
      filter: true,
      headerAlign: "center",
      valueGetter: (params) => {
        return params.data?.SALES_MAN || params.data?.salesMan || "";
      }
    },
  ];

  return (
    <div className="modal-body">
      <div className="modal-body__header">
        <SearchActions
          form={form}
          onSearch={handleSearch}
          showReset={true}
          onReset={() => {
            form.resetFields();
            setBcncList([]);
          }}
          visibleRows={1}
          columnsPerRow={3}
          resetExpandOnReset={true}
          className="modal-body__actions"
        >
          <FormInput
            name="asCustno"
            label="검색어를 입력하세요"
            placeholder="거래처번호/명, 대표자명, 사업자등록번호 검색"
            style={{ width: "400px" }}
            onPressEnter={() => handleSearch(form.getFieldsValue())}
          />
        </SearchActions>
      </div>
      <div className="modal-body__content">
        <FormAgGrid<BcncInqirePopupListResponse>
          rowData={bcncList}
          columnDefs={columnDefs}
          height={400}
          onGridReady={onGridReady}
          onRowDoubleClicked={handleRowDoubleClick}
          enableFilter={true}
          gridOptions={{
            rowSelection: "single",
            pagination: false,
          }}
          showToolbar={false}
          headerTextAlign="center"
          idField="id"
        />
      </div>
    </div>
  );
};

export default BcncInqirePopup;
