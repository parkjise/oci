// ============================================================================
// 공통코드관리 페이지 (CodeMng)
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button, Input, message, Modal, Select } from "antd";
import { SearchOutlined, CopyOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import {
  Article,
  HeaderContainer,
  SearchArea,
  SearchField,
  SearchLabel,
  ButtonArea,
} from "./CodeMng.styles";
import {
  CodeGrid,
  CodeTypeModal,
  TypeHeaderModal,
  type CodeGridRef,
} from "@components/features/system/pgm/code/CodeMng";
import {
  getCodeDetailListApi,
  saveCodeListApi,
  type CodeDto,
  type CodeDetailSearchRequest,
  type CodeSaveRequest,
} from "@apis/system/code/codeApi";
import { getCodeDetailApi } from "@apis/comCode";

// ============================================================================
// Component
// ============================================================================
const CodeMng: React.FC = () => {
  const { t } = useTranslation();

  const [codeList, setCodeList] = useState<CodeDto[]>([]);
  const [searchParams, setSearchParams] = useState<CodeDetailSearchRequest | null>(null);
  const [isModified, setIsModified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [moduleOptions, setModuleOptions] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedModule, setSelectedModule] = useState<string | undefined>(undefined);
  const [codeType, setCodeType] = useState("");
  const [codeTypeName, setCodeTypeName] = useState("");
  const gridRef = useRef<CodeGridRef | null>(null);
  const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
  const [isTypeHeaderModalOpen, setIsTypeHeaderModalOpen] = useState(false);

  // 모듈 목록 조회 (공통코드)
  const fetchModuleList = useCallback(async () => {
    try {
      const response = await getCodeDetailApi({
        module: "SYS",
        type: "MODULE",
        enabledFlag: "Y",
      });

      if (response.success && response.data) {
        const codeList = Array.isArray(response.data) ? response.data : [response.data];
        const options = codeList
          .filter((item) => item.code !== "##")
          .sort((a, b) => (a.orderSeq || 0) - (b.orderSeq || 0))
          .map((item) => ({
            value: item.code || "",
            label: item.name1 || item.code || "",
          }));
        setModuleOptions(options);
      } else {
        setModuleOptions([]);
      }
    } catch (error) {
      console.error("모듈 목록 조회 실패:", error);
      setModuleOptions([]);
    }
  }, []);

  // 공통코드 목록 조회
  const fetchCodeList = useCallback(async () => {
    if (!searchParams || !searchParams.module || !searchParams.type) {
      setCodeList([]);
      return;
    }

    try {
      setLoading(true);
      const response = await getCodeDetailListApi(searchParams);
      if (response.success && response.data) {
        const dataWithId = response.data.map((item, index) => ({
          ...item,
          id: `${item.module}_${item.type}_${item.code}_${index}`,
          rowStatus: undefined as CodeDto["rowStatus"],
        }));
        setCodeList(dataWithId);
      } else {
        setCodeList([]);
      }
    } catch (error) {
      message.error(t("MSG_SY_0053"));
    } finally {
      setLoading(false);
    }
  }, [searchParams, t]);

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    if (!selectedModule) {
      message.warning(t("MSG_SY_0061"));
      return;
    }
    if (!codeType) {
      message.warning(t("MSG_SY_0062"));
      return;
    }

    setSearchParams({
      module: selectedModule,
      type: codeType,
      enabledFlag: "Y",
      checkDateRange: true,
    });
  }, [selectedModule, codeType, t]);

  // 모듈 변경
  const handleModuleChange = useCallback((value: string) => {
    setSelectedModule(value);
    setCodeType("");
    setCodeTypeName("");
  }, []);

  // 공통코드구분 조회 모달 오픈
  const handleOpenTypeModal = useCallback(() => {
    if (!selectedModule) {
      message.warning(t("MSG_SY_0061"));
      return;
    }
    setIsTypeModalOpen(true);
  }, [selectedModule, t]);

  // 공통코드구분 선택 콜백
  const handleSelectType = useCallback((type: string, typeName?: string) => {
    setCodeType(type);
    setCodeTypeName(typeName || "");
  }, []);

  // TYPE 헤더 등록 핸들러
  const handleTypeHeaderConfirm = useCallback(
    (type: string, name1: string, nameDesc?: string) => {
      if (!gridRef.current || !selectedModule) return;

      const currentData = gridRef.current.getGridData();
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");

      // TYPE 헤더 등록 (CODE = '##')
      const headerRow: CodeDto & { id?: string } = {
        module: selectedModule,
        type: type.toUpperCase(),
        code: "##",
        name1: name1,
        nameDesc: nameDesc || "",
        enabledFlag: "Y",
        startDate: `${yyyy}-${mm}-${dd}`,
        endDate: "2999-12-31",
        userType: "A",
        orderSeq: 0,
        rowStatus: "C",
        id: `header_${Date.now()}`,
      };

      setCodeList([...currentData, headerRow]);
      setCodeType(type.toUpperCase());
      setCodeTypeName(name1);
      setIsTypeHeaderModalOpen(false);
      setIsModified(true);
      message.success(t("공통코드구분이 등록되었습니다."));
    },
    [selectedModule, t],
  );

  // 입력 핸들러
  const handleInsert = useCallback(() => {
    if (!gridRef.current) return;
    if (!selectedModule) {
      message.warning(t("MSG_SY_0061"));
      return;
    }

    // 공통코드구분이 없으면 TYPE 헤더 등록 모달 표시
    if (!codeType) {
      setIsTypeHeaderModalOpen(true);
      return;
    }

    const currentData = gridRef.current.getGridData();
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");

    const newRow: CodeDto & { id?: string } = {
      module: selectedModule,
      type: codeType,
      code: "",
      name1: "",
      nameDesc: "",
      enabledFlag: "Y",
      startDate: `${yyyy}-${mm}-${dd}`,
      endDate: "2999-12-31",
      userType: "U",
      rowStatus: "C",
      id: `new_${Date.now()}`,
    };

    setCodeList([...currentData, newRow]);
    setIsModified(true);
  }, [selectedModule, codeType, t]);

  // 복사 핸들러
  const handleCopy = useCallback(() => {
    if (!gridRef.current) return;

    const selectedRows = gridRef.current.getSelectedRows();
    if (selectedRows.length === 0) {
      message.warning(t("MSG_SY_0043"));
      return;
    }

    const base = selectedRows[0];
    const currentData = gridRef.current.getGridData();
    const copied: CodeDto & { id?: string } = {
      ...base,
      code: "",
      rowStatus: "C",
      id: `copy_${Date.now()}`,
    };

    setCodeList([...currentData, copied]);
    setIsModified(true);
  }, [t]);

  // 삭제 핸들러
  const handleDelete = useCallback(() => {
    if (!gridRef.current) return;

    const currentData = gridRef.current.getGridData();
    const selectedRows = gridRef.current.getSelectedRows();

    if (selectedRows.length === 0) {
      message.warning(t("MSG_SY_0043"));
      return;
    }

    const updated = currentData
      .map((row) => {
        const isSelected = selectedRows.some(
          (s) => s.module === row.module && s.type === row.type && s.code === row.code,
        );
        if (isSelected) {
          if (row.rowStatus === "C") {
            return null;
          }
          return { ...row, rowStatus: "D" as const };
        }
        return row;
      })
      .filter((row): row is CodeDto => row !== null);

    setCodeList(updated);
    setIsModified(true);
  }, [t]);

  // 저장 핸들러
  const handleSave = useCallback(async () => {
    if (!gridRef.current) {
      message.warning(t("MSG_SY_0044"));
      return;
    }

    if (!isModified) {
      message.info(t("MSG_SY_0054"));
      return;
    }

    Modal.confirm({
      title: t("MSG_SY_0055"),
      content: t("MSG_SY_0056"),
      okText: t("저장"),
      cancelText: t("취소"),
      onOk: async () => {
        try {
          setLoading(true);
          const currentData = gridRef.current?.getGridData() || [];

          const saveItems: CodeSaveRequest["codeList"] = currentData
            .filter((row) => row.rowStatus === "C" || row.rowStatus === "U" || row.rowStatus === "D")
            .map((row) => ({
              ...row,
              module: row.module || selectedModule || "",
              type: row.type || codeType || "",
              code: row.code || "",
            }));

          if (saveItems.length === 0) {
            message.warning(t("MSG_SY_0057"));
            return;
          }

          // 필수값 검증 (삭제는 제외)
          const invalid = saveItems.filter((item) => {
            if (item.rowStatus === "D") return false;
            return !item.module || !item.type || !item.code || !item.name1;
          });

          if (invalid.length > 0) {
            message.error(t("MSG_SY_0063"));
            return;
          }

          const request: CodeSaveRequest = {
            codeList: saveItems,
          };

          const response = await saveCodeListApi(request);
          if (response.success) {
            message.success(t("MSG_SY_0058"));
            setIsModified(false);
            await fetchCodeList();
          }
        } catch (error) {
          message.error(t("MSG_SY_0059"));
        } finally {
          setLoading(false);
        }
      },
    });
  }, [codeType, fetchCodeList, isModified, selectedModule, t]);

  // 초기 로드: 모듈 목록 조회
  useEffect(() => {
    void fetchModuleList();
  }, [fetchModuleList]);

  // 초기 로드 후 검색 파라미터 변화 감지
  useEffect(() => {
    fetchCodeList();
  }, [fetchCodeList]);

  return (
    <Article className="page-layout">
      <HeaderContainer>
        <SearchArea>
          <SearchField>
            <SearchLabel>{t("모듈구분")}</SearchLabel>
            <Select
              style={{ width: 120 }}
              value={selectedModule}
              options={moduleOptions}
              onChange={handleModuleChange}
              allowClear={false}
              loading={moduleOptions.length === 0}
              placeholder={t("모듈구분")}
            />
          </SearchField>
          <SearchField>
            <SearchLabel>{t("공통코드구분")}</SearchLabel>
            <div style={{ display: "flex", gap: 4 }}>
              <Input
                value={codeType}
                onChange={(e) => {
                  setCodeType(e.target.value);
                  setCodeTypeName("");
                }}
                placeholder={t("공통코드구분")}
                onPressEnter={handleSearch}
                style={{ width: 120 }}
              />
              <Input
                value={codeTypeName}
                readOnly
                placeholder={t("공통코드명")}
                style={{ width: 200 }}
              />
              <Button icon={<SearchOutlined />} onClick={handleOpenTypeModal} />
            </div>
          </SearchField>
        </SearchArea>

        <ButtonArea>
          <Button icon={<SearchOutlined />} onClick={handleSearch} loading={loading}>
            {t("검색")}
          </Button>
          <Button onClick={handleInsert}>{t("입력")}</Button>
          <Button icon={<CopyOutlined />} onClick={handleCopy}>
            {t("복사")}
          </Button>
          <Button onClick={handleDelete} danger>
            {t("삭제")}
          </Button>
          <Button type="primary" onClick={handleSave} loading={loading} disabled={!isModified}>
            {t("저장")}
          </Button>
        </ButtonArea>
      </HeaderContainer>

      <CodeGrid
        ref={gridRef}
        rowData={codeList}
        loading={loading}
        onModify={(modified) => setIsModified(modified)}
      />

      {/* 공통코드구분 조회 모달 (CodeMng 전용) */}
      <CodeTypeModal
        open={isTypeModalOpen}
        module={selectedModule}
        initialType={codeType}
        onClose={() => setIsTypeModalOpen(false)}
        onSelect={handleSelectType}
      />

      {/* 공통코드구분(TYPE) 헤더 등록 모달 */}
      <TypeHeaderModal
        open={isTypeHeaderModalOpen}
        module={selectedModule}
        onClose={() => setIsTypeHeaderModalOpen(false)}
        onConfirm={handleTypeHeaderConfirm}
      />
    </Article>
  );
};

export default CodeMng;

