import styled from "styled-components";
import { Card, Typography, Divider, Space } from "antd";

// 페이지 컨테이너
export const StyledPageContainer = styled.div`
  padding: 12px;
  max-width: 1600px;
  margin: 0 auto;
  background: #f5f5f5;
  min-height: 100vh;
`;

// 헤더 영역
export const StyledHeaderContainer = styled.div`
  margin-bottom: 12px;
`;

export const StyledTitle = styled(Typography.Title)`
  margin-bottom: 4px !important;
  color: #1890ff !important;
  font-size: 20px !important;
`;

// 공통 Card 스타일
export const StyledCard = styled(Card)`
  margin-bottom: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

// 검색 영역 Card
export const StyledSearchCard = styled(StyledCard)`
  .ant-card-body {
    padding: 6px 12px;
  }
`;

// 액션 버튼 그룹 Card
export const StyledActionCard = styled(StyledCard)`
  .ant-card-body {
    padding: 8px 12px;
  }
`;

// 사용자 추가/수정 폼 Card
export const StyledFormCard = styled(StyledCard)`
  .ant-card-body {
    padding: 6px 12px;
  }
`;

// 그리드 영역 Card
export const StyledGridCard = styled(StyledCard)`
  .ant-card-body {
    padding: 12px;
  }
`;

// 검색 조건 제목
export const StyledSearchTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

// 검색 아이콘
export const StyledSearchIcon = styled.span`
  color: #1890ff;
  font-size: 14px;
`;

// 검색/초기화 버튼 스타일
export const StyledSearchButton = styled.div`
  min-width: 80px;
  height: 28px;
  font-size: 12px;
`;

// 링크 버튼 스타일
export const StyledLinkButton = styled.span`
  color: #1890ff;
  font-weight: 500;
`;

// 작은 폰트 크기 스타일
export const StyledSmallFont = styled.span`
  font-size: 12px;
`;

// 검색 결과 요약 박스
export const StyledSearchResultBox = styled.div`
  margin-top: 2px;
  padding: 4px 12px;
  background: #f0f9ff;
  border-radius: 6px;
  border: 1px solid #bae7ff;
`;

// 검색 결과 텍스트
export const StyledResultLabel = styled(Typography.Text)`
  font-size: 12px;
  color: #595959;
  font-weight: 600;
`;

export const StyledResultCount = styled(Typography.Text)`
  font-size: 14px;
  color: #1890ff;
  font-weight: 600;
`;

export const StyledResultDivider = styled(Typography.Text)`
  color: #8c8c8c;
  font-size: 12px;
`;

export const StyledResultTotal = styled(Typography.Text)`
  font-size: 12px;
  color: #595959;
  font-weight: 600;
`;

// 액션 버튼 그룹 컨테이너
export const StyledActionButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: 100%;
`;

// Divider 스타일
export const StyledDivider = styled(Divider)`
  margin: 2px 0 !important;
`;

// 폼 버튼 영역
export const StyledFormButtonSpace = styled(Space)`
  width: 100%;
  justify-content: flex-end;
`;

// 카드 제목 텍스트
export const StyledCardTitle = styled.span`
  font-size: 14px;
  font-weight: 600;
`;

// 모달 제목 아이콘
export const StyledModalIcon = styled.span`
  color: #1890ff;
`;

// 모달 제목 텍스트
export const StyledModalTitle = styled.span`
  font-size: 16px;
  font-weight: 600;
`;

// 모달 컨텐츠 컨테이너
export const StyledModalContent = styled.div`
  margin-bottom: 16px;
`;

// 모달 텍스트 스타일
export const StyledModalLabel = styled(Typography.Text)`
  font-size: 14px;
  color: #595959;
  font-weight: 600;
`;

export const StyledModalCount = styled(Typography.Text)<{ color: string }>`
  color: ${(props) => props.color};
  font-size: 16px;
  font-weight: 600;
`;

// 모달 빈 상태 컨테이너
export const StyledModalEmpty = styled.div`
  padding: 40px;
  text-align: center;
  color: #8c8c8c;
`;

// 모달 섹션 제목
export const StyledModalSectionTitle = styled(Typography.Text)<{ color: string }>`
  font-size: 15px;
  color: ${(props) => props.color};
  font-weight: 600;
  margin-bottom: 12px;
  display: block;
`;

// 모달 Divider
export const StyledModalDivider = styled(Divider)`
  margin: 20px 0 !important;
`;

// JSON 미리보기 컨테이너
export const StyledJsonPreview = styled(Typography.Text)`
  font-size: 14px;
  color: #595959;
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
`;

// JSON 코드 박스
export const StyledJsonBox = styled.div`
  background: #f5f5f5;
  padding: 12px;
  border-radius: 6px;
  max-height: 200px;
  overflow: auto;
  font-size: 12px;
  font-family: monospace;
`;

export const StyledJsonPre = styled.pre`
  margin: 0;
  white-space: pre-wrap;
`;

// 모달 스타일 객체
export const modalStyles = {
  top: 20,
};

// 테이블 스타일 객체
export const tableStyles = {
  scroll: { x: 1400, y: 500 },
  pagination: {
    pageSize: 10,
    showSizeChanger: true,
    showTotal: (total: number) => `총 ${total}건`,
  },
};


