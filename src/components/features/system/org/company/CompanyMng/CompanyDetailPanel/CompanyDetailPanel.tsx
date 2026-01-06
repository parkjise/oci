import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import type { UploadFile } from "antd";
import { Form } from "antd";
import dayjs from "dayjs";
import { DataForm } from "@components/ui/form";
import { showWarning } from "@components/ui/feedback";
import { useTranslation } from "react-i18next";
import { useCompanyMngStore } from "@store/system/org/company/companyMngStore";
import { createField, createPhotoField } from "./CompanyDetailPanel.config";
import { loadServerImageFiles } from "@components/ui/form";
import { DetailPanelContainer } from "./CompanyDetailPanel.styles";

const CompanyDetailPanel: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [mode, setMode] = useState<"view" | "edit">("view");

  const selectedCompany = useCompanyMngStore((state) => state.selectedCompany);
  const companyList = useCompanyMngStore((state) => state.companyList);
  const prevOfficeIdRef = useRef<string | null>(null);
  const blobUrlsRef = useRef<string[]>([]);

  // [Fix] DataForm.tsx의 날짜 파싱 로직(안전검사 부재)으로 인한 런타임 오류 방지 및 데이터 안정성 확보
  const safeSelectedCompany = useMemo(() => {
    if (!selectedCompany) return null;
    const safe = { ...selectedCompany };
    
    // YYYY-MM-DD 형식의 문자열을 미리 dayjs 객체로 변환하여 
    // DataForm의 취약한 파싱 로직(typeof .isValid === 'function' 체크 없음)을 우회합니다.
    Object.keys(safe).forEach(key => {
      const val = (safe as any)[key];
      if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) {
        try {
          const d = dayjs(val);
          if (d && typeof d.isValid === 'function' && d.isValid()) {
            (safe as any)[key] = d;
          }
        } catch (e) {
          // ignore
        }
      }
    });
    return safe;
  }, [selectedCompany]);

  const insert = useCompanyMngStore((state) => state.insert);
  const remove = useCompanyMngStore((state) => state.remove);
  const save = useCompanyMngStore((state) => state.save);
  const syncGridFromDetailPanel = useCompanyMngStore(
    (state) => state.syncGridFromDetailPanel
  );
  const setPendingFileInfo = useCompanyMngStore(
    (state) => state.setPendingFileInfo
  );
  const setPendingDeleteInfo = useCompanyMngStore(
    (state) => state.setPendingDeleteInfo
  );

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // 데이터 로드 효과
  useEffect(() => {
    if (selectedCompany) {
      const currentId =
        selectedCompany.officeId || (selectedCompany as any).id || "new";

      if (prevOfficeIdRef.current !== currentId) {
        setMode(selectedCompany.rowStatus === "C" ? "edit" : "view");
        prevOfficeIdRef.current = currentId;

        form.resetFields();
        form.setFieldsValue({
          ...selectedCompany,
          establishDate: selectedCompany.establishDate ? dayjs(selectedCompany.establishDate) : undefined,
        });

        blobUrlsRef.current.forEach(URL.revokeObjectURL);
        blobUrlsRef.current = [];

        if (
          selectedCompany.officeImgId &&
          selectedCompany.officeImgId !== "PENDING"
        ) {
          const imgKey = parseInt(selectedCompany.officeImgId as string, 10);
          loadServerImageFiles({
            imgKey,
            defaultFileName: "stamp",
            serverBlobUrlsRef: blobUrlsRef,
            onLoadComplete: setFileList,
          });
        } else {
          setFileList([]);
        }
      }
    } else {
      form.resetFields();
      setFileList([]);
      prevOfficeIdRef.current = null;
    }
  }, [
    selectedCompany?.officeId,
    (selectedCompany as any)?.id,
    form,
    selectedCompany,
  ]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(URL.revokeObjectURL);
    };
  }, []);

  const handleFileUpload = useCallback(
    (options: any) => {
      const { file, onSuccess } = options;
      const fileObj = file as File;

      const previewUrl = URL.createObjectURL(fileObj);
      blobUrlsRef.current.push(previewUrl);

      setPendingFileInfo({
        file: fileObj,
        eatKey:
          selectedCompany?.officeImgId &&
          selectedCompany.officeImgId !== "PENDING"
            ? parseInt(selectedCompany.officeImgId as string, 10)
            : null,
        officeId: selectedCompany?.officeId || "",
      });

      setFileList([
        {
          uid: `local_${Date.now()}`,
          name: fileObj.name,
          status: "done",
          url: previewUrl,
          thumbUrl: previewUrl,
        },
      ]);

      onSuccess?.("ok");
      syncGridFromDetailPanel(form.getFieldsValue());
    },
    [selectedCompany, setPendingFileInfo, form, syncGridFromDetailPanel]
  );

  const handleFileRemove = useCallback(() => {
    if (
      selectedCompany?.officeImgId &&
      selectedCompany.officeImgId !== "PENDING"
    ) {
      const imgKey = parseInt(selectedCompany.officeImgId as string, 10);
      const targetFile = fileList[0];
      if (
        targetFile &&
        targetFile.uid &&
        !targetFile.uid.startsWith("local_")
      ) {
        setPendingDeleteInfo({
          eatKey: imgKey,
          eatIdx: targetFile.uid,
          officeId: selectedCompany.officeId || "",
        });
      }
    }

    setFileList([]);
    setPendingFileInfo(null);
    blobUrlsRef.current.forEach(URL.revokeObjectURL);
    blobUrlsRef.current = [];
    syncGridFromDetailPanel(form.getFieldsValue());
  }, [
    selectedCompany,
    fileList,
    setPendingDeleteInfo,
    setPendingFileInfo,
    form,
    syncGridFromDetailPanel,
  ]);

  const handleSave = useCallback(async () => {
    try {
      const values = await form.validateFields();
      syncGridFromDetailPanel(values);
      await save();
      setMode("view");
    } catch (errorInfo) {
      showWarning(t("필수 항목을 입력해주세요."));
    }
  }, [form, save, syncGridFromDetailPanel, t]);

  const tableRows = useMemo(() => {
    const p = { mode };

    const txt = (k: string, l: string, rest: any = {}) => {
      const { required, dataColspan, ...otherProps } = rest;
      return createField({
        key: k,
        label: t(l),
        required,
        dataColspan,
        inputProps: { ...p, ...otherProps },
        type: "text",
      });
    };

    return [
      {
        fields: [
          txt("officeId", "회사코드", {
            required: true,
            disabled: selectedCompany?.rowStatus !== "C",
          }),
          txt("prefix", "접두사"),
        ],
      },
      {
        fields: [
          txt("officeNme", "회사명", { required: true }),
          txt("officeEngNme", "회사명(영문)"),
        ],
      },
      {
        fields: [
          txt("corpNo", "법인등록번호", { required: true }),
          txt("businessCategory", "사업분야"),
        ],
      },
      {
        fields: [
          txt("rpsnNme", "대표자", { required: true }),
          txt("rpsnEngNme", "대표자(영문)"),
        ],
      },
      {
        fields: [
          txt("rpsnIdNbr", "주민등록번호"),
          createField({
            key: "establishDate",
            label: t("설립일"),
            type: "date",
            inputProps: p,
          }),
        ],
      },
      { fields: [txt("addr", "주소", { dataColspan: 3 })] },
      { fields: [txt("addrEng", "주소(영문)", { dataColspan: 3 })] },
      { fields: [txt("uptae", "업태"), txt("jong", "업종")] },
      { fields: [txt("telNo", "전화번호"), txt("faxNo", "FAX번호")] },
      {
        fields: [
          createPhotoField({
            fileList,
            onFileChange: (info: any) => {
              if (info.file.status === "removed") handleFileRemove();
            },
            onUpload: handleFileUpload,
            onRemove: handleFileRemove,
            onDownload: () => {},
            t,
            mode,
          }),
        ],
      },
    ];
  }, [mode, fileList, selectedCompany, t, handleFileUpload, handleFileRemove]);

  return (
    <DetailPanelContainer>
      <DataForm
        key={
          (selectedCompany?.rowStatus === "C"
            ? "new"
            : selectedCompany?.officeId) || "empty"
        }
        form={form}
        className="page-layout__detail-view"
        tableRows={tableRows}
        tableData={safeSelectedCompany as any}
        mode={mode}
        actionButtonGroup={{
          onButtonClick: {
            create: () =>
              !companyList.some((c) => c.rowStatus === "C")
                ? insert()
                : showWarning(t("이미 신규 행이 있습니다.")),
            edit: () => selectedCompany && setMode("edit"),
            save: handleSave,
            delete: remove,
          },
          hideButtons: ["copy"],
        }}
      />
    </DetailPanelContainer>
  );
};

export default CompanyDetailPanel;
