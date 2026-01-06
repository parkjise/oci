# Store (Zustand) - AI Agent Context

## Module Context

Zustand를 사용한 클라이언트 상태 관리. 각 도메인/화면별로 독립적인 store를 생성하여 관리한다.

---

## Directory Structure

```
store/
├── com/                      # 공통 stores
│   ├── auth/
│   │   └── authStore.ts      # 인증 상태 (로그인, 사용자 정보)
│   └── ui/
│       └── uiStore.ts        # UI 상태 (탭 관리, 사이드바 등)
├── fcm/                      # FCM 도메인 stores
│   ├── gl/                   # 일반원장 (General Ledger)
│   │   ├── closing/
│   │   │   └── closTagManageStore.ts
│   │   ├── settlement/       # 결산
│   │   │   ├── AdvpayCtDtaCreatStore.ts
│   │   │   ├── AdvpayCtExcclcProcesStore.ts
│   │   │   └── FgcryEvlStore.ts
│   │   └── slip/             # 전표
│   │       ├── SlipPost/
│   │       │   └── slipPostStore.ts
│   │       └── SlipRegist/
│   └── md/                   # 마스터 데이터
│       ├── account/          # 계정
│       │   ├── AccnutMngCodeRegistStore.ts
│       │   └── AtmcJrnlzMastrSetupStore.ts
│       ├── other/            # 기타
│       │   └── AccnutCldrManage/
│       │       └── accnutCldrManageStore.ts
│       └── partner/          # 거래처
│           ├── BcncAcnutRegist/
│           │   └── BcncAcnutRegistStore.ts
│           └── BcncRegist/
│               └── BcncRegistStore.ts
└── system/                   # System 도메인 stores
    ├── org/                  # 조직 관리
    │   ├── company/
    │   │   └── companyMngStore.ts
    │   ├── companyuser/
    │   │   └── companyUserMngStore.ts
    │   ├── user/
    │   │   └── userMngStore.ts
    │   ├── workplace/
    │   │   └── workplaceMngStore.ts
    │   └── workplaceuser/
    │       └── workplaceUserMngStore.ts
    └── pgm/                  # 프로그램 관리
        ├── access/           # 접근 권한
        │   ├── menu/
        │   │   └── menuMngStore.ts
        │   └── permission/
        │       └── permissionMngStore.ts
        ├── code/
        │   └── codeMngStore.ts
        └── lang/             # 다국어
            ├── label/
            │   └── labelMngStore.ts
            └── message/
                └── messageMngStore.ts
```

---

## Implementation Patterns

### 기본 Store 패턴 (단순 상태 관리)

```typescript
// store/com/ui/uiStore.ts
import { create } from "zustand";
import type { RouteConfig } from "@/types/com/routes/routes.types";

interface UiState {
  openTabs: RouteConfig[];
  activeTabKey: string | null;
  addTab: (tab: RouteConfig) => void;
  removeTab: (key: string) => void;
  setActiveTabKey: (key: string | null) => void;
  closeAllTabs: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  openTabs: [],
  activeTabKey: null,
  addTab: (tab) =>
    set((state) => {
      const existingTabIndex = state.openTabs.findIndex(
        (t) => t.path === tab.path
      );
      if (existingTabIndex !== -1) {
        return { activeTabKey: tab.path };
      }
      return {
        openTabs: [tab, ...state.openTabs],
        activeTabKey: tab.path,
      };
    }),
  removeTab: (key) =>
    set((state) => {
      const newTabs = state.openTabs.filter((tab) => tab.path !== key);
      const newActiveTabKey =
        state.activeTabKey === key
          ? newTabs.length > 0
            ? newTabs[0].path
            : null
          : state.activeTabKey;
      return {
        openTabs: newTabs,
        activeTabKey: newActiveTabKey,
      };
    }),
  setActiveTabKey: (key) => set({ activeTabKey: key }),
  closeAllTabs: () => set({ openTabs: [], activeTabKey: null }),
}));
```

### API 호출을 포함한 Store 패턴

