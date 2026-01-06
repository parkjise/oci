import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
    getWorkplaceUserHeaderListApi,
    getWorkplaceUserDetailListApi,
    saveWorkplaceUserDetailListApi,
    type WorkplaceUserHeaderDto,
    type WorkplaceUserDetailDto,
    type WorkplaceUserHeaderSearchRequest
} from "@apis/system/org/workplaceUserApi";
import { getInOrgListApi } from "@apis/system/common/listApi";
import { showSuccess, showError, showWarning } from "@components/ui/feedback/Message";
import i18n from "@/i18n";
import { useAuthStore } from "@store/com/auth/authStore";

interface WorkplaceUserMngState {
    headerList: WorkplaceUserHeaderDto[];
    detailList: WorkplaceUserDetailDto[];
    selectedHeader: WorkplaceUserHeaderDto | null;
    workplaceOptions: Array<{ value: string; label: string }>;
    loading: boolean;
    searchParams: WorkplaceUserHeaderSearchRequest;

    // Actions
    setSearchParams: (params: Partial<WorkplaceUserHeaderSearchRequest>) => void;
    fetchHeaderList: (params?: Partial<WorkplaceUserHeaderSearchRequest>) => Promise<void>;
    fetchDetailList: (empyId: string) => Promise<void>;
    fetchWorkplaceOptions: () => Promise<void>;
    setSelectedHeader: (header: WorkplaceUserHeaderDto | null) => void;

    addDetailRow: (officeId: string, empyId: string) => void;
    deleteDetailRow: (selectedRows: any[]) => void;
    updateDetailList: (list: WorkplaceUserDetailDto[]) => void;
    saveDetailList: () => Promise<void>;

    reset: () => void;
}

export const useWorkplaceUserMngStore = create<WorkplaceUserMngState>()(
    devtools(
        (set, get) => ({
            headerList: [],
            detailList: [],
            selectedHeader: null,
            workplaceOptions: [],
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

                const finalParams: WorkplaceUserHeaderSearchRequest = {
                    ...searchParams,
                    ...params,
                    officeId,
                };

                set({ loading: true, searchParams: finalParams });

                try {
                    const response = await getWorkplaceUserHeaderListApi(finalParams);
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

            fetchDetailList: async (empyId) => {
                const officeId = useAuthStore.getState().user?.officeId;
                if (!officeId || !empyId) {
                    set({ detailList: [] });
                    return;
                }

                try {
                    const response = await getWorkplaceUserDetailListApi({
                        officeId,
                        empyId,
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

            fetchWorkplaceOptions: async () => {
                const officeId = useAuthStore.getState().user?.officeId;
                if (!officeId) return;

                try {
                    const response = await getInOrgListApi({ officeId });
                    if (response.success && response.data) {
                        const options = response.data.map((item) => ({
                            value: item.code || "",
                            label: item.name || item.code || "",
                        }));
                        options.unshift({ value: "", label: i18n.t("-선택-") });
                        set({ workplaceOptions: options });
                    }
                } catch (error) {
                    console.error("사업장 목록 조회 실패:", error);
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

            addDetailRow: (officeId, empyId) => {
                const { detailList } = get();
                const newRow: WorkplaceUserDetailDto = {
                    officeId,
                    empyId,
                    orgId: "",
                    oriOrgId: "",
                    primary: "N",
                    multiOrgYno: "",
                    rowStatus: "C",
                };
                set({ detailList: [...detailList, newRow] });
            },

            deleteDetailRow: (selectedRows) => {
                const { detailList } = get();
                if (selectedRows.length === 0) {
                    showWarning(i18n.t("MSG_SY_0102")); // 삭제할 행을 선택하세요!
                    return;
                }

                const hasNewOrModified = selectedRows.some(
                    (row) => row.rowStatus === "C" || row.rowStatus === "U"
                );

                if (hasNewOrModified) {
                    showWarning(i18n.t("MSG_SY_0103")); // 신규, 수정 데이터를 저장 후 진행 바랍니다.
                    return;
                }

                const updatedList = detailList.map((row) => {
                    const isSelected = selectedRows.some(
                        (sel) => sel.orgId === row.orgId && sel.empyId === row.empyId
                    );
                    if (isSelected) {
                        if (row.rowStatus === "C") return null;
                        return { ...row, rowStatus: "D" as const };
                    }
                    return row;
                }).filter(Boolean) as WorkplaceUserDetailDto[];

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

                // 1. 검증: 중복된 사업장 체크
                const orgIds = activeData.map((item) => item.orgId).filter((id) => id);
                const uniqueOrgIds = new Set(orgIds);
                if (orgIds.length !== uniqueOrgIds.size) {
                    showError(i18n.t("MSG_SY_0106")); // 중복된 사업장이 존재합니다.
                    return;
                }

                // 2. 검증: 사업장코드 Null 체크
                const hasNullOrgId = activeData.some(
                    (item) => !item.orgId || item.orgId.trim() === ""
                );
                if (hasNullOrgId) {
                    showError(i18n.t("MSG_CM_1295")); // 사업장코드를 입력하세요.
                    return;
                }

                // 3. 검증: Primary 개수 체크
                const primaryCount = activeData.filter((item) => item.primary === "Y").length;
                if (primaryCount !== 1) {
                    showError(i18n.t("MSG_SY_0107")); // Primary 사업장은 반드시 하나 존재해야합니다.
                    return;
                }

                // MULTI_ORG_YNO 설정
                if (activeData.length === 1) {
                    activeData.forEach((item) => {
                        item.multiOrgYno = "S";
                    });
                } else {
                    activeData.forEach((item) => {
                        item.multiOrgYno = "M";
                    });
                }

                set({ loading: true });
                try {
                    const response = await saveWorkplaceUserDetailListApi({
                        detailList: changedData.map((item) => ({
                            ...item,
                            officeId,
                            empyId: selectedHeader.empCode,
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
        { name: "WorkplaceUserMngStore" }
    )
);
