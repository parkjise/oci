// Form 컴포넌트 간 공유되는 전역 플래그: 모달 표시 중 여부
let isModalShowing = false;
let modalTimeout: NodeJS.Timeout | null = null;

/**
 * 모달을 표시할 수 있는지 확인하고, 표시 가능하면 플래그를 설정합니다.
 * @returns 모달을 표시할 수 있으면 true, 아니면 false
 */
export const canShowModal = (): boolean => {
  if (!isModalShowing) {
    isModalShowing = true;
    return true;
  }
  return false;
};

/**
 * 모달이 닫힌 후 플래그를 해제합니다.
 * 500ms 후에 플래그를 해제하여 연속된 검증에서 첫 번째만 모달이 표시되도록 합니다.
 */
export const resetModalFlag = (): void => {
  if (modalTimeout) {
    clearTimeout(modalTimeout);
  }
  modalTimeout = setTimeout(() => {
    isModalShowing = false;
    modalTimeout = null;
  }, 500);
};

