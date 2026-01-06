/**
 * 전표 마스터 뷰 (Slip Master View)
 * 
 * @description 전표 헤더 정보(작성자, 유형, 적요 등)를 표시하고 CRUD 명령을 처리하는 폼 컴포넌트
 * @author 이상찬
 * @date 2025-12-19
 * @last_modified 2025-12-19
 */

import React, { useCallback, useMemo, useState, useRef } from "react";
import {
  DataForm,
  FormButton,
  FormInput,
} from "@components/ui/form";
import { AppPageModal } from "@/components/ui/feedback/Modal";
import { usePageModal } from "@/hooks/usePageModal";
import { useSlipRegist } from "@/store/fcm/gl/slip/SlipRegist/SlipRegist";
import { showInfo, showSuccess, showError, confirm } from "@components/ui/feedback/Message";
import SlipCopyPopup from "@/pages/fcm/gl/slip/popup/SlipCopyPopup";
import SlipReversePopup from "@/pages/fcm/gl/slip/popup/SlipReversePopup";
import dayjs from "dayjs";
import type { PendingFile } from "@components/ui/feedback";
import { uploadFilesBatchApi, deleteFileApi } from "@apis/system/file/fileApi";

// 입력 컴포넌트들
interface InputProps {
  name: string;
  placeholder?: string;
  mode?: "view" | "edit";
  disabled?: boolean;
}

const TextInput = ({ name, placeholder, mode, disabled }: InputProps) => (
  <FormInput
    name={name}
    label=""
    placeholder={placeholder}
    mode={mode}
    disabled={disabled}
  />
);

// 필드 설정 인터페이스
interface FieldConfig {
  key: string;
  label?: string; // ← 옵셔널로 변경
  inputComponent: React.ComponentType<{
    name: string;
    placeholder?: string;
    mode?: "view" | "edit";
    options?: Array<{ value: string; label: string }>;
    rows?: number;
  }>;
  labelKey?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ value: string; label: string }>;
  colspan?: number;
  rowspan?: number;
  headerRowspan?: number;
  dataRowspan?: number;
  headerColspan?: number;
  dataColspan?: number;
}

// 필드 설정 헬퍼
const createField = ({
  key,
  label,
  inputComponent,
  labelKey,
  required,
  ...options
}: FieldConfig) => ({
  key,
  label: labelKey || label || key,
  labelKey,
  inputComponent: (props: any) =>
    React.createElement(inputComponent, { ...props, disabled: options.disabled }),
  required,
  ...options,
});

/**
 * DetailView 컴포넌트
 * 전표 상세 정보 표시 및 CRUD 액션 제공
 */
interface DetailViewProps {
  className?: string;
  mode?: "view" | "edit"; // 표시 모드 (기본값: "view")
}

