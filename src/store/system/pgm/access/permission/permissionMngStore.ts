/*
 * 프로젝트 명  : ONERP
 * 파일 명     : permissionMngStore.ts
 * 설명        : 권한 관리 Zustand Store
 * 변경이력    :
 * - 2025.12.29 : ckkim (최초작성)
 */
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
    getRolesApi,
    getRoleUsersApi,
    getRoleMenusApi,
    getAuthTypesApi,
    updateRoleNameApi,
    deleteRoleApi,
    copyRoleApi,
    saveRoleUsersApi,
    saveRoleMenusApi,
    createRoleApi,
    getRoleHistoryApi,
    getRoleMenuButtonsApi,
    saveRoleMenuButtonsApi,
    getRoleMenuButtonsHistoryApi,
    type RoleDto,
    type RoleUserDto,
    type RoleMenuDto,
    type RoleMenuWinObjDto,
    type RoleMenuWinObjHistDto
} from "@apis/system/pgm/access/permission/permissionApi";
import { showSuccess, showError } from "@components/ui/feedback/Message";
import i18n from "@/i18n";

interface PermissionMngState {
    // Data
    roleList: RoleDto[];
    userList: RoleUserDto[];
    menuList: RoleMenuDto[];
    buttonList: RoleMenuWinObjDto[];
    buttonHistoryList: RoleMenuWinObjHistDto[];
    authTypeOptions: Array<{ value: string; label: string }>;
    
    // State
    selectedRole: RoleDto | null;
    loading: boolean;
    
    // Actions
    fetchRoleList: (topRoleNo?: string) => Promise<void>;
    fetchUserList: (roleNo: string) => Promise<void>;
    fetchMenuList: (roleNo: string) => Promise<void>;
    fetchButtonList: (roleNo: string, pgmNo: string) => Promise<void>;
    fetchAuthTypes: () => Promise<void>;
    
    setSelectedRole: (role: RoleDto | null) => void;
    
    updateRoleName: (roleNo: string, roleName: string) => Promise<boolean>;
    deleteRole: (roleNo: string) => Promise<boolean>;
    copyRole: (roleNo: string) => Promise<boolean>;
    
    saveRoleUsers: (roleNo: string, reason: string, type: 'I' | 'D' | 'M' | 'R', users: RoleUserDto[]) => Promise<boolean>;
    saveRoleMenus: (roleNo: string, reason: string, type: 'I' | 'D' | 'M' | 'R', menus: any[]) => Promise<boolean>;
    saveButtonPermissions: (roleNo: string, pgmNo: string, reason: string, buttons: RoleMenuWinObjDto[]) => Promise<boolean>;
    fetchButtonHistory: (roleNo: string, pgmNo: string, params?: any) => Promise<void>;
    createRole: (data: Partial<RoleDto> & { levelType: 'D' | 'E' }) => Promise<boolean>;
    
    // History
    historyList: any[];
    fetchRoleHistory: (roleNo: string, type: 'USER' | 'MENU', params?: any) => Promise<void>;
    
    reset: () => void;
}

