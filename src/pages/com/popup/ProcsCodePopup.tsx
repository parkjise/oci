/**
 * 공정코드조회 팝업 (Process Code Popup)
 * 
 * @description 생산/작업 공정 코드 조회를 위한 공통 팝업
 * @reference 구시스템: selectCostCodeList2.xml, scmPop_mapper.xml (selectCostCodeList2 쿼리)
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
  FormSelect,
} from "@components/ui/form";
import type { ExtendedColDef } from "@components/ui/form/AgGrid/FormAgGrid";
import type {
  GridApi,
  RowDoubleClickedEvent,
} from "ag-grid-community";
import { selectProcsCodePopupList } from "@apis/com/popup";
import { createGridReadyHandlerRef } from "@utils/agGridUtils";
import type {
  ProcsCodePopupProps,
  ProcsCodePopupSrchRequest,
  ProcsCodePopupListResponse,
  SelectedProcsCode,
} from "@/types/com/popup/ProcsCodePopup.types";

export type { SelectedProcsCode };

const ProcsCodePopup: FC<
  ProcsCodePopupProps & InjectedProps<SelectedProcsCode>
> = ({ asOfficeId = "OSE", asOrgId = "", initialCostCode, returnValue, close, onConfirm }) => {
  const [procsCodeList, setProcsCodeList] = useState<ProcsCodePopupListResponse[]>([]);
  const [, setLoading] = useState<boolean>(false);
  const gridApiRef = useRef<GridApi | null>(null);
  const [form] = Form.useForm();
  const hasInitialized = useRef(false);

  const onGridReady = createGridReadyHandlerRef(gridApiRef);

  // 검색 함수
  const handleSearch = useCallback(async (values?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const asOrgIdSearch = values?.asOrgId as string | undefined;
      const asCostCodeInput = values?.asCostCode as string | undefined;
      const asEnabledFlag = values?.asEnabledFlag as string | undefined;
      const apiParams: ProcsCodePopupSrchRequest = {
        asOfficeId: asOfficeId,
        asOrgId: asOrgIdSearch || undefined,
        asCostCode: asCostCodeInput || undefined,
        asEnabledFlag: asEnabledFlag || undefined,
      };

      const response = await selectProcsCodePopupList(apiParams);

      if (response.success && response.data) {
        // 구시스템 selectCostCodeList2 쿼리 결과 필드 매핑
        // ORG_ID, COST_CODE, COST_CODE_NAME, COST_LEVEL, COST_PART, HIGH_COST_CODE1, HIGH_COST_NAME1, ENABLED_FLAG, PROD_SET, INV_SET, PAY_SET, ACC_SET, SORT_SEQ, LOW_COST_CODE, LOW_COST_NAME
        const transformedData: ProcsCodePopupListResponse[] = response.data.map((item, index) => {
          const costCode = (item.COST_CODE || item.costCode || "") as string;
          const costCodeName = (item.COST_CODE_NAME || item.costCodeName || "") as string;

          return {
            ...item,
            id: costCode || `row-${index}`,
            costCode,
            costCodeName,
          } as ProcsCodePopupListResponse;
        });
        setProcsCodeList(transformedData);
      } else {
        showError(response.message || "공정코드 목록 조회 중 오류가 발생했습니다.");
        setProcsCodeList([]);
      }
    } catch (error) {
      console.error("공정코드 목록 조회 오류:", error);
      showError("공정코드 목록 조회 중 오류가 발생했습니다.");
      setProcsCodeList([]);
    } finally {
      setLoading(false);
    }
  }, [asOfficeId]);

  // 초기 값 설정 및 자동 조회
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    form.setFieldsValue({
      asOrgId: asOrgId || "",
      asEnabledFlag: "Y", // 기본값 사용
      asCostCode: initialCostCode || ""
    });

    handleSearch(form.getFieldsValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 공정 데이터 변환 헬퍼 함수
  const createProcsData = useCallback(
    (data: ProcsCodePopupListResponse): SelectedProcsCode => ({
      costCode: data.costCode,
      costCodeName: data.costCodeName || "",
    }),
    []
  );

  // 그리드 더블클릭 이벤트
  const handleRowDoubleClick = useCallback(
    (params: RowDoubleClickedEvent<ProcsCodePopupListResponse>) => {
      const data = params.data;
      if (data && data.costCode && returnValue) {
        returnValue(createProcsData(data));
        close();
      }
    },
    [returnValue, close, createProcsData]
  );

  // 확인 버튼 클릭 시 호출할 함수
  const handleConfirm = useCallback(() => {
    if (!gridApiRef.current || !returnValue) return;

    const selectedRows = gridApiRef.current.getSelectedRows();
    if (selectedRows.length === 0) {
      error({ content: "공정을 선택해주세요.", title: "안내" });
      return;
    }

    returnValue(createProcsData(selectedRows[0]));
    close();
  }, [returnValue, close, createProcsData]);

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

  // 그리드 컬럼 정의 (구시스템 selectCostCodeList2.xml 기준)
  const columnDefs: ExtendedColDef<ProcsCodePopupListResponse>[] = [
    {
      field: "orgId",
      headerName: "사업장",
      width: 130,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.ORG_ID || params.data?.orgId || "";
      }
    },
    {
      field: "costCode",
      headerName: "공정",
      width: 130,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.COST_CODE || params.data?.costCode || "";
      }
    },
    {
      field: "costCodeName",
      headerName: "공정명",
      width: 170,
      sortable: true,
      filter: true,
      headerAlign: "center",
      valueGetter: (params) => {
        return params.data?.COST_CODE_NAME || params.data?.costCodeName || "";
      }
    },
    {
      field: "costLevel",
      headerName: "Cost Level",
      width: 170,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.COST_LEVEL || params.data?.costLevel || "";
      }
    },
    {
      field: "costPart",
      headerName: "Cost Part",
      width: 170,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.COST_PART || params.data?.costPart || "";
      }
    },
    {
      field: "highCostCode1",
      headerName: "상위공정",
      width: 130,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.HIGH_COST_CODE1 || params.data?.highCostCode1 || "";
      }
    },
    {
      field: "highCostName1",
      headerName: "상위공정명",
      width: 170,
      sortable: true,
      filter: true,
      headerAlign: "center",
      valueGetter: (params) => {
        return params.data?.HIGH_COST_NAME1 || params.data?.highCostName1 || "";
      }
    },
    {
      field: "enabledFlag",
      headerName: "사용여부",
      width: 100,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        const flag = params.data?.ENABLED_FLAG || params.data?.enabledFlag || "Y";
        return flag === "Y" ? "사용" : "미사용";
      }
    },
    {
      field: "prodSet",
      headerName: "생산",
      width: 60,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.PROD_SET || params.data?.prodSet || "";
      }
    },
    {
      field: "invSet",
      headerName: "재고",
      width: 60,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.INV_SET || params.data?.invSet || "";
      }
    },
    {
      field: "paySet",
      headerName: "인사",
      width: 60,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.PAY_SET || params.data?.paySet || "";
      }
    },
    {
      field: "accSet",
      headerName: "회계",
      width: 60,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.ACC_SET || params.data?.accSet || "";
      }
    },
    {
      field: "sortSeq",
      headerName: "정렬",
      width: 60,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.SORT_SEQ || params.data?.sortSeq || "";
      }
    },
    {
      field: "lowCostCode",
      headerName: "하위공정",
      width: 100,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.LOW_COST_CODE || params.data?.lowCostCode || "";
      }
    },
    {
      field: "lowCostName",
      headerName: "하위공정명",
      width: 150,
      sortable: true,
      filter: true,
      headerAlign: "center",
      valueGetter: (params) => {
        return params.data?.LOW_COST_NAME || params.data?.lowCostName || "";
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
            form.setFieldsValue({
              asOrgId: asOrgId || "",
              asEnabledFlag: "Y"
            });
            setProcsCodeList([]);
          }}
          visibleRows={1}
          columnsPerRow={3}
          resetExpandOnReset={true}
          className="modal-body__actions"
        >
          <FormSelect
            name="asOrgId"
            label="사업장"
            placeholder="사업장 선택"
            comCodeParams={{
              module: "PF",
              type: "ORG",
            }}
            allOptionLabel="전체"
          />
          <FormInput
            name="asCostCode"
            label="조건"
            placeholder="공정코드 또는 공정명 입력"
            onPressEnter={() => handleSearch(form.getFieldsValue())}
          />
          <FormSelect
            name="asEnabledFlag"
            label="사용여부"
            placeholder="전체"
            options={[
              { label: "사용", value: "Y" },
              { label: "미사용", value: "N" },
              { label: "전체", value: "" },
            ]}
          />
        </SearchActions>
      </div>
      <div className="modal-body__content">
        <FormAgGrid<ProcsCodePopupListResponse>
          rowData={procsCodeList}
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

export default ProcsCodePopup;
