import styled from "styled-components";
import * as mixins from "@/styles/mixins";
export const DetailGridStyles = styled.div`
  ${mixins.Card()}
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;

  .detail-grid__header {
    padding: 10px 15px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: flex-end;
    align-items: center;

    .detail-grid__count {
      font-size: 13px;
      strong {
        font-weight: bold;
      }
    }

    .detail-grid__actions {
      display: flex;
      align-items: center;
      gap: 5px;

      .divider {
        width: 1px;
        height: 15px;
        background: #ddd;
        margin: 0 5px;
      }
    }
  }

  .detail-grid__content {
    flex: 1;
    width: 100%;
    height: 100%;
    
    /* AG Grid customization */
    .ag-theme-quartz {
        /* Header */
        --ag-header-background-color: #f8f9fa;
        --ag-header-foreground-color: #666; /* Adjusted to match image */
        --ag-header-cell-hover-background-color: #f0f0f0;
        
        /* Rows */
        --ag-foreground-color: #666; /* Lighter gray */
        --ag-data-color: #666; /* Lighter gray */
        --ag-row-hover-color: #f5f7fa;
        --ag-selected-row-background-color: #e6f7ff;
        
        /* Borders */
        --ag-border-color: #eee;
        
        .ag-header-cell-label {
            font-weight: 600;
            font-size: 13px;
            justify-content: center;
        }
        
        .ag-cell {
            font-size: 13px;
            display: flex;
            align-items: center;
        }

        /* Selected Row Styling */
        .ag-row-selected {
            --ag-data-color: #333;
            --ag-foreground-color: #333;
            font-weight: bold;
        }
    }

    .ag-root-wrapper {
        border: none;
    }
  }
`;
