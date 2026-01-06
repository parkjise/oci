/**
 * 계정코드 등록 검색 패널 (Account Code Filter Panel)
 * 
 * @description 계정코드 목록 조회를 위한 검색 조건을 설정하는 컴포넌트
 */

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
import { usePageModal } from "@/hooks/usePageModal";
import { AppPageModal } from "@/components/ui/feedback";
import { AcntInqirePopup } from "@/pages/com/popup";
import type { SelectedAccount } from "@/pages/com/popup/AcntInqirePopup";

type FilterPanelProps = {
  className?: string;
};

const FilterPanel: React.FC<FilterPanelProps> = ({ className }) => {
  const [form] = Form.useForm();
  const { user } = useAuthStore();
  const search = useAcntCodeRegistStore((state) => state.search);
  const loading = useAcntCodeRegistStore((state) => state.loading);
  const reset = useAcntCodeRegistStore((state) => state.reset);

  // 계정조회 팝업 모달 관리
  const acntModal = usePageModal<
    {
      asOfficeId?: string;
      initialAccCode?: string;
      initialSearch?: {
        asAccActYn?: string;
        asCstPayYn?: string;
        asAccLvl?: string;
      };
    },
    SelectedAccount
  >(AcntInqirePopup, {
    title: "계정조회",
    width: 700,
    onReturn: (value) => {
      form.setFieldsValue({
        asAccCode: value.accCode,
        asAccCodeNm: value.accName,
      });
    },
  });

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
          type="search"
          name="asAccCode"
          label="계정코드"
          showReadOnlyBoxName="asAccCodeNm"
          placeholder="계정코드 또는 명칭 입력"
          width="250px"
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e.target.value) {
              form.setFieldsValue({ asAccCode: "", asAccCodeNm: "" });
            }
          }}
          onSearch={(value) => {
            acntModal.openModal({
              initialAccCode: value || undefined,
              asOfficeId: user?.officeId,
              initialSearch: {
                asAccActYn: "Y",
                asCstPayYn: "N",
                asAccLvl: "05",
              },
            });
          }}
        />
        <FormSelect
          name="asUseYn"
          label="사용여부"
          options={[
            { value: "##", label: "전체" },
            { value: "Y", label: "사용" },
            { value: "N", label: "사용안함" },
          ]}
        />
      </SearchActions>

      {/* 계정조회 팝업 모달 */}
      <AppPageModal {...acntModal.modalProps} />
    </>
  );
};

export default FilterPanel;