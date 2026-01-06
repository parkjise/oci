import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { 
  getWorkplaceListApi, 
  saveWorkplaceListApi, 
  type WorkplaceDto,
  type WorkplaceSearchRequest
} from "@apis/system/org/workplaceApi";
import { 
  createEatKeyApi, 
  uploadFileApi, 
  deleteFileApi 
} from "@apis/system/file/fileApi";
import { message } from "antd";
import i18n from "@/i18n";
import dayjs from "dayjs";

interface WorkplaceMngState {
  // Data
  workplaceList: WorkplaceDto[];
  originalWorkplaceData: Record<string, any>;
  selectedWorkplace: WorkplaceDto | null;
  selectedRows: WorkplaceDto[];
  
  // Search
  searchParams: WorkplaceSearchRequest;

  // State
  loading: boolean;
  isModified: boolean;
  
  // Pending Files
  pendingFileInfo: { file: File; eatKey: number | null; officeId: string; orgId: string } | null;
  pendingDeleteInfo: { eatKey: number; eatIdx: string; officeId: string; orgId: string } | null;

  // Actions
  fetchWorkplaceList: (params?: WorkplaceSearchRequest) => Promise<void>;
  search: () => Promise<void>;
  setSearchParams: (params: WorkplaceSearchRequest) => void;
  setSelectedWorkplace: (workplace: WorkplaceDto | null) => void;
  setSelectedRows: (rows: WorkplaceDto[]) => void;
  setPendingFileInfo: (info: { file: File; eatKey: number | null; officeId: string; orgId: string } | null) => void;
  setPendingDeleteInfo: (info: { eatKey: number; eatIdx: string; officeId: string; orgId: string } | null) => void;
  
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

const generateId = (item: WorkplaceDto) => {
  return `${item.officeId}_${item.orgId}`;
};

export const useWorkplaceMngStore = create<WorkplaceMngState>()(
  devtools(
    (set, get) => ({
      workplaceList: [],
      originalWorkplaceData: {},
      selectedWorkplace: null,
      selectedRows: [],
      searchParams: {},
      loading: false,
      isModified: false,
      pendingFileInfo: null,
      pendingDeleteInfo: null,

      fetchWorkplaceList: async (params) => {
        try {
          set({ loading: true });
          const response = await getWorkplaceListApi(params);
          if (response.success) {
            const data = Array.isArray(response.data) ? response.data : [];
            const originalDataMap: Record<string, any> = {};
            
            const dataWithId = data.map((item) => {
              const { rowStatus: _, ...rest } = item as any;
              const uniqueId = generateId(item);
              
              // 원본 데이터 보관 (변경 감지용)
              originalDataMap[uniqueId] = { ...rest };
              
              return {
                ...rest,
                id: uniqueId,
                rowStatus: undefined,
              };
            });

            set({ 
              workplaceList: dataWithId, 
              originalWorkplaceData: originalDataMap,
              isModified: false,
              pendingFileInfo: null,
              pendingDeleteInfo: null,
            });

            // 선택된 사업장 정보 동기화
            const { selectedWorkplace } = get();
            if (selectedWorkplace) {
              const currentId = (selectedWorkplace as any).id || generateId(selectedWorkplace);
              const updatedSelected = dataWithId.find(item => ((item as any).id || generateId(item)) === currentId);
              if (updatedSelected) {
                set({ 
                  selectedWorkplace: updatedSelected,
                  selectedRows: [updatedSelected]
                });
              } else {
                set({ selectedWorkplace: null, selectedRows: [] });
              }
            }
          }
        } finally {
          set({ loading: false });
        }
      },

      search: async () => {
        const { searchParams } = get();
        await get().fetchWorkplaceList(searchParams);
      },

      setSearchParams: (params) => set({ searchParams: params }),
      setSelectedWorkplace: (workplace) => set({ selectedWorkplace: workplace }),
      setSelectedRows: (rows) => set({ selectedRows: rows }),
      setPendingFileInfo: (info) => set({ pendingFileInfo: info }),
      setPendingDeleteInfo: (info) => set({ pendingDeleteInfo: info }),

      insert: () => {
        const { workplaceList } = get();
        const newId = `new_${Date.now()}`;
        const newRow: WorkplaceDto & { id?: string } = {
          officeId: "", // 실제로는 로그인한 사용자의 회사코드가 들어가야 할 수도 있음, 화면단에서 처리
          orgId: "",
          orgNme: "",
          enabledFlag: "Y",
          invOrg: "N",
          rowStatus: "C",
          id: newId,
        };
        set({
          workplaceList: [newRow, ...workplaceList],
          isModified: true,
          selectedWorkplace: newRow,
          selectedRows: [newRow],
          pendingFileInfo: null,
          pendingDeleteInfo: null,
        });
      },

      copy: () => {
        const { workplaceList, selectedRows } = get();
        if (selectedRows.length === 0) {
          message.warning(i18n.t("MSG_SY_0076"));
          return;
        }

        const sourceRow = selectedRows[0];
        const newId = `new_${Date.now()}`;
        const newRow: WorkplaceDto & { id?: string } = {
          ...sourceRow,
          orgId: "", // PK는 비워둠
          rowStatus: "C",
          id: newId,
        };

        set({
          workplaceList: [newRow, ...workplaceList],
          isModified: true,
          selectedWorkplace: newRow,
          selectedRows: [newRow],
          pendingFileInfo: null,
          pendingDeleteInfo: null,
        });
      },

      remove: () => {
        const { workplaceList, selectedRows } = get();
        if (selectedRows.length === 0) {
          message.warning(i18n.t("MSG_SY_0077"));
          return;
        }

        const deletedItems: WorkplaceDto[] = [];
        const updatedList = workplaceList.map(row => {
          const isSelected = selectedRows.some(s => (s as any).id === (row as any).id);
          if (isSelected) {
            if (row.rowStatus === "C") return null;
            const deletedRow = { ...row, rowStatus: "D" };
            deletedItems.push(deletedRow);
            return deletedRow;
          }
          return row;
        }).filter(Boolean) as WorkplaceDto[];

        const newSelected = deletedItems.length > 0 ? deletedItems[0] : (updatedList.length > 0 ? updatedList[0] : null);
        
        set({
          workplaceList: updatedList,
          isModified: true,
          selectedWorkplace: newSelected,
          selectedRows: newSelected ? [newSelected] : [],
        });
      },

      save: async () => {
        const { workplaceList, isModified, pendingFileInfo, pendingDeleteInfo } = get();
        if (!isModified) {
          message.info(i18n.t("MSG_SY_0081"));
          return;
        }

        const saveItems = workplaceList.filter(row => row.rowStatus === "C" || row.rowStatus === "U" || row.rowStatus === "D");
        if (saveItems.length === 0 && !pendingFileInfo && !pendingDeleteInfo) {
          message.info(i18n.t("MSG_SY_0081"));
          return;
        }

        try {
          set({ loading: true });

          const processedItems = await Promise.all(saveItems.map(async (item) => {
            let finalOrgImgId = item.orgImgId;

            // 파일 삭제 처리
            if (pendingDeleteInfo && pendingDeleteInfo.officeId === item.officeId && pendingDeleteInfo.orgId === item.orgId) {
              await deleteFileApi(pendingDeleteInfo.eatKey, pendingDeleteInfo.eatIdx);
              if (!pendingFileInfo || pendingFileInfo.officeId !== item.officeId || pendingFileInfo.orgId !== item.orgId) {
                finalOrgImgId = undefined;
              }
            }

            // 파일 업로드 처리
            if (pendingFileInfo && pendingFileInfo.officeId === item.officeId && pendingFileInfo.orgId === item.orgId) {
              let eatKey = pendingFileInfo.eatKey;
              if (!eatKey) {
                const keyRes = await createEatKeyApi("00053"); // Workplace EAT_KEY type
                if (keyRes.success) eatKey = keyRes.data;
              }
              if (eatKey) {
                const upRes = await uploadFileApi(pendingFileInfo.file, { eatKey });
                if (upRes.success) finalOrgImgId = eatKey.toString();
              }
            }

            return {
              ...item,
              orgImgId: finalOrgImgId,
            };
          }));

          const response = await saveWorkplaceListApi({ workplaceList: processedItems });

          if (response.success) {
            message.success(i18n.t("MSG_SY_0085"));
            
            // Re-fetch to normalize state
            await get().fetchWorkplaceList(get().searchParams);
          }
        } finally {
          set({ loading: false });
        }
      },

      syncGridFromDetailPanel: (values) => {
        const { workplaceList, selectedWorkplace, originalWorkplaceData, pendingFileInfo, pendingDeleteInfo } = get();
        if (!selectedWorkplace) return;

        const currentId = (selectedWorkplace as any).id;
        const rowIndex = workplaceList.findIndex(row => (row as any).id === currentId);
        if (rowIndex === -1) return;

        const currentRow = workplaceList[rowIndex];
        const uniqueKey = generateId(selectedWorkplace);
        const originalRow = originalWorkplaceData[uniqueKey];
        
        // 변경 사항 체크
        let hasChanges = !originalRow;
        if (originalRow) {
          hasChanges = Object.keys(values).some(key => {
            if (["rowStatus", "id", "orgImgId"].includes(key)) return false;
            return normalizeValue(values[key]) !== normalizeValue(originalRow[key]);
          });
        }

        const hasPendingFiles = (pendingFileInfo?.officeId === selectedWorkplace.officeId && pendingFileInfo?.orgId === selectedWorkplace.orgId) || 
                                (pendingDeleteInfo?.officeId === selectedWorkplace.officeId && pendingDeleteInfo?.orgId === selectedWorkplace.orgId);

        const updatedRow = {
          ...currentRow,
          ...values,
          rowStatus: currentRow.rowStatus === "D" ? "D" : (currentRow.rowStatus === "C" ? "C" : (hasChanges || hasPendingFiles ? "U" : undefined))
        };

        const newList = [...workplaceList];
        newList[rowIndex] = updatedRow;

        set({
          workplaceList: newList,
          selectedWorkplace: updatedRow,
          isModified: newList.some(r => !!r.rowStatus) || !!pendingFileInfo || !!pendingDeleteInfo
        });
      },

      reset: () => {
        set({
          workplaceList: [],
          selectedWorkplace: null,
          selectedRows: [],
          searchParams: {},
          isModified: false,
          pendingFileInfo: null,
          pendingDeleteInfo: null,
        });
      }
    }),
    { name: "WorkplaceMngStore" }
  )
);
