import styled from "styled-components";
import * as mixins from "@/styles/mixins";

export const DetailViewStyles = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .detail-view__actions {
    ${mixins.flex("center", "space-between", "row")}
    width: 100%;
    padding: 8px 16px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.neutral[200]};
    background-color: ${({ theme }) => theme.colors.neutral[50]};
  }

  .detail-view__actions-group {
    ${mixins.flex("center", "flex-start", "row", "8px")}
  }

  .detail-view__actions-group--left {
    flex: 1;
  }

  .detail-view__actions-group--right {
    gap: 4px;
  }

  .detail-view__department,
  .detail-view__user {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.neutral[700]};
  }

  .detail-view__divider {
    width: 1px;
    height: 16px;
    background-color: ${({ theme }) => theme.colors.neutral[300]};
    margin: 0 8px;
  }

  .detail-view__status {
    ${mixins.flex("center", "flex-start", "row", "4px")}
  }

  .detail-view__status-tag {
    margin: 0;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 4px;
  }

  .detail-view__attachment {
    position: relative;
    ${mixins.flex("center", "center", "row")}
  }

  .detail-view__attachment--badge {
    position: absolute;
    top: -4px;
    right: -4px;
  }

  .detail-view__button {
    height: 28px;
    padding: 4px 12px;
    font-size: 12px;
    border-radius: 4px;
  }

  .detail-view__table {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
  }

  .detail-view__table table {
    width: 100%;
    border-collapse: collapse;
  }

  .detail-view__table th {
    background-color: ${({ theme }) => theme.colors.neutral[100]};
    padding: 8px 12px;
    text-align: left;
    font-weight: 500;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.neutral[700]};
    border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
    white-space: nowrap;
  }

  .detail-view__table td {
    padding: 8px 12px;
    font-size: 12px;
    color: ${({ theme }) => theme.colors.neutral[800]};
    border: 1px solid ${({ theme }) => theme.colors.neutral[200]};
  }

  .helptext {
    margin-left: 4px;
    font-size: 12px;
  }

  .helptext.error {
    color: ${({ theme }) => theme.colors.error};
  }

  .helptext.question {
    color: ${({ theme }) => theme.colors.neutral[500]};
  }
`;

