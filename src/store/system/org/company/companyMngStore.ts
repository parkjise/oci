import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { 
  getCompanyListApi, 
  saveCompanyListApi, 
  type CompanyDto,
  type CompanySearchRequest
} from "@apis/system/org/companyApi";
import { 
  createEatKeyApi, 
  uploadFileApi, 
  deleteFileApi 
} from "@apis/system/file/fileApi";
import { message } from "antd";
import i18n from "@/i18n";
import dayjs from "dayjs";

interface CompanyMngState {
  // Data
  companyList: CompanyDto[];
  originalCompanyData: Record<string, any>;
  selectedCompany: CompanyDto | null;
  selectedRows: CompanyDto[];
  
  // State
  loading: boolean;
  isModified: boolean;
  
  // Pending Files
  pendingFileInfo: { file: File; eatKey: number | null; officeId: string } | null;
  pendingDeleteInfo: { eatKey: number; eatIdx: string; officeId: string } | null;

  // Actions
  fetchCompanyList: (params?: CompanySearchRequest) => Promise<void>;
  setSelectedCompany: (user: CompanyDto | null) => void;
  setSelectedRows: (rows: CompanyDto[]) => void;
  setPendingFileInfo: (info: { file: File; eatKey: number | null; officeId: string } | null) => void;
  setPendingDeleteInfo: (info: { eatKey: number; eatIdx: string; officeId: string } | null) => void;
  
  // Grid Actions
  insert: () => void;
  copy: () => void;
  remove: () => void;
  save: () => Promise<void>;
  syncGridFromDetailPanel: (values: any) => void;
  reset: () => void;
}

const normalizeValue = (val: any) => {
  if (val === null || val === undefined) return "";
  if (dayjs.isDayjs(val)) return val.format("YYYY-MM-DD");
  return String(val).trim();
};

