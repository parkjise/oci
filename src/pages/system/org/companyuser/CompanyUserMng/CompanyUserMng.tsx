// ============================================================================
// Import
// ============================================================================
import React, { useEffect } from "react";
import TwoGridLayout from "@/components/ui/layout/TwoGridLayout";
import {
    FilterPanel,
    LeftGrid,
    RightGrid,
} from "@components/features/system/org/companyuser/CompanyUserMng";
import { useAuthStore } from "@store/com/auth/authStore";
import { useCompanyUserMngStore } from "@store/system/org/companyuser/companyUserMngStore";

import styled from "styled-components";

// ============================================================================
// Styles
// ============================================================================
const PageWrapper = styled.div`
    height: 100%;
    display: flex;
    flex-direction: column;

    & > .page-layout--two-grid {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;

        .page-card--filter {
            flex: 0 0 auto; /* 검색 패널은 내용만큼만 */
        }

        /* SplitLayoutStyles 영역 (그리드 패널들을 감쌈) */
        & > div:not(.page-card--filter) {
            flex: 1;
            min-height: 0;
            display: flex;
            flex-direction: column;
        }
    }
`;

// ============================================================================
// Component
// ============================================================================
/**
 * 회사사용자관리 페이지
 */
const CompanyUserMng: React.FC = () => {
    const { user } = useAuthStore();
    const { fetchHeaderList, reset } = useCompanyUserMngStore();

    // 초기 로드
    useEffect(() => {
        if (user?.officeId) {
            fetchHeaderList({ type: "2", name: "", useYn: "%" });
        }
        
        return () => {
            reset();
        };
    }, [user?.officeId, fetchHeaderList, reset]);

    return (
        <PageWrapper>
            <TwoGridLayout
                filterPanel={<FilterPanel className="page-layout__filter-panel" />}
                leftPanel={<LeftGrid className="page-layout__left-grid" />}
                rightPanel={<RightGrid className="page-layout__right-grid" />}
                leftPanelSize="60%"
            />
        </PageWrapper>
    );
};

export default CompanyUserMng;
