import React, { useCallback, useMemo, useState, useRef } from "react";
import { Form } from "antd";
import {
  DataForm,
  FormButton,
  FormInput,
  FormInputNumber,
  FormDatePicker,
  FormSelect,
  FormTextArea,
} from "@components/ui/form";
import type { PendingFile } from "@components/ui/feedback";
import { uploadFilesBatchApi, deleteFileApi } from "@apis/system/file/fileApi";
import { showSuccess, showError } from "@components/ui/feedback";

// 상수 정의
const SLIP_TYPE_OPTIONS = [
  { value: "대체전표", label: "대체전표" },
  { value: "결산전표", label: "결산전표" },
  { value: "기초전표", label: "기초전표" },
];

const APPROVAL_OPTIONS = [
  { value: "승인", label: "승인" },
  { value: "미승인", label: "미승인" },
  { value: "진행중", label: "진행중" },
];

// 샘플 데이터
const SAMPLE_TABLE_DATA = {
  menuNumber: "A11 경영관리본부",
  makerName: "ADMIN 관리자",
  slipType: "대체전표",
  slipNumber: "1234556789",
  creationDate: "2025-10-20",
  reverseNo: "10",
  description: "상차도",
  remarks: "추가 비고 사항",
};

// 입력 컴포넌트들
interface InputProps {
  name: string;
  placeholder?: string;
  mode?: "view" | "edit";
}

interface SelectInputProps extends InputProps {
  options?: Array<{ value: string; label: string }>;
}

interface TextAreaInputProps extends InputProps {
  rows?: number;
}

const TextInput = ({ name, placeholder, mode }: InputProps) => (
  <FormInput name={name} label="" placeholder={placeholder} mode={mode} />
);

const NumberInput = ({ name, placeholder, mode }: InputProps) => (
  <FormInputNumber name={name} label="" placeholder={placeholder} mode={mode} />
);

const DateInput = ({ name, placeholder, mode }: InputProps) => (
  <FormDatePicker name={name} label="" placeholder={placeholder} mode={mode} />
);

const SelectInput = ({
  name,
  placeholder,
  options,
  mode = "edit",
}: SelectInputProps) => (
  <FormSelect
    name={name}
    label=""
    placeholder={placeholder}
    options={options}
    mode={mode}
  />
);

