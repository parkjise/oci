// src/utils/fileUtils.ts

/**
 * 파일 크기(bytes)를 사람이 읽기 쉬운 형식(KB, MB, GB...)으로 변환합니다.
 * @param bytes 파일 크기 (number)
 * @param decimals 소수점 이하 자릿수 (기본값: 2)
 * @returns 포맷팅된 파일 크기 문자열
 */
export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * 파일 이름에서 확장자를 추출합니다.
 * @param filename 파일 이름 문자열
 * @returns 소문자로 변환된 확장자 (예: "jpg", "pdf")
 */
export const getFileExtension = (filename: string): string => {
  if (!filename) return "";
  // 마지막 '.'의 위치를 찾고, 그 이후의 문자열을 추출합니다.
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex < 0) return ""; // '.'이 없으면 확장자 없음
  return filename.slice(lastDotIndex + 1).toLowerCase();
};

/**
 * 파일 이름에서 확장자를 제외한 순수 파일명을 추출합니다.
 * @param filename 파일 이름 문자열
 * @returns 확장자가 제거된 파일명
 */
export const getFileNameWithoutExtension = (filename: string): string => {
  if (!filename) return "";
  const lastDotIndex = filename.lastIndexOf(".");
  if (lastDotIndex === -1) return filename; // 확장자가 없는 경우
  return filename.slice(0, lastDotIndex);
};

/**
 * File 객체를 Base64 데이터 URL로 변환합니다. (주로 이미지 미리보기에 사용)
 * 이 함수는 비동기적으로 작동하며 Promise를 반환합니다.
 * @param file 변환할 File 객체
 * @returns Promise<string | ArrayBuffer | null> - Base64로 인코딩된 데이터 URL
 */
export const fileToBase64 = (
  file: File
): Promise<string | ArrayBuffer | null> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file); // 파일을 Data URL로 읽음
    reader.onload = () => resolve(reader.result); // 성공 시
    reader.onerror = (error) => reject(error); // 실패 시
  });
};

/**
 * 파일이 허용된 확장자 목록에 포함되는지 확인합니다.
 * @param file 확인할 File 객체
 * @param allowedExtensions 허용되는 확장자 배열 (예: ['jpg', 'png', 'gif'])
 * @returns 허용되면 true, 아니면 false
 */
export const isAllowedExtension = (
  file: File,
  allowedExtensions: string[]
): boolean => {
  if (!file) return false;
  const extension = getFileExtension(file.name);
  return allowedExtensions.includes(extension);
};

/**
 * 파일 크기가 최대 허용 크기를 초과하는지 확인합니다.
 * @param file 확인할 File 객체
 * @param maxSizeInMB 최대 허용 크기 (MB 단위)
 * @returns 크기를 초과하면 true, 아니면 false
 */
export const isFileSizeExceeded = (
  file: File,
  maxSizeInMB: number
): boolean => {
  if (!file) return false;
  const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
  return file.size > maxSizeInBytes;
};
