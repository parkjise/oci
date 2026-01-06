/*
 * 프로젝트 명  : ONERP
 * 파일 명     : ChangeReasonModal.tsx
 * 설명        : 변경 사유 입력 모달
 */
import React, { useState } from "react";
import { Modal, Input } from "antd";
import { useTranslation } from "react-i18next";

interface ChangeReasonModalProps {
    open: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    title?: string;
}

const ChangeReasonModal: React.FC<ChangeReasonModalProps> = ({ open, onClose, onConfirm, title }) => {
    const { t } = useTranslation();
    const [reason, setReason] = useState("");

    const handleConfirm = () => {
        onConfirm(reason);
        setReason("");
        onClose();
    };

    return (
        <Modal
            title={title || t("변경 사유 입력")}
            open={open}
            onCancel={onClose}
            onOk={handleConfirm}
            okButtonProps={{ disabled: !reason.trim() }}
            destroyOnClose
        >
            <p>{t("변경 사유를 입력해주세요. (필수)")}</p>
            <Input.TextArea 
                rows={4} 
                value={reason} 
                onChange={e => setReason(e.target.value)} 
                placeholder={t("사유를 입력하세요...")}
            />
        </Modal>
    );
};

export default ChangeReasonModal;
