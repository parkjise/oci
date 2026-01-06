import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { message } from "antd";
import dayjs from "dayjs";
import {
  getAllUsersApi,
  createUserApi,
  updateUserApi,
  deleteUserApi,
  type UserDto,
  type UserSearchRequest,
  type UserSaveItem,
} from "@apis/system/user/userApi";
import { getCodeDetailApi } from "@apis/com/code";
import { getAllOrgListApi } from "@apis/system/common/listApi";
import {
  uploadFileApi,
  createEatKeyApi,
  deleteFileApi,
} from "@apis/system/file/fileApi";
import { useAuthStore } from "@store/com/auth/authStore";
import i18n from "@/i18n";

interface UserMngState {
  // State
  userList: UserDto[];
  selectedUser: UserDto | null;
  originalUserData: Record<string, UserDto>; // 원본 사용자 데이터 (empCode를 키로 사용)
  orgList: Array<{ value: string; label: string }>;
  positionList: Array<{ value: string; label: string }>;
  loading: boolean;
  isModified: boolean;
  searchParams: UserSearchRequest;
  selectedRows: UserDto[]; // 다중 선택 데이터 추가
  pendingFileInfo: {
    file: File;
    eatKey: number | null;
    empCode: string;
  } | null;
  pendingDeleteInfo: { eatKey: number; eatIdx: string; empCode: string } | null;

  // Actions
  setSearchParams: (params: Partial<UserSearchRequest>) => void;
  setSelectedUser: (user: UserDto | null) => void;
  setSelectedRows: (rows: UserDto[]) => void; // 다중 선택 설정 액션 추가
  setPendingFileInfo: (
    info: { file: File; eatKey: number | null; empCode: string } | null
  ) => void;
  setPendingDeleteInfo: (
    info: { eatKey: number; eatIdx: string; empCode: string } | null
  ) => void;

  fetchUserList: (showLoading?: boolean) => Promise<void>;
  fetchOrgList: (officeId: string) => Promise<void>;
  fetchPositionList: () => Promise<void>;

  search: (params?: UserSearchRequest) => Promise<void>;
  reset: () => void;

  insert: () => void;
  remove: () => void; // 매개변수 없이 내부 상태 사용하도록 변경
  save: () => Promise<void>;

  handleCellValueChanged: (data: UserDto) => void;
  syncGridFromDetailPanel: (formValues?: Record<string, any>) => void; // 상세 패널 값 변경 시 그리드 동기화 (blur 시점에 호출)
}

