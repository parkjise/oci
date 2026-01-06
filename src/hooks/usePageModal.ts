import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import type { ReactNode, ComponentType, LazyExoticComponent } from "react";
import type {
  AppPageModalProps,
  AnyProps,
  InjectedProps,
} from "@components/ui/feedback/Modal/PageModal";
import { FormButton } from "@components/ui/form";

/**
 * 모달 옵션 타입
 */
export interface UsePageModalOptions<R> {
  /** 모달 제목 */
  title?: ReactNode;
  /** 모달 너비 */
  width?: number | string;
  /** 모달 높이 */
  height?: number | string;
  /** 모달 상단 위치 */
  top?: number | string;
  /** 모달 좌측 위치 */
  left?: number | string;
  /** 숨김 시 컴포넌트 제거 여부 */
  destroyOnHidden?: boolean;
  /** 마스크 클릭 시 닫기 여부 */
  maskClosable?: boolean;
  /** 중앙 정렬 여부 */
  centered?: boolean;
  /**
   * 커스텀 푸터
   * - undefined: 기본 footer 사용 (닫기/확인 버튼)
   * - null: footer 없음
   * - ReactNode: 커스텀 footer 사용
   */
  footer?: ReactNode | null;
  /** 값 반환 시 호출되는 콜백 */
  onReturn?: (value: R) => void;
  /** 모달 닫기 시 호출되는 콜백 */
  onClose?: () => void;
  /** 로딩 중 표시할 컴포넌트 */
  fallback?: ReactNode;
}

/**
 * AppPageModal을 더 간단하게 사용하기 위한 커스텀 훅
 * @param page - 페이지 컴포넌트 (직접 import한 컴포넌트)
 * @param options - 옵션 (title, width, height 등)
 * @returns 모달 제어 함수들과 props
 */
export function usePageModal<
  P extends AnyProps = Record<string, unknown>,
  R = unknown
>(
  page:
    | ComponentType<P & InjectedProps<R>>
    | LazyExoticComponent<ComponentType<P & InjectedProps<R>>>,
  options?: UsePageModalOptions<R>
) {
  const [open, setOpen] = useState(false);
  const [pageProps, setPageProps] = useState<P | undefined>(undefined);
  const [returnValue, setReturnValue] = useState<R | null>(null);
  const confirmHandlerRef = useRef<(() => void) | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const openModal = useCallback((props?: P) => {
    setPageProps(props);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    setReturnValue(null);
    // 약간의 딜레이 후 props 초기화 (애니메이션 완료 대기)
    timeoutRef.current = setTimeout(() => {
      setPageProps(undefined);
      timeoutRef.current = null;
    }, 300);
  }, []);

  // 컴포넌트 언마운트 시 timeout 정리
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleReturn = useCallback(
    (value: R) => {
      setReturnValue(value);
      options?.onReturn?.(value);
      closeModal();
    },
    [options, closeModal]
  );

  const handleClose = useCallback(() => {
    options?.onClose?.();
    closeModal();
  }, [options, closeModal]);

  const handleConfirm = useCallback(() => {
    confirmHandlerRef.current?.();
  }, []);

  const setConfirmHandler = useCallback((handler: (() => void) | null) => {
    confirmHandlerRef.current = handler;
  }, []);

  // 기본 footer 생성 (닫기/확인 버튼)
  const defaultFooter = useMemo(
    () =>
      React.createElement(
        React.Fragment,
        null,
        React.createElement(
          FormButton,
          {
            type: "default",
            size: "middle",
            onClick: closeModal,
          },
          "닫기"
        ),
        React.createElement(
          FormButton,
          {
            type: "default",
            size: "middle",
            onClick: handleConfirm,
            className: "navy",
          },
          "확인"
        )
      ),
    [closeModal, handleConfirm]
  );

  // footer 결정 로직
  const resolvedFooter = useMemo(() => {
    if (options?.footer === undefined) {
      return defaultFooter;
    }
    return options.footer;
  }, [options?.footer, defaultFooter]);

  const modalProps: AppPageModalProps<P, R> = useMemo(
    () => ({
      open,
      onClose: handleClose,
      onReturn: handleReturn,
      title: options?.title || "모달",
      page,
      pageProps,
      width: options?.width,
      height: options?.height,
      top: options?.top,
      left: options?.left,
      footer: resolvedFooter,
      destroyOnHidden: options?.destroyOnHidden ?? true,
      modalProps: {
        ...(options?.maskClosable !== undefined && {
          maskClosable: options.maskClosable,
        }),
        ...(options?.centered !== undefined && { centered: options.centered }),
      },
      fallback: options?.fallback,
    }),
    [
      open,
      handleClose,
      handleReturn,
      options?.title,
      options?.width,
      options?.height,
      options?.top,
      options?.left,
      resolvedFooter,
      options?.destroyOnHidden,
      options?.maskClosable,
      options?.centered,
      options?.fallback,
      page,
      pageProps,
    ]
  );

  return {
    openModal,
    closeModal,
    isOpen: open,
    returnValue,
    modalProps,
    handleConfirm,
    setConfirmHandler,
  };
}
