import Link from "next/link";
import localData from "../../public/data/local-info.json";

interface InfoItem {
  id: string;
  name: string;
  category: "행사" | "혜택" | string;
  startDate: string;
  endDate: string;
  location: string;
  target: string;
  summary: string;
  link: string;
}

// "2026-04-05" 형식의 날짜에서 월과 일을 추출해 주는 알기 쉬운 조력자 함수입니다.
function getMonthAndDay(dateStr: string) {
  const parts = dateStr.split("-");
  if (parts.length === 3) {
    return {
      month: parseInt(parts[1], 10) + "월",
      day: parts[2]
    };
  }
  return { month: "정보", day: "N" };
}

export default function Home() {
  const { lastUpdated, items } = localData as { lastUpdated: string; items: InfoItem[] };

  // 카테고리별로 데이터 분류
  const events = items.filter((item) => item.category === "행사");
  const benefits = items.filter((item) => item.category === "혜택");

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-800 font-sans flex flex-col justify-between">
      
      {/* 1. 상단 큰 배너 (하늘색 배경에 큰 글씨) */}
      <section className="bg-gradient-to-r from-sky-400 to-sky-300 py-12 md:py-16 text-center shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 10%, transparent 11%)', backgroundSize: '12px 12px' }} />
        <div className="max-w-4xl mx-auto px-5 relative z-10 space-y-3">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
            성남시 알림방 📢
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
            우리 동네 소식통
          </h2>
          <p className="text-sky-50 text-sm md:text-base font-light tracking-wide max-w-lg mx-auto leading-relaxed">
            행사 정보와 나를 위한 지원금 혜택을 네이버 블로그처럼 깔끔하게 모아두었습니다.
          </p>
        </div>
      </section>

      {/* 2. 상단 고정 헤더 역할 (블로그 프로필/카테고리 네비게이션 스타일) */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🏡</span>
            <span className="font-bold text-slate-900 text-sm md:text-base">성남시 생활정보 통합보드</span>
          </div>
          <div className="flex items-center space-x-1.5 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-500">매일 자동 업데이트 중</span>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 영역 (네이버 블로그 스타일로 깔끔하고 가독성 좋게 구성) */}
      <main className="max-w-4xl mx-auto px-5 py-10 flex-grow w-full space-y-12">
        
        {/* [행사/축제 섹션] */}
        <section>
          <div className="flex items-center space-x-2 mb-6 border-b border-slate-200 pb-3">
            <span className="text-xl">🎉</span>
            <h2 className="text-lg md:text-xl font-bold text-slate-950 tracking-tight">
              이번 달 주요 행사 & 축제 소식
            </h2>
            <span className="text-xs bg-sky-100 text-sky-700 px-2.5 py-0.5 rounded-full font-bold">
              {events.length}건
            </span>
          </div>
          
          <div className="space-y-5">
            {events.map((event) => {
              const { month, day } = getMonthAndDay(event.startDate);
              return (
                <div 
                  key={event.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col md:flex-row gap-5 items-start"
                >
                  {/* 왼쪽: 날짜 영역 (큰 숫자) */}
                  <div className="flex-shrink-0 flex md:flex-col items-center justify-center bg-sky-50 border border-sky-100 text-sky-700 w-full md:w-20 py-3 md:py-4 px-3 rounded-xl shadow-sm text-center">
                    <span className="text-xs font-bold tracking-wider md:mb-0.5">{month}</span>
                    <span className="text-2xl md:text-3xl font-extrabold tracking-tighter leading-none mx-2 md:mx-0">{day}일</span>
                  </div>
                  
                  {/* 오른쪽: 내용 영역 */}
                  <div className="flex-grow space-y-2.5 w-full">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="bg-sky-100 text-sky-850 text-[10px] md:text-[11px] px-2.5 py-0.5 rounded font-extrabold">
                        {event.category}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">
                        📅 기간: {event.startDate === event.endDate ? event.startDate : `${event.startDate} ~ ${event.endDate}`}
                      </span>
                    </div>
                    
                    <h3 className="text-base md:text-lg font-bold text-slate-900 leading-snug hover:text-sky-600 transition-colors">
                      <Link href={`/info/${event.id}`}>
                        {event.name}
                      </Link>
                    </h3>
                    
                    <p className="text-xs md:text-sm text-slate-500 leading-relaxed mb-4 font-light">
                      {event.summary}
                    </p>
                    
                    <div className="border-t border-slate-100 pt-3 mt-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <span className="font-semibold text-sky-700">📍 장소:</span> {event.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="font-semibold text-sky-700">👥 대상:</span> {event.target}
                        </span>
                      </div>
                      
                      <Link 
                        href={`/info/${event.id}`}
                        className="bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold py-2 px-4 rounded-lg shadow-sm transition-all text-center"
                      >
                        상세 정보 보기
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* [지원금/혜택 섹션] */}
        <section>
          <div className="flex items-center space-x-2 mb-6 border-b border-slate-200 pb-3">
            <span className="text-xl">💰</span>
            <h2 className="text-lg md:text-xl font-bold text-slate-950 tracking-tight">
              꼭 챙겨야 할 지원금 & 혜택 정보
            </h2>
            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-full font-bold">
              {benefits.length}건
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {benefits.map((benefit) => (
              <div 
                key={benefit.id}
                className="bg-white border-2 border-blue-400/80 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="bg-blue-50 text-blue-700 border border-blue-100 text-[10px] md:text-[11px] px-2.5 py-0.5 rounded font-extrabold">
                      {benefit.category}
                    </span>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      신청 기간 내 상시
                    </span>
                  </div>
                  
                  <h3 className="text-base md:text-lg font-bold text-slate-900 mb-3 leading-snug hover:text-blue-600 transition-colors">
                    <Link href={`/info/${benefit.id}`}>
                      {benefit.name}
                    </Link>
                  </h3>
                  
                  {/* 대상자 정보 강조 영역 (눈에 아주 잘 띄게 배치) */}
                  <div className="bg-blue-50/70 border border-blue-100/60 rounded-xl p-3 mb-4">
                    <span className="block text-[10px] font-extrabold text-blue-600 uppercase tracking-wider mb-1">
                      📢 신청 대상
                    </span>
                    <span className="text-xs md:text-sm font-extrabold text-slate-800 leading-snug">
                      {benefit.target}
                    </span>
                  </div>
                  
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed mb-4 font-light">
                    {benefit.summary}
                  </p>
                </div>
                
                <div className="border-t border-slate-100 pt-4 mt-auto space-y-2 text-xs text-slate-500">
                  <div className="flex items-center">
                    <span className="font-bold w-12 text-slate-600">📍 방법</span>
                    <span className="truncate">{benefit.location}</span>
                  </div>
                  
                  <Link 
                    href={`/info/${benefit.id}`}
                    className="mt-3 block text-center bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-lg shadow-sm transition-all"
                  >
                    혜택 확인 & 신청하기
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* 3. 하단 푸터 (깔끔한 네이버 스타일) */}
      <footer className="bg-white border-t border-slate-200 text-slate-400 py-10">
        <div className="max-w-4xl mx-auto px-5 text-center space-y-3.5">
          <p className="text-xs md:text-sm font-semibold text-slate-500">
            📢 본 정보는 공공데이터포털(data.go.kr)의 공공 API 데이터를 바탕으로 제공됩니다.
          </p>
          <div className="flex justify-center items-center space-x-2 text-[11px] text-slate-400 font-light">
            <span>최종 업데이트: {lastUpdated}</span>
            <span>•</span>
            <span>© 2026 우리 동네 생활 정보. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
