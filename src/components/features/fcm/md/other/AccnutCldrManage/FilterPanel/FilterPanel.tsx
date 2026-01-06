import React, { useCallback, useEffect, useRef } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { Form } from "antd";
import { useTranslation } from "react-i18next";
import { SearchForm, FormDatePicker } from "@/components/ui/form";
import { useAccnutCldrManageStore } from "@/store/fcm/md/other/AccnutCldrManage";
import { useAuthStore } from "@store/com/auth/authStore";
import type { AccnutCldrManageSrchRequest } from "@/types/fcm/md/other/accnutCldrManage.types";

interface FilterPanelProps {
  className?: string;
  initialParams?: Record<string, unknown>;
  activeTabKey?: string; // 현재 활성 탭 키
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  className,
  initialParams,
  activeTabKey = "holiday", // 기본값: 휴일 탭
}) => {
  const { t } = useTranslation();
  const fetchCldrList = useAccnutCldrManageStore(
    (state) => state.fetchCldrList
  );
  const fetchRestdeList = useAccnutCldrManageStore(
    (state) => state.fetchRestdeList
  );
  const reset = useAccnutCldrManageStore((state) => state.reset);
  const loading = useAccnutCldrManageStore((state) => state.loading);
  const { user } = useAuthStore();

  const [form] = Form.useForm();
  const isInitialMountRef = useRef(true);

  // 초기값 설정 및 자동 조회
  useEffect(() => {
    if (isInitialMountRef.current && user?.officeId) {
      const defaultValues: Record<string, unknown> = {
        asOfficeId: user.officeId,
        asStndDate: dayjs(), // 오늘 날짜
      };

      if (initialParams) {
        Object.assign(defaultValues, initialParams);
      }

      form.setFieldsValue(defaultValues);
      isInitialMountRef.current = false;

      // 초기값 설정 후 자동 조회 실행
      const searchRequest: AccnutCldrManageSrchRequest = {
        asOfficeId: user.officeId,
        asStndDate: dayjs(defaultValues.asStndDate as Dayjs).format(
          "YYYY-MM-DD"
        ),
      };

      if (import.meta.env.DEV) {
        console.log("초기 조회 시작:", searchRequest);
      }

      // 최초 진입 시: 휴일 탭이 기본이므로 휴일 데이터만 조회
      fetchRestdeList(searchRequest)
        .then(() => {
          if (import.meta.env.DEV) {
            console.log("초기 조회 완료 (휴일 데이터)");
          }
        })
        .catch((error) => {
          if (import.meta.env.DEV) {
            console.error("초기 조회 중 오류 발생:", error);
          }
        });
    }
  }, [form, initialParams, user?.officeId, fetchRestdeList]);

  const handleSearch = useCallback(
    async (values: Record<string, unknown>) => {
      try {
        // form의 현재 값 확인 (asOfficeId는 Form.Item이 아니므로 form에서 직접 가져오기)
        const currentFormValues = form.getFieldsValue();

        // asOfficeId는 user 정보에서 가져오고, asStndDate는 form에서 가져오기
        const searchRequest: AccnutCldrManageSrchRequest = {
          asOfficeId: user?.officeId || "",
          asStndDate:
            values.asStndDate || currentFormValues.asStndDate
              ? dayjs(
                  (values.asStndDate || currentFormValues.asStndDate) as Dayjs
                ).format("YYYY-MM-DD")
              : dayjs().format("YYYY-MM-DD"),
        };

        if (import.meta.env.DEV) {
          console.log("조회 시작:", searchRequest, "활성 탭:", activeTabKey);
        }

        // 현재 활성 탭에 맞는 API만 호출
        if (activeTabKey === "holiday") {
          await fetchRestdeList(searchRequest);
        } else {
          await fetchCldrList(searchRequest);
        }

        if (import.meta.env.DEV) {
          console.log("조회 완료");
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("조회 중 오류 발생:", error);
        }
      }
    },
    [form, user?.officeId, activeTabKey, fetchCldrList, fetchRestdeList]
  );

  const handleReset = useCallback(() => {
    form.resetFields();
    form.setFieldsValue({
      asOfficeId: user?.officeId || "",
      asStndDate: dayjs(),
    });
    reset();
  }, [form, reset, user?.officeId]);

  return (
    <SearchForm
      form={form}
      onSearch={handleSearch}
      onReset={handleReset}
      loading={loading}
      showReset={true}
      visibleRows={1}
      columnsPerRow={4}
      className={className}
    >
      <FormDatePicker
        name="asStndDate"
        label={t("기준일자")}
        layout="horizontal"
      />
    </SearchForm>
  );
};

export default FilterPanel;
