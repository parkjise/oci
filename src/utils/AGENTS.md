# Utils - AI Agent Context

## Module Context

프로젝트 전역에서 사용되는 공통 유틸리티 함수 모음. 문자열 처리, 날짜 포맷팅, 파일 처리, 그리드 조작 등 다양한 헬퍼 함수들을 제공한다.

---

## Directory Structure

```
utils/
├── tokenUtils.ts          # 토큰 관리 (localStorage/cookie)
├── stringUtils.ts         # 문자열 처리, 포맷팅, 검증
├── dateUtils.ts           # 날짜 포맷팅 및 변환
├── excelUtils.ts          # Excel 파일 파싱 및 처리
├── agGridUtils.tsx        # AG-Grid 관련 헬퍼 함수
├── fileUtils.ts           # 파일 처리 유틸리티
├── iconUtils.ts           # 아이콘 동적 로드
├── menuTabUtils.ts        # 메뉴/탭 관련 유틸리티
├── menuCache.ts           # 메뉴 캐시 관리
├── formModalUtils.ts      # 폼 모달 플래그 관리
└── pageModules.ts         # 페이지 컴포넌트 동적 로드
```

---

## 주요 유틸리티

### stringUtils

문자열 처리, 포맷팅, 검증 함수들.

**주요 함수:**

- `isEmpty(value)` - 값이 비어있는지 확인
- `capitalize(str)` - 첫 글자 대문자 변환
- `formatNumberWithCommas(num)` - 숫자에 콤마 추가
- `removeCommasFromNumber(value)` - 숫자 문자열에서 콤마 제거
- `normalizeNumberValue(value)` - Form.Item의 normalize에 사용
- `truncate(str, maxLength)` - 문자열 자르기
- `formatPhoneNumber(phone)` - 한국 전화번호 형식 변환
- `formatBusinessNumber(businessNumber)` - 사업자 번호 형식 변환
- `formatResidentNumber(residentNumber)` - 주민번호 형식 변환
- `formatCorporateNumber(corporateNumber)` - 법인번호 형식 변환
- `camelToSnake(str)` - camelCase → snake_case 변환
- `snakeToCamel(str)` - snake_case → camelCase 변환
- `getDigitsOnly(str)` - 문자열에서 숫자만 추출
- `isValidEmail(email)` - 이메일 유효성 검사
- `isValidPassword(password)` - 비밀번호 유효성 검사

**사용 예시:**

```typescript
import {
  formatNumberWithCommas,
  formatPhoneNumber,
  isValidEmail,
  camelToSnake,
  snakeToCamel,
  getDigitsOnly,
} from "@utils/stringUtils";

// 숫자 포맷팅
const formatted = formatNumberWithCommas(1000000); // "1,000,000"

// 전화번호 포맷팅
const phone = formatPhoneNumber("01012345678"); // "010-1234-5678"

// 이메일 검증
if (isValidEmail(email)) {
  // 유효한 이메일
}

// 케이스 변환
const snake = camelToSnake("userName"); // "user_name"
const camel = snakeToCamel("user_name"); // "userName"
const digits = getDigitsOnly("010-1234-5678"); // "01012345678"
```

---

### dateUtils

날짜 포맷팅 및 변환 함수들.

**주요 함수:**

- `formatDateTime(dateStr)` - "YYYYMMDDHHmmss" → "YYYY.MM.DD HH:mm:ss"
- `formatDateTimeWithDayjs(dateStr)` - dayjs를 사용한 날짜 포맷팅
- `extractMonth(yymm)` - YYYYMM에서 월만 추출
- `formatYearMonth(yyyymm)` - "YYYYMM" → "YYYY.MM"

**사용 예시:**

```typescript
import { formatDateTime, formatYearMonth } from "@utils/dateUtils";

// 날짜 포맷팅
const formatted = formatDateTime("20240101120000");
// "2024.01.01 12:00:00"

// 년월 포맷팅
const yearMonth = formatYearMonth("202401");
// "2024.01"
```

---

### excelUtils

Excel 파일 파싱 및 처리 유틸리티.

**주요 함수:**

- `parseExcelFile<T>(file, options)` - Excel 파일을 배열로 변환
- `isValidExcelFile(file)` - Excel 파일 확장자 검증
- `parseExcelDate(dateValue)` - Excel 날짜를 YYYY-MM-DD 형식으로 변환
- `parseStringToArray(value, separator)` - 문자열을 배열로 변환
- `parseNumber(value, defaultValue)` - 숫자로 변환

**사용 예시:**

```typescript
import { parseExcelFile, parseExcelDate } from "@utils/excelUtils";

interface UserData {
  id: number;
  name: string;
  email: string;
  joinDate: string;
}

// Excel 파일 파싱
const handleFileUpload = async (file: File) => {
  try {
    const data = await parseExcelFile<UserData>(file, {
      hasHeader: true,
      columnMapping: {
        id: 0,
        name: 1,
        email: 2,
        joinDate: 3,
      },
      transformers: {
        id: (value) => Number(value) || 0,
        name: (value) => String(value || ""),
        email: (value) => String(value || ""),
        joinDate: parseExcelDate,
      },
      validator: (row) => !!(row.name && row.email),
    });

    setRowData(data);
  } catch (error) {
    console.error("Excel 파싱 실패:", error);
  }
};
```

