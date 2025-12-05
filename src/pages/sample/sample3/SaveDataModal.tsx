import React from "react";
import { Modal, Space, Table, Typography } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { FormButton } from "@components/ui/form";
import { showSuccess, showError } from "@components/ui/feedback/Message";
import type { UserData } from "./sample3Data";
import {
  StyledModalIcon,
  StyledModalTitle,
  StyledModalContent,
  StyledModalLabel,
  StyledModalCount,
  StyledModalEmpty,
  StyledModalSectionTitle,
  StyledModalDivider,
  StyledJsonPreview,
  StyledJsonBox,
  StyledJsonPre,
  modalStyles,
  tableStyles,
} from "./Sample3.styles";

const { Text } = Typography;

type UserDataWithStatus = UserData & { rowStatus?: "C" | "U" | "D" };

export interface SaveDataModalProps {
  open: boolean;
  onClose: () => void;
  changedData: UserDataWithStatus[];
  deletedData: UserDataWithStatus[];
  onSave: () => void;
  getTableColumns: (defaultStatus: "C" | "U" | "D") => any[];
}

const SaveDataModal: React.FC<SaveDataModalProps> = ({
  open,
  onClose,
  changedData,
  deletedData,
  onSave,
  getTableColumns,
}) => {
  const handleSave = () => {
    const totalChanges = changedData.length + deletedData.length;
    const addedCount = changedData.filter(
      (item) => item.rowStatus === "C"
    ).length;
    const updatedCount = changedData.filter(
      (item) => item.rowStatus === "U"
    ).length;
    if (totalChanges === 0) {
      showError("저장할 변경된 데이터가 없습니다.");
      return;
    }
    showSuccess(
      `총 ${totalChanges}건의 변경된 데이터가 저장되었습니다. (추가(C): ${addedCount}건, 수정(U): ${updatedCount}건, 삭제(D): ${deletedData.length}건)`
    );
    onSave();
    onClose();
  };

  return (
    <Modal
      title={
        <Space>
          <StyledModalIcon>
            <SaveOutlined />
          </StyledModalIcon>
          <StyledModalTitle>저장할 데이터</StyledModalTitle>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <FormButton key="close" size="small" onClick={onClose}>
          닫기
        </FormButton>,
        <FormButton
          key="save"
          size="small"
          icon={<SaveOutlined />}
          onClick={handleSave}
          disabled={changedData.length === 0 && deletedData.length === 0}
        >
          저장하기
        </FormButton>,
      ]}
      width={1200}
      style={modalStyles}
    >
      <StyledModalContent>
        <Space direction="vertical" size="small" style={{ width: "100%" }}>
          <StyledModalLabel strong>저장할 변경 데이터:</StyledModalLabel>
          <Space size="large">
            <Text>
              추가(C):{" "}
              <StyledModalCount color="#1890ff" strong>
                {changedData.filter((item) => item.rowStatus === "C").length}
              </StyledModalCount>
              건
            </Text>
            <Text>
              수정(U):{" "}
              <StyledModalCount color="#fa8c16" strong>
                {changedData.filter((item) => item.rowStatus === "U").length}
              </StyledModalCount>
              건
            </Text>
            <Text>
              삭제(D):{" "}
              <StyledModalCount color="#ff4d4f" strong>
                {deletedData.length}
              </StyledModalCount>
              건
            </Text>
            <Text>
              전체:{" "}
              <StyledModalCount color="#52c41a" strong>
                {changedData.length + deletedData.length}
              </StyledModalCount>
              건
            </Text>
          </Space>
          {changedData.length === 0 && deletedData.length === 0 && (
            <Text type="warning" style={{ marginTop: "4px" }}>
              (변경된 데이터가 없습니다)
            </Text>
          )}
        </Space>
      </StyledModalContent>

      {changedData.length === 0 && deletedData.length === 0 ? (
        <StyledModalEmpty>
          <Text>변경된 데이터가 없습니다.</Text>
        </StyledModalEmpty>
      ) : (
        <>
          {/* 추가/수정된 데이터 */}
          {changedData.length > 0 && (
            <>
              <StyledModalSectionTitle color="#1890ff">
                추가/수정된 데이터 ({changedData.length}건) - 추가(C):{" "}
                {changedData.filter((item) => item.rowStatus === "C").length}
                건, 수정(U):{" "}
                {changedData.filter((item) => item.rowStatus === "U").length}
                건
              </StyledModalSectionTitle>
              <Table
                dataSource={changedData}
                columns={getTableColumns("U")}
                rowKey="id"
                scroll={tableStyles.scroll}
                pagination={tableStyles.pagination}
              />
              {deletedData.length > 0 && <StyledModalDivider />}
            </>
          )}

          {/* 삭제된 데이터 */}
          {deletedData.length > 0 && (
            <>
              <StyledModalSectionTitle color="#ff4d4f">
                삭제된 데이터 ({deletedData.length}건)
              </StyledModalSectionTitle>
              <Table
                dataSource={deletedData}
                columns={getTableColumns("D")}
                rowKey="id"
                scroll={tableStyles.scroll}
                pagination={tableStyles.pagination}
                rowClassName={() => "deleted-row"}
                style={{
                  marginBottom: changedData.length > 0 ? "20px" : "0",
                }}
              />
            </>
          )}

          <StyledModalDivider />

          <div>
            <StyledJsonPreview strong>JSON 데이터 미리보기:</StyledJsonPreview>
            <StyledJsonBox>
              <StyledJsonPre>
                {JSON.stringify(
                  {
                    data: [...changedData, ...deletedData],
                  },
                  null,
                  2
                )}
              </StyledJsonPre>
            </StyledJsonBox>
          </div>
        </>
      )}
    </Modal>
  );
};

export default SaveDataModal;

