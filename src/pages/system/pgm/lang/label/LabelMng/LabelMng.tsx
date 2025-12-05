// ============================================================================
// 다국어관리 페이지 (LabelMng)
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)
// - 2025.12.02 : ckkim (SearchGridLayout 적용, 공통 컴포넌트로 교체)

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Form, message } from "antd";
import { LabelGrid, type LabelGridRef } from "@components/features/system/pgm/lang/label/LabelMng";
import {
  FormSelect,
  FormInput,
  SearchActions,
} from "@components/ui/form";
import { confirm } from "@components/ui/feedback/Message";
import SearchGridLayout from "@components/ui/layout/SearchGridLayout/SearchGridLayout";
import {
  getLabelListApi,
  saveLabelApi,
  type LabelDto,
  type LabelSearchRequest,
  type LabelSaveRequest,
} from "@apis/system/label/labelApi";
import { getCodeDetailApi } from "@apis/comCode";
import { useTranslation } from "react-i18next";
import type { CodeDetail } from "@/types/api.types";
import { FilterPanelWrapper } from "./LabelMng.styles";

// ============================================================================
// Component
// ============================================================================
const LabelMng: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [labelList, setLabelList] = useState<LabelDto[]>([]);
  const [langTypeList, setLangTypeList] = useState<CodeDetail[]>([]);
  const [searchParams, setSearchParams] = useState<LabelSearchRequest>({
    asLang: undefined,
    asKey: undefined,
    asWord: undefined,
  });
  const [isModified, setIsModified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string | undefined>();
  const gridRef = useRef<LabelGridRef | null>(null);
  const [focusedRowKey, setFocusedRowKey] = useState<string>("");
  const [searchExpanded, setSearchExpanded] = useState(false);

  // 언어 타입 코드 조회 (공통코드)
  const fetchLangTypeList = useCallback(async () => {
    try {
      const response = await getCodeDetailApi({
        module: "SYS",
        type: "00000700", // ASIS에서 사용하는 PARENT_CODE
        enabledFlag: "Y",
      });
      if (response.success && response.data) {
        const codeList = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setLangTypeList(codeList);
      }
    } catch (error) {
      console.error("언어 타입 조회 실패:", error);
    }
  }, []);

  // 다국어 라벨 목록 조회
  const fetchLabelList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getLabelListApi(searchParams);
      if (response.success) {
        // response.data가 배열이거나 단일 객체일 수 있음
        const data = Array.isArray(response.data) 
          ? response.data 
          : response.data 
          ? [response.data] 
          : [];
        
        const dataWithId = data.map((item, index) => ({
          ...item,
          id: `${item.locale}_${item.key}_${index}`,
          // 초기 조회 데이터는 rowStatus를 명시적으로 undefined로 설정 (변경되지 않은 행)
          rowStatus: undefined,
        }));
        setLabelList(dataWithId);
        
        // 저장 후 포커스 복원
        if (focusedRowKey) {
          // 포커스 복원 로직은 그리드 컴포넌트에서 처리
        }
      } else {
        // API 실패 시 빈 배열로 설정
        setLabelList([]);
      }
    } catch (error) {
      console.error("다국어 라벨 목록 조회 실패:", error);
      message.error(t("MSG_SY_0042"));
      setLabelList([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams, t]);

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    const formValues = form.getFieldsValue();
    setSearchParams({
      asLang: selectedLang,
      asKey: formValues.searchKey || undefined,
      asWord: formValues.searchWord || undefined,
    });
  }, [selectedLang, form]);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    form.resetFields();
    setSelectedLang(undefined);
    setSearchParams({
      asLang: undefined,
      asKey: undefined,
      asWord: undefined,
    });
  }, [form]);

  // 언어 타입 변경 핸들러
  const handleLangTypeChange = useCallback((value: string) => {
    setSelectedLang(value);
  }, []);

  // 입력 핸들러 (그리드 공통 버튼용)
  const handleInsert = useCallback((gridApi: any) => {
    if (!gridApi) return;
    
    const currentData = gridRef.current?.getGridData() || [];
    const newRow: LabelDto & { id?: string } = {
      locale: selectedLang || "",
      key: "",
      label: "",
      rowStatus: "C",
      id: `new_${Date.now()}`,
    };
    
    // 그리드에 새 행 추가
    setLabelList([newRow, ...currentData]);
    setIsModified(true);
  }, [selectedLang]);

  // 삭제 핸들러 (그리드 공통 버튼용)
  const handleDelete = useCallback((gridApi: any) => {
    if (!gridApi) return;

    const selectedRows = gridApi.getSelectedRows() as (LabelDto & { id?: string })[];
    if (selectedRows.length === 0) {
      message.warning(t("MSG_SY_0043"));
      return;
    }

    const currentData = gridRef.current?.getGridData() || [];
    // 삭제할 행들을 찾아서 rowStatus를 "D"로 설정하거나 제거
    const updatedData = currentData
      .map((row) => {
        const isSelected = selectedRows.some((selected) => selected.locale === row.locale && selected.key === row.key);
        if (isSelected) {
          // 신규 추가된 행이면 제거, 기존 행이면 삭제 상태로 표시
          if (row.rowStatus === "C") {
            return null; // 제거
          } else {
            return { ...row, rowStatus: "D" };
          }
        }
        return row;
      })
      .filter((row) => row !== null) as LabelDto[];

    setLabelList(updatedData);
    setIsModified(true);
  }, [t]);

  // 저장 핸들러
  const handleSave = useCallback(async () => {
    if (!gridRef.current) {
      message.warning(t("MSG_SY_0044"));
      return;
    }

    if (!isModified) {
      message.info(t("MSG_SY_0045"));
      return;
    }

    confirm({
      title: t("MSG_SY_0046"),
      content: t("MSG_SY_0047"),
      okText: t("저장"),
      cancelText: t("취소"),
      onOk: async () => {
        try {
          setLoading(true);
          const currentData = gridRef.current?.getGridData() || [];
          
          // 저장할 데이터 준비
          // rowStatus가 명시적으로 "C", "U", "D"인 행만 저장 대상으로 포함
          // rowStatus가 없는 행은 변경되지 않은 행이므로 저장 대상에서 제외
          const saveItems: LabelSaveRequest["labels"] = currentData
            .filter((row) => {
              // rowStatus가 명시적으로 "C", "U", "D"인 경우만 저장 대상
              return row.rowStatus === "C" || row.rowStatus === "U" || row.rowStatus === "D";
            })
            .map((row) => ({
              rowStatus: row.rowStatus!, // 필터링으로 인해 항상 존재함
              locable: row.locale,
              lKey: row.key,
              lable: row.label,
              lableDesc: row.desc,
              oriLocable: row.oriLocable,
              oriLKey: row.oriLKey,
            }));

          if (saveItems.length === 0) {
            message.warning(t("MSG_SY_0048"));
            return;
          }

          const request: LabelSaveRequest = {
            labels: saveItems,
          };

          const response = await saveLabelApi(request);
          
          if (response.success) {
            message.success(t("MSG_SY_0049"));
            setIsModified(false);
            // 저장 후 포커스 키 저장
            const focusedData = currentData.find((row) => (row as any).focused);
            if (focusedData) {
              setFocusedRowKey(`${focusedData.locale}_${focusedData.key}`);
            }
            // 목록 재조회
            await fetchLabelList();
          }
        } catch (error) {
          message.error(t("MSG_SY_0050"));
        } finally {
          setLoading(false);
        }
      },
    });
  }, [isModified, fetchLabelList, t]);

  // 검색 영역 키업 핸들러 (Enter 키)
  const handleSearchKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }, [handleSearch]);
  
  // 확장/접기 토글 핸들러
  const handleToggleExpand = useCallback(() => {
    setSearchExpanded((prev) => !prev);
  }, []);

  // 초기 로드
  useEffect(() => {
    fetchLangTypeList();
  }, [fetchLangTypeList]);

  // 검색 파라미터 변경 시 목록 조회
  useEffect(() => {
    fetchLabelList();
  }, [searchParams]);

  // 언어 타입 옵션
  const langTypeOptions = langTypeList.map((item) => ({
    value: item.code || "",
    label: item.name1 || "",
  }));

  return (
    <SearchGridLayout
      filterPanel={
        <FilterPanelWrapper className="page-layout__filter-panel">
          <Form form={form} layout="inline" className="filter-panel__form">
            <FormSelect
              name="langType"
              label={t("Type")}
              options={langTypeOptions}
              value={selectedLang}
              onChange={handleLangTypeChange}
              allowClear
              useModalMessage={false}
              style={{ width: "200px" }}
            />
            <FormInput
              name="searchKey"
              label={t("Label Key")}
              onKeyUp={handleSearchKeyUp}
              placeholder={t("Label Key")}
              useModalMessage={false}
              style={{ width: "200px" }}
            />
            <FormInput
              name="searchWord"
              label={t("Label Word")}
              onKeyUp={handleSearchKeyUp}
              placeholder={t("Label Word")}
              useModalMessage={false}
              style={{ width: "200px" }}
            />
          </Form>
          <div className="filter-panel__actions">
            <SearchActions
              loading={loading}
              searchExpanded={searchExpanded}
              onSearch={handleSearch}
              onReset={handleReset}
              onToggleExpand={handleToggleExpand}
            />
          </div>
        </FilterPanelWrapper>
      }
      grid={
        <LabelGrid
          ref={gridRef}
          rowData={labelList}
          langTypeList={langTypeList}
          loading={loading}
          onModify={(modified) => setIsModified(modified)}
          onAddRow={handleInsert}
          onDeleteRow={handleDelete}
          onSave={handleSave}
          isModified={isModified}
        />
      }
    />
  );
};

export default LabelMng;

