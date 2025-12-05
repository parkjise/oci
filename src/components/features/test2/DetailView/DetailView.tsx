import React from "react";
import { DetailViewStyles } from "./DetailView.styles";
import { Tooltip, Badge, Tag } from "antd";
import { FormButton, FormSearchInput } from "@components/ui/form";
type DetailViewProps = {
  className?: string;
};

const DetailView: React.FC<DetailViewProps> = ({ className }) => {
  return (
    <DetailViewStyles className={className}>
      <div className="detail-view__actions">
        <div className="detail-view__actions-group detail-view__actions-group--left">
          <FormSearchInput
            name="search"
            label={""}
            placeholder="검색어를 입력하세요"
            style={{ width: 160, marginRight: 10 }}
            className="form-input form-input--search"
          />
          <span className="detail-view__department">경영관리본부</span>
          <div className="detail-view__divider"></div>
          <span className="detail-view__user">관리자</span>
          <div className="detail-view__divider"></div>
          <span className="detail-view__status">
            <Tag className="detail-view__status-tag  detail-view__status-tag--done">
              완료
            </Tag>
            {/* <Tag className="detail-view__status-tag  detail-view__status-tag--approved">
              전자구매 승인완료
            </Tag>
            <Tag className="detail-view__status-tag  detail-view__status-tag--pending">
              결재중
            </Tag> */}
          </span>
          <div className="detail-view__divider"></div>
          <div className="detail-view__attachment">
            <Tooltip title="첨부파일">
              <FormButton
                icon={
                  <i className="ri-attachment-2" style={{ fontSize: 20 }} />
                }
                size="small"
                className="detail-view__button detail-view__button--more"
              />
            </Tooltip>
            <Badge
              className="detail-view__attachment--badge"
              count={11}
              color="#DC3545"
            />
          </div>
        </div>
        <div className="detail-view__actions-group  detail-view__actions-group--right">
          <FormButton size={"small"} className="detail-view__button">
            결제상신
          </FormButton>
          <FormButton size={"small"} className="detail-view__button">
            승인취소
          </FormButton>
          <Tooltip title="더보기">
            <FormButton
              icon={<i className="ri-more-2-line" style={{ fontSize: 16 }} />}
              size="small"
              className="detail-view__button detail-view__button--more"
            />
          </Tooltip>
          <div className="detail-view__divider"></div>
          <FormButton
            size={"small"}
            className="detail-view__button detail-view__button--edit"
          >
            수정
          </FormButton>
          <FormButton
            size={"small"}
            className="detail-view__button detail-view__button--input"
          >
            신규
          </FormButton>
          <FormButton
            size={"small"}
            className="detail-view__button detail-view__button--copy"
          >
            복사
          </FormButton>
          <FormButton
            size={"small"}
            className="detail-view__button detail-view__button--delete"
          >
            삭제
          </FormButton>
          <FormButton
            type="primary"
            size={"small"}
            className="detail-view__button detail-view__button--save navy"
          >
            저장
          </FormButton>
          <div className="detail-view__divider"></div>
          <Tooltip title="펼치기">
            <FormButton
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
          <tbody>
            <tr>
              <th>
                작성부서
                <span className="helptext asterisk">
                  <i className="ri-asterisk"></i>
                </span>
              </th>
              <td>A11 경영관리본부</td>
              <th>작성자</th>
              <td>ADMIN 관리자 </td>
              <th>
                전표유형
                <span className="helptext error">
                  <i className="ri-information-line"></i>
                </span>
              </th>
              <td>대체전표</td>
              <th>원천</th>
              <td></td>
            </tr>
            <tr>
              <th>
                전표번호
                <span className="helptext question">
                  <i className="ri-question-line"></i>
                </span>
              </th>
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
          </tbody>
        </table>
      </div>
    </DetailViewStyles>
  );
};

export default DetailView;
