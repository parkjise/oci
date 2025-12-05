// ============================================================================
// 권한관리 페이지 (PermissionMng)
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import React, { useState, useEffect, useCallback } from "react";
import { Splitter, Modal, message, Button, Input, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Article } from "./PermissionMng.styles";
import {
  RoleTree,
  RoleDetailForm,
  RoleUserGrid,
  RoleMenuTree,
} from "@components/features/system/pgm/access/permission/PermissionMng";
import type {
  RoleDto,
  RoleUserDto,
  RoleMenuDto,
  RoleInsertRequest,
  RoleNameUpdateRequest,
  RoleUserSaveRequest,
} from "@apis/system/permission/permissionApi";
import {
  getRoleListApi,
  getRoleUserListApi,
  getRoleMenuListApi,
  insertRoleApi,
  deleteRoleApi,
  copyRoleApi,
  updateRoleNameApi,
  saveRoleUserApi,
} from "@apis/system/permission/permissionApi";
import { getCodeDetailApi } from "@apis/comCode";
import { useTranslation } from "react-i18next";
import { useAuthStore } from "@/store/authStore";
import type { CodeDetail } from "@/types/api.types";

// ============================================================================
// Component
// ============================================================================
const PermissionMng: React.FC = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);
  const [roleList, setRoleList] = useState<RoleDto[]>([]);
  const [selectedRole, setSelectedRole] = useState<RoleDto | undefined>();
  const [selectedRoleNo, setSelectedRoleNo] = useState<string>("");
  const [roleUserList, setRoleUserList] = useState<RoleUserDto[]>([]);
  const [roleMenuList, setRoleMenuList] = useState<RoleMenuDto[]>([]);
  const [authTypeList, setAuthTypeList] = useState<CodeDetail[]>([]);
  const [isModified, setIsModified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [roleSearchValue, setRoleSearchValue] = useState("");
  const [menuSearchValue, setMenuSearchValue] = useState("");

  // 권한 타입 코드 조회 (공통코드)
  const fetchAuthTypeList = useCallback(async () => {
    try {
      // ASIS에서 PARENT_CODE는 gcm.ROLE_TYPE_PARENT_CODE를 사용
      // 공통코드 API 사용 (실제 부모코드 값은 백엔드에서 확인 필요)
      const response = await getCodeDetailApi({
        module: "SYS",
        type: "ROLE_TYPE", // 실제 부모코드 값으로 변경 필요
        enabledFlag: "Y",
      });
      if (response.success && response.data) {
        const codeList = Array.isArray(response.data)
          ? response.data
          : [response.data];
        setAuthTypeList(codeList);
      }
    } catch (error) {
      console.error("권한 타입 조회 실패:", error);
      // 에러가 발생해도 계속 진행 (권한 타입이 없어도 화면은 동작)
    }
  }, []);

  // 권한 사용자 목록 조회
  const fetchRoleUserList = useCallback(async (roleNo: string) => {
    try {
      const response = await getRoleUserListApi(roleNo);
      if (response.success && response.data) {
        setRoleUserList(response.data);
      }
    } catch (error) {
      console.error("권한 사용자 목록 조회 실패:", error);
    }
  }, []);

  // 권한 메뉴 목록 조회
  const fetchRoleMenuList = useCallback(async (roleNo: string) => {
    try {
      // 최상위 메뉴번호 (실제 값은 백엔드에서 확인 필요)
      const response = await getRoleMenuListApi(roleNo);
      if (response.success && response.data) {
        setRoleMenuList(response.data);
      }
    } catch (error) {
      console.error("권한 메뉴 목록 조회 실패:", error);
    }
  }, []);

  // 권한 목록 조회
  const fetchRoleList = useCallback(async () => {
    try {
      setLoading(true);
      // 최상위 권한번호 (실제 값은 백엔드에서 확인 필요)
      const topRoleNo = "0000000000";
      const response = await getRoleListApi(topRoleNo);
      if (response.success && response.data) {
        setRoleList(response.data);
        // 첫 번째 권한 선택
        if (response.data.length > 0 && response.data[0].roleNo) {
          setSelectedRoleNo(response.data[0].roleNo);
          setSelectedRole(response.data[0]);
          fetchRoleUserList(response.data[0].roleNo);
          fetchRoleMenuList(response.data[0].roleNo);
        }
      }
    } catch (error) {
      message.error(t("MSG_SY_0016"));
    } finally {
      setLoading(false);
    }
  }, [t, fetchRoleUserList, fetchRoleMenuList]);

  // 권한 선택 핸들러
  const handleRoleSelect = useCallback(
    (roleNo: string) => {
      if (isModified) {
        Modal.confirm({
          title: t("MSG_SY_0002"),
          content: t("MSG_SY_0003"),
          okText: t("예"),
          cancelText: t("아니오"),
          onOk: () => {
            setIsModified(false);
            setSelectedRoleNo(roleNo);
            const role = roleList.find((r) => r.roleNo === roleNo);
            setSelectedRole(role);
            if (role?.roleNo) {
              fetchRoleUserList(role.roleNo);
              fetchRoleMenuList(role.roleNo);
            }
          },
        });
        return;
      }
      setSelectedRoleNo(roleNo);
      const role = roleList.find((r) => r.roleNo === roleNo);
      setSelectedRole(role);
      if (role?.roleNo) {
        fetchRoleUserList(role.roleNo);
        fetchRoleMenuList(role.roleNo);
      }
    },
    [isModified, roleList, fetchRoleUserList, fetchRoleMenuList, t]
  );

  // 권한 검색
  const handleRoleSearch = useCallback(() => {
    if (!roleSearchValue.trim()) return;
    const foundRole = roleList.find((role) =>
      role.roleName?.toLowerCase().startsWith(roleSearchValue.toLowerCase())
    );
    if (foundRole?.roleNo) {
      handleRoleSelect(foundRole.roleNo);
    } else {
      message.info(t("MSG_SY_0017"));
    }
  }, [roleSearchValue, roleList, handleRoleSelect, t]);

  // 메뉴 검색
  const handleMenuSearch = useCallback(() => {
    if (!menuSearchValue.trim()) return;
    const foundMenu = roleMenuList.find((menu) =>
      menu.pgmName?.toLowerCase().startsWith(menuSearchValue.toLowerCase())
    );
    if (foundMenu?.pgmNo) {
      // 메뉴 트리에서 해당 노드 찾기 (컴포넌트에서 처리)
      message.info(t("MSG_SY_0018"));
    } else {
      message.info(t("MSG_SY_0017"));
    }
  }, [menuSearchValue, roleMenuList, t]);

  // 권한 추가
  const handleAddRole = useCallback(
    async (parentRoleNo?: string, isChild: boolean = false) => {
      Modal.confirm({
        title: t("MSG_SY_0019"),
        content: t("MSG_SY_0020"),
        okText: t("예"),
        cancelText: t("아니오"),
        onOk: async () => {
          // 하위 권한으로 추가
          const authType = authTypeList.length > 0
            ? authTypeList[0]?.code || ""
            : "";
          const newRole: RoleInsertRequest = {
            systemId: "OSE", // TODO: 실제 systemId 값으로 변경 필요
            parentRoleNo: isChild ? parentRoleNo : undefined,
            roleName: "New..",
            roleType: authType,
            levelType: "D",
          };

          try {
            setLoading(true);
            const response = await insertRoleApi(newRole);
            if (response.success && response.data?.roleNo) {
              message.success(t("MSG_SY_0021"));
              await fetchRoleList();
              handleRoleSelect(response.data.roleNo);
            }
          } catch (error) {
            message.error(t("MSG_SY_0022"));
          } finally {
            setLoading(false);
          }
        },
        onCancel: async () => {
          // 동일 레벨로 추가
          const authType = authTypeList.length > 0
            ? authTypeList[0]?.code || ""
            : "";
          const newRole: RoleInsertRequest = {
            systemId: "OSE", // TODO: 실제 systemId 값으로 변경 필요
            parentRoleNo: parentRoleNo,
            roleName: "New..",
            roleType: authType,
            levelType: "E",
          };

          try {
            setLoading(true);
            const response = await insertRoleApi(newRole);
            if (response.success && response.data?.roleNo) {
              message.success(t("MSG_SY_0021"));
              await fetchRoleList();
              handleRoleSelect(response.data.roleNo);
            }
          } catch (error) {
            message.error(t("MSG_SY_0022"));
          } finally {
            setLoading(false);
          }
        },
      });
    },
    [user, authTypeList, fetchRoleList, handleRoleSelect, t]
  );

  // 권한 삭제
  const handleDeleteRole = useCallback(
    async (roleNo: string) => {
      // 하위 권한 확인
      const hasChild = roleList.some((role) => role.parentRoleNo === roleNo);

      if (hasChild) {
        message.warning(t("MSG_SY_0023"));
        return;
      }

      Modal.confirm({
        title: t("MSG_SY_0024"),
        content: t("MSG_SY_0025"),
        okText: t("예"),
        cancelText: t("아니오"),
        onOk: async () => {
          try {
            setLoading(true);
            const response = await deleteRoleApi(roleNo);
            if (response.success) {
              message.success(t("MSG_SY_0026"));
              await fetchRoleList();
              // 부모 권한 선택 또는 첫 번째 권한 선택
              const deletedRole = roleList.find((r) => r.roleNo === roleNo);
              if (deletedRole?.parentRoleNo) {
                handleRoleSelect(deletedRole.parentRoleNo);
              } else {
                const firstRole = roleList.find((r) => (r.level || 0) === 1);
                if (firstRole?.roleNo) {
                  handleRoleSelect(firstRole.roleNo);
                }
              }
            }
          } catch (error) {
            message.error(t("MSG_SY_0027"));
          } finally {
            setLoading(false);
          }
        },
      });
    },
    [roleList, fetchRoleList, handleRoleSelect, t]
  );

  // 권한 복사
  const handleCopyRole = useCallback(
    async (roleNo: string) => {
      try {
        setLoading(true);
        const response = await copyRoleApi(roleNo);
        if (response.success) {
          message.success(t("MSG_SY_0028"));
          await fetchRoleList();
        } else {
          message.error(t("MSG_SY_0029"));
        }
      } catch (error) {
        message.error(t("MSG_SY_0029"));
      } finally {
        setLoading(false);
      }
    },
    [fetchRoleList, t]
  );

  // 권한명 변경
  const handleUpdateRoleName = useCallback(
    async (roleNo: string, roleName: string) => {
      try {
        setLoading(true);
        const request: RoleNameUpdateRequest = {
          roleName,
        };
        const response = await updateRoleNameApi(roleNo, request);
        if (response.success) {
          message.success(t("MSG_SY_0030"));
          await fetchRoleList();
          handleRoleSelect(roleNo);
        }
      } catch (error) {
        message.error(t("MSG_SY_0031"));
      } finally {
        setLoading(false);
      }
    },
    [fetchRoleList, handleRoleSelect, t]
  );

  // 권한 사용자 저장
  const handleSaveRoleUser = useCallback(
    async (roleNo: string, insertUsers: RoleUserDto[], deleteUsers: RoleUserDto[], description: string) => {
      try {
        setLoading(true);
        const request: RoleUserSaveRequest = {
          roleType: selectedRole?.roleType || "",
          description,
          insertUsers,
          deleteUsers,
        };
        const response = await saveRoleUserApi(roleNo, request);
        if (response.success) {
          message.success(t("MSG_SY_0005"));
          await fetchRoleUserList(roleNo);
          setIsModified(false);
        }
      } catch (error) {
        message.error(t("MSG_SY_0006"));
      } finally {
        setLoading(false);
      }
    },
    [selectedRole, fetchRoleUserList, t]
  );

  // 권한 메뉴 저장 (현재 미사용, 추후 구현 예정)
  // const handleSaveRoleMenu = useCallback(
  //   async (
  //     roleNo: string,
  //     insertMenuNos: string[],
  //     deleteMenuNos: string[],
  //     description: string
  //   ) => {
  //     try {
  //       setLoading(true);
  //       const request: RoleMenuSaveRequest = {
  //         description,
  //         insertMenuNos,
  //         deleteMenuNos,
  //       };
  //       const response = await saveRoleMenuApi(roleNo, request);
  //       if (response.success) {
  //         message.success(t("MSG_SY_0034") || "저장 성공!!");
  //         await fetchRoleMenuList(roleNo);
  //       }
  //     } catch (error) {
  //       message.error(t("MSG_SY_0035") || "저장 실패!!");
  //     } finally {
  //       setLoading(false);
  //     }
  //   },
  //   [fetchRoleMenuList, t]
  // );

  // 초기 로드
  useEffect(() => {
    fetchAuthTypeList();
    fetchRoleList();
  }, [fetchAuthTypeList, fetchRoleList]);

  return (
    <Article className="page-layout page-layout-splitter">
      {/* 상단 헤더: 검색, 권한 정보, 저장/메뉴설정 버튼 */}
      <div
        style={{
          marginBottom: "10px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px",
          borderBottom: "1px solid #d9d9d9",
        }}
      >
        <Space.Compact style={{ width: "200px" }}>
          <Input
            placeholder={t("검색")}
            prefix={<SearchOutlined />}
            value={roleSearchValue}
            onChange={(e) => setRoleSearchValue(e.target.value)}
            onPressEnter={handleRoleSearch}
          />
        </Space.Compact>
        <div style={{ flex: 1, display: "flex", gap: "10px", alignItems: "center" }}>
              <RoleDetailForm
                role={selectedRole}
                authTypeList={authTypeList}
                onUpdateRoleName={handleUpdateRoleName}
              />
        </div>
        <Space>
          <Button
            type="primary"
            onClick={() => {
              if (selectedRoleNo && isModified) {
                // 저장 로직 (권한 사용자 저장)
                Modal.confirm({
                  title: t("MSG_SY_0036"),
                  content: t("MSG_SY_0037"),
                  okText: t("저장"),
                  cancelText: t("취소"),
                  onOk: async () => {
                    // 실제로는 팝업에서 사유를 입력받아야 함
                    // 현재는 수정된 사용자 목록을 찾아서 저장
                    await handleSaveRoleUser(selectedRoleNo, [], [], "");
                  },
                });
              }
            }}
            loading={loading}
            disabled={!selectedRole || !isModified}
          >
            {t("저장")}
          </Button>
          <Button
            onClick={() => {
              // 메뉴 설정 팝업 호출 (구현 필요)
              message.info(t("MSG_SY_0041"));
            }}
          >
            {t("메뉴설정")}
          </Button>
        </Space>
      </div>
      <Splitter>
        <Splitter.Panel defaultSize={250} min={200} max="40%">
          <div style={{ padding: "10px" }}>
            <div style={{ marginBottom: "10px" }}>
              <Button
                onClick={() => {
                  if (selectedRoleNo) {
                    handleCopyRole(selectedRoleNo);
                  }
                }}
                disabled={!selectedRoleNo}
                block
              >
                {t("권한복사")}
              </Button>
            </div>
            <RoleTree
              roleList={roleList}
              selectedRoleNo={selectedRoleNo}
              onSelect={handleRoleSelect}
              onAddRole={handleAddRole}
              onDeleteRole={handleDeleteRole}
            />
          </div>
        </Splitter.Panel>
        <Splitter.Panel>
          <Splitter layout="vertical">
            <Splitter.Panel
              defaultSize={400}
              min={200}
              max="60%"
              style={{ overflow: "auto" }}
            >
                  <RoleUserGrid
                    roleUserList={roleUserList}
                    authTypeList={authTypeList}
                    onModify={(modified) => setIsModified(modified)}
                onAddUser={() => {
                  // 권한 타입 추가 팝업 호출 (구현 필요)
                  message.info(t("MSG_SY_0038"));
                }}
                onDeleteUser={(roleUser) => {
                  if (selectedRoleNo) {
                    Modal.confirm({
                      title: t("MSG_SY_0039"),
                      content: t("MSG_SY_0040"),
                      okText: t("예"),
                      cancelText: t("아니오"),
                      onOk: async () => {
                        // 실제로는 팝업에서 사유를 입력받아야 함
                        await handleSaveRoleUser(selectedRoleNo, [], [roleUser], "");
                      },
                    });
                  }
                }}
                onRestore={() => {
                  // 복구 기능 (구현 필요)
                  message.info(t("복구"));
                }}
              />
            </Splitter.Panel>
            <Splitter.Panel style={{ overflow: "auto" }}>
              <div style={{ padding: "10px" }}>
                <Space.Compact style={{ width: "100%", marginBottom: "10px" }}>
                  <Input
                    placeholder={t("검색")}
                    prefix={<SearchOutlined />}
                    value={menuSearchValue}
                    onChange={(e) => setMenuSearchValue(e.target.value)}
                    onPressEnter={handleMenuSearch}
                  />
                </Space.Compact>
                <RoleMenuTree
                  roleMenuList={roleMenuList}
                  onSetMenu={() => {
                    // 메뉴 설정 팝업 호출 (구현 필요)
                    message.info(t("MSG_SY_0041"));
                  }}
                />
              </div>
            </Splitter.Panel>
          </Splitter>
        </Splitter.Panel>
      </Splitter>
    </Article>
  );
};

export default PermissionMng;
