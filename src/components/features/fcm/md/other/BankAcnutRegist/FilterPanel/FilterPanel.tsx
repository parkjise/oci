import React, { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { SearchForm, FormSelect } from "@components/ui/form";
import { selectBankAcnutRegistList } from "@apis/fcm/md/other/bankAcnutRegist";
import type { BankAcnutRegistSrchRequest } from "@/types/fcm/md/other/bankAcnutRegist.types";
import { useAuthStore } from "@store/com/auth/authStore";
import { message } from "antd";
import type { BankAcnutRowData } from "../MainGrid/MainGrid";

type FilterPanelProps = {
    className?: string;
    setRowData: React.Dispatch<React.SetStateAction<BankAcnutRowData[]>>;
};

export interface FilterPanelHandle {
    handleSearch: (values?: BankAcnutRegistSrchRequest) => Promise<void>;
}

const FilterPanel = React.forwardRef<FilterPanelHandle, FilterPanelProps>(
    ({ className, setRowData }, ref) => {
        const { t } = useTranslation();
        const { user } = useAuthStore();
        const [loading, setLoading] = useState(false);
        const [lastSearchValues, setLastSearchValues] =
            useState<BankAcnutRegistSrchRequest>({});

        const handleSearch = useCallback(
            async (values: BankAcnutRegistSrchRequest = {}) => {
                try {
                    setLoading(true);
                    const searchValues = { ...lastSearchValues, ...values };
                    setLastSearchValues(searchValues);

                    const params: BankAcnutRegistSrchRequest = {
                        ...searchValues,
                        asOfficeId: user?.officeId,
                    };
                    const response = await selectBankAcnutRegistList(params);

                    if (response.success) {
                        const mappedData = response.data.map((item, index) => ({
                            ...item,
                            id: `${item.bankCode}_${item.accNbrCode}_${index}`,
                        }));
                        setRowData(mappedData);
                    }
                } catch (error) {
                    console.error("Search error:", error);
                    message.error("조회 중 오류가 발생했습니다.");
                } finally {
                    setLoading(false);
                }
            },
            [user, setRowData, lastSearchValues]
        );

        React.useImperativeHandle(ref, () => ({
            handleSearch,
        }));

        return (
            <SearchForm
                onSearch={handleSearch}
                loading={loading}
                className={className}
                initialValues={{
                    asBankType: "%",
                }}
            >
                <FormSelect
                    name="asBankType"
                    label={t("금융타입")}
                    options={[
                        { label: t("전체"), value: "%" },
                        { label: "은행", value: "BANK" },
                        { label: "생명보험", value: "LIFE INSU" },
                        { label: "손해보험", value: "FIRE INSU" },
                        { label: "증권사", value: "STOCK FIRM" },
                    ]}
                />
                <FormSelect
                    name="asBankCode"
                    label={t("금융사")}
                    placeholder={t("전체")}
                    comCodeParams={{
                        module: "GL",
                        type: "BNKCDE",
                        enabledFlag: "Y"
                    }}
                    allOptionLabel={t("전체")}
                    allowClear
                />
                <FormSelect
                    name="asBkGubun"
                    label={t("계좌종류")}
                    placeholder={t("전체")}
                    comCodeParams={{
                        module: "GL",
                        type: "ACCTGB",
                        enabledFlag: "Y"
                    }}
                    allOptionLabel={t("전체")}
                    allowClear
                />
            </SearchForm>
        );
    }
);

export default FilterPanel;
