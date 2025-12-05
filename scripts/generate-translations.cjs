/**
 * 프로젝트 명  : ONERP
 * 파일 명     : generate-translations.cjs
 * 설명        : Backend API에서 다국어 데이터를 가져와서 translation.json 파일을 생성하는 스크립트
 * 변경이력    :
 * - 2025.11.18 : 최초 작성
 * - 2025.11.18 : .cjs 확장자로 변경 (ES module 호환성)
 * - 2025.11.19 : LABLE_DESC 컬럼 지원 (Backend에서 {key}_desc 형식으로 처리됨)
 * 
 * 참고: Backend의 LanguageService에서 LABLE_DESC 값이 있으면 {key}_desc 형식으로
 *       별도 키로 저장하므로, 이 스크립트는 받은 데이터를 그대로 저장하면 됩니다.
 *       예: { "menu": { "login": "로그인", "login_desc": "로그인 설명" } }
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

/**
 * HTTP/HTTPS 요청을 수행하여 데이터를 가져옵니다.
 * 
 * @param {string} url - 요청할 URL
 * @returns {Promise<string>} 응답 데이터
 */
function fetchData(url) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const client = urlObj.protocol === 'https:' ? https : http;
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = client.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
}

/**
 * API 응답 데이터를 translation.json 형식으로 변환하여 파일로 저장
 * 
 * Backend에서 받은 데이터 구조:
 * {
 *   "success": true,
 *   "data": {
 *     "ko": {
 *       "menu": {
 *         "login": "로그인",
 *         "login_desc": "로그인 설명"  // LABLE_DESC가 있을 때만 존재
 *       }
 *     },
 *     "en": { ... }
 *   }
 * }
 * 
 * @param {Object} apiData - Backend API 응답 데이터
 */
function generateTranslationFiles(apiData) {
  try {
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
    throw error;
  }
}

/**
 * 메인 실행 함수
 */
async function main() {
  const args = process.argv.slice(2);
  
  // 사용법 안내
  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    console.log(`
사용법:
  node generate-translations.cjs <API_URL> [output_file]
  
예시:
  # 개발서버에서 직접 가져오기
  node generate-translations.cjs http://222.106.252.150:8081/api/system/language/translations
  
  # 로컬 파일에서 읽기
  node generate-translations.cjs file://./translations.json
  
  # 로컬 파일 경로 지정
  node generate-translations.cjs ./translations.json
    `);
    process.exit(0);
  }

  const input = args[0];
  const outputFile = args[1] || path.join(__dirname, '../translations.json');

  try {
    let apiData;

    // URL인지 파일 경로인지 확인
    if (input.startsWith('http://') || input.startsWith('https://')) {
      // HTTP/HTTPS 요청
      console.log(`📡 Fetching translation data from: ${input}`);
      const response = await fetchData(input);
      apiData = JSON.parse(response);
      console.log('✅ Successfully fetched translation data from API');
      
      // 응답 데이터를 파일로도 저장 (선택사항)
      if (outputFile) {
        fs.writeFileSync(outputFile, JSON.stringify(apiData, null, 2), 'utf8');
        console.log(`💾 Saved API response to: ${outputFile}`);
      }
    } else if (input.startsWith('file://')) {
      // file:// 프로토콜 처리
      const filePath = input.replace('file://', '');
      if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        process.exit(1);
      }
      console.log(`📂 Reading translation data from: ${filePath}`);
      apiData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } else {
      // 일반 파일 경로
      if (!fs.existsSync(input)) {
        console.error(`❌ File not found: ${input}`);
        console.log('💡 Tip: Use --help to see usage examples');
        process.exit(1);
      }
      console.log(`📂 Reading translation data from: ${input}`);
      apiData = JSON.parse(fs.readFileSync(input, 'utf8'));
    }

    // translation.json 파일 생성
    generateTranslationFiles(apiData);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('⚠️  Using default translation files');
    process.exit(1);
  }
}

// 메인 실행
main();