```typescript
// store/fcm/gl/slip/SlipPost/slipPostStore.ts
import { create } from "zustand";
import { message } from "antd";
import type { GridApi } from "ag-grid-community";
import { slip } from "@apis/fcm/gl";
import type {
  SlipPostSearchRequest,
  SlipPostSearchResponse,
} from "@/types/fcm/gl/slip/slipPost.types";

interface SlipPostState {
  // 상태
  searchData: SlipPostSearchResponse[];
  sPostYn: string;
  loading: boolean;
  gridApi: GridApi | null;
  lastSearchRequest: SlipPostSearchRequest | null; // 마지막 검색 조건 저장

  // 액션
  setSearchData: (data: SlipPostSearchResponse[]) => void;
  setSPostYn: (value: string) => void;
  setLoading: (loading: boolean) => void;
  setGridApi: (api: GridApi | null) => void;
  search: (
    searchRequest: SlipPostSearchRequest,
    sPostYn?: string
  ) => Promise<void>;
  save: (selectedRows: SlipPostSearchResponse[]) => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

export const useSlipPostStore = create<SlipPostState>((set, get) => ({
  // 초기 상태
  searchData: [],
  sPostYn: "UNPOST",
  loading: false,
  gridApi: null,
  lastSearchRequest: null,

  // 상태 설정 액션
  setSearchData: (data) => set({ searchData: data }),
  setSPostYn: (value) => set({ sPostYn: value }),
  setLoading: (loading) => set({ loading }),
  setGridApi: (api) => set({ gridApi: api }),

  // 조회 액션
  search: async (searchRequest, sPostYnParam) => {
    const state = get();
    if (state.loading) return;

    set({ loading: true });
    if (sPostYnParam && sPostYnParam !== state.sPostYn) {
      set({ sPostYn: sPostYnParam });
    }

    try {
      const response = await slip.selectSlipPostList(searchRequest);
      if (response.success && response.data) {
        set({ searchData: response.data, lastSearchRequest: searchRequest });
        message.success(`조회 완료: ${response.data.length}건`);
      } else {
        message.error(response.message || "조회에 실패했습니다.");
        set({ searchData: [] });
      }
    } catch (error) {
      message.error("조회 중 오류가 발생했습니다.");
      set({ searchData: [] });
    } finally {
      set({ loading: false });
    }
  },

  // 재조회 액션 (마지막 검색 조건으로 다시 조회)
  refresh: async () => {
    const state = get();
    if (state.lastSearchRequest) {
      await get().search(state.lastSearchRequest);
    } else {
      message.warning("조회 조건이 없습니다. 먼저 조회를 실행해주세요.");
    }
  },

  // 초기화 액션
  reset: () =>
    set({
      searchData: [],
      sPostYn: "UNPOST",
      loading: false,
      gridApi: null,
      lastSearchRequest: null,
    }),
}));
```

### 인증 Store 패턴 (비동기 초기화 포함)

```typescript
// store/com/auth/authStore.ts
import { create } from "zustand";
import { clearAllTokens, getAccessToken } from "@/utils/tokenUtils";
import { getUserInfoApi } from "@apis/auth";
import type { AuthUser } from "@/types/com/auth/auth.types";

interface AuthState {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isInitialized: boolean;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
  setInitialized: (isInitialized: boolean) => void;
  initializeAuth: () => Promise<void>; // 비동기 초기화
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  isInitialized: false,
  setUser: (user) =>
    set({ user, isAuthenticated: !!user, isInitialized: true }),
  logout: () => {
    clearAllTokens();
    set({ user: null, isAuthenticated: false });
  },
  setInitialized: (isInitialized) => set({ isInitialized }),
  initializeAuth: async () => {
    if (get().isInitialized) return;

    const token = getAccessToken();
    if (!token) {
      set({ isInitialized: true, isAuthenticated: false, user: null });
      return;
    }

    try {
      const response = await getUserInfoApi();
      if (response.success && response.data) {
        set({
          user: response.data,
          isAuthenticated: true,
          isInitialized: true,
        });
      } else {
        clearAllTokens();
        set({ user: null, isAuthenticated: false, isInitialized: true });
      }
    } catch (error) {
      clearAllTokens();
      set({ user: null, isAuthenticated: false, isInitialized: true });
    }
  },
}));
```

