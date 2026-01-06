import styled from "styled-components";
import { DataForm } from "@components/ui/form";

export const StyledDataForm = styled(DataForm)`
  &.menu-detail-form {
    .detail-view__actions {
      margin-bottom: 5px; // Increased margin
    }
    
    // Fix Checkbox height issue - force tight line height for alignment
    .ant-checkbox-wrapper {
      line-height: 1; 
      display: flex;
      align-items: center;
      height: 100%; /* Ensure it takes full cell height but centers */
    }
    
    // Ensure table cells don't expand unnecessarily
    table td {
      height: 36px !important; // Force height
      padding-block: 0 !important; // Remove vertical padding
      vertical-align: middle;
    }
    
    // Fix specific input heights if needed
    .ant-picker, .ant-input-number, .ant-input, .ant-select-selector {
         height: 26px !important;
    }
  }
`;
