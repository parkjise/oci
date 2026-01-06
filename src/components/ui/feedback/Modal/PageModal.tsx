import React, {
  Suspense,
  type ComponentType,
  type LazyExoticComponent,
  useMemo,
} from "react";
import { Modal, type ModalProps } from "antd";
import LoadingSpinner from "../Loading/LoadingSpinner";

export type InjectedProps<R> = {
  // 모달 내부 페이지에서 값과 함께 닫기
  returnValue: (value: R) => void;
  // 값 없이 닫기(취소)
  close: () => void;
};

export type AnyProps = Record<string, unknown>;

// 페이지 컴포넌트 모듈 매핑
// 중앙 집중식으로 관리하여 경로 문제를 방지합니다.
import { pageModules } from "@utils/pageModules";

/**
 * 경로로부터 컴포넌트를 동적으로 로드
 * @param path - 파일 경로 (예: /pages/sample/pageModal/ModalPopup.tsx 또는 pages/sample/pageModal/ModalPopup)
 * @returns Lazy 컴포넌트 또는 null
 */
const getComponentByPath = <P extends AnyProps, R>(
  path: string
): LazyExoticComponent<ComponentType<P & InjectedProps<R>>> | null => {
  if (!path) return null;

  try {
    // 경로 정규화 (MainSidebar 패턴과 동일)
    let normalizedPath = path;

    // PATH 정규화: 다양한 형식의 /components/pages를 /pages로 변환
    // 1. /src/components/pages -> /pages
    // 2. /components/pages -> /pages
    // 3. src/components/pages -> pages
    normalizedPath = normalizedPath
      .replace(/\/src\/components\/pages/g, "/pages")
      .replace(/\/components\/pages/g, "/pages")
      .replace(/^src\/components\/pages/, "pages");

    // /pages/로 시작하지 않으면 추가
    if (
      !normalizedPath.startsWith("/pages/") &&
      !normalizedPath.startsWith("pages/")
    ) {
      normalizedPath = `/pages/${normalizedPath}`;
    }

    // 확장자가 없으면 .tsx 추가 (MainSidebar는 확장자 포함 경로를 받음)
    if (!normalizedPath.endsWith(".tsx") && !normalizedPath.endsWith(".ts")) {
      normalizedPath = `${normalizedPath}.tsx`;
    }

    // 상대 경로로 변환
    // import.meta.glob("../pages/**/*.{tsx,ts}")를 사용하면 (src/utils/pageModules.ts에서)
    // 키는 ../pages/... 형식으로 저장됩니다
    // 예: /pages/sample/pageModal/ModalPopup.tsx -> ../pages/sample/pageModal/ModalPopup.tsx
    const relativePath = normalizedPath.startsWith("/")
      ? `../${normalizedPath.slice(1)}`
      : `../${normalizedPath}`;

    // 매핑된 모듈 찾기 (import.meta.glob의 키 형식)
    // 먼저 정확한 경로로 시도
    const moduleLoader = pageModules[relativePath];

    // 찾지 못한 경우 .tsx와 .ts 확장자 교체 시도
    const moduleKeyTsx = relativePath.endsWith(".ts")
      ? relativePath.replace(/\.ts$/, ".tsx")
      : relativePath;
    const moduleKeyTs = relativePath.endsWith(".tsx")
      ? relativePath.replace(/\.tsx$/, ".ts")
      : relativePath;

    // index.ts 파일도 확인 (ModalPopup의 경우)
    // /pages/sample/pageModal/ModalPopup.tsx -> sample/pageModal
    const pathWithoutPages = normalizedPath
      .replace(/^\/?pages\//, "")
      .replace(/\.(tsx|ts)$/, "");
    const pathParts = pathWithoutPages.split("/");

    // 마지막 부분이 파일명이면 디렉토리 경로 사용, 아니면 전체 경로 사용
    const dirPath =
      pathParts.length > 1
        ? pathParts.slice(0, -1).join("/")
        : pathWithoutPages;

    // index.ts 파일 경로 생성
    const moduleKeyIndexTsx = `../pages/${dirPath}/index.tsx`;
    const moduleKeyIndexTs = `../pages/${dirPath}/index.ts`;

    // 모든 가능한 키로 모듈 찾기
    const finalModuleLoader =
      moduleLoader ||
      (moduleKeyTsx !== relativePath && pageModules[moduleKeyTsx]) ||
      (moduleKeyTs !== relativePath && pageModules[moduleKeyTs]) ||
      (moduleKeyIndexTsx && pageModules[moduleKeyIndexTsx]) ||
      (moduleKeyIndexTs && pageModules[moduleKeyIndexTs]);

    if (finalModuleLoader) {
      return React.lazy(async () => {
        const module = await finalModuleLoader();
        return { default: module.default };
      }) as LazyExoticComponent<ComponentType<P & InjectedProps<R>>>;
    }

    // 매핑에 없으면 null 반환 (import.meta.glob의 매핑만 사용)
    // 상대 경로 직접 import는 런타임에서 잘못된 경로로 해석될 수 있음
    if (import.meta.env.DEV) {
      const allKeys = Object.keys(pageModules);
      const relatedKeys = allKeys.filter(
        (key) => key.includes("sample/pageModal") || key.includes("pageModal")
      );
      console.error(
        `[PageModal] 컴포넌트를 찾을 수 없습니다: ${path}`,
        `\n정규화된 경로: ${normalizedPath}`,
        `\n시도한 키:`,
        [
          relativePath,
          moduleKeyTsx,
          moduleKeyTs,
          moduleKeyIndexTsx,
          moduleKeyIndexTs,
        ].filter(Boolean),
        `\n관련 키들:`,
        relatedKeys,
        `\n모든 키 샘플 (처음 10개):`,
        allKeys.slice(0, 10)
      );
    }
    return null;
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`[PageModal] 컴포넌트 로드 실패: ${path}`, error);
    }
    return null;
  }
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AppPageModalProps<P extends AnyProps = {}, R = unknown> {
  open: boolean;
  onClose: () => void;
  onReturn?: (value: R) => void;
  title: React.ReactNode;
  // page 또는 pagePath 중 하나만 사용
  page?:
    | ComponentType<P & InjectedProps<R>>
    | LazyExoticComponent<ComponentType<P & InjectedProps<R>>>;
  pagePath?: string; // 경로 기반 로딩 (예: "/pages/sample/pageModal/ModalPopup" 또는 "sample/pageModal/ModalPopup")
  pageProps?: P;
  width?: number | string;
  height?: number | string;
  top?: number | string;
  left?: number | string;
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

/**
 * 높이/너비 값을 CSS 값으로 변환
 * 숫자 → "500px", 숫자 문자열 "500" → "500px", "500px" → "500px", "50%" → "50%"
 */
const convertSizeValue = (
  value: number | string | undefined
): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "number") {
    return `${value}px`;
  }
  if (typeof value === "string") {
    const numValue = parseFloat(value);
    // 숫자 문자열인 경우 (예: "500") px 단위 추가
    if (!isNaN(numValue) && value.trim() === String(numValue)) {
      return `${numValue}px`;
    }
    // 이미 단위가 포함된 경우 (예: "500px", "50%")
    return value;
  }
  return undefined;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
