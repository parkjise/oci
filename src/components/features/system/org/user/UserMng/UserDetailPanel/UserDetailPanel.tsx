import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import type { UploadFile } from "antd";
import type { FormInstance } from "antd/es/form";
import dayjs from "dayjs";
import { DataForm } from "@components/ui/form";
import { showWarning, AppPageModal } from "@components/ui/feedback";
import { useTranslation } from "react-i18next";
import { useUserMngStore } from "@store/system/org/user/userMngStore";
import { usePageModal } from "@hooks/usePageModal";
import { DeptInqirePopup } from "@pages/com/popup";
import type { SelectedDept } from "@/types/com/popup/DeptInqirePopup.types";
import { useAuthStore } from "@store/com/auth/authStore";
import { createField, createDeptField } from "./UserDetailPanel.config";
import {
  createPhotoField,
  createFileUploadHandler,
  createFileRemoveHandler,
  loadServerImageFiles,
} from "@components/ui/form";
import { DetailPanelContainer } from "./UserDetailPanel.styles";

interface UserDetailPanelProps {
  form: FormInstance;
}

interface FieldRestOptions {
  required?: boolean;
  disabled?: boolean;
  [key: string]: unknown;
}

const UserDetailPanel: React.FC<UserDetailPanelProps> = ({ form }) => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<"view" | "edit">("view");

  const selectedUser = useUserMngStore((state) => state.selectedUser);
  const prevEmpCodeRef = useRef<string | null>(null);
  // 서버에서 가져온 이미지의 Blob URL 관리 (PhotoUpload는 자동 관리)
  const serverBlobUrlsRef = useRef<string[]>([]);

  const orgList = useUserMngStore((state) => state.orgList);
  const positionList = useUserMngStore((state) => state.positionList);
  const userList = useUserMngStore((state) => state.userList);
  const syncGridFromDetailPanel = useUserMngStore(
    (state) => state.syncGridFromDetailPanel
  );
  const insert = useUserMngStore((state) => state.insert);
  const remove = useUserMngStore((state) => state.remove);
  const save = useUserMngStore((state) => state.save);

  const setPendingFileInfo = useUserMngStore(
    (state) => state.setPendingFileInfo
  );
  const setPendingDeleteInfo = useUserMngStore(
    (state) => state.setPendingDeleteInfo
  );

  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { user } = useAuthStore();

  const deptModal = usePageModal<Record<string, unknown>, SelectedDept>(
    DeptInqirePopup,
    {
      title: t("부서조회"),
      centered: true,
      width: 700,
      destroyOnHidden: true,
      onReturn: (returnValue) => {
        form.setFieldsValue({
          deptCode: returnValue.makeDept,
          deptName: returnValue.makeDeptName,
        });
      },
    }
  );

  // 데이터 로드 효과 (사용자 코드 변경 시에만 실행하여 입력 제어권 보장)
  const extendedUser = selectedUser
    ? (selectedUser as unknown as Record<string, unknown>)
    : null;
  const selectedUserId = extendedUser?.id as string | undefined;
  const selectedUserEmpCode = extendedUser?.empCode as string | undefined;

  useEffect(() => {
    if (selectedUser) {
      const currentEmpCode =
        selectedUser.empCode || selectedUserId || selectedUserEmpCode || "new";

      if (prevEmpCodeRef.current !== currentEmpCode) {
        setMode(selectedUser.rowStatus === "C" ? "edit" : "view");
        prevEmpCodeRef.current = currentEmpCode;

        form.resetFields(); // 이전 행의 데이터 잔상을 없애기 위해 폼 초기화 추가
        form.setFieldsValue({
          ...selectedUser,
          startDate: selectedUser.startDate
            ? dayjs(selectedUser.startDate)
            : undefined,
          endDate: selectedUser.endDate
            ? dayjs(selectedUser.endDate)
            : undefined,
          passwordDate: selectedUser.passwordDate
            ? dayjs(selectedUser.passwordDate)
            : undefined,
        });

        // 서버 이미지 Blob URL 초기화 (PhotoUpload는 자동 관리하므로 서버 이미지만 정리)
        serverBlobUrlsRef.current.forEach(URL.revokeObjectURL);
        serverBlobUrlsRef.current = [];

        if (selectedUser.empImgId && selectedUser.empImgId !== "PENDING") {
          const imgKey = parseInt(selectedUser.empImgId as string, 10);
          loadServerImageFiles({
            imgKey,
            defaultFileName: "photo",
            serverBlobUrlsRef,
            onLoadComplete: setFileList,
          });
        } else {
          setFileList([]);
        }
      }
    } else {
      form.resetFields();
      setFileList([]);
      prevEmpCodeRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedUser?.empCode, selectedUserId, selectedUserEmpCode, form]);

  // 컴포넌트 언마운트 시 서버 이미지 Blob URL 정리
  useEffect(() => {
    return () => {
      serverBlobUrlsRef.current.forEach(URL.revokeObjectURL);
      serverBlobUrlsRef.current = [];
    };
  }, []);

  const handleFileRemove = useMemo(
    () =>
      createFileRemoveHandler({
        fileList,
        setFileList,
        onRemoveServerFile: (targetFile: UploadFile) => {
          if (selectedUser?.empImgId && selectedUser.empImgId !== "PENDING") {
            const imgKey = parseInt(selectedUser.empImgId as string, 10);
            setPendingDeleteInfo({
              eatKey: imgKey,
              eatIdx: targetFile.uid,
              empCode: selectedUser.empCode,
            });
          }
        },
        onAfterRemove: () => {
          setPendingFileInfo(null);
          // PhotoUpload 컴포넌트가 Blob URL을 자동 관리하므로 별도 정리 불필요
          // 삭제 시에도 즉시 동기화
          syncGridFromDetailPanel(form.getFieldsValue());
        },
      }),
    [
      selectedUser,
      fileList,
      setPendingDeleteInfo,
      setPendingFileInfo,
      form,
      syncGridFromDetailPanel,
      setFileList,
    ]
  );

  const handleFileChange = useCallback(
    (info: { fileList: UploadFile[]; file: UploadFile }) => {
      // 파일 삭제 시에만 처리 (업로드는 createFileUploadHandler에서 setFileList 호출)
      if (info?.file.status === "removed") {
        handleFileRemove();
      }
      // 파일 업로드 완료 시에는 이미 createFileUploadHandler에서 setFileList가 호출되므로
      // 여기서는 중복 호출을 피하기 위해 처리하지 않음
    },
    [handleFileRemove]
  );

  const handleFileUpload = useMemo(
    () =>
      createFileUploadHandler({
        setFileList,
        onFileChange: handleFileChange,
        onBeforeSuccess: (fileObj: File) => {
          setPendingFileInfo({
            file: fileObj,
            eatKey:
              selectedUser?.empImgId && selectedUser.empImgId !== "PENDING"
                ? parseInt(selectedUser.empImgId as string, 10)
                : null,
            empCode: selectedUser?.empCode || "",
          });
        },
        onAfterSuccess: () => {
          // 파일 업로드 시에는 rowStatus 업데이트를 위해 즉시 동기화
          syncGridFromDetailPanel(form.getFieldsValue());
        },
      }),
    [
      selectedUser,
      setPendingFileInfo,
      form,
      syncGridFromDetailPanel,
      setFileList,
      handleFileChange,
    ]
  );

  const handleSave = useCallback(async () => {
    try {
      // [Validation] 저장 전 AntD Form의 필수 항목 및 규칙 검증 수행
      const values = await form.validateFields();

      syncGridFromDetailPanel(values);
      await save();
      setMode("view");
    } catch (errorInfo) {
      // 검증 실패 시 에러가 있는 첫 번째 항목으로 포커스 이동 및 경고 표시
      showWarning(t("필수 항목을 입력해주세요."));
      console.warn("Validation Failed:", errorInfo);
    }
  }, [form, save, syncGridFromDetailPanel, t]);

  const options = useMemo(
    () => ({
      yesNo: [
        { label: t("예"), value: "Y" },
        { label: t("아니오"), value: "N" },
      ],
      acpay: [
        { label: t("회사"), value: "A" },
        { label: t("부서"), value: "B" },
        { label: t("개인"), value: "C" },
      ],
      purreq: [
        { label: t("회사"), value: "C" },
        { label: t("사업장"), value: "O" },
        { label: t("부서"), value: "D" },
        { label: t("개인"), value: "P" },
      ],
      purkpo: [
        { label: t("회사"), value: "C" },
        { label: t("사업장"), value: "O" },
      ],
    }),
    [t]
  );

  const tableRows = useMemo(() => {
    const p = { mode };
    // [Issue Fix] 필수항목 별표(*) 노출을 위해 required 옵션을 createField로 분리 전달
    const txt = (k: string, l: string, rest: FieldRestOptions = {}) => {
      const { required, ...otherProps } = rest;
      return createField({
        key: k,
        label: t(l),
        required,
        inputProps: { ...p, ...otherProps },
        type: "text",
      });
    };
    const rd = (
      k: string,
      l: string,
      o: Array<{ label: string; value: string }>,
      rest: FieldRestOptions = {}
    ) => {
      const { required, ...otherProps } = rest;
      return createField({
        key: k,
        label: t(l),
        required,
        inputProps: { ...p, options: o, ...otherProps },
        type: "radio",
      });
    };
    const sel = (
      k: string,
      l: string,
      o: Array<{ label: string; value: string }>,
      rest: FieldRestOptions = {}
    ) => {
      const { required, ...otherProps } = rest;
      return createField({
        key: k,
        label: t(l),
        required,
        inputProps: { ...p, options: o, allowClear: true, ...otherProps },
        type: "select",
      });
    };

    return [
      {
        fields: [
          txt("empCode", "사용자ID", {
            required: true,
            disabled: selectedUser?.rowStatus !== "C",
          }),
          txt("empName", "사용자성명", { required: true }),
          txt("empyId", "사원번호"),
        ],
      },
      {
        fields: [
          txt("empAbbName", "사용자약어"),
          createField({
            key: "startDate",
            label: t("시작일자"),
            inputProps: p,
            type: "date",
          }),
          createField({
            key: "endDate",
            label: t("종료일자"),
            inputProps: p,
            type: "date",
          }),
        ],
      },
      {
        fields: [
          txt("deptCode", "부서코드", { disabled: true }),
          createDeptField({
            onDeptSearchClick: () =>
              deptModal.openModal({
                asOfficeId: user?.officeId,
                initialDeptCode: form.getFieldValue("deptCode"),
              }),
            mode,
          }),
          sel("pstnCode", "직위", positionList),
        ],
      },
      {
        fields: [
          rd("useYn", "사용여부", options.yesNo),
          rd("lockYn", "잠금여부", options.yesNo),
          {
            key: "passwordDate",
            label: t("비밀번호변경일자"),
            render: () => {
              const val = form.getFieldValue("passwordDate");
              const dateStr = val
                ? dayjs.isDayjs(val)
                  ? val.format("YYYY-MM-DD")
                  : dayjs(val).format("YYYY-MM-DD")
                : "";
              return (
                <div
                  style={{
                    padding: "4px 11px",
                    minHeight: 32,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {dateStr}
                </div>
              );
            },
          },
        ],
      },
      {
        fields: [
          txt("emailId", "Mail ID"),
          rd("emailReceiveYn", "E-Mail 수신", options.yesNo),
          createField({ key: "dummy1", label: "", render: () => null }),
        ],
      },
      {
        fields: [
          rd("ySale", "영업사원여부", options.yesNo),
          rd("insaDeptChgYn", "인사담당자여부", options.yesNo),
          rd("buyerYn", "구매담당여부", options.yesNo),
        ],
      },
      {
        fields: [
          sel("acpayRole", "AP권한", options.acpay),
          sel("purreqRole", "구매요청권한", options.purreq),
          sel("purkpoRole", "구매결의권한", options.purkpo),
        ],
      },
      {
        fields: [
          sel("orgId", "소속사업장", orgList),
          sel("subOrgId", "종사업장", orgList),
          sel("workPlace", "근무장소", orgList),
        ],
      },
      {
        fields: [
          createPhotoField({
            fileList,
            onFileChange: handleFileChange,
            onUpload: handleFileUpload,
            onRemove: handleFileRemove,
            dataColspan: 5,
            photoUploadProps: {
              previewWidth: 150,
              previewHeight: 150,
              maxSizeInMB: 5, // 5MB 제한
              maxSizeErrorMessage: "파일 크기는 5MB를 초과할 수 없습니다.",
              noPhotoText: "이미지 없음",
            },
            t,
            mode,
          }),
        ],
      },
    ];
  }, [
    mode,
    positionList,
    orgList,
    options,
    fileList,
    selectedUser,
    user?.officeId,
    form,
    t,
    deptModal,
    handleFileUpload,
    handleFileRemove,
    handleFileChange,
  ]);

  return (
    <DetailPanelContainer>
      <DataForm
        key={
          (selectedUser?.rowStatus === "C" ? "new" : selectedUser?.empCode) ||
          "empty"
        }
        form={form}
        className="page-layout__detail-view"
        tableRows={tableRows}
        tableData={selectedUser as unknown as Record<string, unknown>}
        mode={mode}
        actionButtonGroup={{
          onButtonClick: {
            create: () =>
              !userList.some((u) => u.rowStatus === "C")
                ? insert()
                : showWarning(t("이미 신규 행이 있습니다.")),
            edit: () => selectedUser && setMode("edit"),
            save: handleSave,
            delete: remove,
          },
          hideButtons: ["copy"],
        }}
      />
      <AppPageModal {...deptModal.modalProps} />
    </DetailPanelContainer>
  );
};

export default UserDetailPanel;
