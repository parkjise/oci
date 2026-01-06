# UI Components - AI Agent Context

## Module Context

프로젝트 전역에서 사용되는 공통 UI 컴포넌트 모음. 모든 페이지에서 일관된 UX를 제공하기 위해 이 컴포넌트들을 재사용해야 한다.

---

## Component Categories

### Form Components (`./form/`)

| Component         | 용도                           | Import                                                  |
| ----------------- | ------------------------------ | ------------------------------------------------------- |
| FormInput         | 텍스트 입력                    | `import { FormInput } from "@form"`                     |
| FormInputNumber   | 숫자 입력                      | `import { FormInputNumber } from "@form"`               |
| FormSearchInput   | 검색 입력 (돋보기 아이콘)      | `import { FormSearchInput } from "@form"`               |
| FormTextArea      | 멀티라인 텍스트                | `import { FormTextArea } from "@form"`                  |
| FormSelect        | 드롭다운 선택                  | `import { FormSelect } from "@form"`                    |
| FormDatePicker    | 날짜 선택                      | `import { FormDatePicker } from "@form"`                |
| FormRadioGroup    | 라디오 버튼 그룹               | `import { FormRadioGroup } from "@form"`                |
| FormCheckbox      | 체크박스                       | `import { FormCheckbox } from "@form"`                  |
| FormButton        | 기본 버튼                      | `import { FormButton } from "@form"`                    |
| ActionButtonGroup | 액션 버튼 그룹 (저장, 조회 등) | `import { ActionButtonGroup } from "@form"`             |
| FormLabel         | 라벨                           | `import { FormLabel } from "@form"`                     |
| FormTree          | 트리 컴포넌트                  | `import { FormTree } from "@form"`                      |
| FormAgGrid        | AG-Grid 래퍼                   | `import { FormAgGrid } from "@form"`                    |
| SearchForm        | 검색 버튼 그룹                 | `import { SearchForm } from "@form"`                    |
| DataForm          | 데이터 폼 테이블               | `import { DataForm } from "@form"`                      |
| CardGridList      | 카드 그리드 리스트             | `import { CardGridList } from "@form"`                  |
| PhotoUpload       | 사진 업로드 컴포넌트           | `import { PhotoUpload, createPhotoField } from "@form"` |

### Layout Components (`./layout/`)

| Component               | 용도                        |
| ----------------------- | --------------------------- |
| SearchGridLayout        | 검색 조건 + 단일 그리드     |
| SearchTripleGridLayout  | 검색 + 3개 그리드           |
| SearchGridSaveLayout    | 검색 + 그리드 + 저장 영역   |
| SplitLayout             | 좌우 분할 레이아웃          |
| ListDetailLayout        | 리스트 + 상세 레이아웃      |
| VerticalLayout          | 세로 배치                   |
| VerticalSplitLayout     | 상하 분할                   |
| TwoGridLayout           | 2개 그리드 배치             |
| SearchTriPaneLayout     | 검색 + 3개 패널 레이아웃    |
| SearchTripleStackLayout | 검색 + 3개 스택 레이아웃    |
| GridSaveLayout          | 그리드 + 저장 영역 레이아웃 |

### Feedback Components (`./feedback/`)

토스트, 모달, 알림 등 사용자 피드백 컴포넌트.

| Component              | 용도            | Import                                                            |
| ---------------------- | --------------- | ----------------------------------------------------------------- |
| LoadingSpinner         | 로딩 스피너     | `import { LoadingSpinner } from "@components/ui/feedback"`        |
| Message / MessageModal | 메시지 모달     | `import { Message, MessageModal } from "@components/ui/feedback"` |
| AppPageModal           | 페이지 모달     | `import { AppPageModal } from "@components/ui/feedback"`          |
| DevTools               | 개발자 도구     | `import { DevTools } from "@components/ui/feedback"`              |
| AttachmentDrawer       | 첨부파일 드로어 | `import { AttachmentDrawer } from "@components/ui/feedback"`      |

---

## Usage Patterns

### FormAgGrid 사용

```typescript
import { FormAgGrid } from "@form";

<FormAgGrid
  rowData={data}
  columnDefs={columnDefs}
  onRowClicked={handleRowClick}
  onCellValueChanged={handleCellChange}
/>
```

### ActionButtonGroup 사용

```typescript
import { ActionButtonGroup } from "@form";

<ActionButtonGroup
  buttons={['search', 'save', 'add', 'delete', 'excel']}
  onButtonClick={(type) => {
    if (type === 'search') handleSearch();
    if (type === 'save') handleSave();
  }}
/>
```

### SearchForm 사용

```typescript
import { SearchForm } from "@form";

<SearchForm
  onSearch={handleSearch}
  onReset={handleReset}
/>
```

### PhotoUpload 사용

```typescript
import { PhotoUpload, createPhotoField } from "@form";

// 직접 사용
<PhotoUpload
  fileList={fileList}
  onFileChange={handleFileChange}
  mode="edit"
  maxSizeInMB={5}
/>

// Form.Item과 함께 사용
const photoField = createPhotoField({
  name: "photo",
  maxSizeInMB: 5,
  onFileChange: handleFileChange,
});

<Form.Item {...photoField}>
  <PhotoUpload {...photoField.props} />
</Form.Item>
```

### AttachmentDrawer 사용

