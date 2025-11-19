import React from "react";
import { Button, Space, Input } from "antd";
import { type InjectedProps } from "@/components/common/pageModal";

// Sample.tsx에서 AppPageModal에 전달하는 pageProps의 타입
interface SettingsPageProps {
  initialId?: string;
}

// AppPageModal의 R (Return Value) 타입과 일치해야 함
type User = { id: string; name: string };

const ModalPopup: React.FC<SettingsPageProps & InjectedProps<User>> = ({
  initialId,
  returnValue, // AppPageModal에서 주입된 함수 (값을 리턴하고 모달 닫음)
  close, // AppPageModal에서 주입된 함수 (값 없이 모달 닫음)
}) => {
  const [selectedUserId, setSelectedUserId] = React.useState(initialId || "");
  const [selectedUserName, setSelectedUserName] = React.useState("");

  React.useEffect(() => {
    if (initialId) {
      // 실제 환경에서는 initialId로 사용자 정보를 불러오는 API 호출
      setSelectedUserName(`User ${initialId}`);
    }
  }, [initialId]);

  const handleSelectUser = () => {
    if (selectedUserId && selectedUserName) {
      returnValue({ id: selectedUserId, name: selectedUserName });
    } else {
      alert("사용자 ID와 이름을 입력해주세요.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>사용자 선택 (Settings Page)</h2>
      <p>이 페이지는 AppPageModal 내부에 렌더링됩니다.</p>
      {initialId && <p>초기 사용자 ID: {initialId}</p>}

      <Space
        direction="vertical"
        style={{ width: "100%", marginBottom: "20px" }}
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

