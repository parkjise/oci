import { type FC, useEffect } from "react";
import styled from "styled-components";
import { Form } from "antd";
import {
    FormInput,
    FormDatePicker
} from "@components/ui";
import { usePageModal } from "@/hooks/usePageModal";
import { AppPageModal, type InjectedProps } from "@/components/ui/feedback/Modal";
import { useSlipCopyPopupStore } from "@/store/fcm/gl/slip/popup/SlipCopyPopupStore";
import type { SlipCopyPopupProps, SlipCopyPopupRequest } from "@/types/fcm/gl/slip/popup/SlipCopyPopup.types";
import dayjs from "dayjs";
import DeptInqirePopup from "@/pages/com/popup/DeptInqirePopup";

const PopupTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    border: 1px solid #d9d9d9;
    table-layout: fixed;

    th, td {
        border: 1px solid #d9d9d9;
        height: 36px;
        padding: 4px 8px;
        vertical-align: middle;
    }

    th {
        background-color: #f5f5f5;
        width: 100px;
        font-weight: 500;
        text-align: center;
        color: #333;
    }

    td {
        background-color: #fff;
    }

    .ant-form-item {
        margin-bottom: 0;
    }

    // Input height adjustments to match project style
    .ant-input, .ant-picker, .ant-input-search {
        height: 28px !important;
    }
`;

const SlipCopyPopup: FC<SlipCopyPopupProps & InjectedProps<any>> = ({ initialData, returnValue, setConfirmHandler }) => {
    const [form] = Form.useForm();
    const { handleCopySlip } = useSlipCopyPopupStore();

    // 초기값 설정
    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                newGlDate: initialData.sourceGlDate ? dayjs(initialData.sourceGlDate) : dayjs(),
                newDept: initialData.sourceDept,
                newDescription: initialData.sourceDescription,
                changeFrom: "",
                changeTo: "",
                deptName: initialData.sourceDeptName || ""
            });
        }
    }, [initialData, form]);

    // 부서 조회 팝업
    const deptModal = usePageModal(DeptInqirePopup, {
        title: "부서 조회",
        onReturn: (data: any) => {
            if (data) {
                form.setFieldsValue({
                    newDept: data.deptCode,
                    deptName: data.deptName
                });
            }
        }
    });

    const handleConfirm = async () => {
        try {
            const values = await form.validateFields();
            const request: SlipCopyPopupRequest = {
                sourceSlpHeaderId: initialData?.sourceSlpHeaderId,
                newGlDate: values.newGlDate ? values.newGlDate.format("YYYYMMDD") : dayjs().format("YYYYMMDD"),
                newDept: values.newDept,
                newDescription: values.newDescription,
                changeFrom: values.changeFrom,
                changeTo: values.changeTo
            };

            const success = await handleCopySlip(request);
            if (success && returnValue) {
                returnValue(true);
            }
        } catch (error) {
            console.error("Form validation failed:", error);
        }
    };

    // 모달 기본 확인 버튼에 핸들러 등록
    useEffect(() => {
        if (setConfirmHandler) {
            setConfirmHandler(() => handleConfirm());
        }
        return () => {
            if (setConfirmHandler) {
                setConfirmHandler(null);
            }
        };
    }, [setConfirmHandler, handleConfirm]);

    return (
        <div className="modal-body" style={{ padding: "0 20px 20px" }}>
            <Form form={form} component={false}>
                <div style={{ width: "650px" }}>
                    <PopupTable>
                        <tbody>
                            <tr>
                                <th>회계일자</th>
                                <td>
                                    <FormDatePicker
                                        name="newGlDate"
                                        label=""
                                        rules={[{ required: true, message: "회계일자를 입력하세요" }]}
                                    />
                                </td>
                                <th>작성부서</th>
                                <td>
                                    <FormInput
                                        type="search"
                                        name="newDept"
                                        label=""
                                        rules={[{ required: true, message: "작성부서를 입력하세요" }]}
                                        onPopupOpen={() => deptModal.openModal()}
                                        showReadOnlyBoxName="deptName"
                                        readOnly
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th>적요</th>
                                <td colSpan={3}>
                                    <FormInput
                                        name="newDescription"
                                        label=""
                                        rules={[{ required: true, message: "적요를 입력하세요" }]}
                                    />
                                </td>
                            </tr>
                            <tr>
                                <th>단어변경</th>
                                <td colSpan={3}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <FormInput
                                            name="changeFrom"
                                            label=""
                                            placeholder="변경할 문자열"
                                        />
                                        <span style={{ fontWeight: "bold", color: "#666", whiteSpace: "nowrap" }}>==&gt;</span>
                                        <FormInput
                                            name="changeTo"
                                            label=""
                                            placeholder="변경될 문자열"
                                        />
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </PopupTable>
                </div>
            </Form>
            <AppPageModal {...deptModal.modalProps} />
        </div>
    );
};

export default SlipCopyPopup;
