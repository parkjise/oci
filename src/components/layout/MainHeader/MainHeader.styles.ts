import styled from "styled-components";
import { Layout, Select } from "antd";
import * as mixins from "@/styles/mixins";

const { Header } = Layout;

export const StyledHeader = styled(Header)`
  ${mixins.flex("center", "space-between", "row")}
  background-color: ${({ theme }) => theme.colors.grey[50]};
  padding: 0 30px;
  height: 50px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.grey[200]};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

export const StyledHeaderLeft = styled.div`
  ${mixins.flex("center", "flex-start", "row")}
  height: 100%;
`;

export const StyledLogo = styled.div<{ $logoSrc?: string }>`
  width: 169px;
  height: 100%;
  background-image: url(${(props) => props.$logoSrc || ""});
  background-size: 80px 17px;
  background-repeat: no-repeat;
  background-position: left center;
  padding-left: 16px;
  box-sizing: border-box;
  position: relative;
  &:after {
    content: "";
    position: absolute;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 1px;
    height: 30px;
    background-color: ${({ theme }) => theme.colors.grey[100]};
  }
`;

export const StyledSearchSelect = styled(Select)`
  width: 200px;
  height: 28px;
  max-width: 200px;
  min-width: 200px;
  margin-left: 20px;
  text-align: left;
  box-sizing: border-box;
  border-radius: 2px;
  line-height: 28px;
  border-color: ${({ theme }) => theme.colors.grey[200]};
  &:focus,
  &:hover {
    border-color: ${({ theme }) => theme.colors.neutral[600]};
  }
  .anticon-down {
    svg {
      display: none;
    }
    &::before {
      display: inline-block;
      content: "\\ea4e";
      font-family: "remixicon" !important;
      font-weight: normal;
      font-size: 18px;
      line-height: 28px;
      color: ${({ theme }) => theme.colors.neutral[600]};
    }
  }
  .ant-select-selector {
    box-sizing: border-box;
    max-width: 100%;
  }
  .ant-select-placeholder {
    color: ${({ theme }) => theme.colors.neutral[500]};
    font-size: 12px;
  }
  .ant-select-content-value {
    color: ${({ theme }) => theme.colors.neutral[600]};
    font-size: 12px;
    font-weight: 400;
  }
`;

export const StyledHeaderRight = styled.div`
  ${mixins.flex("center", "flex-start", "row", "15px")}
  .header {
    &__button {
      width: 34px;
      height: 34px;
      border-radius: 100%;
      i {
        font-size: 20px;
        color: ${({ theme }) => theme.colors.grey[700]};
      }
      &.ant-btn {
        &:not(:disabled) {
          &:hover,
          &:active {
            border-color: ${({ theme }) => theme.colors.darknavy};
            background-color: ${({ theme }) => theme.colors.darknavy};
          }
          &:focus {
            border-color: ${({ theme }) => theme.colors.grey[200]};
          }
          &:hover {
            i {
              color: ${({ theme }) => theme.colors.white};
            }
          }
        }
      }
      i {
        font-size: 20px;
        color: ${({ theme }) => theme.colors.grey[700]};
      }
      &--notification {
        position: relative;
        .ant-badge {
          position: absolute;
          right: -8px;
          top: -7px;
          span {
            font-size: 11px;
          }
          .ant-badge-count {
            height: 16px;
            line-height: 15px;
            padding: 0 6px;
            background-color: ${({ theme }) => theme.colors.red};
            border-color: ${({ theme }) => theme.colors.red};
          }
        }
      }
    }
  }
`;

// export const StyledUserButton = styled(Button)`
//   color: #000000 !important;
//   height: 40px;
//   display: flex;
//   align-items: center;
//   padding: 0 12px;
//   span {
//     color: #000000 !important;
//   }
// `;

// export const StyledIconButton = styled(Button)`
//   color: #000000 !important;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   width: 40px;
//   height: 40px;
//   font-size: 18px;
//   border-radius: 8px;
//   transition: background-color 0.2s;
//   &:hover {
//     background-color: #f5f5f5;
//     color: #000000 !important;
//   }

//   .anticon {
//     color: #000000 !important;
//   }
// `;

/**
 * 검색 옵션 컨테이너 스타일
 */
export const StyledSearchOptionContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

/**
 * 검색 옵션 아이콘 래퍼
 */
export const StyledSearchOptionIcon = styled.span`
  display: flex;
  align-items: center;
  flex-shrink: 0;
`;

/**
 * 검색 옵션 텍스트 컨테이너
 */
export const StyledSearchOptionText = styled.div`
  flex: 1;
  min-width: 0;
`;

/**
 * 검색 옵션 라벨 (메뉴명)
 */
export const StyledSearchOptionLabel = styled.div`
  font-weight: 400;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
`;

/**
 * 검색 옵션 breadcrumb (부모 경로)
 */
export const StyledSearchOptionBreadcrumb = styled.div`
  font-size: 12px;
  color: #8c8c8c;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
