// ============================================================================
// 사업장 관리 페이지 (WorkplaceMng)
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Form, message } from "antd";
import {
  WorkplaceGrid,
  type WorkplaceGridRef,
} from "@components/features/system/org/workplace/WorkplaceMng";
import { SearchActions } from "@components/ui/form";
import { confirm } from "@components/ui/feedback/Message";
import ListDetailLayout from "@components/ui/layout/ListDetailLayout/ListDetailLayout";
import { WorkplaceDetailPanel } from "@components/features/system/org/workplace/WorkplaceMng";
import {
  getWorkplaceListApi,
  saveWorkplaceListApi,
  type WorkplaceDto,
} from "@apis/system/org/workplaceApi";
import {
  uploadFileApi,
  createEatKeyApi,
  deleteFileApi,
} from "@apis/system/file/fileApi";
import { useTranslation } from "react-i18next";
import {
  FilterPanelWrapper,
  WorkplaceMngLayoutWrapper,
} from "./WorkplaceMng.styles";

// ============================================================================
// Component
// ============================================================================
const WorkplaceMng: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [detailForm] = Form.useForm();
  const [workplaceList, setWorkplaceList] = useState<WorkplaceDto[]>([]);
  const [selectedWorkplace, setSelectedWorkplace] = useState<WorkplaceDto | null>(
    null
  );
  const [isModified, setIsModified] = useState(false);
  const [loading, setLoading] = useState(false);
  const gridRef = useRef<WorkplaceGridRef | null>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const pendingFileInfoRef = useRef<{
    file: File;
    eatKey: number | null;
    officeId: string;
    orgId: string;
  } | null>(null);
  const pendingDeleteInfoRef = useRef<{
    eatKey: number;
    eatIdx: string;
    officeId: string;
    orgId: string;
  } | null>(null);

  // 사업장 목록 조회
  const fetchWorkplaceList = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getWorkplaceListApi({});

      if (response.success) {
        const data = Array.isArray(response.data) ? response.data : [];

        const dataWithId = data.map((item, index) => ({
          ...item,
          id: `${item.officeId}_${item.orgId}_${index}`,
          rowStatus: undefined,
        }));
        setWorkplaceList(dataWithId);

        setSelectedWorkplace((prevSelectedWorkplace) => {
          if (prevSelectedWorkplace) {
            const updatedSelectedWorkplace = dataWithId.find(
              (item) =>
                item.officeId === prevSelectedWorkplace.officeId &&
                item.orgId === prevSelectedWorkplace.orgId
            );
            if (updatedSelectedWorkplace) {
              return { ...updatedSelectedWorkplace };
            } else {
              return null;
            }
          }
          return prevSelectedWorkplace;
        });
      } else {
        setWorkplaceList([]);
        setSelectedWorkplace(null);
      }
    } catch (error) {
      console.error("사업장 목록 조회 실패:", error);
      message.error(t("MSG_SY_0088"));
      setWorkplaceList([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    fetchWorkplaceList();
  }, [fetchWorkplaceList]);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    fetchWorkplaceList();
  }, [fetchWorkplaceList]);

  // 입력 핸들러
  const handleInsert = useCallback((gridApi: any) => {
    if (!gridApi) return;

    const currentData = gridRef.current?.getGridData() || [];
    const newRow: WorkplaceDto & { id?: string } = {
      officeId: "",
      orgId: "",
      orgNme: "",
      enabledFlag: "Y",
      invOrg: "N",
      rowStatus: "C",
      id: `new_${Date.now()}`,
    };

    setWorkplaceList([newRow, ...currentData]);
    setIsModified(true);
  }, []);

  // 복사 핸들러
  const handleCopy = useCallback(
    (gridApi: any) => {
      if (!gridApi) return;

      const selectedRows = gridApi.getSelectedRows() as (WorkplaceDto & {
        id?: string;
      })[];
      if (selectedRows.length === 0) {
        message.warning(t("MSG_SY_0089"));
        return;
      }

      const currentData = gridRef.current?.getGridData() || [];
      const sourceRow = selectedRows[0];
      const newRow: WorkplaceDto & { id?: string } = {
        ...sourceRow,
        orgId: "",
        rowStatus: "C",
        id: `new_${Date.now()}`,
      };

      setWorkplaceList([newRow, ...currentData]);
      setIsModified(true);
    },
    [t]
  );

  // 삭제 핸들러
  const handleDelete = useCallback(
    (gridApi: any) => {
      if (!gridApi) return;

      const selectedRows = gridApi.getSelectedRows() as (WorkplaceDto & {
        id?: string;
      })[];
      if (selectedRows.length === 0) {
        message.warning(t("MSG_SY_0090"));
        return;
      }

      confirm({
        title: t("MSG_SY_0091"),
        content: t("MSG_SY_0092"),
        okText: t("확인"),
        cancelText: t("취소"),
        onOk: () => {
          const currentData = gridRef.current?.getGridData() || [];
          const updatedData = currentData
            .map((row) => {
              const isSelected = selectedRows.some(
                (selected) =>
                  selected.officeId === row.officeId &&
                  selected.orgId === row.orgId
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
            .filter((row) => row !== null) as WorkplaceDto[];

          setWorkplaceList(updatedData);
          setIsModified(true);
        },
      });
    },
    [t]
  );

  // 저장 핸들러
  const handleSave = useCallback(async () => {
    if (!gridRef.current) {
      message.warning(t("MSG_SY_0093"));
      return;
    }

    if (!isModified) {
      message.info(t("MSG_SY_0094"));
      return;
    }

    confirm({
      title: t("MSG_SY_0095"),
      content: t("MSG_SY_0096"),
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
            message.warning(t("MSG_SY_0097"));
            return;
          }

          let successCount = 0;
          let errorCount = 0;

          for (const item of saveItems) {
            try {
              let finalOrgImgId: string | undefined = undefined;
              let fileDeleted = false;

              if (
                currentPendingDeleteInfo &&
                currentPendingDeleteInfo.officeId === item.officeId &&
                currentPendingDeleteInfo.orgId === item.orgId
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
                    currentPendingFileInfo.officeId !== item.officeId ||
                    currentPendingFileInfo.orgId !== item.orgId
                  ) {
                    finalOrgImgId = null as any;
                  }
                } catch (deleteError) {
                  console.error(
                    `파일 삭제 실패 (${item.officeId}/${item.orgId}):`,
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
                currentPendingFileInfo.officeId === item.officeId &&
                currentPendingFileInfo.orgId === item.orgId
              ) {
                try {
                  let finalEatKey = currentPendingFileInfo.eatKey;
                  if (!finalEatKey) {
                    const eatKeyResponse = await createEatKeyApi("00053");
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
                    finalOrgImgId = finalEatKey.toString();
                    pendingFileInfoRef.current = null;
                  } else {
                    throw new Error("파일 업로드 실패");
                  }
                } catch (uploadError) {
                  console.error(
                    `파일 업로드 실패 (${item.officeId}/${item.orgId}):`,
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
                finalOrgImgId === undefined &&
                item.orgImgId &&
                item.orgImgId !== "PENDING"
              ) {
                const orgImgIdNum =
                  typeof item.orgImgId === "string"
                    ? parseInt(item.orgImgId, 10)
                    : item.orgImgId;
                if (!isNaN(orgImgIdNum) && orgImgIdNum > 0) {
                  finalOrgImgId = orgImgIdNum.toString();
                }
              }

              // 저장 항목은 배치 처리로 처리
              successCount++;
            } catch (error) {
              console.error(
                `사업장 ${item.officeId}/${item.orgId} 저장 실패:`,
                error
              );
              errorCount++;
            }
          }

          // 배치 저장 API 호출
          if (successCount > 0) {
            const saveRequest = {
              workplaceList: saveItems.map((item) => {
                const currentPendingFileInfo = pendingFileInfoRef.current;
                const currentPendingDeleteInfo = pendingDeleteInfoRef.current;

                let finalOrgImgId: string | undefined = undefined;

                if (
                  currentPendingDeleteInfo &&
                  currentPendingDeleteInfo.officeId === item.officeId &&
                  currentPendingDeleteInfo.orgId === item.orgId
                ) {
                  if (
                    !currentPendingFileInfo ||
                    currentPendingFileInfo.officeId !== item.officeId ||
                    currentPendingFileInfo.orgId !== item.orgId
                  ) {
                    finalOrgImgId = null as any;
                  }
                }

                if (
                  currentPendingFileInfo &&
                  currentPendingFileInfo.officeId === item.officeId &&
                  currentPendingFileInfo.orgId === item.orgId
                ) {
                  const finalEatKey = currentPendingFileInfo.eatKey;
                  if (finalEatKey) {
                    finalOrgImgId = finalEatKey.toString();
                  }
                }

                if (
                  !finalOrgImgId &&
                  item.orgImgId &&
                  item.orgImgId !== "PENDING"
                ) {
                  const orgImgIdNum =
                    typeof item.orgImgId === "string"
                      ? parseInt(item.orgImgId, 10)
                      : item.orgImgId;
                  if (!isNaN(orgImgIdNum) && orgImgIdNum > 0) {
                    finalOrgImgId = orgImgIdNum.toString();
                  }
                }

                return {
                  officeId: item.officeId,
                  orgId: item.orgId,
                  orgNme: item.orgNme,
                  orgEngNme: item.orgEngNme,
                  regtNo: item.regtNo,
                  rpsnNme: item.rpsnNme,
                  rpsnEngNme: item.rpsnEngNme,
                  rpsnIdNbr: item.rpsnIdNbr,
                  addr: item.addr,
                  addrEng: item.addrEng,
                  invOrg: item.invOrg,
                  regtNoSeq: item.regtNoSeq,
                  sortOrder: item.sortOrder,
                  enabledFlag: item.enabledFlag,
                  uptae: item.uptae,
                  jong: item.jong,
                  telNo: item.telNo,
                  faxNo: item.faxNo,
                  dclDept: item.dclDept,
                  dclPerNme: item.dclPerNme,
                  dclTelNo: item.dclTelNo,
                  zipCode: item.zipCode,
                  defaultVatDept: item.defaultVatDept,
                  homeTaxId: item.homeTaxId,
                  taxOfficeCode: item.taxOfficeCode,
                  orgImgId: finalOrgImgId,
                  rowStatus: item.rowStatus,
                };
              }),
            };

            const saveResponse = await saveWorkplaceListApi(saveRequest);

            if (saveResponse.success) {
              message.success(t("MSG_SY_0098"));
              setIsModified(false);
              pendingFileInfoRef.current = null;
              pendingDeleteInfoRef.current = null;

              const savedSelectedOfficeId = selectedWorkplace?.officeId;
              const savedSelectedOrgId = selectedWorkplace?.orgId;

              await fetchWorkplaceList();

              if (savedSelectedOfficeId && savedSelectedOrgId) {
                const gridApi = gridRef.current?.getGridApi();
                const updatedData = gridRef.current?.getGridData() || [];
                const updatedSelectedWorkplace = updatedData.find(
                  (row) =>
                    row.officeId === savedSelectedOfficeId &&
                    row.orgId === savedSelectedOrgId
                );

                if (updatedSelectedWorkplace && gridApi) {
                  setTimeout(() => {
                    gridApi.forEachNode((node) => {
                      if (
                        node.data?.officeId === savedSelectedOfficeId &&
                        node.data?.orgId === savedSelectedOrgId
                      ) {
                        node.setSelected(true);
                      } else {
                        node.setSelected(false);
                      }
                    });

                    setSelectedWorkplace({ ...updatedSelectedWorkplace });
                  }, 100);
                }
              }
            } else {
              message.error(t("MSG_SY_0099"));
            }
          } else {
            message.warning(`${successCount}건 성공, ${errorCount}건 실패`);
            await fetchWorkplaceList();
          }
        } catch (error) {
          message.error(t("MSG_SY_0100"));
        } finally {
          setLoading(false);
        }
      },
    });
  }, [isModified, fetchWorkplaceList, selectedWorkplace, t]);

  // 확장/접기 토글 핸들러
  const handleToggleExpand = useCallback(() => {
    setSearchExpanded((prev) => !prev);
  }, []);

  // 그리드 행 선택 핸들러
  const handleRowSelection = useCallback(
    (selectedRows: WorkplaceDto[]) => {
      if (selectedRows.length > 0) {
        const newSelectedWorkplace = selectedRows[0];

        const currentData = gridRef.current?.getGridData() || workplaceList;
        const currentSelectedRow = currentData.find(
          (row) =>
            row.officeId ===
              (selectedWorkplace?.officeId || newSelectedWorkplace.officeId) &&
            row.orgId ===
              (selectedWorkplace?.orgId || newSelectedWorkplace.orgId)
        );
        const isCurrentRowModified =
          currentSelectedRow &&
          (currentSelectedRow.rowStatus === "U" ||
            currentSelectedRow.rowStatus === "C" ||
            currentSelectedRow.rowStatus === "D");

        const hasModifiedRow = currentData.some(
          (row) =>
            (row.officeId !== newSelectedWorkplace.officeId ||
              row.orgId !== newSelectedWorkplace.orgId) &&
            (row.rowStatus === "U" ||
              row.rowStatus === "C" ||
              row.rowStatus === "D")
        );

        if (
          (isCurrentRowModified || hasModifiedRow) &&
          selectedWorkplace &&
          (selectedWorkplace.officeId !== newSelectedWorkplace.officeId ||
            selectedWorkplace.orgId !== newSelectedWorkplace.orgId)
        ) {
          message.warning(t("MSG_SY_0101"));
          const gridApi = gridRef.current?.getGridApi();
          if (gridApi && selectedWorkplace) {
            setTimeout(() => {
              gridApi.forEachNode((node) => {
                if (
                  node.data?.officeId === selectedWorkplace.officeId &&
                  node.data?.orgId === selectedWorkplace.orgId
                ) {
                  node.setSelected(true);
                } else {
                  node.setSelected(false);
                }
              });
            }, 0);
          }
          return;
        }

        const latestSelectedWorkplace =
          currentData.find(
            (row) =>
              row.officeId === newSelectedWorkplace.officeId &&
              row.orgId === newSelectedWorkplace.orgId
          ) || newSelectedWorkplace;

        const prevOfficeId = selectedWorkplace?.officeId;
        const prevOrgId = selectedWorkplace?.orgId;
        if (
          !prevOfficeId ||
          !prevOrgId ||
          prevOfficeId !== latestSelectedWorkplace.officeId ||
          prevOrgId !== latestSelectedWorkplace.orgId
        ) {
          pendingFileInfoRef.current = null;
          pendingDeleteInfoRef.current = null;
        }

        setSelectedWorkplace((prevSelectedWorkplace) => {
          if (
            prevSelectedWorkplace &&
            prevSelectedWorkplace.officeId === latestSelectedWorkplace.officeId &&
            prevSelectedWorkplace.orgId === latestSelectedWorkplace.orgId
          ) {
            return { ...prevSelectedWorkplace, ...latestSelectedWorkplace };
          }
          return { ...latestSelectedWorkplace };
        });
      } else {
        setSelectedWorkplace(null);
        pendingFileInfoRef.current = null;
        pendingDeleteInfoRef.current = null;
      }
    },
    [selectedWorkplace, workplaceList, t]
  );

  // 상세 폼 값 변경 핸들러
  const handleDetailFormValuesChange = useCallback(
    (_changedValues: any, allValues: any) => {
      const targetOfficeId = allValues?.officeId || selectedWorkplace?.officeId;
      const targetOrgId = allValues?.orgId || selectedWorkplace?.orgId;
      if (!targetOfficeId || !targetOrgId) {
        return;
      }

      if (
        selectedWorkplace &&
        (selectedWorkplace.officeId !== targetOfficeId ||
          selectedWorkplace.orgId !== targetOrgId)
      ) {
        console.warn("Form values change for different workplace");
        return;
      }

      const currentData = gridRef.current?.getGridData() || [];
      const updatedData = currentData.map((row) => {
        if (
          row.officeId === targetOfficeId &&
          row.orgId === targetOrgId
        ) {
          const updatedRow = {
            ...row,
            ...allValues,
            officeId: row.officeId,
            orgId: row.orgId,
          };
          if (
            _changedValues?.orgImgId !== undefined ||
            allValues?.orgImgId !== undefined
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
      setWorkplaceList(updatedData);

      const gridApi = gridRef.current?.getGridApi();
      if (gridApi && targetOfficeId && targetOrgId) {
        setTimeout(() => {
          gridApi.forEachNode((node) => {
            if (
              node.data?.officeId === targetOfficeId &&
              node.data?.orgId === targetOrgId
            ) {
              node.setSelected(true);
            } else {
              node.setSelected(false);
            }
          });
        }, 0);
      }

      setIsModified(true);
    },
    [selectedWorkplace]
  );

  // 파일 업로드 준비 핸들러
  const handleFileUploadReady = useCallback(
    (file: File | null, eatKey: number | null) => {
      const gridApi = gridRef.current?.getGridApi();
      const selectedRows = gridApi?.getSelectedRows() as
        | WorkplaceDto[]
        | undefined;
      const currentSelectedWorkplace =
        selectedRows && selectedRows.length > 0
          ? selectedRows[0]
          : selectedWorkplace;

      if (currentSelectedWorkplace && file) {
        const fileInfo = {
          file,
          eatKey: eatKey || null,
          officeId: currentSelectedWorkplace.officeId || "",
          orgId: currentSelectedWorkplace.orgId || "",
        };
        pendingFileInfoRef.current = fileInfo;
      } else {
        pendingFileInfoRef.current = null;
      }
    },
    [selectedWorkplace]
  );

  // 파일 삭제 준비 핸들러
  const handleFileDeleteReady = useCallback(
    (eatKey: number | null, eatIdx: string | null) => {
      const gridApi = gridRef.current?.getGridApi();
      const selectedRows = gridApi?.getSelectedRows() as
        | WorkplaceDto[]
        | undefined;
      const currentSelectedWorkplace =
        selectedRows && selectedRows.length > 0
          ? selectedRows[0]
          : selectedWorkplace;

      if (currentSelectedWorkplace && eatKey && eatIdx) {
        const deleteInfo = {
          eatKey,
          eatIdx,
          officeId: currentSelectedWorkplace.officeId || "",
          orgId: currentSelectedWorkplace.orgId || "",
        };
        pendingDeleteInfoRef.current = deleteInfo;
      } else {
        pendingDeleteInfoRef.current = null;
      }
    },
    [selectedWorkplace]
  );

  // 초기 로드
  useEffect(() => {
    fetchWorkplaceList();
  }, [fetchWorkplaceList]);

  return (
    <WorkplaceMngLayoutWrapper>
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
          <WorkplaceGrid
            ref={gridRef}
            rowData={workplaceList}
            loading={loading}
            onModify={(modified: boolean) => setIsModified(modified)}
            onAddRow={handleInsert}
            onCopyRow={handleCopy}
            onDeleteRow={handleDelete}
            onSave={handleSave}
            isModified={isModified}
            totalCount={workplaceList.length}
            onRowSelection={handleRowSelection}
          />
        }
        detailBottomPanel={
          <WorkplaceDetailPanel
            selectedWorkplace={selectedWorkplace}
            form={detailForm}
            onValuesChange={handleDetailFormValuesChange}
            onFileUploadReady={handleFileUploadReady}
            onFileDeleteReady={handleFileDeleteReady}
          />
        }
      />
    </WorkplaceMngLayoutWrapper>
  );
};

export default WorkplaceMng;