export const usePermissionMngStore = create<PermissionMngState>()(
    devtools(
        (set, get) => ({
            roleList: [],
            userList: [],
            menuList: [],
            buttonList: [],
            buttonHistoryList: [],
            historyList: [],
            authTypeOptions: [],
            selectedRole: null,
            loading: false,

            fetchRoleList: async (topRoleNo) => {
                set({ loading: true });
                try {
                    const response = await getRolesApi(topRoleNo);
                    if (response.success) {
                        const roles = (response.data as RoleDto[]) || [];
                        set({ roleList: roles });
                        
                        // Select first role if none is selected
                        if (!get().selectedRole && roles.length > 0) {
                            get().setSelectedRole(roles[0]);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch roles:", error);
                    showError(i18n.t("MSG_SY_0016")); // 권한 목록 조회에 실패했습니다.
                } finally {
                    set({ loading: false });
                }
            },

            fetchUserList: async (roleNo) => {
                try {
                    const response = await getRoleUsersApi(roleNo);
                    if (response.success) {
                        const data = (response.data as RoleUserDto[]) || [];
                        const dataWithId = data.map(item => ({
                            ...item,
                            id: item.typeId
                        }));
                        set({ userList: dataWithId as RoleUserDto[] });
                    }
                } catch (error) {
                    console.error("Failed to fetch role users:", error);
                }
            },

            fetchMenuList: async (roleNo) => {
                try {
                    const response = await getRoleMenusApi(roleNo);
                    if (response.success) {
                        set({ menuList: (response.data as RoleMenuDto[]) || [] });
                    }
                } catch (error) {
                    console.error("Failed to fetch role menus:", error);
                }
            },

            fetchButtonList: async (roleNo, pgmNo) => {
                try {
                    const response = await getRoleMenuButtonsApi(roleNo, pgmNo);
                    if (response.success) {
                        set({ buttonList: (response.data as RoleMenuWinObjDto[]) || [] });
                    }
                } catch (error) {
                    console.error("Failed to fetch button list:", error);
                }
            },

            fetchAuthTypes: async () => {
                try {
                    const response = await getAuthTypesApi("00000005", "Y");
                    if (response.success) {
                        const data = response.data as any[];
                        const options = data.map((item: any) => ({
                            value: item.codeId || item.code || "",
                            label: item.name1 || item.codeName || ""
                        }));
                        set({ authTypeOptions: options });
                    }
                } catch (error) {
                    console.error("Failed to fetch auth types:", error);
                }
            },

            setSelectedRole: (role) => {
                // Clear previous data immediately for better UI responsiveness
                set({ 
                    selectedRole: role, 
                    userList: [], 
                    menuList: [] 
                });
                
                if (role) {
                    get().fetchUserList(role.roleNo);
                    get().fetchMenuList(role.roleNo);
                }
            },

            updateRoleName: async (roleNo, roleName) => {
                try {
                    const response = await updateRoleNameApi(roleNo, roleName);
                    if (response.success) {
                        showSuccess(i18n.t("MSG_SY_0030")); // 권한명이 변경되었습니다.
                        await get().fetchRoleList();
                        return true;
                    }
                } catch (error) {
                    showError(i18n.t("MSG_SY_0031")); // 권한명 변경에 실패했습니다.
                }
                return false;
            },

            deleteRole: async (roleNo) => {
                try {
                    const response = await deleteRoleApi(roleNo);
                    if (response.success) {
                        showSuccess(i18n.t("MSG_SY_0032")); // 삭제에 성공하였습니다.
                        
                        // Clear selection first
                        set({ selectedRole: null, userList: [], menuList: [] });
                        
                        // Fetch new list
                        await get().fetchRoleList();
                        
                        // fetchRoleList will automatically select the first role if selectedRole is null and roles > 0
                        return true;
                    }
                } catch (error) {
                    showError(i18n.t("MSG_SY_0033")); // 삭제 실패!!
                }
                return false;
            },

            copyRole: async (roleNo) => {
                try {
                    const response = await copyRoleApi(roleNo);
                    if (response.success) {
                        showSuccess(i18n.t("MSG_SY_0028")); // 권한 복사 성공
                        const newRoleNo = (response.data as any)?.roleNo;
                        
                        // Fetch updated list
                        await get().fetchRoleList();
                        
                        // Select the newly copied role
                        if (newRoleNo) {
                            const newRole = get().roleList.find(r => r.roleNo === newRoleNo);
                            if (newRole) {
                                get().setSelectedRole(newRole);
                            }
                        }
                        return true;
                    }
                } catch (error) {
                    showError(i18n.t("MSG_SY_0029")); // 권한 복사 실패
                }
                return false;
            },

            saveRoleUsers: async (roleNo, reason, type, users) => {
                const selectedRole = get().selectedRole;
                if (!selectedRole) return false;

                const payload = {
                    roleType: selectedRole.roleType,
                    description: reason,
                    insertUsers: type === 'I' || type === 'R' ? users : [],
                    deleteUsers: type === 'D' ? users : []
                };

                try {
                    const response = await saveRoleUsersApi(roleNo, payload);
                    if (response.success) {
                        showSuccess(i18n.t("MSG_SY_0034")); // 저장 성공!!
                        await get().fetchUserList(roleNo);
                        return true;
                    }
                } catch (error) {
                    showError(i18n.t("MSG_SY_0035")); // 저장 실패!!
                }
                return false;
            },

            saveRoleMenus: async (roleNo, reason, type, menus) => {
                const currentPgmNos = get().menuList.map(m => m.pgmNo);
                const targetPgmNos = menus.map(m => m.pgmNo);

                let payload: any = {
                    description: reason,
                };

                if (type === 'M') {
                    // Calculate differences for 'Set Menu' mode
                    payload.insertMenuNos = targetPgmNos.filter(no => !currentPgmNos.includes(no));
                    payload.deleteMenuNos = currentPgmNos.filter(no => !targetPgmNos.includes(no));
                } else if (type === 'I') {
                    payload.insertMenuNos = targetPgmNos;
                } else if (type === 'D') {
                    payload.deleteMenuNos = targetPgmNos;
                } else if (type === 'R') {
                    payload.restoreMenuNos = targetPgmNos;
                }

                try {
                    const response = await saveRoleMenusApi(roleNo, payload);
                    if (response.success) {
                        showSuccess(i18n.t("MSG_SY_0034")); // 저장 성공!!
                        await get().fetchMenuList(roleNo);
                        return true;
                    }
                } catch (error) {
                    showError(i18n.t("MSG_SY_0035")); // 저장 실패!!
                }
                return false;
            },

            createRole: async (data) => {
                try {
                    const response = await createRoleApi(data);
                    if (response.success) {
                        showSuccess(i18n.t("MSG_SY_0034")); // 저장 성공!!
                        const newRoleNo = (response.data as any)?.roleNo;
                        
                        // Fetch updated list
                        await get().fetchRoleList();
                        
                        // Select the newly created role
                        if (newRoleNo) {
                            const newRole = get().roleList.find(r => r.roleNo === newRoleNo);
                            if (newRole) {
                                get().setSelectedRole(newRole);
                            }
                        }
                        return true;
                    }
                } catch (error) {
                    showError(i18n.t("MSG_SY_0035")); // 저장 실패!!
                }
                return false;
            },

            saveButtonPermissions: async (roleNo, pgmNo, reason, buttons) => {
                const payload = {
                    description: reason,
                    buttons: buttons
                };

                try {
                    const response = await saveRoleMenuButtonsApi(roleNo, pgmNo, payload);
                    if (response.success) {
                        showSuccess(i18n.t("MSG_SY_0034")); // 저장 성공!!
                        await get().fetchButtonList(roleNo, pgmNo);
                        return true;
                    }
                } catch (error) {
                    showError(i18n.t("MSG_SY_0035")); // 저장 실패!!
                }
                return false;
            },

            fetchButtonHistory: async (roleNo, pgmNo, params) => {
                try {
                    const response = await getRoleMenuButtonsHistoryApi(roleNo, pgmNo, params);
                    if (response.success) {
                        const data = (response.data as RoleMenuWinObjHistDto[]) || [];
                        const normalized = data.map((item, index) => ({
                            ...item,
                            id: `${item.pgmNo}-${item.objectId}-${item.hisDate}-${item.hisType}-${index}`
                        }));
                        set({ buttonHistoryList: normalized });
                    }
                } catch (error) {
                    console.error("Failed to fetch button history:", error);
                }
            },

            fetchRoleHistory: async (roleNo, type, params) => {
                try {
                    const response = await getRoleHistoryApi(roleNo, type, params);
                    if (response.success) {
                        const data = (response.data as any[]) || [];
                        const normalized = data.map(item => ({
                            ...item,
                            histType: item.hisType || item.HIS_TYPE,
                            typeId: item.typeId || item.type_id || item.pgmNo || item.PGM_NO,
                            typeName: item.typeName || item.type_name || item.pgmName || item.PGM_NAME,
                            pgmNo: item.pgmNo || item.PGM_NO,
                            pgmName: item.pgmName || item.PGM_NAME,
                            windowId: item.windowId || item.WINDOW_ID,
                            pgmType: item.pgmType || item.PGM_TYPE,
                            reason: item.description || item.DESCRIPTION,
                            insUserId: item.hisUser || item.HIS_USER,
                            insDate: item.hisDate || item.HIS_DATE,
                            id: item.hisId || item.HIS_ID || `${item.pgmNo}-${item.hisDate}`
                        }));
                        set({ historyList: normalized });
                    }
                } catch (error) {
                    console.error("Failed to fetch history:", error);
                }
            },

            reset: () => {
                set({
                    roleList: [],
                    userList: [],
                    menuList: [],
                    buttonList: [],
                    buttonHistoryList: [],
                    historyList: [],
                    authTypeOptions: [],
                    selectedRole: null,
                    loading: false
                });
            }
        }),
        { name: "PermissionMngStore" }
    )
);
