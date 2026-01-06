import React, { useEffect } from "react";
import { Form } from "antd";
import TwoGridLayout from "@components/ui/layout/TwoGridLayout/TwoGridLayout";
import {
  Search,
  UserGrid,
  UserDetailPanel,
} from "@components/features/system/org/user/UserMng";
import { useUserMngStore } from "@store/system/org/user/userMngStore";
import { useAuthStore } from "@store/com/auth/authStore";

const UserMng: React.FC = () => {
  const [detailForm] = Form.useForm();
  
  // 셀렉터를 사용하여 필요한 기능만 가져옴 (리렌더링 최적화 및 무한 루프 방지)
  const user = useAuthStore((state) => state.user);
  const fetchOrgList = useUserMngStore((state) => state.fetchOrgList);
  const fetchPositionList = useUserMngStore((state) => state.fetchPositionList);
  const search = useUserMngStore((state) => state.search);
  const reset = useUserMngStore((state) => state.reset);

  const officeId = user?.officeId;

  // 초기 데이터 로드
  useEffect(() => {
    const init = async () => {
      if (officeId) {
        await fetchOrgList(officeId);
      }
      await fetchPositionList();
      // 초기 조회 (파라미터 없이 호출하면 스토어의 기본값 사용)
      await search();
    };
    
    init();

    return () => {
      reset();
    };
  }, [officeId, fetchOrgList, fetchPositionList, search, reset]);

  return (
    <TwoGridLayout
      filterPanel={<Search />}
      leftPanel={<UserGrid />}
      rightPanel={<UserDetailPanel form={detailForm} />}
      leftPanelSize="35%"
    />
  );
};

export default UserMng;
