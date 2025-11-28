/**
 * 메뉴 경로/이름과 아이콘 매핑 설정
 *
 * 메뉴의 path나 pgmName을 기반으로 자동으로 아이콘을 매핑합니다.
 * 백엔드에서 icon 필드를 제공하지 않는 경우 이 매핑이 사용됩니다.
 */
export const iconMapping: Record<string, string> = {
  구매재고: "ShoppingOutlined",
  재무회계: "AccountBookOutlined",
  관리회계: "CalculatorOutlined",
  자금관리: "DollarOutlined",
  전자결재: "FileTextOutlined",
  시스템관리: "SettingOutlined",
};

/**
 * 경로나 이름으로 아이콘 이름 찾기
 *
 * 매핑 규칙:
 * - path나 name에 키워드가 포함되어 있으면 해당 아이콘 반환
 * - 여러 키워드가 매칭되면 첫 번째로 매칭된 아이콘 반환
 * - 대소문자 구분 없이 매칭 (영문 키워드만 해당, 한글은 대소문자 없음)
 * - 한글 키워드는 정확히 일치하거나 포함되어 있으면 매칭
 *
 * @param path - 메뉴 경로 (예: "/pages/users/Users.tsx")
 * @param name - 메뉴 이름 (pgmName, 예: "사용자관리", "구매재고")
 * @returns 아이콘 이름 또는 undefined
 */
export const findIconName = (
  path?: string,
  name?: string
): string | undefined => {
  // 1. name 기반 매칭 (우선순위 높음 - 더 정확한 매칭)
  if (name && typeof name === "string") {
    // 공백 제거한 버전도 함께 검색
    const nameTrimmed = name.trim();
    const nameNoSpace = nameTrimmed.replace(/\s+/g, "");

    for (const [key, iconName] of Object.entries(iconMapping)) {
      const isKoreanKey = /[가-힣]/.test(key);

      if (isKoreanKey) {
        // 한글 키워드: 원본 그대로 비교 (대소문자 변환 불필요)
        // 공백 제거한 버전도 함께 비교
        if (
          name.includes(key) ||
          nameTrimmed.includes(key) ||
          nameNoSpace.includes(key.replace(/\s+/g, ""))
        ) {
          return iconName;
        }
      } else {
        // 영문 키워드: 소문자로 변환하여 비교
        const nameLower = name.toLowerCase();
        const keyLower = key.toLowerCase();
        if (nameLower.includes(keyLower)) {
          return iconName;
        }
      }
    }
  }

  // 2. path 기반 매칭 (fallback)
  if (path && typeof path === "string") {
    const pathLower = path.toLowerCase();
    for (const [key, iconName] of Object.entries(iconMapping)) {
      const isKoreanKey = /[가-힣]/.test(key);

      if (isKoreanKey) {
        // 한글 키워드: 원본 그대로 비교
        if (path.includes(key)) {
          return iconName;
        }
      } else {
        // 영문 키워드: 소문자로 변환하여 비교
        if (pathLower.includes(key.toLowerCase())) {
          return iconName;
        }
      }
    }
  }

  return undefined;
};
