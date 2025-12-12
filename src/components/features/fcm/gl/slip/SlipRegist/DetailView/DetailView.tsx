import React, { useEffect } from "react";
import dayjs from "dayjs";
import { DetailViewStyles } from "./DetailView.styles";
import { Tooltip, Badge, Tag, Form } from "antd";
import { FormButton, FormSearchInput, FormInput } from "@components/ui/form";
import { useSlipRegist } from "@/store/fcm/gl/slip/SlipRegist/SlipRegist";
import { useAuthStore } from "@/store/authStore";

type DetailViewProps = {
  className?: string;
};

const DetailView: React.FC<DetailViewProps> = ({ className }) => {
  const {
    slipHeader: headerData,
    selectedSlipId,
    editingSlipId,
    isNewSlip,
    handleSaveClick: onSave,
    handleDelete: onDelete,
    handleCopy: onCopy,
    handleApprove: onApprove,
    handleCancelApprove: onCancelApprove,
    handleNewClick: onNew,
    handleEditClick: onEdit,
    setSlipHeader,
  } = useSlipRegist();
  
  const [form] = Form.useForm();
  const user = useAuthStore((state) => state.user);
  
  // 편집 모드 여부 결정 - isNewSlip이 true이면 무조건 편집 모드
  const isInEditMode = isNewSlip || (editingSlipId !== null && editingSlipId === selectedSlipId);
  
  // 대표적요 변경 핸들러
  const onDescriptionChange = (value: string) => {
    if (headerData) {
      setSlipHeader({ ...headerData, description: value });
    }
  };

  // headerData가 변경되면 form 값 업데이트
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log("[DetailView] useEffect 실행됨");
      console.log("[DetailView] isNewSlip:", isNewSlip);
      console.log("[DetailView] headerData:", headerData);
      console.log("[DetailView] headerData?.makerDeptName:", headerData?.makerDeptName);
      console.log("[DetailView] isInEditMode:", isInEditMode);
    }
    
    const currentDate = dayjs().format("YYYY-MM-DD HH:mm:ss");
    
    if (isNewSlip) {
      // 신규 모드일 때 기본값 설정 (headerData가 있으면 그것을 사용, 없으면 기본값)
      // slipReg 참조: makeDeptName은 headerData에서 가져오거나 빈 문자열
      const formValues = {
        makerDeptName: headerData?.makerDeptName ?? "",
        makerName: headerData?.makerName ?? user?.empName ?? "",
        slipName: headerData?.slipName ?? "대체전표",
        slipExptnName: headerData?.slipExptnName ?? "대체전표",
        exptnTgt: headerData?.exptnTgt ?? "N",
        creationDate: headerData?.creationDate ?? currentDate,
        lastUpdateDate: headerData?.lastUpdateDate ?? currentDate,
        description: headerData?.description ?? "",
      };
      
      if (import.meta.env.DEV) {
        console.log("[DetailView] 신규 모드 - form 값 설정:", formValues);
        console.log("[DetailView] 작성부서 값:", formValues.makerDeptName);
      }
      
      form.setFieldsValue(formValues);
      
      // 값이 제대로 설정되었는지 확인
      if (import.meta.env.DEV) {
        setTimeout(() => {
          const currentValues = form.getFieldsValue();
          console.log("[DetailView] form 현재 값:", currentValues);
        }, 100);
      }
    } else if (headerData) {
      // 기존 데이터가 있을 때
      // slipReg 참조: makeDeptName은 headerData에서 가져오거나 빈 문자열
      if (import.meta.env.DEV) {
        console.log("[DetailView] 기존 데이터 모드 - form 값 설정");
        console.log("[DetailView] 작성부서 값:", headerData.makerDeptName);
      }
      form.setFieldsValue({
        makerDeptName: headerData.makerDeptName ?? "",
        makerName: headerData.makerName ?? user?.empName ?? "",
        slipName: headerData.slipName ?? "대체전표",
        slipExptnName: headerData.slipExptnName ?? "대체전표",
        exptnTgt: headerData.exptnTgt ?? "N",
        creationDate: headerData.creationDate ?? currentDate,
        lastUpdateDate: headerData.lastUpdateDate ?? currentDate,
        description: headerData.description ?? "",
      });
    } else {
      if (import.meta.env.DEV) {
        console.log("[DetailView] headerData 없음, form 값 설정 안함");
      }
    }
  }, [headerData, form, isNewSlip, user]);
  return (
    <DetailViewStyles className={className}>
      <Form form={form}>
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
          <FormButton 
            size={"small"} 
            className="detail-view__button"
            onClick={onApprove}
          >
            결제상신
          </FormButton>
          <FormButton 
            size={"small"} 
            className="detail-view__button"
            onClick={onCancelApprove}
          >
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
            onClick={onEdit}
          >
            수정
          </FormButton>
          <FormButton
            size={"small"}
            className="detail-view__button detail-view__button--input"
            onClick={onNew}
          >
            신규
          </FormButton>
          <FormButton
            size={"small"}
            className="detail-view__button detail-view__button--copy"
            onClick={onCopy}
          >
            복사
          </FormButton>
          <FormButton
            size={"small"}
            className="detail-view__button detail-view__button--delete"
            onClick={onDelete}
          >
            삭제
          </FormButton>
          <FormButton
            type="primary"
            size={"small"}
            className="detail-view__button detail-view__button--save navy"
            onClick={onSave}
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
              <th>작성부서</th>
              <td>{headerData?.makerDeptName || ""}</td>
              <th>작성자</th>
              <td>{headerData?.makerName || ""}</td>
              <th>
                전표유형
                <span className="helptext error">
                  <i className="ri-information-line"></i>
                </span>
              </th>
              <td>{headerData?.slipName || ""}</td>
              <th>원천</th>
              <td>{headerData?.slipExptnName || ""}</td>
            </tr>
            <tr>
              <th>
                전표번호
                <span className="helptext question">
                  <i className="ri-question-line"></i>
                </span>
              </th>
              <td>{headerData?.glSlipNo || headerData?.slpHeaderId || ""}</td>
              <th>전기</th>
              <td>{headerData?.exptnTgt || ""}</td>
              <th>전자결재</th>
              <td>{headerData?.edimStatusName || ""}</td>
              <th>작성일시</th>
              <td>{!isInEditMode ? (headerData?.creationDate || "") : ""}</td>
            </tr>
            <tr>
              <th>Reverse No.</th>
              <td>{headerData?.reference1 || ""}</td>
              <th>
                대표적요
                <span className="helptext asterisk">
                  <i className="ri-asterisk"></i>
                </span>
              </th>
              <td>
                {isInEditMode ? (
                  <FormInput
                    name="description"
                    label=""
                    layout="inline"
                    onChange={(e) => {
                      const value = e.target.value;
                      if (onDescriptionChange) {
                        onDescriptionChange(value);
                      }
                    }}
                  />
                ) : (
                  headerData?.description || ""
                )}
              </td>
              <th>Closed</th>
              <td>{headerData?.magamTag || ""}</td>
              <th>최종수정일시</th>
              <td>{!isInEditMode ? (headerData?.lastUpdateDate || "") : ""}</td>
            </tr>
          </tbody>
        </table>
      </div>
      </Form>
    </DetailViewStyles>
  );
};

export default DetailView;