### 컴포넌트에서 사용

```typescript
import { useSlipPostStore } from "@store/fcm/gl/slip/SlipPost/slipPostStore";

const Component = () => {
  const { searchData, loading, search, refresh } = useSlipPostStore();

  const handleSearch = async () => {
    await search({ fromDate: "2024-01-01", toDate: "2024-12-31" });
  };

  return (
    <div>
      {loading && <div>로딩 중...</div>}
      {searchData.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
      <button onClick={handleSearch}>조회</button>
      <button onClick={refresh}>재조회</button>
    </div>
  );
};
```

### Selector 패턴 (성능 최적화)

```typescript
// 특정 상태만 구독하여 불필요한 리렌더링 방지
const searchData = useSlipPostStore((state) => state.searchData);
const loading = useSlipPostStore((state) => state.loading);
const search = useSlipPostStore((state) => state.search);

// 또는 여러 개를 한 번에 선택
const { searchData, loading } = useSlipPostStore((state) => ({
  searchData: state.searchData,
  loading: state.loading,
}));
```

### 다른 Store 참조하기

```typescript
// store 내에서 다른 store의 상태나 액션 사용
import { useAuthStore } from "@store/com/auth/authStore";

export const useBcncRegistStore = create<BcncRegistState>((set, get) => ({
  // ...
  save: async (saveRequest) => {
    const { user } = useAuthStore.getState(); // getState()로 직접 접근

    if (!user) {
      message.error("사용자 정보를 찾을 수 없습니다.");
      return;
    }
    // ...
  },
}));
```

### GridApi 관리 패턴

```typescript
// AG-Grid의 GridApi를 store에서 관리
interface MyState {
  gridApi: GridApi | null;
  setGridApi: (api: GridApi | null) => void;
  // ...
}

export const useMyStore = create<MyState>((set) => ({
  gridApi: null,
  setGridApi: (api) => set({ gridApi: api }),
  // ...
}));

// 컴포넌트에서 사용
const { gridApi, setGridApi } = useMyStore();

<FormAgGrid
  onGridReady={(params) => setGridApi(params.api)}
  // ...
/>
```

### 마지막 검색 조건 저장 패턴

```typescript
// refresh 기능을 위한 패턴
interface MyState {
  lastSearchRequest: SearchRequest | null;
  search: (request: SearchRequest) => Promise<void>;
  refresh: () => Promise<void>;
}

export const useMyStore = create<MyState>((set, get) => ({
  lastSearchRequest: null,
  search: async (request) => {
    // ... 검색 로직
    set({ lastSearchRequest: request }); // 마지막 검색 조건 저장
  },
  refresh: async () => {
    const state = get();
    if (state.lastSearchRequest) {
      await get().search(state.lastSearchRequest); // 마지막 조건으로 재조회
    }
  },
}));
```

---

## Naming Conventions

- **Store 파일**: `[screenName]Store.ts` 또는 `[screenName]MngStore.ts` (관리 화면의 경우)
- **Hook 이름**: `use[ScreenName]Store`
- **State 인터페이스**: `[ScreenName]State`
- **디렉토리 구조**: 도메인별로 디렉토리 분리 (예: `fcm/gl/slip/SlipPost/`)

## Import 경로 패턴

```typescript
// 공통 store
import { useAuthStore } from "@store/com/auth/authStore";
import { useUiStore } from "@store/com/ui/uiStore";

// FCM 도메인 store
import { useSlipPostStore } from "@store/fcm/gl/slip/SlipPost/slipPostStore";
import { useBcncRegistStore } from "@store/fcm/md/partner/BcncRegist/BcncRegistStore";

// System 도메인 store
import { useUserMngStore } from "@store/system/org/user/userMngStore";
import { useCodeMngStore } from "@store/system/pgm/code/codeMngStore";
```

