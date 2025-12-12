// ============================================================================
// Import
// ============================================================================
import React, { useState, useCallback, useRef, useEffect } from "react";
import TwoGridLayout from "@/components/ui/layout/TwoGridLayout";
import {
    FilterPanel,
    LeftGrid,
    RightGrid,
} from "@components/features/system/org/companyuser/CompanyUserMng";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@store/authStore";
import {
    getCompanyUserHeaderListApi,
    getCompanyUserDetailListApi,
    saveCompanyUserDetailListApi,
    type CompanyUserHeaderDto,
    type CompanyUserDetailDto,
} from "@apis/system/org/companyUserApi";
import { showSuccess, showError, showWarning } from "@components/ui/feedback/Message";

// ============================================================================
// Component
// ============================================================================
/**
 * 회사사용자관리 페이지
 * - 변경이력: 2025.12.12 : ckkim (최초작성 - WorkplaceUserMng 참조)
 */

// ============================================================================
// Component
// ============================================================================
const CompanyUserMng: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuthStore();
    const [headerList, setHeaderList] = useState<CompanyUserHeaderDto[]>([]);
    const [detailList, setDetailList] = useState<CompanyUserDetailDto[]>([]);
    const [selectedHeader, setSelectedHeader] = useState<CompanyUserHeaderDto | null>(null);
    const [loading, setLoading] = useState(false);
    const filterPanelRef = useRef<{ handleSearch: () => Promise<{ type?: string; name?: string; useYn?: string }> } | null>(null);

    // 헤더 목록 조회
    const loadHeaderList = useCallback(
        async (searchParams?: {
            type?: string;
            name?: string;
            useYn?: string;
        }) => {
            if (!user?.officeId) {
                showError(t("MSG_SY_0104")); // 회사코드가 없습니다.
                return;
            }

            setLoading(true);
            try {
                const response = await getCompanyUserHeaderListApi({
                    officeId: user.officeId,
                    type: searchParams?.type || "2",
                    name: searchParams?.name || "",
                    useYn: searchParams?.useYn, // 기본값 제거하여 실제 선택된 값 사용
                });

                if (response.success && response.data) {
                    setHeaderList(response.data);
                    // 첫 번째 행 선택
                    if (response.data.length > 0) {
                        setSelectedHeader(response.data[0]);
                        loadDetailList(response.data[0].empCode || "");
                    } else {
                        setSelectedHeader(null);
                        setDetailList([]);
                    }
                } else {
                    setHeaderList([]);
                    setSelectedHeader(null);
                    setDetailList([]);
                }
            } catch (error) {
                console.error("헤더 목록 조회 실패:", error);
                showError(t("MSG_SY_0105")); // 조회에 실패했습니다.
            } finally {
                setLoading(false);
            }
        },
        [user?.officeId, t]
    );

    // 상세 목록 조회
    const loadDetailList = useCallback(
        async (empyId: string) => {
            if (!user?.officeId || !empyId) {
                setDetailList([]);
                return;
            }

            try {
                const response = await getCompanyUserDetailListApi({
                    officeId: user.officeId,
                    empCode: empyId,
                });

                if (response.success && response.data) {
                    setDetailList(response.data);
                } else {
                    setDetailList([]);
                }
            } catch (error) {
                console.error("상세 목록 조회 실패:", error);
                setDetailList([]);
            }
        },
        [user?.officeId]
    );

    // 헤더 행 선택 변경
    const handleHeaderSelectionChanged = useCallback(
        (selectedRow: CompanyUserHeaderDto | null) => {
            setSelectedHeader(selectedRow);
            if (selectedRow?.empCode) {
                loadDetailList(selectedRow.empCode);
            } else {
                setDetailList([]);
            }
        },
        [loadDetailList]
    );

    // 상세 데이터 변경
    const handleDetailDataChange = useCallback((data: CompanyUserDetailDto[]) => {
        setDetailList(data);
    }, []);

    // 저장
    const handleSave = useCallback(async (dataToSave?: CompanyUserDetailDto[]) => {
        if (!user?.officeId || !selectedHeader?.empCode) {
            showWarning(t("MSG_SY_0005")); // 저장할 데이터가 없습니다.
            return;
        }

        // RightGrid에서 전달받은 데이터 또는 현재 detailList 사용
        const targetData = dataToSave || detailList;

        // 검증을 위해 삭제되지 않은 모든 데이터 추출
        const activeData = targetData.filter((item) => item.rowStatus !== "D");

        // 변경된 데이터만 필터링 (저장용)
        const changedData = targetData.filter(
            (item) => item.rowStatus === "C" || item.rowStatus === "U" || item.rowStatus === "D"
        );

        if (changedData.length === 0) {
            showWarning(t("MSG_SY_0081")); // 저장할 데이터가 없습니다.
            return;
        }

        // 1. 검증: 중복된 항목 체크 (AS-IS 순서: 중복 -> Null/Primary)
        const orgIds = activeData.map((item) => item.authOfficeId).filter((id) => id);
        const uniqueOrgIds = new Set(orgIds);
        if (orgIds.length !== uniqueOrgIds.size) {
            showError(t("MSG_SY_0106")); // 중복된 회사(사업장)가 존재합니다.
            return;
        }

        // 2. 검증: 회사코드 Null 체크 및 Primary 개수 체크
        const hasNullOrgId = activeData.some(
            (item) => !item.authOfficeId || item.authOfficeId.trim() === ""
        );
        if (hasNullOrgId) {
            showError(t("MSG_CM_1295")); // 사업장코드(회사코드)를 입력하세요.
            return;
        }

        const primaryCount = activeData.filter((item) => item.primeYn === "Y").length;
        if (primaryCount !== 1) {
            showError(t("MSG_SY_0107")); // Primary 회사(사업장)는 반드시 하나 존재해야합니다.
            return;
        }

        // MULTI_ORG_YNO 설정 - 제거 (CompanyUser에는 해당 로직 없음)
        /* 
        if (activeData.length === 1) {
            activeData.forEach((item) => {
                item.multiOrgYno = "S";
            });
        } else {
            activeData.forEach((item) => {
                item.multiOrgYno = "M";
            });
        } 
        */

        setLoading(true);
        try {
            const response = await saveCompanyUserDetailListApi({
                detailList: changedData.map((item) => ({
                    ...item,
                    officeId: user.officeId,
                    empCode: selectedHeader.empCode,
                })),
            });

            if (response.success && response.data) {
                const result = response.data;
                if (result.deleteCount < 0) {
                    showSuccess(t("MSG_SY_0108")); // 정상적으로 삭제하였습니다.
                } else {
                    showSuccess(t("MSG_SY_0109")); // 저장 되었습니다.
                }

                // 재조회
                const savedEmpCode = selectedHeader.empCode;
                await loadHeaderList();
                // 저장된 사용자 선택
                const savedHeader = headerList.find((h) => h.empCode === savedEmpCode);
                if (savedHeader) {
                    setSelectedHeader(savedHeader);
                    loadDetailList(savedEmpCode);
                }
            } else {
                showError(t("MSG_SY_0110")); // 저장에 실패했습니다.
            }
        } catch (error) {
            console.error("저장 실패:", error);
            showError(t("MSG_SY_0110")); // 저장에 실패했습니다.
        } finally {
            setLoading(false);
        }
    }, [user?.officeId, selectedHeader, detailList, headerList, loadHeaderList, loadDetailList, t]);

    // 초기 로드
    useEffect(() => {
        if (user?.officeId) {
            loadHeaderList({ type: "2", name: "", useYn: "%" });
        }
    }, [user?.officeId, loadHeaderList]);

    // 검색 핸들러 (FilterPanel에서 호출)
    const handleSearch = useCallback(async (searchParams?: { type?: string; name?: string; useYn?: string }) => {
        setLoading(true);
        try {
            if (searchParams) {
                await loadHeaderList(searchParams);
            } else if (filterPanelRef.current) {
                const params = await filterPanelRef.current.handleSearch();
                await loadHeaderList(params);
            }
        } finally {
            setLoading(false);
        }
    }, [loadHeaderList]);

    return (
        <TwoGridLayout
            filterPanel={
                <FilterPanel
                    className="page-layout__filter-panel"
                    onRefReady={(ref) => {
                        filterPanelRef.current = ref;
                    }}
                    onSearch={handleSearch}
                    loading={loading}
                />
            }
            leftPanel={
                <LeftGrid
                    className="page-layout__left-grid"
                    rowData={headerList}
                    onRowSelectionChanged={handleHeaderSelectionChanged}
                />
            }
            rightPanel={
                <RightGrid
                    className="page-layout__right-grid"
                    rowData={detailList}
                    officeId={user?.officeId}
                    empyId={selectedHeader?.empCode}
                    onDataChange={handleDetailDataChange}
                    onSave={handleSave}
                />
            }
            leftPanelSize="70%"
        />
    );
};

export default CompanyUserMng;
