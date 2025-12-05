import React, { useMemo } from "react";
import { Space, Tooltip } from "antd";
import { useTranslation } from "react-i18next";
import FormButton from "./FormButton";

export interface SearchActionsProps {
  loading?: boolean;
  searchExpanded?: boolean;
  onSearch?: () => void;
  onReset?: () => void;
  onToggleExpand?: () => void;
  showSearch?: boolean; // 조회 버튼 표시 여부 (기본값: true)
  showReset?: boolean; // 초기화 버튼 표시 여부 (기본값: true)
  showExpand?: boolean; // 확장 버튼 표시 여부 (기본값: true)
}

export const SearchActions: React.FC<SearchActionsProps> = ({
  loading = false,
  searchExpanded = false,
  onSearch,
  onReset,
  onToggleExpand,
  showSearch = true,
  showReset = true,
  showExpand = true,
}) => {
  const { t } = useTranslation();

  // 다국어 처리된 툴팁 텍스트
  const searchTooltip = useMemo(() => t("label000", "조회"), [t]); // "조회" / "Search"
  const resetTooltip = useMemo(() => "초기화", []); // 번역 파일에 직접적인 키가 없음
  const expandTooltip = useMemo(
    () => (searchExpanded ? "접기" : "확장"), // 번역 파일에 직접적인 키가 없음
    [searchExpanded]
  );

  return (
    <Space>
      {showSearch && (
        <Tooltip title={searchTooltip}>
          <FormButton
            size="small"
            icon={<i className="ri-search-line" style={{ fontSize: 18 }} />}
            loading={loading}
            onClick={onSearch}
          />
        </Tooltip>
      )}
      {showReset && (
        <Tooltip title={resetTooltip}>
          <FormButton
            size="small"
            onClick={onReset}
            icon={<i className="ri-refresh-line" style={{ fontSize: 18 }} />}
          />
        </Tooltip>
      )}
      {showExpand && (
        <Tooltip title={expandTooltip}>
          <FormButton
            size="small"
            icon={
              <i
                className={
                  searchExpanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"
                }
                style={{ fontSize: 18 }}
              />
            }
            onClick={onToggleExpand}
          />
        </Tooltip>
      )}
    </Space>
  );
};

export default SearchActions;
