

import React, { useCallback, useEffect, useMemo } from "react";
import { Form, message } from "antd";
import {
  FormInput,
  FormSelect,
  SearchActions,
} from "@components/ui/form";
import { useAuthStore } from "@store/com/auth/authStore";
import { useAcntCodeRegistStore } from "@/store/fcm/md/account/AcntCodeRegistStore";
import type { AcntCodeSrchRequest } from "@/types/fcm/md/account/AcntCodeRegist.types";

type FilterPanelProps = {
  className?: string;
};

const FilterPanel: React.FC<FilterPanelProps> = ({ className }) => {
  const [form] = Form.useForm();
  const { user } = useAuthStore();
  const search = useAcntCodeRegistStore((state) => state.search);
  const loading = useAcntCodeRegistStore((state) => state.loading);
  const reset = useAcntCodeRegistStore((state) => state.reset);


  // 초기값 메모제이션
  const initialValues = useMemo(() => ({
    asAccCode: "",
    asUseYn: "##",
  }), []);

  // 초기 상태 초기화
  useEffect(() => {
    reset();

    // 컴포넌트 언마운트 시 cleanup
    return () => {
      reset();
    };
  }, [reset]);

  const handleSearch = useCallback(async (values: any) => {
    if (!user?.officeId) {
      message.error("사무소 정보를 찾을 수 없습니다.");
      return;
    }

    const searchRequest: AcntCodeSrchRequest = {
      asOfficeId: user.officeId,
      asAccCode: values.asAccCode || undefined,
      asUseYn: values.asUseYn === "##" ? undefined : values.asUseYn,
    };

    await search(searchRequest);
  }, [user, search]);

  return (
    <>
      <SearchActions
        form={form}
        className={className}
        onSearch={handleSearch}
        loading={loading}
        initialValues={initialValues}
        visibleRows={1}
        columnsPerRow={4}
        showSearch={true}
        showReset={true}
      >
        <FormInput
          type="text"
          name="asAccCode"
          label="신용카드번호"
          showReadOnlyBoxName="asAccCodeNm"
          placeholder=""
          width="250px"
        />
        <FormInput
          type="text"
          name="asAccCode"
          label="소지자"
          showReadOnlyBoxName="asAccCodeNm"
          placeholder=""
          width="250px"
        />        
        <FormSelect
          name="asUseYn"
          label="사용여부"
          options={[
            { value: "##", label: "All" },
            { value: "Y", label: "Yes" },
            { value: "N", label: "No" },
          ]}
        />
      </SearchActions>

    </>
  );
};

export default FilterPanel;