export const useUserMngStore = create<UserMngState>()(
  devtools(
    (set, get) => ({
      // Initial State
      userList: [],
      selectedUser: null,
      originalUserData: {},
      orgList: [],
      positionList: [],
      loading: false,
      isModified: false,
      searchParams: {
        asType: "2", // 성명
        asName: undefined,
        asUseYn: "%", // 전체
      },
      selectedRows: [],
      pendingFileInfo: null,
      pendingDeleteInfo: null,

      // Simple Setters
      setSearchParams: (params) =>
        set((state) => ({
          searchParams: { ...state.searchParams, ...params },
        })),

      setSelectedUser: (user) => {
        const state = get();
        if (state.selectedUser?.empCode !== user?.empCode) {
          set({
            selectedUser: user,
            pendingFileInfo: null,
            pendingDeleteInfo: null,
          });

          if (user?.empCode) {
            const { originalUserData, userList } = get();
            if (!originalUserData[user.empCode]) {
              const foundUser = userList.find(
                (u) => u.empCode === user.empCode
              );
              if (foundUser) {
                const excludeFields = ["rowStatus", "id"];
                const cleanOriginal: any = {};
                Object.keys(foundUser).forEach((key) => {
                  if (!excludeFields.includes(key)) {
                    cleanOriginal[key] = (foundUser as any)[key];
                  }
                });
                set({
                  originalUserData: {
                    ...originalUserData,
                    [user.empCode]: cleanOriginal,
                  },
                });
              }
            }
          }
        } else {
          set({ selectedUser: user });
        }
      },

      setSelectedRows: (rows) => set({ selectedRows: rows }),
      setPendingFileInfo: (info) =>
        set({ pendingFileInfo: info, isModified: info !== null }),
      setPendingDeleteInfo: (info) =>
        set({ pendingDeleteInfo: info, isModified: info !== null }),

      // Data Fetching
      fetchUserList: async (showLoading = true) => {
        const { searchParams, loading } = get();
        if (loading) return;

        try {
          if (showLoading) {
            set({ loading: true });
          }

          let empName: string | undefined;
          let department: string | undefined;
          let empCode: string | undefined;

          if (searchParams.asType === "2") empName = searchParams.asName;
          else if (searchParams.asType === "1")
            department = searchParams.asName;
          else if (searchParams.asType === "3") empCode = searchParams.asName;

          const useYn =
            searchParams.asUseYn === "%" ? "%" : searchParams.asUseYn;

          const response = await getAllUsersApi({
            empName,
            department,
            empCode,
            useYn,
          });

          if (response.success) {
            const data = Array.isArray(response.data) ? response.data : [];
            const dataWithId = data.map((item) => {
              const { rowStatus: _, ...rest } = item as any;
              return {
                ...rest,
                id: item.empCode,
                rowStatus: undefined,
              };
            });

            set({ userList: dataWithId, originalUserData: {} });

            // 선택된 사용자 정보 동기화
            const { selectedUser } = get();
            if (selectedUser) {
              const currentEmpCode =
                selectedUser.empCode ||
                (selectedUser as any).id ||
                (selectedUser as any).empCode ||
                "new";
              const updatedSelectedUser = dataWithId.find(
                (item) => item.empCode === currentEmpCode
              );
              if (updatedSelectedUser) {
                const cleanUser: any = {};
                Object.keys(updatedSelectedUser).forEach((key) => {
                  if (key !== "rowStatus") {
                    cleanUser[key] = (updatedSelectedUser as any)[key];
                  }
                });
                set({ selectedUser: cleanUser });
              } else {
                set({ selectedUser: null });
              }
            }
          }
        } catch (error) {
          console.error("사용자 목록 조회 실패:", error);
          message.error(i18n.t("MSG_SY_0064"));
        } finally {
          if (showLoading) {
            set({ loading: false });
          }
        }
      },

      fetchOrgList: async (officeId) => {
        try {
          const response = await getAllOrgListApi({ officeId });
          if (response.success && response.data) {
            const options = response.data.map((item) => ({
              value: item.code || "",
              label: item.name || item.code || "",
            }));
            set({ orgList: options });
          }
        } catch (error) {
          console.error("조직 목록 조회 실패:", error);
        }
      },

      fetchPositionList: async () => {
        try {
          const response = await getCodeDetailApi({
            module: "HR",
            type: "PSTNME",
            enabledFlag: "Y",
          });
          if (response.success && response.data) {
            const codeList = Array.isArray(response.data)
              ? response.data
              : [response.data];
            const options = codeList.map((item) => ({
              value: item.code || "",
              label: item.name1 || "",
            }));
            set({ positionList: options });
          }
        } catch (error) {
          console.error("직위 목록 조회 실패:", error);
        }
      },

      search: async (params) => {
        if (params) {
          set({ searchParams: params });
        }
        await get().fetchUserList();
      },

      reset: () => {
        set({
          userList: [],
          selectedUser: null,
          originalUserData: {},
          selectedRows: [],
          isModified: false,
          searchParams: {
            asType: "2",
            asName: undefined,
            asUseYn: "%",
          },
          pendingFileInfo: null,
          pendingDeleteInfo: null,
        });
      },

      // Grid Operations
      insert: () => {
        const { userList } = get();

        // 이미 새 행(rowStatus === "C")이 있는지 확인
        const hasNewRow = userList.some((user) => user.rowStatus === "C");
        if (hasNewRow) {
          // 이미 새 행이 있으면 추가하지 않음
          return;
        }

        const newId = `new_${Date.now()}`;
        const newRow: UserDto & { id?: string } = {
          empCode: "",
          empName: "",
          officeId: "",
          useYn: "Y", // 사용여부만 "예"
          lockYn: "N", // 잠금여부 "아니오"
          emailReceiveYn: "N", // E-Mail 수신 "아니오"
          ySale: "N", // 영업사원여부 "아니오"
          insaDeptChgYn: "N", // 인사담당자여부 "아니오"
          buyerYn: "N", // 구매담당여부 "아니오"
          rowStatus: "C",
          id: newId,
        };
        set({
          userList: [newRow, ...userList],
          isModified: true,
          selectedUser: newRow, // 신규 행 추가 시 자동으로 선택
          selectedRows: [newRow],
          pendingFileInfo: null,
          pendingDeleteInfo: null,
        });
      },

      remove: () => {
        const { userList, selectedRows } = get();
        if (selectedRows.length === 0) {
          message.warning(i18n.t("MSG_SY_0043"));
          return;
        }

        // 삭제된 행들을 추적
        const deletedRows: UserDto[] = [];

        const updatedData = userList
          .map((row) => {
            const isSelected = selectedRows.some(
              (selected) => selected.empCode === row.empCode
            );
            if (isSelected) {
              if (row.rowStatus === "C") {
                // 신규 행은 완전히 제거
                return null;
              } else {
                // 기존 행은 삭제 상태로 변경
                const deletedRow = { ...row, rowStatus: "D" };
                deletedRows.push(deletedRow);
                return deletedRow;
              }
            }
            return row;
          })
          .filter((row) => row !== null) as UserDto[];

        // 삭제처리가 완료되면, 만약 신규행 삭제로 선택값이 없어졌다면 첫번째 행 선택
        let newSelectedUser =
          deletedRows.length > 0
            ? deletedRows[0]
            : updatedData.length > 0
            ? updatedData[0]
            : null;
        let newSelectedRows = newSelectedUser ? [newSelectedUser] : [];

        set({
          userList: updatedData,
          isModified: true,
          selectedUser: newSelectedUser,
          selectedRows: newSelectedRows,
        });
      },

      save: async () => {
        const { selectedUser, isModified, pendingFileInfo, pendingDeleteInfo } =
          get();

        if (!isModified || !selectedUser) {
          message.info(i18n.t("MSG_SY_0045"));
          return;
        }

        const item = selectedUser;
        const rowStatus = item.rowStatus;

        if (
          !rowStatus ||
          (rowStatus !== "C" && rowStatus !== "U" && rowStatus !== "D")
        ) {
          message.warning(i18n.t("MSG_SY_0048"));
          return;
        }

        try {
          set({ loading: true });

          let finalEmpImgId: string | undefined = undefined;
          let fileDeleted = false;

          // 파일 삭제 처리
          if (pendingDeleteInfo && pendingDeleteInfo.empCode === item.empCode) {
            await deleteFileApi(
              pendingDeleteInfo.eatKey,
              pendingDeleteInfo.eatIdx
            );
            fileDeleted = true;
            if (!pendingFileInfo || pendingFileInfo.empCode !== item.empCode) {
              finalEmpImgId = undefined;
            }
          }

          // 파일 업로드 처리
          if (pendingFileInfo && pendingFileInfo.empCode === item.empCode) {
            let finalEatKey = pendingFileInfo.eatKey;
            if (!finalEatKey) {
              const eatKeyResponse = await createEatKeyApi("00051");
              if (eatKeyResponse.success && eatKeyResponse.data) {
                finalEatKey = eatKeyResponse.data;
              } else {
                throw new Error("EAT_KEY 생성 실패");
              }
            }
            const uploadResponse = await uploadFileApi(pendingFileInfo.file, {
              eatKey: finalEatKey,
            });
            if (uploadResponse.success) {
              finalEmpImgId = finalEatKey.toString();
            } else {
              throw new Error("파일 업로드 실패");
            }
          }

          // 기존 이미지 유지 로직
          if (
            !fileDeleted &&
            finalEmpImgId === undefined &&
            item.empImgId &&
            item.empImgId !== "PENDING"
          ) {
            const empImgIdNum = parseInt(item.empImgId, 10);
            if (!isNaN(empImgIdNum) && empImgIdNum > 0) {
              finalEmpImgId = empImgIdNum.toString();
            }
          }

          const formatDate = (date: any) => {
            if (!date) return undefined;
            return dayjs(date).format("YYYY-MM-DD");
          };

          // officeId가 없을 경우 기본값 설정
          let officeId = item.officeId;
          if (!officeId || officeId.trim() === "") {
            const authUser = useAuthStore.getState().user;
            officeId = authUser?.officeId || "OSE";
          }

          const userSaveItem: UserSaveItem = {
            ...item,
            rowStatus: rowStatus,
            startDate: formatDate(item.startDate),
            endDate: formatDate(item.endDate),
            empImgId: finalEmpImgId,
            ySale: item.ySale || "N",
            officeId: officeId,
          };

          let response;
          if (rowStatus === "D") {
            response = await deleteUserApi(item.empCode);
          } else if (rowStatus === "C") {
            response = await createUserApi(userSaveItem);
          } else {
            response = await updateUserApi(item.empCode, userSaveItem);
          }

          if (response.success) {
            const {
              userList: currentList,
              selectedUser: currentSelected,
              originalUserData,
            } = get();

            // [Fix] 성공 시 현재 리스트와 선택된 행의 상태를 즉시 제거함
            const updatedList = currentList.map((row) => {
              if (
                row.empCode === item.empCode ||
                (row as any).id === (item as any).id
              ) {
                const updatedRow = { ...row, rowStatus: undefined };
                return updatedRow;
              }
              return row;
            });

            // 성공한 데이터로 originalUserData 동기화 (다음 수정 시 비교 대상 업데이트)
            const updatedOriginalData = { ...originalUserData };
            if (rowStatus !== "D") {
              const { rowStatus: _, id: __, ...cleanItem } = item as any;
              updatedOriginalData[item.empCode] = cleanItem;
            } else {
              delete updatedOriginalData[item.empCode];
            }

            // 선택된 행 정보 동기화 (selectedRows 포함)
            const updatedSelected = currentSelected
              ? { ...currentSelected, rowStatus: undefined }
              : null;

            set({
              userList: updatedList,
              selectedUser: updatedSelected,
              selectedRows: updatedSelected ? [updatedSelected] : [],
              originalUserData: updatedOriginalData,
              isModified: false,
              pendingFileInfo: null,
              pendingDeleteInfo: null,
              loading: false,
            });

            message.success(i18n.t("MSG_SY_0049"));

            // 저장 완료 후 그리드 재조회 (로딩바 표시 없음)
            await get().fetchUserList(false);
          } else {
            set({ loading: false });
            message.error(response.message || i18n.t("MSG_SY_0050"));
          }
        } catch (error) {
          console.error("저장 실패:", error);
          message.error(i18n.t("MSG_SY_0050"));
          set({ loading: false });
        }
      },

      handleCellValueChanged: (data) => {
        const { userList } = get();
        const updatedList = userList.map((row) => {
          const isMatch =
            (data.empCode && row.empCode === data.empCode) ||
            ((data as any).id && (row as any).id === (data as any).id);

          if (isMatch) {
            // rowStatus가 이미 있는 경우에만 유지, 없으면 "U"로 설정
            const hasRowStatus =
              "rowStatus" in row && row.rowStatus !== undefined;
            return {
              ...row,
              ...data,
              rowStatus: hasRowStatus ? row.rowStatus || "U" : "U",
            };
          }
          return row;
        });
        set({ userList: updatedList, isModified: true });
      },

      // 상세 패널 값 변경 시 그리드 동기화 (blur 시점에 호출)
      syncGridFromDetailPanel: (formValues?: Record<string, any>) => {
        const { selectedUser, userList, originalUserData } = get();
        if (!selectedUser) return;

        // 새 행(rowStatus === "C")인 경우에도 동기화 수행 (저장 전 필수)
        const isNewRow = selectedUser.rowStatus === "C";

        // formValues가 전달되면 해당 값 사용, 없으면 selectedUser 사용
        const valuesToSync = formValues || selectedUser;

        const selectedEmpCode = selectedUser.empCode;
        const selectedId = (selectedUser as any).id;
        const rowIndex = userList.findIndex(
          (row) =>
            (selectedEmpCode && row.empCode === selectedEmpCode) ||
            (selectedId && (row as any).id === selectedId)
        );

        if (rowIndex === -1) return;

        const currentRow = userList[rowIndex];
        const originalRow = originalUserData[currentRow.empCode];

        // 값 정규화 함수
        const normalizeValue = (value: any): string => {
          if (value == null) return "";
          if (
            typeof value === "object" &&
            "format" in value &&
            typeof value.format === "function"
          ) {
            try {
              return value.format("YYYY-MM-DD") || "";
            } catch {
              return "";
            }
          }
          if (typeof value === "object") {
            try {
              return JSON.stringify(value);
            } catch {
              return String(value);
            }
          }
          return String(value).trim();
        };

        // 변경사항 확인 - formValues의 키를 기준으로 비교
        const systemFields = ["rowStatus", "id", "chk", "empImgId"];
        const relevantFields = Object.keys(valuesToSync).filter(
          (key) =>
            !systemFields.includes(key) &&
            (valuesToSync as any)[key] !== undefined
        );

        let hasChanges = !originalRow;

        if (originalRow && !hasChanges) {
          hasChanges = relevantFields.some((key) => {
            const currentValue = normalizeValue((valuesToSync as any)[key]);
            const originalValue = normalizeValue(
              originalRow[key as keyof typeof originalRow]
            );
            return currentValue !== originalValue;
          });
        }

        // 필터링된 값 준비 (모든 필드 포함, systemFields 제외)
        const filteredValues = Object.fromEntries(
          relevantFields.map((key) => [key, (valuesToSync as any)[key]])
        );

        // [2024-12-26] 파일 변경 사항(업로드/삭제 대기)이 있는지도 체크하여 rowStatus에 반영함
        const hasPendingFilesForThisUser =
          get().pendingFileInfo?.empCode === selectedEmpCode ||
          get().pendingDeleteInfo?.empCode === selectedEmpCode;

        // 업데이트된 행 생성
        const updatedRow = {
          ...currentRow,
          ...filteredValues,
          empCode: valuesToSync.empCode ?? currentRow.empCode,
          id: valuesToSync.empCode ?? (currentRow as any).id, // ID도 동기화
          // [Fix] 삭제 대기(D) 상태인 경우 상태를 유지함.
          // 그 외에는 새 행이면 C, 변경 사항이나 파일이 있으면 U, 아니면 기존 상태 유지.
          rowStatus:
            currentRow.rowStatus === "D"
              ? "D"
              : isNewRow
              ? "C"
              : hasChanges || hasPendingFilesForThisUser
              ? "U"
              : currentRow.rowStatus,
        };

        // 새로운 리스트 생성
        const updatedList = [...userList];
        updatedList[rowIndex] = updatedRow;

        // selectedUser도 업데이트 (행 상태 포함)
        const updatedSelectedUser = {
          ...selectedUser,
          ...filteredValues,
          rowStatus: updatedRow.rowStatus,
        };

        // 전체 리스트에서 변경사항이 있는지 확인하여 isModified 상태 업데이트
        const hasAnyRowChanges = updatedList.some(
          (row) =>
            row.rowStatus === "C" ||
            row.rowStatus === "U" ||
            row.rowStatus === "D"
        );
        const hasPendingFiles =
          get().pendingFileInfo !== null || get().pendingDeleteInfo !== null;

        set({
          userList: updatedList,
          isModified: hasAnyRowChanges || hasPendingFiles,
          selectedUser: updatedSelectedUser,
        });
      },
    }),
    { name: "UserMngStore" }
  )
);
