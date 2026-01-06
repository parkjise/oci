// ============================================================================
// 메뉴 상세 폼 컴포넌트
// ============================================================================

import React, { useMemo, useCallback } from "react";
import {
  FormInput,
  FormSelect,
  FormTextArea,
  type TableField,
} from "@components/ui/form";
import { useTranslation } from "react-i18next";
import { useMenuMngStore } from "@store/system/pgm/access/menu/menuMngStore";
import dayjs from "dayjs";
import { StyledDataForm } from "./MenuDetailForm.styles";

// ============================================================================
// Types & Helpers from DetailView pattern
// ============================================================================

type InputComponentType = NonNullable<TableField["inputComponent"]>;

const TextInput: InputComponentType = (props) => (
  <FormInput {...(props as any)} label="" />
);

const NumberInput: InputComponentType = (props) => (
  <FormInput {...(props as any)} label="" type="number" />
);

const SelectInput: InputComponentType = (props) => (
  <FormSelect {...(props as any)} label="" />
);

const TextAreaInput: InputComponentType = (props) => (
  <FormTextArea {...(props as any)} label="" />
);

const createField = ({
  key = "",
  label = "",
  inputComponent,
  inputProps,
  ...restOptions
}: any) => {
  let wrappedComponent = inputComponent;
  if (inputProps && inputComponent) {
    wrappedComponent = (props: any) =>
      React.createElement(inputComponent, { ...props, ...inputProps });
  }

  return {
    key,
    label,
    inputComponent: wrappedComponent,
    ...restOptions,
  };
};

// ============================================================================
// Component
// ============================================================================
const MenuDetailForm: React.FC = () => {
  const { t } = useTranslation();
  const { selectedMenu, setSelectedMenu, isModified, setIsModified, sanitizeAndSave } =
    useMenuMngStore();

  const handleValuesChange = useCallback(
    (changedValues: any, allValues: any) => {
      const newMenuState = { ...selectedMenu, ...allValues };

      // Handle DateRange specific logic
      if (changedValues.effectiveDateRange) {
        const dates = changedValues.effectiveDateRange;
        if (dates && dates[0] && dates[1]) {
          newMenuState.effectiveDateFrom = dates[0].format("YYYYMMDD");
          newMenuState.effectiveDateTo = dates[1].format("YYYYMMDD");
        } else {
          newMenuState.effectiveDateFrom = undefined;
          newMenuState.effectiveDateTo = undefined;
        }
        delete newMenuState.effectiveDateRange;
      }

      setSelectedMenu(newMenuState);
      if (!isModified) setIsModified(true);
    },
    [selectedMenu, setSelectedMenu, isModified, setIsModified]
  );

  const handleSave = useCallback(async () => {
    await sanitizeAndSave();
  }, [sanitizeAndSave]);

  // Convert selectedMenu to form values
  const initialValues = useMemo(() => {
    if (!selectedMenu) return {};
    const values: any = { ...selectedMenu };

    values.useMenu =
      selectedMenu.useMenu === "Y" || (selectedMenu as any).useMenu === true;
    values.hidden =
      selectedMenu.hidden === "Y" || (selectedMenu as any).hidden === true;

    if (selectedMenu.effectiveDateFrom && selectedMenu.effectiveDateTo) {
      values.effectiveDateRange = [
        dayjs(selectedMenu.effectiveDateFrom, "YYYYMMDD"),
        dayjs(selectedMenu.effectiveDateTo, "YYYYMMDD"),
      ];
    }
    return values;
  }, [selectedMenu]);

  const tableRows = useMemo(
    () => [
      {
        fields: [
          createField({
            key: "pgmNo",
            label: t("메뉴번호"),
            inputComponent: TextInput,
            inputProps: { readOnly: true },
          }),
          createField({
            key: "parentPgmNo",
            label: t("부모메뉴번호"),
            inputComponent: TextInput,
            inputProps: { readOnly: true },
          }),
          createField({
            key: "pgmType",
            label: t("메뉴타입"),
            inputComponent: SelectInput,
            inputProps: {
              comCodeParams: {
                module: "SYS",
                type: "00000002",
                enabledFlag: "Y",
              },
            },
          }),
          createField({
            key: "windowId",
            label: t("메뉴ID"),
            inputComponent: TextInput,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "pgmName",
            label: t("메뉴명"),
            inputComponent: TextInput,
          }),
          createField({
            key: "useYn",
            label: t("프로그램"),
            inputComponent: SelectInput,
            inputProps: {
              comCodeParams: {
                module: "SYS",
                type: "00000003",
                enabledFlag: "Y",
              },
            },
          }),
          createField({
            key: "sort",
            label: t("SORT"),
            inputComponent: NumberInput,
          }),
          createField({
            key: "lKey",
            label: t("레이블키"),
            inputComponent: TextInput,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "path",
            label: t("PATH"),
            inputComponent: TextInput,
            dataColspan: 7,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "initParam",
            label: t("파라메터"),
            inputComponent: TextAreaInput,
            inputProps: { rows: 4 },
            dataColspan: 7,
          }),
        ],
      },
      {
        fields: [
          createField({
            key: "helpUrl",
            label: t("도움말"),
            inputComponent: TextInput,
            dataColspan: 7,
          }),
        ],
      },
    ],
    [t]
  );

  const actionButtonGroup = useMemo(
    () => ({
      onButtonClick: {
        save: handleSave,
      },
      hideButtons: ["create", "copy", "delete", "edit"] as any[],
    }),
    [handleSave]
  );

  if (!selectedMenu) {
    return <div style={{ padding: 20 }}>{t("메뉴를 선택해주세요.")}</div>;
  }

  return (
    <StyledDataForm
      key={selectedMenu.pgmNo}
      className="menu-detail-form"
      tableRows={tableRows}
      tableData={initialValues}
      onValuesChange={handleValuesChange}
      actionButtonGroup={actionButtonGroup}
      mode="edit"
    />
  );
};

export default MenuDetailForm;
