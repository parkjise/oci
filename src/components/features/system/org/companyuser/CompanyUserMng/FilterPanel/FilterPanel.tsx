// ============================================================================
// Import
// ============================================================================
import React, { useCallback, useEffect } from "react";
import { Form } from "antd";
import { FormSelect, FormInput, SearchForm } from "@form";
import { FilterPanelStyles } from "./FilterPanel.Styles";
import { useTranslation } from "react-i18next";
import { useCompanyUserMngStore } from "@store/system/org/companyuser/companyUserMngStore";

// ============================================================================
// Types
// ============================================================================
type FilterPanelProps = {
    className?: string;
};

// ============================================================================
// Component
// ============================================================================
/**
 * 회사사용자관리 필터 패널 컴포넌트
 */
const FilterPanel: React.FC<FilterPanelProps> = ({ className }) => {
    const { t } = useTranslation();
    const [form] = Form.useForm();
    const { loading, fetchHeaderList, setSearchParams, searchParams } = useCompanyUserMngStore();

    // 초기화 핸들러
    const handleReset = useCallback(() => {
        const defaultValues = {
            type: "2", // 기본값: 성명
            name: "",
            useYn: "%", // 기본값: 전체
        };
        form.setFieldsValue(defaultValues);
        setSearchParams(defaultValues);
        fetchHeaderList(defaultValues);
    }, [form, fetchHeaderList, setSearchParams]);

    // 조회 버튼 핸들러
    const handleSearch = useCallback(async () => {
        try {
            const values = await form.validateFields();
            const params = {
                type: values.type || "2",
                name: values.name || "",
                useYn: values.useYn !== undefined && values.useYn !== null ? values.useYn : "%",
            };

            await fetchHeaderList(params);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error("조회 실패:", error);
            }
        }
    }, [form, fetchHeaderList]);

    // 초기값 설정
    useEffect(() => {
        form.setFieldsValue(searchParams);
    }, [form, searchParams]);

    // 타입 옵션
    const typeOptions = [
        { value: "2", label: t("성명") },
        { value: "1", label: t("부서") },
        { value: "3", label: t("사번") },
    ];

    // 사용여부 옵션
    const useYnOptions = [
        { value: "%", label: t("전체") },
        { value: "Y", label: t("사용") },
        { value: "N", label: t("미사용") },
    ];

    return (
        <FilterPanelStyles className={className}>
            <SearchForm
                form={form}
                onSearch={handleSearch}
                onReset={handleReset}
                showReset={true}
                loading={loading}
                columnsPerRow={4}
                showExpand={false}
                className="page-layout__filter-panel"
            >
                <FormSelect
                    name="type"
                    label={t("조회구분")}
                    options={typeOptions}
                />
                <FormInput
                    name="name"
                    label=""
                    onPressEnter={handleSearch}
                />
                <FormSelect
                    name="useYn"
                    label={t("사용여부")}
                    options={useYnOptions}
                />
            </SearchForm>
        </FilterPanelStyles>
    );
};

export default FilterPanel;
