import React, { useCallback, useRef, useState, useMemo } from "react";
import SearchGridSaveLayout from "@/components/ui/layout/SearchGridSaveLayout/SearchGridSaveLayout";
import GridSaveLayout from "@/components/ui/layout/GridSaveLayout";
import { FilterPanel, MainGrid } from "@components/features/fcm/md/other/EhgtRegist";
import type { EhgtRegistRowData, MainGridHandle } from "@components/features/fcm/md/other/EhgtRegist/MainGrid/MainGrid";
import type { FilterPanelHandle } from "@components/features/fcm/md/other/EhgtRegist/FilterPanel/FilterPanel";
import { Form, message, Space, Modal } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import type { Dayjs } from "dayjs";
import { FormDatePicker, FormButton } from "@components/ui/form";
import { cloneEhgtRegist, selectEhgtRegistCount } from "@apis/fcm/md/other/ehgtRegist";
import { DatePickerWrapper, CopyFormWrapper } from "@components/features/fcm/md/other/EhgtRegist/MainGrid/MainGrid.styles";
import { LoadingSpinner } from "@components/ui/feedback";

const EhgtRegist: React.FC = () => {
    const [rowData, setRowData] = useState<EhgtRegistRowData[]>([]);
    const [saving, setSaving] = useState(false);
    const [copyDateFrom, setCopyDateFrom] = useState<Dayjs | null>(null);
    const [copyDateTo, setCopyDateTo] = useState<Dayjs | null>(null);
    const filterPanelRef = useRef<FilterPanelHandle>(null);
    const mainGridRef = useRef<MainGridHandle>(null);
    const [copyForm] = Form.useForm();

    const handleSaveSuccess = useCallback(() => {
        filterPanelRef.current?.handleSearch();
    }, []);

    const handleSave = useCallback(() => {
        mainGridRef.current?.handleSave();
    }, []);

    const performCopy = useCallback(async (fromDate: string, toDate: string) => {
        try {
            setSaving(true);
            const params = {
                asCopyFr: dayjs(fromDate, "YYYYMMDD").format("YYYY-MM-DD"),
                asCopyTo: dayjs(toDate, "YYYYMMDD").format("YYYY-MM-DD"),
            };

            const response = await cloneEhgtRegist(params);

            if (response.success) {
                message.success(`환율 복사가 완료되었습니다. (${response.data}건)`);
                handleSaveSuccess();
            }
        } catch (error) {
            console.error("Copy error:", error);
            message.error("복사 중 오류가 발생했습니다.");
        } finally {
            setSaving(false);
        }
    }, [handleSaveSuccess]);

    const handleCopyExchangeRate = useCallback(async () => {
        if (!copyDateFrom || !copyDateTo) {
            message.warning("복사할 From/To 날짜를 선택해주세요.");
            return;
        }

        const fromStr = copyDateFrom.format("YYYYMMDD");
        const toStr = copyDateTo.format("YYYYMMDD");

        try {
            const countParams = {
                asCopyTo: dayjs(toStr, "YYYYMMDD").format("YYYY-MM-DD"),
            };
            const countResponse = await selectEhgtRegistCount(countParams);

            if (countResponse.success && countResponse.data?.dupCnt && countResponse.data.dupCnt > 0) {
                Modal.confirm({
                    title: "중복 데이터 확인",
                    content: `복사 대상일자(${dayjs(toStr, "YYYYMMDD").format("YYYY-MM-DD")})에 ${countResponse.data.dupCnt}건의 데이터가 존재합니다. 덮어쓰시겠습니까?`,
                    onOk: () => performCopy(fromStr, toStr),
                });
            } else {
                performCopy(fromStr, toStr);
            }
        } catch (error) {
            console.error("Copy check error:", error);
            message.error("복사 확인 중 오류가 발생했습니다.");
        }
    }, [copyDateFrom, copyDateTo, performCopy]);

    const customButtons = useMemo(() => [
        <CopyFormWrapper key="copy-exchange-rate-form">
            <Form form={copyForm} layout="inline" onValuesChange={(changedValues: { copyDateFrom?: Dayjs | null; copyDateTo?: Dayjs | null }) => {
                if (changedValues.copyDateFrom !== undefined) {
                    setCopyDateFrom(changedValues.copyDateFrom);
                }
                if (changedValues.copyDateTo !== undefined) {
                    setCopyDateTo(changedValues.copyDateTo);
                }
            }}>
                <Space size={8}>
                    <span>환율 복사:</span>
                    <span>From</span>
                    <DatePickerWrapper>
                        <FormDatePicker
                            name="copyDateFrom"
                            label=""
                            format="YYYY-MM-DD"
                        />
                    </DatePickerWrapper>
                    <span>→</span>
                    <span>To</span>
                    <DatePickerWrapper>
                        <FormDatePicker
                            name="copyDateTo"
                            label=""
                            format="YYYY-MM-DD"
                        />
                    </DatePickerWrapper>
                    <FormButton
                        type="default"
                        icon={<CopyOutlined />}
                        size="small"
                        onClick={handleCopyExchangeRate}
                    >
                        복사
                    </FormButton>
                </Space>
            </Form>
        </CopyFormWrapper>
    ], [copyForm, handleCopyExchangeRate]);

    return (
        <>
            {saving && <LoadingSpinner />}
            <SearchGridSaveLayout
                filterPanel={
                    <FilterPanel
                        ref={filterPanelRef}
                        className="page-layout__filter-panel"
                        setRowData={setRowData}
                    />
                }
                grid={
                    <GridSaveLayout
                        onSave={handleSave}
                        buttonGroupProps={{
                            customButtons: customButtons,
                            showCustomButtonsDivider: true,
                            showAllCustomButtons: true
                        }}
                    >
                        <MainGrid
                            ref={mainGridRef}
                            className="page-layout__main-grid"
                            rowData={rowData}
                            setRowData={setRowData}
                            onSaveSuccess={handleSaveSuccess}
                            setSaving={setSaving}
                        />
                    </GridSaveLayout>
                }
                gridClassName="page-card--detail-grid"
            />
        </>
    );
};

export default EhgtRegist;


