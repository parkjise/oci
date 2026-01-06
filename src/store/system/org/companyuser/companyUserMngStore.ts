import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
    getCompanyUserHeaderListApi,
    getCompanyUserDetailListApi,
    saveCompanyUserDetailListApi,
    getCompanyListApi,
    type CompanyUserHeaderDto,
    type CompanyUserDetailDto,
    type CompanyUserHeaderSearchRequest
} from "@apis/system/org/companyUserApi";
import { showSuccess, showError, showWarning } from "@components/ui/feedback/Message";
import i18n from "@/i18n";
import { useAuthStore } from "@store/com/auth/authStore";

interface CompanyUserMngState {
    headerList: CompanyUserHeaderDto[];
    detailList: CompanyUserDetailDto[];
    selectedHeader: CompanyUserHeaderDto | null;
    companyOptions: Array<{ value: string; label: string }>;
    loading: boolean;
    searchParams: CompanyUserHeaderSearchRequest;

    // Actions
    setSearchParams: (params: Partial<CompanyUserHeaderSearchRequest>) => void;
    fetchHeaderList: (params?: Partial<CompanyUserHeaderSearchRequest>) => Promise<void>;
    fetchDetailList: (empCode: string) => Promise<void>;
    fetchCompanyOptions: () => Promise<void>;
    setSelectedHeader: (header: CompanyUserHeaderDto | null) => void;

    addDetailRow: (officeId: string, empCode: string) => void;
    deleteDetailRow: (selectedRows: any[]) => void;
    updateDetailList: (list: CompanyUserDetailDto[]) => void;
    saveDetailList: () => Promise<void>;

    reset: () => void;
}