---

### agGridUtils

AG-Grid 관련 헬퍼 함수들.

**주요 함수:**

- `createGridReadyHandler(setGridApi)` - GridApi 저장 핸들러 생성
- `createGridReadyHandlerRef(gridApiRef)` - ref 기반 핸들러 생성
- `addNewRow(currentData, createNewRow, setData, gridApi?, focusField?, insertAtTop?)` - 새 행 추가
- `deleteSelectedRows(gridApi, currentData, setData, getId?, onNoSelection?)` - 선택된 행 삭제
- `getSelectedRows(gridApi, onNoSelection?)` - 선택된 행 가져오기
- `deselectAll(gridApi)` - 모든 선택 해제
- `focusAndEditCell(gridApi, rowIndex, colKey)` - 셀 포커스 및 편집 시작

**사용 예시:**

```typescript
import {
  createGridReadyHandler,
  addNewRow,
  deleteSelectedRows
} from "@utils/agGridUtils";

const MyComponent = () => {
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [gridData, setGridData] = useState<RowData[]>([]);

  const onGridReady = createGridReadyHandler(setGridApi);

  // 행 추가
  const handleAddRow = () => {
    addNewRow(
      gridData,
      (newId) => ({ id: newId, name: "", amount: 0 }),
      setGridData,
      gridApi,
      "name",
      true // 첫 줄에 추가
    );
  };

  // 행 삭제
  const handleDeleteRows = () => {
    deleteSelectedRows(
      gridApi,
      gridData,
      setGridData,
      (row) => row.id,
      () => message.error("삭제할 행을 선택해주세요.")
    );
  };

  return (
    <FormAgGrid
      onGridReady={onGridReady}
      rowData={gridData}
      // ...
    />
  );
};
```

---

### tokenUtils

토큰 관리 (localStorage/cookie).

**주요 함수:**

- `setAccessToken(token)` - Access Token 저장
- `getAccessToken()` - Access Token 가져오기
- `removeAccessToken()` - Access Token 제거
- `setRefreshToken(token)` - Refresh Token 저장
- `getRefreshToken()` - Refresh Token 가져오기 (localStorage → cookie 순서)
- `removeRefreshToken()` - Refresh Token 제거
- `clearAllTokens()` - 모든 토큰 제거
- `hasToken()` - 토큰 존재 여부 확인

**사용 예시:**

```typescript
import {
  setAccessToken,
  getAccessToken,
  clearAllTokens,
} from "@utils/tokenUtils";

// 로그인 후 토큰 저장
setAccessToken(response.data.accessToken);

// 토큰 확인
if (hasToken()) {
  const token = getAccessToken();
  // API 호출 시 사용
}

// 로그아웃 시 토큰 제거
clearAllTokens();
```

---

### fileUtils

파일 처리 유틸리티.

**주요 함수:**

- `formatBytes(bytes, decimals?)` - 파일 크기를 읽기 쉬운 형식으로 변환
- `getFileExtension(filename)` - 파일 확장자 추출
- `getFileNameWithoutExtension(filename)` - 확장자 제외한 파일명
- `fileToBase64(file)` - File을 Base64로 변환
- `isAllowedExtension(file, allowedExtensions)` - 확장자 허용 여부 확인
- `isFileSizeExceeded(file, maxSizeInMB)` - 파일 크기 초과 여부 확인

**사용 예시:**

```typescript
import {
  formatBytes,
  fileToBase64,
  isAllowedExtension,
} from "@utils/fileUtils";

// 파일 크기 포맷팅
const size = formatBytes(1024000); // "1000 KB"

// 이미지 미리보기
const handleFileChange = async (file: File) => {
  if (!isAllowedExtension(file, ["jpg", "png", "gif"])) {
    message.error("이미지 파일만 업로드 가능합니다.");
    return;
  }

  const base64 = await fileToBase64(file);
  setPreviewImage(base64 as string);
};
```

---

### iconUtils

아이콘 동적 로드 유틸리티.

**주요 함수:**

- `getIconByName(iconName, context?)` - 아이콘 이름으로 컴포넌트 반환
- `getMenuIcon(menu, context?)` - 메뉴 아이콘 반환

**사용 예시:**

```typescript
import { getIconByName, getMenuIcon } from "@utils/iconUtils";

// Ant Design 아이콘
const icon = getIconByName("UserOutlined");

// 리믹스 아이콘
const remixIcon = getIconByName("ri-user-line");

// 메뉴 아이콘 (자동 매핑)
const menuIcon = getMenuIcon(menuItem);
```

---

### menuTabUtils

메뉴/탭 관련 유틸리티.

**주요 함수:**

