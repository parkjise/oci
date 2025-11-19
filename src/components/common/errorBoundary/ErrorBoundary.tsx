import React, { Component, type ReactNode } from "react";
import { Result, Button } from "antd";
import { useTranslation } from "react-i18next";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
    // 실제 환경에서는 에러 로깅 서비스로 전송 가능
    // 예: Sentry, LogRocket 등
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorBoundaryFallback
          error={this.state.error}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

interface ErrorBoundaryFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorBoundaryFallback: React.FC<ErrorBoundaryFallbackProps> = ({
  error,
  onReset,
}) => {
  const { t } = useTranslation();

  return (
    <Result
      status="500"
      title={t("error_title", "오류가 발생했습니다")}
      subTitle={
        error
          ? t(
              "error_message",
              "예기치 못한 오류가 발생했습니다. 페이지를 새로고침하거나 처음부터 다시 시도해주세요."
            )
          : t("error_unknown", "알 수 없는 오류가 발생했습니다.")
      }
      extra={
        <Button type="primary" onClick={onReset}>
          {t("go_home", "홈으로 이동")}
        </Button>
      }
    />
  );
};

export default ErrorBoundary;

