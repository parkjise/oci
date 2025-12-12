// ============================================================================
// 법인 상세 정보 패널 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Form, Upload, Button, message } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import dayjs from "dayjs";
import {
  FormInput,
  FormDatePicker,
} from "@components/ui/form";
import { useTranslation } from "react-i18next";
import type { CompanyDto } from "@apis/system/org/companyApi";
import { downloadFileApi, getFileListApi, getImageBlobApi } from "@apis/system/file/fileApi";
import { CompanyDetailPanelStyles } from "./CompanyDetailPanel.styles";

// ============================================================================
// Types
// ============================================================================
interface CompanyDetailPanelProps {
  selectedCompany: CompanyDto | null;
  form: any;
  onValuesChange?: (changedValues: any, allValues: any) => void;
  onFileUploadReady?: (file: File | null, eatKey: number | null) => void;
  onFileDeleteReady?: (eatKey: number | null, eatIdx: string | null) => void;
}

// ============================================================================
// Component
// ============================================================================
const CompanyDetailPanel: React.FC<CompanyDetailPanelProps> = ({
  selectedCompany,
  form,
  onValuesChange,
  onFileUploadReady,
  onFileDeleteReady,
}) => {
  const { t } = useTranslation();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [eatKey, setEatKey] = useState<number | null>(null);
  const blobUrlRef = useRef<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<{ eatKey: number; eatIdx: string } | null>(null);

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
              status: (item.status as "done" | "uploading" | "error" | "removed") || "done",
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
    
    if (newFileList.length === 0 || newFileList.every(file => file.status === 'removed')) {
      setFileList([]);
      
      if (onValuesChange && selectedCompany) {
        const currentValues = form.getFieldsValue();
        const allValues = {
          ...currentValues,
          officeId: selectedCompany.officeId,
          officeImgId: undefined,
        };
        onValuesChange(
          { officeImgId: undefined },
          allValues
        );
      }
      
      if (onFileDeleteReady) {
        onFileDeleteReady(null, null);
      }
      setPendingDelete(null);
      return;
    }
    
    const fileWithUrl = newFileList.find(file => 
      file.url && 
      (file.status === 'done' || file.status === 'uploading')
    );
    
    if (fileWithUrl && fileWithUrl.url) {
      setFileList([fileWithUrl]);
      
      if (onValuesChange && selectedCompany) {
        const currentValues = form.getFieldsValue();
        const allValues = {
          ...currentValues,
          officeId: selectedCompany.officeId,
          officeImgId: eatKey ? eatKey.toString() : 'PENDING',
        };
        onValuesChange(
          { officeImgId: eatKey ? eatKey.toString() : 'PENDING' },
          allValues
        );
      }
      return;
    }
    
    const fileWithOrigin = newFileList.find(file => file.originFileObj);
    if (fileWithOrigin) {
      if (onValuesChange && selectedCompany) {
        const currentValues = form.getFieldsValue();
        const allValues = {
          ...currentValues,
          officeId: selectedCompany.officeId,
          officeImgId: eatKey ? eatKey.toString() : 'PENDING',
        };
        onValuesChange(
          { officeImgId: eatKey ? eatKey.toString() : 'PENDING' },
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
              blobUrlRef.current = blobUrlRef.current.filter((url) => url !== prevFile.url);
            } catch (e) {
              // 이미 정리된 URL은 무시
            }
          }
          if (prevFile.thumbUrl && prevFile.thumbUrl.startsWith("blob:")) {
            try {
              URL.revokeObjectURL(prevFile.thumbUrl);
              blobUrlRef.current = blobUrlRef.current.filter((url) => url !== prevFile.thumbUrl);
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
      fileWithUrl.status = 'done';
      
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
      
      if (onValuesChange && selectedCompany) {
        const currentValues = form.getFieldsValue();
        const allValues = {
          ...currentValues,
          officeId: selectedCompany.officeId,
          officeImgId: currentEatKey ? currentEatKey.toString() : 'PENDING',
        };
        
        onValuesChange(
          { officeImgId: currentEatKey ? currentEatKey.toString() : 'PENDING' },
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

  const prevSelectedOfficeIdRef = useRef<string | null>(null);

  // 선택된 법인 변경 시 폼 업데이트
  useEffect(() => {
    if (selectedCompany) {
      const currentOfficeId = selectedCompany.officeId;
      const prevOfficeId = prevSelectedOfficeIdRef.current;
      
      const isDifferentCompany = prevOfficeId !== currentOfficeId;
      
      if (isDifferentCompany) {
        const getDateString = (dateValue: any): string | undefined => {
          if (!dateValue) return undefined;
          if (typeof dateValue === 'string') {
            return dateValue.length >= 10 ? dateValue.substring(0, 10) : dateValue;
          }
          if (dateValue instanceof Date) {
            return dayjs(dateValue).format('YYYY-MM-DD');
          }
          return undefined;
        };

        const establishDateStr = getDateString(selectedCompany.establishDate);

        form.setFieldsValue({
          officeId: selectedCompany.officeId,
          prefix: selectedCompany.prefix,
          officeNme: selectedCompany.officeNme,
          officeEngNme: selectedCompany.officeEngNme,
          corpNo: selectedCompany.corpNo,
          businessCategory: selectedCompany.businessCategory,
          rpsnNme: selectedCompany.rpsnNme,
          rpsnEngNme: selectedCompany.rpsnEngNme,
          rpsnIdNbr: selectedCompany.rpsnIdNbr,
          establishDate: establishDateStr ? dayjs(establishDateStr) : undefined,
          addr: selectedCompany.addr,
          addrEng: selectedCompany.addrEng,
          uptae: selectedCompany.uptae,
          jong: selectedCompany.jong,
          telNo: selectedCompany.telNo,
          faxNo: selectedCompany.faxNo,
        });

        setPendingDelete(null);
        
        if (selectedCompany.officeImgId && selectedCompany.officeImgId !== 'PENDING') {
          const officeImgIdNum = typeof selectedCompany.officeImgId === 'string' 
            ? parseInt(selectedCompany.officeImgId, 10) 
            : selectedCompany.officeImgId;
          if (!isNaN(officeImgIdNum) && officeImgIdNum > 0) {
            setEatKey(officeImgIdNum);
            fetchFileList(officeImgIdNum);
          } else {
            setEatKey(null);
            setFileList([]);
          }
        } else {
          setEatKey(null);
          setFileList([]);
        }
        
        prevSelectedOfficeIdRef.current = currentOfficeId || null;
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
      prevSelectedOfficeIdRef.current = null;
    }
  }, [selectedCompany, form, fetchFileList]);

  // 컴포넌트 언마운트 시 Object URL 정리
  useEffect(() => {
    return () => {
      blobUrlRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      blobUrlRef.current = [];
    };
  }, []);

  return (
    <CompanyDetailPanelStyles>
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onValuesChange={onValuesChange}
      >
        <div className="company-detail__table">
          <table>
            <tbody>
              {/* 첫 번째 행: 회사코드, 접두사(회사코드), 직인 */}
              <tr>
                <th>
                  {t("회사코드")}
                  <span className="helptext asterisk">
                    <i className="ri-asterisk"></i>
                  </span>
                </th>
                <td>
                  <FormInput
                    name="officeId"
                    label=""
                    disabled={selectedCompany?.rowStatus !== "C"}
                    rules={[{ required: true }]}
                    style={{ marginBottom: 0, width: "80px" }}
                  />
                </td>
                <th>
                  {t("접두사(회사코드)")}
                </th>
                <td>
                  <FormInput
                    name="prefix"
                    label=""
                    disabled={selectedCompany?.rowStatus !== "C"}
                    style={{ marginBottom: 0, width: "80px" }}
                  />
                </td>
                <th rowSpan={9} className="signature-header">
                  {t("직인")}
                </th>
                <td rowSpan={9} className="signature-cell">
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
                            if (file.thumbUrl && file.thumbUrl.startsWith("blob:")) {
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
                              
                              if (onValuesChange && selectedCompany) {
                                const currentValues = form.getFieldsValue();
                                const allValues = {
                                  ...currentValues,
                                  officeId: selectedCompany.officeId,
                                  officeImgId: undefined,
                                };
                                onValuesChange(
                                  { officeImgId: undefined },
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

              {/* 두 번째 행: 회사명, 회사명(영문) */}
              <tr>
                <th>
                  {t("회사명")}
                  <span className="helptext asterisk">
                    <i className="ri-asterisk"></i>
                  </span>
                </th>
                <td>
                  <FormInput
                    name="officeNme"
                    label=""
                    rules={[{ required: true }]}
                    style={{ marginBottom: 0, width: "300px" }}
                  />
                </td>
                <th>
                  {t("회사명(영문)")}
                </th>
                <td>
                  <FormInput
                    name="officeEngNme"
                    label=""
                    style={{ marginBottom: 0, width: "300px" }}
                  />
                </td>
              </tr>

              {/* 세 번째 행: 법인등록번호, 사업분야 */}
              <tr>
                <th>
                  {t("법인등록번호")}
                  <span className="helptext asterisk">
                    <i className="ri-asterisk"></i>
                  </span>
                </th>
                <td>
                  <FormInput
                    name="corpNo"
                    label=""
                    rules={[{ required: true }]}
                    style={{ marginBottom: 0, width: "300px" }}
                  />
                </td>
                <th>
                  {t("사업분야")}
                  <span className="helptext asterisk">
                    <i className="ri-asterisk"></i>
                  </span>
                </th>
                <td>
                  <FormInput
                    name="businessCategory"
                    label=""
                    rules={[{ required: true }]}
                    style={{ marginBottom: 0, width: "300px" }}
                  />
                </td>
              </tr>

              {/* 네 번째 행: 대표자, 대표자(영문) */}
              <tr>
                <th>
                  {t("대표자")}
                  <span className="helptext asterisk">
                    <i className="ri-asterisk"></i>
                  </span>
                </th>
                <td>
                  <FormInput
                    name="rpsnNme"
                    label=""
                    rules={[{ required: true }]}
                    style={{ marginBottom: 0, width: "300px" }}
                  />
                </td>
                <th>
                  {t("대표자(영문)")}
                </th>
                <td>
                  <FormInput
                    name="rpsnEngNme"
                    label=""
                    style={{ marginBottom: 0, width: "300px" }}
                  />
                </td>
              </tr>

              {/* 다섯 번째 행: 주민등록번호, 설립일 */}
              <tr>
                <th>
                  {t("주민등록번호")}
                </th>
                <td>
                  <FormInput
                    name="rpsnIdNbr"
                    label=""
                    style={{ marginBottom: 0, width: "300px" }}
                  />
                </td>
                <th>
                  {t("설립일")}
                </th>
                <td>
                  <FormDatePicker
                    name="establishDate"
                    label=""
                    format="YYYY-MM-DD"
                    style={{ marginBottom: 0, width: "300px" }}
                  />
                </td>
              </tr>

              {/* 여섯 번째 행: 주소 */}
              <tr>
                <th>
                  {t("주소")}
                </th>
                <td colSpan={3}>
                  <FormInput
                    name="addr"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
              </tr>

              {/* 일곱 번째 행: 주소(영문) */}
              <tr>
                <th>
                  {t("주소(영문)")}
                </th>
                <td colSpan={3}>
                  <FormInput
                    name="addrEng"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
              </tr>

              {/* 여덟 번째 행: 업태, 업종 */}
              <tr>
                <th>
                  {t("업태")}
                  <span className="helptext asterisk">
                    <i className="ri-asterisk"></i>
                  </span>
                </th>
                <td>
                  <FormInput
                    name="uptae"
                    label=""
                    rules={[{ required: true }]}
                    style={{ marginBottom: 0, width: "300px" }}
                  />
                </td>
                <th>
                  {t("업종")}
                  <span className="helptext asterisk">
                    <i className="ri-asterisk"></i>
                  </span>
                </th>
                <td>
                  <FormInput
                    name="jong"
                    label=""
                    rules={[{ required: true }]}
                    style={{ marginBottom: 0, width: "300px" }}
                  />
                </td>
              </tr>

              {/* 아홉 번째 행: 전화번호, FAX번호 */}
              <tr>
                <th>
                  {t("전화번호")}
                </th>
                <td>
                  <FormInput
                    name="telNo"
                    label=""
                    style={{ marginBottom: 0, width: "300px" }}
                  />
                </td>
                <th>
                  {t("FAX번호")}
                </th>
                <td>
                  <FormInput
                    name="faxNo"
                    label=""
                    style={{ marginBottom: 0, width: "300px" }}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Form>
    </CompanyDetailPanelStyles>
  );
};

export default CompanyDetailPanel;

