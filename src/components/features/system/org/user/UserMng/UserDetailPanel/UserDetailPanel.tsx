// ============================================================================
// 사용자 상세 정보 패널 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)
// - 2025.12.03 : ckkim (비밀번호변경일자, 시작일자, 직위, 사원번호, 구매결의권한, 근무장소 필드 매핑 확인 및 수정)
// - 2025.12.04 : AS-IS 분석 반영 (필드 순서, 조직 목록, 부서 검색, 전자결재 사용 토글)

import React, { useEffect, useState, useCallback, useRef } from "react";
import { Form, Upload, Button, message, Space, Modal, Input, Table } from "antd";
import { DownloadOutlined, SearchOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import {
  FormInput,
  FormSelect,
  FormDatePicker,
  FormRadioGroup,
} from "@components/ui/form";
import { useTranslation } from "react-i18next";
import type { UserDto } from "@apis/system/user/userApi";
import { downloadFileApi, getFileListApi, getImageBlobApi } from "@apis/system/file/fileApi";
import { toggleApplUseYnApi } from "@apis/system/user/userApi";
import { searchDeptListApi, type DeptDto } from "@apis/system/org/deptApi";
import { UserDetailPanelStyles } from "./UserDetailPanel.styles";

// ============================================================================
// Types
// ============================================================================
interface UserDetailPanelProps {
  selectedUser: UserDto | null;
  form: any;
  onValuesChange?: (changedValues: any, allValues: any) => void;
  orgList?: Array<{ value: string; label: string }>;
  positionList?: Array<{ value: string; label: string }>;
  onFileUploadReady?: (file: File | null, eatKey: number | null) => void; // 저장 대기 중인 파일 정보 전달
  onFileDeleteReady?: (eatKey: number | null, eatIdx: string | null) => void; // 삭제 대기 중인 파일 정보 전달
}

// ============================================================================
// Component
// ============================================================================
const UserDetailPanel: React.FC<UserDetailPanelProps> = ({
  selectedUser,
  form,
  onValuesChange,
  orgList = [],
  positionList = [],
  onFileUploadReady,
  onFileDeleteReady,
}) => {
  const { t } = useTranslation();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [, setLoading] = useState(false);
  const [eatKey, setEatKey] = useState<number | null>(null);
  const blobUrlRef = useRef<string[]>([]);
  const [, setPendingFile] = useState<File | null>(null); // 저장 대기 중인 파일
  const [pendingDelete, setPendingDelete] = useState<{ eatKey: number; eatIdx: string } | null>(null); // 삭제 대기 중인 파일
  const [deptModalVisible, setDeptModalVisible] = useState(false);
  const [deptSearchText, setDeptSearchText] = useState("");
  const [deptList, setDeptList] = useState<DeptDto[]>([]);
  const [deptLoading, setDeptLoading] = useState(false);

  // 파일 목록 조회
  const fetchFileList = useCallback(async (key: number) => {
    try {
      // 이전 blob URL 정리
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
            
            // 이미지 파일인 경우 인증된 blob URL로 변환
            // eatKey는 함수 파라미터로 받은 key를 사용 (백엔드 응답에 eatKey가 없을 수 있음)
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
        // 파일 목록이 없으면 빈 배열로 설정
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

  // 파일 변경 핸들러 (Ant Design Upload 컴포넌트용)
  const handleFileChange: UploadProps["onChange"] = (info) => {
    const { fileList: newFileList } = info;
    
    // 파일이 제거된 경우
    if (newFileList.length === 0 || newFileList.every(file => file.status === 'removed')) {
      setFileList([]);
      setPendingFile(null);
      
      // 파일 제거 시 그리드 업데이트
      if (onValuesChange && selectedUser) {
        const currentValues = form.getFieldsValue();
        // selectedUser의 empCode와 officeId를 보존하면서 현재 폼 값으로 업데이트
        const allValues = {
          ...currentValues,
          empCode: selectedUser.empCode, // 필수: empCode 보존
          officeId: selectedUser.officeId || currentValues.officeId, // 필수: officeId 보존
          empImgId: undefined,
        };
        onValuesChange(
          { empImgId: undefined },
          allValues
        );
      }
      
      // 파일 삭제 준비 정보 초기화
      if (onFileDeleteReady) {
        onFileDeleteReady(null, null);
      }
      setPendingDelete(null);
      return;
    }
    
    // 파일이 추가된 경우
    // URL이 있는 파일(customRequest에서 처리한 파일)이 있으면 파일 목록 업데이트
    const fileWithUrl = newFileList.find(file => 
      file.url && 
      (file.status === 'done' || file.status === 'uploading')
    );
    
    if (fileWithUrl && fileWithUrl.url) {
      // customRequest에서 설정한 파일이면 파일 목록 업데이트
      setFileList([fileWithUrl]);
      
      // 그리드에 수정 표시를 위해 onValuesChange 호출
      if (onValuesChange && selectedUser) {
        const currentValues = form.getFieldsValue();
        // selectedUser의 empCode와 officeId를 보존하면서 현재 폼 값으로 업데이트
        const allValues = {
          ...currentValues,
          empCode: selectedUser.empCode, // 필수: empCode 보존
          officeId: selectedUser.officeId || currentValues.officeId, // 필수: officeId 보존
          empImgId: eatKey ? eatKey.toString() : 'PENDING',
        };
        onValuesChange(
          { empImgId: eatKey ? eatKey.toString() : 'PENDING' },
          allValues
        );
      }
      return;
    }
    
    // originFileObj가 있는 파일이 추가되면 customRequest가 처리할 때까지 대기
    // 하지만 그리드에는 수정 표시를 위해 onValuesChange 호출
    const fileWithOrigin = newFileList.find(file => file.originFileObj);
    if (fileWithOrigin) {
      // 그리드에 수정 표시를 위해 onValuesChange 호출
      if (onValuesChange && selectedUser) {
        const currentValues = form.getFieldsValue();
        // selectedUser의 empCode와 officeId를 보존하면서 현재 폼 값으로 업데이트
        const allValues = {
          ...currentValues,
          empCode: selectedUser.empCode, // 필수: empCode 보존
          officeId: selectedUser.officeId || currentValues.officeId, // 필수: officeId 보존
          empImgId: eatKey ? eatKey.toString() : 'PENDING',
        };
        onValuesChange(
          { empImgId: eatKey ? eatKey.toString() : 'PENDING' },
          allValues
        );
      }
    }
  };

  // 파일 업로드 핸들러 (로컬 상태로만 관리, 실제 저장은 저장 버튼 클릭 시)
  const handleUpload: UploadProps["customRequest"] = async (options) => {
    const { file, onSuccess } = options;
    console.log("handleUpload called", file);
    try {
      // 이전 파일이 있으면 blob URL 정리
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
      
      // 기존 파일이 있으면 삭제 대기 상태로 설정
      if (fileList.length > 0 && eatKey) {
        const existingFile = fileList[0];
        if (existingFile.uid && !existingFile.uid.startsWith("local_")) {
          // 저장된 파일이면 삭제 대기 상태로 설정
          setPendingDelete({ eatKey, eatIdx: existingFile.uid });
          if (onFileDeleteReady) {
            onFileDeleteReady(eatKey, existingFile.uid);
          }
        }
      } else {
        // 기존 파일이 없으면 삭제 대기 상태 초기화
        if (pendingDelete) {
          setPendingDelete(null);
          if (onFileDeleteReady) {
            onFileDeleteReady(null, null);
          }
        }
      }
      
      // 파일을 로컬 상태로만 저장 (서버 업로드 X)
      const fileObj = file as File;
      setPendingFile(fileObj);
      
      // 미리보기를 위한 로컬 URL 생성
      const previewUrl = URL.createObjectURL(fileObj);
      blobUrlRef.current.push(previewUrl);
      
      // EAT_KEY는 저장 버튼 클릭 시에만 생성하므로 여기서는 생성하지 않음
      // 기존 eatKey가 있으면 사용하고, 없으면 null로 설정 (저장 시 생성)
      const currentEatKey = eatKey || null;
      
      // 파일 객체에 URL 추가 (onChange에서 사용할 수 있도록)
      const fileWithUrl = file as any;
      fileWithUrl.url = previewUrl;
      fileWithUrl.thumbUrl = previewUrl;
      fileWithUrl.status = 'done';
      
      // 파일 목록 업데이트
      const fileUid = (file as any).uid || `local_${Date.now()}`;
      const newFile: UploadFile = {
        uid: fileUid,
        name: fileObj.name,
        status: "done",
        url: previewUrl,
        thumbUrl: previewUrl,
        originFileObj: fileObj as any, // RcFile 타입으로 변환
      };
      
      // 파일 목록 업데이트 (기존 파일을 새 파일로 교체)
      setFileList([newFile]);
      
      // 그리드에 수정 표시를 위해 onValuesChange 호출
      if (onValuesChange && selectedUser) {
        const currentValues = form.getFieldsValue();
        // selectedUser의 empCode와 officeId를 보존하면서 현재 폼 값으로 업데이트
        const allValues = {
          ...currentValues,
          empCode: selectedUser.empCode, // 필수: empCode 보존
          officeId: selectedUser.officeId || currentValues.officeId, // 필수: officeId 보존
          empImgId: currentEatKey ? currentEatKey.toString() : 'PENDING',
        };
        
        onValuesChange(
          { empImgId: currentEatKey ? currentEatKey.toString() : 'PENDING' },
          allValues
        );
      }
      
      // 저장 대기 중인 파일 정보를 부모 컴포넌트에 전달
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

  // 이전 selectedUser의 empCode를 추적하기 위한 ref
  const prevSelectedEmpCodeRef = useRef<string | null>(null);

  // 선택된 사용자 변경 시 폼 업데이트
  useEffect(() => {
    if (selectedUser) {
      const currentEmpCode = selectedUser.empCode;
      const prevEmpCode = prevSelectedEmpCodeRef.current;
      
      // 다른 사용자를 선택한 경우에만 폼을 완전히 재설정
      const isDifferentUser = prevEmpCode !== currentEmpCode;
      
      if (isDifferentUser) {
        // 날짜 필드 안전하게 처리
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

        const passwordDateStr = getDateString(selectedUser.passwordDate);
        const startDateStr = getDateString(selectedUser.startDate);
        const endDateStr = getDateString(selectedUser.endDate);

        form.setFieldsValue({
          empCode: selectedUser.empCode,
          empName: selectedUser.empName,
          password: selectedUser.password,
          lockYn: selectedUser.lockYn || "N",
          useYn: selectedUser.useYn || "Y",
          deptCode: selectedUser.deptCode,
          deptName: selectedUser.deptName,
          passwordDate: passwordDateStr,
          pstnCode: selectedUser.pstnCode,
          acpayRole: selectedUser.acpayRole,
          startDate: startDateStr ? dayjs(startDateStr) : undefined,
          endDate: endDateStr ? dayjs(endDateStr) : undefined,
          empyId: selectedUser.empyId,
          ySale: selectedUser.ySale || "N",
          emailId: selectedUser.emailId,
          empAbbName: selectedUser.empAbbName,
          purreqRole: selectedUser.purreqRole,
          emailReceiveYn: selectedUser.emailReceiveYn || "N",
          insaDeptChgYn: selectedUser.insaDeptChgYn || "N",
          officeId: selectedUser.officeId,
          purkpoRole: selectedUser.purkpoRole,
          applUseYn: selectedUser.applUseYn || "NO",
          subOrgId: selectedUser.subOrgId,
          buyerYn: selectedUser.buyerYn || "N",
          workPlace: selectedUser.workPlace,
        });

        // 다른 사용자를 선택할 때는 pendingFile을 초기화하여 파일 목록 조회 가능하도록 함
        // pendingFile은 현재 선택된 사용자의 새 파일 선택 중일 때만 유지되어야 함
        // selectedUser가 변경되면 pendingFile을 초기화
        setPendingFile(null);
        setPendingDelete(null);
        
        // 파일 목록 조회 및 eatKey 설정 (다른 사용자를 선택한 경우에만)
        // empImgId가 'PENDING'이 아니고 숫자인 경우에만 조회
        if (selectedUser.empImgId && selectedUser.empImgId !== 'PENDING') {
          const empImgIdNum = typeof selectedUser.empImgId === 'string' 
            ? parseInt(selectedUser.empImgId, 10) 
            : selectedUser.empImgId;
          if (!isNaN(empImgIdNum) && empImgIdNum > 0) {
            // eatKey 설정
            setEatKey(empImgIdNum);
            // 파일 목록 조회
            fetchFileList(empImgIdNum);
          } else {
            // 유효하지 않은 empImgId면 초기화
            setEatKey(null);
            setFileList([]);
          }
        } else {
          // 저장된 이미지가 없거나 PENDING이면 초기화
          setEatKey(null);
          setFileList([]);
        }
        
        // 이전 empCode 업데이트 (파일 목록 조회 후)
        prevSelectedEmpCodeRef.current = currentEmpCode;
      }
      // 같은 사용자인 경우에는 파일 목록 조회를 하지 않음 (로컬에서 선택한 파일 유지)
    } else {
      form.resetFields();
      // 모든 blob URL 정리
      blobUrlRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          // 이미 정리된 URL은 무시
        }
      });
      blobUrlRef.current = [];
      setFileList([]);
      setPendingFile(null);
      setPendingDelete(null);
      prevSelectedEmpCodeRef.current = null;
    }
  }, [selectedUser, form, fetchFileList]);

  // 컴포넌트 언마운트 시 Object URL 정리
  useEffect(() => {
    return () => {
      blobUrlRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
      blobUrlRef.current = [];
    };
  }, []);

  // 부서코드 검색 핸들러
  const handleDeptSearch = () => {
    setDeptModalVisible(true);
    setDeptSearchText(form.getFieldValue("deptCode") || "");
    handleDeptSearchExecute();
  };

  // 부서 검색 실행
  const handleDeptSearchExecute = useCallback(async () => {
    try {
      setDeptLoading(true);
      const officeId = form.getFieldValue("officeId") || selectedUser?.officeId;
      const response = await searchDeptListApi({
        officeId,
        find: deptSearchText || "",
      });
      if (response.success && response.data) {
        setDeptList(response.data);
      } else {
        setDeptList([]);
      }
    } catch (error) {
      console.error("부서 검색 실패:", error);
      message.error(t("MSG_SY_0064"));
      setDeptList([]);
    } finally {
      setDeptLoading(false);
    }
  }, [deptSearchText, form, selectedUser, t]);

  // 부서 선택 핸들러
  const handleDeptSelect = (dept: DeptDto) => {
    form.setFieldsValue({
      deptCode: dept.deptCde,
      deptName: dept.deptNme,
    });
    setDeptModalVisible(false);
    if (onValuesChange) {
      onValuesChange(
        { deptCode: dept.deptCde, deptName: dept.deptNme },
        form.getFieldsValue()
      );
    }
  };

  // 전자결재 사용 여부 변경 핸들러
  const handleApplUseYnChange = async () => {
    if (!selectedUser) {
      message.warning(t("MSG_SY_0043"));
      return;
    }

    const currentApplUseYn = form.getFieldValue("applUseYn") || "NO";
    const newApplUseYn = currentApplUseYn === "YES" ? "NO" : "YES";

    try {
      setLoading(true);
      await toggleApplUseYnApi({
        officeId: selectedUser.officeId || "",
        empCode: selectedUser.empCode,
        applUseYn: newApplUseYn,
      });
      
      form.setFieldsValue({ applUseYn: newApplUseYn });
      if (onValuesChange) {
        onValuesChange({ applUseYn: newApplUseYn }, form.getFieldsValue());
      }
      message.success(t("MSG_SY_0049"));
    } catch (error) {
      console.error("전자결재 사용 여부 변경 실패:", error);
      message.error(t("MSG_SY_0050"));
    } finally {
      setLoading(false);
    }
  };

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

  // AP 권한 옵션
  const acpayRoleOptions = [
    { value: "A", label: "Corporation" },
    { value: "B", label: "Department" },
    { value: "C", label: "Individual" },
  ];

  // 구매요청권한 옵션
  const purreqRoleOptions = [
    { value: "C", label: t("회사") },
    { value: "O", label: t("사업장") },
    { value: "D", label: t("부서") },
    { value: "P", label: t("개인") },
    { value: "", label: t("없음") },
  ];

  // 구매결의권한 옵션
  const purkpoRoleOptions = [
    { value: "C", label: t("회사") },
    { value: "O", label: t("사업장") },
    { value: "", label: t("없음") },
  ];

  // 구매담당여부 옵션
  const buyerYnOptions = [
    { value: "Y", label: t("Yes") },
    { value: "N", label: t("No") },
    { value: "", label: t("없음") },
  ];


  // 라디오 옵션
  const yesNoOptions = [
    { value: "Y", label: t("Yes") },
    { value: "N", label: t("No") },
  ];

  // 전자결재 사용 버튼 텍스트
  const applUseYnValue = form.getFieldValue("applUseYn") || selectedUser?.applUseYn || "NO";
  const applUseYnButtonText = applUseYnValue === "YES" ? t("미사용") : t("사용");

  return (
    <UserDetailPanelStyles>
      <Form
        form={form}
        layout="horizontal"
        labelCol={{ span: 8 }}
        wrapperCol={{ span: 16 }}
        onValuesChange={onValuesChange}
      >
        <div className="user-detail__table">
          <table>
            <tbody>
              {/* 첫 번째 행: 사용자ID, 사용자명, 비밀번호, 잠김여부, 사용여부 */}
              <tr>
                <th>
                  {t("사용자ID")}
                  <span className="helptext asterisk">
                    <i className="ri-asterisk"></i>
                  </span>
                </th>
                <td>
                  <FormInput
                    name="empCode"
                    label=""
                    disabled
                    rules={[{ required: true }]}
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>
                  {t("사용자명")}
                  <span className="helptext asterisk">
                    <i className="ri-asterisk"></i>
                  </span>
                </th>
                <td>
                  <FormInput
                    name="empName"
                    label=""
                    rules={[{ required: true }]}
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>
                  {t("비밀번호")}
                  <span className="helptext asterisk">
                    <i className="ri-asterisk"></i>
                  </span>
                </th>
                <td>
                  <FormInput
                    name="password"
                    label=""
                    type="password"
                    rules={[{ required: true }]}
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("잠김여부")}</th>
                <td>
                  <FormRadioGroup
                    name="lockYn"
                    label=""
                    options={yesNoOptions}
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("사용여부")}</th>
                <td>
                  <FormRadioGroup
                    name="useYn"
                    label=""
                    options={yesNoOptions}
                    style={{ marginBottom: 0 }}
                  />
                </td>
              </tr>

              {/* 두 번째 행: 소속부서(검색), 부서명(colspan=2), 비밀번호변경일자, Sign(rowspan=6) */}
              <tr>
                <th>
                  {t("소속부서")}
                  <span className="helptext asterisk">
                    <i className="ri-asterisk"></i>
                  </span>
                </th>
                <td>
                  <FormInput
                    name="deptCode"
                    label=""
                    type="search"
                    onSearch={handleDeptSearch}
                    rules={[{ required: true }]}
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <td colSpan={2}>
                  <FormInput
                    name="deptName"
                    label=""
                    disabled
                    placeholder={t("부서명")}
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("비밀번호변경일자")}</th>
                <td>
                  <FormInput
                    name="passwordDate"
                    label=""
                    disabled
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <td></td>
                <td></td>
                <th rowSpan={6} className="signature-header">
                  {t("서명")}
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
                            // blob URL 정리
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
                            
                            // 로컬 파일인 경우 (아직 저장되지 않은 파일)
                            if (file.uid && file.uid.startsWith("local_")) {
                              setPendingFile(null);
                              setFileList([]);
                              if (onFileUploadReady) {
                                onFileUploadReady(null, null);
                              }
                              return true;
                            }
                            
                            // 저장된 파일인 경우 삭제 대기 상태로 설정
                            if (eatKey && file.uid) {
                              setPendingDelete({ eatKey, eatIdx: file.uid });
                              setFileList([]);
                              setPendingFile(null); // 로컬 파일도 초기화
                              
                              // 삭제 대기 정보를 부모 컴포넌트에 전달
                              if (onFileDeleteReady) {
                                onFileDeleteReady(eatKey, file.uid);
                              }
                              
                              // 파일 업로드 준비 정보 초기화
                              if (onFileUploadReady) {
                                onFileUploadReady(null, null);
                              }
                              
                              // 그리드에 수정 표시를 위해 onValuesChange 호출
                              if (onValuesChange && selectedUser) {
                                const currentValues = form.getFieldsValue();
                                // selectedUser의 empCode와 officeId를 보존하면서 현재 폼 값으로 업데이트
                                const allValues = {
                                  ...currentValues,
                                  empCode: selectedUser.empCode, // 필수: empCode 보존
                                  officeId: selectedUser.officeId || currentValues.officeId, // 필수: officeId 보존
                                  empImgId: undefined,
                                };
                                onValuesChange(
                                  { empImgId: undefined },
                                  allValues
                                );
                              }
                              
                              return true;
                            }
                            
                            // 파일 정보가 없는 경우 그냥 제거
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

              {/* 세 번째 행: 직위, AP전표생성권한, 시작일자, 종료일자 */}
              <tr>
                <th>{t("직위")}</th>
                <td>
                  <FormSelect
                    name="pstnCode"
                    label=""
                    options={positionList}
                    allowClear
                    style={{ marginBottom: 0, width: "100%" }}
                  />
                </td>
                <th>{t("AP전표생성권한")}</th>
                <td>
                  <FormSelect
                    name="acpayRole"
                    label=""
                    options={acpayRoleOptions}
                    allowClear
                    style={{ marginBottom: 0, width: "100%" }}
                  />
                </td>
                <th>{t("시작일자")}</th>
                <td>
                  <FormDatePicker
                    name="startDate"
                    label=""
                    format="YYYY-MM-DD"
                    style={{ marginBottom: 0, width: "100%" }}
                  />
                </td>
                <th>{t("종료일자")}</th>
                <td>
                  <FormDatePicker
                    name="endDate"
                    label=""
                    format="YYYY-MM-DD"
                    style={{ marginBottom: 0, width: "100%" }}
                  />
                </td>
              </tr>

              {/* 네 번째 행: 사원번호, 영업사원여부, Mail ID(colspan=3) */}
              <tr>
                <th>{t("사원번호")}</th>
                <td>
                  <FormInput
                    name="empyId"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("영업사원여부")}</th>
                <td>
                  <FormRadioGroup
                    name="ySale"
                    label=""
                    options={yesNoOptions}
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <td colSpan={3}>
                  <FormInput
                    name="emailId"
                    label=""
                    placeholder={t("Mail ID")}
                    style={{ marginBottom: 0 }}
                  />
                </td>
              </tr>

              {/* 다섯 번째 행: 사용자약어, 구매요청권한, E-Mail 수신, 인사담당자 여부 */}
              <tr>
                <th>{t("사용자약어")}</th>
                <td>
                  <FormInput
                    name="empAbbName"
                    label=""
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("구매요청권한")}</th>
                <td>
                  <FormSelect
                    name="purreqRole"
                    label=""
                    options={purreqRoleOptions}
                    allowClear
                    style={{ marginBottom: 0, width: "100%" }}
                  />
                </td>
                <th>{t("E-Mail 수신")}</th>
                <td>
                  <FormRadioGroup
                    name="emailReceiveYn"
                    label=""
                    options={yesNoOptions}
                    style={{ marginBottom: 0 }}
                  />
                </td>
                <th>{t("인사담당자 여부")}</th>
                <td>
                  <FormRadioGroup
                    name="insaDeptChgYn"
                    label=""
                    options={yesNoOptions}
                    style={{ marginBottom: 0 }}
                  />
                </td>
              </tr>

              {/* 여섯 번째 행: 소속사업장, 구매결의권한, 전자결재 사용 */}
              <tr>
                <th>{t("소속사업장")}</th>
                <td>
                  <FormSelect
                    name="officeId"
                    label=""
                    options={orgList}
                    allowClear
                    style={{ marginBottom: 0, width: "100%" }}
                  />
                </td>
                <th>{t("구매결의권한")}</th>
                <td>
                  <FormSelect
                    name="purkpoRole"
                    label=""
                    options={purkpoRoleOptions}
                    allowClear
                    style={{ marginBottom: 0, width: "100%" }}
                  />
                </td>
                <th>{t("전자결재 사용")}</th>
                <td>
                  <Space.Compact style={{ width: "100%" }}>
                    <FormInput
                      name="applUseYn"
                      label=""
                      disabled
                      style={{ flex: 1, marginBottom: 0 }}
                    />
                    <Button
                      type="primary"
                      onClick={handleApplUseYnChange}
                      disabled={!selectedUser || selectedUser.rowStatus === "C"}
                    >
                      {applUseYnButtonText}
                    </Button>
                  </Space.Compact>
                </td>
                <th></th>
                <td></td>
              </tr>

              {/* 일곱 번째 행: 종 사업장, 구매담당여부, 근무장소 */}
              <tr>
                <th>{t("종 사업장")}</th>
                <td>
                  <FormSelect
                    name="subOrgId"
                    label=""
                    options={orgList}
                    allowClear
                    style={{ marginBottom: 0, width: "100%" }}
                  />
                </td>
                <th>{t("구매담당여부")}</th>
                <td>
                  <FormSelect
                    name="buyerYn"
                    label=""
                    options={buyerYnOptions}
                    allowClear
                    style={{ marginBottom: 0, width: "100%" }}
                  />
                </td>
                <th>{t("근무장소")}</th>
                <td>
                  <FormSelect
                    name="workPlace"
                    label=""
                    options={orgList}
                    allowClear
                    style={{ marginBottom: 0, width: "100%" }}
                  />
                </td>
                <th></th>
                <td></td>
                <th></th>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </Form>

      {/* 부서 검색 모달 */}
      <Modal
        title={t("부서조회")}
        open={deptModalVisible}
        onCancel={() => setDeptModalVisible(false)}
        footer={null}
        width={600}
      >
        <div style={{ marginBottom: 16 }}>
          <Space.Compact style={{ width: "100%" }}>
            <Input
              placeholder={t("부서코드 또는 부서명")}
              value={deptSearchText}
              onChange={(e) => setDeptSearchText(e.target.value)}
              onPressEnter={handleDeptSearchExecute}
              style={{ flex: 1 }}
            />
            <Button
              type="primary"
              icon={<SearchOutlined />}
              onClick={handleDeptSearchExecute}
              loading={deptLoading}
            >
              {t("조회")}
            </Button>
          </Space.Compact>
        </div>
        <Table
          columns={deptColumns}
          dataSource={deptList}
          loading={deptLoading}
          rowKey="deptCde"
          pagination={{ pageSize: 10 }}
          onRow={(record) => ({
            onDoubleClick: () => handleDeptSelect(record),
          })}
        />
        <div style={{ marginTop: 16, textAlign: "right" }}>
          <Button onClick={() => setDeptModalVisible(false)}>
            {t("취소")}
          </Button>
        </div>
      </Modal>
    </UserDetailPanelStyles>
  );
};

export default UserDetailPanel;
