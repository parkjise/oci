/**
 * 아이콘 관련 유틸리티 함수
 *
 * Ant Design Icons를 사용하여 동적으로 아이콘을 로드하고 반환하는 함수들을 제공합니다.
 */
import React from "react";
import * as Icons from "@ant-design/icons";
import { StarOutlined } from "@ant-design/icons";
import type { MenuItem } from "@/types/api.types";
import { findIconName } from "@config/iconMapping";

/**
 * 기본 아이콘 이름
 */
const DEFAULT_ICON_NAME = "AppstoreOutlined";

/**
 * 아이콘 이름으로 아이콘 컴포넌트 동적 반환
 *
 * Ant Design Icons에서 아이콘 이름으로 컴포넌트를 찾아 반환합니다.
 * 다양한 형태의 아이콘 컴포넌트를 처리할 수 있습니다.
 *
 * @param iconName - 아이콘 이름 (예: "UserOutlined", "DashboardOutlined")
 * @param context - 로깅 컨텍스트 (예: "MainSidebar", "MainHeader")
 * @returns 아이콘 컴포넌트 또는 undefined
 */
/**
 * 아이콘 이름으로 아이콘 컴포넌트 동적 반환
 *
 * Ant Design Icons에서 아이콘 이름으로 컴포넌트를 찾아 반환합니다.
 * 다양한 형태의 아이콘 컴포넌트를 처리할 수 있습니다.
 *
 * @param iconName - 아이콘 이름 (예: "UserOutlined", "DashboardOutlined")
 * @param context - 로깅 컨텍스트 (예: "MainSidebar", "MainHeader"). 기본값: "iconUtils"
 * @returns 아이콘 컴포넌트 또는 undefined
 *
 * @example
 * ```tsx
 * const icon = getIconByName("UserOutlined", "MyComponent");
 * // <UserOutlined /> 컴포넌트 반환
 * ```
 */
export const getIconByName = (
  iconName: string,
  context: string = "iconUtils"
): React.ReactNode | undefined => {
  // 입력값 검증
  if (
    !iconName ||
    typeof iconName !== "string" ||
    iconName.trim().length === 0
  ) {
    return undefined;
  }

  // Ant Design Icons에서 아이콘 찾기
  const IconComponent = (
    Icons as unknown as Record<
      string,
      React.ComponentType | Record<string, unknown>
    >
  )[iconName];

  if (!IconComponent) {
    if (import.meta.env.DEV) {
      console.warn(`[${context}] 아이콘을 찾을 수 없습니다: "${iconName}"`);
    }
    return undefined;
  }

  // React 컴포넌트인지 확인 및 실제 컴포넌트 추출
  let ActualIconComponent: React.ComponentType | undefined;

  if (typeof IconComponent === "function") {
    // 함수형 컴포넌트인 경우
    ActualIconComponent = IconComponent;
  } else if (typeof IconComponent === "object" && IconComponent !== null) {
    // 객체인 경우, 내부에서 실제 컴포넌트 찾기
    const iconObj = IconComponent as Record<string, unknown>;

    // 1. default 속성 확인 (default export)
    if (typeof iconObj.default === "function") {
      ActualIconComponent = iconObj.default as React.ComponentType;
    }
    // 2. render 속성 확인 (forwardRef 컴포넌트)
    else if (typeof iconObj.render === "function") {
      ActualIconComponent = iconObj.render as React.ComponentType;
    }
    // 3. 객체 자체가 React 요소인지 확인
    else if (React.isValidElement(iconObj)) {
      return iconObj as React.ReactElement;
    }
    // 4. 객체의 모든 속성 중 함수 찾기
    else {
      const functionKeys = Object.keys(iconObj).filter(
        (key) => typeof iconObj[key] === "function"
      );
      if (functionKeys.length > 0) {
        ActualIconComponent = iconObj[functionKeys[0]] as React.ComponentType;
      }
    }

    if (!ActualIconComponent && import.meta.env.DEV) {
      console.warn(
        `[${context}] "${iconName}"이(가) 객체이지만 컴포넌트를 찾을 수 없습니다.`
      );
    }
  }

  if (!ActualIconComponent) {
    return undefined;
  }

  // React.createElement로 아이콘 생성
  try {
    return React.createElement(ActualIconComponent, {});
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error(`[${context}] 아이콘 생성 실패: "${iconName}"`, error);
    }
    return undefined;
  }
};

/**
 * 메뉴 아이콘 반환 (동적 생성)
 *
 * 메뉴 아이템에서 아이콘을 가져오는 함수입니다.
 * 다음 우선순위로 아이콘을 찾습니다:
 * 1. 메뉴에 icon 필드가 있으면 우선 사용 (백엔드에서 제공하는 경우)
 * 2. 경로/이름 기반 자동 매핑 (iconMapping.ts 참조)
 * 3. 기본 아이콘 반환 (AppstoreOutlined)
 * 4. 모든 방법이 실패하면 StarOutlined 반환 (fallback)
 *
 * @param menu - 메뉴 아이템
 * @param context - 로깅 컨텍스트 (예: "MainSidebar", "MainHeader"). 기본값: "iconUtils"
 * @returns 아이콘 컴포넌트 (항상 반환됨, 최소한 StarOutlined)
 *
 * @example
 * ```tsx
 * const icon = getMenuIcon(menuItem, "MainSidebar");
 * // 메뉴에 맞는 아이콘 반환
 * ```
 */
export const getMenuIcon = (
  menu: MenuItem,
  context: string = "iconUtils"
): React.ReactNode => {
  // 1. 메뉴에 icon 필드가 있으면 우선 사용 (백엔드에서 제공)
  if (menu.icon) {
    const icon = getIconByName(menu.icon, context);
    if (icon) {
      return icon;
    }
  }

  // 2. 매핑 설정에서 찾기 (경로/이름 기반 자동 매핑)
  const iconName = findIconName(menu.path, menu.pgmName);
  if (iconName) {
    const icon = getIconByName(iconName, context);
    if (icon) {
      return icon;
    }
  }

  // 3. 매핑되지 않은 경우 기본 아이콘 반환
  const defaultIcon = getIconByName(DEFAULT_ICON_NAME, context);
  if (defaultIcon) {
    return defaultIcon;
  }

  // 4. 모든 방법이 실패하면 StarOutlined 반환 (fallback)
  return React.createElement(StarOutlined);
};
