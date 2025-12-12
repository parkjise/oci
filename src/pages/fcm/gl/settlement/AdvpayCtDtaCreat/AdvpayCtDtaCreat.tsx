import React, { useEffect } from "react";
import SearchGridLayout from "@/components/ui/layout/SearchGridLayout";
import { 
    FilterPanel,
    DetailGrid
} from "@components/features/fcm/gl/settlement/AdvpayCtDtaCreat";
import { useAdvpayCtDtaCreatStore } from "@/store/fcm/gl/settlement/AdvpayCtDtaCreatStore";


const AdvpayCtDtaCreat: React.FC = () => {
    const reset = useAdvpayCtDtaCreatStore((state) => state.reset);

    // 컴포넌트 마운트 시 store 초기화
    useEffect(() => {
        reset();
        
        // 컴포넌트 언마운트 시에도 초기화 (선택사항)
        return () => {
            reset();
        };
    }, [reset]);

    return (
        <SearchGridLayout
            filterPanel={<FilterPanel className="page-layout__filter-panel" />}
            grid={<DetailGrid className="page-layout__detail-grid" />}
        />
    );
};

export default AdvpayCtDtaCreat;