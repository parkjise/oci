// ============================================================================
// 메뉴 상세 폼 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import { useEffect, useImperativeHandle, forwardRef } from "react";
import { Form, Tooltip } from "antd";
import {
  FormInput,
  FormSelect,
  FormCheckbox,
  FormTextArea,
  FormDatePicker,
} from "@components/ui/form";
import { useTranslation } from "react-i18next";
import type { MenuDto } from "@apis/system/menu/menuApi";
import { MenuDetailFormStyles } from "./MenuDetailForm.styles";
import dayjs from "dayjs";

// ============================================================================
// Types
// ============================================================================
interface MenuDetailFormProps {
  menu?: MenuDto;
  onValuesChange?: (changedValues: Partial<MenuDto>, allValues: MenuDto) => void;
}

export interface MenuDetailFormRef {
  getFormValues: () => MenuDto;
}

// ============================================================================
// Component
// ============================================================================
const MenuDetailForm = forwardRef<MenuDetailFormRef, MenuDetailFormProps>(({
  menu,
  onValuesChange,
}, ref) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<MenuDto>();

  // ref를 통해 폼 값을 가져올 수 있도록 expose
  useImperativeHandle(ref, () => ({
    getFormValues: () => {
      const formValues = form.getFieldsValue() as any;
      const result: MenuDto = { ...formValues };
      
      // effectiveDateRange가 있으면 effectiveDateFrom, effectiveDateTo로 변환
      if (formValues.effectiveDateRange && Array.isArray(formValues.effectiveDateRange)) {
        const dates = formValues.effectiveDateRange;
        if (dates[0] && dates[1]) {
          // dayjs 객체인 경우
          if (dates[0].format && dates[1].format) {
            result.effectiveDateFrom = dates[0].format("YYYYMMDD");
            result.effectiveDateTo = dates[1].format("YYYYMMDD");
          } else if (typeof dates[0] === 'string' && typeof dates[1] === 'string') {
            // 문자열인 경우 (ISO 형식 등)
            const fromDate = dayjs(dates[0]);
            const toDate = dayjs(dates[1]);
            if (fromDate.isValid() && toDate.isValid()) {
              result.effectiveDateFrom = fromDate.format("YYYYMMDD");
              result.effectiveDateTo = toDate.format("YYYYMMDD");
            }
          }
        }
        // effectiveDateRange는 제거
        delete (result as any).effectiveDateRange;
      }
      
      // effectiveDateFrom, effectiveDateTo가 이미 있으면 그대로 사용
      return result;
    },
  }));

  // 메뉴 데이터가 변경되면 폼 업데이트
  useEffect(() => {
    if (menu) {
      const formValues: any = { ...menu };
      // DB 값(Y/N) 또는 boolean 값을 체크박스에서 사용할 boolean으로 변환
      const useMenuValue: any = menu.useMenu;
      const hiddenValue: any = menu.hidden;
      formValues.useMenu = useMenuValue === "Y" || useMenuValue === true;
      formValues.hidden = hiddenValue === "Y" || hiddenValue === true;
      // 날짜 문자열을 dayjs 객체로 변환 (YYYYMMDD 형식)
      if (menu.effectiveDateFrom && menu.effectiveDateTo) {
        const fromDate =
          menu.effectiveDateFrom.length === 8
            ? dayjs(menu.effectiveDateFrom, "YYYYMMDD")
            : dayjs(menu.effectiveDateFrom);
        const toDate =
          menu.effectiveDateTo.length === 8
            ? dayjs(menu.effectiveDateTo, "YYYYMMDD")
            : dayjs(menu.effectiveDateTo);
        formValues.effectiveDateRange = [fromDate, toDate];
      }
      form.setFieldsValue(formValues);
    } else {
      form.resetFields();
    }
  }, [menu, form]);

  // 폼 값 변경 핸들러
  const handleValuesChange = (
    changedValues: Partial<MenuDto>,
    allValues: MenuDto
  ) => {
    const normalized: Partial<MenuDto> = { ...changedValues };

    // 체크박스 값 boolean -> "Y"/"N" 변환
    if (typeof normalized.useMenu === "boolean") {
      normalized.useMenu = normalized.useMenu ? "Y" : "N";
      allValues.useMenu = normalized.useMenu;
    }
    if (typeof normalized.hidden === "boolean") {
      normalized.hidden = normalized.hidden ? "Y" : "N";
      allValues.hidden = normalized.hidden;
    }

    if (onValuesChange) {
      onValuesChange(normalized, allValues);
    }
  };

  // label 조회 함수 (한글명으로 조회, 없으면 키 반환)
  const getLabel = (key: string): string => {
    const value = t(key);
    return value !== key ? value : key;
  };

  // label desc 조회 함수 (말풍선용)
  const getLabelDesc = (key: string): string | undefined => {
    const descKey = `${key}_desc`;
    const value = t(descKey);
    return value !== descKey ? value : undefined;
  };

  return (
    <MenuDetailFormStyles>
      <Form
        form={form}
        layout="vertical"
        onValuesChange={handleValuesChange}
        colon={false}
      >
        <table className="menu-detail-form__table">
          <tbody>
            <tr>
              <th>
                <Tooltip title={getLabelDesc("메뉴번호")}>
                  {t("메뉴번호")}
                </Tooltip>
              </th>
              <td colSpan={5}>
                <FormInput
                  name="pgmNo"
                  label=""
                  readOnly
                  style={{ width: "100%" }}
                />
              </td>
              <th>
                <Tooltip title={getLabelDesc("부모메뉴번호")}>
                  {getLabel("부모메뉴번호")}
                </Tooltip>
              </th>
              <td colSpan={5}>
                <FormInput
                  name="parentPgmNo"
                  label=""
                  readOnly
                  style={{ width: "100%" }}
                />
              </td>
            </tr>
            <tr>
              <th>
                <Tooltip title={getLabelDesc("메뉴타입")}>
                  {getLabel("메뉴타입")}
                </Tooltip>
              </th>
              <td colSpan={5}>
                <FormSelect
                  name="pgmType"
                  label=""
                  comCodeParams={{
                    module: "SYS",
                    type: "00000002",
                    enabledFlag: "Y",
                  }}
                  style={{ width: "100%" }}
                />
              </td>
              <th>
                <Tooltip title={getLabelDesc("메뉴ID")}>
                  {getLabel("메뉴ID")}
                </Tooltip>
              </th>
              <td colSpan={5}>
                <FormInput
                  name="windowId"
                  label=""
                  style={{ width: "100%" }}
                />
              </td>
            </tr>
            <tr>
              <th>
                <Tooltip title={getLabelDesc("메뉴명")}>
                  {getLabel("메뉴명")}
                </Tooltip>
              </th>
              <td colSpan={11}>
                <FormInput
                  name="pgmName"
                  label=""
                  style={{ width: "100%" }}
                />
              </td>
            </tr>
            <tr>
              <th className="checkbox-th">
                <Tooltip title={getLabelDesc("메뉴")}>
                  {getLabel("메뉴")}
                </Tooltip>
              </th>
              <td className="checkbox-td">
                <FormCheckbox name="useMenu" label="" />
              </td>
              <th className="checkbox-th">
                <Tooltip title={getLabelDesc("숨김")}>
                  {getLabel("숨김")}
                </Tooltip>
              </th>
              <td className="checkbox-td">
                <FormCheckbox name="hidden" label="" />
              </td>
              <th>
                <Tooltip title={getLabelDesc("프로그램")}>
                  {getLabel("프로그램")}
                </Tooltip>
              </th>
              <td>
                <FormSelect
                  name="useYn"
                  label=""
                  comCodeParams={{
                    module: "SYS",
                    type: "00000003",
                    enabledFlag: "Y",
                  }}
                  style={{ width: "100%" }}
                />
              </td>
              <th className="period-th">
                <Tooltip title={getLabelDesc("기간")}>
                  {getLabel("기간")}
                </Tooltip>
              </th>
              <td className="period-td" colSpan={1}>
                <FormDatePicker
                  name="effectiveDateRange"
                  label=""
                  isRange
                  style={{ width: "100%" }}
                  format="YYYY-MM-DD"
                  onChange={(dates) => {
                    // 현재 폼의 모든 값 가져오기
                    const currentValues = form.getFieldsValue();
                    
                    if (dates && dates[0] && dates[1]) {
                      const effectiveDateFrom = dates[0].format("YYYYMMDD");
                      const effectiveDateTo = dates[1].format("YYYYMMDD");
                      
                      // 폼에 값 설정
                      form.setFieldsValue({
                        effectiveDateFrom,
                        effectiveDateTo,
                      });
                      
                      // 업데이트된 전체 값 객체 생성 (명시적으로 날짜 필드 포함)
                      const updatedValues: MenuDto = {
                        ...currentValues,
                        effectiveDateFrom,
                        effectiveDateTo,
                      } as MenuDto;
                      
                      // 상위 컴포넌트에 변경사항 전달
                      handleValuesChange(
                        {
                          effectiveDateFrom,
                          effectiveDateTo,
                        },
                        updatedValues
                      );
                    } else {
                      // 날짜가 없으면 undefined로 설정
                      form.setFieldsValue({
                        effectiveDateFrom: undefined,
                        effectiveDateTo: undefined,
                      });
                      
                      // 업데이트된 전체 값 객체 생성
                      const updatedValues: MenuDto = {
                        ...currentValues,
                        effectiveDateFrom: undefined,
                        effectiveDateTo: undefined,
                      } as MenuDto;
                      
                      // 상위 컴포넌트에 변경사항 전달
                      handleValuesChange(
                        {
                          effectiveDateFrom: undefined,
                          effectiveDateTo: undefined,
                        },
                        updatedValues
                      );
                    }
                  }}
                />
              </td>
              <th className="sort-th">
                <Tooltip title={getLabelDesc("SORT")}>
                  {getLabel("SORT")}
                </Tooltip>
              </th>
              <td className="sort-td">
                <FormInput
                  name="sort"
                  label=""
                  type="number"
                  style={{ width: "100%" }}
                />
              </td>
            </tr>
            <tr>
              <th>
                <Tooltip title={getLabelDesc("Label Key")}>
                  {getLabel("Label Key")}
                </Tooltip>
              </th>
              <td colSpan={11}>
                <FormInput
                  name="lKey"
                  label=""
                  style={{ width: "100%" }}
                />
              </td>
            </tr>
            <tr>
              <th>
                <Tooltip title={getLabelDesc("PATH")}>
                  {getLabel("PATH")}
                </Tooltip>
              </th>
              <td colSpan={11}>
                <FormInput
                  name="path"
                  label=""
                  style={{ width: "100%" }}
                />
              </td>
            </tr>
            <tr>
              <th>
                <Tooltip title={getLabelDesc("파라메터")}>
                  {getLabel("파라메터")}
                </Tooltip>
              </th>
              <td colSpan={11}>
                <FormTextArea
                  name="initParam"
                  label=""
                  rows={4}
                  style={{ width: "100%" }}
                />
              </td>
            </tr>
            <tr>
              <th>
                <Tooltip title={getLabelDesc("도움말")}>
                  {getLabel("도움말")}
                </Tooltip>
              </th>
              <td colSpan={11}>
                <FormInput
                  name="helpUrl"
                  label=""
                  style={{ width: "100%" }}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Form>
    </MenuDetailFormStyles>
  );
});

MenuDetailForm.displayName = "MenuDetailForm";

export default MenuDetailForm;


