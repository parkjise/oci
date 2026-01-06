import React, { useEffect, useRef, useCallback } from "react";
import SearchGridLayout from "@/components/ui/layout/SearchGridLayout";
import GridSaveLayout from "@/components/ui/layout/GridSaveLayout";
import { 
    FilterPanel,
    DetailGrid
} from "@components/features/fcm/gl/settlement/AdvpayCtDtaCreat";
import { useAdvpayCtDtaCreatStore } from "@/store/fcm/gl/settlement/AdvpayCtDtaCreatStore";
import { useAuthStore } from "@store/com/auth/authStore";
import { FormButton } from "@components/ui/form";
import type { FormInstance } from "antd";
import { message } from "antd";
import type { AdvpayCtDtaCreatSearchRequest } from "@/types/fcm/gl/settlement/AdvpayCtDtaCreat.types";
import dayjs from "dayjs";

const AdvpayCtDtaCreat: React.FC = () => {
    const reset = useAdvpayCtDtaCreatStore((state) => state.reset);
    const formRef = useRef<FormInstance | null>(null);
    const saveData = useAdvpayCtDtaCreatStore((state) => state.saveData);
    const deleteData = useAdvpayCtDtaCreatStore((state) => state.deleteData);
    const newSearch = useAdvpayCtDtaCreatStore((state) => state.newSearch);
    const { user } = useAuthStore();

    // 컴포넌트 마운트 시 store 초기화
    useEffect(() => {
        reset();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // reset은 Zustand store 함수이므로 안정적인 참조를 유지하므로 의존성 배열에서 제외

    const handleSave = useCallback(async () => {
        await saveData();
    }, [saveData]);

    const handleDelete = useCallback(async () => {
        await deleteData();
    }, [deleteData]);

    // 신규자료검색 핸들러
    const handleNewSearch = useCallback(async () => {
        if (!formRef.current) {
            message.warning("검색 조건을 먼저 입력해주세요.");
            return;
        }

        try {
            const values = await formRef.current.validateFields();

            if (!user?.officeId) {
                message.error("사무소 정보를 찾을 수 없습니다.");
                return;
            }

            // 날짜 범위 검증
            const dateRange = values.dateRange as
                | [dayjs.Dayjs, dayjs.Dayjs]
                | undefined;
            if (!dateRange || !dateRange[0] || !dateRange[1]) {
                message.error("회계일자를 선택해주세요.");
                return;
            }

            // API 요청 파라미터 구성
            const searchRequest: AdvpayCtDtaCreatSearchRequest = {
                asOfficeId: user.officeId,
                asOrgId: values.asRpsnOffice || undefined,
                asDept: values.asDept || undefined,
                asCustno: values.asCust || undefined,
                asFrDate: dateRange[0].format("YYYYMMDD"),
                asToDate: dateRange[1].format("YYYYMMDD"),
                // 기준통화 정보 (기본값: KRW)
                asGCurr: "KRW",
                asGCurrDeci: "0",
                asGCurrFormat: "###,###,###",
            };

            // store의 newSearch 함수 호출
            await newSearch(searchRequest);
        } catch (error) {
            if (error && typeof error === "object" && "errorFields" in error) {
                // Form validation error
                message.error("입력값을 확인해주세요.");
            } else {
                message.error("신규자료검색 중 오류가 발생했습니다.");
                if (import.meta.env.DEV) {
                    console.error("신규자료검색 실패:", error);
                }
            }
        }
    }, [user, newSearch]);

    return (
        <SearchGridLayout
         className="page-layout--search-grid-panel"
            filterPanel={
                <FilterPanel 
                    className="page-layout__filter-panel"
                    onFormRefReady={(instance) => {
                        // formRef.current를 직접 업데이트
                        formRef.current = instance;
                    }}
                />
            }
            grid={

                <>
                  <GridSaveLayout   
                    onSave={handleSave}
                    onButtonClick={{
                        delete: handleDelete,
                    }}
                    hideButtons={["create", "edit", "copy", "expand"]}
                    buttonGroupProps={{
                        customButtons: [
                            <FormButton
                                key="newSearch"
                                size="small"
                                onClick={handleNewSearch}
                            >
                                신규자료검색
                            </FormButton>,
                        ],
                        showCustomButtonsDivider: true,
                    }}
                >
                    <DetailGrid className="page-layout__detail-grid " />
                </GridSaveLayout>
                
                </>
            }
        />
    );
};

export default AdvpayCtDtaCreat;