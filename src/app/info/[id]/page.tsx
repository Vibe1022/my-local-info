import Link from "next/link";
import localData from "../../../../public/data/local-info.json";

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

interface PageProps {
  params: Promise<{ id: string }>;
}

// Next.js 정적 내보내기(Export) 환경에서는 
// 빌드할 때 어떤 주소들([id])을 미리 구워두어야 하는지 주소록을 제공해야 합니다.
export function generateStaticParams() {
  const { items } = localData as { items: InfoItem[] };
  return items.map((item) => ({
    id: item.id,
  }));
}

export default async function DetailPage({ params }: PageProps) {
  const { id } = await params;
  const { items, lastUpdated } = localData as { items: InfoItem[]; lastUpdated: string };
  const item = items.find((p) => p.id === id);

  if (!item) {
    return (
      <div className="min-h-screen bg-[#f5f6f8] flex flex-col items-center justify-center p-5">
        <h2 className="text-xl font-bold text-slate-800 mb-4">해당 정보를 찾을 수 없습니다.</h2>
        <Link href="/" className="bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold shadow">
          메인화면으로 돌아가기
        </Link>
      </div>
    );
  }

  const isEvent = item.category === "행사";

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-800 font-sans flex flex-col justify-between">
      {/* 상단 네비게이션 헤더 */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-slate-700 hover:text-slate-950 transition-colors">
            <span className="text-lg">←</span>
            <span className="font-bold text-sm md:text-base">목록으로 돌아가기</span>
          </Link>
          <span className="text-xs bg-slate-105 text-slate-500 px-2.5 py-1 rounded-full font-bold border border-slate-200">
            {item.category} 안내
          </span>
        </div>
      </nav>

      {/* 본문 영역 */}
      <main className="max-w-3xl mx-auto px-5 py-10 flex-grow w-full">
        <article className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          
          {/* 타이틀 및 카테고리 */}
          <div className="space-y-3">
            <span className={`inline-block text-xs font-extrabold px-3 py-1 rounded-full ${
              isEvent ? 'bg-sky-100 text-sky-850' : 'bg-blue-100 text-blue-800'
            }`}>
              {item.category}
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              {item.name}
            </h2>
          </div>

          <hr className="border-slate-200" />

          {/* 핵심 정보 테이블 구조 */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="bg-slate-50 p-4 rounded-xl space-y-1">
              <span className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                📍 {isEvent ? "행사 장소" : "신청 방법 / 위치"}
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {item.location}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-1">
              <span className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                👥 {isEvent ? "참여 대상" : "지원 및 신청 대상"}
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {item.target}
              </span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl space-y-1 sm:col-span-2">
              <span className="block text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                📅 {isEvent ? "행사 기간" : "지원 및 혜택 기간"}
              </span>
              <span className="text-sm font-semibold text-slate-800">
                {isEvent 
                  ? (item.startDate === item.endDate ? item.startDate : `${item.startDate} ~ ${item.endDate}`) 
                  : "신청 기간 내 상시 지원"
                }
              </span>
            </div>
          </div>

          {/* 상세 설명 전문 */}
          <div className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-slate-900">상세 설명 전문</h3>
            <p className="text-sm md:text-base text-slate-600 leading-relaxed font-light whitespace-pre-line">
              {item.summary}
            </p>
          </div>

          {/* 하단 행동 버튼 */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <a 
              href={item.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex-grow text-center text-white text-sm font-semibold py-3.5 rounded-xl transition-all shadow-sm ${
                isEvent 
                  ? 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/10' 
                  : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/10'
              }`}
            >
              공식 사이트에서 자세히 보기 →
            </a>
            
            <Link 
              href="/"
              className="sm:w-48 text-center bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-semibold py-3.5 rounded-xl shadow-sm transition-all"
            >
              목록으로 돌아가기
            </Link>
          </div>

        </article>
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-white border-t border-slate-200 text-slate-400 py-10 mt-12">
        <div className="max-w-3xl mx-auto px-5 text-center space-y-3.5">
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
