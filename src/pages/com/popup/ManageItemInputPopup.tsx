import React, { useEffect, useMemo, useCallback } from 'react';
import { Form } from 'antd';
import { FormInput, FormDatePicker, FormSelect } from '@/components/ui/form';
import { usePageModal } from '@/hooks/usePageModal';
import { useAuthStore } from "@/store/com/auth/authStore";
import BcncInqirePopup from './BcncInqirePopup';
import PrjctInqirePopup from './PrjctInqirePopup';
import ProcsCodePopup from './ProcsCodePopup';
import PrdlstCodeInqirePopup from './PrdlstCodeInqirePopup';
import AcntInqirePopup from './AcntInqirePopup';
import BankCodeInqirePopup from './BankCodeInqirePopup';
import AcnutNoInqirePopup from './AcnutNoInqirePopup';
import ComCodeInqirePopup from './ComCodeInqirePopup';
import type { InjectedProps } from '@/components/ui/feedback/Modal/PageModal';
import { AppPageModal } from '@/components/ui/feedback/Modal';
import dayjs from 'dayjs';
import type {
    ManageItemData,
    ManageItemInputPopupProps
} from '@/types/com/popup/ManageItemInputPopup.types';
import { DataForm } from '@/components/ui/form';
import { selectManageItemNm } from '@/apis/fcm/gl/slip/SlipRegist/SlipRegist';

// 입력 컴포넌트들
interface InputProps {
    name: string;
    placeholder?: string;
    mode?: "view" | "edit";
    disabled?: boolean;
    style?: React.CSSProperties;
    type?: string;
    readOnly?: boolean;
    showReadOnlyBoxName?: string;
    onSearch?: () => void;
    comCodeParams?: any;
}

const TextInput = ({ name, placeholder, mode, disabled, style, type, readOnly }: InputProps) => (
    <FormInput
        name={name}
        label=""
        placeholder={placeholder}
        mode={mode}
        disabled={disabled}
        style={style}
        type={type}
        readOnly={readOnly}
    />
);

const DateInput = ({ name, placeholder, mode, disabled, style }: InputProps) => (
    <FormDatePicker
        name={name}
        label=""
        placeholder={placeholder}
        mode={mode}
        disabled={disabled}
        style={style}
    />
);

const SelectInput = ({ name, mode, disabled, comCodeParams }: InputProps) => (
    <FormSelect
        name={name}
        label=""
        mode={mode}
        disabled={disabled}
        comCodeParams={comCodeParams}
    />
);

const SearchInput = ({ name, placeholder, mode, disabled, showReadOnlyBoxName, onSearch }: InputProps) => (
    <FormInput
        name={name}
        label=""
        type="search"
        placeholder={placeholder}
        mode={mode}
        disabled={disabled}
        showReadOnlyBoxName={showReadOnlyBoxName}
        onSearch={onSearch}
    />
);

// 필드 설정 인터페이스
interface FieldConfig {
    key: string;
    label?: string;
    inputComponent: React.ComponentType<any>;
    labelKey?: string;
    required?: boolean;
    disabled?: boolean;
    colspan?: number;
    rowspan?: number;
    [key: string]: any;
}

// 필드 설정 헬퍼
const createField = ({
    key,
    label,
    inputComponent,
    labelKey,
    required,
    ...options
}: FieldConfig) => ({
    key,
    label: labelKey || label || key,
    labelKey,
    inputComponent: (props: any) =>
        React.createElement(inputComponent, { ...props, ...options }),
    required,
    ...options,
});

const ManageItemInputPopup: React.FC<
    ManageItemInputPopupProps & InjectedProps<ManageItemData>
