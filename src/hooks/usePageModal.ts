import { useState, useCallback, useMemo } from "react";
import type { ReactNode, ComponentType, LazyExoticComponent } from "react";
import type {
  AppPageModalProps,
  AnyProps,
  InjectedProps,
} from "@components/ui/feedback/Modal/PageModal";

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
  options?: {
    title?: ReactNode;
    width?: number | string;
    height?: number | string;
    centered?: boolean;
    destroyOnHidden?: boolean;
    maskClosable?: boolean;
    onReturn?: (value: R) => void;
    onClose?: () => void;
    fallback?: ReactNode;
  }
) {
  const [open, setOpen] = useState(false);
  const [pageProps, setPageProps] = useState<P | undefined>(undefined);
  const [returnValue, setReturnValue] = useState<R | null>(null);

  const openModal = useCallback((props?: P) => {
    setPageProps(props);
    setOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setOpen(false);
    // 약간의 딜레이 후 props 초기화 (애니메이션 완료 대기)
    setTimeout(() => {
      setPageProps(undefined);
    }, 300);
    setReturnValue(null);
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
      destroyOnHidden: options?.destroyOnHidden ?? true,
      modalProps: {
        ...(options?.centered ? { centered: true } : {}),
        ...(options?.maskClosable !== undefined
          ? { maskClosable: options.maskClosable }
          : {}),
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
      options?.destroyOnHidden,
      options?.centered,
      options?.maskClosable,
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
  };
}
