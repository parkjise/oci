import styled from "styled-components";

export const DetailStyles = styled.section`
	height: 100%;
	min-height: 0;

	/* Ant Design Splitter 스타일 */
	.ant-splitter {
		height: 100%;
		gap: 10px;
	}

	.ant-splitter-panel {
		min-width: 0;
		min-height: 0;
		overflow: hidden;
	}

	.detail__pane {
		&-left {
			height: 100%;
			min-height: 0;
			overflow: auto;
		}
		&-right {
			height: 100%;
			min-width: 0;
			min-height: 0;
			overflow: hidden;
			.ant-splitter {
				height: 100%;
			}
		}
	}
	.page-layout__detail-view {
		height: 100%;
		min-height: 0;
	}

	.page-layout__detail-grid {
		height: 100%;
		min-height: 0;
		overflow: auto;
	}
`;