const DetailView: React.FC<DetailViewProps> = ({
  className,
  mode: initialMode = "view",
}) => {
  const {
    slipHeader: headerData,
    selectedSlipId,
    editingSlipId,
    isNewSlip,
    handleSave,
    handleDelete,
    handleCreate,
    handleEdit,
    handleApprove,
    handleCancelApprove,
    setSlipHeader,
    slipDetails,
    validateSlipData,
    executeSave,
  } = useSlipRegist();
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [expanded, setExpanded] = useState(false);

  // 수동 모드에서 선택된 파일 목록 (업무 저장과 통합용)
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  // eatKey가 변경될 때마다 pendingFiles 초기화
  React.useEffect(() => {
    // eatKey가 변경되면 pendingFiles 초기화 (다른 전표로 이동했으므로)
    setPendingFiles([]);
  }, [headerData?.eatKey]);

  // DataForm에서 파일 저장 완료 처리 함수를 받기 위한 ref
  const attachmentSaveCompleteRef = useRef<(() => Promise<void>) | undefined>(
    undefined
  );

  // 복사 팝업
  const copyModal = usePageModal(SlipCopyPopup, {
    title: "전표 복사",
    centered: true,
    width: 800,
    height: "fit-content",
  });

  // 역분개 팝업
  const reverseModal = usePageModal(SlipReversePopup, {
    title: "전표 Reverse",
    centered: true,
    width: 800,
    height: "fit-content",
  });

  const handleExpandChange = useCallback((newExpanded: boolean) => {
    setExpanded(newExpanded);
  }, []);

  // 스토어 상태에 따라 모드 동기화
  React.useEffect(() => {
    if (isNewSlip || (editingSlipId && editingSlipId === selectedSlipId)) {
      setMode("edit");
    } else {
      setMode("view");
    }
  }, [isNewSlip, editingSlipId, selectedSlipId]);

  // ============================================================================
  // 첨부파일 관련 로직 (DataForm 내부에서 처리됨)
  // ============================================================================

  // 첨부파일 저장 핸들러 (업무 저장과 통합용)
  const handleAttachmentSave = useCallback(
    async (files: PendingFile[], targetEatKey: number) => {
      if (!targetEatKey) {
        showError("파일 그룹 키가 없습니다.");
        return { success: false, error: "eatKey not found" };
      }

      try {
        // 업로드 대기 파일과 삭제 대기 파일 분리
        const uploadFiles = files.filter(
          (f) => f.action === "upload" && f.file
        );
        const deleteFiles = files.filter(
          (f) => f.action === "delete" && f.eatKey && f.eatIdx
        );

        // 1. 파일 업로드 처리 (배치 업로드)
        let uploadSuccessCount = 0;
        let uploadFailCount = 0;

        if (uploadFiles.length > 0) {
          const filesToUpload = uploadFiles.map(
            (pendingFile) => pendingFile.file!
          );

          try {
            // 여러 파일을 하나의 요청으로 묶어서 업로드
            const response = await uploadFilesBatchApi(filesToUpload, {
              eatKey: targetEatKey,
            });

            if (response.success && response.data) {
              uploadSuccessCount = response.data.length;
              // 업로드된 파일 수와 요청한 파일 수가 다를 수 있음
              if (uploadSuccessCount < filesToUpload.length) {
                uploadFailCount = filesToUpload.length - uploadSuccessCount;
                console.warn(
                  `일부 파일 업로드 실패: ${uploadSuccessCount}/${filesToUpload.length}개 성공`
                );
              }
            } else {
              uploadFailCount = filesToUpload.length;
              console.error("파일 배치 업로드 실패:", response);
            }
          } catch (error) {
            uploadFailCount = filesToUpload.length;
            console.error("파일 배치 업로드 중 오류:", error);
          }
        }

        // 2. 파일 삭제 처리
        let deleteSuccessCount = 0;
        let deleteFailCount = 0;

        if (deleteFiles.length > 0) {
          const deleteResults = await Promise.allSettled(
            deleteFiles.map((pendingFile) =>
              deleteFileApi(pendingFile.eatKey!, pendingFile.eatIdx!)
            )
          );

          deleteSuccessCount = deleteResults.filter(
            (r) => r.status === "fulfilled"
          ).length;
          deleteFailCount = deleteResults.filter(
            (r) => r.status === "rejected"
          ).length;

          // 실패한 파일 로깅
          deleteResults.forEach((result, index) => {
            if (result.status === "rejected") {
              console.error(
                `파일 삭제 실패: ${deleteFiles[index].name}`,
                result.reason
              );
            }
          });
        }

        // 3. 결과 처리
        const totalSuccess = uploadSuccessCount + deleteSuccessCount;
        const totalFail = uploadFailCount + deleteFailCount;

        if (totalSuccess > 0) {
          const messages = [];
          if (uploadSuccessCount > 0) {
            messages.push(`${uploadSuccessCount}개의 파일이 업로드되었습니다.`);
          }
          if (deleteSuccessCount > 0) {
            messages.push(`${deleteSuccessCount}개의 파일이 삭제되었습니다.`);
          }
          showSuccess(messages.join(" "));
          return { success: true };
        }

        if (totalFail > 0) {
          const messages = [];
          if (uploadFailCount > 0) {
            messages.push(`${uploadFailCount}개의 파일 업로드에 실패했습니다.`);
          }
          if (deleteFailCount > 0) {
            messages.push(`${deleteFailCount}개의 파일 삭제에 실패했습니다.`);
          }
          showError(messages.join(" "));
          return { success: false, error: messages.join(" ") };
        }

        if (uploadFiles.length === 0 && deleteFiles.length === 0) {
          // 변경 사항이 없으면 성공으로 처리
          return { success: true };
        }

        return { success: true };
      } catch (error) {
        console.error("파일 처리 실패:", error);
        showError("파일 처리에 실패했습니다.");
        return { success: false, error };
      }
    },
    []
  );

  // 파일 선택 시 콜백 (수동 모드)
  const handleFilesSelected = useCallback((files: PendingFile[]) => {
    // AttachmentDrawer 내부에서 이미 setPendingFiles를 통해 상태가 업데이트되므로 추가 작업 불필요
    console.log("파일 선택됨:", files);
  }, []);

  // 첨부파일 저장 에러 핸들러
  const handleAttachmentSaveError = useCallback(
    (files: PendingFile[], error: unknown) => {
      console.error("파일 저장 실패:", files, error);
      showError("파일 저장 중 오류가 발생했습니다.");
    },
    []
  );

  // Drawer가 닫힐 때 생성된 키 받기
  const handleAttachmentClose = useCallback((newEatKey?: number) => {
    if (newEatKey && headerData) {
      // 새로운 키가 생성되었다면 헤더 정보 업데이트 (아직 저장 전일 수 있음)
      setSlipHeader({
        ...headerData,
        eatKey: newEatKey.toString()
      } as any);
      console.log("생성된 eatKey:", newEatKey);
    }
  }, [headerData, setSlipHeader]);

  // 업무 화면의 저장 버튼 클릭 시 (메인 데이터 + 파일 업로드 통합)
  const handleFinish = useCallback(
    async () => {
      try {
        // 0. 유효성 검증 (파일 업로드 및 저장 프로세스 시작 전 실행)
        if (!validateSlipData(headerData, slipDetails)) {
          return;
        }

        // 0.5. 저장 확인 (파일 업로드 전에 확인)
        confirm({
          title: "저장 확인",
          content: "전표를 저장하시겠습니까?",
          okText: "저장",
          cancelText: "취소",
          onOk: async () => {
            try {
              // 1. eatKey 확인 (없으면 handleSave 내부 로직에 맡기거나, 여기서 생성 로직을 추가해야 할 수도 있음)
              // 현재 로직상 신규 전표의 경우 eatKey가 없을 수 있음.
              // 파일이 있는 경우 eatKey가 필수이므로, 
              // AttachmentDrawer에서 파일을 추가할 때 eatKey가 생성되어야 함.

              const currentEatKey = headerData?.eatKey ? parseInt(headerData.eatKey) : undefined;

              // 2. 선택된 파일들이 있으면 업로드
              if (pendingFiles.length > 0) {
                if (!currentEatKey) {
                  // 신규 작성 중 파일을 추가했는데 아직 eatKey가 없는 경우
                  // AttachmentDrawer는 파일을 추가하는 순간 eatKey를 생성하고 onClose로 전달함.
                  // 따라서 여기까지 왔다면 eatKey가 있어야 정상이나, 예외 처리
                  showError("파일 그룹 키가 없습니다. 첨부파일을 먼저 확인해주세요.");
                  return;
                }

                const uploadResult = await handleAttachmentSave(
                  pendingFiles,
                  currentEatKey
                );

                if (uploadResult.success) {
                  setPendingFiles([]); // 업로드 성공 후 초기화
                  // 파일 목록 새로고침
                  if (attachmentSaveCompleteRef.current) {
                    await attachmentSaveCompleteRef.current();
                  }


                } else {
                  // 업로드 실패 시 중단
                  return;
                }
              }

              // 3. 메인 데이터 저장 (executeSave 직접 호출)
              // handleSave는 자체적으로 confirm을 띄우므로, executeSave를 사용하여 중복 confirm 방지
              await executeSave();

            } catch (error) {
              console.error("저장 프로세스 중 오류:", error);
            }
          },
        });

      } catch (error) {
        console.error("저장 실패:", error);
      }
    },
    [headerData, pendingFiles, handleAttachmentSave, executeSave, slipDetails, validateSlipData]
  );


  /** 테이블 행 설정 */
  const tableRows = useMemo(
    () => [
      {
        fields: [
          createField({
            key: "makerDeptName",
            label: "작성부서",
            inputComponent: TextInput,
            disabled: true,
          }),
          createField({
            key: "makerName",
            label: "작성자",
            inputComponent: TextInput,
            disabled: true,
          }),
          createField({
            key: "slipName",
            label: "전표유형",
            inputComponent: TextInput,
            disabled: true,
          }),
          createField({
            key: "srcTblNme",
            label: "원천",
            inputComponent: TextInput,
            disabled: true,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "glSlipNo",
            label: "전표번호",
            inputComponent: TextInput,
            disabled: true,
          }),
          createField({
            key: "exptnTgt",
            label: "전기",
            inputComponent: TextInput,
            disabled: true,
          }),
          createField({
            key: "edimStatusName",
            label: "전자결재",
            inputComponent: TextInput,
            disabled: true,
          }),
          createField({
            key: "creationDate",
            label: "작성일시",
            inputComponent: TextInput,
            disabled: true,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "reference1",
            label: "Reverse No.",
            inputComponent: TextInput,
            disabled: true,
          }),
          createField({
            key: "description",
            label: "대표적요",
            inputComponent: TextInput,
            required: true,
          }),
          createField({
            key: "magamTag",
            label: "Closed",
            inputComponent: TextInput,
            disabled: true,
          }),
          createField({
            key: "lastUpdateDate",
            label: "최종수정일시",
            inputComponent: TextInput,
            disabled: true,
          }),
        ],
      },
    ],
    [mode]
  );

  /** CRUD 액션 이벤트 핸들러 */
  // 폼 값 변경 시 스토어 상태 업데이트
  const handleValuesChange = useCallback(
    (_changedValues: any, allValues: any) => {
      // headerData가 null일 수 있으므로 병합 시 주의
      const newHeader = { ...headerData, ...allValues } as any;
      setSlipHeader(newHeader);
    },
    [headerData, setSlipHeader]
  );

  /** 커스텀 액션 핸들러 */
  const handleCustomAction = useCallback(
    (action: string) => {
      if (action === "approve") {
        handleApprove();
      } else if (action === "cancel-approve") {
        handleCancelApprove();
      } else if (action === "reverse") {
        handleReverseClick();
      }
      // TODO: 실제 구현 필요 (더보기 등)
      console.log("Custom action:", action);
    },
    [handleApprove, handleCancelApprove]
  );

  /** 버튼 활성화 상태 계산 */
  const isApproveDisabled = useMemo(() => {
    if (!headerData || !selectedSlipId || mode === "edit") return true;
    if (headerData.slipType !== "M") return true;
    const status = headerData.edimStatus;
    return status === "2" || status === "3" || status === "30";
  }, [headerData, selectedSlipId, mode]);

  const isCancelApproveDisabled = useMemo(() => {
    if (!headerData || !selectedSlipId || mode === "edit") return true;
    return headerData.exptnTgt === "Y";
  }, [headerData, selectedSlipId, mode]);

  /** ActionButtonGroup 커스텀 버튼들 */
  const customButtons = useMemo(
    () => [
      <FormButton
        key="approve"
        size="small"
        disabled={isApproveDisabled}
        onClick={() => handleCustomAction("approve")}
      >
        결재상신
      </FormButton>,
      <FormButton
        key="cancel-approve"
        size="small"
        disabled={isCancelApproveDisabled}
        onClick={() => handleCustomAction("cancel-approve")}
      >
        승인취소
      </FormButton>,
      <FormButton
        key="reverse"
        size="small"
        disabled={!selectedSlipId || mode === "edit"}
        className="data-form__button data-form__button--more"
        onClick={() => handleCustomAction("reverse")}
      >
        Reverse
      </FormButton>,
    ],
    [handleCustomAction, isApproveDisabled, isCancelApproveDisabled, selectedSlipId, mode]
  );

  const handleCopyClick = () => {
    if (!headerData || !selectedSlipId) {
      showInfo("복사할 전표를 선택하세요.");
      return;
    }

    copyModal.openModal({
      initialData: {
        sourceSlpHeaderId: headerData.slpHeaderId!,
        sourceGlDate: headerData.bltDateAckSlp || dayjs().format("YYYYMMDD"),
        sourceDept: headerData.bltDeptAckSlp || "",
        sourceDeptName: headerData.deptNme || headerData.deptAbrrv || "",
        sourceDescription: headerData.description || "",
      },
      setConfirmHandler: copyModal.setConfirmHandler,
    });
  };

  const handleReverseClick = () => {
    if (!headerData || !selectedSlipId) {
      showInfo("역분개할 전표를 선택하세요.");
      return;
    }

    reverseModal.openModal({
      initialData: {
        sourceSlpHeaderId: headerData.slpHeaderId!,
        sourceGlDate: headerData.bltDateAckSlp || dayjs().format("YYYYMMDD"),
        sourceDept: headerData.bltDeptAckSlp || "",
        sourceDeptName: headerData.deptNme || headerData.deptAbrrv || "",
        sourceDescription: headerData.description || "",
      },
      setConfirmHandler: reverseModal.setConfirmHandler,
    });
  };

  /** ActionButtonGroup 설정 */
  const actionButtonGroup = useMemo(
    () => ({
      // 기본 액션 버튼들의 이벤트 핸들러
      onButtonClick: {
        create: handleCreate, // 입력 버튼
        edit: handleEdit, // 수정 버튼
        copy: handleCopyClick, // 복사 버튼
        delete: handleDelete, // 삭제 버튼
        save: () => handleFinish(), // 저장 버튼: 파일 업로드 후 저장 로직 실행
      },
      // 숨길 버튼들 (빈 배열 = 모두 표시)
      hideButtons: [],
      // 커스텀 버튼들 (결재 관련 버튼들)
      customButtons,
      // 확장 기능 활성화 (테이블 접기/펼치기)
      enableExpand: true,
      // 동적 확장 상태 (상태 연동)
      expanded,
      // 확장 상태 변경 핸들러
      onExpandChange: handleExpandChange,
      // 최대 표시 행 수
      maxVisibleRows: 3,
    }),
    [
      customButtons,
      handleCreate,
      handleEdit,
      handleCopyClick,
      handleDelete,
      handleSave,
      expanded, // 확장 상태 추가
      handleExpandChange, // 핸들러 추가
    ]
  );

  return (
    <>
      <DataForm
        className={className}
        actionButtonGroup={actionButtonGroup}
        tableRows={tableRows}
        tableData={(headerData as any) || {}}
        mode={mode}
        onValuesChange={handleValuesChange}
        // 첨부파일 관련 Props
        attachmentKey="attachments"
        attachmentEatKey={headerData?.eatKey ? parseInt(headerData.eatKey) : undefined}
        attachmentEatPath="attachments"
        attachmentOnClose={handleAttachmentClose}
        attachmentAutoUpload={false}
        attachmentManualMode={{
          onSaveError: handleAttachmentSaveError,
          onFilesSelected: handleFilesSelected,
          pendingFiles: pendingFiles,
          onPendingFilesChange: setPendingFiles,
          onSaveComplete: () => {
            console.log("파일 저장 완료 - 목록 새로고침됨");
          },
        }}
        onSaveCompleteRefSetter={(ref) => {
          attachmentSaveCompleteRef.current = ref;
        }}
      />

      <AppPageModal {...copyModal.modalProps} />
      <AppPageModal {...reverseModal.modalProps} />
    </>
  );
};

export default DetailView;
