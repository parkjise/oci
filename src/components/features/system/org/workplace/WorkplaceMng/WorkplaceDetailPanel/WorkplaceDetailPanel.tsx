// ============================================================================
// 사업장 상세 정보 패널 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  Form,
  Upload,
  Button,
  message,
  Space,
  Modal,
  Table,
  Input,
} from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FormInput, FormSelect } from "@components/ui/form";
import { useTranslation } from "react-i18next";
import type { WorkplaceDto } from "@apis/system/org/workplaceApi";
import {
  downloadFileApi,
  getFileListApi,
  getImageBlobApi,
} from "@apis/system/file/fileApi";
import { getCodeDetailApi } from "@apis/comCode";
import { searchDeptListApi, type DeptDto } from "@apis/system/org/deptApi";
import { WorkplaceDetailPanelStyles } from "./WorkplaceDetailPanel.styles";

// ============================================================================
// Types
// ============================================================================
interface WorkplaceDetailPanelProps {
  selectedWorkplace: WorkplaceDto | null;
  form: any;
  onValuesChange?: (changedValues: any, allValues: any) => void;
  onFileUploadReady?: (file: File | null, eatKey: number | null) => void;
  onFileDeleteReady?: (eatKey: number | null, eatIdx: string | null) => void;
}

// ============================================================================
// Component
// ============================================================================
const WorkplaceDetailPanel: React.FC<WorkplaceDetailPanelProps> = ({
  selectedWorkplace,
  form,
  onValuesChange,
  onFileUploadReady,
  onFileDeleteReady,
}) => {
  const { t } = useTranslation();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [eatKey, setEatKey] = useState<number | null>(null);
  const blobUrlRef = useRef<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<{
    eatKey: number;
    eatIdx: string;
  } | null>(null);
  const [deptModalVisible, setDeptModalVisible] = useState(false);
  const [deptSearchText, setDeptSearchText] = useState("");
  const [deptList, setDeptList] = useState<DeptDto[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);
  const [taxOfficeCodeOptions, setTaxOfficeCodeOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);

  // 공통코드 조회 (신고세무서코드)
  useEffect(() => {
    const fetchTaxOfficeCode = async () => {
      try {
        const response = await getCodeDetailApi({
          type: "TAXCD",
          module: "HR",
        });
        if (response.success && response.data) {
          const codeList = Array.isArray(response.data)
            ? response.data
            : [response.data];
          const options = codeList.map((item) => ({
            value: item.code || "",
            label: `${item.code || ""} - ${item.codeName || item.name1 || ""}`,
          }));
          setTaxOfficeCodeOptions(options);
        }
      } catch (error) {
        console.error("신고세무서코드 조회 실패:", error);
      }
    };
    fetchTaxOfficeCode();
  }, []);

  // 파일 목록 조회
  const fetchFileList = useCallback(async (key: number) => {
    try {
      blobUrlRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      blobUrlRef.current = [];

      const response = await getFileListApi(key);
      if (response.success && response.data) {
        const files: UploadFile[] = await Promise.all(
          response.data.map(async (item) => {
            const uid = item.uid || item.eatIdx || "";
            const name = item.name || item.fileName || "";

            const fileEatKey = item.eatKey || key;
            let imageUrl: string | undefined;
            if (fileEatKey && uid && name && isImageFile(name)) {
              try {
                const blob = await getImageBlobApi(fileEatKey, uid);
                imageUrl = URL.createObjectURL(blob);
                blobUrlRef.current.push(imageUrl);
              } catch (error) {
                console.error("이미지 로드 실패:", error);
              }
            }

            return {
              uid,
              name,
              status:
                (item.status as "done" | "uploading" | "error" | "removed") ||
                "done",
              url: imageUrl,
              thumbUrl: imageUrl,
            };
          })
        );
        setFileList(files);
      } else {
        setFileList([]);
      }
    } catch (error) {
      console.error("파일 목록 조회 실패:", error);
      setFileList([]);
    }
  }, []);

  // 이미지 파일 여부 확인
  const isImageFile = (filename: string): boolean => {
    if (!filename) return false;
    const ext = filename.toLowerCase().substring(filename.lastIndexOf(".") + 1);
    return ["jpg", "jpeg", "png", "gif", "bmp", "webp", "svg"].includes(ext);
  };

  // 파일 변경 핸들러
  const handleFileChange: UploadProps["onChange"] = (info) => {
    const { fileList: newFileList } = info;

    if (
      newFileList.length === 0 ||
      newFileList.every((file) => file.status === "removed")
    ) {
      setFileList([]);

      if (onValuesChange && selectedWorkplace) {
        const currentValues = form.getFieldsValue();
        const allValues = {
          ...currentValues,
          officeId: selectedWorkplace.officeId,
          orgId: selectedWorkplace.orgId,
          orgImgId: undefined,
        };
        onValuesChange({ orgImgId: undefined }, allValues);
      }

      if (onFileDeleteReady) {
        onFileDeleteReady(null, null);
      }
      setPendingDelete(null);
      return;
    }

    const fileWithUrl = newFileList.find(
      (file) =>
        file.url && (file.status === "done" || file.status === "uploading")
    );

    if (fileWithUrl && fileWithUrl.url) {
      setFileList([fileWithUrl]);

      if (onValuesChange && selectedWorkplace) {
        const currentValues = form.getFieldsValue();
        const allValues = {
          ...currentValues,
          officeId: selectedWorkplace.officeId,
          orgId: selectedWorkplace.orgId,
          orgImgId: eatKey ? eatKey.toString() : "PENDING",
        };
        onValuesChange(
          { orgImgId: eatKey ? eatKey.toString() : "PENDING" },
          allValues
        );
      }
      return;
    }

    const fileWithOrigin = newFileList.find((file) => file.originFileObj);
    if (fileWithOrigin) {
      if (onValuesChange && selectedWorkplace) {
        const currentValues = form.getFieldsValue();
        const allValues = {
          ...currentValues,
          officeId: selectedWorkplace.officeId,
          orgId: selectedWorkplace.orgId,
          orgImgId: eatKey ? eatKey.toString() : "PENDING",
        };
        onValuesChange(
          { orgImgId: eatKey ? eatKey.toString() : "PENDING" },
          allValues
        );
      }
    }
  };

  // 파일 업로드 핸들러
  const handleUpload: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess } = options;
    try {
      if (fileList.length > 0) {
        fileList.forEach((prevFile) => {
          if (prevFile.url && prevFile.url.startsWith("blob:")) {
            try {
              URL.revokeObjectURL(prevFile.url);
              blobUrlRef.current = blobUrlRef.current.filter(
                (url) => url !== prevFile.url
              );
            } catch (e) {
              // 이미 정리된 URL은 무시
            }
          }
          if (prevFile.thumbUrl && prevFile.thumbUrl.startsWith("blob:")) {
            try {
              URL.revokeObjectURL(prevFile.thumbUrl);
              blobUrlRef.current = blobUrlRef.current.filter(
                (url) => url !== prevFile.thumbUrl
              );
            } catch (e) {
              // 이미 정리된 URL은 무시
            }
          }
        });
      }

      if (fileList.length > 0 && eatKey) {
        const existingFile = fileList[0];
        if (existingFile.uid && !existingFile.uid.startsWith("local_")) {
          setPendingDelete({ eatKey, eatIdx: existingFile.uid });
          if (onFileDeleteReady) {
            onFileDeleteReady(eatKey, existingFile.uid);
          }
        }
      } else {
        if (pendingDelete) {
          setPendingDelete(null);
          if (onFileDeleteReady) {
            onFileDeleteReady(null, null);
          }
        }
      }

      const fileObj = file as File;

      const previewUrl = URL.createObjectURL(fileObj);
      blobUrlRef.current.push(previewUrl);

      const currentEatKey = eatKey || null;

      const fileWithUrl = file as any;
      fileWithUrl.url = previewUrl;
      fileWithUrl.thumbUrl = previewUrl;
      fileWithUrl.status = "done";

      const fileUid = (file as any).uid || `local_${Date.now()}`;
      const newFile: UploadFile = {
        uid: fileUid,
        name: fileObj.name,
        status: "done",
        url: previewUrl,
        thumbUrl: previewUrl,
        originFileObj: fileObj as any,
      };

      setFileList([newFile]);

      if (onValuesChange && selectedWorkplace) {
        const currentValues = form.getFieldsValue();
        const allValues = {
          ...currentValues,
          officeId: selectedWorkplace.officeId,
          orgId: selectedWorkplace.orgId,
          orgImgId: currentEatKey ? currentEatKey.toString() : "PENDING",
        };

        onValuesChange(
          { orgImgId: currentEatKey ? currentEatKey.toString() : "PENDING" },
          allValues
        );
      }

      if (onFileUploadReady) {
        onFileUploadReady(fileObj, currentEatKey);
      }

      if (onSuccess) {
        onSuccess({} as any);
      }
    } catch (error) {
      console.error("파일 처리 실패:", error);
      if (options.onError) {
        options.onError(error as Error);
      }
    }
  };

  // 파일 다운로드 핸들러
  const handleDownload = useCallback(async () => {
    if (!eatKey || fileList.length === 0) {
      message.warning(t("MSG_SY_0065"));
      return;
    }

    try {
      const file = fileList[0];
      if (file.uid) {
        await downloadFileApi(eatKey, file.uid, file.name);
        message.success(t("MSG_SY_0066"));
      }
    } catch (error) {
      console.error("파일 다운로드 실패:", error);
      message.error(t("MSG_SY_0067"));
    }
  }, [eatKey, fileList, t]);

  // 부서 검색 핸들러
  const handleDeptSearch = useCallback(async () => {
    if (!selectedWorkplace?.officeId) {
      message.warning(t("회사코드를 먼저 선택하세요."));
      return;
    }

    try {
      setDeptLoading(true);
      const response = await searchDeptListApi({
        officeId: selectedWorkplace.officeId,
        find: deptSearchText || undefined,
      });

      if (response.success && response.data) {
        setDeptList(response.data);
        if (response.data.length === 1) {
          // 부서가 하나만 조회되면 자동 선택
          const dept = response.data[0];
          form.setFieldsValue({
            defaultVatDept: dept.deptCde,
            deptName: dept.deptNme,
          });
          if (onValuesChange) {
            const currentValues = form.getFieldsValue();
            const allValues = {
              ...currentValues,
              defaultVatDept: dept.deptCde,
              deptName: dept.deptNme,
            };
            onValuesChange(
              { defaultVatDept: dept.deptCde, deptName: dept.deptNme },
              allValues
            );
          }
          setDeptModalVisible(false);
        } else {
          setDeptModalVisible(true);
        }
      } else {
        setDeptList([]);
        setDeptModalVisible(true);
      }
    } catch (error) {
      console.error("부서 검색 실패:", error);
      message.error(t("부서 검색에 실패했습니다."));
    } finally {
      setDeptLoading(false);
    }
  }, [selectedWorkplace, deptSearchText, form, onValuesChange, t]);

  // 부서 선택 핸들러
  const handleDeptSelect = useCallback(
    (dept: DeptDto) => {
      form.setFieldsValue({
        defaultVatDept: dept.deptCde,
        deptName: dept.deptNme,
      });
      if (onValuesChange) {
        const currentValues = form.getFieldsValue();
        const allValues = {
          ...currentValues,
          defaultVatDept: dept.deptCde,
          deptName: dept.deptNme,
        };
        onValuesChange(
          { defaultVatDept: dept.deptCde, deptName: dept.deptNme },
          allValues
        );
      }
      setDeptModalVisible(false);
      setDeptSearchText("");
    },
    [form, onValuesChange]
  );

  // 부서 검색 테이블 컬럼 정의
  const deptColumns: ColumnsType<DeptDto> = [
    {
      title: t("부서코드"),
      dataIndex: "deptCde",
      key: "deptCde",
      width: 120,
    },
    {
      title: t("부서명"),
      dataIndex: "deptNme",
      key: "deptNme",
    },
  ];

  const prevSelectedOrgIdRef = useRef<string | null>(null);

  // 선택된 사업장 변경 시 폼 업데이트
  useEffect(() => {
    if (selectedWorkplace) {
      const currentOrgId = selectedWorkplace.orgId;
      const prevOrgId = prevSelectedOrgIdRef.current;

      const isDifferentWorkplace = prevOrgId !== currentOrgId;

      if (isDifferentWorkplace) {
        form.setFieldsValue({
          officeId: selectedWorkplace.officeId,
          orgId: selectedWorkplace.orgId,
          orgNme: selectedWorkplace.orgNme,
          orgEngNme: selectedWorkplace.orgEngNme,
          regtNo: selectedWorkplace.regtNo,
          rpsnNme: selectedWorkplace.rpsnNme,
          rpsnEngNme: selectedWorkplace.rpsnEngNme,
          rpsnIdNbr: selectedWorkplace.rpsnIdNbr,
          addr: selectedWorkplace.addr,
          addrEng: selectedWorkplace.addrEng,
          invOrg: selectedWorkplace.invOrg,
          regtNoSeq: selectedWorkplace.regtNoSeq,
          sortOrder: selectedWorkplace.sortOrder,
          enabledFlag: selectedWorkplace.enabledFlag,
          uptae: selectedWorkplace.uptae,
          jong: selectedWorkplace.jong,
          telNo: selectedWorkplace.telNo,
          faxNo: selectedWorkplace.faxNo,
          dclDept: selectedWorkplace.dclDept,
          dclPerNme: selectedWorkplace.dclPerNme,
          dclTelNo: selectedWorkplace.dclTelNo,
          zipCode: selectedWorkplace.zipCode,
          defaultVatDept: selectedWorkplace.defaultVatDept,
          deptName: selectedWorkplace.deptName,
          homeTaxId: selectedWorkplace.homeTaxId,
          taxOfficeCode: selectedWorkplace.taxOfficeCode,
        });

        setPendingDelete(null);

        if (
          selectedWorkplace.orgImgId &&
          selectedWorkplace.orgImgId !== "PENDING"
        ) {
          const orgImgIdNum =
            typeof selectedWorkplace.orgImgId === "string"
              ? parseInt(selectedWorkplace.orgImgId, 10)
              : selectedWorkplace.orgImgId;
          if (!isNaN(orgImgIdNum) && orgImgIdNum > 0) {
            setEatKey(orgImgIdNum);
            fetchFileList(orgImgIdNum);
          } else {
            setEatKey(null);
            setFileList([]);
          }
        } else {
          setEatKey(null);
          setFileList([]);
        }

        prevSelectedOrgIdRef.current = currentOrgId || null;
      }
    } else {
      form.resetFields();
      blobUrlRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // 이미 정리된 URL은 무시
        }
      });
      blobUrlRef.current = [];
      setFileList([]);
      setPendingDelete(null);
      prevSelectedOrgIdRef.current = null;
    }
  }, [selectedWorkplace, form, fetchFileList]);

  // 컴포넌트 언마운트 시 Object URL 정리
  useEffect(() => {
    return () => {
      blobUrlRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      blobUrlRef.current = [];
    };
  }, []);

  // Y/N 옵션
  const yesNoOptions = [
    { value: "Y", label: t("Yes") },
    { value: "N", label: t("No") },
  ];

  return (
    <WorkplaceDetailPanelStyles>
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onValuesChange={onValuesChange}
      >
        <div className="workplace-detail__table">
          <table>
            <tbody>
              {/* 첫 번째 행: 사업장코드, 수불사업장, Sort Order, 빈 셀 2개 */}
              <tr>
                <th>
                  {t("사업장코드")}
                  <span className="helptext asterisk">
                    <i className="ri-asterisk"></i>
                  </span>
                </th>
                <td>
                  <FormInput
                    name="orgId"
                    label=""
                    disabled={selectedWorkplace?.rowStatus !== "C"}
                    rules={[{ required: true }]}
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("수불사업장")}</th>
                <td style={{ width: "150px" }}>
                  <FormSelect
                    name="invOrg"
                    label=""
                    options={yesNoOptions}
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("Sort Order")}</th>
                <td style={{ width: "150px" }}>
                  <FormInput
                    name="sortOrder"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <td rowSpan={3}></td>
                <td rowSpan={3}></td>
              </tr>

              {/* 두 번째 행: 사업장명, 사업장명(영문) */}
              <tr>
                <th>
                  {t("사업장명")}
                  <span className="helptext asterisk">
                    <i className="ri-asterisk"></i>
                  </span>
                </th>
                <td>
                  <FormInput
                    name="orgNme"
                    label=""
                    rules={[{ required: true }]}
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("사업장명(영문)")}</th>
                <td colSpan={3}>
                  <FormInput
                    name="orgEngNme"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
              </tr>

              {/* 세 번째 행: 사업자등록번호, 종사업장번호, 사용여부 */}
              <tr>
                <th>{t("사업자등록번호")}</th>
                <td>
                  <FormInput
                    name="regtNo"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("종사업장번호")}</th>
                <td>
                  <FormInput
                    name="regtNoSeq"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("사용여부")}</th>
                <td style={{ width: "150px" }}>
                  <FormSelect
                    name="enabledFlag"
                    label=""
                    options={yesNoOptions}
                    style={{ marginBottom: 0 }}
                  />
                </td>
              </tr>

              {/* 네 번째 행: 대표자, 대표자(영문), 주민등록번호, 전화번호 */}
              <tr>
                <th>{t("대표자")}</th>
                <td>
                  <FormInput
                    name="rpsnNme"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("대표자(영문)")}</th>
                <td>
                  <FormInput
                    name="rpsnEngNme"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("주민등록번호")}</th>
                <td style={{ width: "200px" }}>
                  <FormInput
                    name="rpsnIdNbr"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("전화번호")}</th>
                <td>
                  <FormInput
                    name="telNo"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
              </tr>

              {/* 다섯 번째 행: 우편번호, 주소, 직인 */}
              <tr>
                <th>{t("우편번호")}</th>
                <td>
                  <Space.Compact style={{ width: "100%" }}>
                    <FormInput
                      name="zipCode"
                      label=""
                      style={{ flex: 1, marginBottom: 0 }}
                    />
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={() => {
                        // 주소 검색 팝업 (나중에 구현)
                        message.info(t("주소 검색 기능은 준비 중입니다."));
                      }}
                    >
                      {t("검색")}
                    </Button>
                  </Space.Compact>
                </td>
                <th>{t("주소")}</th>
                <td colSpan={3}>
                  <FormInput name="addr" label="" style={{ marginBottom: 0 }} />
                </td>
                <th rowSpan={6} className="signature-header">
                  {t("직인")}
                </th>
                <td rowSpan={6} className="signature-cell">
                  <div className="signature-section">
                    <div className="upload-wrapper">
                      <Upload
                        listType="picture-card"
                        fileList={fileList}
                        customRequest={handleUpload}
                        onChange={handleFileChange}
                        maxCount={1}
                        accept="image/*"
                        onRemove={async (file) => {
                          try {
                            const urlsToRevoke: string[] = [];
                            if (file.url && file.url.startsWith("blob:")) {
                              urlsToRevoke.push(file.url);
                            }
                            if (
                              file.thumbUrl &&
                              file.thumbUrl.startsWith("blob:")
                            ) {
                              urlsToRevoke.push(file.thumbUrl);
                            }
                            urlsToRevoke.forEach((url) => {
                              URL.revokeObjectURL(url);
                              blobUrlRef.current = blobUrlRef.current.filter(
                                (storedUrl) => storedUrl !== url
                              );
                            });

                            if (file.uid && file.uid.startsWith("local_")) {
                              setFileList([]);
                              if (onFileUploadReady) {
                                onFileUploadReady(null, null);
                              }
                              return true;
                            }

                            if (eatKey && file.uid) {
                              setPendingDelete({ eatKey, eatIdx: file.uid });
                              setFileList([]);

                              if (onFileDeleteReady) {
                                onFileDeleteReady(eatKey, file.uid);
                              }

                              if (onFileUploadReady) {
                                onFileUploadReady(null, null);
                              }

                              if (onValuesChange && selectedWorkplace) {
                                const currentValues = form.getFieldsValue();
                                const allValues = {
                                  ...currentValues,
                                  officeId: selectedWorkplace.officeId,
                                  orgId: selectedWorkplace.orgId,
                                  orgImgId: undefined,
                                };
                                onValuesChange(
                                  { orgImgId: undefined },
                                  allValues
                                );
                              }

                              return true;
                            }

                            setFileList([]);
                            return true;
                          } catch (error) {
                            console.error("파일 제거 실패:", error);
                            return false;
                          }
                        }}
                      >
                        {fileList.length < 1 && (
                          <div>
                            <div style={{ marginTop: 8 }}>{t("사진등록")}</div>
                          </div>
                        )}
                      </Upload>
                      {fileList.length > 0 && (
                        <Button
                          type="primary"
                          icon={<DownloadOutlined />}
                          onClick={handleDownload}
                          size="small"
                          style={{ marginTop: 8, width: "100%" }}
                        >
                          {t("사진다운")}
                        </Button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>

              {/* 여섯 번째 행: 주소(영문) */}
              <tr>
                <th>{t("주소(영문)")}</th>
                <td colSpan={5}>
                  <FormInput
                    name="addrEng"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
              </tr>

              {/* 일곱 번째 행: 업태, 업종 */}
              <tr>
                <th>{t("업태")}</th>
                <td>
                  <FormInput
                    name="uptae"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("업종")}</th>
                <td colSpan={3}>
                  <FormInput name="jong" label="" style={{ marginBottom: 0 }} />
                </td>
              </tr>

              {/* 여덟 번째 행: FAX번호, 귀속부서 */}
              <tr>
                <th>{t("FAX번호")}</th>
                <td>
                  <FormInput
                    name="faxNo"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("귀속부서")}</th>
                <td>
                  <Space.Compact style={{ width: "100%" }}>
                    <FormInput
                      name="defaultVatDept"
                      label=""
                      style={{ flex: 1, marginBottom: 0 }}
                      onPressEnter={handleDeptSearch}
                    />
                    <Button
                      type="primary"
                      icon={<SearchOutlined />}
                      onClick={handleDeptSearch}
                    >
                      {t("검색")}
                    </Button>
                  </Space.Compact>
                </td>
                <td colSpan={2}>
                  <FormInput
                    name="deptName"
                    label=""
                    disabled
                    style={{ marginBottom: 0 }}
                  />
                </td>
              </tr>

              {/* 아홉 번째 행: 세무담당 부서명, 세무담당자, 세무담당 전화번호 */}
              <tr>
                <th>{t("세무담당 부서명")}</th>
                <td>
                  <FormInput
                    name="dclDept"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("세무담당자")}</th>
                <td>
                  <FormInput
                    name="dclPerNme"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("세무담당 전화번호")}</th>
                <td style={{ width: "200px" }}>
                  <FormInput
                    name="dclTelNo"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
              </tr>

              {/* 열 번째 행: 홈택스 아이디, 신고세무서코드 */}
              <tr>
                <th>{t("홈택스 아이디")}</th>
                <td>
                  <FormInput
                    name="homeTaxId"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("신고세무서코드")}</th>
                <td>
                  <FormSelect
                    name="taxOfficeCode"
                    label=""
                    options={taxOfficeCodeOptions}
                    allowClear
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th></th>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Form>

      {/* 부서 검색 모달 */}
      <Modal
        title={t("부서 검색")}
        open={deptModalVisible}
        onCancel={() => {
          setDeptModalVisible(false);
          setDeptSearchText("");
        }}
        footer={null}
        width={600}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder={t("부서코드 또는 부서명")}
              value={deptSearchText}
              onChange={(e) => setDeptSearchText(e.target.value)}
              onPressEnter={handleDeptSearch}
              style={{ flex: 1 }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleDeptSearch}
              loading={deptLoading}
            >
              {t("검색")}
            </Button>
          </Space.Compact>
          <Table
            columns={deptColumns}
            dataSource={deptList}
            loading={deptLoading}
            rowKey="deptCde"
            pagination={{ pageSize: 10 }}
            onRow={(record) => ({
              onClick: () => handleDeptSelect(record),
              style: { cursor: "pointer" },
            })}
          />
        </Space>
      </Modal>
    </WorkplaceDetailPanelStyles>
  );
};

export default WorkplaceDetailPanel;
