import React from "react";
import { DetailGridStyles } from "./DetailGrid.styles";
import Grid from "@/pages/sample/sample3/Grid";
type DetailGridProps = {
  className?: string;
};

const DetailGrid: React.FC<DetailGridProps> = ({ className }) => {
  return (
    <DetailGridStyles className={className}>
      <Grid />
      </DetailGridStyles>
  );
};

export default DetailGrid;
