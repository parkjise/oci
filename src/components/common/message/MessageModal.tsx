import React from "react";
import { Modal } from "antd";

export interface ConfirmOptions {
  title?: React.ReactNode;
  content?: React.ReactNode;
  okText?: string;
  cancelText?: string;
  onOk?: () => void | Promise<void>;
  onCancel?: () => void;
  centered?: boolean;
  width?: number;
}

export const confirm = (options: ConfirmOptions = {}) => {
  const {
    title = "확인",
    content = "이 작업을 진행하시겠습니까?",
    okText = "확인",
    cancelText = "취소",
    centered = true,
    width = 420,
    onOk,
    onCancel,
  } = options;

  return Modal.confirm({
    title,
    content,
    okText,
    cancelText,
    centered,
    width,
    onOk,
    onCancel,
  });
};

export interface AlertOptions {
  title?: React.ReactNode;
  content?: React.ReactNode;
  okText?: string;
  centered?: boolean;
  width?: number;
  onOk?: () => void;
}

export const info = (opts: AlertOptions = {}) => {
  const {
    title = "안내",
    content,
    okText = "확인",
    centered = true,
    width = 420,
    onOk,
  } = opts;
  Modal.info({ title, content, okText, centered, width, onOk });
};

export const success = (opts: AlertOptions = {}) => {
  const {
    title = "성공",
    content,
    okText = "확인",
    centered = true,
    width = 420,
    onOk,
  } = opts;
  Modal.success({ title, content, okText, centered, width, onOk });
};

export const error = (opts: AlertOptions = {}) => {
  const {
    title = "에러",
    content,
    okText = "확인",
    centered = true,
    width = 420,
    onOk,
  } = opts;
  Modal.error({ title, content, okText, centered, width, onOk });
};

export const warning = (opts: AlertOptions = {}) => {
  const {
    title = "경고",
    content,
    okText = "확인",
    centered = true,
    width = 420,
    onOk,
  } = opts;
  Modal.warning({ title, content, okText, centered, width, onOk });
};

export default { confirm, info, success, error, warning };

