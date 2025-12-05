import type { ReactNode } from "react";
import { Article } from "@/components/ui/layout/Styles/PageLayout.styles";
import { Splitter } from "antd";
import { SplitLayoutStyles } from "@/components/ui/layout/Styles/SplitLayout.styles";

export interface ListDetailLayoutProps {
  /** 필터 패널 영역에 렌더링할 컴포넌트 */
  filterPanel?: ReactNode;
  /** 리스트 영역에 렌더링할 컴포넌트 */
  listPanel?: ReactNode;
  /** 컨텐츠 상단 영역에 렌더링할 컴포넌트 */
  detailPanel?: ReactNode;
  /** 컨텐츠 하단 영역에 렌더링할 컴포넌트 */
  detailBottomPanel?: ReactNode;
  /** 상하 분할 사용 여부 (기본값: false) */
  verticalSplit?: boolean;
}

const ListDetailLayout = ({
  filterPanel,
  listPanel,
  detailPanel,
  detailBottomPanel,
  verticalSplit = false,
}: ListDetailLayoutProps) => {
  const leftPanelSize = listPanel != null ? 250 : "100%";

  const hasDetailContent = detailPanel != null || detailBottomPanel != null;
  const hasBothDetailViews = detailPanel != null && detailBottomPanel != null;

  const renderDetailContent = () => {
    if (!hasDetailContent) {
      return null;
    }

    if (verticalSplit && hasBothDetailViews) {
      return (
        <SplitLayoutStyles>
          <Splitter vertical>
            <Splitter.Panel
              defaultSize={300}
              min={200}
              max="60%"
              style={{ overflow: "hidden" }}
            >
              <div
                className="page-layout__detail-view page-card page-card--detail-view"
                style={{ height: "100%" }}
              >
                {detailPanel}
              </div>
            </Splitter.Panel>
            <Splitter.Panel>
              <div
                className="page-layout__detail-grid page-card page-card--detail-grid"
                style={{ height: "100%" }}
              >
                {detailBottomPanel}
              </div>
            </Splitter.Panel>
          </Splitter>
        </SplitLayoutStyles>
      );
    }

    return (
      <>
        {detailPanel != null && (
          <div className="page-layout__detail-view page-card page-card--detail-view">
            {detailPanel}
          </div>
        )}
        {detailBottomPanel != null && (
          <div className="page-layout__detail-grid page-card page-card--detail-grid">
            {detailBottomPanel}
          </div>
        )}
      </>
    );
  };

  return (
    <Article className="page-layout page-layout--search-list-detail-grid">
      {filterPanel != null && (
        <section className="page-card page-card--filter">{filterPanel}</section>
      )}
      {listPanel != null ? (
        hasDetailContent ? (
          <SplitLayoutStyles>
            <Splitter>
              <Splitter.Panel
                defaultSize={leftPanelSize}
                min={250}
                max="40%"
                style={{ overflow: "hidden" }}
                className="split-layout__panel split-layout__panel--left"
              >
                <section className="page-card page-card--list">
                  {listPanel}
                </section>
              </Splitter.Panel>
              <Splitter.Panel>
                <div className="split-layout__pane-right">
                  {renderDetailContent()}
                </div>
              </Splitter.Panel>
            </Splitter>
          </SplitLayoutStyles>
        ) : (
          <section className="page-card page-card--list">{listPanel}</section>
        )
      ) : (
        hasDetailContent && renderDetailContent()
      )}
    </Article>
  );
};

export default ListDetailLayout;