> = ({ asOfficeId, initialData, returnValue, close, onConfirm }) => {
    const [form] = Form.useForm();
    const authUser = useAuthStore((state) => state.user);
    const [mgmtLabel1, setMgmtLabel1] = React.useState<string>(initialData?.accMgmtName1 || '관리항목 1');
    const [mgmtLabel2, setMgmtLabel2] = React.useState<string>(initialData?.accMgmtName2 || '관리항목 2');

    // 사무소 ID (prop이 없으면 로그인 유저 정보에서 가져옴)
    const officeId = asOfficeId || authUser?.officeId || '';

    // 관리항목 1 필드용 팝업 모달들
    const bcnc1Modal = usePageModal(BcncInqirePopup, {
        title: '거래처 조회', width: 1000, centered: true,
        onReturn: (data: any) => {
            console.log('[DEBUG] BcncInqirePopup return:', data);
            form.setFieldsValue({
                accMgmtNbr1: data.custno || data.custNo,
                accMgmtNbr1Nme: data.custname || data.custName
            });
        }
    });

    const prjct1Modal = usePageModal(PrjctInqirePopup, {
        title: '프로젝트 조회', width: 800, centered: true,
        onReturn: (data: any) => {
            console.log('[DEBUG] PrjctInqirePopup return:', data);
            form.setFieldsValue({
                accMgmtNbr1: data.projectId || data.projectCode,
                accMgmtNbr1Nme: data.projectName || data.pjtName
            });
        }
    });

    const acnt1Modal = usePageModal(AcntInqirePopup, {
        title: '계정 조회', width: 800, centered: true,
        onReturn: (data: any) => {
            console.log('[DEBUG] AcntInqirePopup return:', data);
            form.setFieldsValue({
                accMgmtNbr1: data.accCode,
                accMgmtNbr1Nme: data.accName
            });
        }
    });

    const prdlst1Modal = usePageModal(PrdlstCodeInqirePopup, {
        title: '품목 조회', width: 1000, centered: true,
        onReturn: (data: any) => {
            console.log('[DEBUG] PrdlstCodeInqirePopup return:', data);
            form.setFieldsValue({
                accMgmtNbr1: data.itemCode || data.matcode,
                accMgmtNbr1Nme: data.itemName || data.matname
            });
        }
    });

    const bank1Modal = usePageModal(BankCodeInqirePopup, {
        title: '은행 조회', width: 800, centered: true,
        onReturn: (data: any) => {
            console.log('[DEBUG] BankCodeInqirePopup return:', data);
            form.setFieldsValue({
                accMgmtNbr1: data.bankCode,
                accMgmtNbr1Nme: data.bankName || data.bankNm
            });
        }
    });

    // 관리항목 2 필드용 거래처 팝업
    const bcnc2Modal = usePageModal(BcncInqirePopup, {
        title: '거래처 조회', width: 1000, centered: true,
        onReturn: (data: any) => {
            console.log('[DEBUG] BcncInqirePopup(2) return:', data);
            form.setFieldsValue({
                accMgmtNbr2: data.custno || data.custNo,
                accMgmtNbr2Nme: data.custname || data.custName
            });
        }
    });

    const acnut2Modal = usePageModal(AcnutNoInqirePopup, {
        title: '계좌 조회', width: 800, centered: true,
        onReturn: (data: any) => {
            console.log('[DEBUG] AcnutNoInqirePopup return:', data);
            // 사용자 요청: 주 입력창(accMgmtNbr2)에 계좌명, 보조 박스(accNbrCode)에 계좌번호
            const values = {
                accMgmtNbr2: data.accNbrName || data.bankAccountName, // 계좌명 (Main)
                accMgmtNbr2Nme: data.accNbr || data.bankAccount,  // 계좌번호 (Sub/Legacy) - 이것이 관리항목2명으로 감
                accNbrCode: data.accNbrCode || data.bankAccount // 계좌번호 (ReadOnlyBox)
            };

            form.setFieldsValue(values);
        }
    });

    // 대체공정코드 팝업
    const procsModal = usePageModal(ProcsCodePopup, {
        title: '공정코드 조회', width: 1000, centered: true,
        onReturn: (data: any) => {
            form.setFieldsValue({ costCode: data.costCode, costCodeName: data.costCodeName });
        }
    });

    // 차량번호 조회 팝업 (관리항목 1)
    const vehicle1Modal = usePageModal(ComCodeInqirePopup, {
        title: '차량번호 조회', width: 800, centered: true,
        onReturn: (data: any) => {
            console.log('[DEBUG] ComCodeInqirePopup(Vehicle1) return:', data);
            form.setFieldsValue({
                accMgmtNbr1: data.code,
                accMgmtNbr1Nme: data.codeNme
            });
        }
    });

    // 차량번호 조회 팝업 (관리항목 2)
    const vehicle2Modal = usePageModal(ComCodeInqirePopup, {
        title: '차량번호 조회', width: 800, centered: true,
        onReturn: (data: any) => {
            console.log('[DEBUG] ComCodeInqirePopup(Vehicle2) return:', data);
            form.setFieldsValue({
                accMgmtNbr2: data.code,
                accMgmtNbr2Nme: data.codeNme
            });
        }
    });

    // 관리항목 명칭 조회
    useEffect(() => {
        const fetchMgmtLabels = async () => {
            let type1 = initialData?.accMgmtNbr1Type;
            let type2 = initialData?.accMgmtNbr2Type;

            console.log('[DEBUG] fetchMgmtLabels - raw type1:', type1, 'type2:', type2, 'officeId:', officeId);

            if (!type1 && !type2) {
                console.log('[DEBUG] fetchMgmtLabels - Types are missing, skipping API call.');
                return;
            }

            // Ensure 2-digit format (padding '0' if needed)
            if (type1 && type1.length === 1) type1 = `0${type1}`;
            if (type2 && type2.length === 1) type2 = `0${type2}`;

            // Add prefixes based on legacy logic
            const apiType1 = type1 ? `CUST${type1}` : "";
            const apiType2 = type2 ? `MNG${type2}` : "";

            console.log('[DEBUG] fetchMgmtLabels - padded type1:', type1, 'type2:', type2, 'apiTypes:', apiType1, apiType2);

            try {
                console.log('[DEBUG] fetchMgmtLabels - calling API...');
                const response = await selectManageItemNm({
                    asRpsnOffice: officeId,
                    accMgmtNbr1Type: apiType1,
                    accMgmtNbr2Type: apiType2
                });
                console.log('[DEBUG] fetchMgmtLabels - API response:', response);

                if (response.data) {
                    console.log('[DEBUG] fetchMgmtLabels - setting state:', response.data.accMgmtName1, response.data.accMgmtName2);
                    if (response.data.accMgmtName1) setMgmtLabel1(response.data.accMgmtName1);
                    if (response.data.accMgmtName2) setMgmtLabel2(response.data.accMgmtName2);
                }
            } catch (error) {
                console.error('[DEBUG] fetchMgmtLabels error:', error);
                // 에러 발생 시 기존 로직(또는 initialData) fallback
                setMgmtLabel1(initialData?.accMgmtName1 || '관리항목 1');
                setMgmtLabel2(initialData?.accMgmtName2 || '관리항목 2');
            }
        };

        fetchMgmtLabels();
    }, [initialData?.accMgmtNbr1Type, initialData?.accMgmtNbr2Type, officeId]);

    // 초기 데이터 매핑
    useEffect(() => {
        if (initialData) {
            const typeValue = String(initialData.accMgmtNbr2Type || '').trim();
            const isAccountType = typeValue === '06' || typeValue === '6';

            // 모든 필드를 폼에 세팅 (AntD Form은 Item name과 일치하는 키만 사용함)
            form.setFieldsValue({
                ...initialData,
                occurDate: initialData.occurDate ? dayjs(initialData.occurDate) : undefined,
                maturDate: initialData.maturDate ? dayjs(initialData.maturDate) : undefined,
                // 계좌형일 때 보조박스(accNbrCode)에 계좌번호를 세팅하기 위한 추가 매핑
                accNbrCode: isAccountType ? initialData.accMgmtNbr2 : undefined,
            });
        }
    }, [initialData, form]);

    const handleConfirm = useCallback(async () => {
        console.log('[DEBUG] handleConfirm - 클릭됨');
        try {
            const values = await form.validateFields();
            console.log('[DEBUG] handleConfirm - 유효성 검사 통과:', values);

            const allValues = form.getFieldsValue(true);
            const typeValue = String(initialData?.accMgmtNbr2Type || '').trim();
            const isAccountType = typeValue === '06' || typeValue === '6';

            // DetailGrid의 명칭 컬럼에 표시될 최종 값 결정
            const nme1 = form.getFieldValue("accMgmtNbr1Nme");
            const nme2 = isAccountType ? form.getFieldValue("accNbrCode") : form.getFieldValue("accMgmtNbr2Nme");

            const returnData: ManageItemData = {
                ...initialData,
                ...allValues,
                ...values,
                occurDate: values.occurDate ? dayjs(values.occurDate).format('YYYYMMDD') : undefined,
                maturDate: values.maturDate ? dayjs(values.maturDate).format('YYYYMMDD') : undefined,

                accMgmtNbr1Nme: nme1,
                accMgmtNbr2Nme: nme2,
                accMgmtNbr1: allValues.accMgmtNbr1,
                accMgmtNbr2: isAccountType ? allValues.accNbrCode : allValues.accMgmtNbr2,

                accMgmtNbr1Txt: nme1,
                accMgmtNbr2Txt: nme2,
                coId1: allValues.accMgmtNbr1,
                coId2: isAccountType ? allValues.accNbrCode : allValues.accMgmtNbr2,

                occurDateDt: values.occurDate ? dayjs(values.occurDate).format('YYYYMMDD') : undefined,
                maturDateDt: values.maturDate ? dayjs(values.maturDate).format('YYYYMMDD') : undefined,
            };

            console.log('[DEBUG] ManageItemInputPopup - 반환 직전 데이터:', returnData);

            returnValue(returnData);
            close();
        } catch (errorInfo) {
            console.error('[DEBUG] handleConfirm - 유효성 검사 실패 또는 에러:', errorInfo);
            // 안트 디자인 Form 필드 에러인 경우 상세 내용 출력
            if (errorInfo && (errorInfo as any).errorFields) {
                console.log('[DEBUG] 미입력 필드:', (errorInfo as any).errorFields);
            }
        }
    }, [form, initialData, returnValue, close]);

    // onConfirm이 전달되면 handleConfirm을 등록
    useEffect(() => {
        onConfirm?.(handleConfirm);
    }, [onConfirm, handleConfirm]);

    /**
     * 관리항목 1 팝업 호출
     */
    const handleAccMgmt1Search = () => {
        const type = initialData?.accMgmtNbr1Type;
        console.log('[DEBUG] handleAccMgmt1Search - type:', type, 'typeof:', typeof type);

        if (type === '01' || String(type) === '1') { // 은행
            bank1Modal.openModal({
                asOfficeId: officeId,
                initialBankCode: form.getFieldValue('accMgmtNbr1'),
            });
        } else if (type === '03' || type === '16' || String(type) === '3' || String(type) === '16') { // 거래처
            bcnc1Modal.openModal({
                asOfficeId: officeId,
                initialCustno: form.getFieldValue('accMgmtNbr1'),
            });
        } else if (type === '05' || String(type) === '5') { // 프로젝트
            prjct1Modal.openModal({
                asOfficeId: officeId,
                initialProjectCode: form.getFieldValue('accMgmtNbr1'),
            });
        } else if (type === '10' || String(type) === '10') { // 계정코드
            acnt1Modal.openModal({
                asOfficeId: officeId,
                initialAccCode: form.getFieldValue('accMgmtNbr1'),
            });
        } else if (type === '15' || String(type) === '15') { // 품목코드
            prdlst1Modal.openModal({
                asOfficeId: officeId,
                initialFind: form.getFieldValue('accMgmtNbr1'),
            });
        } else if (type === '14' || String(type) === '14') { // 차량번호
            console.log('[DEBUG] Opening vehicle1Modal...');
            vehicle1Modal.openModal({
                asOfficeId: officeId,
                asCodeTy: 'INVCAR',
                initialCode: form.getFieldValue('accMgmtNbr1'),
            });
        } else {
            console.warn(`Unsupported management type 1: ${type}`);
        }
    };

    /**
     * 관리항목 2 팝업 호출
     */
    const handleAccMgmt2Search = () => {
        const type = initialData?.accMgmtNbr2Type;
        console.log('[DEBUG] handleAccMgmt2Search - type:', type, 'typeof:', typeof type);

        if (type === '05' || type === '48' || String(type) === '5' || String(type) === '48') { // 거래처
            bcnc2Modal.openModal({
                asOfficeId: officeId,
                initialCustno: form.getFieldValue('accMgmtNbr2'),
            });
        } else if (type === '06' || String(type) === '6') { // 계좌
            // 관리항목 1이 금융기관('01')인 경우 해당 값을 필터로 사용
            const bankCode = initialData?.accMgmtNbr1Type === '01'
                ? form.getFieldValue('accMgmtNbr1')
                : undefined;

            acnut2Modal.openModal({
                asOfficeId: officeId,
                initialBankCode: bankCode,
                initialCurrency: initialData?.curr,
                initialAccCode: initialData?.accCode,
            });
        } else if (type === '18' || type === '43' || String(type) === '18' || String(type) === '43') { // 차량번호 (18, 43 둘 다)
            console.log('[DEBUG] Opening vehicle2Modal...');
            vehicle2Modal.openModal({
                asOfficeId: officeId,
                asCodeTy: 'INVCAR',
                initialCode: form.getFieldValue('accMgmtNbr2'),
            });
        } else {
            console.warn(`Unsupported management type 2: ${type}`);
        }
    };

    /**
     * 대체공정코드 팝업 호출
     */
    const handleCostCodeSearch = () => {
        procsModal.openModal({
            asOfficeId: officeId,
            initialCostCode: form.getFieldValue('costCode'),
        });
    };

    // 필드 활성화 여부 판단 로직 (OPT: 1-필수, 2-비활성, 3-선택)
    const isFieldRequired = (opt?: string) => opt === '1';
    const isFieldDisabled = (opt?: string) => opt === '2' || !opt;

    // 관리항목 라벨 결정 함수
    const getMgmtLabel = (index: number = 1) => {
        return index === 1 ? mgmtLabel1 : mgmtLabel2;
    };

    // 검색 입력 컴포넌트에서 Code를 메인으로, Name을 ReadOnlyBox로 표시하기 위해 Key 수정
    const tableRows = useMemo(() => {
        const typeValue = String(initialData?.accMgmtNbr2Type || '').trim();
        const isAccountType = typeValue === '06' || typeValue === '6';
        const mgmt2ReadOnlyBox = isAccountType ? "accNbrCode" : "accMgmtNbr2Nme";



        return [
            {
                fields: [
                    createField({
                        key: 'accMgmtNbr1',
                        label: getMgmtLabel(1),
                        required: isFieldRequired(initialData?.accMgmtNbr1Opt),
                        disabled: isFieldDisabled(initialData?.accMgmtNbr1Opt),
                        inputComponent: SearchInput,
                        showReadOnlyBoxName: "accMgmtNbr1Nme",
                        onSearch: handleAccMgmt1Search,
                        dataColspan: 3,
                    })
                ]
            },
            {
                fields: [
                    createField({
                        key: 'accMgmtNbr2',
                        label: getMgmtLabel(2),
                        required: isFieldRequired(initialData?.accMgmtNbr2Opt),
                        disabled: isFieldDisabled(initialData?.accMgmtNbr2Opt),
                        inputComponent: SearchInput,
                        showReadOnlyBoxName: mgmt2ReadOnlyBox,
                        onSearch: handleAccMgmt2Search,
                        dataColspan: 3,
                    })
                ]
            },
            {
                fields: [
                    createField({
                        key: 'occurDate',
                        label: '발생일자',
                        required: isFieldRequired(initialData?.occurDateOpt),
                        disabled: isFieldDisabled(initialData?.occurDateOpt),
                        inputComponent: DateInput,
                    }),
                    createField({
                        key: 'maturDate',
                        label: '만기일자',
                        required: isFieldRequired(initialData?.maturDateOpt),
                        disabled: isFieldDisabled(initialData?.maturDateOpt),
                        inputComponent: DateInput,
                    })
                ]
            },
            {
                fields: [
                    createField({
                        key: 'accRelAmt',
                        label: 'Reference',
                        required: isFieldRequired(initialData?.refOpt),
                        disabled: isFieldDisabled(initialData?.refOpt),
                        inputComponent: TextInput,
                        type: "number",
                    }),
                    createField({
                        key: 'intRate',
                        label: '이자율',
                        required: isFieldRequired(initialData?.exchgRateOpt),
                        disabled: isFieldDisabled(initialData?.exchgRateOpt),
                        inputComponent: TextInput,
                        type: "number",
                    })
                ]
            },
            {
                fields: [
                    createField({
                        key: '', // 빈 필드
                        label: '',
                        inputComponent: () => <div />,
                        readOnly: true,
                    }),
                    createField({
                        key: 'entExpnYn',
                        label: '접대비증빙',
                        required: initialData?.entItemYn === 'Y',
                        disabled: initialData?.entItemYn !== 'Y',
                        inputComponent: SelectInput,
                        comCodeParams: {
                            officeId: officeId,
                            module: 'GL',
                            type: 'ENTTYP'
                        },
                    }),
                ]
            },
            {
                fields: [
                    createField({
                        key: 'costCode',
                        label: '대체공정코드',
                        required: isFieldRequired(initialData?.cstCdeOpt),
                        disabled: isFieldDisabled(initialData?.cstCdeOpt),
                        inputComponent: SearchInput,
                        showReadOnlyBoxName: "costCodeName",
                        onSearch: handleCostCodeSearch,
                        dataColspan: 3,
                    })
                ]
            },
            {
                fields: [
                    createField({
                        key: 'accCode',
                        label: '계정코드',
                        inputComponent: TextInput,
                        disabled: true,
                        dataColspan: 3,
                    })
                ]
            },
            {
                fields: [
                    createField({
                        key: 'occurAmt',
                        label: '발생금액',
                        inputComponent: TextInput,
                        type: "number",
                        disabled: true,
                    }),
                    createField({
                        key: 'serAckSlp',
                        label: '번호',
                        inputComponent: TextInput,
                        disabled: true,
                    })
                ]
            },
            {
                fields: [
                    createField({
                        key: 'rem',
                        label: '적요',
                        inputComponent: TextInput,
                        dataColspan: 3,
                        disabled: true,
                    })
                ]
            }
        ];
    }, [initialData, officeId, handleAccMgmt1Search, handleAccMgmt2Search, handleCostCodeSearch, mgmtLabel1, mgmtLabel2]);

    return (
        <>
            <DataForm
                form={form}
                tableRows={tableRows}
                tableData={initialData || {}}
                mode="edit"
            />
            {/* 하위 팝업 모달들 */}
            <AppPageModal {...bcnc1Modal.modalProps} />
            <AppPageModal {...prjct1Modal.modalProps} />
            <AppPageModal {...acnt1Modal.modalProps} />
            <AppPageModal {...prdlst1Modal.modalProps} />
            <AppPageModal {...bank1Modal.modalProps} />
            <AppPageModal {...vehicle1Modal.modalProps} />
            <AppPageModal {...bcnc2Modal.modalProps} />
            <AppPageModal {...acnut2Modal.modalProps} />
            <AppPageModal {...vehicle2Modal.modalProps} />
            <AppPageModal {...procsModal.modalProps} />
        </>
    );
};

export default ManageItemInputPopup;
