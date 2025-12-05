// ============================================================================
// 권한 상세 폼 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import React, { useEffect } from "react";
import { Form, Tooltip, Button } from "antd";
import { FormInput, FormSelect } from "@components/ui/form";
import { useTranslation } from "react-i18next";
import type { RoleDto } from "@apis/system/permission/permissionApi";
import type { CodeDetail } from "@/types/api.types";
import { RoleDetailFormStyles } from "./RoleDetailForm.styles";

// ============================================================================
// Types
// ============================================================================
interface RoleDetailFormProps {
  role?: RoleDto;
  authTypeList: CodeDetail[];
  onUpdateRoleName?: (roleNo: string, roleName: string) => void;
}

// ============================================================================
// Component
// ============================================================================
const RoleDetailForm: React.FC<RoleDetailFormProps> = ({
  role,
  authTypeList,
  onUpdateRoleName,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm<RoleDto>();

  // 권한 데이터가 변경되면 폼 업데이트
  useEffect(() => {
    if (role) {
      form.setFieldsValue(role);
    } else {
      form.resetFields();
    }
  }, [role, form]);

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

  // 권한명 변경 핸들러
  const handleUpdateRoleName = () => {
    const formValues = form.getFieldsValue();
    if (formValues.roleNo && formValues.roleName && onUpdateRoleName) {
      onUpdateRoleName(formValues.roleNo, formValues.roleName);
    }
  };

  // 권한 타입 옵션
  const authTypeOptions = authTypeList.map((item) => ({
    value: item.code || "",
    label: item.name1 || "",
  }));

  return (
    <RoleDetailFormStyles>
      <Form form={form} layout="inline" colon={false} style={{ width: "100%" }}>
        <Form.Item label={getLabel("권한번호")}>
          <Tooltip title={getLabelDesc("권한번호")}>
            <FormInput
              name="roleNo"
              label={getLabel("권한번호")}
              disabled
              style={{ width: "120px" }}
            />
          </Tooltip>
        </Form.Item>
        <Form.Item label={getLabel("권한타입")}>
          <Tooltip title={getLabelDesc("권한타입")}>
            <FormSelect
              name="roleType"
              label={getLabel("권한타입")}
              disabled
              options={authTypeOptions}
              style={{ width: "120px" }}
            />
          </Tooltip>
        </Form.Item>
        <Form.Item label={getLabel("권한명")}>
          <Tooltip title={getLabelDesc("권한명")}>
            <FormInput
              name="roleName"
              label={getLabel("권한명")}
              style={{ width: "120px" }}
            />
          </Tooltip>
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            onClick={handleUpdateRoleName}
            disabled={!role?.roleNo}
          >
            {t("권한명 변경")}
          </Button>
        </Form.Item>
      </Form>
    </RoleDetailFormStyles>
  );
};

export default RoleDetailForm;