```typescript
import { AttachmentDrawer } from "@components/ui/feedback";
import type { AttachmentFile, PendingFile } from "@components/ui/feedback";

// 기본 사용 (자동 업로드 모드)
const [drawerOpen, setDrawerOpen] = useState(false);
const [eatKey, setEatKey] = useState<number | undefined>();

<AttachmentDrawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  eatKey={eatKey}
  title="첨부파일"
  onUploadSuccess={() => {
    showSuccess("파일이 업로드되었습니다.");
    // 파일 목록 새로고침 등
  }}
  onDeleteSuccess={() => {
    showSuccess("파일이 삭제되었습니다.");
  }}
/>

// 수동 업로드 모드 (외부에서 파일 관리)
const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);

<AttachmentDrawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  eatKey={eatKey}
  autoUpload={false} // 수동 모드
  externalPendingFiles={pendingFiles}
  onPendingFilesChange={setPendingFiles}
  onFilesSelected={(files) => {
    // 파일 선택 시 처리
    setPendingFiles(files);
  }}
  onUpload={() => {
    // 외부에서 업로드 처리
    handleUploadFiles(pendingFiles);
  }}
/>

// Modal 모드
<AttachmentDrawer
  open={drawerOpen}
  onClose={() => setDrawerOpen(false)}
  variant="modal"
  eatKey={eatKey}
/>

// Inline 모드 (다른 컨테이너 안에서 사용)
<Modal>
  <AttachmentDrawer
    open={true}
    onClose={() => {}}
    variant="inline"
    eatKey={eatKey}
  />
</Modal>
```

**주요 Props:**

- `open` - Drawer/Modal 열림 상태
- `onClose` - 닫기 핸들러
- `variant` - 표시 방식: `'drawer'` | `'modal'` | `'inline'` (기본값: `'drawer'`)
- `eatKey` - 파일 그룹 키 (eatKey가 있으면 자동으로 파일 목록 조회)
- `files` - 파일 목록 (eatKey가 없을 때 직접 전달)
- `autoUpload` - 자동 업로드 여부 (기본값: `false` - 수동 모드)
- `externalPendingFiles` - 외부에서 관리하는 대기 파일 목록 (수동 모드)
- `onPendingFilesChange` - 대기 파일 목록 변경 콜백
- `onUpload` - 파일 업로드 핸들러 (제공 시 외부에서 처리)
- `onUploadSuccess` - 파일 업로드 후 콜백
- `onDeleteSuccess` - 파일 삭제 후 콜백
- `deletable` - 파일 삭제 가능 여부 (기본값: `true`)
- `downloadable` - 파일 다운로드 가능 여부 (기본값: `true`)
- `uploadable` - 파일 업로드 가능 여부 (기본값: `true`)

**타입:**

- `AttachmentFile` - 서버에 저장된 파일 정보
- `PendingFile` - 업로드 대기 중인 파일 정보

---

### AgGrid Columns 사용

```typescript
import {
  createTextColumn,
  createNumberColumn,
  createDateColumn,
  formatNumber,
  formatCurrency,
  createStatusRenderer,
} from "@components/ui/form/AgGrid/columns";

// 컬럼 정의
const columnDefs = [
  createTextColumn({
    field: "name",
    headerName: "이름",
    width: 150,
  }),
  createNumberColumn({
    field: "price",
    headerName: "가격",
    width: 120,
    valueFormatter: formatCurrency, // 또는 formatCurrencyWon
  }),
  createDateColumn({
    field: "createdAt",
    headerName: "생성일",
    width: 120,
  }),
  {
    field: "status",
    headerName: "상태",
    cellRenderer: createStatusRenderer({
      active: { text: "활성", color: "green" },
      inactive: { text: "비활성", color: "red" },
    }),
  },
];
```

**주요 컬럼 생성 함수:**

- `createTextColumn` - 텍스트 컬럼
- `createNumberColumn` - 숫자 컬럼
- `createDateColumn` - 날짜 컬럼
- `createTextAreaColumn` - 텍스트 영역 컬럼
- `createCheckboxColumn` - 체크박스 컬럼 (읽기 전용)
- `createCheckboxColumnEditable` - 편집 가능한 체크박스 컬럼
- `createComboBoxColumn` - 콤보박스 컬럼
- `createSearchColumn` - 검색 아이콘이 있는 컬럼

**Formatter 함수:**

- `formatNumber` - 숫자 포맷팅
- `formatCurrency` - 통화 포맷팅 (기본: $)
- `formatCurrencyWon` - 원화 포맷팅
- `formatDateKorean` - 한국어 날짜 포맷팅
- `createValueFormatter` - 커스텀 포맷터 생성
- `createComCodeFormatter` - 공통코드 포맷터 생성

**Renderer 함수:**

- `createTagRenderer` - 태그 렌더러
- `createLinkRenderer` - 링크 렌더러
- `createTagArrayRenderer` - 태그 배열 렌더러
- `createStatusRenderer` - 상태 렌더러

---

## Local Golden Rules

### Do's

- 새 컴포넌트 추가 시 `index.ts`에 export 추가.
- Props 타입은 명시적으로 정의 (`type Props = {...}`).
- styled-components로 스타일 분리 (`.styles.ts`).
- 기존 theme 토큰 활용 (`theme.colors.*`).

### Don'ts

- 같은 기능의 중복 컴포넌트 생성 금지.
- Props drilling 대신 Context 또는 Zustand 사용.
- 인라인 스타일 사용 금지.
- 외부 라이브러리 직접 사용 대신 래퍼 컴포넌트 생성.
