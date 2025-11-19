import { message } from "antd";

type Content = string;

const DEFAULT_DURATION = 2; // seconds

export const showSuccess = (
  content: Content,
  duration: number = DEFAULT_DURATION
) => message.success(content, duration);

export const showError = (
  content: Content,
  duration: number = DEFAULT_DURATION
) => message.error(content, duration);

export const showInfo = (
  content: Content,
  duration: number = DEFAULT_DURATION
) => message.info(content, duration);

export const showWarning = (
  content: Content,
  duration: number = DEFAULT_DURATION
) => message.warning(content, duration);

export const showLoading = (content: Content) => message.loading(content);

export const show = (
  content: Content,
  type: "success" | "error" | "info" | "warning" | "loading" = "info",
  duration: number = DEFAULT_DURATION
) => {
  switch (type) {
    case "success":
      return showSuccess(content, duration);
    case "error":
      return showError(content, duration);
    case "warning":
      return showWarning(content, duration);
    case "loading":
      return showLoading(content);
    default:
      return showInfo(content, duration);
  }
};

export default {
  show,
  showSuccess,
  showError,
  showInfo,
  showWarning,
  showLoading,
};