export const useCompanyMngStore = create<CompanyMngState>()(
  devtools(
    (set, get) => ({
      companyList: [],
      originalCompanyData: {},
      selectedCompany: null,
      selectedRows: [],
      loading: false,
      isModified: false,
      pendingFileInfo: null,
      pendingDeleteInfo: null,

      fetchCompanyList: async (params) => {
        try {
          set({ loading: true });
          const response = await getCompanyListApi(params);
          if (response.success) {
            const data = Array.isArray(response.data) ? response.data : [];
            const originalDataMap: Record<string, any> = {};
            
            const dataWithId = data.map((item) => {
              const { rowStatus: _, ...rest } = item as any;
              const officeId = item.officeId || "";
              
              // 원본 데이터 보관 (변경 감지용)
              originalDataMap[officeId] = { ...rest };
              
              return {
                ...rest,
                id: officeId,
                rowStatus: undefined,
              };
            });

            set({ 
              companyList: dataWithId, 
              originalCompanyData: originalDataMap,
              isModified: false,
              pendingFileInfo: null,
              pendingDeleteInfo: null,
            });

            // 선택된 법인 정보 동기화
            const { selectedCompany } = get();
            if (selectedCompany) {
              const currentId = selectedCompany.officeId;
              const updatedSelected = dataWithId.find(item => item.officeId === currentId);
              if (updatedSelected) {
                set({ 
                  selectedCompany: updatedSelected,
                  selectedRows: [updatedSelected]
                });
              } else {
                set({ selectedCompany: null, selectedRows: [] });
              }
            }
          }
        } finally {
          set({ loading: false });
        }
      },

      setSelectedCompany: (company) => set({ selectedCompany: company }),
      setSelectedRows: (rows) => set({ selectedRows: rows }),
      setPendingFileInfo: (info) => set({ pendingFileInfo: info }),
      setPendingDeleteInfo: (info) => set({ pendingDeleteInfo: info }),

      insert: () => {
        const { companyList } = get();
        const newId = `new_${Date.now()}`;
        const newRow: CompanyDto & { id?: string } = {
          officeId: "",
          officeNme: "",
          rowStatus: "C",
          id: newId,
        };
        set({
          companyList: [newRow, ...companyList],
          isModified: true,
          selectedCompany: newRow,
          selectedRows: [newRow],
          pendingFileInfo: null,
          pendingDeleteInfo: null,
        });
      },

      copy: () => {
        const { companyList, selectedRows } = get();
        if (selectedRows.length === 0) {
          message.warning(i18n.t("MSG_SY_0076"));
          return;
        }

        const sourceRow = selectedRows[0];
        const newId = `new_${Date.now()}`;
        const newRow: CompanyDto & { id?: string } = {
          ...sourceRow,
          officeId: "",
          rowStatus: "C",
          id: newId,
        };

        set({
          companyList: [newRow, ...companyList],
          isModified: true,
          selectedCompany: newRow,
          selectedRows: [newRow],
          pendingFileInfo: null,
          pendingDeleteInfo: null,
        });
      },

      remove: () => {
        const { companyList, selectedRows } = get();
        if (selectedRows.length === 0) {
          message.warning(i18n.t("MSG_SY_0077"));
          return;
        }

        const deletedItems: CompanyDto[] = [];
        const updatedList = companyList.map(row => {
          const isSelected = selectedRows.some(s => s.officeId === row.officeId || (s as any).id === (row as any).id);
          if (isSelected) {
            if (row.rowStatus === "C") return null;
            const deletedRow = { ...row, rowStatus: "D" };
            deletedItems.push(deletedRow);
            return deletedRow;
          }
          return row;
        }).filter(Boolean) as CompanyDto[];

        const newSelected = deletedItems.length > 0 ? deletedItems[0] : (updatedList.length > 0 ? updatedList[0] : null);
        
        set({
          companyList: updatedList,
          isModified: true,
          selectedCompany: newSelected,
          selectedRows: newSelected ? [newSelected] : [],
        });
      },

      save: async () => {
        const { companyList, isModified, pendingFileInfo, pendingDeleteInfo } = get();
        if (!isModified) {
          message.info(i18n.t("MSG_SY_0081"));
          return;
        }

        const saveItems = companyList.filter(row => row.rowStatus === "C" || row.rowStatus === "U" || row.rowStatus === "D");
        if (saveItems.length === 0 && !pendingFileInfo && !pendingDeleteInfo) {
          message.info(i18n.t("MSG_SY_0081"));
          return;
        }

        try {
          set({ loading: true });

          // 법인 저장 (파일 처리는 우선 단순화하여 DTO에 포함시키거나 별도 처리)
          // 실제 로직은 UserMng와 유사하게 루프를 돌며 파일 처리 후 배치 저장
          const processedItems = await Promise.all(saveItems.map(async (item) => {
            let finalOfficeImgId = item.officeImgId;

            // 파일 삭제 처리
            if (pendingDeleteInfo && pendingDeleteInfo.officeId === item.officeId) {
              await deleteFileApi(pendingDeleteInfo.eatKey, pendingDeleteInfo.eatIdx);
              if (!pendingFileInfo || pendingFileInfo.officeId !== item.officeId) {
                finalOfficeImgId = undefined;
              }
            }

            // 파일 업로드 처리
            if (pendingFileInfo && pendingFileInfo.officeId === item.officeId) {
              let eatKey = pendingFileInfo.eatKey;
              if (!eatKey) {
                const keyRes = await createEatKeyApi("00052");
                if (keyRes.success) eatKey = keyRes.data;
              }
              if (eatKey) {
                const upRes = await uploadFileApi(pendingFileInfo.file, { eatKey });
                if (upRes.success) finalOfficeImgId = eatKey.toString();
              }
            }

            return {
              ...item,
              establishDate: item.establishDate ? dayjs(item.establishDate).format("YYYY-MM-DD") : undefined,
              officeImgId: finalOfficeImgId,
            };
          }));

          const response = await saveCompanyListApi({ companyList: processedItems });

          if (response.success) {
            message.success(i18n.t("MSG_SY_0085"));
            
            // 로컬 상태 즉시 갱신 (저장 성공한 항목들 상태 지우기)
            const currentList = get().companyList;
            const updatedList = currentList.map(row => {
              const savedItem = processedItems.find(p => p.officeId === row.officeId || (p as any).id === (row as any).id);
              if (savedItem) {
                return { ...savedItem, rowStatus: undefined };
              }
              return row;
            });

            const currentSelected = get().selectedCompany;
            const updatedSelected = currentSelected ? { ...currentSelected, rowStatus: undefined } : null;

            set({
              companyList: updatedList,
              selectedCompany: updatedSelected,
              selectedRows: updatedSelected ? [updatedSelected] : [],
              isModified: false,
              pendingFileInfo: null,
              pendingDeleteInfo: null,
            });

            // 배경에서 목록 재조회
            setTimeout(() => get().fetchCompanyList(), 500);
          }
        } finally {
          set({ loading: false });
        }
      },

      syncGridFromDetailPanel: (values) => {
        const { companyList, selectedCompany, originalCompanyData, pendingFileInfo, pendingDeleteInfo } = get();
        if (!selectedCompany) return;

        const officeId = selectedCompany.officeId || (selectedCompany as any).id;
        const rowIndex = companyList.findIndex(row => (row.officeId || (row as any).id) === officeId);
        if (rowIndex === -1) return;

        const currentRow = companyList[rowIndex];
        const originalRow = originalCompanyData[selectedCompany.officeId || ""];
        
        // 변경 사항 체크
        let hasChanges = !originalRow;
        if (originalRow) {
          hasChanges = Object.keys(values).some(key => {
            if (["rowStatus", "id", "officeImgId"].includes(key)) return false;
            return normalizeValue(values[key]) !== normalizeValue(originalRow[key]);
          });
        }

        const hasPendingFiles = (pendingFileInfo?.officeId === selectedCompany.officeId) || 
                                (pendingDeleteInfo?.officeId === selectedCompany.officeId);

        const updatedRow = {
          ...currentRow,
          ...values,
          rowStatus: currentRow.rowStatus === "D" ? "D" : (currentRow.rowStatus === "C" ? "C" : (hasChanges || hasPendingFiles ? "U" : undefined))
        };

        const newList = [...companyList];
        newList[rowIndex] = updatedRow;

        set({
          companyList: newList,
          selectedCompany: updatedRow,
          isModified: newList.some(r => !!r.rowStatus) || !!pendingFileInfo || !!pendingDeleteInfo
        });
      },

      reset: () => {
        set({
          companyList: [],
          selectedCompany: null,
          selectedRows: [],
          isModified: false,
          pendingFileInfo: null,
          pendingDeleteInfo: null,
        });
      }
    }),
    { name: "CompanyMngStore" }
  )
);
