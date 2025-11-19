import { DetailViewStyles } from "@/pages/sample/sample2/DetailView/DetailView.styles";
import { Button, Tooltip } from "antd";
type DetailViewProps = {
  className?: string;
};

const DetailView: React.FC<DetailViewProps> = ({ className }) => {
  return (
    <DetailViewStyles className={className}>
      <div className="detail-view__actions">
        <div className="detail-view__actions-group detail-view__actions-group--left"></div>
        <div className="detail-view__actions-group  detail-view__actions-group--right">
          <Button size={"small"} className="detail-view__button">
            결제상신
          </Button>
          <Button size={"small"} className="detail-view__button">
            승인취소
          </Button>
          <Tooltip title="더보기">
            <Button
              icon={<i className="ri-more-2-line" style={{ fontSize: 16 }} />}
              size="small"
              className="detail-view__button detail-view__button--more"
            />
          </Tooltip>
          <Button
            size={"small"}
            className="detail-view__button detail-view__button--edit"
          >
            수정
          </Button>
          <Button
            size={"small"}
            className="detail-view__button detail-view__button--input"
          >
            입력
          </Button>
          <Button
            size={"small"}
            className="detail-view__button detail-view__button--copy"
          >
            복사
          </Button>
          <Button
            size={"small"}
            className="detail-view__button detail-view__button--delete"
          >
            삭제
          </Button>
          <Button
            type="primary"
            size={"small"}
            className="detail-view__button detail-view__button--save"
          >
            저장
          </Button>
          <div className="divider"></div>
          <Tooltip title="펼치기">
            <Button
              size="small"
              icon={
                <i className="ri-arrow-down-s-line" style={{ fontSize: 18 }} />
              }
              className="detail-view__button detail-view__button--expand"
            />
          </Tooltip>
        </div>
      </div>
      <div className="detail-view__table">
        <table>
          <tr>
            <th>작성부서</th>
            <td>A11 경영관리본부</td>
            <th>작성자</th>
            <td>ADMIN 관리자 </td>
            <th>전표유형</th>
            <td>대체전표</td>
            <th>원천</th>
            <td></td>
          </tr>
          <tr>
            <th>전표번호</th>
            <td>1234556789</td>
            <th>전기</th>
            <td></td>
            <th>전자결재</th>
            <td></td>
            <th>작성일시</th>
            <td>2025-10-20</td>
          </tr>
          <tr>
            <th>Reverse No.</th>
            <td>10</td>
            <th>대표적요</th>
            <td>상차도</td>
            <th>Closed</th>
            <td></td>
            <th>최종수정일시</th>
            <td>2025-10-20</td>
          </tr>
        </table>
      </div>
    </DetailViewStyles>
  );
};

export default DetailView;
