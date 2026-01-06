import { useState, useCallback, useMemo, useEffect } from "react";
import { getFileListApi, createEatKeyApi } from "@apis/system/file/fileApi";
import { showError } from "@components/ui/feedback";
import { getDefaultFilePath } from "@utils/fileUtils";

/**
 * eatKey 변환 유틸리티 함수
 * @param eatKey - 파일 그룹 키 (number 또는 string)
 * @returns 변환된 숫자 또는 undefined
 */
export const parseEatKey = (eatKey?: number | string): number | undefined => {
  if (!eatKey) return undefined;
  const key = typeof eatKey === "string" ? parseInt(eatKey, 10) : eatKey;
  return isNaN(key) ? undefined : key;
};

export interface UseAttachmentOptions {
  /** 파일 그룹 키 (eatKey) */
  eatKey?: number | string;
  /** 파일 그룹 키 경로 (기본값: getDefaultFilePath()) */
  eatPath?: string;
  /** 파일 목록 자동 로드 여부 (기본값: true) */
  autoLoad?: boolean;
  /** 파일 개수 업데이트 콜백 */
  onCountChange?: (count: number) => void;
  /** Drawer 닫힐 때 생성된 eatKey를 리턴하는 콜백 */
  onClose?: (eatKey?: number) => void;
}

export interface UseAttachmentReturn {
  /** Drawer 열림 상태 */
  drawerOpen: boolean;
  /** Drawer 열기 */
  openDrawer: () => Promise<void>;
  /** Drawer 닫기 */
  closeDrawer: () => void;
  /** 파일 개수 */
  attachmentCount: number;
  /** 파일 개수 새로고침 */
  refreshCount: () => Promise<void>;
  /** DataForm의 onLeftAction 핸들러 */
  handleLeftAction: (actionType: string) => void;
  /** 실제 사용할 eatKey (외부 제공 또는 내부 생성) */
  actualEatKey: number | undefined;
  /** 실제 사용할 eatPath (외부 제공 또는 내부 생성) */
  actualEatPath: string | undefined;
  /** AttachmentDrawer에 전달할 props */
  drawerProps: {
    open: boolean;
    onClose: () => void;
    /** 파일 그룹 키 (eatKey) */
    eatKey?: number | string;
    onUploadSuccess: () => Promise<void>;
    onDeleteSuccess: () => Promise<void>;
  };
}

/**
 * 첨부파일 관리를 위한 커스텀 훅
 * DataForm과 AttachmentDrawer 간의 연동을 간소화합니다.
 * eatKey 자동 생성 기능을 지원합니다.
 */
export function useAttachment(
  options: UseAttachmentOptions = {}
): UseAttachmentReturn {
  const {
    eatKey: externalEatKey,
    eatPath: externalEatPath,
    autoLoad = true,
    onCountChange,
    onClose: onCloseCallback,
  } = options;

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [attachmentCount, setAttachmentCount] = useState(0);
  const [internalEatKey, setInternalEatKey] = useState<number | undefined>(() =>
    parseEatKey(externalEatKey)
  );

  // 실제 사용할 eatKey (외부에서 제공되면 그것을, 없으면 내부에서 생성)
  const actualEatKey = useMemo(() => {
    return parseEatKey(externalEatKey) ?? internalEatKey;
  }, [externalEatKey, internalEatKey]);

  // 실제 사용할 eatPath (외부에서 제공되면 그것을, 없으면 기본값 사용)
  const actualEatPath = useMemo(() => {
    return externalEatPath ?? getDefaultFilePath();
  }, [externalEatPath]);

  // 파일 그룹 키(eatKey) 검증 및 숫자 변환
  const numericEatKey = useMemo(() => {
    return actualEatKey;
  }, [actualEatKey]);

  // 파일 개수 조회 (파일 그룹 키(eatKey) 기반)
  const refreshCount = useCallback(async () => {
    if (!numericEatKey || !autoLoad) return;

    try {
      const response = await getFileListApi(numericEatKey);
      if (response.success && response.data) {
        const count = response.data.length;
        setAttachmentCount(count);
        onCountChange?.(count);
      } else {
        setAttachmentCount(0);
        onCountChange?.(0);
      }
    } catch (error) {
      console.error("파일 개수 조회 실패:", error);
      setAttachmentCount(0);
      onCountChange?.(0);
    }
  }, [numericEatKey, autoLoad, onCountChange]);

  // Drawer 열기 (eatKey가 없으면 자동 생성)
  const openDrawer = useCallback(async () => {
    if (actualEatKey) {
      setDrawerOpen(true);
      return;
    }

    // eatKey가 없으면 자동 생성
    try {
      const response = await createEatKeyApi(actualEatPath);

      if (response.success && response.data) {
        setInternalEatKey(response.data);
        // 상태 업데이트 후 Drawer 열기
        setTimeout(() => {
          setDrawerOpen(true);
        }, 0);
      } else {
        showError("파일 그룹 키 생성에 실패했습니다.");
      }
    } catch (error) {
      console.error("eatKey 생성 실패:", error);
      showError("파일 그룹 키 생성에 실패했습니다.");
    }
  }, [actualEatKey, actualEatPath]);

  // Drawer 닫기
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    // 생성된 eatKey가 있으면 리턴
    if (internalEatKey && !externalEatKey) {
      onCloseCallback?.(internalEatKey);
    }
  }, [internalEatKey, externalEatKey, onCloseCallback]);

  // DataForm의 onLeftAction 핸들러
  const handleLeftAction = useCallback(
    (actionType: string) => {
      if (actionType === "attachment") {
        openDrawer();
      }
    },
    [openDrawer]
  );

  // 파일 업로드/삭제 성공 시 개수 새로고침
  const handleUploadSuccess = useCallback(async () => {
    await refreshCount();
  }, [refreshCount]);

  const handleDeleteSuccess = useCallback(async () => {
    await refreshCount();
  }, [refreshCount]);

  // 파일 그룹 키(eatKey) 변경 시 파일 개수 자동 조회
  useEffect(() => {
    if (numericEatKey && autoLoad) {
      refreshCount();
    } else {
      setAttachmentCount(0);
    }
  }, [numericEatKey, autoLoad, refreshCount]);

  // AttachmentDrawer props
  const drawerProps = useMemo(
    () => ({
      open: drawerOpen,
      onClose: closeDrawer,
      eatKey: actualEatKey,
      onUploadSuccess: handleUploadSuccess,
      onDeleteSuccess: handleDeleteSuccess,
    }),
    [
      drawerOpen,
      closeDrawer,
      actualEatKey,
      handleUploadSuccess,
      handleDeleteSuccess,
    ]
  );

  return {
    drawerOpen,
    openDrawer,
    closeDrawer,
    attachmentCount,
    refreshCount,
    handleLeftAction,
    actualEatKey,
    actualEatPath,
    drawerProps,
  };
}
