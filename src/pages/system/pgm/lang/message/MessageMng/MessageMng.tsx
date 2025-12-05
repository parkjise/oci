// ============================================================================
// 메시지관리 페이지 (MessageMng)
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Button, Input, message, Modal, Tooltip } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {
  Article,
  HeaderContainer,
  SearchArea,
  SearchField,
  SearchLabel,
  ButtonArea,
  TypeSelectWrapper,
} from "./MessageMng.styles";
import { MessageGrid, type MessageGridRef } from "@components/features/system/pgm/lang/message/MessageMng";
import { FormSelect } from "@components/ui/form";
import {
  getMessageListApi,
  saveMessageApi,
  type MessageDto,
  type MessageSearchRequest,
  type MessageSaveRequest,
} from "@apis/system/message/messageApi";
import { getCodeDetailApi } from "@apis/comCode";
import { useTranslation } from "react-i18next";
import type { CodeDetail } from "@/types/api.types";

// ============================================================================
// Component
// ============================================================================
const MessageMng: React.FC = () => {
  const { t } = useTranslation();
  const [messageList, setMessageList] = useState<MessageDto[]>([]);
  const [langTypeList, setLangTypeList] = useState<CodeDetail[]>([]);
  const [iconTypeList, setIconTypeList] = useState<CodeDetail[]>([]);
  const [buttonTypeList, setButtonTypeList] = useState<CodeDetail[]>([]);
  const [searchParams, setSearchParams] = useState<MessageSearchRequest>({
    lang: undefined,
    msgKey: undefined,
    msgContents: undefined,
    totalYn: "Y",
    startNum: 1,
    endNum: 999999, // 전체 데이터 조회를 위한 매우 큰 값
  });
  const [isModified, setIsModified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedLang, setSelectedLang] = useState<string | undefined>();
  const [searchMsgKey, setSearchMsgKey] = useState("");
  const [searchMsgContents, setSearchMsgContents] = useState("");
  const gridRef = useRef<MessageGridRef | null>(null);
  const [focusedRowKey, setFocusedRowKey] = useState<string>("");
  const [totalCnt, setTotalCnt] = useState<number>(0);

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

  // 아이콘 타입 코드 조회 (공통코드)
  const fetchIconTypeList = useCallback(async () => {
    try {
      const response = await getCodeDetailApi({
        module: "SYS",
        type: "00000701", // ASIS에서 사용하는 PARENT_CODE
        enabledFlag: "Y",
      });
      if (response.success && response.data) {
        const codeList = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setIconTypeList(codeList);
      }
    } catch (error) {
      console.error("아이콘 타입 조회 실패:", error);
    }
  }, []);

  // 버튼 타입 코드 조회 (공통코드)
  const fetchButtonTypeList = useCallback(async () => {
    try {
      const response = await getCodeDetailApi({
        module: "SYS",
        type: "00000702", // ASIS에서 사용하는 PARENT_CODE
        enabledFlag: "Y",
      });
      if (response.success && response.data) {
        const codeList = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setButtonTypeList(codeList);
      }
    } catch (error) {
      console.error("버튼 타입 조회 실패:", error);
    }
  }, []);

  // 다국어 메시지 목록 조회
  const fetchMessageList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getMessageListApi(searchParams);
      if (response.success && response.data) {
        const messages = response.data.messages || [];
        const dataWithId = messages.map((item: MessageDto, index: number) => ({
          ...item,
          id: `${item.lang}_${item.msgKey}_${index}`,
          // 초기 조회 데이터는 rowStatus를 명시적으로 undefined로 설정 (변경되지 않은 행)
          rowStatus: undefined,
        }));
        setMessageList(dataWithId);
        
        // 총건수 설정
        if (response.data.totalCnt !== undefined) {
          setTotalCnt(response.data.totalCnt);
        } else {
          setTotalCnt(messages.length);
        }
        
        // 저장 후 포커스 복원
        if (focusedRowKey) {
          // 포커스 복원 로직은 그리드 컴포넌트에서 처리
        }
      } else {
        // 응답이 실패하거나 데이터가 없을 때 빈 배열 설정
        setMessageList([]);
        setTotalCnt(0);
      }
    } catch (error) {
      message.error(t("MSG_SY_0051"));
    } finally {
      setLoading(false);
    }
  }, [searchParams, focusedRowKey, t]);

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    setSearchParams({
      lang: selectedLang,
      msgKey: searchMsgKey || undefined,
      msgContents: searchMsgContents || undefined,
      totalYn: "Y",
      startNum: 1,
      endNum: 999999, // 전체 데이터 조회를 위한 매우 큰 값
    });
  }, [selectedLang, searchMsgKey, searchMsgContents]);

  // 언어 타입 변경 핸들러
  const handleLangTypeChange = useCallback((value: string) => {
    setSelectedLang(value);
  }, []);

  // 입력 핸들러
  const handleInsert = useCallback(() => {
    if (!gridRef.current) return;
    
    const currentData = gridRef.current.getGridData();
    const newRow: MessageDto & { id?: string } = {
      lang: selectedLang || "",
      msgKey: "",
      msgContents: "",
      isUse: "Y",
      rowStatus: "C",
      id: `new_${Date.now()}`,
    };
    
    // 그리드에 새 행 추가 (그리드 컴포넌트에서 처리)
    // 현재는 데이터에 추가하는 방식으로 처리
    setMessageList([...currentData, newRow]);
    setIsModified(true);
  }, [selectedLang]);

  // 삭제 핸들러
  const handleDelete = useCallback(() => {
    if (!gridRef.current) return;

    const currentData = gridRef.current.getGridData();
    const selectedRows = gridRef.current.getSelectedRows();

    if (selectedRows.length === 0) {
      message.warning(t("MSG_SY_0052"));
      return;
    }

    // 삭제할 행들을 찾아서 rowStatus를 "D"로 설정하거나 제거
    const updatedData = currentData
      .map((row) => {
        const isSelected = selectedRows.some((selected) => selected.lang === row.lang && selected.msgKey === row.msgKey);
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
      .filter((row) => row !== null) as MessageDto[];

    setMessageList(updatedData);
    setIsModified(true);
  }, [t]);

  // 저장 핸들러
  const handleSave = useCallback(async () => {
    if (!gridRef.current) {
      message.warning(t("MSG_SY_0053"));
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
          
          // 저장할 데이터 준비
          // rowStatus가 명시적으로 "C", "U", "D"인 행만 저장 대상으로 포함
          // rowStatus가 없는 행은 변경되지 않은 행이므로 저장 대상에서 제외
          const saveItems: MessageSaveRequest["messages"] = currentData
            .filter((row) => {
              // rowStatus가 명시적으로 "C", "U", "D"인 경우만 저장 대상
              return row.rowStatus === "C" || row.rowStatus === "U" || row.rowStatus === "D";
            })
            .map((row) => ({
              rowStatus: row.rowStatus! as "C" | "U" | "D", // 필터링으로 인해 항상 존재함
              lang: row.lang || "",
              msgKey: row.msgKey || "",
              msgContents: row.msgContents || "",
              msgIconType: row.msgIconType,
              msgButtonType: row.msgButtonType,
              oriLang: row.oriLang,
              oriMsgKey: row.oriMsgKey,
            }));

          if (saveItems.length === 0) {
            message.warning(t("MSG_SY_0057"));
            return;
          }

          // 필수 필드 검증
          const invalidItems = saveItems.filter((item) => {
            if (item.rowStatus === "D") return false; // 삭제는 검증 제외
            return !item.lang || !item.msgKey || !item.msgContents;
          });

          if (invalidItems.length > 0) {
            message.error(t("MSG_SY_0060"));
            return;
          }

          const request: MessageSaveRequest = {
            messages: saveItems,
          };

          const response = await saveMessageApi(request);
          
          if (response.success) {
            message.success(t("MSG_SY_0058"));
            setIsModified(false);
            // 저장 후 포커스 키 저장
            const focusedData = currentData.find((row) => (row as any).focused);
            if (focusedData) {
              setFocusedRowKey(`${focusedData.lang}_${focusedData.msgKey}`);
            }
            // 목록 재조회
            await fetchMessageList();
          }
        } catch (error) {
          message.error(t("MSG_SY_0059"));
        } finally {
          setLoading(false);
        }
      },
    });
  }, [isModified, fetchMessageList, t]);

  // 검색 영역 키업 핸들러 (Enter 키)
  const handleSearchKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }, [handleSearch]);

  // 초기 로드
  useEffect(() => {
    fetchLangTypeList();
    fetchIconTypeList();
    fetchButtonTypeList();
  }, [fetchLangTypeList, fetchIconTypeList, fetchButtonTypeList]);

  // 검색 파라미터 변경 시 목록 조회 (초기 로드 시 자동 조회)
  useEffect(() => {
    // 초기 로드 시 자동으로 전체 목록 조회
    fetchMessageList();
  }, [fetchMessageList]);

  // 언어 타입 옵션
  const langTypeOptions = langTypeList.map((item) => ({
    value: item.code || "",
    label: item.name1 || "",
  }));

  // label에 tooltip이 있는지 확인하는 함수
  const getLabelWithTooltip = useCallback((labelKey: string) => {
    const labelValue = t(labelKey);
    const descKey = `${labelKey}_desc`;
    const descValue = t(descKey);
    
    // desc가 있고 labelKey와 다르면 tooltip 적용
    if (descValue && descValue !== descKey) {
      return (
        <Tooltip title={descValue}>
          <span>{labelValue}</span>
        </Tooltip>
      );
    }
    return <span>{labelValue}</span>;
  }, [t]);

  return (
    <Article className="page-layout">
      {/* 상단 헤더: 검색 조건 및 버튼 */}
      <HeaderContainer>
        {/* 검색 조건 영역 */}
        <SearchArea>
          <SearchField>
            {/* 라벨 폭을 다른 항목과 맞춰 정렬 깨짐 방지 */}
            <SearchLabel>{getLabelWithTooltip("Type")}</SearchLabel>
            <TypeSelectWrapper>
              <FormSelect
                name="langType"
                label=""
                options={langTypeOptions}
                value={selectedLang}
                onChange={handleLangTypeChange}
                allowClear
                // 검색 영역에서는 유효성 모달/추가 영역이 필요 없으므로 비활성화
                useModalMessage={false}
                style={{ width: "100%" }}
              />
            </TypeSelectWrapper>
          </SearchField>
          <SearchField>
            <SearchLabel>{getLabelWithTooltip("Message Key")}</SearchLabel>
            <Input
              value={searchMsgKey}
              onChange={(e) => setSearchMsgKey(e.target.value)}
              onKeyUp={handleSearchKeyUp}
              placeholder={t("Message Key")}
            />
          </SearchField>
          <SearchField>
            <SearchLabel>{getLabelWithTooltip("Message Word")}</SearchLabel>
            <Input
              value={searchMsgContents}
              onChange={(e) => setSearchMsgContents(e.target.value)}
              onKeyUp={handleSearchKeyUp}
              placeholder={t("Message Word")}
            />
          </SearchField>
          <SearchField>
            <SearchLabel></SearchLabel>
            <Input
              value={totalCnt > 0 ? `${totalCnt.toLocaleString()} 건` : "0 건"}
              readOnly
              style={{ width: "100px", textAlign: "right" }}
            />
          </SearchField>
        </SearchArea>

        {/* 버튼 영역 (오른쪽 정렬) */}
        <ButtonArea>
          <Button
            icon={<SearchOutlined />}
            onClick={handleSearch}
            loading={loading}
          >
            {t("검색")}
          </Button>
          <Button onClick={handleInsert}>{t("입력")}</Button>
          <Button onClick={handleDelete} danger>
            {t("삭제")}
          </Button>
          <Button
            type="primary"
            onClick={handleSave}
            loading={loading}
            disabled={!isModified}
          >
            {t("저장")}
          </Button>
        </ButtonArea>
      </HeaderContainer>

      {/* 그리드 영역 */}
      <MessageGrid
        ref={gridRef}
        rowData={messageList}
        langTypeList={langTypeList}
        iconTypeList={iconTypeList}
        buttonTypeList={buttonTypeList}
        loading={loading}
        onModify={(modified) => setIsModified(modified)}
      />
    </Article>
  );
};

export default MessageMng;

