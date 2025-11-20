import { DetailStyles } from "@/pages/sample/split/Detail/Detail.styles";
import { Splitter } from "antd";

type SplitLayoutProps = {
  left: React.ReactNode;
  rightTop: React.ReactNode;
  rightBottom: React.ReactNode;
};
const Detail: React.FC<SplitLayoutProps> = ({
  left,
  rightTop,
  rightBottom,
}) => {
  return (
    <DetailStyles>
      <Splitter layout="horizontal">
        <Splitter.Panel
          className="detail__pane-left"
          defaultSize={235}
          min={235}
          max="40%"
        >
          {left}
        </Splitter.Panel>

        <Splitter.Panel className="detail__pane-right">
          <Splitter layout="vertical" className="detail__vertical-splitter">
            <Splitter.Panel
              className="detail__pane-top"
              defaultSize="179px"
              min={89}
              max="70%"
            >
              {rightTop}
            </Splitter.Panel>
            <Splitter.Panel
              className="detail__pane-bottom"
              defaultSize="60%"
              min={150}
            >
              {rightBottom}
            </Splitter.Panel>
          </Splitter>
        </Splitter.Panel>
      </Splitter>
    </DetailStyles>
  );
};

export default Detail;
