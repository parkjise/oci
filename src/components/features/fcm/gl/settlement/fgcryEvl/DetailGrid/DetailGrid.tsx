import React from "react";
import Grid from "@/pages/fcm/gl/settlement/FgcryEvl/Grid";
import { DetailGridStyles } from "./DetailGrid.styles";
import type { FgcryEvlDetailResponse } from "../mockData";

type DetailGridProps = {
  className?: string;
  rowData?: FgcryEvlDetailResponse[];
  onCreate?: () => void;
  onDelete?: () => void;
  createDisabled?: boolean;
};

const DetailGrid: React.FC<DetailGridProps> = ({ 
  className, 
  rowData = [], 
  onCreate, 
  onDelete,
  createDisabled = false 
}) => {
  return (
    <DetailGridStyles className={className}>
      <Grid 
        rowData={rowData} 
        onCreate={onCreate} 
        onDelete={onDelete}
        createDisabled={createDisabled} 
      />
    </DetailGridStyles>
  );
};

export default DetailGrid;
