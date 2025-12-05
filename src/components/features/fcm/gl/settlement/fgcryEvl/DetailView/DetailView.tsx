import { useState, useEffect, useRef } from "react";
import dayjs from "dayjs";
import { DetailViewStyles } from "./DetailView.styles";
import { Form, Tooltip } from "antd";
import { FormButton, FormInput } from "@components/ui/form";
import type { SlipMaster } from "../mockData";
import { useAuthStore } from "@/store/authStore";

type DetailViewProps = {
  className?: string;
  data?: SlipMaster;
  isNewSlip?: boolean;
  forceEditMode?: boolean;
  editingSlipId?: string | null;
  selectedSlipId?: string;
  onInput?: () => void;
  onModify?: (modified: boolean) => void;
  onSave?: () => Promise<boolean>;
  onDelete?: () => void | Promise<void>;
  onCopy?: () => void | Promise<void>;
  onCancelConfm?: () => void | Promise<void>;
  onDataChange?: (data: Partial<SlipMaster>) => void;
  onEditClick?: (slipId: string) => void;
  onExitEditMode?: () => void;
};

const DetailView: React.FC<DetailViewProps> = ({ 
  className, 
  data, 
  isNewSlip,
  forceEditMode,
  editingSlipId,
  selectedSlipId,
  onInput, 
  onModify,
  onSave,
  onDelete,
  onCopy,
  onCancelConfm,
  onDataChange,
  onEditClick,
  onExitEditMode,
}) => {
  const [showMoreActions, setShowMoreActions] = useState(false);
  const [form] = Form.useForm();
  const isEditModeManuallySet = useRef(false); // 수동으로 편집 모드가 설정되었는지 추적

  const [formData, setFormData] = useState<Partial<SlipMaster>>({});
  
  // 로그인한 사용자 정보 가져오기
  const user = useAuthStore((state) => state.user);

  // 편집 모드 여부 결정: editingSlipId와 selectedSlipId 비교 또는 새 전표인 경우
  const isInEditMode = editingSlipId === selectedSlipId || isNewSlip || forceEditMode;

  useEffect(() => {
    if (data) {
      setFormData(data);
      // 새 전표인 경우 편집 모드 유지
      if (isNewSlip) {
        isEditModeManuallySet.current = false;
      } else if (editingSlipId === selectedSlipId) {
        // 편집 중인 전표인 경우 편집 모드
        isEditModeManuallySet.current = true;
      } else {
        // 편집 중이 아닌 전표인 경우 표시 모드로 전환
        isEditModeManuallySet.current = false; // 플래그 리셋
      }
    } else {
      setFormData({});
      isEditModeManuallySet.current = false;
    }
  }, [data, isNewSlip, editingSlipId, selectedSlipId]);

  useEffect(() => {
    form.setFieldsValue({
      makeDept: formData.makeDept || user?.deptCode || "",
      makeDeptName: formData.deptName || "",
      userCode: formData.userId || user?.empCode || "",
      userName: formData.makerName || user?.empName || "",
      slipName: formData.slipName || "대체전표",
      slipExptnName: formData.slipExptnName || "",
      glSlipNo: formData.glSlipNo || "",
      exptnTgt: formData.exptnTgt || "N",
      edimStatusName: formData.edimStatusName || "",
      creationDate: formData.creationDate || "",
      reverseNo: formData.reverseNo || "",
      description: formData.description || "",
      closed: formData.closed || "",
      lastUpdateDate: formData.lastUpdateDate || "",
    });
  }, [form, formData, user]);

  // forceEditMode가 true로 변경되면 편집 모드로 전환
  useEffect(() => {
    if (forceEditMode) {
      isEditModeManuallySet.current = true; // 수동으로 편집 모드 설정 표시
    }
  }, [forceEditMode]);

  // 수정 버튼 클릭: 현재 데이터를 로드하고 편집 모드로 전환
  const handleEditClick = () => {
    if (data?.id && onEditClick) {
      onEditClick(data.id); // 부모에게 편집 시작 알림
    }
    if (data) {
      setFormData(data);
      isEditModeManuallySet.current = true; // 수동으로 편집 모드 설정 표시
    }
  };

  // 입력 버튼 클릭: 데이터를 리셋하고 편집 모드로 전환
  const handleInputClick = () => {
    const today = dayjs().format("YYYY-MM-DD");
    setFormData({
      makeDept: user?.deptCode || "",
      deptName: formData.deptName || "",
      userId: user?.empCode || "",
      makerName: user?.empName || "",
      slipName: "대체전표",
      slipExptnName: "대체전표",
      srcTblName: "",
      sourceKey: "",
      glSlipNo: "",
      exptnTgt: "N",
      edimStatusName: "",
      creationDate: today,
      lastUpdateDate: today,
      description: "",
      closed: "",
      reverseNo: "",
    });
    isEditModeManuallySet.current = true; // 수동으로 편집 모드 설정 표시
    if (onInput) {
      onInput();
    }
  };

  // 저장 버튼 클릭: 편집 모드 종료
  const handleSaveClick = async () => {
    if (onSave) {
      try {
        const result = await onSave();
        // 저장이 성공적으로 완료된 경우에만 편집 모드 해제
        // Modal.confirm에서 취소를 누르면 false를 반환
        if (result === true) {
          isEditModeManuallySet.current = false; // 수동 편집 모드 플래그 리셋
          if (onModify) {
            onModify(false);
          }
        }
        // 취소를 누른 경우 (result === false) 편집 모드 유지
      } catch (error) {
        // 에러 발생 시에도 편집 모드 유지
        console.error("저장 중 오류:", error);
      }
    }
  };

  // 입력값 변경 핸들러
  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = {
        ...prev,
        [field]: value,
      };
      // 사용자 입력 변경 시 즉시 부모에게 알림
      if (onDataChange) {
        onDataChange(newData);
      }
      return newData;
    });
    if (onModify) {
      onModify(true);
    }
  };

  const readOnlyInputStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "#f5f5f5",
    cursor: "not-allowed",
  };

  const handleGlSlipNoClick = () => {
    if (isInEditMode && onExitEditMode && !isNewSlip) {
      onExitEditMode();
    }
  };

  return (
    <DetailViewStyles className={className}>
      <div className="detail-view__actions">
        <div className="detail-view__actions-group detail-view__actions-group--left">
          <span className="detail-view__department">경영관리본부</span>
          <div className="detail-view__divider"></div>
          <span className="detail-view__user">관리자</span>
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
          </div>
        </div>
        <div className="detail-view__actions-group  detail-view__actions-group--right">
          <FormButton size={"small"} className="detail-view__button">
            결제상신
          </FormButton>
          <FormButton size={"small"} className="detail-view__button" onClick={onCopy}>
            복사
          </FormButton>
          <div className="detail-view__more-container">
            <Tooltip title="더보기">
              <FormButton
                icon={<i className="ri-more-2-line" style={{ fontSize: 16 }} />}
                size="small"
                className="detail-view__button detail-view__button--more"
                onClick={() => setShowMoreActions(!showMoreActions)}
              />
            </Tooltip>
            {showMoreActions && (
              <div className="detail-view__more-menu">
                <FormButton size={"small"} className="detail-view__button">
                  역분개
                </FormButton>
                <FormButton size={"small"} className="detail-view__button" onClick={onCancelConfm}>
                  승인취소
                </FormButton>
              </div>
            )}
          </div>
          <div className="detail-view__divider"></div>
          <FormButton
            size={"small"}
            className="detail-view__button detail-view__button--edit"
            onClick={handleEditClick}
          >
            수정
          </FormButton>
          <FormButton
            size={"small"}
            className="detail-view__button detail-view__button--input"
            onClick={handleInputClick}
          >
            입력
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
            className="detail-view__button detail-view__button--save"
            onClick={handleSaveClick}
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
      <Form form={form} className="detail-view__form">
        <div className="detail-view__table">
          <table>
          <tbody>
            <tr>
              <th>작성부서</th>
              <td>
                <div className="detail-view__inputs-inline">
                  <FormInput
                    name="makeDept"
                    label=""
                    readOnly
                    placeholder="부서코드"
                    className="detail-view__input"
                    style={readOnlyInputStyle}
                  />
                  <span>-</span>
                  <FormInput
                    name="makeDeptName"
                    label=""
                    readOnly
                    placeholder="부서명"
                    className="detail-view__input"
                    style={readOnlyInputStyle}
                  />
                </div>
              </td>
              <th>작성자</th>
              <td>
                <div className="detail-view__inputs-inline">
                  <FormInput
                    name="userCode"
                    label=""
                    readOnly
                    placeholder="사용자코드"
                    className="detail-view__input"
                    style={readOnlyInputStyle}
                  />
                  <span>-</span>
                  <FormInput
                    name="userName"
                    label=""
                    readOnly
                    placeholder="사용자명"
                    className="detail-view__input"
                    style={readOnlyInputStyle}
                  />
                </div>
              </td>
              <th>전표유형</th>
              <td>
                <FormInput
                  name="slipName"
                  label=""
                  readOnly
                  className="detail-view__input"
                  style={readOnlyInputStyle}
                />
              </td>
              <th>원천</th>
              <td>
                <FormInput
                  name="slipExptnName"
                  label=""
                  readOnly
                  className="detail-view__input"
                  style={readOnlyInputStyle}
                />
              </td>
            </tr>
            <tr>
              <th>전표번호</th>
              <td>
                <div
                  className={`detail-view__gl-slip ${isInEditMode ? "detail-view__gl-slip--active" : ""}`}
                  onClick={handleGlSlipNoClick}
                >
                  <FormInput
                    name="glSlipNo"
                    label=""
                    readOnly
                    className="detail-view__input"
                    style={readOnlyInputStyle}
                  />
                </div>
              </td>
              <th>전기</th>
              <td>
                <FormInput
                  name="exptnTgt"
                  label=""
                  readOnly
                  className="detail-view__input"
                  style={readOnlyInputStyle}
                />
              </td>
              <th>전자결재</th>
              <td>
                <FormInput
                  name="edimStatusName"
                  label=""
                  readOnly
                  className="detail-view__input"
                  style={readOnlyInputStyle}
                />
              </td>
              <th>작성일시</th>
              <td>
                <FormInput
                  name="creationDate"
                  label=""
                  readOnly
                  className="detail-view__input"
                  style={readOnlyInputStyle}
                />
              </td>
            </tr>
            <tr>
              <th>Reverse No.</th>
              <td>
                <FormInput
                  name="reverseNo"
                  label=""
                  readOnly={!isInEditMode}
                  className="detail-view__input"
                  style={readOnlyInputStyle}
                />
              </td>
              <th>
                {isInEditMode && <span style={{ color: "#ff4d4f", marginRight: "4px" }}>*</span>}
                대표적요
              </th>
              <td>
                <div className="detail-view__description-expand">
                  <FormInput
                    name="description"
                    label=""
                    readOnly={!isInEditMode}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      handleInputChange("description", e.target.value)
                    }
                    className={`detail-view__input detail-view__input--description ${
                      !isInEditMode ? "detail-view__input--readonly-accent" : ""
                    }`}
                  />
                </div>
              </td>
              <th>Closed</th>
              <td>
                <FormInput
                  name="closed"
                  label=""
                  readOnly={!isInEditMode}
                  className="detail-view__input"
                  style={readOnlyInputStyle}
                />
              </td>
              <th>최종수정일시</th>
              <td>
                <FormInput
                  name="lastUpdateDate"
                  label=""
                  readOnly={!isInEditMode}
                  className="detail-view__input"
                  style={readOnlyInputStyle}
                />
              </td>
            </tr>
          </tbody>
          </table>
        </div>
      </Form>
    </DetailViewStyles>
  );
};

export default DetailView;
