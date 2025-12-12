// ============================================================================
// 법인 관리 페이지 스타일
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import styled from "styled-components";
import * as mixins from "@/styles/mixins";

// 필터 패널 스타일
export const FilterPanelWrapper = styled.div`
  &.page-layout__filter-panel {
    ${mixins.flex("center", "space-between")}
    width: 100%;
  }

  .filter-panel {
    &__form {
      position: relative;
      display: flex;
      gap: 12px;
      align-items: flex-start;
      flex-wrap: wrap;
      width: 100%;
      flex: 1;
      padding-right: 40px;

      &::after {
        content: "";
        position: absolute;
        right: 0;
        margin-right: 20px;
        width: 1px;
        height: 100%;
        background-color: ${({ theme }) => theme.colors.neutral[300]};
      }

      .ant-form-item {
        margin-bottom: 0;
      }

      .ant-form-item .ant-form-item-label > label,
      .ant-form-item .ant-form-item-control-input {
        height: 28px;
      }

      .ant-form-item .ant-form-item-control-input {
        min-height: 28px;
      }

      label {
        font-size: 1.2rem;
        color: ${({ theme }) => theme.colors.neutral[800]};
      }

      .ant-picker,
      .ant-input {
        padding: 0.2rem 1.1rem;
      }
    }

    &__actions {
      ${mixins.flex("flex-start", "center", "row", "5px")}
      height: 100%;
    }
  }
`;

// 법인 관리 레이아웃 스타일 (그리드와 상세정보 패널 높이 조정)
export const CompanyMngLayoutWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  .page-layout--search-list-detail-grid {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 10px;

    .page-card--filter {
      flex-shrink: 0;
    }

    > div {
      display: flex;
      flex-direction: column;
      flex: 1;
      min-height: 0;
      gap: 10px;
    }

    .page-layout__detail-view {
      flex: 0 0 38%;
      min-height: 0;
      overflow: hidden;
    }

    .page-layout__detail-grid {
      flex: 0 0 62%;
      min-height: 0;
      overflow: hidden;
    }
  }
`;

