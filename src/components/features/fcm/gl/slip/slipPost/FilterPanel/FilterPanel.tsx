import React, { useState, useEffect, useRef, useCallback } from "react";
import { Form, Button, Tooltip, message } from "antd";
import {
  FormInput,
  FormDatePicker,
  FormSelect,
  FormButton,
  FormRadioGroup,
} from "@components/ui/form";
import { FilterPanelStyles } from "./FilterPanel.styles";
import { getCodeDetailApi } from "@apis/comCode";
import { useAuthStore } from "@store/authStore";
import { useSlipPostStore } from "@store/slipPostStore";
import type { SlipPostSearchRequest } from "@/types/fcm/gl/slip/slipPost.types";
import dayjs from "dayjs";

type SelectOption = {
  value: string | number;
  label: string;
};

type FilterPanelProps = {
  className?: string;
  onPostYnChange?: (sPostYn: string) => void;
  onRefReady?: (ref: { handleSearch: () => Promise<void> }) => void;
};

const FilterPanel: React.FC<FilterPanelProps> = ({
  className,
  onPostYnChange,
  onRefReady,
}) => {
  const [form] = Form.useForm();
  const [expanded, setExpanded] = useState(false);
  const { user } = useAuthStore();
  const { search, loading, setSPostYn } = useSlipPostStore();
  const isInitialMount = useRef(true);
  const [businessUnitOptions, setBusinessUnitOptions] = useState<
    SelectOption[]
  >([]);
  const [slipTypeOptions, setSlipTypeOptions] = useState<SelectOption[]>([]);
  const [allSlipExptnSrcOptions, setAllSlipExptnSrcOptions] = useState<
    SelectOption[]
  >([]);
  const [slipExptnSrcOptions, setSlipExptnSrcOptions] = useState<
    SelectOption[]
  >([]);

  // 사업부 옵션 조회 (comCodeParams로 가져온 옵션에 "전체" 추가)
  useEffect(() => {
    const fetchBusinessUnitOptions = async () => {
      try {
        const response = await getCodeDetailApi({
          module: "PF",
          type: "ORG",
          enabledFlag: "Y",
        });

        console.log("사업부 옵션 조회 response:", response);

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

  // 전표유형 옵션 조회 (comCodeParams로 가져온 옵션에 "전체" 추가)
  useEffect(() => {
    const fetchSlipTypeOptions = async () => {
      try {
        const response = await getCodeDetailApi({
          module: "GL",
          type: "SLIPID",
          enabledFlag: "Y",
        });

        if (response.success && response.data) {
          const codeList = Array.isArray(response.data)
            ? response.data
            : [response.data];
          const transformedOptions: SelectOption[] = codeList
            .filter((item) => item.code && item.name1)
            .map((item) => ({
              value: item.code as string,
              label: item.name1 as string,
            }));

          // "전체" 옵션을 맨 앞에 추가
          setSlipTypeOptions([
            { value: "", label: "전체" },
            ...transformedOptions,
          ]);
        } else {
          setSlipTypeOptions([{ value: "", label: "전체" }]);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("전표유형 옵션 조회 실패:", error);
        }
        setSlipTypeOptions([{ value: "", label: "전체" }]);
      }
    };

    fetchSlipTypeOptions();
  }, []);

  // 전표유형상세 전체 옵션 조회 (한 번만 조회하여 저장)
  useEffect(() => {
    const fetchAllSlipExptnSrcOptions = async () => {
      try {
        const response = await getCodeDetailApi({
          module: "GL",
          type: "SLPORG",
          enabledFlag: "Y",
        });

        if (response.success && response.data) {
          const codeList = Array.isArray(response.data)
            ? response.data
            : [response.data];
          const transformedOptions: SelectOption[] = codeList
            .filter((item) => item.code && item.name1)
            .map((item) => ({
              value: item.code as string,
              label: item.name1 as string,
            }));

          setAllSlipExptnSrcOptions(transformedOptions);
        } else {
          setAllSlipExptnSrcOptions([]);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("전표유형상세 전체 옵션 조회 실패:", error);
        }
        setAllSlipExptnSrcOptions([]);
      }
    };

    fetchAllSlipExptnSrcOptions();
  }, []);

  // 사업부 기본값을 "전체"(빈값)로 설정, 회계일자는 이번 달 1일부터 오늘까지로 설정, 전표유형도 "전체"로 설정, sPostYn은 "UNPOST"(전기)로 설정
  useEffect(() => {
    const today = dayjs();
    const firstDay = today.startOf("month");

    const initialValues: {
      dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
      asDvs?: string;
      asSlipType?: string;
      sPostYn?: string;
    } = {
      dateRange: [firstDay, today],
      sPostYn: "UNPOST", // 첫 번째 라디오 버튼 "전기"를 기본값으로 설정
    };

    if (businessUnitOptions.length > 0) {
      initialValues.asDvs = ""; // "전체" 옵션의 값 (빈 문자열)
    }

    if (slipTypeOptions.length > 0) {
      initialValues.asSlipType = ""; // "전체" 옵션의 값 (빈 문자열)
    }

    form.setFieldsValue(initialValues);
  }, [businessUnitOptions, slipTypeOptions, form]);

  // 전표유형 값 감시
  const slipType = Form.useWatch("asSlipType", form);

  // sPostYn 값 감시 (라디오 버튼 변경 시 자동 조회)
  const sPostYn = Form.useWatch("sPostYn", form);

  // 전표유형상세 옵션 필터링 (전표유형 값에 따라 동적으로 변경)
  useEffect(() => {
    // 전표유형이 선택되지 않았거나 "전체"인 경우 옵션 초기화
    if (!slipType || slipType === "") {
      setSlipExptnSrcOptions([]);
      form.setFieldValue("asSlipExptnSrc", undefined);
      return;
    }

    // 전체 옵션에서 선택된 전표유형으로 시작하는 항목만 필터링
    // 예: 전표유형이 "E"이면 "E01", "E02", "E03" 등만 표시
    const filteredOptions = allSlipExptnSrcOptions.filter((option) =>
      String(option.value).startsWith(slipType)
    );

    // "전체" 옵션을 맨 앞에 추가
    setSlipExptnSrcOptions([{ value: "", label: "전체" }, ...filteredOptions]);

    // 전표유형이 변경되면 전표유형상세를 "전체"로 초기화
    form.setFieldValue("asSlipExptnSrc", "");
  }, [slipType, allSlipExptnSrcOptions, form]);

  // 조회 버튼 핸들러
  const handleSearch = useCallback(async () => {
    try {
      const values = await form.validateFields();

      if (!user?.officeId) {
        message.error("사무소 정보를 찾을 수 없습니다.");
        return;
      }

      // 날짜 범위 검증
      const dateRange = values.dateRange as
        | [dayjs.Dayjs, dayjs.Dayjs]
        | undefined;
      if (!dateRange || !dateRange[0] || !dateRange[1]) {
        message.error("회계일자를 선택해주세요.");
        return;
      }

      // sPostYn 값에 따라 asTgt 설정
      // UNPOST (전기) = 미전기 상태 = asTgt: "N"
      // POST (전기취소) = 전기 상태 = asTgt: "Y"
      let asTgtValue: string | undefined;
      if (values.sPostYn === "UNPOST") {
        asTgtValue = "N"; // 미전기 (전기 가능)
      } else if (values.sPostYn === "POST") {
        asTgtValue = "Y"; // 전기됨 (전기취소 가능)
      }

      // API 요청 파라미터 구성
      const searchRequest: SlipPostSearchRequest = {
        asRpsnOfficeId: user.officeId,
        asOfficeId: user.officeId,
        asFrDate: dateRange[0].format("YYYYMMDD"),
        asToDate: dateRange[1].format("YYYYMMDD"),
        asDvs: values.asDvs || undefined,
        asSlipType: values.asSlipType || undefined,
        asSlipExptnSrc: values.asSlipExptnSrc || undefined,
        asRem: values.asRem || undefined,
        asSlipNo: values.asSlipNo || undefined,
        // 기준화폐 정보 (기본값: KRW)
        asGCurr: "KRW",
        asGCurrDeci: "0",
        asGCurrFormat: "###,###,###",
        asTgt: asTgtValue,
      };

      // API 요청 파라미터 콘솔 출력
      console.log("=== API 요청 파라미터 ===");
      console.log("searchRequest:", searchRequest);
      console.log("Form values:", values);
      console.log("sPostYn:", values.sPostYn);
      console.log("asTgt 변환값:", asTgtValue);
      console.log("========================");

      // store의 search 함수 호출 (sPostYn도 함께 전달)
      await search(searchRequest, values.sPostYn);
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
  }, [form, user, search]);

  // sPostYn 값 변경 시 store 업데이트 및 자동 조회
  useEffect(() => {
    // sPostYn 값 변경 시 store에 저장
    if (sPostYn) {
      setSPostYn(sPostYn);
      // 상위 컴포넌트에 전달 (필요한 경우)
      if (onPostYnChange) {
        onPostYnChange(sPostYn);
      }
    }

    // 초기 마운트 시에는 조회하지 않음 (값만 저장)
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // sPostYn 값이 있을 때만 조회 실행
    if (sPostYn) {
      handleSearch();
    }
  }, [sPostYn, handleSearch, setSPostYn, onPostYnChange]);

  // 초기 마운트 시 sPostYn 값 store에 저장
  useEffect(() => {
    const initialSPostYn = form.getFieldValue("sPostYn");
    if (initialSPostYn) {
      setSPostYn(initialSPostYn);
      if (onPostYnChange) {
        onPostYnChange(initialSPostYn);
      }
    }
  }, [form, setSPostYn, onPostYnChange]);

  // ref를 통해 handleSearch를 외부에서 호출할 수 있도록 expose
  useEffect(() => {
    if (onRefReady) {
      onRefReady({
        handleSearch,
      });
    }
  }, [onRefReady, handleSearch]);

  return (
    <FilterPanelStyles className={className}>
      <Form form={form} style={{}} className="filter-panel__form">
        <FormSelect
          name="asDvs"
          label="사업부"
          placeholder="전체"
          className="filter-panel__field"
          options={businessUnitOptions}
        />
        <FormDatePicker
          name="dateRange"
          isRange={true}
          label="회계계일자"
          placeholder={["시작일", "종료일"]}
          className="filter-panel__field"
        />
        <FormSelect
          name="asSlipType"
          label="전표유형"
          placeholder="전체"
          className="filter-panel__field"
          options={slipTypeOptions}
        />
        <FormSelect
          name="asSlipExptnSrc"
          label=""
          placeholder="전체"
          className="filter-panel__field"
          disabled={!slipType || slipType === ""}
          options={slipExptnSrcOptions}
        />

        <FormInput
          name="asRem"
          label="대표적요"
          className="filter-panel__field"
        />
        <FormInput
          name="asSlipNo"
          label="Slip No."
          className="filter-panel__field"
        />
        <FormRadioGroup
          name="sPostYn"
          label=""
          options={[
            { value: "UNPOST", label: "전기" },
            { value: "POST", label: "전기취소" },
          ]}
          layout="horizontal"
        />

        {expanded && <></>}
      </Form>
      <div className="filter-panel__actions">
        <Tooltip title="조회">
          <Button
            icon={<i className="ri-search-line" style={{ fontSize: 18 }} />}
            className="filter-panel__actions-button"
            onClick={handleSearch}
            loading={loading}
          />
        </Tooltip>
        <Tooltip title={expanded ? "접기" : "펼치기"}>
          <FormButton
            icon={
              <i
                className={
                  expanded ? "ri-arrow-up-s-line" : "ri-arrow-down-s-line"
                }
                style={{ fontSize: 18 }}
              />
            }
            className="filter-panel__actions-button"
            onClick={() => setExpanded(!expanded)}
          />
        </Tooltip>
      </div>
    </FilterPanelStyles>
  );
};

export default FilterPanel;
