/**
 * 버튼 정보 추출 공통 로직
 *
 * Node.js 환경(빌드 타임)과 브라우저 환경(런타임) 모두에서 사용 가능한
 * 순수 함수들로 구성되어 있습니다.
 */

// 정규식 상수 (재사용을 위해 미리 컴파일)
export const REGEX_OBJ_ID_STRING = /objId\s*=\s*["']([^"']+)["']/s;
export const REGEX_OBJ_ID_TEMPLATE = /objId\s*=\s*\{`([^`]+)`\}/;
export const REGEX_SELF_CLOSING_TAG = /\/>\s*$/m;
export const REGEX_CHILDREN_TEXT = />\s*([^<{]+?)\s*</s;
export const REGEX_CHILDREN_EXPR = />\s*\{([^}]+)\}\s*</;
export const REGEX_HIDE_BUTTONS =
  /hideButtons\s*=\s*\{[^}]*\[([^\]]*)\][^}]*\}/;
export const REGEX_ENABLE_EXPAND = /enableExpand\s*=\s*\{?true/;
export const REGEX_FORM_BUTTON_TAG = /<FormButton[\s\S]*?<\/FormButton>/g;

/**
 * ActionButtonGroup의 기본 objId 목록
 */
export const ACTION_BUTTON_GROUP_OBJ_IDS = [
  "BTN_CREATE",
  "BTN_EDIT",
  "BTN_COPY",
  "BTN_DELETE",
  "BTN_SAVE",
];

/**
 * 버튼 타입을 objId로 변환하는 맵
 */
export const BUTTON_TYPE_TO_OBJ_ID: Record<string, string> = {
  create: "BTN_CREATE",
  edit: "BTN_EDIT",
  copy: "BTN_COPY",
  delete: "BTN_DELETE",
  save: "BTN_SAVE",
  expand: "BTN_EXPAND",
};

/**
 * 버튼 정보 (line 정보 제외)
 */
export interface ButtonInfoCore {
  objId: string | null;
  buttonName: string;
  buttonType: string;
}

/**
 * JSX 블록 문자열에서 버튼 정보를 추출합니다.
 */
export function extractButtonFromJsxBlock(
  jsxBlock: string,
  buttonType: "FormButton" | "Button" = "FormButton"
): ButtonInfoCore | null {
  if (!jsxBlock.includes(`<${buttonType}`)) {
    return null;
  }

  const objIdMatch =
    REGEX_OBJ_ID_STRING.exec(jsxBlock) || REGEX_OBJ_ID_TEMPLATE.exec(jsxBlock);
  const objId = objIdMatch ? objIdMatch[1].trim() : null;

  let buttonName = "";

  if (REGEX_SELF_CLOSING_TAG.test(jsxBlock)) {
    buttonName = "[아이콘 버튼]";
  } else {
    const textBetweenTags = jsxBlock
      .replace(/<[^>]+>/g, "")
      .replace(/\{[^}]+\}/g, "")
      .trim();

    if (textBetweenTags) {
      const firstLine = textBetweenTags.indexOf("\n");
      buttonName =
        firstLine > 0
          ? textBetweenTags.slice(0, firstLine).trim()
          : textBetweenTags;
    } else {
      const childrenMatch = REGEX_CHILDREN_TEXT.exec(jsxBlock);
      if (childrenMatch) {
        const matchText = childrenMatch[1].trim();
        const firstLine = matchText.indexOf("\n");
        buttonName =
          firstLine > 0 ? matchText.slice(0, firstLine).trim() : matchText;
      } else {
        const childrenExprMatch = REGEX_CHILDREN_EXPR.exec(jsxBlock);
        if (childrenExprMatch) {
          buttonName = `{${childrenExprMatch[1].trim()}}`;
        }
      }
    }

    if (!buttonName) {
      buttonName = "[버튼]";
    }
  }

  return {
    objId,
    buttonName: buttonName || "[버튼]",
    buttonType,
  };
}

/**
 * ActionButtonGroup의 JSX 블록을 추출합니다.
 */
export function extractActionButtonGroupBlock(
  lines: string[],
  startIndex: number
): string | null {
  let jsxBlock = "";
  let bracketCount = 0;
  let inJsxBlock = false;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    jsxBlock += line + "\n";

    if (!inJsxBlock && line.includes("<ActionButtonGroup")) {
      inJsxBlock = true;
      bracketCount = 1;
    }

    if (inJsxBlock) {
      // bracketCount 계산 최적화 (match 대신 직접 카운팅)
      for (let j = 0; j < line.length; j++) {
        if (line[j] === "<") bracketCount++;
        else if (line[j] === ">") bracketCount--;
      }

      if (bracketCount === 0) {
        break;
      }
    }
  }

  return inJsxBlock ? jsxBlock.trim() : null;
}

/**
 * JSX 블록에서 버튼 정보를 추출합니다.
 */
export function extractButtonFromJsx(
  lines: string[],
  startIndex: number,
  buttonType: "FormButton" | "Button"
): ButtonInfoCore | null {
  let jsxBlock = "";
  let bracketCount = 0;
  let inJsxBlock = false;
  const openTag = `<${buttonType}`;

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i];
    jsxBlock += line + "\n";

    if (!inJsxBlock && line.includes(openTag)) {
      inJsxBlock = true;
    }

    if (inJsxBlock) {
      // bracketCount 계산 최적화 (match 대신 직접 카운팅)
      for (let j = 0; j < line.length; j++) {
        if (line[j] === "<") bracketCount++;
        else if (line[j] === ">") bracketCount--;
      }

      if (bracketCount === 0 && line.includes(">")) {
        break;
      }
    }
  }

  if (!inJsxBlock) {
    return null;
  }

  return extractButtonFromJsxBlock(jsxBlock, buttonType);
}

/**
 * 파일 내용에서 버튼 정보를 추출합니다 (line 정보 없이)
 * @param fileContent 파일 내용
 * @returns 버튼 정보 배열
 */
export function extractButtonInfoCore(fileContent: string): ButtonInfoCore[] {
  if (!fileContent) {
    return [];
  }

  const results: ButtonInfoCore[] = [];
  const lines = fileContent.split("\n");
  const processedCustomButtonsRanges = new Set<string>(); // 이미 처리한 범위 추적

  // customButtons 배열을 직접 찾는 함수 (파일 전체를 문자열로 처리)
  const extractCustomButtonsFromFile = (): void => {
    // customButtons 키워드 찾기 (여러 줄 패턴 지원)
    const customButtonsKeyword = /const\s+customButtons\s*=/g;
    const customButtonsInObject = /customButtons\s*:/g;

    // 1. const customButtons = 패턴 찾기
    let match;
    while ((match = customButtonsKeyword.exec(fileContent)) !== null) {
      const keywordIndex = match.index;
      const rangeKey = `${keywordIndex}`;

      if (processedCustomButtonsRanges.has(rangeKey)) {
        continue;
      }

      // keywordIndex 이후에서 배열 시작 [ 찾기
      let arrayStartIndex = -1;
      const searchStart = keywordIndex + match[0].length;

      // useMemo(() => [ 패턴인지 확인
      const afterKeyword = fileContent.slice(searchStart, searchStart + 100);
      const useMemoMatch = afterKeyword.match(
        /useMemo\s*\([\s\S]{0,50}?\(\)\s*=>\s*\[/
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

        for (const buttonMatch of customButtonMatches) {
          const customButtonInfo = extractButtonFromJsxBlock(
            buttonMatch[0],
            "FormButton"
          );
          if (customButtonInfo) {
            results.push({
              objId: customButtonInfo.objId,
              buttonName: customButtonInfo.buttonName,
              buttonType: "ActionButtonGroup",
            });
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

        for (const buttonMatch of customButtonMatches) {
          const customButtonInfo = extractButtonFromJsxBlock(
            buttonMatch[0],
            "FormButton"
          );
          if (customButtonInfo) {
            results.push({
              objId: customButtonInfo.objId,
              buttonName: customButtonInfo.buttonName,
              buttonType: "ActionButtonGroup",
            });
          }
        }

        processedCustomButtonsRanges.add(rangeKey);
      }
    }
  };

  // 파일 전체에서 customButtons 배열 추출
  extractCustomButtonsFromFile();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // FormButton 찾기 (objId가 있어도 없어도 추출)
    if (line.includes("<FormButton")) {
      const buttonInfo = extractButtonFromJsx(lines, i, "FormButton");
      if (buttonInfo) {
        results.push({
          objId: buttonInfo.objId,
          buttonName: buttonInfo.buttonName,
          buttonType: "FormButton",
        });
      }
    }

    // ActionButtonGroup 찾기
    if (line.includes("<ActionButtonGroup")) {
      const actionButtonGroupBlock = extractActionButtonGroupBlock(lines, i);

      if (actionButtonGroupBlock) {
        // hideButtons prop 분석 (예: hideButtons={["edit", "copy"]})
        const hideButtonsMatch =
          actionButtonGroupBlock.match(REGEX_HIDE_BUTTONS);
        const hiddenButtons = new Set<string>();
        if (hideButtonsMatch) {
          // 문자열 배열에서 버튼 타입 추출 (예: "edit", "copy", "delete")
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

        // 1. 기본 버튼 objId들 추가 (hideButtons로 숨겨진 것 제외)
        ACTION_BUTTON_GROUP_OBJ_IDS.forEach((objId) => {
          if (!hiddenButtons.has(objId)) {
            results.push({
              objId,
              buttonName: `ActionButtonGroup - ${objId}`,
              buttonType: "ActionButtonGroup",
            });
          }
        });

        // 2. enableExpand가 true인 경우 BTN_EXPAND 추가 (hideButtons에 포함되지 않은 경우만)
        if (
          REGEX_ENABLE_EXPAND.test(actionButtonGroupBlock) &&
          !hiddenButtons.has("BTN_EXPAND")
        ) {
          results.push({
            objId: "BTN_EXPAND",
            buttonName: "ActionButtonGroup - BTN_EXPAND",
            buttonType: "ActionButtonGroup",
          });
        }

        // 3. customButtons 내부의 FormButton들 추출
        // customButtons={[...]} 형태의 배열 내부에서 FormButton 찾기
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
              // customButtons 배열 내용에서 FormButton들 추출
              const customButtonMatches = Array.from(
                customButtonsContent.matchAll(REGEX_FORM_BUTTON_TAG)
              );

              for (const match of customButtonMatches) {
                const customButtonInfo = extractButtonFromJsxBlock(
                  match[0],
                  "FormButton"
                );
                // 개선: objId가 없어도 버튼 이름으로 추출 (objId는 null로)
                if (customButtonInfo) {
                  results.push({
                    objId: customButtonInfo.objId,
                    buttonName: customButtonInfo.buttonName,
                    buttonType: "ActionButtonGroup",
                  });
                }
              }
            }
          }
        }
      }
    }

    // 일반 Button 찾기 (objId가 있어도 없어도 추출)
    if (line.includes("<Button")) {
      const buttonInfo = extractButtonFromJsx(lines, i, "Button");
      if (buttonInfo) {
        results.push({
          objId: buttonInfo.objId,
          buttonName: buttonInfo.buttonName,
          buttonType: "Button",
        });
      }
    }
  }

  return results;
}
