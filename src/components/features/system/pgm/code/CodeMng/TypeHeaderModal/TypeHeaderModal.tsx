// ============================================================================
// 공통코드구분(TYPE) 헤더 등록 모달
// ============================================================================
// 변경이력:
// - 2025.12.02 : ckkim (최초작성)

import React, { useState, useEffect } from "react";
import { Modal, Input, Form } from "antd";
import { useTranslation } from "react-i18next";

interface TypeHeaderModalProps {
  open: boolean;
  module?: string;
  onClose: () => void;
  onConfirm: (type: string, name1: string, nameDesc?: string) => void;
}

/**
 * 공통코드구분(TYPE) 헤더 등록 모달
 * CODE='##'인 TYPE 헤더를 등록합니다.
 */
const TypeHeaderModal: React.FC<TypeHeaderModalProps> = ({
  open,
  module,
  onClose,
  onConfirm,
}) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      onConfirm(values.type, values.name1, values.nameDesc);
      form.resetFields();
      setLoading(false);
    } catch (error) {
      // validation error
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      open={open}
      title={t("공통코드구분 등록")}
      onCancel={handleCancel}
      onOk={handleOk}
      width={500}
      centered
      destroyOnClose
      confirmLoading={loading}
    >
      <Form form={form} layout="vertical" style={{ marginTop: 20 }}>
        <Form.Item
          label={t("모듈")}
          name="module"
          initialValue={module}
        >
          <Input readOnly />
        </Form.Item>
        <Form.Item
          label={t("공통코드구분")}
          name="type"
          rules={[
            { required: true, message: t("공통코드구분을 입력하세요.") },
            { max: 15, message: t("공통코드구분은 15자 이하여야 합니다.") },
          ]}
        >
          <Input placeholder={t("공통코드구분")} style={{ textTransform: "uppercase" }} />
        </Form.Item>
        <Form.Item
          label={t("공통코드명")}
          name="name1"
          rules={[
            { required: true, message: t("공통코드명을 입력하세요.") },
            { max: 100, message: t("공통코드명은 100자 이하여야 합니다.") },
          ]}
        >
          <Input placeholder={t("공통코드명")} />
        </Form.Item>
        <Form.Item
          label={t("설명")}
          name="nameDesc"
          rules={[{ max: 400, message: t("설명은 400자 이하여야 합니다.") }]}
        >
          <Input.TextArea rows={3} placeholder={t("설명")} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default TypeHeaderModal;

