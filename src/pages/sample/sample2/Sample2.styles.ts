import styled from "styled-components";
export const Article = styled.article`
	padding: 2rem;
	height: calc(100vh - 140px);
	display: flex;
	flex-direction: column;
	gap: 10px;

	/* 위: 필터 영역은 내용만큼 */
	.page-layout__filter-panel {
		flex: 0 0 auto;
	}

	/* 아래: Detail 전체는 남은 높이 전부 */
	.page-layout__detail {
		flex: 1 1 auto;
		min-height: 0; /* 🔥 아래로 넘쳐 흘러도 스크롤 잘 되게 */
	}
`;
