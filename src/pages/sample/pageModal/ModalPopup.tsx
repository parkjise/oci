import { useState, useCallback } from "react";
import type { FC } from "react";
import { Button, Space, Input } from "antd";
import { type InjectedProps } from "@/components/ui/feedback/Modal";
import { showError } from "@/components/ui/feedback/Message";

/**
 * 반환할 사용자 데이터 타입
 */
export type User = { id: string; name: string };

/**
 * ModalPopup 컴포넌트의 Props 타입
 */
interface ModalPopupProps {
  /** 초기 사용자 ID (선택적) */
  initialId?: string;
}

/**
 * 사용자 선택 모달 팝업 컴포넌트
 * usePageModal 훅과 함께 사용됩니다.
 */
const ModalPopup: FC<ModalPopupProps & InjectedProps<User>> = ({
  initialId,
  returnValue,
  close,
}) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedUserName, setSelectedUserName] = useState("");

  const handleSelectUser = useCallback(() => {
    if (selectedUserId && selectedUserName) {
      returnValue({ id: selectedUserId, name: selectedUserName });
    } else {
      showError("사용자 ID와 이름을 입력해주세요.");
    }
  }, [selectedUserId, selectedUserName, returnValue]);

  return (
    <div style={{ padding: "20px" }}>
      <h2>사용자 선택</h2>
      <p>사용자 ID와 이름을 입력한 후 선택 버튼을 클릭하세요.</p>
      {initialId && (
        <p style={{ color: "#666" }}>부모 파라미터 사용자 ID: {initialId}</p>
      )}

      <Space
        direction="vertical"
        style={{ width: "100%", marginBottom: "20px" }}
        size="middle"
      >
        <Input
          placeholder="사용자 ID 입력"
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
        />
        <Input
          placeholder="사용자 이름 입력"
          value={selectedUserName}
          onChange={(e) => setSelectedUserName(e.target.value)}
        />
      </Space>

      <Space>
        <Button type="primary" onClick={handleSelectUser}>
          선택하고 모달 닫기
        </Button>
        <Button onClick={close}>취소하고 모달 닫기</Button>
      </Space>
    </div>
  );
};

export default ModalPopup;