const TextAreaInput = ({
  name,
  placeholder,
  rows = 3,
  mode = "edit",
}: TextAreaInputProps) => (
  <FormTextArea
    name={name}
    label=""
    placeholder={placeholder}
    rows={rows}
    mode={mode}
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
  inputComponent,
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
  const [mode, setMode] = useState<"view" | "edit">(initialMode);
  const [expanded, setExpanded] = useState(false);

  // Form 인스턴스 생성
  const [form] = Form.useForm();

  // 샘플 파일 그룹 키 (실제로는 API에서 받아오거나 상태로 관리)
  // 예제를 위해 undefined로 시작 (내부에서 자동 생성됨)
  const [eatKey, setEatKey] = useState<number | undefined>(554062);

  // 수동 모드에서 선택된 파일 목록 (업무 저장과 통합용)
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

  // DataForm에서 파일 저장 완료 처리 함수를 받기 위한 ref
  const attachmentSaveCompleteRef = useRef<(() => Promise<void>) | undefined>(
    undefined
  );

  const handleExpandChange = useCallback((newExpanded: boolean) => {
    setExpanded(newExpanded);
  }, []);

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
          showError("처리할 파일이 없습니다.");
          return { success: false, error: "No files to process" };
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

  // 파일 선택 시 콜백 (수동 모드) - AttachmentDrawer 내부에서 이미 onPendingFilesChange를 통해 상태가 업데이트되므로 여기서는 알림용으로만 사용
  const handleFilesSelected = useCallback((files: PendingFile[]) => {
    // AttachmentDrawer 내부에서 이미 setPendingFiles를 통해 상태가 업데이트되므로 추가 작업 불필요
    // 필요시 여기에 추가 로직 구현 가능 (예: 로깅, 추가 검증 등)
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
    if (newEatKey) {
      setEatKey(newEatKey);
      console.log("생성된 eatKey:", newEatKey);
      // TODO: 생성된 eatKey를 서버에 저장하거나 상태 업데이트
    }
  }, []);

  /** 테이블 데이터 */

  /** 테이블 행 설정 */
  const tableRows = useMemo(
    () => [
      {
        fields: [
          createField({
            key: "menuNumber",
            inputComponent: TextInput,
            labelKey: "메뉴번호",
            required: true,
            // headerRowspan: 2,
            // dataRowspan: 2,
            rowspan: 2,
          }),
          createField({
            key: "makerName",
            label: "작성자",
            inputComponent: TextInput,
          }),
          createField({
            key: "slipType",
            label: "전표유형",
            inputComponent: SelectInput,
            options: SLIP_TYPE_OPTIONS,
          }),
          createField({
            key: "source",
            label: "원천",
            inputComponent: TextInput,
            dataColspan: 2,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "posting",
            label: "전기",
            inputComponent: TextInput,
          }),
          createField({
            key: "electronicApproval",
            label: "전자결재",
            inputComponent: SelectInput,
            options: APPROVAL_OPTIONS,
          }),
          createField({
            key: "creationDate",
            label: "작성일시",
            inputComponent: DateInput,
            dataColspan: 2,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "reverseNo",
            label: "Reverse No.",
            inputComponent: NumberInput,
          }),
          createField({
            key: "description",
            label: "대표적요",
            inputComponent: TextAreaInput,
            dataColspan: 6,
          }),
        ],
      },
    ],
    []
  );

  /** 왼쪽 액션 버튼 */
  const leftActions = useMemo(
    () => [{ type: "search" as const }, { type: "attachment" as const }],
    []
  );

  /** CRUD 액션 이벤트 핸들러 */
  const handleEdit = useCallback(() => {
    setMode("edit");
  }, []);

  // TODO: 실제 구현 필요
  const handleCreate = useCallback(() => {}, []);
  const handleCopy = useCallback(() => {}, []);
  const handleDelete = useCallback(() => {}, []);

  // 저장 버튼 핸들러: Form submit 트리거
  const handleSave = useCallback(() => {
    form.submit(); // Form submit → validation → onFinish 호출
  }, [form]);

  /** 검색 핸들러 */
  const handleSearch = useCallback((value: string) => {
    console.log("Search:", value);
    // TODO: 실제 검색 로직 구현
  }, []);

  /** 왼쪽 액션 버튼 이벤트 핸들러 */
  const handleLeftAction = useCallback((actionType: string) => {
    // attachment는 DataForm 내부에서 처리됨
    console.log("Left action:", actionType);
  }, []);

  // TODO: 실제 구현 필요
  const handleValuesChange = useCallback(() => {}, []);

  // 업무 화면의 저장 버튼 클릭 시 (메인 데이터 + 파일 업로드 통합)
  const handleFinish = useCallback(
    async (values: Record<string, unknown>) => {
      try {
        // 1. 먼저 메인 데이터 저장 (TODO: 실제 API 호출)
        // const saveResponse = await saveMainDataApi(values);
        // const finalEatKey = saveResponse.eatKey || eatKey;

        // 예제: eatKey가 없으면 생성된 키 사용
        const finalEatKey = eatKey;
        console.log("finalEatKey:", finalEatKey);
        if (!finalEatKey) {
          showError("파일 그룹 키가 없습니다. 첨부파일을 먼저 열어주세요.");
          return;
        }

        // 2. 선택된 파일들이 있으면 업로드
        if (pendingFiles.length > 0) {
          const uploadResult = await handleAttachmentSave(
            pendingFiles,
            finalEatKey
          );
          if (uploadResult.success) {
            setPendingFiles([]); // 업로드 성공 후 초기화
            // 파일 목록 새로고침 및 onSaveComplete 호출
            if (attachmentSaveCompleteRef.current) {
              await attachmentSaveCompleteRef.current();
            }
          } else {
            // 업로드 실패 시 롤백 처리 가능
            showError("파일 업로드에 실패했습니다. 후처리");
            return;
          }
        }

        // 3. 메인 데이터 저장 (TODO: 실제 API 호출)
        // await saveMainDataApi(values);
        console.log("저장할 데이터:", values);

        showSuccess("저장되었습니다.");
        // TODO: 저장 후 필요한 후처리 (페이지 이동, 데이터 새로고침 등)
      } catch (error) {
        console.error("저장 실패:", error);
        showError("저장에 실패했습니다.");
      }
    },
    [eatKey, pendingFiles, handleAttachmentSave, attachmentSaveCompleteRef]
  );

  const handleFinishFailed = useCallback(() => {
    console.log("첨부파일 오류 후처리");
  }, []);

  /** 커스텀 액션 핸들러 */
  const handleCustomAction = useCallback((action: string) => {
    // TODO: 실제 구현 필요 (결제상신, 승인취소, 더보기 등)
    console.log("Custom action:", action);
  }, []);

  /** ActionButtonGroup 커스텀 버튼들 */
  const customButtons = useMemo(
    () => [
      <FormButton
        key="approve"
        size="small"
        onClick={() => handleCustomAction("approve")}
      >
        결제상신
      </FormButton>,
      <FormButton
        key="cancel-approve"
        size="small"
        onClick={() => handleCustomAction("cancel-approve")}
      >
        승인취소
      </FormButton>,
      <FormButton
        key="more"
        size="small"
        className="data-form__button data-form__button--more"
        onClick={() => handleCustomAction("more")}
      >
        더보기
      </FormButton>,
    ],
    [handleCustomAction]
  );

  /** ActionButtonGroup 설정 */
  const actionButtonGroup = useMemo(
    () => ({
      // 기본 액션 버튼들의 이벤트 핸들러
      onButtonClick: {
        edit: handleEdit, // 수정 버튼
        create: handleCreate, // 신규 버튼
        copy: handleCopy, // 복사 버튼
        delete: handleDelete, // 삭제 버튼
        save: handleSave, // 저장 버튼
      },
      // 숨길 버튼들 (빈 배열 = 모두 표시)
      hideButtons: [],
      // 커스텀 버튼들 (결제 관련 버튼들)
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
      handleEdit,
      handleCreate,
      handleCopy,
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
        form={form}
        leftActions={leftActions}
        actionButtonGroup={actionButtonGroup}
        tableRows={tableRows}
        tableData={SAMPLE_TABLE_DATA}
        department="경영관리본부"
        user="관리자"
        status="완료"
        statusClass="done"
        mode={mode}
        attachmentKey="attachments"
        attachmentEatKey={eatKey}
        attachmentEatPath="attachments"
        attachmentOnClose={handleAttachmentClose}
        attachmentAutoUpload={false}
        attachmentManualMode={{
          onSaveError: handleAttachmentSaveError,
          onFilesSelected: handleFilesSelected,
          pendingFiles: pendingFiles,
          onPendingFilesChange: setPendingFiles,
          onSaveComplete: () => {
            // 저장 완료 후 파일 목록 새로고침 (DataForm에서 자동으로 호출됨)
            console.log("파일 저장 완료 - 목록 새로고침됨");
          },
        }}
        onSaveCompleteRefSetter={(ref) => {
          attachmentSaveCompleteRef.current = ref;
        }}
        onSearch={handleSearch}
        onLeftAction={handleLeftAction}
        onValuesChange={handleValuesChange}
        onFinish={handleFinish}
        onFinishFailed={handleFinishFailed}
      />
    </>
  );
};

export default DetailView;
