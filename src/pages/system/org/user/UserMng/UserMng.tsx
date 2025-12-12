// ============================================================================
// 사용자 관리 페이지 (UserMng)
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import React, { useState, useEffect, useCallback, useRef } from "react";
import { Form, message } from "antd";
import { UserGrid, type UserGridRef } from "@components/features/system/org/user/UserMng";
import {
  FormSelect,
  FormInput,
  SearchActions,
} from "@components/ui/form";
import { confirm } from "@components/ui/feedback/Message";
import ListDetailLayout from "@components/ui/layout/ListDetailLayout/ListDetailLayout";
import { UserDetailPanel } from "@components/features/system/org/user/UserMng";
import { getCodeDetailApi } from "@apis/comCode";
import {
  getAllUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  type UserDto,
  type UserSearchRequest,
} from "@apis/system/user/userApi";
import { uploadFileApi, createEatKeyApi } from "@apis/system/file/fileApi";
import { getAllOrgListApi } from "@apis/system/common/listApi";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@store/authStore";
import dayjs from "dayjs";
import { FilterPanelWrapper, UserMngLayoutWrapper } from "./UserMng.styles";

// ============================================================================
// Component
// ============================================================================
const UserMng: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [detailForm] = Form.useForm();
  const [userList, setUserList] = useState<UserDto[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserDto | null>(null);
  const [orgList, setOrgList] = useState<Array<{ value: string; label: string }>>([]);
  const [positionList, setPositionList] = useState<Array<{ value: string; label: string }>>([]);
  const [searchParams, setSearchParams] = useState<UserSearchRequest>({
    asType: "2", // 기본값: 성명
    asName: undefined,
    asUseYn: "%", // 기본값: 전체
  });
  const [isModified, setIsModified] = useState(false);
  const [loading, setLoading] = useState(false);
  const gridRef = useRef<UserGridRef | null>(null);
  const [searchExpanded, setSearchExpanded] = useState(false);
  const [, setPendingFileInfo] = useState<{ file: File; eatKey: number | null; empCode: string } | null>(null);
  const [, setPendingDeleteInfo] = useState<{ eatKey: number; eatIdx: string; empCode: string } | null>(null);
  const pendingFileInfoRef = useRef<{ file: File; eatKey: number | null; empCode: string } | null>(null);
  const pendingDeleteInfoRef = useRef<{ eatKey: number; eatIdx: string; empCode: string } | null>(null);

  // 사용자 목록 조회
  const fetchUserList = useCallback(async () => {
    try {
      setLoading(true);
      
      // ASIS의 검색 타입에 맞춰 변환
      let empName: string | undefined;
      let department: string | undefined;
      let empCode: string | undefined;
      
      if (searchParams.asType === "2") { // 성명
        empName = searchParams.asName;
      } else if (searchParams.asType === "1") { // 부서
        department = searchParams.asName;
      } else if (searchParams.asType === "3") { // 사번
        empCode = searchParams.asName;
      }
      
      const useYn = searchParams.asUseYn === "%" ? "%" : searchParams.asUseYn;
      
      const response = await getAllUsersApi({
        empName,
        department,
        empCode,
        useYn,
      });
      
      if (response.success) {
        const data = Array.isArray(response.data) ? response.data : [];
        
        const dataWithId = data.map((item, index) => ({
          ...item,
          id: `${item.empCode}_${index}`,
          rowStatus: undefined,
        }));
        setUserList(dataWithId);
        
        // 선택된 사용자가 있으면 새로 로드된 데이터로 업데이트
        // setSelectedUser의 함수형 업데이트를 사용하여 최신 selectedUser 참조
        setSelectedUser((prevSelectedUser) => {
          if (prevSelectedUser) {
            const updatedSelectedUser = dataWithId.find(
              (item) => item.empCode === prevSelectedUser.empCode
            );
            if (updatedSelectedUser) {
              return { ...updatedSelectedUser };
            } else {
              // 선택된 사용자가 새 데이터에 없으면 선택 해제
              return null;
            }
          }
          return prevSelectedUser;
        });
      } else {
        setUserList([]);
        setSelectedUser(null);
      }
    } catch (error) {
      console.error("사용자 목록 조회 실패:", error);
      message.error(t("MSG_SY_0064"));
      setUserList([]);
    } finally {
      setLoading(false);
    }
  }, [searchParams, t]);

  // 검색 핸들러
  const handleSearch = useCallback(() => {
    const formValues = form.getFieldsValue();
    setSearchParams({
      asType: formValues.searchType || "2",
      asName: formValues.searchName || undefined,
      asUseYn: formValues.useYn || "%",
    });
  }, [form]);

  // 초기화 핸들러
  const handleReset = useCallback(() => {
    form.resetFields();
    form.setFieldsValue({
      searchType: "2",
      useYn: "%",
    });
    setSearchParams({
      asType: "2",
      asName: undefined,
      asUseYn: "%",
    });
  }, [form]);

  // 입력 핸들러
  const handleInsert = useCallback((gridApi: any) => {
    if (!gridApi) return;
    
    const currentData = gridRef.current?.getGridData() || [];
    const newRow: UserDto & { id?: string } = {
      empCode: "",
      empName: "",
      officeId: "",
      useYn: "Y",
      ySale: "N", // AS-IS: 영업사원여부 기본값 'N'
      rowStatus: "C",
      id: `new_${Date.now()}`,
    };
    
    setUserList([newRow, ...currentData]);
    setIsModified(true);
  }, []);

  // 삭제 핸들러
  const handleDelete = useCallback((gridApi: any) => {
    if (!gridApi) return;

    const selectedRows = gridApi.getSelectedRows() as (UserDto & { id?: string })[];
    if (selectedRows.length === 0) {
      message.warning(t("MSG_SY_0043"));
      return;
    }

    confirm({
      title: t("MSG_SY_0039"),
      content: t("MSG_SY_0040"),
      okText: t("확인"),
      cancelText: t("취소"),
      onOk: () => {
        const currentData = gridRef.current?.getGridData() || [];
        const updatedData = currentData
          .map((row) => {
            const isSelected = selectedRows.some((selected) => selected.empCode === row.empCode);
            if (isSelected) {
              if (row.rowStatus === "C") {
                return null;
              } else {
                return { ...row, rowStatus: "D" };
              }
            }
            return row;
          })
          .filter((row) => row !== null) as UserDto[];

        setUserList(updatedData);
        setIsModified(true);
      },
    });
  }, [t]);

  // 저장 핸들러
  const handleSave = useCallback(async () => {
    if (!gridRef.current) {
      message.warning(t("MSG_SY_0044"));
      return;
    }

    if (!isModified) {
      message.info(t("MSG_SY_0045"));
      return;
    }

    confirm({
      title: t("MSG_SY_0046"),
      content: t("MSG_SY_0047"),
      okText: t("저장"),
      cancelText: t("취소"),
      onOk: async () => {
        try {
          setLoading(true);
          const currentData = gridRef.current?.getGridData() || [];
          
          // 저장 시점의 pendingFileInfo와 pendingDeleteInfo를 ref에서 가져옴 (클로저 문제 방지)
          const currentPendingFileInfo = pendingFileInfoRef.current;
          const currentPendingDeleteInfo = pendingDeleteInfoRef.current;
          
          // 저장할 데이터 준비
          const saveItems = currentData
            .filter((row) => {
              return row.rowStatus === "C" || row.rowStatus === "U" || row.rowStatus === "D";
            });

          if (saveItems.length === 0) {
            message.warning(t("MSG_SY_0048"));
            return;
          }

          // 각 항목별로 API 호출
          let successCount = 0;
          let errorCount = 0;

          for (const item of saveItems) {
            try {
              // empImgId 초기화: 파일 업로드/삭제 처리 후 결정
              let finalEmpImgId: string | undefined = undefined;
              
              // 디버깅: pendingFileInfo 확인
              console.log("저장 처리 시작:", {
                itemEmpCode: item.empCode,
                pendingFileInfo: currentPendingFileInfo ? {
                  empCode: currentPendingFileInfo.empCode,
                  hasFile: !!currentPendingFileInfo.file,
                  eatKey: currentPendingFileInfo.eatKey
                } : null,
                pendingDeleteInfo: currentPendingDeleteInfo
              });
              
              // 파일 삭제 여부를 추적하는 플래그
              let fileDeleted = false;
              
              // 삭제 대기 중인 파일이 있고, 현재 항목과 일치하면 파일 삭제
              // 삭제와 업로드가 모두 있는 경우, 삭제를 먼저 처리
              if (currentPendingDeleteInfo && currentPendingDeleteInfo.empCode === item.empCode) {
                try {
                  console.log("기존 파일 삭제 시작:", {
                    empCode: item.empCode,
                    eatKey: currentPendingDeleteInfo.eatKey,
                    eatIdx: currentPendingDeleteInfo.eatIdx
                  });
                  
                  const { deleteFileApi } = await import("@apis/system/file/fileApi");
                  await deleteFileApi(currentPendingDeleteInfo.eatKey, currentPendingDeleteInfo.eatIdx);
                  
                  console.log("기존 파일 삭제 성공");
                  
                  // 삭제 성공 플래그 설정
                  fileDeleted = true;
                  
                  // 삭제 성공 후 대기 정보 초기화
                  setPendingDeleteInfo(null);
                  pendingDeleteInfoRef.current = null;
                  
                  // 삭제 후에는 finalEmpImgId를 null로 설정 (업로드가 있으면 업로드 후 덮어씀)
                  // 업로드가 없으면 null로 유지하여 DB에서 NULL로 업데이트
                  if (!currentPendingFileInfo || currentPendingFileInfo.empCode !== item.empCode) {
                    finalEmpImgId = null as any; // null로 설정하여 DB에서 NULL로 업데이트
                    console.log("파일 삭제 후 finalEmpImgId를 null로 설정:", finalEmpImgId);
                  }
                } catch (deleteError) {
                  console.error(`파일 삭제 실패 (${item.empCode}):`, deleteError);
                  message.error(`파일 삭제 실패: ${deleteError instanceof Error ? deleteError.message : String(deleteError)}`);
                  // 파일 삭제 실패해도 사용자 정보는 저장 시도
                }
              }
              
              // 저장 대기 중인 파일이 있고, 현재 항목과 일치하면 파일 업로드
              if (currentPendingFileInfo) {
                console.log("pendingFileInfo 확인:", {
                  pendingEmpCode: currentPendingFileInfo.empCode,
                  itemEmpCode: item.empCode,
                  isMatch: currentPendingFileInfo.empCode === item.empCode
                });
                
                if (currentPendingFileInfo.empCode === item.empCode) {
                  try {
                    console.log("파일 업로드 시작:", {
                      empCode: item.empCode,
                      fileName: currentPendingFileInfo.file.name,
                      currentEatKey: currentPendingFileInfo.eatKey
                    });
                    
                    // EAT_KEY가 없으면 생성 (저장 시에만 생성)
                    let finalEatKey = currentPendingFileInfo.eatKey;
                    if (!finalEatKey) {
                      console.log("EAT_KEY 생성 시작");
                      const eatKeyResponse = await createEatKeyApi("00051"); // ASIS에서 사용하는 이미지 키
                      if (eatKeyResponse.success && eatKeyResponse.data) {
                        finalEatKey = eatKeyResponse.data;
                        console.log("EAT_KEY 생성 성공:", finalEatKey);
                      } else {
                        throw new Error("EAT_KEY 생성 실패");
                      }
                    }
                    
                    // 파일 업로드
                    console.log("파일 업로드 API 호출:", {
                      eatKey: finalEatKey,
                      fileName: currentPendingFileInfo.file.name
                    });
                    const uploadResponse = await uploadFileApi(currentPendingFileInfo.file, {
                      eatKey: finalEatKey,
                    });
                    
                    console.log("파일 업로드 응답:", uploadResponse);
                    
                    if (uploadResponse.success) {
                      // 파일 업로드 성공 시 empImgId 설정
                      finalEmpImgId = finalEatKey.toString();
                      console.log("파일 업로드 성공, finalEmpImgId:", finalEmpImgId);
                      // 파일 업로드 성공 후 대기 정보 초기화
                      setPendingFileInfo(null);
                      pendingFileInfoRef.current = null;
                    } else {
                      throw new Error("파일 업로드 실패");
                    }
                  } catch (uploadError) {
                    console.error(`파일 업로드 실패 (${item.empCode}):`, uploadError);
                    message.error(`파일 업로드 실패: ${uploadError instanceof Error ? uploadError.message : String(uploadError)}`);
                    // 파일 업로드 실패 시에도 사용자 정보는 저장 시도 (finalEmpImgId는 기존 값 유지)
                  }
                } else {
                  console.warn("pendingFileInfo의 empCode가 일치하지 않음:", {
                    pendingEmpCode: currentPendingFileInfo.empCode,
                    itemEmpCode: item.empCode
                  });
                }
              } else {
                console.log("pendingFileInfo가 없음");
              }
              
              // 파일 삭제가 있었고 업로드가 없었으면 finalEmpImgId는 이미 null로 설정됨
              // 파일 업로드/삭제가 없으면 기존 empImgId 유지 (PENDING이 아닌 경우만)
              // 단, 파일 삭제가 있었으면 기존 값을 유지하지 않음
              if (!fileDeleted && finalEmpImgId === undefined && item.empImgId && item.empImgId !== 'PENDING') {
                // 숫자로 변환 가능한 경우에만 사용
                const empImgIdNum = typeof item.empImgId === 'string' 
                  ? parseInt(item.empImgId, 10) 
                  : item.empImgId;
                if (!isNaN(empImgIdNum) && empImgIdNum > 0) {
                  finalEmpImgId = empImgIdNum.toString();
                }
              }
              
              // 날짜 형식 변환 함수
              const formatDate = (dateValue: any): string | undefined => {
                if (!dateValue) return undefined;
                // dayjs 객체인 경우
                if (dayjs.isDayjs(dateValue)) {
                  return dateValue.format('YYYY-MM-DD');
                }
                // 문자열인 경우 (이미 YYYY-MM-DD 형식일 수 있음)
                if (typeof dateValue === 'string') {
                  // 빈 문자열이면 undefined 반환
                  if (dateValue.trim() === '') return undefined;
                  // dayjs로 파싱 가능한지 확인
                  const parsed = dayjs(dateValue);
                  if (parsed.isValid()) {
                    return parsed.format('YYYY-MM-DD');
                  }
                  // 이미 YYYY-MM-DD 형식인 경우 그대로 반환
                  return dateValue;
                }
                return undefined;
              };
              
              const formattedStartDate = formatDate(item.startDate);
              const formattedEndDate = formatDate(item.endDate);
              
              if (item.rowStatus === "D") {
                // 삭제
                await deleteUserApi(item.empCode);
                successCount++;
              } else if (item.rowStatus === "C") {
                // 생성
                await createUserApi({
                  rowStatus: "C",
                  officeId: item.officeId,
                  empCode: item.empCode,
                  empName: item.empName,
                  deptCode: item.deptCode,
                  password: item.password || "",
                  useYn: item.useYn || "Y",
                  emailId: item.emailId,
                  empAbbName: item.empAbbName,
                  acpayRole: item.acpayRole,
                  purreqRole: item.purreqRole,
                  purkpoRole: item.purkpoRole,
                  applUseYn: item.applUseYn,
                  buyerYn: item.buyerYn,
                  lockYn: item.lockYn,
                  pstnCode: item.pstnCode,
                  emailReceiveYn: item.emailReceiveYn,
                  startDate: formattedStartDate,
                  endDate: formattedEndDate,
                  empyId: item.empyId,
                  ySale: item.ySale !== undefined && item.ySale !== null && item.ySale !== "" ? item.ySale : "N", // AS-IS: 영업사원여부 기본값 'N'
                  divisionRole: item.divisionRole,
                  insaDeptChgYn: item.insaDeptChgYn,
                  orgId: item.orgId, // AS-IS: 소속사업장은 ORG_ID 사용
                  workPlace: item.workPlace, // AS-IS: 근무장소는 WORK_PLACE 사용
                  subOrgId: item.subOrgId,
                  empImgId: finalEmpImgId,
                });
                successCount++;
              } else if (item.rowStatus === "U") {
                // 수정
                await updateUserApi(item.empCode, {
                  rowStatus: "U",
                  officeId: item.officeId,
                  empCode: item.empCode,
                  empName: item.empName,
                  deptCode: item.deptCode,
                  password: item.password,
                  useYn: item.useYn,
                  emailId: item.emailId,
                  empAbbName: item.empAbbName,
                  acpayRole: item.acpayRole,
                  purreqRole: item.purreqRole,
                  purkpoRole: item.purkpoRole,
                  applUseYn: item.applUseYn,
                  buyerYn: item.buyerYn,
                  lockYn: item.lockYn,
                  pstnCode: item.pstnCode,
                  emailReceiveYn: item.emailReceiveYn,
                  startDate: formattedStartDate,
                  endDate: formattedEndDate,
                  empyId: item.empyId,
                  ySale: item.ySale !== undefined && item.ySale !== null && item.ySale !== "" ? item.ySale : "N", // AS-IS: 영업사원여부 기본값 'N'
                  divisionRole: item.divisionRole,
                  insaDeptChgYn: item.insaDeptChgYn,
                  orgId: item.orgId, // AS-IS: 소속사업장은 ORG_ID 사용
                  workPlace: item.workPlace, // AS-IS: 근무장소는 WORK_PLACE 사용
                  subOrgId: item.subOrgId,
                  empImgId: finalEmpImgId,
                });
                successCount++;
              }
            } catch (error) {
              console.error(`사용자 ${item.empCode} 저장 실패:`, error);
              errorCount++;
            }
          }

          if (errorCount === 0) {
            message.success(t("MSG_SY_0049"));
            setIsModified(false);
            // 파일 업로드/삭제 정보 초기화
            setPendingFileInfo(null);
            setPendingDeleteInfo(null);
            pendingFileInfoRef.current = null;
            pendingDeleteInfoRef.current = null;
            
            // 저장 전 선택된 사용자 정보 저장
            const savedSelectedEmpCode = selectedUser?.empCode;
            
            await fetchUserList();
            
            // 저장 후 선택된 행 정보로 하단 사용자 정보 업데이트
            if (savedSelectedEmpCode) {
              const gridApi = gridRef.current?.getGridApi();
              const updatedData = gridRef.current?.getGridData() || [];
              const updatedSelectedUser = updatedData.find(
                (row) => row.empCode === savedSelectedEmpCode
              );
              
              if (updatedSelectedUser && gridApi) {
                // 그리드 선택 상태 복원
                setTimeout(() => {
                  gridApi.forEachNode((node) => {
                    if (node.data?.empCode === savedSelectedEmpCode) {
                      node.setSelected(true);
                    } else {
                      node.setSelected(false);
                    }
                  });
                  
                  // 하단 사용자 정보 업데이트
                  setSelectedUser({ ...updatedSelectedUser });
                }, 100);
              }
            }
          } else {
            message.warning(`${successCount}건 성공, ${errorCount}건 실패`);
            await fetchUserList();
          }
        } catch (error) {
          message.error(t("MSG_SY_0050"));
        } finally {
          setLoading(false);
        }
      },
    });
  }, [isModified, fetchUserList, t]);

  // 검색 영역 키업 핸들러
  const handleSearchKeyUp = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  }, [handleSearch]);
  
  // 확장/접기 토글 핸들러
  const handleToggleExpand = useCallback(() => {
    setSearchExpanded((prev) => !prev);
  }, []);

  // 조직 목록 조회 (AS-IS selectCommonList의 ORG_ID_ALL 사용)
  const fetchOrgList = useCallback(async () => {
    if (!user?.officeId) return;
    
    try {
      // 공통 목록 조회 API를 사용하여 전체 사업장 목록 조회
      const response = await getAllOrgListApi({
        officeId: user.officeId,
      });
      
      if (response.success && response.data) {
        const options = response.data.map((item) => ({
          value: item.code || "",
          label: item.name || item.code || "",
        }));
        setOrgList(options);
      }
    } catch (error) {
      console.error("조직 목록 조회 실패:", error);
      setOrgList([]);
    }
  }, [user?.officeId]);

  // 직위 목록 조회
  const fetchPositionList = useCallback(async () => {
    try {
      const response = await getCodeDetailApi({
        module: "HR",
        type: "PSTNME",
        enabledFlag: "Y",
      });
      if (response.success && response.data) {
        const codeList = Array.isArray(response.data) ? response.data : [response.data];
        const options = codeList.map((item) => ({
          value: item.code || "",
          label: item.name1 || "",
        }));
        setPositionList(options);
      }
    } catch (error) {
      console.error("직위 목록 조회 실패:", error);
    }
  }, []);

  // 그리드 행 선택 핸들러
  const handleRowSelection = useCallback((selectedRows: UserDto[]) => {
    if (selectedRows.length > 0) {
      const newSelectedUser = selectedRows[0];
      
      // 현재 선택된 행이 수정 상태인지 확인
      const currentData = gridRef.current?.getGridData() || userList;
      const currentSelectedRow = currentData.find(
        (row) => row.empCode === (selectedUser?.empCode || newSelectedUser.empCode)
      );
      const isCurrentRowModified = currentSelectedRow && 
                                   (currentSelectedRow.rowStatus === "U" || 
                                    currentSelectedRow.rowStatus === "C" || 
                                    currentSelectedRow.rowStatus === "D");
      
      // 수정 상태인 다른 행이 있는지 확인
      const hasModifiedRow = currentData.some(
        (row) => row.empCode !== newSelectedUser.empCode && 
                 (row.rowStatus === "U" || row.rowStatus === "C" || row.rowStatus === "D")
      );
      
      // 현재 선택된 행이 수정 상태이거나 다른 수정 상태인 행이 있으면 다른 행 선택 방지
      if ((isCurrentRowModified || hasModifiedRow) && selectedUser && selectedUser.empCode !== newSelectedUser.empCode) {
        message.warning(t("수정 중인 행이 있어 다른 행을 선택할 수 없습니다."));
        // 이전 선택 상태로 복원
        const gridApi = gridRef.current?.getGridApi();
        if (gridApi && selectedUser) {
          setTimeout(() => {
            gridApi.forEachNode((node) => {
              if (node.data?.empCode === selectedUser.empCode) {
                node.setSelected(true);
              } else {
                node.setSelected(false);
              }
            });
          }, 0);
        }
        return;
      }
      
      // 그리드의 최신 데이터에서 선택된 행 찾기
      const latestSelectedUser = currentData.find(
        (row) => row.empCode === newSelectedUser.empCode
      ) || newSelectedUser;
      
      // 다른 사용자 선택 시 대기 중인 파일 정보 초기화
      const prevEmpCode = selectedUser?.empCode;
      if (!prevEmpCode || prevEmpCode !== latestSelectedUser.empCode) {
        setPendingFileInfo(null);
        setPendingDeleteInfo(null);
        pendingFileInfoRef.current = null;
        pendingDeleteInfoRef.current = null;
      }
      
      // 선택된 행의 데이터를 깊은 복사하여 사용 (그리드의 최신 데이터 보장)
      // selectedUser의 모든 필드를 보존하면서 최신 데이터로 업데이트
      setSelectedUser((prevSelectedUser) => {
        if (prevSelectedUser && prevSelectedUser.empCode === latestSelectedUser.empCode) {
          // 같은 사용자면 기존 필드 보존하면서 업데이트
          return { ...prevSelectedUser, ...latestSelectedUser };
        }
        // 다른 사용자면 완전히 교체
        return { ...latestSelectedUser };
      });
    } else {
      setSelectedUser(null);
      setPendingFileInfo(null);
      setPendingDeleteInfo(null);
      pendingFileInfoRef.current = null;
      pendingDeleteInfoRef.current = null;
    }
  }, [selectedUser, userList, t]);

  // 상세 폼 값 변경 핸들러
  const handleDetailFormValuesChange = useCallback(
    (_changedValues: any, allValues: any) => {
      // allValues에서 empCode 가져오기 (필수 필드)
      const targetEmpCode = allValues?.empCode || selectedUser?.empCode;
      if (!targetEmpCode) {
        // empCode가 없으면 무시 (유효하지 않은 데이터)
        // console.warn 제거 (부서 검색 등에서 empCode가 없는 경우가 정상)
        return;
      }
      
      // 현재 선택된 사용자와 일치하는지 확인
      if (selectedUser && selectedUser.empCode !== targetEmpCode) {
        // 다른 사용자의 데이터 변경은 무시
        console.warn("Form values change for different user");
        return;
      }
      
      // 그리드 데이터 업데이트
      const currentData = gridRef.current?.getGridData() || [];
      const updatedData = currentData.map((row) => {
        if (row.empCode === targetEmpCode) {
          // 그리드 행의 기본 정보를 유지하면서 변경된 값만 업데이트
          const updatedRow = { 
            ...row, 
            // allValues의 필드만 업데이트 (selectedUser의 모든 필드 보존)
            ...allValues,
            // 필수 필드 보존 (그리드 행의 원본 데이터 유지)
            empCode: row.empCode,
            // AS-IS: 소속사업장은 ORG_ID 사용, 근무장소는 WORK_PLACE 사용
            orgId: allValues.orgId || row.orgId,
            workPlace: allValues.workPlace || row.workPlace,
            officeId: row.officeId || allValues.officeId, // 백엔드 호환성을 위해 유지
            // ySale 값 명시적으로 반영 (상세 패널에서 변경한 값 우선)
            ySale: allValues.ySale !== undefined && allValues.ySale !== null ? allValues.ySale : row.ySale || "N",
          };
          // empImgId가 변경되었거나 추가되었으면 무조건 수정 상태로 표시
          if (_changedValues?.empImgId !== undefined || allValues?.empImgId !== undefined) {
            updatedRow.rowStatus = "U";
          } else if (!updatedRow.rowStatus || updatedRow.rowStatus === undefined) {
            updatedRow.rowStatus = "U";
          }
          
          // ySale이 변경되었고 현재 선택된 사용자와 일치하면 selectedUser도 업데이트
          if (_changedValues?.ySale !== undefined && selectedUser && selectedUser.empCode === targetEmpCode) {
            setSelectedUser((prev) => {
              if (prev && prev.empCode === targetEmpCode) {
                return { ...prev, ySale: updatedRow.ySale };
              }
              return prev;
            });
          }
          
          return updatedRow;
        }
        return row;
      });
      setUserList(updatedData);
      
      // 그리드의 선택 상태를 유지하기 위해 현재 선택된 행을 다시 선택
      const gridApi = gridRef.current?.getGridApi();
      if (gridApi && targetEmpCode) {
        setTimeout(() => {
          gridApi.forEachNode((node) => {
            if (node.data?.empCode === targetEmpCode) {
              node.setSelected(true);
            } else {
              node.setSelected(false);
            }
          });
        }, 0);
      }
      
      setIsModified(true);
    },
    [selectedUser]
  );

  // 파일 업로드 준비 핸들러
  const handleFileUploadReady = useCallback((file: File | null, eatKey: number | null) => {
    // 현재 선택된 사용자 정보를 그리드에서 가져옴
    const gridApi = gridRef.current?.getGridApi();
    const selectedRows = gridApi?.getSelectedRows() as UserDto[] | undefined;
    const currentSelectedUser = selectedRows && selectedRows.length > 0 ? selectedRows[0] : selectedUser;
    
    console.log("handleFileUploadReady 호출:", {
      hasFile: !!file,
      fileName: file?.name,
      eatKey: eatKey,
      currentSelectedUser: currentSelectedUser ? {
        empCode: currentSelectedUser.empCode,
        empName: currentSelectedUser.empName
      } : null,
      selectedRowsCount: selectedRows?.length || 0
    });
    
    if (currentSelectedUser && file) {
      // eatKey가 null이어도 저장 시 생성하므로 파일 정보만 저장
      const fileInfo = { file, eatKey: eatKey || null, empCode: currentSelectedUser.empCode };
      console.log("pendingFileInfo 설정:", fileInfo);
      setPendingFileInfo(fileInfo);
      pendingFileInfoRef.current = fileInfo; // ref에도 저장
    } else {
      console.log("pendingFileInfo 초기화 (파일 또는 사용자 없음)");
      setPendingFileInfo(null);
      pendingFileInfoRef.current = null;
    }
  }, [selectedUser]);

  // 파일 삭제 준비 핸들러
  const handleFileDeleteReady = useCallback((eatKey: number | null, eatIdx: string | null) => {
    // 현재 선택된 사용자 정보를 그리드에서 가져옴
    const gridApi = gridRef.current?.getGridApi();
    const selectedRows = gridApi?.getSelectedRows() as UserDto[] | undefined;
    const currentSelectedUser = selectedRows && selectedRows.length > 0 ? selectedRows[0] : selectedUser;
    
    console.log("handleFileDeleteReady 호출:", {
      eatKey: eatKey,
      eatIdx: eatIdx,
      currentSelectedUser: currentSelectedUser ? {
        empCode: currentSelectedUser.empCode,
        empName: currentSelectedUser.empName
      } : null
    });
    
    if (currentSelectedUser && eatKey && eatIdx) {
      const deleteInfo = { eatKey, eatIdx, empCode: currentSelectedUser.empCode };
      console.log("pendingDeleteInfo 설정:", deleteInfo);
      setPendingDeleteInfo(deleteInfo);
      pendingDeleteInfoRef.current = deleteInfo; // ref에도 저장
    } else {
      console.log("pendingDeleteInfo 초기화 (eatKey 또는 eatIdx 없음)");
      setPendingDeleteInfo(null);
      pendingDeleteInfoRef.current = null;
    }
  }, [selectedUser]);

  // 초기 로드
  useEffect(() => {
    form.setFieldsValue({
      searchType: "2",
      useYn: "%",
    });
    fetchOrgList();
    fetchPositionList();
  }, [form, fetchOrgList, fetchPositionList]);

  // 검색 파라미터 변경 시 목록 조회
  useEffect(() => {
    fetchUserList();
  }, [fetchUserList]);

  // 검색 타입 옵션
  const searchTypeOptions = [
    { value: "2", label: t("성명") },
    { value: "1", label: t("부서") },
    { value: "3", label: t("사번") },
  ];

  // 사용여부 옵션
  const useYnOptions = [
    { value: "Y", label: t("Yes") },
    { value: "N", label: t("No") },
    { value: "%", label: t("전체") },
  ];

  return (
    <UserMngLayoutWrapper>
      <ListDetailLayout
        filterPanel={
          <FilterPanelWrapper className="page-layout__filter-panel">
            <Form form={form} layout="inline" className="filter-panel__form">
              <FormSelect
                name="searchType"
                label={t("검색타입")}
                options={searchTypeOptions}
                useModalMessage={false}
                style={{ width: "120px" }}
              />
              <FormInput
                name="searchName"
                label={t("검색어")}
                onKeyUp={handleSearchKeyUp}
                placeholder={t("검색어")}
                useModalMessage={false}
                style={{ width: "200px" }}
              />
              <FormSelect
                name="useYn"
                label={t("사용여부")}
                options={useYnOptions}
                useModalMessage={false}
                style={{ width: "120px" }}
              />
            </Form>
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
          <UserGrid
            ref={gridRef}
            rowData={userList}
            loading={loading}
            onModify={(modified) => setIsModified(modified)}
            onAddRow={handleInsert}
            onDeleteRow={handleDelete}
            onSave={handleSave}
            isModified={isModified}
            totalCount={userList.length}
            onRowSelection={handleRowSelection}
            orgList={orgList}
          />
        }
        detailBottomPanel={
          <UserDetailPanel
            selectedUser={selectedUser}
            form={detailForm}
            onValuesChange={handleDetailFormValuesChange}
            orgList={orgList}
            positionList={positionList}
            onFileUploadReady={handleFileUploadReady}
            onFileDeleteReady={handleFileDeleteReady}
          />
        }
      />
    </UserMngLayoutWrapper>
  );
};

export default UserMng;

