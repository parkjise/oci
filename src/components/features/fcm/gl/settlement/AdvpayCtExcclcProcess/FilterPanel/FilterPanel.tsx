import React, { useCallback, useRef, useEffect } from "react";
import { Form, message, Radio, Space, type FormInstance } from "antd";
import {
  FormDatePicker,
  FormSelect,
  SearchForm,
  FormInput,
  FormRadioGroup,
  FormButton,
} from "@components/ui/form";

import { useAuthStore } from "@store/com/auth/authStore";

import { usePageModal } from "@/hooks/usePageModal";
import { AppPageModal } from "@/components/ui/feedback";
import {
  DeptInqirePopup,
  BcncInqirePopup,
} from "@/pages/com/popup";
import type { SelectedDept } from "@/pages/com/popup/DeptInqirePopup";
import type { SelectedBcnc } from "@/pages/com/popup/BcncInqirePopup";

import { useAdvpayCtExcclcProcessStore } from "@/store/fcm/gl/settlement/AdvpayCtExcclcProcesStore";
import type {
  AdvpayCtExcclcProcessSearchRequest,
  AdvpayCtExcclcProcessDetailResponse,
} from "@/types/fcm/gl/settlement/AdvpayCtExcclcProcess";
import { confirm, showWarning } from "@components/ui/feedback/Message";
import dayjs from "dayjs";

export type FilterPanelRef = {
  handleSearch: () => Promise<void>;
  getCurrentSlipType: () => string | null;
  getCurrentGlDate: () => string | null;
};

type FilterPanelProps = {
  className?: string;
  onRefReady?: (ref: FilterPanelRef) => void;
};

