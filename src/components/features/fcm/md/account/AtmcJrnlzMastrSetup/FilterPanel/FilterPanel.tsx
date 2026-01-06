import { useImperativeHandle, forwardRef } from "react";
import { SearchForm } from "@components/ui/form";
import { useAtmcJrnlzMastrSetupStore } from "@/store/fcm/md/account/AtmcJrnlzMastrSetupStore";

interface FilterPanelProps {
    className?: string;
}

export interface FilterPanelHandle {
    handleSearch: () => Promise<void>;
}

const FilterPanel = forwardRef<FilterPanelHandle, FilterPanelProps>(({ className }, ref) => {
    const { fetchMasterList, loading, setDetailList, setSelectedMasterRow } = useAtmcJrnlzMastrSetupStore();

    const handleSearch = async () => {
        setSelectedMasterRow(null);
        setDetailList([]);
        await fetchMasterList();
    };

    useImperativeHandle(ref, () => ({
        handleSearch,
    }));

    return (
        <SearchForm
            onSearch={handleSearch}
            loading={loading}
            className={className}
        >
            {/* 이 화면은 조회 조건이 없으므로 빈 폼 또는 기본 문구만 표시 */}
        </SearchForm>
    );
});

FilterPanel.displayName = "FilterPanel";

export default FilterPanel;
