import React from "react";
import { Button, Tooltip, Tag } from "antd";
import { RecordListStyles } from "./RecordList.styles";

type RecordListProps = {
  className?: string;
};

const RecordList: React.FC<RecordListProps> = ({ className }) => {
  return (
    <RecordListStyles className={className}>
      <div className="record-list">
        <div className="record-list__header">
          <div className="record-list__count">
            전체 <span className="record-list__count-number">3</span>건
          </div>
          <div className="record-list__view-controls">
            <Tooltip title="카드형으로 보기">
              <Button
                icon={
                  <i className="ri-gallery-view-2" style={{ fontSize: 14 }} />
                }
                className="record-list__view-button record-list__view-button--active"
              />
            </Tooltip>
            <Tooltip title="그리드로 보기">
              <Button
                icon={<i className="ri-menu-line" style={{ fontSize: 14 }} />}
                className="record-list__view-button"
              />
            </Tooltip>
          </div>
        </div>
        <div className="record-list__items">
          <div className="record-list__item record-list__item--active">
            <div className="record-list__item-header">
              <div className="record-list__item-header-left">
                <span className="record-list__item-id">7419137</span>
              </div>
              <div className="record-list__item-header-right">
                <span className="record-list__item-date">2025.10.20</span>
              </div>
            </div>
            <div className="record-list__item-company">에이비씨 머티리얼즈</div>
          </div>
          <div className="record-list__item">
            <div className="record-list__item-header">
              <div className="record-list__item-header-left">
                <span className="record-list__item-id">7419137</span>
                <Tag className="record-list__status record-list__status--done">
                  완료
                </Tag>
              </div>
              <div className="record-list__item-header-right">
                <span className="record-list__item-date">2025.10.20</span>
              </div>
            </div>
            <div className="record-list__item-company">에이비씨 머티리얼즈</div>
          </div>
          <div className="record-list__item">
            <div className="record-list__item-header">
              <div className="record-list__item-header-left">
                <span className="record-list__item-id">7419137</span>
                <Tag className="record-list__status record-list__status--approved">
                  전자구매 승인완료
                </Tag>
              </div>
              <div className="record-list__item-header-right">
                <span className="record-list__item-date">2025.10.20</span>
              </div>
            </div>
            <div className="record-list__item-company">에이비씨 머티리얼즈</div>
          </div>
          <div className="record-list__item">
            <div className="record-list__item-header">
              <div className="record-list__item-header-left">
                <span className="record-list__item-id">7419137</span>
                <Tag className="record-list__status record-list__status--pending">
                  결재중
                </Tag>
              </div>
              <div className="record-list__item-header-right">
                <span className="record-list__item-date">2025.10.20</span>
              </div>
            </div>
            <div className="record-list__item-company">에이비씨 머티리얼즈</div>
          </div>
          <div className="record-list__item">
            <div className="record-list__item-header">
              <div className="record-list__item-header-left">
                <span className="record-list__item-id">7419137</span>
              </div>
              <div className="record-list__item-header-right">
                <span className="record-list__item-date">2025.10.20</span>
              </div>
            </div>
            <div className="record-list__item-company">에이비씨 머티리얼즈</div>
          </div>
          <div className="record-list__item">
            <div className="record-list__item-header">
              <div className="record-list__item-header-left">
                <span className="record-list__item-id">7419137</span>
              </div>
              <div className="record-list__item-header-right">
                <span className="record-list__item-date">2025.10.20</span>
              </div>
            </div>
            <div className="record-list__item-company">에이비씨 머티리얼즈</div>
          </div>
          <div className="record-list__item">
            <div className="record-list__item-header">
              <div className="record-list__item-header-left">
                <span className="record-list__item-id">7419137</span>
              </div>
              <div className="record-list__item-header-right">
                <span className="record-list__item-date">2025.10.20</span>
              </div>
            </div>
            <div className="record-list__item-company">에이비씨 머티리얼즈</div>
          </div>
          <div className="record-list__item">
            <div className="record-list__item-header">
              <div className="record-list__item-header-left">
                <span className="record-list__item-id">7419137</span>
              </div>
              <div className="record-list__item-header-right">
                <span className="record-list__item-date">2025.10.20</span>
              </div>
            </div>
            <div className="record-list__item-company">에이비씨 머티리얼즈</div>
          </div>
          <div className="record-list__item">
            <div className="record-list__item-header">
              <div className="record-list__item-header-left">
                <span className="record-list__item-id">7419137</span>
              </div>
              <div className="record-list__item-header-right">
                <span className="record-list__item-date">2025.10.20</span>
              </div>
            </div>
            <div className="record-list__item-company">에이비씨 머티리얼즈</div>
          </div>
          {/*  */}
          <div className="record-list__item">
            <div className="record-list__item-header">
              <div className="record-list__item-header-left">
                <span className="record-list__item-id">7419137</span>
              </div>
              <div className="record-list__item-header-right">
                <span className="record-list__item-date">2025.10.20</span>
              </div>
            </div>
            <div className="record-list__item-company">에이비씨 머티리얼즈</div>
          </div>
          <div className="record-list__item">
            <div className="record-list__item-header">
              <div className="record-list__item-header-left">
                <span className="record-list__item-id">7419137</span>
              </div>
              <div className="record-list__item-header-right">
                <span className="record-list__item-date">2025.10.20</span>
              </div>
            </div>
            <div className="record-list__item-company">에이비씨 머티리얼즈</div>
          </div>
          {/*  */}
        </div>
      </div>
    </RecordListStyles>
  );
};

export default RecordList;
