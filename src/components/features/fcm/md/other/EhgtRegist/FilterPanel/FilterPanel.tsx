/**
 * 환율 등록 - 검색 조건 패널
 */

import React, { useCallback, useState } from "react";
import { SearchForm, FormDatePicker, FormSelect } from "@components/ui/form";
import { Form, message } from "antd";
import dayjs from "dayjs";
import { selectEhgtRegistList } from "@apis/fcm/md/other/ehgtRegist";
import type { EhgtRegistSrchRequest } from "@/types/fcm/md/other/ehgtRegist.types";
import type { EhgtRegistRowData } from "../MainGrid/MainGrid";

type FilterPanelProps = {
    className?: string;
    setRowData: React.Dispatch<React.SetStateAction<EhgtRegistRowData[]>>;
};

export interface FilterPanelHandle {
    handleSearch: (values?: any) => Promise<void>;
}

const FilterPanel = React.forwardRef<FilterPanelHandle, FilterPanelProps>(
    ({ className, setRowData }, ref) => {
        const [loading, setLoading] = useState(false);
        const [form] = Form.useForm();

        const handleSearch = useCallback(async (values: any = {}) => {
            try {
                setLoading(true);
                const currentValues = form.getFieldsValue();
                const searchValues = { ...currentValues, ...values };

                const params: EhgtRegistSrchRequest = {
                    asDateFrom: searchValues.dateRange?.[0]?.format("YYYY-MM-DD") || undefined,
                    asDateTo: searchValues.dateRange?.[1]?.format("YYYY-MM-DD") || undefined,
                    asCurrency: searchValues.asCurrency || undefined,
                };

                if (!params.asDateFrom || !params.asDateTo) {
                    message.warning("조회일자를 선택해주세요.");
                    return;
                }

                const response = await selectEhgtRegistList(params);

                if (response.success) {
                    const mappedData = response.data.map((item, index) => ({
                        ...item,
                        id: `${item.curDate}_${item.cur}_${index}`,
                        curDate: item.curDate ? (typeof item.curDate === "string"
                            ? dayjs(item.curDate).format("YYYYMMDD")
                            : dayjs(item.curDate as any).format("YYYYMMDD")) : undefined,
                    }));
                    setRowData(mappedData);
                }
            } catch (error) {
                console.error("Search error:", error);
                message.error("조회 중 오류가 발생했습니다.");
            } finally {
                setLoading(false);
            }
        }, [form, setRowData]);

        React.useImperativeHandle(ref, () => ({
            handleSearch,
        }));

        return (
            <SearchForm
                form={form}
                onSearch={handleSearch}
                loading={loading}
                className={className}
                initialValues={{
                    dateRange: [dayjs(), dayjs()]
                }}
                columnsPerRow={4}
                visibleRows={1}
                resetExpandOnReset
            >
                <FormDatePicker
                    name="dateRange"
                    label="조회일자"
                    isRange={true}
                    format="YYYY-MM-DD"
                    rules={[{ required: true, message: "조회일자를 선택해주세요." }]}
                />
                <FormSelect
                    name="asCurrency"
                    label="통화"
                    placeholder="전체"
                    comCodeParams={{
                        module: "GL",
                        type: "FRNCUR",
                        enabledFlag: "Y"
                    }}
                    allOptionLabel="전체"
                    allowClear
                />
            </SearchForm>
        );
    }
);

export default FilterPanel;

