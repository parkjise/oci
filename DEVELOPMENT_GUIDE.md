# Frontend Project 개발 가이드

## 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [기술 스택](#기술-스택)
3. [프로젝트 구조](#프로젝트-구조)
4. [개발 표준](#개발-표준)
5. [컴포넌트 작성 가이드](#컴포넌트-작성-가이드)
6. [API 작성 가이드](#api-작성-가이드)
7. [스타일링 가이드](#스타일링-가이드)
8. [상태 관리](#상태-관리)
9. [라우팅](#라우팅)
10. [다국어 처리](#다국어-처리)
11. [빌드 및 배포](#빌드-및-배포)

---

## 프로젝트 개요

이 프로젝트는 **React 19**와 **TypeScript**를 기반으로 한 엔터프라이즈급 프론트엔드 애플리케이션입니다.

### 주요 특징
- **Vite** 기반 빌드 시스템
- **React Compiler**를 통한 자동 최적화
- **Ant Design 5** UI 컴포넌트 라이브러리
- **AG-Grid Enterprise** 데이터 그리드
- **Zustand** 상태 관리
- **i18next** 다국어 지원
- **TypeScript** 엄격한 타입 체크

---

## 기술 스택

### 핵심 라이브러리
- **React**: ^19.2.0
- **TypeScript**: ~5.9.3
- **Vite**: rolldown-vite@7.1.14
- **Ant Design**: ^5.28.0
- **AG-Grid**: ^34.3.1 (Community + Enterprise)
- **Zustand**: ^5.0.8 (상태 관리)
- **React Router**: ^7.9.5
- **Axios**: ^1.13.1
- **i18next**: ^25.6.0
- **Styled Components**: ^6.1.19

### 개발 도구
- **ESLint**: ^9.36.0
- **TypeScript ESLint**: ^8.45.0
- **Sass**: ^1.93.3

---

## 프로젝트 구조

```
src/
├── apis/              # API 호출 함수
│   ├── auth/          # 인증 관련 API
│   ├── common/        # 공통 API (axios 인스턴스)
│   ├── fcm/           # FCM 도메인 API
│   └── ...
├── assets/            # 정적 리소스
│   └── images/       # 이미지 파일
├── components/        # React 컴포넌트
│   ├── features/     # 도메인별 기능 컴포넌트
│   ├── layout/       # 레이아웃 컴포넌트
│   ├── providers/    # Context Provider 컴포넌트
│   └── ui/           # 재사용 가능한 UI 컴포넌트
├── constants/         # 상수 정의
│   ├── auth/         # 인증 관련 상수
│   ├── layout/       # 레이아웃 관련 상수
│   └── ...
├── hooks/             # Custom Hooks
├── language/          # 다국어 번역 파일
│   ├── en/           # 영어
│   └── ko/           # 한국어
├── pages/             # 페이지 컴포넌트
│   ├── login/        # 로그인 페이지
│   ├── main/         # 메인 페이지
│   ├── sample/       # 샘플 페이지
│   └── ...
├── store/             # Zustand 스토어
│   ├── authStore.ts  # 인증 상태 관리
│   └── uiStore.ts    # UI 상태 관리
├── styles/            # 전역 스타일
├── theme/             # 테마 설정
├── types/             # TypeScript 타입 정의
├── utils/             # 유틸리티 함수
├── App.tsx            # 루트 컴포넌트
├── i18n.ts            # i18n 설정
└── main.tsx           # 엔트리 포인트
```

---

## 개발 표준

### 파일 명명 규칙

#### 컴포넌트 파일
- **컴포넌트 파일**: `PascalCase.tsx` (예: `FormInput.tsx`, `MainLayout.tsx`)
- **스타일 파일**: `ComponentName.styles.ts` (예: `FormInput.styles.ts`)
- **타입 파일**: `ComponentName.types.ts` (선택사항, 타입이 복잡한 경우)
- **인덱스 파일**: `index.ts` (Barrel Export용)

#### 일반 파일
- **유틸리티**: `camelCase.ts` (예: `tokenUtils.ts`, `stringUtils.ts`)
- **API 파일**: `camelCaseApi.ts` (예: `authApi.ts`, `mainApi.ts`)
- **상수 파일**: `camelCase.ts` (예: `layout.ts`, `menu.ts`)
- **타입 파일**: `camelCase.types.ts` (예: `auth.types.ts`, `api.types.ts`)

### 변수 및 함수 명명 규칙

#### 변수
- **일반 변수**: `camelCase` (예: `userName`, `isLoading`)
- **상수**: `UPPER_SNAKE_CASE` (예: `API_BASE_URL`, `MAX_RETRY_COUNT`)
- **컴포넌트**: `PascalCase` (예: `FormInput`, `MainLayout`)

#### 함수
- **일반 함수**: `camelCase` (예: `getUserInfo`, `handleSubmit`)
- **이벤트 핸들러**: `handle` 접두사 (예: `handleClick`, `handleChange`)
- **API 함수**: `동사 + 명사 + Api` (예: `getUserInfoApi`, `createUserApi`)

#### 타입 및 인터페이스
- **인터페이스**: `PascalCase` (예: `UserInfo`, `ApiResponse`)
- **타입 별칭**: `PascalCase` (예: `FormInputProps`, `AuthState`)
- **제네릭**: `T`, `K`, `V` 또는 `PascalCase` (예: `TData`, `TResponse`)

### 폴더 구조 규칙

#### 컴포넌트 폴더 구조
```
ComponentName/
├── ComponentName.tsx          # 컴포넌트 파일
├── ComponentName.styles.ts    # 스타일 파일
├── ComponentName.types.ts     # 타입 정의 (선택사항)
└── index.ts                   # Barrel Export
```

#### 도메인별 폴더 구조
도메인 기반으로 폴더를 구성합니다:
- `apis/fcm/ap/expense/` - FCM > AP > Expense API
- `pages/fcm/ap/expense/` - FCM > AP > Expense 페이지
- `components/features/fcm/ap/expense/` - FCM > AP > Expense 기능 컴포넌트
- `constants/fcm/ap/` - FCM > AP 상수

### Export/Import 규칙

#### Barrel Export 사용
각 폴더에는 `index.ts` 파일을 두어 Barrel Export를 사용합니다:

```typescript
// src/components/ui/form/index.ts
export { default as FormInput } from "./Input";
export { default as FormSelect } from "./Select";
export type { FormInputProps } from "./Input/FormInput";
```

#### Import 경로 별칭 사용
`vite.config.ts`에 정의된 별칭을 사용합니다:

```typescript
// ✅ 좋은 예
import { FormInput } from "@components/ui/form";
import { getUserInfoApi } from "@apis/auth";
import { useAuthStore } from "@store/authStore";

// ❌ 나쁜 예
import { FormInput } from "../../../components/ui/form/Input";
```

#### Import 순서
1. React 및 외부 라이브러리
2. 내부 컴포넌트 (@components)
3. 내부 유틸리티 (@utils, @hooks)
4. 타입 정의
5. 상대 경로 import

```typescript
// 예시
import React from "react";
import { Button, Form } from "antd";
import { FormInput } from "@components/ui/form";
import { useAuthStore } from "@store/authStore";
import type { UserInfo } from "@/types/auth.types";
import { formatDate } from "./utils";
```

### 코드 구조 표준

#### 컴포넌트 구조
컴포넌트는 다음 순서로 구성합니다:

```typescript
// ============================================================================
// Import
// ============================================================================
import React from "react";
// ... imports

// ============================================================================
// Types
// ============================================================================
interface ComponentProps {
  // ...
}

// ============================================================================
// Component
// ============================================================================
const Component: React.FC<ComponentProps> = ({ prop1, prop2 }) => {
  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------
  const [state, setState] = React.useState();

  // --------------------------------------------------------------------------
  // Refs
  // --------------------------------------------------------------------------
  const ref = React.useRef();

  // --------------------------------------------------------------------------
  // Effects
  // --------------------------------------------------------------------------
  React.useEffect(() => {
    // ...
  }, []);

  // --------------------------------------------------------------------------
  // Hooks
  // --------------------------------------------------------------------------
  const customHook = useCustomHook();

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------
  const handleClick = () => {
    // ...
  };

  // --------------------------------------------------------------------------
  // Render
  // --------------------------------------------------------------------------
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default Component;
```

---

## 컴포넌트 작성 가이드

### UI 컴포넌트 (`components/ui/`)

재사용 가능한 범용 UI 컴포넌트입니다.

#### 예시: FormInput 컴포넌트
```typescript
// src/components/ui/form/Input/FormInput.tsx
import React from "react";
import { Form, Input } from "antd";
import type { InputProps } from "antd";

interface FormInputProps extends Omit<InputProps, "addonAfter"> {
  name: string;
  label: string;
  rules?: Rule[];
  layout?: "vertical" | "horizontal" | "inline";
}

const FormInput: React.FC<FormInputProps> = ({
  name,
  label,
  rules,
  layout = "vertical",
  ...rest
}) => {
  return (
    <Form.Item name={name} label={label} rules={rules} layout={layout}>
      <Input {...rest} />
    </Form.Item>
  );
};

export default FormInput;
```

### 기능 컴포넌트 (`components/features/`)

특정 도메인에 종속된 기능 컴포넌트입니다.

#### 예시: FilterPanel 컴포넌트
```typescript
// src/components/features/sample2/FilterPanel/FilterPanel.tsx
import React from "react";
import { FormInput, FormSelect } from "@components/ui/form";

const FilterPanel: React.FC = () => {
  const [form] = Form.useForm();

  return (
    <Form form={form}>
      <FormInput name="search" label="검색" />
      <FormSelect name="status" label="상태" />
    </Form>
  );
};

export default FilterPanel;
```

### 페이지 컴포넌트 (`pages/`)

라우트에 직접 연결되는 페이지 컴포넌트입니다.

```typescript
// src/pages/sample/sample2/Sample2.tsx
import React from "react";
import { FilterPanel, RecordList } from "@components/features/sample2";
import { SplitLayout } from "@components/ui/layout";

const Sample2: React.FC = () => {
  return (
    <div>
      <FilterPanel />
      <SplitLayout
        left={<RecordList />}
        right={<DetailView />}
      />
    </div>
  );
};

export default Sample2;
```

---

## API 작성 가이드

### API 파일 구조

```typescript
// src/apis/fcm/ap/expense/expenseApi.ts
import axiosInstance from "@apis/common/axiosInstance";
import type { ApiResponse } from "@/types/api.types";

// ============================================================================
// Types
// ============================================================================
export interface ExpenseRequest {
  // ...
}

export interface ExpenseResponse {
  // ...
}

// ============================================================================
// API Functions
// ============================================================================
export const getExpenseListApi = async (
  params: ExpenseRequest
): Promise<ApiResponse<ExpenseResponse[]>> => {
  const response = await axiosInstance.get("/fcm/ap/expense", { params });
  return response.data;
};

export const createExpenseApi = async (
  data: ExpenseRequest
): Promise<ApiResponse<ExpenseResponse>> => {
  const response = await axiosInstance.post("/fcm/ap/expense", data);
  return response.data;
};
```

### API 함수 명명 규칙
- **조회**: `get + 명사 + Api` (예: `getUserListApi`)
- **생성**: `create + 명사 + Api` (예: `createUserApi`)
- **수정**: `update + 명사 + Api` (예: `updateUserApi`)
- **삭제**: `delete + 명사 + Api` (예: `deleteUserApi`)

### Axios 인스턴스 사용

프로젝트의 모든 API 호출은 `@apis/common/axiosInstance`를 사용합니다:

```typescript
import axiosInstance from "@apis/common/axiosInstance";

// 자동으로 토큰이 추가되고, 에러 처리가 됩니다
const response = await axiosInstance.get("/api/users");
```

---

## 스타일링 가이드

### Styled Components 사용

```typescript
// src/components/ui/form/Input/FormInput.styles.ts
import styled from "styled-components";

export const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const InputStyles = styled(Input)`
  border-radius: 6px;
  
  &:hover {
    border-color: #40a9ff;
  }
`;
```

### 스타일 파일 명명
- 스타일 파일: `ComponentName.styles.ts`
- 스타일 컴포넌트: `PascalCase` (예: `InputWrapper`, `ButtonStyles`)

---

## 상태 관리

### Zustand Store 구조

```typescript
// src/store/authStore.ts
import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

### Store 사용 예시

```typescript
import { useAuthStore } from "@store/authStore";

const Component: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  
  // ...
};
```

---

## 라우팅

### 동적 라우팅

프로젝트는 `import.meta.glob`을 사용하여 페이지를 동적으로 로드합니다:

```typescript
// src/utils/pageModules.ts
export const pageModules = import.meta.glob<{ default: ComponentType }>(
  "../pages/**/*.{tsx,ts}",
  { eager: false }
);
```

### 라우트 설정

```typescript
// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy } from "react";

const LoginPage = lazy(() => import("@pages/login/Login"));
const MainLayout = lazy(() => import("@components/layout").then(m => ({ default: m.MainLayout })));

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/app/*" element={<MainLayout />} />
      </Routes>
    </BrowserRouter>
  );
}
```

---

## 다국어 처리

### i18n 설정

기본 언어는 **한국어(ko)**입니다.

### 번역 파일 사용

```typescript
// src/language/ko/translation.json
{
  "menu.login": "로그인",
  "menu.main": "메인"
}
```

### 컴포넌트에서 사용

```typescript
import { useTranslation } from "react-i18next";

const Component: React.FC = () => {
  const { t } = useTranslation();
  
  return <div>{t("menu.login")}</div>;
};
```

---

## 빌드 및 배포

### 개발 서버 실행

```bash
npm run dev
```

### 프로덕션 빌드

```bash
npm run build
```

### 빌드 결과 미리보기

```bash
npm run preview
```

### 린트 검사

```bash
npm run lint
```

### TypeScript 타입 체크

```bash
npm run build
# 또는
npx tsc -b
```

---

## 추가 가이드

### 환경 변수

`.env` 파일에 환경 변수를 정의합니다:

```env
VITE_API_BASE_URL=http://localhost:8081/api
```

### 개발 모드 체크

```typescript
if (import.meta.env.DEV) {
  console.log("개발 모드에서만 실행");
}
```

### 코드 품질

- **ESLint**: 모든 파일은 ESLint 규칙을 준수해야 합니다
- **TypeScript**: 엄격한 타입 체크를 사용합니다
- **명명 규칙**: 위의 명명 규칙을 준수해야 합니다

---

## 참고 자료

- [React 공식 문서](https://react.dev/)
- [TypeScript 핸드북](https://www.typescriptlang.org/docs/)
- [Ant Design 문서](https://ant.design/)
- [AG-Grid 문서](https://www.ag-grid.com/)
- [Zustand 문서](https://zustand-demo.pmnd.rs/)
- [Vite 문서](https://vitejs.dev/)

