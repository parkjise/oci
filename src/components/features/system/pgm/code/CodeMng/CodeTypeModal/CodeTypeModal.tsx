// ============================================================================
// 공통코드구분 조회 모달 (CodeMng 전용)
// ============================================================================
// 변경이력:
// - 2025.11.25 : ckkim (최초작성)

import React, { useEffect, useState, useCallback } from "react";
import { Modal, Table, Input } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useTranslation } from "react-i18next";
import { getCodeTypeListApi, type CodeDto } from "@apis/system/code/codeApi";

interface CodeTypeModalProps {
  open: boolean;
  module?: string;
  /** 현재 화면에서 입력되어 있는 공통코드구분 (AS-IS의 AS_TYPE 초기값 역할) */
  initialType?: string;
  onClose: () => void;
  onSelect: (type: string, typeName?: string) => void;
}

interface CodeTypeRow {
  key: string;
  type: string;
  code: string;
  name1?: string;
  nameDesc?: string;
}

/**
 * AS-IS의 /ui/comm/pop/comm/selectCmEtcList.xml 을 참고한
 * CodeMng 전용 공통코드구분 선택 모달.
 */
const CodeTypeModal: React.FC<CodeTypeModalProps> = ({
  open,
  module,
  initialType,
  onClose,
  onSelect,
}) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<CodeTypeRow[]>([]);
  const [filteredRows, setFilteredRows] = useState<CodeTypeRow[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedRow, setSelectedRow] = useState<CodeTypeRow | null>(null);

  const fetchTypeList = useCallback(async () => {
    if (!module) {
      setRows([]);
      setFilteredRows([]);
      return;
    }

    try {
      setLoading(true);
      const response = await getCodeTypeListApi({
        module,
        enabledFlag: "Y",
        checkDateRange: true,
      });

      if (response.success && response.data) {
        const list = response.data
          .filter((item: CodeDto) => item.code !== "##")
          .map((item, index) => ({
            key: `${item.type}_${item.code}_${index}`,
            type: item.type,
            code: item.code,
            name1: item.name1,
            nameDesc: item.nameDesc,
          }));
        setRows(list);
        setFilteredRows(list);
      } else {
        setRows([]);
        setFilteredRows([]);
      }
    } catch {
      setRows([]);
      setFilteredRows([]);
    } finally {
      setLoading(false);
    }
  }, [module]);

  // 모달 오픈 시 목록 조회 및 초기 검색어 설정 (AS-IS: AS_TYPE → sType 세팅 후 조회)
  useEffect(() => {
    if (open) {
      setSearchText(initialType ?? "");
      setSelectedRow(null);
      void fetchTypeList();
    }
  }, [open, initialType, fetchTypeList]);

  // 검색어 필터링
  useEffect(() => {
    if (!searchText) {
      setFilteredRows(rows);
      return;
    }
    const lower = searchText.toLowerCase();
    setFilteredRows(
      rows.filter(
        (row) =>
          row.type.toLowerCase().includes(lower) ||
          (row.name1 ?? "").toLowerCase().includes(lower) ||
          (row.nameDesc ?? "").toLowerCase().includes(lower)
      )
    );
  }, [rows, searchText]);

  const handleRowDoubleClick = (record: CodeTypeRow) => {
    const typeName = record.name1 || record.nameDesc || "";
    onSelect(record.type, typeName);
    onClose();
  };

  const handleOk = () => {
    if (selectedRow) {
      const typeName = selectedRow.name1 || selectedRow.nameDesc || "";
      onSelect(selectedRow.type, typeName);
    }
    onClose();
  };

  const columns: ColumnsType<CodeTypeRow> = [
    {
      title: t("공통코드구분"),
      dataIndex: "type",
      width: 140,
    },
    {
      title: t("공통코드명"),
      dataIndex: "name1",
      width: 200,
    },
    {
      title: t("설명"),
      dataIndex: "nameDesc",
    },
  ];

  return (
    <Modal
      open={open}
      title={t("공통코드구분")}
      onCancel={onClose}
      onOk={handleOk}
      width={700}
      centered
      destroyOnClose
      styles={{
        body: {
          maxHeight: "60vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <div style={{ marginBottom: 8, display: "flex", gap: 8, flexShrink: 0 }}>
        <Input
          allowClear
          placeholder={t("검색")}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onPressEnter={handleOk}
        />
      </div>
      <div style={{ flex: 1, overflow: "hidden" }}>
        <Table<CodeTypeRow>
          size="small"
          rowKey="key"
          loading={loading}
          columns={columns}
          dataSource={filteredRows}
          pagination={false}
          bordered
          scroll={{ y: "calc(60vh - 120px)" }}
          onRow={(record) => ({
            onClick: () => setSelectedRow(record),
            onDoubleClick: () => handleRowDoubleClick(record),
          })}
          rowClassName={(record) =>
            record.key === selectedRow?.key ? "ant-table-row-selected" : ""
          }
        />
      </div>
    </Modal>
  );
};

export default CodeTypeModal;
