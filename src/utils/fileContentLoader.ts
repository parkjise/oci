/**
 * 파일 내용 로더
 *
 * Vite의 import.meta.glob을 사용하여 파일 내용을 로드합니다.
 * eager: false를 사용하여 필요할 때만 파일을 로드합니다 (코드 스플리팅)
 * 웹 환경에서 실행되며, 각 파일은 별도의 청크로 분리됩니다.
 */

// 정규식 상수
const REGEX_LEADING_SLASHES = /^\/+/;
const REGEX_SRC_PREFIX = /^(src\/|\.\/src\/)/;
const REGEX_PAGES_PREFIX = /^pages\//;
const REGEX_COMPONENTS_PREFIX = /^components\//;
const REGEX_BACKSLASH = /\\/g;
const REGEX_FILE_EXTENSION = /\.(tsx|ts)$/;

/**
 * Vite의 import.meta.glob을 사용하여 파일 내용을 로드합니다.
 * eager: false를 사용하여 필요할 때만 파일을 로드합니다 (코드 스플리팅)
 */
export const fileContentModules = import.meta.glob(
  [
    "../pages/**/*.{tsx,ts}",
    "../components/**/*.{tsx,ts}", // components도 포함하여 버튼 추출 가능하도록
  ],
  {
    eager: false, // 지연 로딩: 필요할 때만 로드
    as: "raw", // 파일을 raw 문자열로 로드
  }
);

// 파일 내용 캐시 (한 번 로드한 파일은 메모리에 저장)
const fileContentCache = new Map<string, string>();

/**
 * 파일 경로를 정규화합니다
 */
const normalizePath = (path: string): string => {
  let normalized = path
    .replace(REGEX_BACKSLASH, "/") // 백슬래시를 슬래시로 먼저 변환
    .replace(REGEX_LEADING_SLASHES, ""); // 앞의 슬래시 제거

  // src/ 또는 ./src/ 패턴 처리
  if (REGEX_SRC_PREFIX.test(normalized)) {
    normalized = normalized.replace(REGEX_SRC_PREFIX, "../");
  }
  // /pages/ 또는 pages/ 패턴 처리 (src/가 없는 경우)
  else if (REGEX_PAGES_PREFIX.test(normalized)) {
    normalized = normalized.replace(REGEX_PAGES_PREFIX, "../pages/");
  }
  // /components/ 또는 components/ 패턴 처리
  else if (REGEX_COMPONENTS_PREFIX.test(normalized)) {
    normalized = normalized.replace(REGEX_COMPONENTS_PREFIX, "../components/");
  }

  return normalized;
};

/**
 * 파일 경로로 파일 로더를 찾습니다
 */
const findFileLoader = (
  normalizedPath: string,
  modules: Record<string, () => Promise<string>>
): (() => Promise<string>) | null => {
  // 1. 정확한 매칭 시도
  if (modules[normalizedPath]) {
    return modules[normalizedPath];
  }

  // 2. 대소문자 무시 매칭
  const normalizedLower = normalizedPath.toLowerCase();
  for (const [key, value] of Object.entries(modules)) {
    if (key.toLowerCase() === normalizedLower) {
      return value;
    }
  }

  // 3. 확장자 제거하고 매칭
  const pathWithoutExt = normalizedPath.replace(REGEX_FILE_EXTENSION, "");
  const pathWithoutExtLower = pathWithoutExt.toLowerCase();

  for (const [key, value] of Object.entries(modules)) {
    const keyWithoutExt = key.replace(REGEX_FILE_EXTENSION, "").toLowerCase();
    if (keyWithoutExt === pathWithoutExtLower) {
      return value;
    }
  }

  return null;
};

/**
 * 파일 경로로 파일 내용을 가져옵니다 (비동기)
 * 캐싱을 통해 동일한 파일은 한 번만 로드합니다.
 * @param filePath 파일 경로 (예: "src/pages/sample/sample1/Sample1.tsx")
 * @returns Promise<string | null>
 */
export const getFileContent = async (
  filePath: string | null | undefined
): Promise<string | null> => {
  if (!filePath) {
    return null;
  }

  try {
    const normalizedPath = normalizePath(filePath);

    // 캐시 확인
    const cachedContent = fileContentCache.get(normalizedPath);
    if (cachedContent !== undefined) {
      return cachedContent;
    }

    // 파일 로더 찾기
    const loader = findFileLoader(normalizedPath, fileContentModules);

    if (!loader) {
      if (import.meta.env.DEV) {
        console.warn("[getFileContent] 파일을 찾을 수 없습니다:", filePath);
        console.log("[getFileContent] 정규화된 경로:", normalizedPath);
        console.log(
          "[getFileContent] 사용 가능한 파일 샘플:",
          Object.keys(fileContentModules).slice(0, 10)
        );

        // 유사한 경로 찾기 (디버깅용)
        const similarPaths = Object.keys(fileContentModules).filter((key) => {
          const keyLower = key.toLowerCase();
          const normalizedLower = normalizedPath.toLowerCase();
          const pathParts = normalizedLower.split("/");
          const lastPart = pathParts[pathParts.length - 1];
          return (
            keyLower.includes(lastPart) ||
            (lastPart && keyLower.endsWith(lastPart))
          );
        });

        if (similarPaths.length > 0) {
          console.log(
            "[getFileContent] 유사한 경로들:",
            similarPaths.slice(0, 5)
          );
        }
      }
      return null;
    }

    // 파일 로드 (비동기)
    const content = (await loader()) as string;

    // 캐시에 저장
    if (content) {
      fileContentCache.set(normalizedPath, content);
      return content;
    }

    return null;
  } catch (error) {
    console.error("[getFileContent] 파일 읽기 오류:", error);
    return null;
  }
};

/**
 * 캐시를 초기화합니다 (필요시 사용)
 */
export const clearFileContentCache = (): void => {
  fileContentCache.clear();
};

/**
 * 로드된 모든 파일 경로 목록을 가져옵니다
 */
export const getAllFilePaths = (): string[] => {
  return Object.keys(fileContentModules);
};
