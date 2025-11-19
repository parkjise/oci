import { DetailStyles } from "@/pages/sample/sample2/Detail/Detail.styles";

type SplitLayoutProps = {
  left: React.ReactNode;
  right: React.ReactNode;
  className?: string;
};
const Detail: React.FC<SplitLayoutProps> = ({ left, right, className }) => {
  return (
    <DetailStyles className={className}>
      <div className="pane-left">{left}</div>
      <div className="pane-right">{right}</div>
    </DetailStyles>
  );
};

export default Detail;
