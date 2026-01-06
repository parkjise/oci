import React, { useState } from "react";
import { MdiStyles } from "@/components/features/mdi/Mdi.styles";
import { FormButton } from "@/components/ui";
import { Tooltip, Dropdown } from "antd";
const Mdi: React.FC = () => {
  const [bookmark, setBookmark] = useState(false);

  const handleClickBookmark = () => {
    setBookmark((prev) => !prev);
  };
  return (
    <MdiStyles className="mdi-bar">
      <div className="mdi-bar__title">
        <Tooltip key="home" title="홈">
          <FormButton
            icon={<i className="ri-home-5-line" />}
            className="mdi-bar__title-icon mdi-bar__title-icon--home"
          />
        </Tooltip>
        <span className="mdi-bar__title-icon mdi-bar__title-icon--separator">
          <i className="ri-arrow-drop-right-line"></i>
        </span>
        <h2 className="mdi-bar__title-text">구매결의 등록</h2>
        <div className="mdi-bar__title-actions">
          <Tooltip key="bookmark" title="즐겨찾기">
            <FormButton
              icon={<i className="ri-star-fill" />}
              className={`mdi-bar__title-icon mdi-bar__title-icon--bookmark ${
                bookmark ? "active" : ""
              }`}
              onClick={handleClickBookmark}
            />
          </Tooltip>
          <Tooltip key="manual" title="매뉴얼">
            <FormButton
              icon={<i className="ri-book-line" />}
              className="mdi-bar__title-icon mdi-bar__title-icon--manual"
            />
          </Tooltip>
        </div>
      </div>
      <div className="mdi-bar__controls">
        <div className="mdi-bar__tab-list">
          <div className="mdi-bar__tab">
            <span className="mdi-bar__tab-label">구매요청 진행현황 조회</span>
            <FormButton
              className="mdi-bar__tab-close"
              icon={<i className="ri-close-circle-fill" />}
            />
          </div>
          <div className="mdi-bar__tab mdi-bar__tab--active">
            <span className="mdi-bar__tab-label">구매결의 등록</span>
            <FormButton
              className="mdi-bar__tab-close"
              icon={<i className="ri-close-circle-fill" />}
            />
          </div>
          <div className="mdi-bar__tab">
            <span className="mdi-bar__tab-label">영수증 등록</span>
            <FormButton
              className="mdi-bar__tab-close"
              icon={<i className="ri-close-circle-fill" />}
            />
          </div>
          <div className="mdi-bar__tab">
            <span className="mdi-bar__tab-label">계정체계 조회</span>
            <FormButton
              className="mdi-bar__tab-close"
              icon={<i className="ri-close-circle-fill" />}
            />
          </div>
          <div className="mdi-bar__tab">
            <span className="mdi-bar__tab-label">지출결의 요약 조회</span>
            <FormButton
              className="mdi-bar__tab-close"
              icon={<i className="ri-close-circle-fill" />}
            />
          </div>
        </div>
        <div className="mdi-bar__actions">
          <Tooltip key="prev" title="이전탭">
            <FormButton
              icon={<i className="ri-arrow-left-s-line"></i>}
              className="mdi-bar__action mdi-bar__action--prev-tab"
            />
          </Tooltip>
          <Tooltip key="next" title="다음탭">
            <FormButton
              icon={<i className="ri-arrow-right-s-line"></i>}
              className="mdi-bar__action mdi-bar__action--next-tab"
            />
          </Tooltip>

          <Dropdown
            placement="bottomLeft"
            overlayClassName="mdi-bar__tab-list-menu"
            dropdownRender={() => (
              <div className="mdi-bar__tab-list-menu-content">
                <ul className="mdi-bar__tab-list-menu-item">
                  <li>
                    <a href="#">구매요청 진행현황 조회</a>
                  </li>
                  <li>
                    <a href="#">구매결의 등록</a>
                  </li>
                  <li>
                    <a href="#">영수증 등록</a>
                  </li>
                  <li>
                    <a href="#">계정체계 조회</a>
                  </li>
                  <li>
                    <a href="#">지출결의 요약 조회</a>
                  </li>
                  <li>
                    <a href="#">기타</a>
                  </li>
                </ul>
              </div>
            )}
          >
            <Tooltip key="more" title="더보기">
              <FormButton
                icon={<i className="ri-more-line"></i>}
                className="mdi-bar__action mdi-bar__action--tab-list"
              />
            </Tooltip>
          </Dropdown>
          <Tooltip key="close" title="모두닫기">
            <FormButton
              icon={<i className="ri-close-line"></i>}
              className="mdi-bar__action mdi-bar__action--close"
            />
          </Tooltip>
        </div>
      </div>
    </MdiStyles>
  );
};

export default Mdi;
