# API Modules - AI Agent Context

## Module Context

프론트엔드에서 백엔드 API를 호출하기 위한 모듈. Axios 인스턴스를 기반으로 도메인별로 구조화되어 있으며, 공통 API 함수(`get`, `post`, `put`, `patch`, `del`)를 통해 일관된 방식으로 API를 호출한다.

---

## Directory Structure

```
apis/
├── auth/          # 인증 관련 API
├── fcm/           # 재무회계 API (가장 큰 도메인)
│   ├── ap/        # 매출채권 (Accounts Payable)
│   ├── ar/        # 매입채권 (Accounts Receivable)
│   ├── fa/        # 고정자산 (Fixed Assets)
│   ├── gl/        # 총계정원장 (General Ledger)
│   └── md/        # 마스터 데이터 (Master Data)
├── system/        # 시스템 관리 API
│   ├── code/      # 코드 관리
│   ├── file/      # 파일 관리
│   ├── org/       # 조직 관리
│   ├── user/      # 사용자 관리
│   └── ...
├── com/           # 공통 모듈
│   ├── code/      # 공통코드 API
│   ├── popup/     # 공통 팝업 API
│   ├── file/      # 공통 파일 API
│   └── biz/       # 공통 비즈니스 로직
├── common/        # 공통 유틸리티
│   ├── api.ts     # 공통 API 함수 (get, post, put, patch, del)
│   └── axiosInstance.ts  # Axios 인스턴스 설정
├── menu/          # 메뉴 API
├── main/          # 메인 화면 API
├── hr/            # 인사 API
├── ma/            # 자재관리 API
├── po/            # 구매 API
├── tr/            # 거래처 API
└── index.ts       # Barrel export
```

---

## Implementation Patterns

### 공통 API 함수 사용

모든 API 호출은 `@apis/common/api`에서 제공하는 공통 함수를 사용한다:

- `get<T>(url, config?)`: GET 요청
- `post<T>(url, data?, config?)`: POST 요청
- `put<T>(url, data?, config?)`: PUT 요청
- `patch<T>(url, data?, config?)`: PATCH 요청
- `del<T>(url, config?)`: DELETE 요청
- `getPaginated<T>(url, params?, config?)`: 페이징 GET 요청

모든 함수는 `ApiResponse<T>` 타입을 반환한다.

### API 모듈 생성 패턴

```typescript
// apis/fcm/gl/slip/slipPostApi.ts
import { post } from "@apis/common/api";
import type { ApiResponse } from "@/types/com/api/axios.types";
import type {
  SlipPostSearchRequest,
  SlipPostSearchResponse,
  SlipPostSaveRequest,
} from "@/types/fcm/gl/slip/slipPost.types";

/**
 * 전표 전기 조회
 * @param request 조회 조건
 * @returns 전표 전기 목록
 */
export const selectSlipPostList = async (
  request: SlipPostSearchRequest
): Promise<ApiResponse<SlipPostSearchResponse[]>> => {
  return await post<SlipPostSearchResponse[]>(
    "/fcm/gl/slip/selectSlipPostList",
    request
  );
};

/**
 * 전표 전기 저장
 * @param request 저장할 전표 전기 데이터
 * @returns 저장 결과
 */
export const saveSlipPost = async (
  request: SlipPostSaveRequest
): Promise<ApiResponse<void>> => {
  return await post<void>("/fcm/gl/slip/saveSlipPost", request);
};
```

### GET 요청 예시

```typescript
// apis/com/code/code.ts
import { get } from "@apis/common/api";
import type { ApiResponse } from "@/types/com/api/axios.types";

export const getCodeDetailApi = async (
  params?: CodeDetailParams
): Promise<ApiResponse<CodeDetail>> => {
  return get<CodeDetail>("/system/pgm/code/detail", {
    params,
  });
};
```

### DELETE 요청 예시

```typescript
// apis/system/file/fileApi.ts
import { del } from "@apis/common/api";

export const deleteFileApi = async (
  eatKey: number,
  eatIdx: string
): Promise<ApiResponse<void>> => {
  return del<void>(`/system/files/${eatKey}/${eatIdx}`);
};
```

### 페이징 조회 예시

```typescript
import { getPaginated } from "@apis/common/api";

export const getListWithPaging = async (
  params: { page: number; pageSize: number; keyword?: string }
): Promise<ApiResponse<PaginatedResponse<ItemData>>> => {
  return getPaginated<ItemData>("/api/items/list", params);
};
```

### 사용 예시 (컴포넌트에서)

```typescript
import { selectSlipPostList } from "@apis/fcm/gl/slip/slipPostApi";

const handleSearch = async () => {
  try {
    const response = await selectSlipPostList({
      fromDate: "2024-01-01",
      toDate: "2024-12-31",
    });
    
    if (response.success) {
      setRowData(response.data);
    }
  } catch (error) {
    console.error("조회 실패:", error);
  }
};
```

