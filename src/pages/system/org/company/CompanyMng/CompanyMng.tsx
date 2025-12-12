// ============================================================================
// 법인 관리 페이지 (CompanyMng)
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Form, message } from "antd";
import {
  CompanyGrid,
  type CompanyGridRef,
} from "@components/features/system/org/company/CompanyMng";
import { SearchActions } from "@components/ui/form";
import { confirm } from "@components/ui/feedback/Message";
import ListDetailLayout from "@components/ui/layout/ListDetailLayout/ListDetailLayout";
import { CompanyDetailPanel } from "@components/features/system/org/company/CompanyMng";
import {
  getCompanyListApi,
  saveCompanyListApi,
  type CompanyDto,
} from "@apis/system/org/companyApi";
import {
  uploadFileApi,
  createEatKeyApi,
  deleteFileApi,
} from "@apis/system/file/fileApi";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import {
  FilterPanelWrapper,
  CompanyMngLayoutWrapper,
} from "./CompanyMng.styles";

// ============================================================================
// Component
// ============================================================================
const CompanyMng: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [detailForm] = Form.useForm();
  const [companyList, setCompanyList] = useState<CompanyDto[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDto | null>(
    null
  );
  const [isModified, setIsModified] = useState(false);
  const [loading, setLoading] = useState(false);
  const gridRef = useRef<CompanyGridRef | null>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const pendingFileInfoRef = useRef<{
    file: File;
    eatKey: number | null;
    officeId: string;
  } | null>(null);
  const pendingDeleteInfoRef = useRef<{
    eatKey: number;
    eatIdx: string;
    officeId: string;
  } | null>(null);

  // 법인 목록 조회
  const fetchCompanyList = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getCompanyListApi({});

      if (response.success) {
        const data = Array.isArray(response.data) ? response.data : [];

        const dataWithId = data.map((item, index) => ({
          ...item,
          id: `${item.officeId}_${index}`,
          rowStatus: undefined,
        }));
        setCompanyList(dataWithId);

        setSelectedCompany((prevSelectedCompany) => {
          if (prevSelectedCompany) {
            const updatedSelectedCompany = dataWithId.find(
              (item) => item.officeId === prevSelectedCompany.officeId
            );
            if (updatedSelectedCompany) {
              return { ...updatedSelectedCompany };
            } else {
              return null;
            }
          }
          return prevSelectedCompany;
        });
      } else {
        setCompanyList([]);
        setSelectedCompany(null);
      }
    } catch (error) {
      console.error("법인 목록 조회 실패:", error);
      message.error(t("MSG_SY_0075"));
      setCompanyList([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    fetchCompanyList();
  }, [fetchCompanyList]);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    fetchCompanyList();
  }, [fetchCompanyList]);

  // 입력 핸들러
  const handleInsert = useCallback((gridApi: any) => {
    if (!gridApi) return;

    const currentData = gridRef.current?.getGridData() || [];
    const newRow: CompanyDto & { id?: string } = {
      officeId: "",
      officeNme: "",
      rowStatus: "C",
      id: `new_${Date.now()}`,
    };

    setCompanyList([newRow, ...currentData]);
    setIsModified(true);
  }, []);

  // 복사 핸들러
  const handleCopy = useCallback(
    (gridApi: any) => {
      if (!gridApi) return;

      const selectedRows = gridApi.getSelectedRows() as (CompanyDto & {
        id?: string;
      })[];
      if (selectedRows.length === 0) {
        message.warning(t("MSG_SY_0076"));
        return;
      }

      const currentData = gridRef.current?.getGridData() || [];
      const sourceRow = selectedRows[0];
      const newRow: CompanyDto & { id?: string } = {
        ...sourceRow,
        officeId: "",
        prefix: "",
        rowStatus: "C",
        id: `new_${Date.now()}`,
      };

      setCompanyList([newRow, ...currentData]);
      setIsModified(true);
    },
    [t]
  );

  // 삭제 핸들러
  const handleDelete = useCallback(
    (gridApi: any) => {
      if (!gridApi) return;

      const selectedRows = gridApi.getSelectedRows() as (CompanyDto & {
        id?: string;
      })[];
      if (selectedRows.length === 0) {
        message.warning(t("MSG_SY_0077"));
        return;
      }

      confirm({
        title: t("MSG_SY_0078"),
        content: t("MSG_SY_0079"),
        okText: t("확인"),
        cancelText: t("취소"),
        onOk: () => {
          const currentData = gridRef.current?.getGridData() || [];
          const updatedData = currentData
            .map((row) => {
              const isSelected = selectedRows.some(
                (selected) => selected.officeId === row.officeId
              );
              if (isSelected) {
                if (row.rowStatus === "C") {
                  return null;
                } else {
                  return { ...row, rowStatus: "D" };
                }
              }
              return row;
            })
            .filter((row) => row !== null) as CompanyDto[];

          setCompanyList(updatedData);
          setIsModified(true);
        },
      });
    },
    [t]
  );

  // 저장 핸들러
  const handleSave = useCallback(async () => {
    if (!gridRef.current) {
      message.warning(t("MSG_SY_0080"));
      return;
    }

    if (!isModified) {
      message.info(t("MSG_SY_0081"));
      return;
    }

    confirm({
      title: t("MSG_SY_0082"),
      content: t("MSG_SY_0083"),
      okText: t("저장"),
      cancelText: t("취소"),
      onOk: async () => {
        try {
          setLoading(true);
          const currentData = gridRef.current?.getGridData() || [];

          const currentPendingFileInfo = pendingFileInfoRef.current;
          const currentPendingDeleteInfo = pendingDeleteInfoRef.current;

          const saveItems = currentData.filter((row) => {
            return (
              row.rowStatus === "C" ||
              row.rowStatus === "U" ||
              row.rowStatus === "D"
            );
          });

          if (saveItems.length === 0) {
            message.warning(t("MSG_SY_0084"));
            return;
          }

          let successCount = 0;
          let errorCount = 0;

          for (const item of saveItems) {
            try {
              let finalOfficeImgId: string | undefined = undefined;
              let fileDeleted = false;

              if (
                currentPendingDeleteInfo &&
                currentPendingDeleteInfo.officeId === item.officeId
              ) {
                try {
                  await deleteFileApi(
                    currentPendingDeleteInfo.eatKey,
                    currentPendingDeleteInfo.eatIdx
                  );
                  fileDeleted = true;
                  pendingDeleteInfoRef.current = null;

                  if (
                    !currentPendingFileInfo ||
                    currentPendingFileInfo.officeId !== item.officeId
                  ) {
                    finalOfficeImgId = null as any;
                  }
                } catch (deleteError) {
                  console.error(
                    `파일 삭제 실패 (${item.officeId}):`,
                    deleteError
                  );
                  message.error(
                    `파일 삭제 실패: ${
                      deleteError instanceof Error
                        ? deleteError.message
                        : String(deleteError)
                    }`
                  );
                }
              }

              if (
                currentPendingFileInfo &&
                currentPendingFileInfo.officeId === item.officeId
              ) {
                try {
                  let finalEatKey = currentPendingFileInfo.eatKey;
                  if (!finalEatKey) {
                    const eatKeyResponse = await createEatKeyApi("00052");
                    if (eatKeyResponse.success && eatKeyResponse.data) {
                      finalEatKey = eatKeyResponse.data;
                    } else {
                      throw new Error("EAT_KEY 생성 실패");
                    }
                  }

                  const uploadResponse = await uploadFileApi(
                    currentPendingFileInfo.file,
                    {
                      eatKey: finalEatKey,
                    }
                  );

                  if (uploadResponse.success) {
                    finalOfficeImgId = finalEatKey.toString();
                    pendingFileInfoRef.current = null;
                  } else {
                    throw new Error("파일 업로드 실패");
                  }
                } catch (uploadError) {
                  console.error(
                    `파일 업로드 실패 (${item.officeId}):`,
                    uploadError
                  );
                  message.error(
                    `파일 업로드 실패: ${
                      uploadError instanceof Error
                        ? uploadError.message
                        : String(uploadError)
                    }`
                  );
                }
              }

              if (
                !fileDeleted &&
                finalOfficeImgId === undefined &&
                item.officeImgId &&
                item.officeImgId !== "PENDING"
              ) {
                const officeImgIdNum =
                  typeof item.officeImgId === "string"
                    ? parseInt(item.officeImgId, 10)
                    : item.officeImgId;
                if (!isNaN(officeImgIdNum) && officeImgIdNum > 0) {
                  finalOfficeImgId = officeImgIdNum.toString();
                }
              }

              // 저장 항목은 배치 처리로 처리
              successCount++;
            } catch (error) {
              console.error(`법인 ${item.officeId} 저장 실패:`, error);
              errorCount++;
            }
          }

          // 배치 저장 API 호출
          if (successCount > 0) {
            const saveRequest = {
              companyList: saveItems.map((item) => {
                const formatDate = (dateValue: any): string | undefined => {
                  if (!dateValue) return undefined;
                  if (dayjs.isDayjs(dateValue)) {
                    return dateValue.format("YYYY-MM-DD");
                  }
                  if (typeof dateValue === "string") {
                    if (dateValue.trim() === "") return undefined;
                    const parsed = dayjs(dateValue);
                    if (parsed.isValid()) {
                      return parsed.format("YYYY-MM-DD");
                    }
                    return dateValue;
                  }
                  return undefined;
                };

                const currentPendingFileInfo = pendingFileInfoRef.current;
                const currentPendingDeleteInfo = pendingDeleteInfoRef.current;

                let finalOfficeImgId: string | undefined = undefined;

                if (
                  currentPendingDeleteInfo &&
                  currentPendingDeleteInfo.officeId === item.officeId
                ) {
                  if (
                    !currentPendingFileInfo ||
                    currentPendingFileInfo.officeId !== item.officeId
                  ) {
                    finalOfficeImgId = null as any;
                  }
                }

                if (
                  currentPendingFileInfo &&
                  currentPendingFileInfo.officeId === item.officeId
                ) {
                  const finalEatKey = currentPendingFileInfo.eatKey;
                  if (finalEatKey) {
                    finalOfficeImgId = finalEatKey.toString();
                  }
                }

                if (
                  !finalOfficeImgId &&
                  item.officeImgId &&
                  item.officeImgId !== "PENDING"
                ) {
                  const officeImgIdNum =
                    typeof item.officeImgId === "string"
                      ? parseInt(item.officeImgId, 10)
                      : item.officeImgId;
                  if (!isNaN(officeImgIdNum) && officeImgIdNum > 0) {
                    finalOfficeImgId = officeImgIdNum.toString();
                  }
                }

                return {
                  officeId: item.officeId,
                  officeNme: item.officeNme,
                  officeEngNme: item.officeEngNme,
                  rpsnNme: item.rpsnNme,
                  rpsnEngNme: item.rpsnEngNme,
                  rpsnIdNbr: item.rpsnIdNbr,
                  corpNo: item.corpNo,
                  businessCategory: item.businessCategory,
                  addr: item.addr,
                  addrEng: item.addrEng,
                  uptae: item.uptae,
                  jong: item.jong,
                  telNo: item.telNo,
                  faxNo: item.faxNo,
                  prefix: item.prefix,
                  establishDate: formatDate(item.establishDate),
                  officeImgId: finalOfficeImgId,
                  rowStatus: item.rowStatus,
                };
              }),
            };

            const saveResponse = await saveCompanyListApi(saveRequest);

            if (saveResponse.success) {
              message.success(t("MSG_SY_0085"));
              setIsModified(false);
              pendingFileInfoRef.current = null;
              pendingDeleteInfoRef.current = null;

              const savedSelectedOfficeId = selectedCompany?.officeId;

              await fetchCompanyList();

              if (savedSelectedOfficeId) {
                const gridApi = gridRef.current?.getGridApi();
                const updatedData = gridRef.current?.getGridData() || [];
                const updatedSelectedCompany = updatedData.find(
                  (row) => row.officeId === savedSelectedOfficeId
                );

                if (updatedSelectedCompany && gridApi) {
                  setTimeout(() => {
                    gridApi.forEachNode((node) => {
                      if (node.data?.officeId === savedSelectedOfficeId) {
                        node.setSelected(true);
                      } else {
                        node.setSelected(false);
                      }
                    });

                    setSelectedCompany({ ...updatedSelectedCompany });
                  }, 100);
                }
              }
            } else {
              message.error(t("MSG_SY_0086"));
            }
          } else {
            message.warning(`${successCount}건 성공, ${errorCount}건 실패`);
            await fetchCompanyList();
          }
        } catch (error) {
          message.error(t("MSG_SY_0012"));
        } finally {
          setLoading(false);
        }
      },
    });
  }, [isModified, fetchCompanyList, selectedCompany, t]);

  // 확장/접기 토글 핸들러
  const handleToggleExpand = useCallback(() => {
    setSearchExpanded((prev) => !prev);
  }, []);

  // 그리드 행 선택 핸들러
  const handleRowSelection = useCallback(
    (selectedRows: CompanyDto[]) => {
      if (selectedRows.length > 0) {
        const newSelectedCompany = selectedRows[0];

        const currentData = gridRef.current?.getGridData() || companyList;
        const currentSelectedRow = currentData.find(
          (row) =>
            row.officeId ===
            (selectedCompany?.officeId || newSelectedCompany.officeId)
        );
        const isCurrentRowModified =
          currentSelectedRow &&
          (currentSelectedRow.rowStatus === "U" ||
            currentSelectedRow.rowStatus === "C" ||
            currentSelectedRow.rowStatus === "D");

        const hasModifiedRow = currentData.some(
          (row) =>
            row.officeId !== newSelectedCompany.officeId &&
            (row.rowStatus === "U" ||
              row.rowStatus === "C" ||
              row.rowStatus === "D")
        );

        if (
          (isCurrentRowModified || hasModifiedRow) &&
          selectedCompany &&
          selectedCompany.officeId !== newSelectedCompany.officeId
        ) {
          message.warning(t("MSG_SY_0087"));
          const gridApi = gridRef.current?.getGridApi();
          if (gridApi && selectedCompany) {
            setTimeout(() => {
              gridApi.forEachNode((node) => {
                if (node.data?.officeId === selectedCompany.officeId) {
                  node.setSelected(true);
                } else {
                  node.setSelected(false);
                }
              });
            }, 0);
          }
          return;
        }

        const latestSelectedCompany =
          currentData.find(
            (row) => row.officeId === newSelectedCompany.officeId
          ) || newSelectedCompany;

        const prevOfficeId = selectedCompany?.officeId;
        if (!prevOfficeId || prevOfficeId !== latestSelectedCompany.officeId) {
          pendingFileInfoRef.current = null;
          pendingDeleteInfoRef.current = null;
        }

        setSelectedCompany((prevSelectedCompany) => {
          if (
            prevSelectedCompany &&
            prevSelectedCompany.officeId === latestSelectedCompany.officeId
          ) {
            return { ...prevSelectedCompany, ...latestSelectedCompany };
          }
          return { ...latestSelectedCompany };
        });
      } else {
        setSelectedCompany(null);
        pendingFileInfoRef.current = null;
        pendingDeleteInfoRef.current = null;
      }
    },
    [selectedCompany, companyList, t]
  );

  // 상세 폼 값 변경 핸들러
  const handleDetailFormValuesChange = useCallback(
    (_changedValues: any, allValues: any) => {
      const targetOfficeId = allValues?.officeId || selectedCompany?.officeId;
      if (!targetOfficeId) {
        return;
      }

      if (selectedCompany && selectedCompany.officeId !== targetOfficeId) {
        console.warn("Form values change for different company");
        return;
      }

      const currentData = gridRef.current?.getGridData() || [];
      const updatedData = currentData.map((row) => {
        if (row.officeId === targetOfficeId) {
          const updatedRow = {
            ...row,
            ...allValues,
            officeId: row.officeId,
          };
          if (
            _changedValues?.officeImgId !== undefined ||
            allValues?.officeImgId !== undefined
          ) {
            updatedRow.rowStatus = "U";
          } else if (
            !updatedRow.rowStatus ||
            updatedRow.rowStatus === undefined
          ) {
            updatedRow.rowStatus = "U";
          }
          return updatedRow;
        }
        return row;
      });
      setCompanyList(updatedData);

      const gridApi = gridRef.current?.getGridApi();
      if (gridApi && targetOfficeId) {
        setTimeout(() => {
          gridApi.forEachNode((node) => {
            if (node.data?.officeId === targetOfficeId) {
              node.setSelected(true);
            } else {
              node.setSelected(false);
            }
          });
        }, 0);
      }

      setIsModified(true);
    },
    [selectedCompany]
  );

  // 파일 업로드 준비 핸들러
  const handleFileUploadReady = useCallback(
    (file: File | null, eatKey: number | null) => {
      const gridApi = gridRef.current?.getGridApi();
      const selectedRows = gridApi?.getSelectedRows() as
        | CompanyDto[]
        | undefined;
      const currentSelectedCompany =
        selectedRows && selectedRows.length > 0
          ? selectedRows[0]
          : selectedCompany;

      if (currentSelectedCompany && file) {
        const fileInfo = {
          file,
          eatKey: eatKey || null,
          officeId: currentSelectedCompany.officeId || "",
        };
        pendingFileInfoRef.current = fileInfo;
      } else {
        pendingFileInfoRef.current = null;
      }
    },
    [selectedCompany]
  );

  // 파일 삭제 준비 핸들러
  const handleFileDeleteReady = useCallback(
    (eatKey: number | null, eatIdx: string | null) => {
      const gridApi = gridRef.current?.getGridApi();
      const selectedRows = gridApi?.getSelectedRows() as
        | CompanyDto[]
        | undefined;
      const currentSelectedCompany =
        selectedRows && selectedRows.length > 0
          ? selectedRows[0]
          : selectedCompany;

      if (currentSelectedCompany && eatKey && eatIdx) {
        const deleteInfo = {
          eatKey,
          eatIdx,
          officeId: currentSelectedCompany.officeId || "",
        };
        pendingDeleteInfoRef.current = deleteInfo;
      } else {
        pendingDeleteInfoRef.current = null;
      }
    },
    [selectedCompany]
  );

  // 초기 로드
  useEffect(() => {
    fetchCompanyList();
  }, [fetchCompanyList]);

  return (
    <CompanyMngLayoutWrapper>
      <ListDetailLayout
        filterPanel={
          <FilterPanelWrapper className="page-layout__filter-panel">
            <Form
              form={form}
              layout="inline"
              className="filter-panel__form"
            ></Form>
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
        detailPanel={
          <CompanyGrid
            ref={gridRef}
            rowData={companyList}
            loading={loading}
            onModify={(modified: boolean) => setIsModified(modified)}
            onAddRow={handleInsert}
            onCopyRow={handleCopy}
            onDeleteRow={handleDelete}
            onSave={handleSave}
            isModified={isModified}
            totalCount={companyList.length}
            onRowSelection={handleRowSelection}
          />
        }
        detailBottomPanel={
          <CompanyDetailPanel
            selectedCompany={selectedCompany}
            form={detailForm}
            onValuesChange={handleDetailFormValuesChange}
            onFileUploadReady={handleFileUploadReady}
            onFileDeleteReady={handleFileDeleteReady}
          />
        }
      />
    </CompanyMngLayoutWrapper>
  );
};

export default CompanyMng;