## Store 타입 정의 위치

Store에서 사용하는 타입은 `@/types` 디렉토리에서 import:

```typescript
import type {
  SlipPostSearchRequest,
  SlipPostSearchResponse,
} from "@/types/fcm/gl/slip/slipPost.types";
```

## 주요 Store 목록

### 공통 Store (com/)

- `useAuthStore` - 인증 상태 관리 (로그인, 사용자 정보, 초기화)
- `useUiStore` - UI 상태 관리 (탭 관리, 활성 탭)

### FCM 도메인 Store

#### 일반원장 (gl/)

- `useSlipPostStore` - 전표 전기 관리
- `useClosTagManageStore` - 마감 태그 관리
- `useAdvpayCtDtaCreatStore` - 선급금 데이터 생성
- `useAdvpayCtExcclcProcesStore` - 선급금 정산 처리
- `useFgcryEvlStore` - 외화 평가

#### 마스터 데이터 (md/)

- `useAccnutMngCodeRegistStore` - 관리항목 등록
- `useAtmcJrnlzMastrSetupStore` - 자동분개 마스터 설정
- `useAccnutCldrManageStore` - 회계 달력 관리
- `useBcncRegistStore` - 거래처 등록
- `useBcncAcnutRegistStore` - 거래처 계정 등록

### System 도메인 Store

#### 조직 관리 (org/)

- `useCompanyMngStore` - 회사 관리
- `useCompanyUserMngStore` - 회사 사용자 관리
- `useUserMngStore` - 사용자 관리
- `useWorkplaceMngStore` - 사업장 관리
- `useWorkplaceUserMngStore` - 사업장 사용자 관리

#### 프로그램 관리 (pgm/)

- `useMenuMngStore` - 메뉴 관리
- `usePermissionMngStore` - 권한 관리
- `useCodeMngStore` - 코드 관리
- `useLabelMngStore` - 라벨 관리
- `useMessageMngStore` - 메시지 관리

---

## Local Golden Rules

### Do's

- **초기 상태 관리**: 초기 상태를 명확히 정의하고 `reset` 함수로 초기화 기능 제공.
- **Selector 패턴**: 필요한 상태만 구독하여 불필요한 리렌더링 방지.
- **마지막 검색 조건 저장**: `lastSearchRequest`를 저장하여 `refresh` 기능 제공.
- **GridApi 관리**: AG-Grid의 `GridApi`를 store에서 관리하여 그리드 제어.
- **로딩 상태 관리**: API 호출 시 `loading` 상태를 관리하여 UI 피드백 제공.
- **에러 처리**: API 호출 실패 시 적절한 에러 메시지 표시 (`message.error`).
- **다른 Store 참조**: `useAuthStore.getState()` 등으로 다른 store 상태 참조 가능.
- **비동기 액션**: `async/await`를 사용하여 비동기 로직을 store 액션에서 처리 가능.

### Don'ts

- **중첩 객체 직접 변경 금지**: 항상 spread 연산자(`...`)를 사용하여 불변성 유지.
- **전역 상태 남용**: 모든 것을 전역 상태로 관리하지 않고, 로컬 상태 우선 사용.
- **무한 루프 방지**: `get()` 사용 시 순환 참조 주의.
- **메모리 누수 방지**: 컴포넌트 언마운트 시 `reset()` 호출 고려.

### Store 내 API 호출에 대한 가이드라인

프로젝트에서는 **Store 내에서 API 호출을 허용**합니다. 다만 다음 규칙을 따릅니다:

- **비즈니스 로직 포함**: 단순 API 호출이 아닌 비즈니스 로직이 포함된 경우 store에서 처리.
- **에러 처리**: 모든 API 호출에 대한 에러 처리 필수.
- **로딩 상태**: API 호출 시 `loading` 상태 관리 필수.
- **메시지 표시**: 성공/실패 시 `message.success` 또는 `message.error` 사용.
- **재조회 기능**: `lastSearchRequest` 저장 및 `refresh` 함수 제공.
