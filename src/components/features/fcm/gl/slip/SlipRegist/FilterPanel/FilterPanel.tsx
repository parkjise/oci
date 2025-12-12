import React, { useState, useEffect } from "react";
import { Form, Tooltip, Button } from "antd";
import { FormSelect, FormDatePicker, FormInput } from "@components/ui/form";
import { FilterPanelStyles } from "./FilterPanel.styles";
import type { SlipRegistSrchRequest } from "@/types/fcm/gl/slip/SlipRegist/SlipRegist.types";
import { getCodeDetailApi } from "@apis/comCode";
import { useSlipRegist } from "@/store/fcm/gl/slip/SlipRegist/SlipRegist";
import { LoadingSpinner } from "@components/ui/feedback";
import dayjs from "dayjs";
// import { usePageModal } from "@hooks/usePageModal";
// import { AppPageModal } from "@components/ui/feedback";

// 작성부서 모달에서 반환할 타입 정의
// type Department = {
//   deptCode: string;
//   deptName: string;
// };

type SelectOption = {
  value: string;
  label: string;
};

type FilterPanelProps = {
  className?: string;
};

const FilterPanel: React.FC<FilterPanelProps> = ({ className }) => {
  const { handleSearch, loading, reset } = useSlipRegist();
  const [form] = Form.useForm();
  const [expanded, setExpanded] = useState(false);
  const [businessUnitOptions, setBusinessUnitOptions] = useState<SelectOption[]>([]);

  // 컴포넌트 마운트 시 상태 초기화
  useEffect(() => {
    reset();

    // 컴포넌트 언마운트 시 cleanup
    return () => {
      reset();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 작성부서 검색 모달 정의
  // const searchMakeDeptModal = usePageModal<{ initialId?: string }, Department>(
  //   React.lazy(() => import("@pages/sample/pageModal/DepartmentSearchModal")), // TODO: 실제 부서 검색 모달 컴포넌트 경로로 변경 필요
  //   {
  //     title: "작성부서 검색",
  //     centered: true,
  //     width: 600,
  //     height: 400,
  //     destroyOnHidden: true,
  //     onReturn: (value) => {
  //       // 모달에서 선택한 부서 정보를 form에 설정
  //       form.setFieldsValue({
  //         makeDept: value.deptCode,
  //         makeDeptName: value.deptName,
  //       });
  //     },
  //   }
  // );

  // 사업부 옵션 조회 (comCodeParams로 가져온 옵션에 "전체" 추가)
  useEffect(() => {
    const fetchBusinessUnitOptions = async () => {
      try {
        const response = await getCodeDetailApi({
          module: "PF",
          type: "ORG",
          enabledFlag: "Y",
        });

        if (import.meta.env.DEV) {
          console.log("사업부 옵션 조회 response:", response);
        }

        if (response.success && response.data) {
          const codeList = Array.isArray(response.data)
            ? response.data
            : [response.data];
          const transformedOptions: SelectOption[] = codeList
            .filter((item) => item.code && item.name1 && item.code !== "##")
            .map((item) => ({
              value: item.code as string,
              label: item.name1 as string,
            }));

          // "전체" 옵션을 맨 앞에 추가
          setBusinessUnitOptions([
            { value: "", label: "전체" },
            ...transformedOptions,
          ]);
        } else {
          setBusinessUnitOptions([{ value: "", label: "전체" }]);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("사업부 옵션 조회 실패:", error);
        }
        setBusinessUnitOptions([{ value: "", label: "전체" }]);
      }
    };

    fetchBusinessUnitOptions();
  }, []);

  // 회계일자 기본값을 이번 달 1일부터 오늘까지로 설정
  useEffect(() => {
    const today = dayjs();
    const firstDay = today.startOf("month");
    
    const initialValues: any = {
      dateRange: [firstDay, today],
    };

    if (businessUnitOptions.length > 0) {
      initialValues.dvs = ""; // "전체" 옵션의 값 (빈 문자열)
    }

    form.setFieldsValue(initialValues);
  }, [businessUnitOptions, form]);

  const handleFinish = (values: any) => {
    // 회계일자를 dateRange에서 dateFr, dateTr로 변환
    const dateRange = values["dateRange"] as [dayjs.Dayjs, dayjs.Dayjs] | undefined;
    const dateFr = dateRange && dateRange[0] ? dateRange[0].format("YYYYMMDD") : "";
    const dateTr = dateRange && dateRange[1] ? dateRange[1].format("YYYYMMDD") : "";

    const searchParams: SlipRegistSrchRequest = {
      asRpsnOffice: values["asRpsnOffice"] || "",
      dvs: values["dvs"] || "",
      dateFr,
      dateTr,
      slpHeaderId: values["slpHeaderId"] || "",
      makeDept: values["makeDept"] || "",
      makeDeptName: values["makeDeptName"] || "",
      makeUser: values["makeUser"] || "",
      makeUserName: values["makeUserName"] || "",
    };

    handleSearch(searchParams);
  };

  return (
    <>
      {loading && <LoadingSpinner />}
      <FilterPanelStyles className={className}>
        <Form form={form} name="slipSearch" onFinish={handleFinish} className="filter-panel__form">
          <FormSelect
            name="dvs"
            label="사업부"
            placeholder="전체"
            options={businessUnitOptions}
          />
          <FormDatePicker
            name="dateRange"
            label="회계일자"
            isRange={true}
          />
          <FormInput
            type="search"
            name="makeDeptName"
            label="작성부서"
            showReadOnlyBoxName="selectedValue"
            style={{ width: 150, paddingRight: 10 }}
            onSearch={() => {
              // searchMakeDeptModal.openModal({ initialId: value || undefined });
            }}
          />
          <FormInput
            type="search"
            name="makeUserName"
            label="작성자"
            showReadOnlyBoxName="selectedValue"
            style={{ width: 150, paddingRight: 10 }}
            onSearch={() => {
              // searchMakeUserModal.openModal({ initialId: value || undefined });
            }}
          />
        </Form>
        <div className="filter-panel__actions">
          <Tooltip title="조회">
            <Button
              htmlType="submit"
              icon={<i className="ri-search-line" />}
              className="filter-panel__actions-button"
              onClick={() => form.submit()}
            />
          </Tooltip>
          <Tooltip title={expanded ? "접기" : "펼치기"}>
            <Button
              icon={
                <i className="ri-arrow-down-s-line" style={{ fontSize: 18 }} />
              }
              className="filter-panel__actions-button"
              onClick={() => setExpanded(!expanded)}
            />
          </Tooltip>
        </div>
      </FilterPanelStyles>
      {/* <AppPageModal {...searchMakeDeptModal.modalProps} /> */}
    </>
  );
};

export default FilterPanel;
