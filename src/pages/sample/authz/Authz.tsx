import React from "react";
import { FormButton, FormInput } from "@components/ui/form";
import { AuthzStyles } from "@/pages/system/pgm/access/permission/PermissionMng/SamplePermissionMng.Styles";
const Authz: React.FC = () => {
  return (
    <AuthzStyles className="authz">
      {/* LEFT: 권한 목록/검색 */}
      <section className="authz__column authz__column--list page-card">
        {/* Button */}
        <div className="authz__header authz__header--list">
          <div className="authz__search authz__search--list">
            <FormInput
              className="authz__input authz__input--search"
              type="search"
              name="search"
              label=""
            />
          </div>
          <div className="authz__actions authz__actions--primary">
            <FormButton className="authz__btn authz__btn--copy">
              권한복사
            </FormButton>
          </div>
        </div>
        {/* Tree Menu */}
        <div className="authz__body authz__body--list">
          <div className="authz__tree authz__tree--permissions page-card">
            Tree 메뉴 들어가는 곳
          </div>
        </div>
      </section>

      {/* RIGHT: 상세 */}
      <section className="authz__column authz__column--detail">
        {/* 권한번호 및 타입 저장 */}
        <div className="authz__header authz__header--detail page-card">
          <div className="authz__meta">
            <div className="authz__meta-item">
              <span className="authz__meta-label">권한번호</span>
              <span className="authz__meta-value">0000000000129</span>
            </div>
            <span className="divider"></span>
            <div className="authz__meta-item">
              <span className="authz__meta-label">권한타입</span>
              <span className="authz__meta-value">개인</span>
            </div>
            <span className="divider"></span>
            <div className="authz__meta-item authz__meta-item--name">
              <span className="authz__meta-label">권한명</span>
              <FormInput
                name="authName"
                label=""
                className="authz__input authz__input--name"
              />
              <FormButton className="authz__btn authz__btn--rename">
                권한명 변경
              </FormButton>
            </div>
          </div>
          <div className="authz__actions authz__actions--detail">
            <FormButton className="authz__btn authz__btn--save navy">
              저장
            </FormButton>
          </div>
        </div>
        <div className="authz__body authz__body--detail">
          {/* Grid */}
          <div className="authz__pane authz__pane--roles page-card">Grid</div>
          <div className="authz__pane authz__pane--menus page-card">
            {/* Buttons */}
            <div className="authz__toolbar authz__toolbar--menus">
              <div className="authz__search authz__search--menus">
                <FormInput
                  className="authz__input authz__input--search"
                  type="search"
                  name="menuSearch"
                  label=""
                />
              </div>

              <div className="authz__actions authz__actions--secondary">
                <FormButton className="authz__btn authz__btn--restore">
                  복구
                </FormButton>
                <FormButton className="authz__btn authz__btn--menu-config">
                  메뉴설정
                </FormButton>
              </div>
            </div>
            {/* Tree Menu */}
            <div className="authz__content authz__content--menus">
              <div className="authz__tree authz__tree--menus page-card">
                Tree 메뉴 들어가는 곳
              </div>
            </div>
          </div>
        </div>
      </section>
    </AuthzStyles>
  );
};

export default Authz;