const AppPageModal = <P extends AnyProps = {}, R = unknown>({
  open,
  onClose,
  onReturn,
  title,
  page,
  pagePath,
  pageProps = {} as P, // undefined 스프레드 방지
  width = "80%",
  height = "80%",
  top,
  left,
  footer = null,
  destroyOnHidden = true,
  modalProps,
  fallback = defaultFallback,
}: AppPageModalProps<P, R>) => {
  // pagePath가 제공되면 동적으로 로드, 아니면 기존 page 사용
  const LazyPage = useMemo(() => {
    if (pagePath) {
      return getComponentByPath<P, R>(pagePath);
    }
    if (page) {
      // LazyExoticComponent인지 확인 (React.lazy()로 감싸진 컴포넌트)
      // LazyExoticComponent는 타입으로만 확인 가능하므로 타입 단언 사용
      return page as LazyExoticComponent<ComponentType<P & InjectedProps<R>>>;
    }
    return null;
  }, [page, pagePath]);

  const handleClose = () => onClose();
  const handleReturn = (value: R) => {
    onReturn?.(value);
    onClose();
  };

  // width 값을 변환 (숫자 문자열을 px로 변환)
  const convertedWidth = useMemo(() => convertSizeValue(width), [width]);
  const convertedHeight = useMemo(() => convertSizeValue(height), [height]);

  // Modal 스타일 설정 (height, top, left 포함)
  const modalStyle = useMemo(() => {
    const baseStyle = modalProps?.style || {};
    const style: React.CSSProperties = { ...baseStyle };

    if (convertedHeight) {
      style.height = convertedHeight;
    }

    // 위치 지정 (top, left)
    if (top !== undefined) {
      style.top = typeof top === "number" ? `${top}px` : top;
      style.marginTop = 0; // centered와 충돌 방지
    }

    if (left !== undefined) {
      style.left = typeof left === "number" ? `${left}px` : left;
      style.marginLeft = 0; // centered와 충돌 방지
    }

    // 위치가 지정되면 transform 제거 (centered 효과 제거)
    if (top !== undefined || left !== undefined) {
      style.transform = "none";
    }

    return style;
  }, [convertedHeight, top, left, modalProps?.style]);

  // Modal body의 높이도 제어 (height가 설정된 경우)
  const bodyStyle = useMemo(() => {
    const baseBodyStyle = modalProps?.bodyStyle || {};
    if (convertedHeight) {
      return {
        ...baseBodyStyle,
        height: convertedHeight,
        overflow: "auto", // 내용이 넘칠 경우 스크롤
      };
    }
    return baseBodyStyle;
  }, [convertedHeight, modalProps?.bodyStyle]);

  if (!LazyPage) {
    if (import.meta.env.DEV) {
      console.error("[PageModal] page 또는 pagePath prop이 필요합니다.");
    }
    return null;
  }

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleClose}
      footer={footer !== undefined ? footer : null}
      width={convertedWidth}
      style={modalStyle}
      bodyStyle={bodyStyle}
      destroyOnHidden={destroyOnHidden}
      maskClosable={modalProps?.maskClosable ?? false}
      className="modal-layout"
      {...modalProps}
    >
      <Suspense fallback={fallback}>
        <LazyPage
          {...pageProps}
          returnValue={handleReturn}
          close={handleClose}
        />
      </Suspense>
    </Modal>
  );
};

export default AppPageModal;
