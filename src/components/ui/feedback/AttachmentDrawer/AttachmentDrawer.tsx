import React, {
  useState,
  useMemo,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { Drawer, Modal, Space, Spin } from "antd";
import { FormButton, FormCheckbox } from "@components/ui/form";
import { formatBytes, getFileExtension } from "@utils/fileUtils";
import {
  getFileListApi,
  deleteFileApi,
  downloadFileApi,
  downloadAllFilesApi,
  uploadFilesBatchApi,
  type FileUploadRequest,
} from "@apis/system/file/fileApi";
import type { FileItem } from "@apis/system/file/fileApi";
import { showError, showSuccess } from "@components/ui/feedback";
import {
  AttachmentDrawerContainer,
  AttachmentHeader,
  AttachmentList,
  AttachmentItem,
  AttachmentItemHeader,
  AttachmentItemIcon,
  AttachmentItemInfo,
  AttachmentItemActions,
  AttachmentItemCheckbox,
  AttachmentFooter,
  FileName,
  FileMeta,
  LoadingContainer,
  FileInput,
  PendingFileList,
  PendingFileItem,
  PendingFileCountContainer,
  PendingFileCountTag,
  PendingFileDeleteLabel,
  EmptyFileMessage,
  LoadingText,
  modalStyle,
  modalBodyStyle,
} from "./AttachmentDrawer.styles";

// 상수 분리
const FILE_ICON_MAP: Record<string, string> = {
  pdf: "ri-file-pdf-line",
  xls: "ri-file-excel-line",
  xlsx: "ri-file-excel-line",
  doc: "ri-file-word-line",
  docx: "ri-file-word-line",
  ppt: "ri-file-ppt-line",
  pptx: "ri-file-ppt-line",
  jpg: "ri-image-line",
  jpeg: "ri-image-line",
  png: "ri-image-line",
  gif: "ri-image-line",
};

const DEFAULT_FILE_ICON = "ri-file-line";

// eatKey 변환 유틸리티 함수
const parseEatKey = (eatKey?: number | string): number | null => {
  if (!eatKey) return null;
  const key = typeof eatKey === "string" ? parseInt(eatKey, 10) : eatKey;
  return isNaN(key) ? null : key;
};

export interface AttachmentFile {
  /** 파일 고유 ID (eatIdx) */
  id: string;
  /** 파일명 */
  name: string;
  /** 파일 타입 (확장자) */
  type?: string;
  /** 파일 크기 (bytes) */
  size?: number;
  /** 원본 (origin) */
  origin?: string;
  /** 파일 그룹 키 (eatKey) */
  eatKey?: number;
  /** eatIdx (파일 인덱스) */
  eatIdx?: string;
}

/** 선택된 파일 정보 (업로드 전) */
export interface PendingFile {
  /** 임시 ID */
  id: string;
  /** 파일 객체 (업로드용, 삭제 시에는 없음) */
  file?: File;
  /** 파일명 */
  name: string;
  /** 파일 크기 */
  size?: number;
  /** 파일 타입 */
  type?: string;
  /** 액션 타입: 'upload' | 'delete' */
  action: "upload" | "delete";
  /** 파일 그룹 키 (eatKey) - 삭제 시 필수 */
  eatKey?: number;
  /** eatIdx (파일 인덱스) - 삭제 시 필수 */
  eatIdx?: string;
}

export interface AttachmentDrawerProps {
  /** Drawer 열림 상태 */
  open: boolean;
  /** Drawer 닫기 핸들러 */
  onClose: () => void;
  /** 표시 방식: 'drawer' | 'modal' | 'inline' (기본값: 'drawer') */
  /** 'inline' 모드는 Modal이나 다른 컨테이너 안에서 직접 사용할 때 */
  variant?: "drawer" | "modal" | "inline";
  /** 파일 그룹 키 (eatKey) */
  eatKey?: number | string;
  /** 파일 목록 (파일 그룹 키(eatKey)가 없을 때 직접 전달) */
  files?: AttachmentFile[];
  /** 파일 업로드 핸들러 (제공 시 외부에서 처리, 없으면 내부에서 처리) */
  onUpload?: () => void;
  /** 파일 저장 실패 시 콜백 (롤백용) */
  onSaveError?: (files: PendingFile[], error: unknown) => void;
  /** 파일 선택 시 콜백 (수동 모드 시) */
  onFilesSelected?: (files: PendingFile[]) => void;
  /** 외부에서 관리하는 대기 파일 목록 (수동 모드 시 동기화용) */
  externalPendingFiles?: PendingFile[];
  /** 대기 파일 목록 변경 콜백 */
  onPendingFilesChange?: (files: PendingFile[]) => void;
  /** 파일 업로드 요청 파라미터 (내부 업로드 시 사용) */
  uploadRequest?: Omit<FileUploadRequest, "eatKey">;
  /** 파일 업로드 후 콜백 */
  onUploadSuccess?: () => void;
  /** 파일 삭제 후 콜백 */
  onDeleteSuccess?: () => void;
  /** Drawer 너비 (기본값: 400) */
  width?: number | string;
  /** 제목 (기본값: "첨부파일") */
  title?: string;
  /** 제목에 파일 개수 표시 여부 (기본값: true) */
  showCountInTitle?: boolean;
  /** 파일 업로드 버튼 텍스트 (기본값: "파일첨부") */
  uploadButtonText?: string;
  /** 파일 저장 버튼 텍스트 (기본값: "저장") */
  saveButtonText?: string;
  /** 전체 다운로드 버튼 텍스트 (기본값: "전체 다운로드") */
  downloadAllButtonText?: string;
  /** 파일 삭제 가능 여부 (기본값: true) */
  deletable?: boolean;
  /** 파일 다운로드 가능 여부 (기본값: true) */
  downloadable?: boolean;
  /** 파일 업로드 가능 여부 (기본값: true) */
  uploadable?: boolean;
  /** 파일 목록 자동 로드 여부 (기본값: true) */
  autoLoad?: boolean;
  /** 다중 파일 업로드 가능 여부 (기본값: true) */
  multiple?: boolean;
  /** 자동 업로드 여부 (기본값: false - 수동 모드) */
  autoUpload?: boolean;
}

// FileItem을 AttachmentFile로 변환
const convertFileItem = (item: FileItem, eatKey?: number): AttachmentFile => {
  const fileName = item.fileName || item.name || "";
  const extension = getFileExtension(fileName);

  // eatKey 우선순위: 파라미터 > item.eatKey > item.fileSeq > item.dataSeq
  const finalEatKey =
    eatKey ?? item.eatKey ?? item.fileSeq ?? item.dataSeq ?? undefined;

  // eatIdx 우선순위: item.eatIdx > item.uid (uid가 eatIdx 역할을 할 수 있음)
  const finalEatIdx = item.eatIdx || item.uid || "";
  if (!finalEatIdx) {
    console.warn("파일 eatIdx와 uid가 모두 없습니다:", item);
  }

  return {
    id: finalEatIdx || `file-${Date.now()}`,
    name: fileName,
    type: extension,
    size: item.fileSize,
    origin: item.remotePath,
    eatKey: finalEatKey,
    eatIdx: finalEatIdx,
  };
};

const AttachmentDrawer: React.FC<AttachmentDrawerProps> = ({
  open,
  onClose,
  variant = "drawer",
  eatKey,
  files: externalFiles,
  onUpload: externalOnUpload,
  onSaveError,
  onFilesSelected,
  externalPendingFiles,
  onPendingFilesChange,
  uploadRequest,
  onUploadSuccess,
  onDeleteSuccess,
  width = 400,
  title = "첨부파일",
  showCountInTitle = true,
  uploadButtonText = "파일첨부",
  saveButtonText = "저장",
  downloadAllButtonText = "전체 다운로드",
  deletable = true,
  downloadable = true,
  uploadable = true,
  autoLoad = true,
  multiple = true,
  autoUpload = false, // 기본값: 수동 모드
}) => {
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(
    new Set()
  );
  const [files, setFiles] = useState<AttachmentFile[]>([]);
  // 내부 pendingFiles 상태 (외부에서 관리하지 않는 경우에만 사용)
  const [internalPendingFiles, setInternalPendingFiles] = useState<
    PendingFile[]
  >([]);
  const [isDragging, setIsDragging] = useState(false);

  // 외부에서 관리하는 경우 외부 값 사용, 없으면 내부 상태 사용
  const pendingFiles = externalPendingFiles ?? internalPendingFiles;

  // pendingFiles 업데이트 함수 (외부에서 관리하면 외부 콜백 호출, 없으면 내부 상태 업데이트)
  const setPendingFiles = useCallback(
    (
      filesOrUpdater: PendingFile[] | ((prev: PendingFile[]) => PendingFile[])
    ) => {
      if (onPendingFilesChange) {
        // 외부에서 관리하는 경우
        if (typeof filesOrUpdater === "function") {
          const current = externalPendingFiles ?? [];
          onPendingFilesChange(filesOrUpdater(current));
        } else {
          onPendingFilesChange(filesOrUpdater);
        }
      } else {
        // 내부에서 관리하는 경우
        if (typeof filesOrUpdater === "function") {
          setInternalPendingFiles(filesOrUpdater);
        } else {
          setInternalPendingFiles(filesOrUpdater);
        }
      }
    },
    [externalPendingFiles, onPendingFilesChange]
  );
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingFileIdCounterRef = useRef(0);

  // eatKey 검증 및 숫자 변환
  const numericEatKey = useMemo(() => parseEatKey(eatKey), [eatKey]);

  // 삭제 대기 파일 ID Set (메모이제이션)
  const deletePendingIds = useMemo(
    () =>
      new Set(
        pendingFiles.filter((p) => p.action === "delete").map((p) => p.id)
      ),
    [pendingFiles]
  );

  // 파일 목록 로드
  const loadFiles = useCallback(
    async (forceLoad = false) => {
      // forceLoad가 true이면 autoLoad 체크 무시
      if (!numericEatKey || (!autoLoad && !forceLoad)) return;

      setLoading(true);
      try {
        const response = await getFileListApi(numericEatKey);

        if (response.success && response.data) {
          const convertedFiles = response.data
            .map((item) => convertFileItem(item, numericEatKey))
            .filter((file) => file.eatKey && file.eatIdx);

          // 삭제 대기 파일들을 제외 (Drawer를 닫았다가 다시 열어도 삭제 대기 파일은 표시하지 않음)
          const filteredFiles = convertedFiles.filter(
            (file) => !deletePendingIds.has(file.id)
          );

          setFiles(filteredFiles);
        } else {
          setFiles([]);
        }
      } catch (error) {
        console.error("파일 목록 로드 실패:", error);
        showError("파일 목록을 불러오는데 실패했습니다.");
        setFiles([]);
      } finally {
        setLoading(false);
      }
    },
    [numericEatKey, autoLoad, deletePendingIds]
  );

  // Drawer가 열릴 때 파일 목록 로드
  const isInitialMountRef = useRef(true);

  useEffect(() => {
    if (!open) {
      isInitialMountRef.current = true;
      return;
    }

    // Drawer가 처음 열릴 때만 파일 목록 초기화
    if (isInitialMountRef.current) {
      if (eatKey) {
        // Drawer가 열릴 때는 항상 최신 목록을 가져옴 (autoLoad와 무관)
        loadFiles(true);
      } else if (externalFiles) {
        // externalFiles도 eatKey와 eatIdx가 있는지 검증
        const validFiles = externalFiles.filter(
          (file) => file.eatKey && file.eatIdx
        );
        // 삭제 대기 파일들을 제외
        const filteredFiles = validFiles.filter(
          (file) => !deletePendingIds.has(file.id)
        );
        setFiles(filteredFiles);
      }
      // externalFiles가 없고 eatKey도 없으면 files 상태는 유지 (삭제 등의 작업 결과 보존)

      // 외부에서 관리하지 않는 경우에만 대기 파일 목록 초기화
      if (!externalPendingFiles) {
        setInternalPendingFiles([]);
      }

      isInitialMountRef.current = false;
    }
    // Drawer가 열릴 때 삭제 대기 파일 목록은 유지 (수동 모드에서 저장 전까지 유지)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // 파일 타입별 아이콘 반환 (remixicon 사용)
  const getFileIcon = useCallback((fileName: string) => {
    const extension = getFileExtension(fileName).toLowerCase();
    const iconClass = FILE_ICON_MAP[extension] || DEFAULT_FILE_ICON;
    return <i className={iconClass} />;
  }, []);

  // 파일을 PendingFile로 변환 (업로드용)
  const convertToPendingFile = useCallback((file: File): PendingFile => {
    pendingFileIdCounterRef.current += 1;
    return {
      id: `pending-${Date.now()}-${pendingFileIdCounterRef.current}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      type: getFileExtension(file.name),
      action: "upload",
    };
  }, []);

  // AttachmentFile을 PendingFile로 변환 (삭제용)
  const convertToPendingDeleteFile = useCallback(
    (file: AttachmentFile): PendingFile => {
      return {
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        action: "delete",
        eatKey: file.eatKey,
        eatIdx: file.eatIdx,
      };
    },
    []
  );

  // 파일 선택만 처리 (자동/수동 모드 공통)
  const handleManualFileSelect = useCallback(
    (selectedFiles: FileList | null) => {
      if (!selectedFiles || selectedFiles.length === 0) return;

      const newPendingFiles = Array.from(selectedFiles).map((file) =>
        convertToPendingFile(file)
      );

      setPendingFiles((prev) => [...prev, ...newPendingFiles]);
      onFilesSelected?.(newPendingFiles);
    },
    [convertToPendingFile, onFilesSelected, setPendingFiles]
  );

  // 파일 선택 버튼 클릭
  const handleUploadButtonClick = useCallback(() => {
    if (externalOnUpload) {
      externalOnUpload();
      return;
    }

    // 파일 입력 클릭
    fileInputRef.current?.click();
  }, [externalOnUpload]);

  // 파일 선택 변경
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleManualFileSelect(e.target.files);
      // 파일 입력 초기화 (같은 파일 다시 선택 가능하도록)
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [handleManualFileSelect]
  );

  // 드래그 오버 핸들러
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging && uploadable) {
      setIsDragging(true);
    }
  }, [isDragging, uploadable]);

  // 드래그 리브 핸들러
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // 현재 타겟에서 벗어났지만 자식 요소로 이동한 경우는 무시
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  // 드롭 핸들러
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (!uploadable) return;

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles && droppedFiles.length > 0) {
        handleManualFileSelect(droppedFiles);
      }
    },
    [uploadable, handleManualFileSelect]
  );

  // 대기 파일 제거 (업로드/삭제 공통)
  const handleRemovePendingFile = useCallback(
    (fileId: string) => {
      setPendingFiles((prev) => {
        const fileToRemove = prev.find((file) => file.id === fileId);
        // 삭제 대기 파일인 경우 원래 파일 목록으로 복원
        if (fileToRemove && fileToRemove.action === "delete") {
          const restoredFile: AttachmentFile = {
            id: fileToRemove.id,
            name: fileToRemove.name,
            type: fileToRemove.type,
            size: fileToRemove.size,
            eatKey: fileToRemove.eatKey,
            eatIdx: fileToRemove.eatIdx,
          };
          // 다음 렌더링 사이클에서 파일 목록 복원
          setFiles((currentFiles) => {
            // 이미 존재하는지 확인
            const exists = currentFiles.some((f) => f.id === fileToRemove.id);
            if (!exists) {
              return [...currentFiles, restoredFile];
            }
            return currentFiles;
          });
        }
        return prev.filter((file) => file.id !== fileId);
      });
    },
    [setPendingFiles, setFiles]
  );

  // 전체 선택/해제
  const allSelected = useMemo(
    () => files.length > 0 && selectedFileIds.size === files.length,
    [files.length, selectedFileIds.size]
  );

  // 불확정(indeterminate) 상태 계산
  const isIndeterminate = useMemo(
    () => selectedFileIds.size > 0 && selectedFileIds.size < files.length,
    [selectedFileIds.size, files.length]
  );

  const handleSelectAll = useCallback(
    (checked: boolean) => {
      if (checked) {
        setSelectedFileIds(new Set(files.map((file) => file.id)));
      } else {
        setSelectedFileIds(new Set());
      }
    },
    [files]
  );

  // 개별 파일 선택/해제
  const handleSelectFile = useCallback((fileId: string, checked: boolean) => {
    setSelectedFileIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(fileId);
      } else {
        newSet.delete(fileId);
      }
      return newSet;
    });
  }, []);

  // 선택된 파일 삭제 (삭제는 항상 수동 모드 - 저장 버튼으로 처리)
  const handleDelete = useCallback(() => {
    if (selectedFileIds.size === 0) return;

    setFiles((prevFiles) => {
      const filesToDelete = prevFiles.filter((file) =>
        selectedFileIds.has(file.id)
      );
      if (filesToDelete.length === 0) return prevFiles;

      // 삭제는 항상 수동 모드: 삭제 대기 리스트에 추가 (pendingFiles에 통합)
      setPendingFiles((prev) => {
        const existingIds = new Set(prev.map((p) => p.id));
        const newFiles = filesToDelete
          .map((file) => convertToPendingDeleteFile(file))
          .filter((p) => !existingIds.has(p.id));
        return newFiles.length > 0 ? [...prev, ...newFiles] : prev;
      });

      // 파일 목록에서 제거
      return prevFiles.filter((file) => !selectedFileIds.has(file.id));
    });
    // 선택 해제
    setSelectedFileIds(new Set());
  }, [selectedFileIds, convertToPendingDeleteFile, setPendingFiles]);

  // 개별 파일 삭제 (삭제는 항상 수동 모드 - 저장 버튼으로 처리)
  const handleDeleteSingle = useCallback(
    (file: AttachmentFile) => {
      // 삭제는 항상 수동 모드: 삭제 대기 리스트에 추가 (pendingFiles에 통합)
      const deletePendingFile = convertToPendingDeleteFile(file);
      setPendingFiles((prev) => {
        if (prev.some((p) => p.id === deletePendingFile.id)) {
          return prev; // 이미 추가된 파일은 무시
        }
        return [...prev, deletePendingFile];
      });
      // 파일 목록에서 제거
      setFiles((prev) => prev.filter((f) => f.id !== file.id));
    },
    [convertToPendingDeleteFile, setPendingFiles]
  );

  // 개별 파일 다운로드
  const handleDownload = useCallback(async (file: AttachmentFile) => {
    if (!file.eatKey || !file.eatIdx) {
      showError("파일 정보가 없습니다.");
      return;
    }

    try {
      await downloadFileApi(file.eatKey, file.eatIdx, file.name);
    } catch (error) {
      console.error("파일 다운로드 실패:", error);
      showError("파일 다운로드에 실패했습니다.");
    }
  }, []);

  // 전체 다운로드 (ZIP)
  const handleDownloadAll = useCallback(async () => {
    if (files.length === 0) return;

    const eatKey = files[0]?.eatKey;
    if (!eatKey) {
      showError("파일 정보가 없습니다.");
      return;
    }

    try {
      await downloadAllFilesApi(eatKey);
      showSuccess("파일들을 ZIP으로 다운로드했습니다.");
    } catch (error) {
      console.error("전체 다운로드 실패:", error);
      showError("파일 다운로드에 실패했습니다.");
    }
  }, [files]);

  // Drawer 닫을 때 선택 초기화 (pendingFiles는 외부에서 관리하므로 유지)
  const handleClose = useCallback(() => {
    setSelectedFileIds(new Set());
    // pendingFiles는 외부에서 관리하므로 초기화하지 않음
    onClose();
  }, [onClose]);

  const drawerTitle = useMemo(
    () => (showCountInTitle ? `${title} ${files.length}` : title),
    [showCountInTitle, title, files.length]
  );

  // 저장 핸들러 (자동 모드에서 저장 버튼을 클릭했을 때 - 내부에서 처리)
  const handleSave = useCallback(async () => {
    if (pendingFiles.length === 0) {
      showError("저장할 파일이 없습니다.");
      return;
    }

    if (!numericEatKey) {
      showError("유효하지 않은 파일 키입니다.");
      return;
    }

    setSaving(true);
    const currentPendingFiles = [...pendingFiles]; // 스냅샷 저장

    try {
      // 업로드 대기 파일과 삭제 대기 파일 분리
      const uploadFiles = currentPendingFiles.filter(
        (f) => f.action === "upload" && f.file
      );
      const filesToDelete = currentPendingFiles.filter(
        (f) => f.action === "delete" && f.eatKey && f.eatIdx
      );

      // 1. 파일 업로드 처리 (배치 업로드)
      let uploadSuccessCount = 0;
      let uploadFailCount = 0;

      if (uploadFiles.length > 0) {
        const filesToUpload = uploadFiles.map(
          (pendingFile) => pendingFile.file!
        );

        try {
          // 여러 파일을 하나의 요청으로 묶어서 업로드
          const response = await uploadFilesBatchApi(filesToUpload, {
            eatKey: numericEatKey,
            ...uploadRequest,
          });

          if (response.success && response.data) {
            uploadSuccessCount = response.data.length;
            // 업로드된 파일 수와 요청한 파일 수가 다를 수 있음
            if (uploadSuccessCount < filesToUpload.length) {
              uploadFailCount = filesToUpload.length - uploadSuccessCount;
              if (import.meta.env.DEV) {
                console.warn(
                  `일부 파일 업로드 실패: ${uploadSuccessCount}/${filesToUpload.length}개 성공`
                );
              }
            }
          } else {
            uploadFailCount = filesToUpload.length;
            if (import.meta.env.DEV) {
              console.error("파일 배치 업로드 실패:", response);
            }
          }
        } catch (error) {
          uploadFailCount = filesToUpload.length;
          if (import.meta.env.DEV) {
            console.error("파일 배치 업로드 중 오류:", error);
          }
        }
      }

      // 2. 파일 삭제 처리
      let deleteSuccessCount = 0;
      let deleteFailCount = 0;

      if (filesToDelete.length > 0) {
        const deleteResults = await Promise.allSettled(
          filesToDelete.map((pendingFile) =>
            deleteFileApi(pendingFile.eatKey!, pendingFile.eatIdx!)
          )
        );

        deleteSuccessCount = deleteResults.filter(
          (r) => r.status === "fulfilled"
        ).length;
        deleteFailCount = deleteResults.filter(
          (r) => r.status === "rejected"
        ).length;

        // 실패한 파일 로깅 (개발 모드에서만)
        if (import.meta.env.DEV && deleteFailCount > 0) {
          deleteResults.forEach((result, index) => {
            if (result.status === "rejected") {
              console.error(
                `파일 삭제 실패: ${filesToDelete[index].name}`,
                result.reason
              );
            }
          });
        }
      }

      // 3. 결과 처리
      const totalSuccess = uploadSuccessCount + deleteSuccessCount;
      const totalFail = uploadFailCount + deleteFailCount;

      if (totalSuccess > 0) {
        const messages: string[] = [];
        if (uploadSuccessCount > 0) {
          messages.push(`${uploadSuccessCount}개의 파일이 업로드되었습니다.`);
        }
        if (deleteSuccessCount > 0) {
          messages.push(`${deleteSuccessCount}개의 파일이 삭제되었습니다.`);
        }
        showSuccess(messages.join(" "));

        // 대기 목록 초기화
        setPendingFiles([]);

        // 목록 새로고침
        if (numericEatKey) {
          await loadFiles(true);
        }

        onUploadSuccess?.();
        onDeleteSuccess?.();
      }

      if (totalFail > 0) {
        const messages: string[] = [];
        if (uploadFailCount > 0) {
          messages.push(`${uploadFailCount}개의 파일 업로드에 실패했습니다.`);
        }
        if (deleteFailCount > 0) {
          messages.push(`${deleteFailCount}개의 파일 삭제에 실패했습니다.`);
        }
        showError(messages.join(" "));

        if (uploadFailCount > 0) {
          const uploadPendingFiles = currentPendingFiles.filter(
            (f) => f.action === "upload"
          );
          onSaveError?.(
            uploadPendingFiles,
            new Error(`${uploadFailCount}개 파일 업로드 실패`)
          );
        }
      }
    } catch (error) {
      console.error("파일 저장 중 오류:", error);
      const uploadPendingFiles = currentPendingFiles.filter(
        (f) => f.action === "upload"
      );
      onSaveError?.(uploadPendingFiles, error);
      showError("파일 저장 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  }, [
    pendingFiles,
    numericEatKey,
    uploadRequest,
    loadFiles,
    onUploadSuccess,
    onDeleteSuccess,
    onSaveError,
    setPendingFiles,
  ]);

  const isLoading = loading || saving;
  const hasPendingFiles = pendingFiles.length > 0;

  // 업로드/삭제 대기 파일 개수 계산 (메모이제이션)
  const pendingFileCounts = useMemo(() => {
    let uploadCount = 0;
    let deleteCount = 0;
    for (const p of pendingFiles) {
      if (p.action === "upload") uploadCount++;
      else if (p.action === "delete") deleteCount++;
    }
    return { uploadCount, deleteCount };
  }, [pendingFiles]);

  // 저장 버튼 표시 여부
  // 자동 모드: 대기 파일이 있을 때 저장 버튼 표시 (삭제 대기 파일 처리용)
  // 수동 모드: 외부에서 저장을 처리하므로 저장 버튼을 표시하지 않음
  const showSaveButton = autoUpload && hasPendingFiles;

  // 공통 컨텐츠 (variant와 무관하게 동일)
  const content = (
    <AttachmentDrawerContainer>
      {/* 숨겨진 파일 입력 */}
      {!externalOnUpload && uploadable && (
        <FileInput
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          onChange={handleFileChange}
        />
      )}

      {isLoading && (
        <LoadingContainer>
          <Spin size="large" />
          {saving && <LoadingText>파일 저장 중...</LoadingText>}
        </LoadingContainer>
      )}

      {/* 대기 파일 목록 (업로드 + 삭제 통합) */}
      {hasPendingFiles && (
        <PendingFileList>
          <PendingFileCountContainer>
            {pendingFileCounts.uploadCount > 0 && (
              <PendingFileCountTag
                color="blue"
                icon={<i className="ri-upload-line" />}
              >
                저장 <strong>{pendingFileCounts.uploadCount}</strong>
              </PendingFileCountTag>
            )}
            {pendingFileCounts.deleteCount > 0 && (
              <PendingFileCountTag
                color="red"
                icon={<i className="ri-delete-bin-line" />}
              >
                삭제 <strong>{pendingFileCounts.deleteCount}</strong>
              </PendingFileCountTag>
            )}
          </PendingFileCountContainer>
          {pendingFiles.map((pendingFile) => (
            <PendingFileItem key={pendingFile.id}>
              <AttachmentItemIcon>
                {getFileIcon(pendingFile.name)}
              </AttachmentItemIcon>
              <AttachmentItemInfo>
                <FileName>
                  {pendingFile.name}
                  {pendingFile.action === "delete" && (
                    <PendingFileDeleteLabel>(삭제 예정)</PendingFileDeleteLabel>
                  )}
                </FileName>
                <FileMeta>
                  {pendingFile.type && (
                    <span>{pendingFile.type.toUpperCase()}</span>
                  )}
                  {pendingFile.size && (
                    <span>{formatBytes(pendingFile.size)}</span>
                  )}
                </FileMeta>
              </AttachmentItemInfo>
              <AttachmentItemActions>
                <FormButton
                  type="text"
                  size="small"
                  danger
                  icon={<i className="ri-delete-bin-line" />}
                  onClick={() => handleRemovePendingFile(pendingFile.id)}
                />
              </AttachmentItemActions>
            </PendingFileItem>
          ))}
        </PendingFileList>
      )}

      {/* 헤더: 전체선택 + 삭제 */}
      {files.length > 0 && !isLoading && (
        <AttachmentHeader>
          <FormCheckbox
            checked={allSelected}
            indeterminate={isIndeterminate}
            onChange={(checked) => handleSelectAll(checked)}
          >
            전체선택
          </FormCheckbox>
          {deletable && selectedFileIds.size > 0 && (
            <FormButton
              type="text"
              danger
              icon={<i className="ri-delete-bin-line" />}
              onClick={handleDelete}
            />
          )}
        </AttachmentHeader>
      )}

      {/* 파일 리스트 */}
      <AttachmentList
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        $isDragging={isDragging}
      >
        {!isLoading && files.length === 0 && !hasPendingFiles ? (
          <EmptyFileMessage type="secondary">
            첨부된 파일이 없습니다.
          </EmptyFileMessage>
        ) : (
          files.map((file) => (
            <AttachmentItem key={file.id}>
              <AttachmentItemCheckbox>
                <FormCheckbox
                  checked={selectedFileIds.has(file.id)}
                  onChange={(checked) => handleSelectFile(file.id, checked)}
                />
              </AttachmentItemCheckbox>
              <AttachmentItemHeader>
                <AttachmentItemIcon fileType={file.type}>
                  {getFileIcon(file.name)}
                </AttachmentItemIcon>
                <AttachmentItemInfo>
                  <FileName>{file.name}</FileName>
                  <FileMeta>
                    {file.type && <span>{file.type.toUpperCase()}</span>}
                    {file.size && <span>{formatBytes(file.size)}</span>}
                    {file.origin && <span>{file.origin}</span>}
                  </FileMeta>
                </AttachmentItemInfo>
              </AttachmentItemHeader>
              <AttachmentItemActions>
                {downloadable && (
                  <FormButton
                    type="text"
                    size="small"
                    icon={<i className="ri-download-line" />}
                    onClick={() => handleDownload(file)}
                  />
                )}
                {deletable && (
                  <FormButton
                    type="text"
                    size="small"
                    danger
                    icon={<i className="ri-delete-bin-line" />}
                    onClick={() => handleDeleteSingle(file)}
                  />
                )}
              </AttachmentItemActions>
            </AttachmentItem>
          ))
        )}
      </AttachmentList>

      {/* 푸터: 파일첨부 + 저장 + 전체 다운로드 */}
      {uploadable && (
        <AttachmentFooter>
          <Space>
            <FormButton
              icon={<i className="ri-upload-line" />}
              onClick={handleUploadButtonClick}
              disabled={!eatKey && !externalOnUpload}
            >
              {uploadButtonText}
            </FormButton>
            {showSaveButton && (
              <FormButton
                icon={<i className="ri-save-line" />}
                onClick={handleSave}
                loading={saving}
                type="primary"
              >
                {saveButtonText}
              </FormButton>
            )}
            {downloadable && files.length > 0 && (
              <FormButton
                icon={<i className="ri-download-line" />}
                onClick={handleDownloadAll}
              >
                {downloadAllButtonText}
              </FormButton>
            )}
          </Space>
        </AttachmentFooter>
      )}
    </AttachmentDrawerContainer>
  );

  // variant에 따라 렌더링 방식 결정
  if (variant === "inline") {
    // inline 모드: Drawer나 Modal 없이 컨텐츠만 렌더링 (Modal 안에서 사용)
    return open ? content : null;
  }

  if (variant === "modal") {
    // modal 모드: Modal로 렌더링
    return (
      <Modal
        title={drawerTitle}
        open={open}
        onCancel={handleClose}
        width={width}
        footer={null}
        destroyOnClose={false}
        style={modalStyle}
        bodyStyle={modalBodyStyle}
      >
        {content}
      </Modal>
    );
  }

  // drawer 모드 (기본값): Drawer로 렌더링
  return (
    <Drawer
      title={drawerTitle}
      placement="right"
      onClose={handleClose}
      open={open}
      width={width}
      destroyOnClose={false}
    >
      {content}
    </Drawer>
  );
};

export default AttachmentDrawer;