// Internal component to capture Form instance from SearchForm
const FormWatcher: React.FC<{
  onFormInstanceReady: (instance: FormInstance) => void;
}> = ({ onFormInstanceReady }) => {
  const form = Form.useFormInstance();
  useEffect(() => {
    if (form) {
      onFormInstanceReady(form);
    }
  }, [form, onFormInstanceReady]);
  return null;
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  className,
  onRefReady,
}) => {
  // Form 인스턴스: useRef로 관리 (리렌더링 방지)
  const formRef = useRef<FormInstance | null>(null);
  const { user } = useAuthStore();
  const { search, loading, gridApi, updateGlgu } = useAdvpayCtExcclcProcessStore();

  // 부서조회 팝업 모달 관리
  const deptModal = usePageModal<
    {
      initialDeptCode?: string;
      asOfficeId?: string;
      asStndDate?: string;
    },
    SelectedDept
  >(DeptInqirePopup, {
    title: "부서조회",
    width: 700,
    onReturn: (value) => {
      formRef.current?.setFieldsValue({
        asDept: value.makeDept || "",
        "asDeptName": value.makeDeptName || "",
      });
    },
  });

  // 거래처조회 팝역 모달 관리
  const bcncModal = usePageModal<
    {
      initialCustno?: string;
      asOfficeId?: string;
      asUseYno?: string;
      asCustType?: string;
    },
    SelectedBcnc
  >(BcncInqirePopup, {
    title: "거래처조회",
    width: 700,
    onReturn: (value: SelectedBcnc) => {
      formRef.current?.setFieldsValue({
        asCust: value.custno || "",
        "asCustName": value.custname || "",
      });
    },
  });

  // 초기값 생성 함수 (중복 제거)
  const getInitialValues = useCallback(() => {
    const today = dayjs();
    const firstDay = today.startOf("month");

    return {
      dateRange: [firstDay, today] as [dayjs.Dayjs, dayjs.Dayjs],
      asRpsnOffice: "",
      asDept: "",
      asCust: "",
      slipType: "N",
      glProcess: "N",
      glDate: today
    };
  }, []);

  // Form 인스턴스 설정 함수
  const setForm = useCallback(
    (instance: FormInstance | null) => {
      formRef.current = instance;

      // Form 인스턴스가 설정되면 초기값 설정
      if (instance) {
        instance.setFieldsValue(getInitialValues());
      }
    },
    [getInitialValues]
  );

  // 초기화 핸들러 (SearchForm에 전달)
  const handleReset = useCallback(() => {
    if (!formRef.current) return;
    formRef.current.setFieldsValue(getInitialValues());
  }, [getInitialValues]);

  // 조회 버튼 핸들러
  const handleSearch = useCallback(async () => {
    if (!formRef.current) return;

    try {
      const values = await formRef.current.validateFields();

      if (!user?.officeId) {
        message.error("사무소 정보를 찾을 수 없습니다.");
        return;
      }

      // 날짜 범위 검증
      const dateRange = values.dateRange as
        | [dayjs.Dayjs, dayjs.Dayjs]
        | undefined;
      if (!dateRange || !dateRange[0] || !dateRange[1]) {
        message.error("적용년월을 선택해주세요.");
        return;
      }

      // API 요청 파라미터 구성
      const searchRequest: AdvpayCtExcclcProcessSearchRequest = {
        asOfficeId: user.officeId,
        asOrgId: values.asRpsnOffice || undefined,
        asDept: values.asDept || undefined,
        asSupplier: values.asCust || undefined,
        asMonthFr: dateRange[0].format("YYYYMM"),
        asMonthTo: dateRange[1].format("YYYYMM"),
        asRbYn: values.slipType ? values.slipType : undefined,
        asAttribute8: values.glProcess ? values.glProcess : undefined,
        // 기준통화 정보 (기본값: KRW)
        asGCurr: "KRW",
        asGCurrDeci: "0",
        asGCurrFormat: "###,###,###",
      };

      // API 요청 파라미터 콘솔 출력 (개발 환경에서만)
      if (import.meta.env.DEV) {
        console.log("=== API 요청 파라미터 ===");
        console.log("searchRequest:", searchRequest);
        console.log("Form values:", values);
        console.log("========================");
      }

      // store의 search 함수 호출
      await search(searchRequest);
    } catch (error) {
      if (error && typeof error === "object" && "errorFields" in error) {
        // Form validation error
        message.error("입력값을 확인해주세요.");
      } else {
        message.error("조회 중 오류가 발생했습니다.");
        if (import.meta.env.DEV) {
          console.error("조회 실패:", error);
        }
      }
    }
  }, [user, search]);

  // 현재 slipType 값 가져오기
  const getCurrentSlipType = useCallback((): string | null => {
    if (!formRef.current) return null;
    const values = formRef.current.getFieldsValue();
    return values.slipType || null;
  }, []);

  // 현재 GL Date 값 가져오기
  const getCurrentGlDate = useCallback((): string | null => {
    if (!formRef.current) return null;
    const values = formRef.current.getFieldsValue();
    const glDate = values.glDate as dayjs.Dayjs | undefined;
    return glDate ? glDate.format("YYYYMMDD") : null;
  }, []);

  // ref를 통해 메서드들을 외부에서 호출할 수 있도록 expose
  useEffect(() => {
    if (onRefReady) {
      onRefReady({
        handleSearch,
        getCurrentSlipType,
        getCurrentGlDate,
      });
    }
  }, [onRefReady, handleSearch, getCurrentSlipType, getCurrentGlDate]);

  return (
    <>
      <SearchForm
        onSearch={handleSearch}
        onReset={handleReset}
        loading={loading}
        showReset={true}
        visibleRows={2}
        columnsPerRow={4}
        className={className}
        initialValues={getInitialValues()}
      >
        <FormWatcher onFormInstanceReady={setForm} />
        <FormSelect
          name="asRpsnOffice"
          label="사업장"
          placeholder="전체"
          comCodeParams={{
            module: "PF",
            type: "ORG",
            enabledFlag: "Y",
          }}
          filterValues={["##"]}
          allOptionLabel="전체"
        />
        <FormDatePicker
          name="dateRange"
          isRange={true}
          label="작성일자"
          placeholder={["시작년월", "종료년월"]}
        />
        <FormInput
          type="search"
          name="asDept"
          label="귀속부서"
          width="250px"
          placeholder="귀속부서를 입력하세요"
          showReadOnlyBoxName="asDeptName"
          onSearch={(value) => {
            //귀속부서 팝열 열기
            deptModal.openModal({
              initialDeptCode: value || "",
              asOfficeId: user?.officeId,
              asStndDate: dayjs().format("YYYYMMDD"),
            });
          }}
        />
        <FormInput
          type="search"
          name="asCust"
          label="거래처"
          width="250px"
          placeholder="거래처를 입력하세요"
          showReadOnlyBoxName="asCustName"
          onSearch={(value) => {
            //거래처 팝열 열기
            bcncModal.openModal({
              initialCustno: value || "",
              asOfficeId: user?.officeId,
            });
          }}
        />
        <FormDatePicker
          name="glDate"
          isRange={false}
          label="GL Date"
          placeholder="GL Date를 선택하세요"
          format="YYYYMMDD"
        />
        <FormRadioGroup
          name="slipType"
          label=""
          options={[
            { label: "전표생성", value: "N" },
            { label: "전표취소", value: "Y" },
          ]}
          onChange={() => {
            // slipType 값 변경 시 자동 조회
            handleSearch();
          }}
        />
        <Form.Item
          name="glProcess"
          label="GL처리"
          colon={false}
          style={{ marginBottom: 0 }}
          initialValue="N"
        >
          <Space>
            <Radio.Group
              defaultValue="N"
              onChange={() => {
                // glProcess 값 변경 시 자동 조회
                handleSearch();
              }}
            >
              <Radio value="N">GL처리대상</Radio>
              <Radio value="Y">GL처리대상취소</Radio>
            </Radio.Group>
            <FormButton
              size="small"
              onClick={async () => {
                // 1. 그리드에서 체크된 행들 가져오기
                if (!gridApi) {
                  showWarning("그리드가 준비되지 않았습니다.");
                  return;
                }

                // 체크된 행들 찾기 (chk === "Y")
                const checkedRows: AdvpayCtExcclcProcessDetailResponse[] = [];
                gridApi.forEachNode((node) => {
                  if (node.data && node.data.chk === "Y") {
                    checkedRows.push(node.data as AdvpayCtExcclcProcessDetailResponse);
                  }
                });

                if (checkedRows.length === 0) {
                  showWarning("선택된 데이터가 없습니다.");
                  return;
                }

                // 2. GL처리 라디오 그룹 값 가져오기
                const glProcessValue = formRef.current?.getFieldValue("glProcess");

                // 3. 값 변환 (N -> Y, Y -> N)
                let newAttribute8: string;
                if (glProcessValue === "N") {
                  newAttribute8 = "Y";
                } else if (glProcessValue === "Y") {
                  newAttribute8 = "N";
                } else {
                  showWarning("GL처리 값을 확인할 수 없습니다.");
                  return;
                }

                // 4. 선택된 행들의 attribute8 업데이트
                const updatedRows = checkedRows.map((row) => ({
                  ...row,
                  attribute8: newAttribute8,
                }));

                // 5. 확인 후 API 호출
                confirm({
                  title: "확인",
                  content: "적용하시겠습니까?",
                  okText: "확인",
                  cancelText: "취소",
                  onOk: async () => {
                    await updateGlgu(updatedRows);
                  },
                });
              }}
            >
              적용
            </FormButton>
          </Space>
        </Form.Item>
      </SearchForm>
      <>
        {/* 부서조회 팝업 모달 - SearchActions 밖에 배치하여 정상 렌더링 보장 */}
        <AppPageModal {...deptModal.modalProps} />
        {/* 거래처조회 팝역 모달 - SearchActions 밖에 배치하여 정상 렌더링 보장 */}
        <AppPageModal {...bcncModal.modalProps} />
      </>
    </>
  );
};

export default FilterPanel;