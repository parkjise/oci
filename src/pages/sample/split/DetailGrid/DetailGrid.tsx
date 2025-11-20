import Grid from "@/pages/sample/sample3/Grid";
import { DetailGridStyles } from "@/pages/sample/sample2/DetailGrid/DetailGrid.styles";

type DetailGridProps = {
  className?: string;
};

const DetaiGrid: React.FC<DetailGridProps> = ({ className }) => {
  return (
    <DetailGridStyles className={className}>
      <Grid />
    </DetailGridStyles>
  );
};

export default DetaiGrid;
