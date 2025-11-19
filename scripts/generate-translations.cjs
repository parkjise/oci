/**
 * 프로젝트 명  : ONERP
 * 파일 명     : generate-translations.cjs
 * 설명        : Backend API에서 다국어 데이터를 가져와서 translation.json 파일을 생성하는 스크립트
 * 변경이력    :
 * - 2025.11.18 : 최초 작성
 * - 2025.11.18 : .cjs 확장자로 변경 (ES module 호환성)
 */

const fs = require('fs');
const path = require('path');

/**
 * API 응답 데이터를 translation.json 형식으로 변환하여 파일로 저장
 * 
 * @param {string} apiDataPath - Backend API 응답 JSON 파일 경로
 */
function generateTranslationFiles(apiDataPath) {
  try {
    // API 응답 데이터 읽기
    if (!fs.existsSync(apiDataPath)) {
      console.log('⚠️  Translation data file not found, using default translation files');
      return;
    }

    const apiData = JSON.parse(fs.readFileSync(apiDataPath, 'utf8'));
    
    // API 응답 형식 확인: { "success": true, "data": { "ko": {...}, "en": {...} } }
    const translations = apiData.data || apiData;
    
    // 지원 언어 목록
    const languages = ['ko', 'en'];
    
    // 각 언어별로 translation.json 파일 생성
    languages.forEach(lang => {
      const translation = translations[lang] || {};
      
      // translation.json 파일 경로
      const filePath = path.join(__dirname, `../src/language/${lang}/translation.json`);
      const dirPath = path.dirname(filePath);
      
      // 디렉토리가 없으면 생성
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
      
      // JSON 파일로 저장 (들여쓰기 2칸)
      fs.writeFileSync(filePath, JSON.stringify(translation, null, 2), 'utf8');
      console.log(`✅ Generated ${filePath}`);
    });
    
    console.log('✅ Translation files generated successfully!');
  } catch (error) {
    console.error('❌ Error generating translation files:', error.message);
    console.error('⚠️  Using default translation files');
    // 에러가 발생해도 기본 파일을 사용하므로 프로세스를 종료하지 않음
  }
}

// 메인 실행
const apiDataPath = process.argv[2] || path.join(__dirname, '../translations.json');
generateTranslationFiles(apiDataPath);

