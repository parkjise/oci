import React, {
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
} from "react";
import { Modal, type ModalProps } from "antd";
import LoadingSpinner from "../loadingSpinner";

export type InjectedProps<R> = {
  // 모달 내부 페이지에서 값과 함께 닫기
  returnValue: (value: R) => void;
  // 값 없이 닫기(취소)
  close: () => void;
};

type AnyProps = Record<string, unknown>;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AppPageModalProps<P extends AnyProps = {}, R = unknown> {
  open: boolean;
  onClose: () => void;
  onReturn?: (value: R) => void;
  title: React.ReactNode;
  page:
    | ComponentType<P & InjectedProps<R>>
    | LazyExoticComponent<ComponentType<P & InjectedProps<R>>>;
  pageProps?: P;
  width?: number | string;
  height?: number | string;
  footer?: React.ReactNode;
  destroyOnHidden?: boolean;
  modalProps?: Omit<
    ModalProps,
    | "open"
    | "onCancel"
    | "title"
    | "footer"
    | "width"
    | "children"
    | "destroyOnHidden"
  >;
  fallback?: React.ReactNode;
}

const defaultFallback = <LoadingSpinner />;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const AppPageModal = <P extends AnyProps = {}, R = unknown>({
  open,
  onClose,
  onReturn,
  title,
  page: Page,
  pageProps = {} as P, // undefined 스프레드 방지
  width = "80%",
  height = "80%",
  footer = null,
  destroyOnHidden = true,
  modalProps,
  fallback = defaultFallback,
}: AppPageModalProps<P, R>) => {
  const handleClose = () => onClose();
  const handleReturn = (value: R) => {
    onReturn?.(value);
    onClose();
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      footer={footer}
      width={width}
      height={height}
      destroyOnHidden={destroyOnHidden}
      {...modalProps}
    >
      <Suspense fallback={fallback}>
        <Page {...pageProps} returnValue={handleReturn} close={handleClose} />
      </Suspense>
    </Modal>
  );
};

export default AppPageModal;
