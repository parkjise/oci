import { Splitter } from "antd";
import { DetailStyles } from "@/pages/sample/sample2/Detail/Detail.styles";

type SplitLayoutProps = {
	left: React.ReactNode;
	right: React.ReactNode;
};
const Detail: React.FC<SplitLayoutProps> = ({ left, right }) => {
	return (
		<DetailStyles className="page-layout__detail">
			<Splitter>
				<Splitter.Panel defaultSize={250} min={250} max="40%">
					<div className="detail__pane-left">{left}</div>
				</Splitter.Panel>
				<Splitter.Panel>
					<div className="detail__pane-right">{right}</div>
				</Splitter.Panel>
			</Splitter>
		</DetailStyles>
	);
};

export default Detail;
