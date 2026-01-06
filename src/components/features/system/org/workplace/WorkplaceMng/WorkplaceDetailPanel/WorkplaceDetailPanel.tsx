import React, {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
} from "react";
import type { UploadFile } from "antd";
import { Form } from "antd";
import { DataForm } from "@components/ui/form";
import { showWarning } from "@components/ui/feedback";
import { useTranslation } from "react-i18next";
import { useWorkplaceMngStore } from "@store/system/org/workplace/workplaceMngStore";
import {
  createField,
  createPhotoField,
} from "./WorkplaceDetailPanel.config";
import { loadServerImageFiles } from "@components/ui/form";
import { DetailPanelContainer } from "./WorkplaceDetailPanel.styles";

const WorkplaceDetailPanel: React.FC = () => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [mode, setMode] = useState<"view" | "edit">("view");

  const selectedWorkplace = useWorkplaceMngStore((state) => state.selectedWorkplace);
  const prevIdRef = useRef<string | null>(null);
  const blobUrlsRef = useRef<string[]>([]);
  
  const insert = useWorkplaceMngStore((state) => state.insert);
  const remove = useWorkplaceMngStore((state) => state.remove);
  const save = useWorkplaceMngStore((state) => state.save);
  const syncGridFromDetailPanel = useWorkplaceMngStore((state) => state.syncGridFromDetailPanel);
  const setPendingFileInfo = useWorkplaceMngStore((state) => state.setPendingFileInfo);
  const setPendingDeleteInfo = useWorkplaceMngStore((state) => state.setPendingDeleteInfo);

  const [fileList, setFileList] = useState<UploadFile[]>([]);

  // 데이터 로드 효과
  useEffect(() => {
    if (selectedWorkplace) {
      const currentId = (selectedWorkplace as any).id || 
                        `${selectedWorkplace.officeId}_${selectedWorkplace.orgId}` || 
                        "new";
      
      if (prevIdRef.current !== currentId) {
        setMode(selectedWorkplace.rowStatus === "C" ? "edit" : "view");
        prevIdRef.current = currentId;

        form.resetFields();
        form.setFieldsValue(selectedWorkplace);

        blobUrlsRef.current.forEach(URL.revokeObjectURL);
        blobUrlsRef.current = [];
        
        if (selectedWorkplace.orgImgId && selectedWorkplace.orgImgId !== "PENDING") {
          const imgKey = parseInt(selectedWorkplace.orgImgId as string, 10);
          loadServerImageFiles({
            imgKey,
            defaultFileName: "signature",
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
      prevIdRef.current = null;
    }
  }, [selectedWorkplace, form]);

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(URL.revokeObjectURL);
    };
  }, []);

  const handleFileUpload = useCallback((options: any) => {
    const { file, onSuccess } = options;
    const fileObj = file as File;

    const previewUrl = URL.createObjectURL(fileObj);
    blobUrlsRef.current.push(previewUrl);

    setPendingFileInfo({
      file: fileObj,
      eatKey: selectedWorkplace?.orgImgId && selectedWorkplace.orgImgId !== "PENDING" ? parseInt(selectedWorkplace.orgImgId as string, 10) : null,
      officeId: selectedWorkplace?.officeId || '',
      orgId: selectedWorkplace?.orgId || '',
    });

    setFileList([{
      uid: `local_${Date.now()}`,
      name: fileObj.name,
      status: 'done',
      url: previewUrl,
      thumbUrl: previewUrl,
    }]);

    onSuccess?.("ok");
    syncGridFromDetailPanel(form.getFieldsValue());
  }, [selectedWorkplace, setPendingFileInfo, form, syncGridFromDetailPanel]);

  const handleFileRemove = useCallback(() => {
    if (selectedWorkplace?.orgImgId && selectedWorkplace.orgImgId !== "PENDING") {
      const imgKey = parseInt(selectedWorkplace.orgImgId as string, 10);
      const targetFile = fileList[0];
      if (targetFile && targetFile.uid && !targetFile.uid.startsWith("local_")) {
        setPendingDeleteInfo({
          eatKey: imgKey,
          eatIdx: targetFile.uid,
          officeId: selectedWorkplace.officeId || "",
          orgId: selectedWorkplace.orgId || ""
        });
      }
    }
    
    setFileList([]);
    setPendingFileInfo(null);
    blobUrlsRef.current.forEach(URL.revokeObjectURL);
    blobUrlsRef.current = [];
    syncGridFromDetailPanel(form.getFieldsValue());
  }, [selectedWorkplace, fileList, setPendingDeleteInfo, setPendingFileInfo, form, syncGridFromDetailPanel]);

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
    
    // NOTE: Passing dataColspan directly to createField via destructuring in helper
    const txt = (k: string, l: string, rest: any = {}) => {
      const { required, dataColspan, ...otherProps } = rest;
      return createField({ key: k, label: t(l), required, dataColspan, inputProps: { ...p, ...otherProps }, type: "text" });
    };

    const sel = (k: string, l: string, o: any[], rest: any = {}) => {
      const { required, dataColspan, ...otherProps } = rest;
      return createField({ key: k, label: t(l), required, dataColspan, inputProps: { ...p, options: o, ...otherProps }, type: "select" });
    };

    const yesNoOptions = [
      { value: "Y", label: t("Y") },
      { value: "N", label: t("N") },
    ];

    return [
      { fields: [
        txt("orgId", "사업장코드", { required: true, disabled: selectedWorkplace?.rowStatus !== "C" }),
        sel("invOrg", "수불사업장", yesNoOptions),
      ]},
      { fields: [
        txt("orgNme", "사업장명", { required: true }),
        txt("orgEngNme", "사업장명(영문)"),
      ]},
      { fields: [
        txt("regtNo", "사업자등록번호"),
        txt("regtNoSeq", "종사업장번호"),
      ]},
      { fields: [
        txt("rpsnNme", "대표자"),
        txt("rpsnEngNme", "대표자(영문)")
      ]},
      { fields: [
        txt("rpsnIdNbr", "주민등록번호"),
        txt("telNo", "전화번호")
      ]},
      { fields: [
        sel("enabledFlag", "사용여부", yesNoOptions),
        txt("sortOrder", "Sort Order")
      ]},
      { fields: [
        txt("zipCode", "우편번호"),
        txt("faxNo", "Fax번호") // Utilizing the space next to zipCode usually
      ]},
      { fields: [
        txt("addr", "주소", { dataColspan: 3 })
      ]},
      { fields: [
        txt("addrEng", "주소(영문)", { dataColspan: 3 })
      ]},
      { fields: [
        txt("dclDept", "신고부서"),
        txt("dclPerNme", "신고담당자")
      ]},
      { fields: [
        txt("dclTelNo", "신고담당전화"),
        txt("defaultVatDept", "주매입사업장") // This was searched from dept in old code, simplification for now or standard text
      ]},
      { fields: [
        createPhotoField({
          fileList,
          onFileChange: (info: any) => { if (info.file.status === 'removed') handleFileRemove(); },
          onUpload: handleFileUpload,
          onRemove: handleFileRemove,
          onDownload: () => {},
          t,
          mode
        })
      ]}
    ];
  }, [mode, fileList, selectedWorkplace, t, handleFileUpload, handleFileRemove]);

  return (
    <DetailPanelContainer>
      <DataForm
        key={(selectedWorkplace?.rowStatus === "C" ? "new" : ((selectedWorkplace as any)?.id || "empty"))}
        form={form}
        className="page-layout__detail-view"
        tableRows={tableRows}
        tableData={selectedWorkplace as any}
        mode={mode}
        actionButtonGroup={{
          onButtonClick: { 
            create: () => {
              // 신규 시 PK 중복 체크 등을 위해 그리드에 행 추가
              insert(); 
            },
            edit: () => selectedWorkplace && setMode("edit"),
            save: handleSave,
            delete: remove
          },
          hideButtons: ["copy"]
        }}
      />
    </DetailPanelContainer>
  );
};

export default WorkplaceDetailPanel;