export const useCompanyUserMngStore = create<CompanyUserMngState>()(
    devtools(
        (set, get) => ({
            headerList: [],
            detailList: [],
            selectedHeader: null,
            companyOptions: [],
            loading: false,
            searchParams: {
                officeId: "",
                type: "2",
                name: "",
                useYn: "%",
            },

            setSearchParams: (params) =>
                set((state) => ({
                    searchParams: { ...state.searchParams, ...params },
                })),

            fetchHeaderList: async (params) => {
                const { searchParams } = get();
                const officeId = useAuthStore.getState().user?.officeId;

                if (!officeId) {
                    showError(i18n.t("MSG_SY_0104")); // 회사코드가 없습니다.
                    return;
                }

                const finalParams: CompanyUserHeaderSearchRequest = {
                    ...searchParams,
                    ...params,
                    officeId,
                };

                set({ loading: true, searchParams: finalParams });

                try {
                    const response = await getCompanyUserHeaderListApi(finalParams);
                    if (response.success && response.data) {
                        const data = response.data;
                        set({ headerList: data });

                        if (data.length > 0) {
                            const firstItem = data[0];
                            set({ selectedHeader: firstItem });
                            if (firstItem.empCode) {
                                await get().fetchDetailList(firstItem.empCode);
                            }
                        } else {
                            set({ selectedHeader: null, detailList: [] });
                        }
                    } else {
                        set({ headerList: [], selectedHeader: null, detailList: [] });
                    }
                } catch (error) {
                    console.error("헤더 목록 조회 실패:", error);
                    showError(i18n.t("MSG_SY_0105")); // 조회에 실패했습니다.
                    set({ headerList: [], selectedHeader: null, detailList: [] });
                } finally {
                    set({ loading: false });
                }
            },

            fetchDetailList: async (empCode) => {
                const officeId = useAuthStore.getState().user?.officeId;
                if (!officeId || !empCode) {
                    set({ detailList: [] });
                    return;
                }

                try {
                    const response = await getCompanyUserDetailListApi({
                        officeId,
                        empCode,
                    });

                    if (response.success && response.data) {
                        set({ detailList: response.data });
                    } else {
                        set({ detailList: [] });
                    }
                } catch (error) {
                    console.error("상세 목록 조회 실패:", error);
                    set({ detailList: [] });
                }
            },

            fetchCompanyOptions: async () => {
                const officeId = useAuthStore.getState().user?.officeId;
                if (!officeId) return;

                try {
                    const response = await getCompanyListApi({ officeId });
                    if (response.success && response.data) {
                        const options = response.data.map((item: any) => ({
                            value: item.code || item.officeId || "",
                            label: item.name || item.officeName || item.code || "",
                        }));
                        // AS-IS "-choose-" 대응
                        options.unshift({ value: "", label: i18n.t("-선택-") });
                        set({ companyOptions: options });
                    }
                } catch (error) {
                    console.error("회사 목록 조회 실패:", error);
                }
            },

            setSelectedHeader: (header) => {
                const currentSelected = get().selectedHeader;
                if (currentSelected?.empCode === header?.empCode) return;

                set({ selectedHeader: header });
                if (header?.empCode) {
                    get().fetchDetailList(header.empCode);
                } else {
                    set({ detailList: [] });
                }
            },

            addDetailRow: (officeId, empCode) => {
                const { detailList } = get();
                const newRow: CompanyUserDetailDto = {
                    officeId,
                    empCode,
                    authOfficeId: "",
                    oriOrgId: "",
                    primeYn: "Y",
                    rowStatus: "C",
                };
                set({ detailList: [...detailList, newRow] });
            },

            deleteDetailRow: (selectedRows) => {
                const { detailList } = get();
                if (selectedRows.length === 0) {
                    showWarning(i18n.t("MSG_CM_0477")); // 삭제할 행을 선택하세요!
                    return;
                }

                const hasNewOrModified = selectedRows.some(
                    (row) => row.rowStatus === "C" || row.rowStatus === "U"
                );

                if (hasNewOrModified) {
                    showWarning(i18n.t("MSG_SY_0082")); // 신규, 수정 데이터를 저장 후 진행 바랍니다.
                    return;
                }

                const updatedList = detailList.map((row) => {
                    const isSelected = selectedRows.some(
                        (sel) => sel.authOfficeId === row.authOfficeId && sel.empCode === row.empCode
                    );
                    if (isSelected) {
                        if (row.rowStatus === "C") return null;
                        return { ...row, rowStatus: "D" as const };
                    }
                    return row;
                }).filter(Boolean) as CompanyUserDetailDto[];

                set({ detailList: updatedList });
            },

            updateDetailList: (list) => {
                set({ detailList: list });
            },

            saveDetailList: async () => {
                const { detailList, selectedHeader } = get();
                const officeId = useAuthStore.getState().user?.officeId;

                if (!officeId || !selectedHeader?.empCode) {
                    showWarning(i18n.t("MSG_SY_0005")); // 저장할 데이터가 없습니다.
                    return;
                }

                // 검증을 위해 삭제되지 않은 모든 데이터 추출
                const activeData = detailList.filter((item) => item.rowStatus !== "D");

                // 변경된 데이터만 필터링 (저장용)
                const changedData = detailList.filter(
                    (item) => item.rowStatus === "C" || item.rowStatus === "U" || item.rowStatus === "D"
                );

                if (changedData.length === 0) {
                    showWarning(i18n.t("MSG_SY_0081")); // 저장할 데이터가 없습니다.
                    return;
                }

                // 1. 검증: 중복된 항목 체크
                const orgIds = activeData.map((item) => item.authOfficeId).filter((id) => id);
                const uniqueOrgIds = new Set(orgIds);
                if (orgIds.length !== uniqueOrgIds.size) {
                    showError(i18n.t("MSG_SY_0106")); // 중복된 회사(사업장)가 존재합니다.
                    return;
                }

                // 2. 검증: 회사코드 Null 체크
                const hasNullOrgId = activeData.some(
                    (item) => !item.authOfficeId || item.authOfficeId.trim() === ""
                );
                if (hasNullOrgId) {
                    showError(i18n.t("MSG_CM_1295")); // 사업장코드(회사코드)를 입력하세요.
                    return;
                }

                // 3. 검증: Primary 개수 체크
                const primaryCount = activeData.filter((item) => item.primeYn === "Y").length;
                if (primaryCount !== 1) {
                    showError(i18n.t("MSG_SY_0107")); // Primary 회사(사업장)는 반드시 하나 존재해야합니다.
                    return;
                }

                set({ loading: true });
                try {
                    const response = await saveCompanyUserDetailListApi({
                        detailList: changedData.map((item) => ({
                            ...item,
                            officeId,
                            empCode: selectedHeader.empCode,
                        })),
                    });

                    if (response.success) {
                        const result = response.data;
                        if (result && result.deleteCount < 0) {
                            showSuccess(i18n.t("MSG_SY_0108")); // 정상적으로 삭제하였습니다.
                        } else {
                            showSuccess(i18n.t("MSG_SY_0109")); // 저장 되었습니다.
                        }

                        // 재조회
                        await get().fetchHeaderList();
                    } else {
                        showError(i18n.t("MSG_SY_0110")); // 저장에 실패했습니다.
                    }
                } catch (error) {
                    console.error("저장 실패:", error);
                    showError(i18n.t("MSG_SY_0110")); // 저장에 실패했습니다.
                } finally {
                    set({ loading: false });
                }
            },

            reset: () => {
                set({
                    headerList: [],
                    detailList: [],
                    selectedHeader: null,
                    loading: false,
                    searchParams: {
                        officeId: "",
                        type: "2",
                        name: "",
                        useYn: "%",
                    },
                });
            }
        }),
        { name: "CompanyUserMngStore" }
    )
);
