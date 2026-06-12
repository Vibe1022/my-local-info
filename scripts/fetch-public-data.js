const fs = require('fs');
const path = require('path');

// 한국 시간 기준 오늘 날짜 구하기 (KST)
function getTodayKst() {
  const now = new Date();
  const utc = now.getTime() + (now.getTimezoneOffset() * 60 * 1000);
  const kst = new Date(utc + (9 * 60 * 60 * 1000));
  return kst.toISOString().split('T')[0];
}

async function main() {
  const PUBLIC_DATA_API_KEY = process.env.PUBLIC_DATA_API_KEY;
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!PUBLIC_DATA_API_KEY) {
    console.error("오류: PUBLIC_DATA_API_KEY 환경변수가 설정되지 않았습니다.");
    process.exit(1);
  }

  if (!GEMINI_API_KEY) {
    console.error("오류: GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
    process.exit(1);
  }

  const jsonFilePath = path.join(process.cwd(), 'public', 'data', 'local-info.json');

  // 기존 데이터 로드
  let localInfo;
  try {
    const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
    localInfo = JSON.parse(fileContent);
  } catch (error) {
    console.error("기존 local-info.json 파일을 읽거나 분석하는 데 실패했습니다.", error);
    process.exit(1);
  }

  // 1단계: 공공데이터포털 API에서 데이터 가져오기
  console.log("공공데이터 API에서 데이터를 가져오는 중...");
  const publicDataUrl = 'https://api.odcloud.kr/api/gov24/v3/serviceList?page=1&perPage=20&returnType=JSON';
  
  let apiData;
  try {
    const response = await fetch(publicDataUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Infuser ${PUBLIC_DATA_API_KEY}`,
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API 응답 오류: ${response.status} ${response.statusText}`);
    }

    const resJson = await response.json();
    apiData = resJson.data;

    if (!apiData || !Array.isArray(apiData)) {
      throw new Error("API로부터 받은 데이터가 유효한 배열 형식이 아닙니다.");
    }
  } catch (error) {
    console.error("공공데이터 API 호출 실패 (기존 데이터를 유지합니다):", error);
    process.exit(1);
  }

  // 필터링 적용
  // 1. 서비스명, 서비스목적요약, 지원대상, 소관기관명 중 "성남" 포함 항목 필터링
  let filtered = apiData.filter(item => 
    (item.서비스명 && item.서비스명.includes("성남")) ||
    (item.서비스목적요약 && item.서비스목적요약.includes("성남")) ||
    (item.지원대상 && item.지원대상.includes("성남")) ||
    (item.소관기관명 && item.소관기관명.includes("성남"))
  );

  // 2. "성남"이 없으면 "경기" 포함 항목 필터링
  if (filtered.length === 0) {
    filtered = apiData.filter(item => 
      (item.서비스명 && item.서비스명.includes("경기")) ||
      (item.서비스목적요약 && item.서비스목적요약.includes("경기")) ||
      (item.지원대상 && item.지원대상.includes("경기")) ||
      (item.소관기관명 && item.소관기관명.includes("경기"))
    );
  }

  // 3. "경기"도 없으면 전체 데이터 사용
  if (filtered.length === 0) {
    filtered = apiData;
  }

  // 2단계: 기존 데이터와 비교 (name 기준 중복 제거)
  const existingNames = new Set(localInfo.items.map(item => item.name));
  const uniqueNewItems = filtered.filter(item => !existingNames.has(item.서비스명));

  if (uniqueNewItems.length === 0) {
    console.log("새로운 데이터가 없습니다");
    process.exit(0);
  }

  // 3단계: Gemini AI로 새 항목 1개만 가공
  const targetItem = uniqueNewItems[0];
  console.log(`새로운 공공서비스 발견: "${targetItem.서비스명}". Gemini AI로 정제 중...`);

  const todayStr = getTodayKst();
  const prompt = `아래 공공데이터 1건을 분석해서 JSON 객체로 변환해줘. 형식:
{id: 숫자, name: 서비스명, category: '행사' 또는 '혜택', startDate: 'YYYY-MM-DD', endDate: 'YYYY-MM-DD', location: 장소 또는 기관명, target: 지원대상, summary: 한줄요약, link: 상세URL}
category는 내용을 보고 행사/축제면 '행사', 지원금/서비스면 '혜택'으로 판단해.
startDate가 없으면 오늘 날짜(오늘 날짜: ${todayStr}), endDate가 없으면 '상시'로 넣어.
반드시 JSON 객체만 출력해. 다른 텍스트 없이.

공공데이터:
${JSON.stringify(targetItem, null, 2)}`;

  let geminiResultText;
  try {
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;
    const response = await fetch(geminiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API 응답 오류: ${response.status} ${response.statusText}`);
    }

    const resJson = await response.json();
    geminiResultText = resJson.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API 호출 실패 (기존 데이터를 유지합니다):", error);
    process.exit(1);
  }

  // Gemini 응답에서 JSON 부분만 파싱 (마크다운 코드블록 제거)
  let processedItem;
  try {
    const jsonMatch = geminiResultText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("응답에서 JSON 객체 형식을 찾을 수 없습니다.");
    }
    processedItem = JSON.parse(jsonMatch[0]);
  } catch (error) {
    console.error("Gemini 응답 JSON 파싱 실패 (기존 데이터를 유지합니다). 원본 응답:", geminiResultText, error);
    process.exit(1);
  }

  // 4단계: 기존 데이터에 추가
  // ID 자동 생성 (기존 ID 중 최대값 + 1을 문자열로 변환하여 할당)
  const existingIds = localInfo.items.map(item => parseInt(item.id, 10)).filter(id => !isNaN(id));
  const nextId = existingIds.length > 0 ? Math.max(...existingIds) + 1 : 1;
  processedItem.id = String(nextId);

  // 데이터 무결성 체크 및 포맷팅 보장
  if (!processedItem.name) processedItem.name = targetItem.서비스명;
  if (!processedItem.category) processedItem.category = "혜택";
  if (!processedItem.startDate) processedItem.startDate = todayStr;
  if (!processedItem.endDate) processedItem.endDate = "상시";
  if (!processedItem.location) processedItem.location = targetItem.소관기관명 || "미지정";
  if (!processedItem.target) processedItem.target = targetItem.지원대상 || "누구나";
  if (!processedItem.summary) processedItem.summary = targetItem.서비스목적요약 || "요약 정보 없음";
  if (!processedItem.link) processedItem.link = "#";

  // 기존 데이터에 추가 및 업데이트
  localInfo.lastUpdated = todayStr;
  localInfo.items.push(processedItem);

  try {
    fs.writeFileSync(jsonFilePath, JSON.stringify(localInfo, null, 2), 'utf8');
    console.log(`추가 성공: "${processedItem.name}" (ID: ${processedItem.id}) 항목이 등록되었습니다.`);
  } catch (error) {
    console.error("파일 저장 실패 (기존 데이터를 유지합니다):", error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error("알 수 없는 시스템 오류가 발생했습니다:", error);
  process.exit(1);
});
