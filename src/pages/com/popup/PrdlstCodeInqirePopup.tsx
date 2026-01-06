/**
 * 품목코드조회 팝업 (Product Code Inquiry Popup)
 * 
 * @description 마스터에 등록된 품목 코드 조회를 위한 공통 팝업
 * @reference 구시스템: selectItemList6.xml, invPop_mapper.xml (selectItemList6 쿼리)
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
import { selectPrdlstCodeInqirePopupList } from "@apis/com/popup";
import { createGridReadyHandlerRef } from "@utils/agGridUtils";
import type {
  PrdlstCodeInqirePopupProps,
  PrdlstCodeInqirePopupSrchRequest,
  PrdlstCodeInqirePopupListResponse,
  SelectedPrdlstCode,
} from "@/types/com/popup/PrdlstCodeInqirePopup.types";

export type { SelectedPrdlstCode };

const PrdlstCodeInqirePopup: FC<
  PrdlstCodeInqirePopupProps & InjectedProps<SelectedPrdlstCode>
> = ({ asOfficeId = "OSE", asOrgId = "", asMatclass, initialFind, returnValue, close, onConfirm }) => {
  const [prdlstCodeList, setPrdlstCodeList] = useState<PrdlstCodeInqirePopupListResponse[]>([]);
  const [, setLoading] = useState<boolean>(false);
  const gridApiRef = useRef<GridApi | null>(null);
  const [form] = Form.useForm();
  const hasInitialized = useRef(false);

  const onGridReady = createGridReadyHandlerRef(gridApiRef);

  // 검색 함수
  const handleSearch = useCallback(async (values?: Record<string, unknown>) => {
    setLoading(true);
    try {
      const asMatcode = values?.asMatcode as string | undefined;
      const asMatclassInput = values?.asMatclass as string | undefined;
      const asEnabledFlag = values?.asEnabledFlag as string | undefined;

      // 품목구분 필수 검증
      if (!asMatclassInput) {
        showError("품목구분을 선택해주세요.");
        setLoading(false);
        return;
      }

      const apiParams: PrdlstCodeInqirePopupSrchRequest = {
        asOfficeId: asOfficeId,
        asOrgId: asOrgId,
        asMatcode: asMatcode || undefined,
        asMatclass: asMatclassInput || undefined,
        asEnabledFlag: asEnabledFlag || undefined,
      };

      const response = await selectPrdlstCodeInqirePopupList(apiParams);

      if (response.success && response.data) {
        // 구시스템 selectItemList6 쿼리 결과 필드 매핑
        // MATCODE_ID, MATCODE, MATNAME, MATUNIT, MATCLASS, MAT_GB, LOT_GB, ENABLED_FLAG, SUBINV, ACC_CODE, OLD_ITEM_CODE, ONHAND
        const transformedData: PrdlstCodeInqirePopupListResponse[] = response.data.map((item, index) => {
          const itemCode = (item.MATCODE || item.matcode || item.itemCode || "") as string;
          const itemName = (item.MATNAME || item.matname || item.itemName || "") as string;
          const unitCde = (item.MATUNIT || item.matunit || item.unitCde || item.unit || "") as string;
          const onhand = Number(item.ONHAND ?? item.onhand ?? 0);

          return {
            ...item,
            id: itemCode || `row-${index}`,
            // 기본 필드
            itemCode,
            itemName,
            unitCde,
            onhand,
            // 별칭 (기존 호환성)
            finGdsCode: itemCode,
            finGdsName: itemName,
            finGdsSize: item.itemDesc ? String(item.itemDesc) : undefined,
            mtrlKnd: (item.MATCLASS || item.matclass || "") as string,
          } as PrdlstCodeInqirePopupListResponse;
        });
        setPrdlstCodeList(transformedData);
      } else {
        showError(response.message || "품목코드 목록 조회 중 오류가 발생했습니다.");
        setPrdlstCodeList([]);
      }
    } catch (error) {
      console.error("품목코드 목록 조회 오류:", error);
      showError("품목코드 목록 조회 중 오류가 발생했습니다.");
      setPrdlstCodeList([]);
    } finally {
      setLoading(false);
    }
  }, [asOfficeId, asOrgId]);

  // 초기 로딩 로직
  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;

    form.setFieldsValue({
      asMatclass: asMatclass || "",
      asEnabledFlag: "Y",
      asMatcode: initialFind || ""
    });

    // 품목구분이 있을 때만 자동 조회
    if (asMatclass) {
      handleSearch(form.getFieldsValue());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 품목 데이터 변환 헬퍼 함수
  const createPrdlstData = useCallback(
    (data: PrdlstCodeInqirePopupListResponse): SelectedPrdlstCode => ({
      itemCode: data.itemCode,
      itemName: data.itemName,
      finGdsCode: data.finGdsCode || data.itemCode,
      finGdsName: data.finGdsName || data.itemName,
      finGdsSize: data.finGdsSize || "",
      unitCde: data.unitCde || "",
      mtrlKnd: (data.mtrlKnd || data.MATCLASS || "") as string,
    }),
    []
  );

  // 그리드 더블클릭 이벤트
  const handleRowDoubleClick = useCallback(
    (params: RowDoubleClickedEvent<PrdlstCodeInqirePopupListResponse>) => {
      const { data } = params;
      if (data && returnValue) {
        returnValue(createPrdlstData(data));
        close();
      }
    },
    [returnValue, close, createPrdlstData]
  );

  // 확인 버튼 클릭 시 호출할 함수
  const handleConfirm = useCallback(() => {
    if (!gridApiRef.current || !returnValue) return;

    const selectedRows = gridApiRef.current.getSelectedRows();
    if (selectedRows.length === 0) {
      error({ content: "품목을 선택해주세요.", title: "안내" });
      return;
    }

    returnValue(createPrdlstData(selectedRows[0]));
    close();
  }, [returnValue, close, createPrdlstData]);

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

  // 그리드 컬럼 정의 (구시스템 selectItemList6.xml 기준)
  const columnDefs: ExtendedColDef<PrdlstCodeInqirePopupListResponse>[] = [
    {
      field: "itemCode",
      headerName: "품목코드",
      width: 120,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.MATCODE || params.data?.matcode || params.data?.itemCode || "";
      }
    },
    {
      field: "itemName",
      headerName: "품목명",
      width: 278,
      sortable: true,
      filter: true,
      headerAlign: "center",
      valueGetter: (params) => {
        return params.data?.MATNAME || params.data?.matname || params.data?.itemName || "";
      }
    },
    {
      field: "unitCde",
      headerName: "단위",
      width: 60,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.MATUNIT || params.data?.matunit || params.data?.unitCde || "";
      }
    },
    {
      field: "onhand",
      headerName: "현재고수량",
      width: 110,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "right" },
      valueGetter: (params) => {
        return params.data?.ONHAND ?? params.data?.onhand ?? 0;
      },
      valueFormatter: (params) => {
        if (params.value === undefined || params.value === null) return "0";
        return Number(params.value).toLocaleString();
      }
    },
    {
      field: "lotGb",
      headerName: "모집단 번호 관리 여부",
      width: 149,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.LOT_GB || params.data?.lotGb || "";
      }
    },
    {
      field: "oldItemCode",
      headerName: "품목코드(구)",
      width: 120,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        return params.data?.OLD_ITEM_CODE || params.data?.oldItemCode || "";
      }
    },
    {
      field: "enabledFlag",
      headerName: "사용여부",
      width: 90,
      sortable: true,
      filter: true,
      headerAlign: "center",
      cellStyle: { textAlign: "center" },
      valueGetter: (params) => {
        const flag = params.data?.ENABLED_FLAG || params.data?.enabledFlag || "Y";
        return flag === "Y" ? "사용" : "미사용";
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
              asMatclass: asMatclass || "",
              asEnabledFlag: "Y"
            });
            setPrdlstCodeList([]);
          }}
          visibleRows={1}
          columnsPerRow={3}
          resetExpandOnReset={true}
          className="modal-body__actions"
        >
          <FormSelect
            name="asMatclass"
            label="품목구분"
            placeholder="선택하세요"
            comCodeParams={{
              module: "INV",
              type: "MATCLASS",
            }}
          />
          <FormInput
            name="asMatcode"
            label="검색조건"
            placeholder="품목코드 또는 품목명 입력"
            onPressEnter={() => handleSearch(form.getFieldsValue())}
          />
          <FormSelect
            name="asEnabledFlag"
            label="구분"
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
        <FormAgGrid<PrdlstCodeInqirePopupListResponse>
          rowData={prdlstCodeList}
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

export default PrdlstCodeInqirePopup;
