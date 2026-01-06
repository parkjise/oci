/**
 * 프로그램 버튼 유틸리티
 *
 * 파일 내용에서 버튼 정보와 objId를 추출하는 함수들을 제공합니다.
 */

import { getFileContent } from "./fileContentLoader";
import {
  extractButtonFromJsxBlock,
  extractActionButtonGroupBlock,
  ACTION_BUTTON_GROUP_OBJ_IDS,
  BUTTON_TYPE_TO_OBJ_ID,
  REGEX_HIDE_BUTTONS,
  REGEX_ENABLE_EXPAND,
  REGEX_FORM_BUTTON_TAG,
  REGEX_OBJ_ID_STRING,
  REGEX_OBJ_ID_TEMPLATE,
} from "./buttonExtractorCore";

export interface ButtonInfo {
  line: number;
  objId: string | null;
  buttonName: string;
  buttonType: "FormButton" | "ActionButton" | "Button" | "ActionButtonGroup";
  component?: string;
}

export interface FileButtonInfo {
  filePath: string;
  buttons: ButtonInfo[];
}

/**
 * 파일 내용에서 objId와 버튼명을 추출합니다.
 * line 정보와 component 정보를 포함하여 반환합니다.
 */
export const extractButtonInfo = (fileContent: string): ButtonInfo[] => {
  if (!fileContent) {
    if (import.meta.env.DEV) {
      console.warn("[extractButtonInfo] fileContent가 없습니다.");
    }
    return [];
  }

  const lines = fileContent.split("\n");
  const results: ButtonInfo[] = [];
  const processedObjIds = new Set<string>();
  const processedCustomButtonsRanges = new Set<string>(); // 이미 처리한 customButtons 배열 추적

  if (import.meta.env.DEV) {
    console.log("[extractButtonInfo] 파일 라인 수:", lines.length);
  }

  // customButtons 배열을 직접 찾는 함수 (파일 전체를 문자열로 처리)
  const extractCustomButtonsFromFile = (): void => {
    // customButtons 키워드 찾기 (여러 줄 패턴 지원)
    const customButtonsKeyword = /const\s+customButtons\s*=/g;
    const customButtonsInObject = /customButtons\s*:/g;

    if (import.meta.env.DEV) {
      console.log("[extractButtonInfo] customButtons 배열 직접 찾기 시작");
    }

    // 1. const customButtons = 패턴 찾기
    let match;
    while ((match = customButtonsKeyword.exec(fileContent)) !== null) {
      const keywordIndex = match.index;
      const rangeKey = `${keywordIndex}`;

      if (processedCustomButtonsRanges.has(rangeKey)) {
        continue;
      }

      if (import.meta.env.DEV) {
        console.log(
          "[extractButtonInfo] const customButtons = 패턴 발견:",
          keywordIndex
        );
      }

      // keywordIndex 이후에서 배열 시작 [ 찾기
      let arrayStartIndex = -1;
      const searchStart = keywordIndex + match[0].length;

      // useMemo(() => [ 패턴인지 확인 (더 넓은 범위로 검색)
      // useMemo(() => [ 또는 useMemo(() => [ 또는 useMemo(() => [ 패턴 지원
      const afterKeyword = fileContent.slice(searchStart, searchStart + 300);
      const useMemoMatch = afterKeyword.match(
        /useMemo\s*\([\s\S]{0,150}?\(\)\s*=>\s*\[/
      );

      if (useMemoMatch) {
        // useMemo(() => [ 패턴
        arrayStartIndex =
          searchStart + useMemoMatch.index! + useMemoMatch[0].length;
      } else {
        // 일반 배열 패턴: = [
        const arrayMatch = afterKeyword.match(/[\s\n]*\[/);
        if (arrayMatch) {
          arrayStartIndex =
            searchStart + arrayMatch.index! + arrayMatch[0].length;
        }
      }

      if (arrayStartIndex === -1) {
        if (import.meta.env.DEV) {
          console.log("[extractButtonInfo] 배열 시작 위치를 찾을 수 없음");
        }
        continue;
      }

      if (import.meta.env.DEV) {
        console.log("[extractButtonInfo] 배열 시작 위치:", arrayStartIndex);
      }

      // 배열의 닫는 괄호 찾기
      let bracketCount = 1;
      let endIndex = arrayStartIndex;

      for (
        let i = arrayStartIndex;
        i < fileContent.length && bracketCount > 0;
        i++
      ) {
        const char = fileContent[i];
        if (char === "[") {
          bracketCount++;
        } else if (char === "]") {
          bracketCount--;
          if (bracketCount === 0) {
            endIndex = i;
            break;
          }
        }
      }

      if (endIndex > arrayStartIndex) {
        const arrayContent = fileContent.slice(arrayStartIndex, endIndex);

        // 배열 내용에서 FormButton 추출
        const customButtonMatches = Array.from(
          arrayContent.matchAll(REGEX_FORM_BUTTON_TAG)
        );

        // 라인 번호 계산을 위해 배열 시작 위치의 라인 번호 찾기
        const arrayStartLineNumber = fileContent
          .slice(0, arrayStartIndex)
          .split("\n").length;

        for (const buttonMatch of customButtonMatches) {
          const customButtonInfo = extractButtonFromJsxBlock(
            buttonMatch[0],
            "FormButton"
          );
          if (
            customButtonInfo &&
            customButtonInfo.objId &&
            customButtonInfo.objId.trim() !== "" &&
            !processedObjIds.has(customButtonInfo.objId)
          ) {
            // 버튼이 배열 내에서 몇 번째 라인인지 계산
            const buttonIndexInArray = arrayContent.indexOf(buttonMatch[0]);
            const buttonLineNumber =
              arrayStartLineNumber +
              arrayContent.slice(0, buttonIndexInArray).split("\n").length -
              1;

            results.push({
              line: buttonLineNumber,
              objId: customButtonInfo.objId,
              buttonName: customButtonInfo.buttonName || "[버튼]",
              buttonType: "ActionButtonGroup",
            });
            processedObjIds.add(customButtonInfo.objId);
          }
        }

        processedCustomButtonsRanges.add(rangeKey);
      }
    }

    // 2. customButtons: 패턴 찾기 (객체 내부)
    while ((match = customButtonsInObject.exec(fileContent)) !== null) {
      const keywordIndex = match.index;
      const rangeKey = `obj_${keywordIndex}`;

      if (processedCustomButtonsRanges.has(rangeKey)) {
        continue;
      }

      // keywordIndex 이후에서 배열 시작 [ 찾기
      let arrayStartIndex = -1;
      const searchStart = keywordIndex + match[0].length;

      const afterKeyword = fileContent.slice(searchStart, searchStart + 50);
      const arrayMatch = afterKeyword.match(/[\s\n]*\[/);

      if (arrayMatch) {
        arrayStartIndex =
          searchStart + arrayMatch.index! + arrayMatch[0].length;
      }

      if (arrayStartIndex === -1) {
        continue;
      }

      // 배열의 닫는 괄호 찾기
      let bracketCount = 1;
      let endIndex = arrayStartIndex;

      for (
        let i = arrayStartIndex;
        i < fileContent.length && bracketCount > 0;
        i++
      ) {
        const char = fileContent[i];
        if (char === "[") {
          bracketCount++;
        } else if (char === "]") {
          bracketCount--;
          if (bracketCount === 0) {
            endIndex = i;
            break;
          }
        }
      }

      if (endIndex > arrayStartIndex) {
        const arrayContent = fileContent.slice(arrayStartIndex, endIndex);

        // 배열 내용에서 FormButton 추출
        const customButtonMatches = Array.from(
          arrayContent.matchAll(REGEX_FORM_BUTTON_TAG)
        );

        // 라인 번호 계산을 위해 배열 시작 위치의 라인 번호 찾기
        const arrayStartLineNumber = fileContent
          .slice(0, arrayStartIndex)
          .split("\n").length;

        for (const buttonMatch of customButtonMatches) {
          const customButtonInfo = extractButtonFromJsxBlock(
            buttonMatch[0],
            "FormButton"
          );
          if (
            customButtonInfo &&
            customButtonInfo.objId &&
            customButtonInfo.objId.trim() !== "" &&
            !processedObjIds.has(customButtonInfo.objId)
          ) {
            // 버튼이 배열 내에서 몇 번째 라인인지 계산
            const buttonIndexInArray = arrayContent.indexOf(buttonMatch[0]);
            const buttonLineNumber =
              arrayStartLineNumber +
              arrayContent.slice(0, buttonIndexInArray).split("\n").length -
              1;

            results.push({
              line: buttonLineNumber,
              objId: customButtonInfo.objId,
              buttonName: customButtonInfo.buttonName || "[버튼]",
              buttonType: "ActionButtonGroup",
            });
            processedObjIds.add(customButtonInfo.objId);
            if (import.meta.env.DEV) {
              console.log(
                "[extractButtonInfo] customButton 추가 (객체 내부):",
                customButtonInfo.objId
              );
            }
          }
        }

        processedCustomButtonsRanges.add(rangeKey);
      }
    }
  };

  // 파일 전체에서 customButtons 배열 추출 (ActionButtonGroup 태그가 없어도)
  extractCustomButtonsFromFile();

  // 그리드 컬럼 정의에서 버튼 추출
  const extractButtonsFromGridColumns = (): void => {
    // columnDefs 패턴 찾기
    const columnDefsPatterns = [
      /const\s+columnDefs\s*[:=]\s*\[/g,
      /columnDefs\s*[:=]\s*\[/g,
      /const\s+columnDefs\s*[:=]\s*useMemo\s*\([\s\S]*?\(\)\s*=>\s*\[/g,
    ];

    for (const pattern of columnDefsPatterns) {
      const patternCopy = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = patternCopy.exec(fileContent)) !== null) {
        const startIndex = match.index + match[0].length;
        const rangeKey = `grid_${startIndex}`;

        if (processedCustomButtonsRanges.has(rangeKey)) {
          continue;
        }

        // 배열의 닫는 괄호 찾기
        let bracketCount = 1;
        let endIndex = startIndex;

        for (
          let i = startIndex;
          i < fileContent.length && bracketCount > 0;
          i++
        ) {
          const char = fileContent[i];
          if (char === "[") bracketCount++;
          else if (char === "]") bracketCount--;
          if (bracketCount === 0) {
            endIndex = i;
            break;
          }
        }

        if (endIndex > startIndex) {
          const columnDefsContent = fileContent.slice(startIndex, endIndex);

          // 컬럼 정의 배열에서 FormButton, Button 찾기
          const buttonMatches = Array.from(
            columnDefsContent.matchAll(REGEX_FORM_BUTTON_TAG)
          );

          // 라인 번호 계산
          const arrayStartLineNumber = fileContent
            .slice(0, startIndex)
            .split("\n").length;

          // FormButton 태그에서 버튼 추출
          for (const buttonMatch of buttonMatches) {
            const buttonInfo = extractButtonFromJsxBlock(
              buttonMatch[0],
              "FormButton"
            );
            if (
              buttonInfo &&
              buttonInfo.objId &&
              buttonInfo.objId.trim() !== "" &&
              !processedObjIds.has(buttonInfo.objId)
            ) {
              const buttonIndexInArray = columnDefsContent.indexOf(
                buttonMatch[0]
              );
              const buttonLineNumber =
                arrayStartLineNumber +
                columnDefsContent.slice(0, buttonIndexInArray).split("\n")
                  .length -
                1;

              results.push({
                line: buttonLineNumber,
                objId: buttonInfo.objId,
                buttonName: buttonInfo.buttonName || "[버튼]",
                buttonType: "FormButton",
              });
              processedObjIds.add(buttonInfo.objId);
            }
          }

          // 컬럼 정의 전체에서 objId 패턴 찾기
          const allObjIdMatches = [
            ...columnDefsContent.matchAll(REGEX_OBJ_ID_STRING),
            ...columnDefsContent.matchAll(REGEX_OBJ_ID_TEMPLATE),
          ];

          for (const objIdMatch of allObjIdMatches) {
            const objId = objIdMatch[1]?.trim();
            if (
              objId &&
              objId.trim() !== "" &&
              !processedObjIds.has(objId) &&
              objId.startsWith("BTN_")
            ) {
              const objIdIndexInArray = columnDefsContent.indexOf(
                objIdMatch[0]
              );
              const objIdLineNumber =
                arrayStartLineNumber +
                columnDefsContent.slice(0, objIdIndexInArray).split("\n")
                  .length -
                1;

              results.push({
                line: objIdLineNumber,
                objId,
                buttonName: `Grid Column - ${objId}`,
                buttonType: "FormButton",
              });
              processedObjIds.add(objId);
            }
          }

          processedCustomButtonsRanges.add(rangeKey);
        }
      }
    }
  };

  // 그리드 컬럼 정의에서 버튼 추출
  extractButtonsFromGridColumns();

  // actionButtonGroup prop을 찾아서 기본 버튼들 추가
  const extractActionButtonGroupFromProps = (): void => {
    // actionButtonGroup prop 패턴 찾기
    const actionButtonGroupPropPatterns = [
      /actionButtonGroup\s*=\s*\{/g,
      /actionButtonGroup\s*:\s*\{/g,
    ];

    for (const pattern of actionButtonGroupPropPatterns) {
      // 정규식의 lastIndex를 초기화하기 위해 새로 생성
      const patternCopy = new RegExp(pattern.source, pattern.flags);
      let match;
      while ((match = patternCopy.exec(fileContent)) !== null) {
        const startIndex = match.index;
        const rangeKey = `prop_${startIndex}`;

        if (processedCustomButtonsRanges.has(rangeKey)) {
          continue;
        }

        // 객체의 닫는 괄호 찾기
        let braceCount = 1;
        let endIndex = startIndex + match[0].length;
        const maxSearchLength = Math.min(fileContent.length, startIndex + 5000); // 최대 5000자까지만 검색 (성능 최적화)

        for (let i = endIndex; i < maxSearchLength && braceCount > 0; i++) {
          const char = fileContent[i];
          if (char === "{") braceCount++;
          else if (char === "}") braceCount--;
          if (braceCount === 0) {
            endIndex = i;
            break;
          }
        }

        if (endIndex > startIndex && braceCount === 0) {
          const propContent = fileContent.slice(startIndex, endIndex + 1);

          // hideButtons prop 분석
          const hideButtonsMatch = propContent.match(REGEX_HIDE_BUTTONS);
          const hiddenButtons = new Set<string>();

          // REGEX_HIDE_BUTTONS가 매칭되지 않으면 직접 배열 패턴 찾기 (여러 줄 지원)
          if (!hideButtonsMatch) {
            // hideButtons: [...] 또는 hideButtons={[...]} 패턴 직접 찾기
            // 여러 줄에 걸친 배열도 처리하기 위해 [\s\S]*? 사용
            const hideButtonsPattern = /hideButtons\s*[:=]\s*\[([\s\S]*?)\]/;
            const directMatch = propContent.match(hideButtonsPattern);
            if (directMatch && directMatch[1]) {
              // 배열 내용에서 문자열 추출 (여러 줄 지원)
              const arrayContent = directMatch[1];
              // "copy", "delete" 같은 문자열 패턴 찾기
              const stringMatches =
                arrayContent.matchAll(/"([^"]+)"|'([^']+)'/g);
              for (const stringMatch of stringMatches) {
                const buttonType = stringMatch[1] || stringMatch[2];
                if (buttonType) {
                  const objId = BUTTON_TYPE_TO_OBJ_ID[buttonType];
                  if (objId) {
                    hiddenButtons.add(objId);
                  }
                }
              }
            }
          } else {
            const buttonTypes = hideButtonsMatch[1]
              .split(",")
              .map((s) => s.trim().replace(/["']/g, ""))
              .filter(Boolean);

            for (const type of buttonTypes) {
              const objId = BUTTON_TYPE_TO_OBJ_ID[type];
              if (objId) {
                hiddenButtons.add(objId);
              }
            }
          }

          // enableExpand 확인
          const hasEnableExpand = REGEX_ENABLE_EXPAND.test(propContent);

          // 라인 번호 계산
          const lineNumber = fileContent
            .slice(0, startIndex)
            .split("\n").length;

          // 기본 버튼들 추가
          ACTION_BUTTON_GROUP_OBJ_IDS.forEach((objId) => {
            if (!hiddenButtons.has(objId) && !processedObjIds.has(objId)) {
              results.push({
                line: lineNumber,
                objId,
                buttonName: `ActionButtonGroup - ${objId}`,
                buttonType: "ActionButtonGroup",
              });
              processedObjIds.add(objId);
            }
          });

          // enableExpand가 true인 경우 BTN_EXPAND 추가
          if (
            hasEnableExpand &&
            !hiddenButtons.has("BTN_EXPAND") &&
            !processedObjIds.has("BTN_EXPAND")
          ) {
            results.push({
              line: lineNumber,
              objId: "BTN_EXPAND",
              buttonName: "ActionButtonGroup - BTN_EXPAND",
              buttonType: "ActionButtonGroup",
            });
            processedObjIds.add("BTN_EXPAND");
          }

          processedCustomButtonsRanges.add(rangeKey);
        }
      }
    }
  };

  // actionButtonGroup prop에서 기본 버튼들 추출
  extractActionButtonGroupFromProps();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // FormButton 찾기 (objId가 있는 경우만 추출)
    if (line.includes("<FormButton")) {
      const jsxBlock = extractFormButtonBlock(lines, i);
      const buttonInfo = extractButtonFromJsxBlock(jsxBlock, "FormButton");
      if (
        buttonInfo &&
        buttonInfo.objId &&
        buttonInfo.objId.trim() !== "" &&
        !processedObjIds.has(buttonInfo.objId)
      ) {
        results.push({
          line: lineNumber,
          objId: buttonInfo.objId,
          buttonName: buttonInfo.buttonName || "[버튼]",
          buttonType: "FormButton",
          component: jsxBlock,
        });
        processedObjIds.add(buttonInfo.objId);
        if (import.meta.env.DEV) {
          console.log("[extractButtonInfo] FormButton 추가:", buttonInfo.objId);
        }
      }
    }

    // ActionButtonGroup 찾기 (내부적으로 objId를 가지고 있으므로 항상 추출)
    if (line.includes("<ActionButtonGroup")) {
      const actionButtonGroupBlock = extractActionButtonGroupBlock(lines, i);
      if (actionButtonGroupBlock) {
        if (import.meta.env.DEV) {
          console.log(
            "[extractButtonInfo] ActionButtonGroup 발견, line:",
            lineNumber
          );
        }

        // hideButtons prop 분석
        const hideButtonsMatch =
          actionButtonGroupBlock.match(REGEX_HIDE_BUTTONS);
        const hiddenButtons = new Set<string>();
        if (hideButtonsMatch) {
          const buttonTypes = hideButtonsMatch[1]
            .split(",")
            .map((s) => s.trim().replace(/["']/g, ""))
            .filter(Boolean);

          for (const type of buttonTypes) {
            const objId = BUTTON_TYPE_TO_OBJ_ID[type];
            if (objId) {
              hiddenButtons.add(objId);
            }
          }
        }

        // ActionButtonGroup은 내부적으로 objId를 가지고 있으므로 기본 버튼들 추가
        ACTION_BUTTON_GROUP_OBJ_IDS.forEach((objId) => {
          if (!hiddenButtons.has(objId) && !processedObjIds.has(objId)) {
            results.push({
              line: lineNumber,
              objId,
              buttonName: `ActionButtonGroup - ${objId}`,
              buttonType: "ActionButtonGroup",
            });
            processedObjIds.add(objId);
            if (import.meta.env.DEV) {
              console.log("[extractButtonInfo] 버튼 추가:", objId);
            }
          }
        });

        // enableExpand가 true인 경우 BTN_EXPAND 추가
        if (
          REGEX_ENABLE_EXPAND.test(actionButtonGroupBlock) &&
          !hiddenButtons.has("BTN_EXPAND") &&
          !processedObjIds.has("BTN_EXPAND")
        ) {
          results.push({
            line: lineNumber,
            objId: "BTN_EXPAND",
            buttonName: "ActionButtonGroup - BTN_EXPAND",
            buttonType: "ActionButtonGroup",
          });
          processedObjIds.add("BTN_EXPAND");
          if (import.meta.env.DEV) {
            console.log("[extractButtonInfo] BTN_EXPAND 추가");
          }
        }

        // customButtons 내부의 FormButton들 추출 (objId가 있는 경우만)
        // 개선: 괄호 매칭을 사용하여 정확한 배열 범위 추출
        const customButtonsStart =
          actionButtonGroupBlock.indexOf("customButtons");
        if (customButtonsStart !== -1) {
          const afterCustomButtons =
            actionButtonGroupBlock.slice(customButtonsStart);
          const arrayStartMatch = afterCustomButtons.match(
            /customButtons\s*=\s*\{?\s*\[/
          );

          if (arrayStartMatch) {
            const arrayStartIndex =
              arrayStartMatch.index! + arrayStartMatch[0].length;
            let bracketCount = 1;
            let arrayEndIndex = arrayStartIndex;

            // 배열의 닫는 괄호 찾기 (중첩된 구조 고려)
            for (
              let i = arrayStartIndex;
              i < afterCustomButtons.length && bracketCount > 0;
              i++
            ) {
              if (afterCustomButtons[i] === "[") bracketCount++;
              else if (afterCustomButtons[i] === "]") bracketCount--;
              if (bracketCount === 0) {
                arrayEndIndex = i;
                break;
              }
            }

            if (arrayEndIndex > arrayStartIndex) {
              const customButtonsContent = afterCustomButtons.slice(
                arrayStartIndex,
                arrayEndIndex
              );
              const customButtonMatches = Array.from(
                customButtonsContent.matchAll(REGEX_FORM_BUTTON_TAG)
              );

              for (const match of customButtonMatches) {
                const customButtonInfo = extractButtonFromJsxBlock(
                  match[0],
                  "FormButton"
                );
                if (
                  customButtonInfo &&
                  customButtonInfo.objId &&
                  !processedObjIds.has(customButtonInfo.objId)
                ) {
                  results.push({
                    line: lineNumber,
                    objId: customButtonInfo.objId,
                    buttonName: customButtonInfo.buttonName || "[버튼]",
                    buttonType: "ActionButtonGroup",
                  });
                  processedObjIds.add(customButtonInfo.objId);
                  if (import.meta.env.DEV) {
                    console.log(
                      "[extractButtonInfo] customButton 추가:",
                      customButtonInfo.objId
                    );
                  }
                }
              }
            }
          }
        }
      }
    }

    // ActionButton 찾기 (objId가 있는 경우만 추출)
    if (line.includes("<ActionButton") && !line.includes("ActionButtonGroup")) {
      const jsxBlock = extractActionButtonBlock(lines, i);
      const buttonInfo = extractButtonFromJsxBlock(jsxBlock, "FormButton"); // ActionButton도 FormButton과 유사한 구조
      if (
        buttonInfo &&
        buttonInfo.objId &&
        buttonInfo.objId.trim() !== "" &&
        !processedObjIds.has(buttonInfo.objId)
      ) {
        results.push({
          line: lineNumber,
          objId: buttonInfo.objId,
          buttonName: buttonInfo.buttonName || "[버튼]",
          buttonType: "ActionButton",
          component: jsxBlock,
        });
        processedObjIds.add(buttonInfo.objId);
        if (import.meta.env.DEV) {
          console.log(
            "[extractButtonInfo] ActionButton 추가:",
            buttonInfo.objId
          );
        }
      }
    }

    // 일반 Button 찾기 (FormButton, ActionButton이 아닌 순수 antd Button만)
    if (
      line.includes("<Button") &&
      !line.includes("FormButton") &&
      !line.includes("ActionButton") &&
      line.includes("objId")
    ) {
      const jsxBlock = extractButtonBlock(lines, i);
      const buttonInfo = extractButtonFromJsxBlock(jsxBlock, "Button");
      if (
        buttonInfo &&
        buttonInfo.objId &&
        buttonInfo.objId.trim() !== "" &&
        !processedObjIds.has(buttonInfo.objId)
      ) {
        results.push({
          line: lineNumber,
          objId: buttonInfo.objId,
          buttonName: buttonInfo.buttonName,
          buttonType: "Button",
          component: jsxBlock,
        });
        processedObjIds.add(buttonInfo.objId);
        if (import.meta.env.DEV) {
          console.log("[extractButtonInfo] Button 추가:", buttonInfo.objId);
        }
      }
    }
  }

  if (import.meta.env.DEV) {
    console.log("[extractButtonInfo] 최종 추출된 버튼 수:", results.length);
  }

  // 최종 필터링: objId와 buttonName이 모두 존재하는 버튼만 반환
  const filteredResults = results.filter((btn) => {
    // objId 검증
    if (
      !btn.objId ||
      typeof btn.objId !== "string" ||
      btn.objId.trim() === ""
    ) {
      if (import.meta.env.DEV) {
        console.warn("[extractButtonInfo] 빈 objId를 가진 버튼 제외:", btn);
      }
      return false;
    }
    // buttonName이 없거나 빈 문자열인 경우 objId를 기본값으로 사용
    if (
      !btn.buttonName ||
      typeof btn.buttonName !== "string" ||
      btn.buttonName.trim() === ""
    ) {
      btn.buttonName = btn.objId;
    }
    return true;
  });

  if (import.meta.env.DEV) {
    console.log(
      `[extractButtonInfo] 최종 추출된 버튼 수: ${filteredResults.length} (원본: ${results.length})`
    );
  }

  return filteredResults;
};

/**
 * FormButton JSX 블록을 추출합니다 (component 필드용)
 */
function extractFormButtonBlock(lines: string[], startIndex: number): string {
  let jsxBlock = "";
  let bracketCount = 0;
  let inJsxBlock = false;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    jsxBlock += line + "\n";

    if (!inJsxBlock && line.includes("<FormButton")) {
      inJsxBlock = true;
    }

    if (inJsxBlock) {
      for (let j = 0; j < line.length; j++) {
        if (line[j] === "<") bracketCount++;
        else if (line[j] === ">") bracketCount--;
      }

      if (bracketCount === 0 && line.includes(">")) {
        break;
      }
    }
  }

  return jsxBlock.trim();
}

/**
 * ActionButton JSX 블록을 추출합니다 (component 필드용)
 */
function extractActionButtonBlock(lines: string[], startIndex: number): string {
  let jsxBlock = "";
  let bracketCount = 0;
  let inJsxBlock = false;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    jsxBlock += line + "\n";

    if (!inJsxBlock && line.includes("<ActionButton")) {
      inJsxBlock = true;
    }

    if (inJsxBlock) {
      for (let j = 0; j < line.length; j++) {
        if (line[j] === "<") bracketCount++;
        else if (line[j] === ">") bracketCount--;
      }

      if (bracketCount === 0 && line.includes(">")) {
        break;
      }
    }
  }

  return jsxBlock.trim();
}

/**
 * Button JSX 블록을 추출합니다 (component 필드용)
 */
function extractButtonBlock(lines: string[], startIndex: number): string {
  let jsxBlock = "";
  let bracketCount = 0;
  let inJsxBlock = false;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    jsxBlock += line + "\n";

    if (!inJsxBlock && line.includes("<Button")) {
      inJsxBlock = true;
    }

    if (inJsxBlock) {
      for (let j = 0; j < line.length; j++) {
        if (line[j] === "<") bracketCount++;
        else if (line[j] === ">") bracketCount--;
      }

      if (bracketCount === 0 && line.includes(">")) {
        break;
      }
    }
  }

  return jsxBlock.trim();
}

/**
 * programPath를 사용하여 파일에서 objId 목록을 추출합니다 (비동기)
 * @param programPath 파일 경로 (예: "src/pages/sample/sample1/Sample1.tsx")
 * @returns Promise<string[]>
 */
export const getObjIdsByProgramPath = async (
  programPath: string | null | undefined
): Promise<string[]> => {
  if (!programPath) {
    if (import.meta.env.DEV) {
      console.warn("[getObjIdsByProgramPath] programPath가 없습니다.");
    }
    return [];
  }

  const fileContent = await getFileContent(programPath);

  if (!fileContent) {
    if (import.meta.env.DEV) {
      console.warn(
        "[getObjIdsByProgramPath] 파일 내용을 읽을 수 없습니다:",
        programPath
      );
    }
    return [];
  }

  const buttons = extractButtonInfo(fileContent);

  // objId가 있는 버튼만 필터링하고 중복 제거
  const objIds = buttons
    .map((btn) => btn.objId)
    .filter((objId): objId is string => objId !== null);

  return Array.from(new Set(objIds));
};

/**
 * 컴포넌트 사용 시점의 prop 값을 추출합니다
 * - FormAgGrid: toolbarButtons={{ showSave: true }}
 * - SearchForm: showSearch, showReset, showExpand
 * - ActionButtonGroup: hideButtons=["copy", "delete"]
 */
const extractComponentProps = (
  fileContent: string,
  componentName: string
): Record<string, boolean | undefined | string[]> => {
  const props: Record<string, boolean | undefined | string[]> = {};

  // 컴포넌트 사용 패턴 찾기: <ComponentName ... /> 또는 <ComponentName<Type> ... />
  // 제네릭 타입도 처리할 수 있도록 개선
  const componentUsageRegex = new RegExp(
    `<${componentName}(?:<[^>]*>)?[\\s\\S]*?/>`,
    "g"
  );

  let match;
  while ((match = componentUsageRegex.exec(fileContent)) !== null) {
    const tagStart = match.index;
    const tagEnd = fileContent.indexOf(">", tagStart);
    if (tagEnd === -1) continue;

    // 태그 전체 내용 추출 (닫는 태그까지)
    let tagContent = fileContent.slice(tagStart, tagEnd + 1);

    // 닫는 태그가 없는 경우 (자기 닫기 태그) 처리
    if (!tagContent.endsWith("/>")) {
      // 닫는 태그 찾기
      const closingTagIndex = fileContent.indexOf(
        `</${componentName}>`,
        tagEnd
      );
      if (closingTagIndex !== -1) {
        tagContent = fileContent.slice(
          tagStart,
          closingTagIndex + `</${componentName}>`.length
        );
      }
    }

    // FormAgGrid: toolbarButtons={{ ... }} 패턴 찾기
    if (componentName === "FormAgGrid") {
      const toolbarButtonsStart = tagContent.indexOf("toolbarButtons");
      if (toolbarButtonsStart !== -1) {
        const afterToolbarButtons = tagContent.slice(toolbarButtonsStart);
        const equalsIndex = afterToolbarButtons.indexOf("=");
        if (equalsIndex !== -1) {
          const afterEquals = afterToolbarButtons.slice(equalsIndex + 1);
          const braceStart = afterEquals.indexOf("{");
          if (braceStart !== -1) {
            let braceCount = 0;
            const braceStartIndex = braceStart;
            let braceEndIndex = -1;

            for (let i = braceStartIndex; i < afterEquals.length; i++) {
              const char = afterEquals[i];
              if (char === "{") {
                braceCount++;
              } else if (char === "}") {
                braceCount--;
                if (braceCount === 0) {
                  braceEndIndex = i;
                  break;
                }
              }
            }

            if (braceEndIndex !== -1) {
              const propsContent = afterEquals.slice(
                braceStartIndex,
                braceEndIndex + 1
              );

              const showSaveMatch = propsContent.match(
                /showSave\s*:\s*(true|false)/
              );
              if (showSaveMatch) {
                props.showSave = showSaveMatch[1] === "true";
              }
              const showAddMatch = propsContent.match(
                /showAdd\s*:\s*(true|false)/
              );
              if (showAddMatch) {
                props.showAdd = showAddMatch[1] === "true";
              }
              const showDeleteMatch = propsContent.match(
                /showDelete\s*:\s*(true|false)/
              );
              if (showDeleteMatch) {
                props.showDelete = showDeleteMatch[1] === "true";
              }
              const showCopyMatch = propsContent.match(
                /showCopy\s*:\s*(true|false)/
              );
              if (showCopyMatch) {
                props.showCopy = showCopyMatch[1] === "true";
              }
              const showExcelDownloadMatch = propsContent.match(
                /showExcelDownload\s*:\s*(true|false)/
              );
              if (showExcelDownloadMatch) {
                props.showExcelDownload = showExcelDownloadMatch[1] === "true";
              }
              const showExcelUploadMatch = propsContent.match(
                /showExcelUpload\s*:\s*(true|false)/
              );
              if (showExcelUploadMatch) {
                props.showExcelUpload = showExcelUploadMatch[1] === "true";
              }
              const showRefreshMatch = propsContent.match(
                /showRefresh\s*:\s*(true|false)/
              );
              if (showRefreshMatch) {
                props.showRefresh = showRefreshMatch[1] === "true";
              }
            }
          }
        }
      }
    }

    // SearchForm: showSearch, showReset, showExpand prop 추출
    if (componentName === "SearchForm") {
      const showSearchMatch = tagContent.match(
        /showSearch\s*=\s*{(true|false)}/
      );
      if (showSearchMatch) {
        props.showSearch = showSearchMatch[1] === "true";
      }
      const showResetMatch = tagContent.match(/showReset\s*=\s*{(true|false)}/);
      if (showResetMatch) {
        props.showReset = showResetMatch[1] === "true";
      }
      const showExpandMatch = tagContent.match(
        /showExpand\s*=\s*{(true|false)}/
      );
      if (showExpandMatch) {
        props.showExpand = showExpandMatch[1] === "true";
      }
    }

    // ActionButtonGroup: hideButtons=["copy", "delete"] 패턴 추출
    if (componentName === "ActionButtonGroup") {
      const hideButtonsStart = tagContent.indexOf("hideButtons");
      if (hideButtonsStart !== -1) {
        const afterHideButtons = tagContent.slice(hideButtonsStart);
        const equalsIndex = afterHideButtons.indexOf("=");
        if (equalsIndex !== -1) {
          const afterEquals = afterHideButtons.slice(equalsIndex + 1);
          const bracketStart = afterEquals.indexOf("[");
          if (bracketStart !== -1) {
            let bracketCount = 0;
            const bracketStartIndex = bracketStart;
            let bracketEndIndex = -1;

            for (let i = bracketStartIndex; i < afterEquals.length; i++) {
              const char = afterEquals[i];
              if (char === "[") {
                bracketCount++;
              } else if (char === "]") {
                bracketCount--;
                if (bracketCount === 0) {
                  bracketEndIndex = i;
                  break;
                }
              }
            }

            if (bracketEndIndex !== -1) {
              const arrayContent = afterEquals.slice(
                bracketStartIndex + 1,
                bracketEndIndex
              );
              // 배열 내부의 문자열 추출: "copy", "delete" 등
              const buttonMatches = arrayContent.matchAll(/"([^"]+)"/g);
              const hiddenButtons: string[] = [];
              for (const buttonMatch of buttonMatches) {
                hiddenButtons.push(buttonMatch[1]);
              }
              if (hiddenButtons.length > 0) {
                props.hideButtons = hiddenButtons;
              }
            }
          }
        }
      }
      // enableExpand prop 추출
      const enableExpandMatch = tagContent.match(
        /enableExpand\s*=\s*{(true|false)}/
      );
      if (enableExpandMatch) {
        props.enableExpand = enableExpandMatch[1] === "true";
      }
    }
  }

  return props;
};

/**
 * 모든 컴포넌트의 prop 값을 한번에 추출합니다
 */
const extractAllComponentProps = (
  fileContent: string
): {
  formAgGrid: Record<string, boolean | undefined>;
  searchForm: Record<string, boolean | undefined>;
  actionButtonGroup: Record<string, boolean | undefined | string[]>;
} => {
  const renderSection = extractRenderSection(fileContent);
  const searchContent = renderSection || fileContent;

  const formAgGridProps = extractComponentProps(searchContent, "FormAgGrid");
  const searchFormProps = extractComponentProps(searchContent, "SearchForm");
  const actionButtonGroupProps = extractComponentProps(
    searchContent,
    "ActionButtonGroup"
  );

  return {
    formAgGrid: formAgGridProps as Record<string, boolean | undefined>,
    searchForm: searchFormProps as Record<string, boolean | undefined>,
    actionButtonGroup: actionButtonGroupProps,
  };
};

/**
 * 컴포넌트 prop 값에 따라 버튼을 필터링합니다
 */
const filterButtonsByProps = (
  buttons: ButtonInfo[],
  props: {
    formAgGrid?: Record<string, boolean | undefined>;
    searchForm?: Record<string, boolean | undefined>;
    actionButtonGroup?: Record<string, boolean | undefined | string[]>;
  }
): ButtonInfo[] => {
  return buttons.filter((btn) => {
    if (!btn.objId) return true;

    // FormAgGrid 버튼 필터링
    if (props.formAgGrid && Object.keys(props.formAgGrid).length > 0) {
      const agGridProps = props.formAgGrid;
      if (
        (btn.objId === "BTN_SAVE" && agGridProps.showSave === false) ||
        (btn.objId === "BTN_ADD_ROW" && agGridProps.showAdd === false) ||
        (btn.objId === "BTN_DELETE_ROW" && agGridProps.showDelete === false) ||
        (btn.objId === "BTN_COPY_ROW" && agGridProps.showCopy === false) ||
        (btn.objId === "BTN_EXCEL_DOWNLOAD" &&
          agGridProps.showExcelDownload === false) ||
        (btn.objId === "BTN_EXCEL_UPLOAD" &&
          agGridProps.showExcelUpload === false) ||
        (btn.objId === "BTN_REFRESH" && agGridProps.showRefresh === false)
      ) {
        return false;
      }
    }

    // SearchForm 버튼 필터링
    if (props.searchForm) {
      if (btn.objId === "BTN_SEARCH" && props.searchForm.showSearch === false) {
        return false;
      }
    }

    // ActionButtonGroup 버튼 필터링
    if (
      props.actionButtonGroup &&
      Array.isArray(props.actionButtonGroup.hideButtons)
    ) {
      const hideButtons = props.actionButtonGroup.hideButtons as string[];
      const buttonTypeMap: Record<string, string> = {
        BTN_CREATE: "create",
        BTN_EDIT: "edit",
        BTN_COPY: "copy",
        BTN_DELETE: "delete",
        BTN_SAVE: "save",
      };
      if (
        buttonTypeMap[btn.objId] &&
        hideButtons.includes(buttonTypeMap[btn.objId])
      ) {
        return false;
      }
    }
    if (
      btn.objId === "BTN_EXPAND" &&
      props.actionButtonGroup?.enableExpand === false
    ) {
      return false;
    }

    return true;
  });
};

/**
 * 중복 버튼을 제거합니다 (objId 기준)
 */
const deduplicateButtons = (
  buttons: ButtonInfo[],
  uniqueButtonIds: Set<string>
): ButtonInfo[] => {
  return buttons.filter((btn) => {
    if (!btn.objId || !btn.objId.trim()) return false;
    const objId = btn.objId.trim();
    if (uniqueButtonIds.has(objId)) {
      return false;
    }
    uniqueButtonIds.add(objId);
    return true;
  });
};

/**
 * 컴포넌트의 render/return 부분만 추출합니다 (실제 렌더링되는 JSX)
 */
const extractRenderSection = (fileContent: string): string | null => {
  // 함수 컴포넌트의 마지막 return 문 찾기 (컴포넌트의 실제 렌더링 부분)
  // return 문이 여러 개일 수 있으므로 마지막 것을 찾아야 함
  const returnMatches = Array.from(fileContent.matchAll(/return\s*\(/g));
  if (returnMatches.length > 0) {
    // 마지막 return 문 찾기
    const lastReturnIndex = returnMatches[returnMatches.length - 1].index!;
    const afterReturn = fileContent.slice(lastReturnIndex);

    // return ( ... ) 부분 추출 (괄호 매칭)
    let bracketCount = 0;
    let startFound = false;
    let endIndex = -1;

    for (let i = 0; i < afterReturn.length; i++) {
      const char = afterReturn[i];
      if (char === "(") {
        bracketCount++;
        startFound = true;
      } else if (char === ")") {
        bracketCount--;
        if (startFound && bracketCount === 0) {
          endIndex = i + 1;
          break;
        }
      }
    }

    if (endIndex > 0) {
      return afterReturn.slice(0, endIndex);
    }
  }

  // 화살표 함수의 return 부분 찾기
  const arrowReturnMatch = fileContent.match(/=>\s*\([\s\S]*?\)\s*;?\s*$/m);
  if (arrowReturnMatch) {
    return arrowReturnMatch[0];
  }

  // JSX가 직접 반환되는 경우
  const directJsxMatch = fileContent.match(/=>\s*\([\s\S]*?\)\s*$/m);
  if (directJsxMatch) {
    return directJsxMatch[0];
  }

  return null;
};

/**
 * JSX에서 실제로 사용되는 컴포넌트 이름을 추출합니다
 */
const extractUsedComponentsFromJSX = (fileContent: string): Set<string> => {
  const usedComponents = new Set<string>();

  // JSX 태그에서 컴포넌트 이름 추출
  // 예: <FilterPanel />, <DetailView className="..." />, <FormAgGrid ...>
  const jsxTagRegex = /<([A-Z][a-zA-Z0-9_]*)\s*[/>]/g;
  let match;

  while ((match = jsxTagRegex.exec(fileContent)) !== null) {
    const componentName = match[1];
    // React 내장 컴포넌트 제외 (div, span, button 등)
    if (
      ![
        "div",
        "span",
        "button",
        "input",
        "form",
        "label",
        "select",
        "option",
        "textarea",
        "img",
        "a",
        "p",
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "ul",
        "li",
        "ol",
        "table",
        "tr",
        "td",
        "th",
        "thead",
        "tbody",
        "tfoot",
      ].includes(componentName.toLowerCase())
    ) {
      usedComponents.add(componentName);
    }
  }

  return usedComponents;
};

/**
 * import 문에서 컴포넌트 이름과 경로를 추출합니다
 */
const extractImportedComponents = (
  fileContent: string
): Map<string, string> => {
  const componentMap = new Map<string, string>();

  // @components 또는 @/components로 시작하는 import 문 찾기
  const importRegex =
    /import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))\s+from\s+["']@\/?components\/([^"']+)["']/g;
  let match;

  while ((match = importRegex.exec(fileContent)) !== null) {
    const importPath = match[4];
    const basePath = `components/${importPath}`;

    // named import: import { FilterPanel, DetailView } from '...'
    if (match[1]) {
      const componentNames = match[1]
        .split(",")
        .map((name) =>
          name
            .trim()
            .split(/\s+as\s+/)[0]
            .trim()
        )
        .filter((name) => name && /^[A-Z]/.test(name)); // 대문자로 시작하는 컴포넌트만

      for (const componentName of componentNames) {
        componentMap.set(componentName, basePath);
      }
    }
    // default import: import ComponentName from '...'
    else if (match[3]) {
      const componentName = match[3].trim();
      if (/^[A-Z]/.test(componentName)) {
        componentMap.set(componentName, basePath);
      }
    }
    // namespace import: import * as Components from '...'
    else if (match[2]) {
      // namespace import는 모든 export를 포함한다고 가정
      componentMap.set("*", basePath);
    }
  }

  // @form alias 처리
  const formImportRegex =
    /import\s+(?:{([^}]+)}|\*\s+as\s+(\w+)|(\w+))\s+from\s+["']@form(?:\/([^"']+))?["']/g;
  while ((match = formImportRegex.exec(fileContent)) !== null) {
    const subPath = match[4] || "";
    const basePath = subPath
      ? `components/ui/form/${subPath}`
      : `components/ui/form`;

    if (match[1]) {
      const componentNames = match[1]
        .split(",")
        .map((name) =>
          name
            .trim()
            .split(/\s+as\s+/)[0]
            .trim()
        )
        .filter((name) => name && /^[A-Z]/.test(name));

      for (const componentName of componentNames) {
        componentMap.set(componentName, basePath);
      }
    } else if (match[3]) {
      const componentName = match[3].trim();
      if (/^[A-Z]/.test(componentName)) {
        componentMap.set(componentName, basePath);
      }
    } else if (match[2]) {
      componentMap.set("*", basePath);
    }
  }

  return componentMap;
};

/**
 * 파일에서 import하는 컴포넌트 경로를 추출합니다 (실제 사용되는 컴포넌트만)
 * @components/ui와 @components/features 모두 포함합니다
 * @/components도 지원합니다
 * @form alias도 지원합니다
 */
const extractImportedComponentPaths = (fileContent: string): string[] => {
  const paths: string[] = [];

  // 실제로 사용되는 컴포넌트 추출
  const usedComponents = extractUsedComponentsFromJSX(fileContent);
  const importedComponents = extractImportedComponents(fileContent);

  if (import.meta.env.DEV) {
    console.log(
      "[extractImportedComponentPaths] 사용되는 컴포넌트:",
      Array.from(usedComponents)
    );
    console.log(
      "[extractImportedComponentPaths] import된 컴포넌트:",
      Array.from(importedComponents.keys())
    );
  }

  // 실제로 사용되는 컴포넌트의 경로만 추가
  for (const [componentName, importPath] of importedComponents) {
    if (componentName === "*") {
      // namespace import는 경로만 추가
      paths.push(importPath);
      paths.push(`${importPath}/index.tsx`);
      paths.push(`${importPath}/index.ts`);
    } else if (usedComponents.has(componentName)) {
      // 실제로 사용되는 컴포넌트만 경로 추가
      paths.push(importPath);
      paths.push(`${importPath}/index.tsx`);
      paths.push(`${importPath}/index.ts`);
    }
  }

  // @components 또는 @/components로 시작하는 모든 import 경로 찾기 (fallback - 직접 경로)
  const componentsImportRegex = /from\s+["']@\/?components\/([^"']+)["']/g;
  let match;

  while ((match = componentsImportRegex.exec(fileContent)) !== null) {
    const importPath = match[1];
    // 경로를 실제 파일 경로로 변환
    // 예: @components/features/fcm/gl/slip/SlipRegist -> components/features/fcm/gl/slip/SlipRegist
    // 예: @/components/ui/layout/ListDetailLayout -> components/ui/layout/ListDetailLayout
    // 예: @components/ui/form -> components/ui/form
    const componentPath = `components/${importPath}`;
    paths.push(componentPath);

    // index 파일도 시도
    paths.push(`${componentPath}/index.tsx`);
    paths.push(`${componentPath}/index.ts`);

    // FormAgGrid와 SearchForm은 특별 처리: @components/ui/form import 시 직접 추가
    if (importPath === "ui/form" || importPath.startsWith("ui/form/")) {
      paths.push("components/ui/form/AgGrid/FormAgGrid.tsx");
      paths.push("components/ui/form/AgGrid/FormAgGrid.ts");
      paths.push("components/ui/form/SearchForm/SearchForm.tsx");
      paths.push("components/ui/form/SearchForm/SearchForm.ts");
    }

    // @/components/ui/form/AgGrid/FormAgGrid 같은 직접 경로 처리
    if (
      importPath === "ui/form/AgGrid/FormAgGrid" ||
      importPath.startsWith("ui/form/AgGrid/FormAgGrid")
    ) {
      paths.push("components/ui/form/AgGrid/FormAgGrid.tsx");
      paths.push("components/ui/form/AgGrid/FormAgGrid.ts");
    }

    // @/components/ui/form/SearchForm 같은 직접 경로 처리
    if (
      importPath === "ui/form/SearchForm" ||
      importPath.startsWith("ui/form/SearchForm")
    ) {
      paths.push("components/ui/form/SearchForm/SearchForm.tsx");
      paths.push("components/ui/form/SearchForm/SearchForm.ts");
    }
  }

  // @form alias 처리 (components/ui/form로 변환)
  const formImportRegex = /from\s+["']@form(?:\/([^"']+))?["']/g;
  while ((match = formImportRegex.exec(fileContent)) !== null) {
    const subPath = match[1] || "";
    // @form -> components/ui/form
    // @form/AgGrid -> components/ui/form/AgGrid
    const formPath = subPath
      ? `components/ui/form/${subPath}`
      : `components/ui/form`;
    paths.push(formPath);

    // index 파일도 시도
    paths.push(`${formPath}/index.tsx`);
    paths.push(`${formPath}/index.ts`);

    // FormAgGrid는 특별히 처리
    if (subPath === "AgGrid" || subPath === "") {
      paths.push("components/ui/form/AgGrid/FormAgGrid.tsx");
      paths.push("components/ui/form/AgGrid/FormAgGrid.ts");
    }
  }

  // 중복 제거
  const uniquePaths = Array.from(new Set(paths));

  if (import.meta.env.DEV && uniquePaths.length > 0) {
    console.log("[extractImportedComponentPaths] 추출된 경로:", uniquePaths);
  }

  return uniquePaths;
};

/**
 * programPath를 사용하여 파일에서 모든 버튼 정보를 추출합니다 (비동기)
 * 페이지 파일과 관련된 컴포넌트 파일들도 함께 검색합니다
 * 런타임 추출을 사용합니다 (프로덕션 환경에서도 작동)
 */
export const getButtonInfoByProgramPath = async (
  programPath: string | null | undefined
): Promise<FileButtonInfo | null> => {
  if (!programPath) {
    if (import.meta.env.DEV) {
      console.warn("[getButtonInfoByProgramPath] programPath가 없습니다.");
    }
    return null;
  }

  if (import.meta.env.DEV) {
    console.log("[getButtonInfoByProgramPath] programPath:", programPath);
  }

  const fileContent = await getFileContent(programPath);
  if (!fileContent) {
    if (import.meta.env.DEV) {
      console.warn(
        "[getButtonInfoByProgramPath] 파일 내용을 읽을 수 없습니다:",
        programPath
      );
    }
    return null;
  }

  if (import.meta.env.DEV) {
    console.log(
      "[getButtonInfoByProgramPath] 파일 내용 로드 성공, 길이:",
      fileContent.length
    );
  }

  // 메인 파일에서 실제로 렌더링되는 버튼만 추출
  // JSX 렌더링 부분만 추출하여 버튼 검색
  const renderSection = extractRenderSection(fileContent);
  let allButtons = renderSection
    ? extractButtonInfo(renderSection)
    : extractButtonInfo(fileContent);

  // 중복 제거를 위한 Set (objId 기준)
  const uniqueButtonIds = new Set<string>();
  allButtons.forEach((btn) => {
    if (btn.objId && btn.objId.trim()) {
      uniqueButtonIds.add(btn.objId.trim());
    }
  });

  // import하는 컴포넌트 파일들도 검색
  const importedPaths = extractImportedComponentPaths(fileContent);

  if (import.meta.env.DEV && importedPaths.length > 0) {
    console.log(
      "[getButtonInfoByProgramPath] import된 컴포넌트 경로:",
      importedPaths
    );
  }

  // 각 import 경로에서 컴포넌트 파일 찾기 (동적으로 추가되는 경로도 처리)
  const processedPaths = new Set<string>();
  let pathIndex = 0;
  while (pathIndex < importedPaths.length) {
    const importPath = importedPaths[pathIndex];
    pathIndex++;

    // 이미 처리한 경로는 건너뛰기
    if (processedPaths.has(importPath)) {
      continue;
    }
    processedPaths.add(importPath);
    // 1. 먼저 index 파일 확인 (barrel export)
    const indexFiles = [`${importPath}/index.tsx`, `${importPath}/index.ts`];

    let foundIndex = false;
    for (const indexFile of indexFiles) {
      const indexContent = await getFileContent(indexFile);
      if (indexContent) {
        if (import.meta.env.DEV) {
          console.log(
            `[getButtonInfoByProgramPath] index 파일 로드: ${indexFile}`
          );
        }
        // index 파일에서 export하는 컴포넌트 파일들 찾기
        // 예: export { default as DetailView } from './DetailView';
        // 예: export { default } from './DetailView';
        // 예: export { default as FilterPanel } from './FilterPanel';
        const exportRegex = /from\s+["']\.\/([^"']+)["']/g;
        let exportMatch;
        const foundExports = new Set<string>();

        while ((exportMatch = exportRegex.exec(indexContent)) !== null) {
          const exportPath = exportMatch[1];
          if (exportPath && !exportPath.includes("index")) {
            foundExports.add(exportPath);
            // 확장자 제거 (예: AgGrid.tsx -> AgGrid)
            const pathWithoutExt = exportPath.replace(/\.(tsx?|jsx?)$/, "");
            if (pathWithoutExt !== exportPath) {
              foundExports.add(pathWithoutExt);
            }
          }
        }

        // components/ui/form/index.ts인 경우 공통 컴포넌트들 직접 추가
        if (
          importPath === "components/ui/form" ||
          importPath.endsWith("/ui/form")
        ) {
          // FormAgGrid 추가
          const formAgGridFiles = [
            "components/ui/form/AgGrid/FormAgGrid.tsx",
            "components/ui/form/AgGrid/FormAgGrid.ts",
          ];
          for (const formAgGridFile of formAgGridFiles) {
            const formAgGridContent = await getFileContent(formAgGridFile);
            if (formAgGridContent) {
              if (import.meta.env.DEV) {
                console.log(
                  `[getButtonInfoByProgramPath] FormAgGrid 직접 로드: ${formAgGridFile}`
                );
              }
              // FormAgGrid 버튼 추출 및 필터링
              const allProps = extractAllComponentProps(fileContent);
              const agGridButtons = extractButtonInfo(formAgGridContent);
              const filteredButtons = filterButtonsByProps(agGridButtons, {
                formAgGrid: allProps.formAgGrid,
              });
              const newAgGridButtons = deduplicateButtons(
                filteredButtons,
                uniqueButtonIds
              );
              allButtons = [...allButtons, ...newAgGridButtons];
              break;
            }
          }

          // SearchForm 추가
          const searchFormFiles = [
            "components/ui/form/SearchForm/SearchForm.tsx",
            "components/ui/form/SearchForm/SearchForm.ts",
          ];
          for (const searchFormFile of searchFormFiles) {
            const searchFormContent = await getFileContent(searchFormFile);
            if (searchFormContent) {
              if (import.meta.env.DEV) {
                console.log(
                  `[getButtonInfoByProgramPath] SearchForm 직접 로드: ${searchFormFile}`
                );
              }
              // SearchForm 버튼 추출 및 필터링
              const allProps = extractAllComponentProps(fileContent);
              const searchFormButtons = extractButtonInfo(searchFormContent);
              const filteredButtons = filterButtonsByProps(searchFormButtons, {
                searchForm: allProps.searchForm,
              });
              const newSearchFormButtons = deduplicateButtons(
                filteredButtons,
                uniqueButtonIds
              );
              allButtons = [...allButtons, ...newSearchFormButtons];
              break;
            }
          }
        }

        if (import.meta.env.DEV && foundExports.size > 0) {
          console.log(
            `[getButtonInfoByProgramPath] index에서 찾은 export:`,
            Array.from(foundExports)
          );
        }

        // export된 경로의 파일들 로드 (중첩 구조 지원)
        for (const exportPath of foundExports) {
          // SearchForm은 특별 처리
          if (
            exportPath === "SearchForm" ||
            exportPath.includes("SearchForm")
          ) {
            // SearchForm/index.ts를 먼저 확인하여 SearchForm.tsx export 찾기
            const searchFormIndexFiles = [
              `${importPath}/SearchForm/index.tsx`,
              `${importPath}/SearchForm/index.ts`,
            ];

            let searchFormIndexFound = false;
            for (const searchFormIndexFile of searchFormIndexFiles) {
              const searchFormIndexContent =
                await getFileContent(searchFormIndexFile);
              if (searchFormIndexContent) {
                // SearchForm/index.ts에서 SearchForm.tsx export 찾기
                // 예: export { SearchForm, default } from "./SearchForm";
                const searchFormExportRegex =
                  /from\s+["']\.\/(SearchForm|SearchForm\.tsx?)["']/g;
                if (searchFormExportRegex.test(searchFormIndexContent)) {
                  const searchFormFiles = [
                    `${importPath}/SearchForm/SearchForm.tsx`,
                    `${importPath}/SearchForm/SearchForm.ts`,
                  ];
                  for (const searchFormFile of searchFormFiles) {
                    const searchFormContent =
                      await getFileContent(searchFormFile);
                    if (searchFormContent) {
                      if (import.meta.env.DEV) {
                        console.log(
                          `[getButtonInfoByProgramPath] SearchForm 파일 로드: ${searchFormFile}`
                        );
                      }
                      // SearchForm 버튼 추출 및 필터링
                      const allProps = extractAllComponentProps(fileContent);
                      const searchFormButtons =
                        extractButtonInfo(searchFormContent);
                      const filteredButtons = filterButtonsByProps(
                        searchFormButtons,
                        {
                          searchForm: allProps.searchForm,
                        }
                      );
                      const newSearchFormButtons = deduplicateButtons(
                        filteredButtons,
                        uniqueButtonIds
                      );
                      allButtons = [...allButtons, ...newSearchFormButtons];
                      searchFormIndexFound = true;
                      break;
                    }
                  }
                }
                if (searchFormIndexFound) break;
              }
            }

            // SearchForm/index.ts를 찾지 못했거나 SearchForm.tsx export를 찾지 못한 경우 직접 시도
            if (!searchFormIndexFound) {
              const searchFormFiles = [
                `${importPath}/SearchForm/SearchForm.tsx`,
                `${importPath}/SearchForm/SearchForm.ts`,
              ];
              for (const searchFormFile of searchFormFiles) {
                const searchFormContent = await getFileContent(searchFormFile);
                if (searchFormContent) {
                  if (import.meta.env.DEV) {
                    console.log(
                      `[getButtonInfoByProgramPath] SearchForm 파일 직접 로드: ${searchFormFile}`
                    );
                  }
                  // SearchForm은 전체 파일에서 추출하되, 실제 사용되는 prop 값 확인
                  const renderSection = extractRenderSection(fileContent);
                  const searchContent = renderSection || fileContent;
                  const searchFormProps = extractComponentProps(
                    searchContent,
                    "SearchForm"
                  );
                  const searchFormButtons =
                    extractButtonInfo(searchFormContent);

                  // 조건부 렌더링 필터링: 실제로 사용되는 버튼만 추출
                  const filteredSearchFormButtons = searchFormButtons.filter(
                    (btn) => {
                      if (
                        btn.objId === "BTN_SEARCH" &&
                        searchFormProps.showSearch === false
                      ) {
                        return false;
                      }
                      return true;
                    }
                  );

                  // 중복 제거: objId 기준으로 이미 추가된 버튼은 제외
                  const newSearchFormButtons = filteredSearchFormButtons.filter(
                    (btn) => {
                      if (!btn.objId || !btn.objId.trim()) return false;
                      const objId = btn.objId.trim();
                      if (uniqueButtonIds.has(objId)) {
                        return false; // 이미 존재하는 버튼은 제외
                      }
                      uniqueButtonIds.add(objId);
                      return true;
                    }
                  );
                  allButtons = [...allButtons, ...newSearchFormButtons];
                  break;
                }
              }
            }

            // SearchForm 처리를 완료했으므로 다음 exportPath로 이동
            continue;
          }

          // FormAgGrid는 특별 처리 (AgGrid export를 찾으면 FormAgGrid.tsx 직접 로드)
          if (exportPath === "AgGrid" || exportPath.includes("AgGrid")) {
            // AgGrid/index.ts를 먼저 확인하여 FormAgGrid export 찾기
            const agGridIndexFiles = [
              `${importPath}/AgGrid/index.tsx`,
              `${importPath}/AgGrid/index.ts`,
            ];

            let agGridIndexFound = false;
            for (const agGridIndexFile of agGridIndexFiles) {
              const agGridIndexContent = await getFileContent(agGridIndexFile);
              if (agGridIndexContent) {
                // AgGrid/index.ts에서 FormAgGrid export 찾기
                // 예: export { default } from "./FormAgGrid";
                // 예: export { default as FormAgGrid } from "./FormAgGrid";
                const formAgGridExportRegex =
                  /from\s+["']\.\/(FormAgGrid|FormAgGrid\.tsx?)["']/g;
                if (formAgGridExportRegex.test(agGridIndexContent)) {
                  const formAgGridFiles = [
                    `${importPath}/AgGrid/FormAgGrid.tsx`,
                    `${importPath}/AgGrid/FormAgGrid.ts`,
                  ];
                  for (const formAgGridFile of formAgGridFiles) {
                    const formAgGridContent =
                      await getFileContent(formAgGridFile);
                    if (formAgGridContent) {
                      if (import.meta.env.DEV) {
                        console.log(
                          `[getButtonInfoByProgramPath] FormAgGrid 파일 로드: ${formAgGridFile}`
                        );
                      }
                      // FormAgGrid 버튼 추출 및 필터링
                      const allProps = extractAllComponentProps(fileContent);
                      const agGridButtons =
                        extractButtonInfo(formAgGridContent);
                      const filteredButtons = filterButtonsByProps(
                        agGridButtons,
                        {
                          formAgGrid: allProps.formAgGrid,
                        }
                      );
                      const newAgGridButtons = deduplicateButtons(
                        filteredButtons,
                        uniqueButtonIds
                      );
                      allButtons = [...allButtons, ...newAgGridButtons];
                      agGridIndexFound = true;
                      break;
                    }
                  }
                }
                if (agGridIndexFound) break;
              }
            }

            // AgGrid/index.ts를 찾지 못했거나 FormAgGrid export를 찾지 못한 경우 직접 시도
            if (!agGridIndexFound) {
              const agGridFiles = [
                `${importPath}/AgGrid/FormAgGrid.tsx`,
                `${importPath}/AgGrid/FormAgGrid.ts`,
              ];
              for (const agGridFile of agGridFiles) {
                const agGridContent = await getFileContent(agGridFile);
                if (agGridContent) {
                  if (import.meta.env.DEV) {
                    console.log(
                      `[getButtonInfoByProgramPath] FormAgGrid 파일 직접 로드: ${agGridFile}`
                    );
                  }
                  // FormAgGrid 버튼 추출 및 필터링
                  const allProps = extractAllComponentProps(fileContent);
                  const agGridButtons = extractButtonInfo(agGridContent);
                  const filteredButtons = filterButtonsByProps(agGridButtons, {
                    formAgGrid: allProps.formAgGrid,
                  });
                  const newAgGridButtons = deduplicateButtons(
                    filteredButtons,
                    uniqueButtonIds
                  );
                  allButtons = [...allButtons, ...newAgGridButtons];
                  break;
                }
              }
            }

            // AgGrid 처리를 완료했으므로 다음 exportPath로 이동
            continue;
          }

          // 1. 직접 파일 시도: ComponentName.tsx, ComponentName.ts
          const directFiles = [
            `${importPath}/${exportPath}.tsx`,
            `${importPath}/${exportPath}.ts`,
          ];

          // 2. 중첩 구조 시도: ComponentName/ComponentName.tsx, ComponentName/index.tsx
          const nestedFiles = [
            `${importPath}/${exportPath}/${exportPath}.tsx`,
            `${importPath}/${exportPath}/${exportPath}.ts`,
            `${importPath}/${exportPath}/index.tsx`,
            `${importPath}/${exportPath}/index.ts`,
          ];

          // 모든 가능한 파일 경로 시도
          const allPossibleFiles = [...directFiles, ...nestedFiles];

          for (const exportFile of allPossibleFiles) {
            const exportContent = await getFileContent(exportFile);
            if (exportContent) {
              if (import.meta.env.DEV) {
                console.log(
                  `[getButtonInfoByProgramPath] export 파일 로드: ${exportFile}`
                );
              }
              // export 파일에서 버튼 추출 및 필터링
              const allProps = extractAllComponentProps(exportContent);
              const exportButtons = extractButtonInfo(exportContent);
              const filteredButtons = filterButtonsByProps(
                exportButtons,
                allProps
              );
              const newExportButtons = deduplicateButtons(
                filteredButtons,
                uniqueButtonIds
              );
              allButtons = [...allButtons, ...newExportButtons];

              // export 파일에서도 실제로 import된 컴포넌트만 추적
              const nestedImportedPaths =
                extractImportedComponentPaths(exportContent);
              for (const nestedImportPath of nestedImportedPaths) {
                // 중복 방지: 이미 처리한 경로는 건너뛰기
                if (
                  processedPaths.has(nestedImportPath) ||
                  importedPaths.includes(nestedImportPath)
                ) {
                  continue;
                }
                importedPaths.push(nestedImportPath);
              }

              break; // 파일을 찾았으면 다음 exportPath로 이동
            }
          }
        }

        foundIndex = true;
        break;
      }
    }

    // 2. index 파일이 없거나 export를 찾지 못한 경우, 일반적인 컴포넌트 파일명 패턴 시도
    if (!foundIndex) {
      const pathParts = importPath.split("/");
      const componentDir = pathParts.slice(0, -1).join("/");
      const componentName = pathParts[pathParts.length - 1];

      // 일반적인 컴포넌트 파일명 패턴 시도
      const possibleFiles = [
        `${componentDir}/${componentName}/DetailView.tsx`,
        `${componentDir}/${componentName}/DetailView.ts`,
        `${componentDir}/${componentName}/FilterPanel.tsx`,
        `${componentDir}/${componentName}/FilterPanel.ts`,
        `${componentDir}/${componentName}/RecordList.tsx`,
        `${componentDir}/${componentName}/RecordList.ts`,
        `${componentDir}/${componentName}/DetailGrid.tsx`,
        `${componentDir}/${componentName}/DetailGrid.ts`,
      ];

      for (const filePath of possibleFiles) {
        const componentContent = await getFileContent(filePath);
        if (componentContent) {
          if (import.meta.env.DEV) {
            console.log(
              `[getButtonInfoByProgramPath] 컴포넌트 파일 로드: ${filePath}`
            );
          }

          // 컴포넌트 파일에서 버튼 추출 및 필터링
          const allProps = extractAllComponentProps(componentContent);
          const componentButtons = extractButtonInfo(componentContent);
          const filteredButtons = filterButtonsByProps(
            componentButtons,
            allProps
          );
          const newComponentButtons = deduplicateButtons(
            filteredButtons,
            uniqueButtonIds
          );
          allButtons = [...allButtons, ...newComponentButtons];
        }
      }
    }
  }

  // 최종 중복 제거 (objId 기준)
  const finalUniqueButtons: ButtonInfo[] = [];
  const finalUniqueIds = new Set<string>();
  for (const btn of allButtons) {
    if (!btn.objId || !btn.objId.trim()) continue;
    const objId = btn.objId.trim();
    if (!finalUniqueIds.has(objId)) {
      finalUniqueIds.add(objId);
      finalUniqueButtons.push(btn);
    }
  }

  if (import.meta.env.DEV) {
    console.log(
      `[getButtonInfoByProgramPath] 추출된 버튼 수: ${finalUniqueButtons.length} (중복 제거 전: ${allButtons.length})`,
      finalUniqueButtons
    );
  }

  return {
    filePath: programPath,
    buttons: finalUniqueButtons,
  };
};
