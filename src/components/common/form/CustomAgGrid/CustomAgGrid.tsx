import "ag-grid-enterprise";
import { AgGridReact, type AgGridReactProps } from "ag-grid-react";
import { LicenseManager } from "ag-grid-enterprise";
import {
  type ColDef,
  type GridOptions,
  ModuleRegistry,
  AllCommunityModule,
} from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";

// AG Grid 모듈 등록
ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

LicenseManager.setLicenseKey(import.meta.env.VITE_AGGRID_LICENSEMANAGER);

// AG-Grid 기본 스타일 임포트
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

import clsx from "clsx"; // For conditionally joining class names
import {
  StyledAgGridContainer,
  type AgGridStyleOptions,
} from "./CustomAgGrid.styles";

// 공통 AG-Grid 컴포넌트의 Props 정의
interface CommonAgGridProps<TData> extends AgGridReactProps {
  rowData: TData[];
  columnDefs: ColDef<TData>[];
  height?: number | string;
  width?: number | string;
  // 추가적인 GridOptions를 받을 수 있도록 확장
  gridOptions?: GridOptions;
  className?: string; // Add className prop
  styleOptions?: AgGridStyleOptions; // 스타일 커스터마이징 옵션
}

const CommonAgGrid = <TData,>(props: CommonAgGridProps<TData>) => {
  const {
    rowData,
    columnDefs,
    height = 400,
    width = "100%",
    gridOptions,
    className, // Destructure className
    styleOptions, // 스타일 옵션
    ...rest
  } = props;
  // 기본 GridOptions 설정
  const defaultGridOptions: GridOptions = {
    // 기본 열 설정 (모든 열에 적용)
    defaultColDef: {
      sortable: true, // 정렬 가능
      resizable: true, // 너비 조절 가능
      filter: true, // 필터링 가능
      flex: 1, // 모든 열이 남은 공간을 균등하게 차지하도록 설정
      minWidth: 100, // 최소 너비
    },
    // 행 선택 설정
    rowSelection: "single", // 'single' 또는 'multiple'
    // 페이지네이션
    pagination: true,
    paginationPageSize: 20,
    paginationPageSizeSelector: [10, 20, 50, 100],
    // 기타 옵션
    animateRows: true, // 행 애니메이션
  };

  return (
    <StyledAgGridContainer
      className={clsx("ag-theme-quartz", className)}
      style={{
        height: typeof height === "number" ? `${height}px` : height,
        width,
      }}
      $styleOptions={styleOptions}
    >
      <AgGridReact<TData>
        theme="legacy"
        rowData={rowData}
        columnDefs={columnDefs}
        {...defaultGridOptions}
        {...gridOptions} // 사용자가 전달한 gridOptions로 기본값 덮어쓰기
        {...rest} // 나머지 AgGridReactProps 전달
      />
    </StyledAgGridContainer>
  );
};

export default CommonAgGrid;
