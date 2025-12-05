import React from "react";
import { DetailGridStyles } from "./DetailGrid.styles";

type DetailGridProps = {
  className?: string;
};

const DetailGrid: React.FC<DetailGridProps> = ({ className }) => {
  return (
    <DetailGridStyles className={className}>{/*<Grid />*/}</DetailGridStyles>
  );
};

export default DetailGrid;
