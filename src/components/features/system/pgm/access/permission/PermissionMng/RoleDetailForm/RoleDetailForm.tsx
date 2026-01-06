// ============================================================================
// 권한 상세 폼 컴포넌트
// ============================================================================
// 변경이력:
// - 2025.01.15 : ckkim (최초작성)

import React, { useEffect } from "react";
import { Form, Tooltip } from "antd";
import { FormInput, FormSelect, FormButton } from "@components/ui/form";
import { useTranslation } from "react-i18next";
import type { RoleDto } from "@apis/system/permission/permissionApi";
import type { CodeDetail } from "@/types/com/api/api.types";
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
        <Form.Item label={t("권한번호")}>
          <Tooltip title={t("권한번호_desc")}>
            <FormInput
              name="roleNo"
              label=""
              disabled
              style={{ width: "120px" }}
            />
          </Tooltip>
        </Form.Item>
        <span className="divider"></span>
        <Form.Item label={t("권한타입")}>
          <Tooltip title={t("권한타입_desc")}>
            <FormSelect
              name="roleType"
              label=""
              disabled
              options={authTypeOptions}
              style={{ width: "120px" }}
            />
          </Tooltip>
        </Form.Item>
        <span className="divider"></span>
        <Form.Item label={t("권한명")}>
          <Tooltip title={t("권한명_desc")}>
            <FormInput name="roleName" label="" style={{ width: "120px" }} />
          </Tooltip>
        </Form.Item>
        <Form.Item>
          <FormButton
            type="primary"
            onClick={handleUpdateRoleName}
            disabled={!role?.roleNo}
            style={{ width: "100px" }}
          >
            {t("권한명 변경")}
          </FormButton>
        </Form.Item>
      </Form>
    </RoleDetailFormStyles>
  );
};

export default RoleDetailForm;
