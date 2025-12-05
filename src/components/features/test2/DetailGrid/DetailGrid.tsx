import React from "react";
import Grid from "@/pages/sample/sample3/Grid";
import { DetailGridStyles } from "./DetailGrid.styles";

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

