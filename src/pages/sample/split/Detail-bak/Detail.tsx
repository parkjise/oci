import { DetailStyles } from "@/pages/sample/sample2/Detail/Detail.styles";

type SplitLayoutProps = {
  left: React.ReactNode;
  right: React.ReactNode;
};
const Detail: React.FC<SplitLayoutProps> = ({ left, right }) => {
  return (
    <DetailStyles>
      <div className="detail__pane-left">{left}</div>
      <div className="detail__pane-right">{right}</div>
    </DetailStyles>
  );
};

export default Detail;
