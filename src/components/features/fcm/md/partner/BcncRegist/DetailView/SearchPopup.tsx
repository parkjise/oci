import { useCallback } from "react";
import type { FC } from "react";
import { Space, Form } from "antd";
import { type InjectedProps } from "@/components/ui/feedback/Modal";
import { showError } from "@/components/ui/feedback/Message";
import { FormInput, FormButton } from "@components/ui/form";

/**
 * 반환할 데이터 타입
 */
export type SearchPopupResult = {
  field1: string;
  field2: string;
};

/**
 * SearchPopup 컴포넌트의 Props 타입
 */
interface SearchPopupProps {
  /** 초기 필드1 값 (선택적) */
  initialField1?: string;
  /** 초기 필드2 값 (선택적) */
  initialField2?: string;
  /** 필드1 라벨 */
  field1Label?: string;
  /** 필드2 라벨 */
  field2Label?: string;
}

/**
 * 검색 팝업 컴포넌트
 * 필드1, 필드2를 입력받고 저장 버튼을 누르면 값을 반환합니다.
 */
const SearchPopup: FC<SearchPopupProps & InjectedProps<SearchPopupResult>> = ({
  initialField1,
  initialField2,
  field1Label = "필드1",
  field2Label = "필드2",
  returnValue,
  close,
}) => {
  const [form] = Form.useForm<SearchPopupResult>();

  const handleSave = useCallback(() => {
    form
      .validateFields()
      .then((values) => {
        returnValue({
          field1: values.field1,
          field2: values.field2,
        });
      })
      .catch(() => {
        showError("필수 필드를 모두 입력해주세요.");
      });
  }, [form, returnValue]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>검색 팝업</h2>
      <p>필드1과 필드2를 입력한 후 저장 버튼을 클릭하세요.</p>

      <Form
        form={form}
        layout="vertical"
        initialValues={{
          field1: initialField1 || "",
          field2: initialField2 || "",
        }}
        style={{ marginTop: "20px" }}
      >
        <Form.Item
          name="field1"
          label={field1Label}
          rules={[
            { required: true, message: `${field1Label}을(를) 입력해주세요.` },
          ]}
        >
          <FormInput
            name="field1"
            placeholder={`${field1Label}을(를) 입력하세요`}
          />
        </Form.Item>

        <Form.Item
          name="field2"
          label={field2Label}
          rules={[
            { required: true, message: `${field2Label}을(를) 입력해주세요.` },
          ]}
        >
          <FormInput
            name="field2"
            placeholder={`${field2Label}을(를) 입력하세요`}
          />
        </Form.Item>
      </Form>

      <Space
        style={{
          marginTop: "20px",
          justifyContent: "flex-end",
          width: "100%",
          display: "flex",
        }}
      >
        <FormButton type="primary" onClick={handleSave}>
          저장
        </FormButton>
        <FormButton onClick={close}>취소</FormButton>
      </Space>
    </div>
  );
};

export default SearchPopup;