---

## Axios 인스턴스 설정

### 기본 설정

- **Base URL**: `/api` (자동으로 모든 요청에 추가됨)
- **Timeout**: 10초
- **Content-Type**: `application/json`
- **withCredentials**: `true` (쿠키 자동 전송)

### 자동 기능

1. **인증 토큰 자동 추가**: 요청 시 `Authorization: Bearer {token}` 헤더 자동 추가
2. **토큰 자동 갱신**: 401 에러 시 자동으로 토큰 갱신 후 재시도
3. **에러 자동 처리**: 네트워크 에러, 403, 404, 500 등 자동 처리 및 메시지 표시
4. **다국어 지원**: `X-User-Locale` 헤더 자동 추가

### ApiRequestConfig 옵션

```typescript
interface ApiRequestConfig {
  skipAuth?: boolean;        // 인증 토큰 제외 (기본: false)
  skipErrorHandler?: boolean; // 에러 핸들러 스킵 (기본: false)
  params?: Record<string, unknown>; // 쿼리 파라미터
  // ... 기타 AxiosRequestConfig 옵션
}
```

### 특수 케이스: 파일 업로드/다운로드

파일 관련 작업은 `@apis/com/file/fileApi`의 전용 함수를 사용:

```typescript
import { upload, download } from "@apis/com/file/fileApi";

// 파일 업로드
const formData = new FormData();
formData.append("files", file);
const response = await upload<FileItem[]>("/system/files/upload", formData);

// 파일 다운로드
await download("/system/files/download/123/abc", "filename.pdf");
```

---

## API 응답 타입

모든 API 응답은 `ApiResponse<T>` 타입으로 래핑된다:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  code?: string | number;
}
```

### 페이징 응답

페이징이 필요한 경우 `PaginatedResponse<T>` 타입 사용:

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
```

---

## URL Patterns

- **Base URL**: `/api` (axiosInstance에 설정됨)
- **실제 엔드포인트**: `/api` 이후 경로만 지정
  - 예: `"/fcm/gl/slip/selectSlipPostList"` → 실제 URL: `/api/fcm/gl/slip/selectSlipPostList`
- **일반적인 패턴**:
  - 조회: `POST /api/[domain]/[module]/select...List` 또는 `GET /api/[domain]/[module]/list`
  - 단건 조회: `GET /api/[domain]/[module]/{id}`
  - 저장: `POST /api/[domain]/[module]/save...`
  - 삭제: `DELETE /api/[domain]/[module]/{id}`

---

## Local Golden Rules

### Do's

- **공통 API 함수 사용**: `get`, `post`, `put`, `patch`, `del` 사용 필수
- **타입 명시**: 모든 API 함수에 반환 타입 `Promise<ApiResponse<T>>` 명시
- **요청/응답 DTO 타입 정의**: `@/types` 디렉토리에 타입 정의
- **응답 데이터 확인**: `response.success` 체크 후 `response.data` 사용
- **에러 핸들링**: try-catch로 에러 처리 (기본 에러 핸들링은 axiosInstance에서 처리)
- **Barrel Export**: 각 모듈의 `index.ts`에서 API 함수 re-export

### Don'ts

- **axios 직접 호출 금지**: 컴포넌트나 API 모듈에서 `axios` 직접 import 금지
- **axiosInstance 직접 사용 지양**: 특수한 경우(파일 다운로드 등)를 제외하고는 공통 함수 사용
- **API URL 하드코딩 금지**: `/api` baseURL은 자동 추가되므로 제외하고 경로만 지정
- **응답 데이터 타입 `any` 사용 금지**: 명확한 타입 정의 필수
- **BASE_URL 상수 불필요**: baseURL은 axiosInstance에 설정되어 있음

---

## 특수 케이스

### 인증이 필요 없는 요청

```typescript
import { get } from "@apis/common/api";

export const getPublicData = async (): Promise<ApiResponse<Data>> => {
  return get<Data>("/public/data", {
    skipAuth: true, // 인증 토큰 제외
  });
};
```

### 에러 핸들러 스킵

```typescript
import { post } from "@apis/common/api";

export const silentRequest = async (): Promise<ApiResponse<void>> => {
  return post<void>("/api/endpoint", data, {
    skipErrorHandler: true, // 기본 에러 핸들링 스킵
  });
};
```

### 캐싱이 필요한 API

```typescript
// apis/com/code/code.ts 예시
const codeCache = new Map<string, ApiResponse<CodeDetail>>();

export const getCodeDetailApi = async (
  params?: CodeDetailParams
): Promise<ApiResponse<CodeDetail>> => {
  const cacheKey = getCacheKey(params);
  
  if (codeCache.has(cacheKey)) {
    return codeCache.get(cacheKey)!;
  }
  
  const response = await get<CodeDetail>("/system/pgm/code/detail", {
    params,
  });
  
  codeCache.set(cacheKey, response);
  return response;
};
```
