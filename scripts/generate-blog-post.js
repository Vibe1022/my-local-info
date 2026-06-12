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
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error("오류: GEMINI_API_KEY 환경변수가 설정되지 않았습니다.");
    process.exit(1);
  }

  // 1단계: 최신 데이터 확인
  const jsonFilePath = path.join(process.cwd(), 'public', 'data', 'local-info.json');
  let localInfo;
  try {
    const fileContent = fs.readFileSync(jsonFilePath, 'utf8');
    localInfo = JSON.parse(fileContent);
  } catch (error) {
    console.error("local-info.json 파일을 읽을 수 없습니다:", error);
    process.exit(1);
  }

  if (!localInfo.items || localInfo.items.length === 0) {
    console.error("공공서비스 데이터가 비어 있습니다.");
    process.exit(1);
  }

  const targetItem = localInfo.items[localInfo.items.length - 1];
  const postsDir = path.join(process.cwd(), 'src', 'content', 'posts');

  // posts 폴더가 존재하지 않으면 생성
  if (!fs.existsSync(postsDir)) {
    fs.mkdirSync(postsDir, { recursive: true });
  }

  // 기존 파일 중 이미 같은 name이 포함되어 있는지 확인
  let isAlreadyWritten = false;
  try {
    const files = fs.readdirSync(postsDir).filter(file => file.endsWith('.md'));
    for (const file of files) {
      const content = fs.readFileSync(path.join(postsDir, file), 'utf8');
      // targetItem.name이 본문 혹은 메타데이터에 포함되어 있다면 이미 작성된 글로 판단
      if (content.includes(targetItem.name)) {
        isAlreadyWritten = true;
        break;
      }
    }
  } catch (error) {
    console.error("기존 블로그 글들을 읽는 도중 오류 발생:", error);
    process.exit(1);
  }

  if (isAlreadyWritten) {
    console.log("이미 작성된 글입니다");
    process.exit(0);
  }

  // 2단계: Gemini AI로 블로그 글 생성
  console.log(`새 글 생성을 시작합니다. 대상 서비스: "${targetItem.name}"`);
  
  const todayStr = getTodayKst();
  const prompt = `아래 공공서비스 정보를 바탕으로 블로그 글을 작성해줘.

정보: ${JSON.stringify(targetItem, null, 2)}

아래 형식으로 출력해줘. 반드시 이 형식만 출력하고 다른 텍스트는 없이:
---
title: (친근하고 흥미로운 제목)
date: ${todayStr}
summary: (한 줄 요약)
category: 정보
tags: [태그1, 태그2, 태그3]
---

(본문: 800자 이상, 친근한 블로그 톤, 추천 이유 3가지 포함, 신청 방법 안내)

마지막 줄에 FILENAME: ${todayStr}-keyword 형식으로 파일명도 출력해줘. 키워드는 영문으로.`;

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
    if (!resJson.candidates || resJson.candidates.length === 0 || !resJson.candidates[0].content || !resJson.candidates[0].content.parts || resJson.candidates[0].content.parts.length === 0) {
      throw new Error("Gemini 응답 형식이 올바르지 않습니다.");
    }
    geminiResultText = resJson.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API 호출 실패:", error);
    process.exit(1);
  }

  // 3단계: 파일명 추출 및 본문 정제
  let cleanedContent = geminiResultText.trim();
  
  // 만약 마크다운 코드 블록(```)으로 감싸져 있다면 제거
  cleanedContent = cleanedContent.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');

  const filenameMatch = cleanedContent.match(/FILENAME:\s*([^\n\r]+)/i);
  let filename = '';
  if (filenameMatch) {
    filename = filenameMatch[1].trim();
    // FILENAME 라인 제거
    cleanedContent = cleanedContent.replace(/FILENAME:\s*[^\n\r]*/i, '').trim();
  } else {
    // 대체 파일명 생성
    filename = `${todayStr}-public-service`;
  }

  if (!filename.endsWith('.md')) {
    filename += '.md';
  }

  const outputFilePath = path.join(postsDir, filename);

  try {
    fs.writeFileSync(outputFilePath, cleanedContent, 'utf8');
    console.log(`블로그 글 생성 성공! 저장 경로: ${outputFilePath}`);
  } catch (error) {
    console.error("블로그 글 파일 저장 실패:", error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error("알 수 없는 시스템 오류가 발생했습니다:", error);
  process.exit(1);
});
