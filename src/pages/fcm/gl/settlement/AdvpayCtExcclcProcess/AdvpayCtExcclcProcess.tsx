import React, { useCallback, useRef } from "react";
import { SearchGridSaveLayout } from "@/components/ui/layout/SearchGridSaveLayout";
import { 
    FilterPanel,
    DetailGrid
} from "@components/features/fcm/gl/settlement/AdvpayCtExcclcProcess";
import type { FilterPanelRef } from "@components/features/fcm/gl/settlement/AdvpayCtExcclcProcess/FilterPanel/FilterPanel";
import GridSaveLayout from "@/components/ui/layout/GridSaveLayout";
import { useAdvpayCtExcclcProcessStore } from "@/store/fcm/gl/settlement/AdvpayCtExcclcProcesStore";
import { useAuthStore } from "@store/com/auth/authStore";
import { confirm, showWarning, showSuccess } from "@components/ui/feedback/Message";
import type { AdvpayCtExcclcProcessDetailResponse, AdvpayCtExcclcProcessProcRequest } from "@/types/fcm/gl/settlement/AdvpayCtExcclcProcess";


const AdvpayCtExcclcProcess: React.FC = () => {
    const filterPanelRef = useRef<FilterPanelRef | null>(null);
    const { user } = useAuthStore();
    const { gridApi,  createSlip, cancelSlip, refresh } = useAdvpayCtExcclcProcessStore();

    const handleSave = useCallback(async () => {
        // 1. 체크된 데이터 확인
        if (!gridApi) {
            showWarning("그리드가 준비되지 않았습니다.");
            return;
        }

        const checkedRows: AdvpayCtExcclcProcessDetailResponse[] = [];
        gridApi.forEachNode((node) => {
            if (node.data && node.data.chk === "Y") {
                checkedRows.push(node.data as AdvpayCtExcclcProcessDetailResponse);
            }
        });

        if (checkedRows.length === 0) {
            showWarning("체크된 데이터가 없습니다.");
            return;
        }

        // 2. slipType 값 가져오기
        if (!filterPanelRef.current) {
            showWarning("검색 조건을 확인할 수 없습니다.");
            return;
        }

        const slipType = filterPanelRef.current.getCurrentSlipType();
        if (!slipType) {
            showWarning("전표구분을 선택해주세요.");
            return;
        }

        if (!user?.officeId || !user?.empCode) {
            showWarning("사용자 정보를 찾을 수 없습니다.");
            return;
        }

        const glDate = filterPanelRef.current.getCurrentGlDate();
        if (!glDate) {
            showWarning("GL Date를 선택해주세요.");
            return;
        }

        let messageText = "";
        
        // 3. 전표생성/취소에 따른 검증
        if (slipType === "N") {
            // 전표생성
            messageText = "전표생성";
            
            // GL일자 체크 (GL 카테고리)
            // const glCheckResult = await checkGlDate({
            //     officeId: user.officeId,
            //     category: "GL",
            //     glDate: glDate,
            // });

            // if (glCheckResult <= 0) {
            //     showWarning("회계 기초 또는 마감 체크에 실패했습니다.");
            //     return;
            // }
        } else if (slipType === "Y") {
            // 전표취소
            messageText = "전표취소";

            // 각 체크된 행의 전기여부 및 GL일자 체크
            for (const row of checkedRows) {
                if (row.exptnTgt === "Y") {
                    showWarning("이미 전기처리된 자료가 있습니다. 전기 취소 후 작업하세요");
                    return;
                }

                // GL_NUMBER에서 GL일자 추출 (예: "SLIP-20240101-001" -> "20240101")
                if (row.glNumber) {
                    const glNumberParts = row.glNumber.split("-");
                    if (glNumberParts.length >= 2) {
                        //const rowGlDate = glNumberParts[1];
                        
                        // const glCheckResult = await checkGlDate({
                        //     officeId: user.officeId,
                        //     category: "GL",
                        //     glDate: rowGlDate,
                        // });

                        // if (glCheckResult <= 0) {
                        //     showWarning("회계 기초 또는 마감 체크에 실패했습니다.");
                        //     return;
                        // }
                    }
                }
            }
        }

        // 4. AP02 카테고리로 GL일자 체크
        // const ap02CheckResult = await checkGlDate({
        //     officeId: user.officeId,
        //     category: "AP02",
        //     glDate: glDate,
        // });

        // if (ap02CheckResult <= 0) {
        //     showWarning("회계 기초 또는 마감 체크에 실패했습니다.");
        //     return;
        // }

        // 5. 확인 후 전표 생성/취소 실행
        confirm({
            title: "확인",
            content: `${messageText} 하시겠습니까?`,
            okText: "확인",
            cancelText: "취소",
            onOk: async () => {
                let allSuccess = true;

                if (slipType === "N") {
                    // 전표 생성
                    for (const row of checkedRows) {
                        if (!row.numberTimes || !row.mkDeptPayCertf || !row.mkDatePayCertf || 
                            !row.serPayCertf || !row.seqPayCertf || !row.orgId || !row.applyYm) {
                            showWarning("필수 데이터가 누락되었습니다.");
                            allSuccess = false;
                            continue;
                        }

                        const request: AdvpayCtExcclcProcessProcRequest = {
                            pOfficeId: user.officeId,
                            pOrgId: row.orgId,
                            pDept: row.mkDeptPayCertf,
                            pDate: row.mkDatePayCertf.replace(/-/g, ""), // YYYYMMDD 형식
                            pSerPayCertf: row.serPayCertf,
                            pSeqPayCertf: row.seqPayCertf,
                            pApplyYm: row.applyYm.replace(/-/g, "").substring(0, 6), // YYYYMM 형식
                            pGlDate: glDate,
                            pCurrency: row.currency || "KRW",
                            pUserId: user.empCode,
                            pSaleType: "EXPENSE",
                        };

                        const success = await createSlip(request);
                        if (!success) {
                            allSuccess = false;
                        }
                    }

                    if (allSuccess) {
                        showSuccess("전표 생성 하였습니다.");
                        await refresh();
                    }
                } else if (slipType === "Y") {
                    // 전표 취소
                    for (const row of checkedRows) {
                        // 전표ID 확인 (ACK_SLP_ID 또는 다른 필드명 확인 필요)
                        const accSlpId = (row as any).ackSlpId || (row as any).accSlpId;
                        if (!accSlpId) {
                            showWarning("전표ID를 찾을 수 없습니다.");
                            allSuccess = false;
                            continue;
                        }

                        const request: AdvpayCtExcclcProcessProcRequest = {
                            pOfficeId: user.officeId,
                            pOrgId: row.orgId || "",
                            pDept: row.mkDeptPayCertf || "",
                            pDate: row.mkDatePayCertf?.replace(/-/g, "") || "",
                            pSerPayCertf: row.serPayCertf || "",
                            pSeqPayCertf: row.seqPayCertf || "",
                            pApplyYm: row.applyYm?.replace(/-/g, "").substring(0, 6) || "",
                            pGlDate: glDate,
                            pCurrency: row.currency || "KRW",
                            pUserId: user.empCode,
                            pAccSlpId: accSlpId,
                            pSaleType: "EXPENSE",
                        };

                        const success = await cancelSlip(request);
                        if (!success) {
                            allSuccess = false;
                        }
                    }

                    if (allSuccess) {
                        showSuccess("전표 취소 하였습니다.");
                        await refresh();
                    }
                }
            },
        });
    }, [user, gridApi, createSlip, cancelSlip, refresh]);

    return (
        <SearchGridSaveLayout
            filterPanel={
                <FilterPanel 
                    className="page-layout__filter-panel"
                    onRefReady={(ref) => {
                        filterPanelRef.current = ref;
                    }}
                />
            }
            grid={
            <GridSaveLayout onSave={handleSave}>
                <DetailGrid className="page-layout__detail-grid" />
            </GridSaveLayout>
            }
        />
    );
};

export default AdvpayCtExcclcProcess;