- `convertPathToRoute(path)` - 파일 경로를 라우트 경로로 변환
- `createRouteConfigFromMenu(menu, params?)` - 메뉴에서 RouteConfig 생성
- `openMenuTab(menu, addTab, params?)` - 메뉴로 탭 열기
- `openMenuTabByPgmNo(pgmNo, menus, addTab, params?)` - 프로그램 번호로 탭 열기
- `useOpenTab()` - 탭 열기 커스텀 훅

**사용 예시:**

```typescript
import {
  useOpenTab,
  convertPathToRoute,
  createRouteConfigFromMenu,
} from "@utils/menuTabUtils";

// useOpenTab 훅 사용
const MyComponent = () => {
  const { openTab, openTabByPgmNo } = useOpenTab();

  // 메뉴로 탭 열기
  const handleOpenMenu = (menu: MenuItem) => {
    openTab(menu, { id: "123" });
  };

  // 프로그램 번호로 탭 열기
  const handleOpenByPgmNo = () => {
    openTabByPgmNo("PGM001", { id: "123" });
  };
};

// 경로 변환
const route = convertPathToRoute("/pages/fcm/slip/SlipList.tsx");
// "/app/fcm/slip"

// 메뉴에서 RouteConfig 생성
const routeConfig = createRouteConfigFromMenu(menuItem, { id: "123" });
```

**참고 (Deprecated):**

- 컬럼 생성 함수들(`createTextColumn`, `createNumberColumn` 등)과 Formatter 함수들(`formatDate`, `formatNumber` 등)은 `@components/ui/form/AgGrid/columns`로 이동되었습니다.
- 하위 호환성을 위해 `agGridUtils`에서 re-export되지만, 새 코드에서는 직접 import하는 것을 권장합니다.

**권장 방식:**

```typescript
// 권장
import {
  createTextColumn,
  formatNumber,
} from "@components/ui/form/AgGrid/columns";

// 하위 호환 (deprecated)
import { createTextColumn, formatNumber } from "@utils/agGridUtils";
```

---

### menuCache

메뉴 캐시 관리 (localStorage).

**주요 함수:**

- `setMenuCache(menus)` - 메뉴 캐시 저장
- `getMenuCache()` - 메뉴 캐시 가져오기
- `clearMenuCache()` - 메뉴 캐시 삭제
- `isMenuCacheValid()` - 캐시 유효성 확인

**사용 예시:**

```typescript
import { setMenuCache, getMenuCache } from "@utils/menuCache";

// 메뉴 캐시 저장
setMenuCache(menuData);

// 메뉴 캐시 조회
const cachedMenus = getMenuCache();
if (cachedMenus) {
  // 캐시된 메뉴 사용
}
```

---

### pageModules

페이지 컴포넌트 동적 로드 (Vite import.meta.glob).

**주요 export:**

- `pageModules` - 모든 페이지 컴포넌트 모듈 매핑 객체

**설명:**

- Vite의 `import.meta.glob`을 사용하여 `src/pages/**/*.{tsx,ts}` 경로의 모든 페이지를 동적으로 로드
- `menuTabUtils`에서 페이지 컴포넌트를 찾기 위해 사용됨
- 직접 사용하지 않고 `menuTabUtils`를 통해 간접적으로 사용

**참고:**

개발 모드에서 페이지 모듈이 비어있으면 콘솔에 경고 메시지가 출력됩니다.

---

### formModalUtils

폼 모달 플래그 관리 (중복 모달 방지).

**주요 함수:**

- `canShowModal()` - 모달 표시 가능 여부 확인 및 플래그 설정
- `resetModalFlag()` - 모달 플래그 해제 (500ms 후)

**사용 예시:**

```typescript
import { canShowModal, resetModalFlag } from "@utils/formModalUtils";

const handleValidation = () => {
  if (!canShowModal()) {
    return; // 이미 모달이 표시 중
  }

  Modal.error({
    title: "오류",
    content: "검증 실패",
    onOk: () => {
      resetModalFlag();
    },
  });
};
```

---

## Import 패턴

```typescript
// 개별 import (권장)
import { formatNumberWithCommas } from "@utils/stringUtils";
import { formatDateTime } from "@utils/dateUtils";
import { parseExcelFile } from "@utils/excelUtils";

// Path alias 사용
import { addNewRow } from "@utils/agGridUtils";
```

---

## Local Golden Rules

### Do's

- 유틸리티 함수는 순수 함수로 작성 (부수 효과 최소화).
- 타입 안정성을 위해 제네릭 활용 (`parseExcelFile<T>`).
- 에러 처리는 호출하는 쪽에서 처리 (유틸리티는 예외만 throw).
- 자주 사용되는 변환 로직은 유틸리티로 추출.

### Don'ts

- 유틸리티 함수 내부에서 직접 API 호출 금지.
- 전역 상태 직접 접근 금지 (파라미터로 전달).
- 브라우저 전용 API 사용 시 SSR 고려 (typeof window 체크).
- 중복 기능의 유틸리티 생성 금지 (기존 것 재사용).
