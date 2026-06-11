import Link from "next/link";
import { getSortedPostsData } from "@/lib/posts";

export default function BlogListPage() {
  const posts = getSortedPostsData();

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-800 font-sans flex flex-col justify-between">
      
      {/* 상단 큰 배너 */}
      <section className="bg-gradient-to-r from-sky-400 to-sky-300 py-12 md:py-16 text-center shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 bg-white/10 opacity-30 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 10%, transparent 11%)', backgroundSize: '12px 12px' }} />
        <div className="max-w-4xl mx-auto px-5 relative z-10 space-y-3">
          <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider">
            블로그 📚
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight drop-shadow-sm">
            동네 소식 & 꿀팁 블로그
          </h2>
          <p className="text-sky-50 text-sm md:text-base font-light tracking-wide max-w-lg mx-auto leading-relaxed">
            생활 정보, 유용한 혜택 신청법 등 알찬 소식들을 전해드립니다.
          </p>
        </div>
      </section>

      {/* 상단 네비게이션 헤더 */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="max-w-4xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 text-slate-700 hover:text-sky-655 transition-colors">
            <span className="text-xl">🏡</span>
            <span className="font-bold text-slate-900 text-sm md:text-base">성남시 생활정보 통합보드</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/blog" className="text-sm font-semibold text-sky-600 border-b-2 border-sky-500 pb-1">
              블로그
            </Link>
            <div className="flex items-center space-x-1.5 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-500">매일 자동 업데이트 중</span>
            </div>
          </div>
        </div>
      </nav>

      {/* 메인 콘텐츠 영역 */}
      <main className="max-w-4xl mx-auto px-5 py-10 flex-grow w-full space-y-8">
        <div className="flex items-center space-x-2 mb-2 border-b border-slate-200 pb-3">
          <span className="text-xl">📝</span>
          <h2 className="text-lg md:text-xl font-bold text-slate-950 tracking-tight">
            전체 글 목록
          </h2>
          <span className="text-xs bg-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-bold">
            {posts.length}건
          </span>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl py-20 text-center space-y-4 shadow-sm">
            <span className="text-4xl">📭</span>
            <p className="text-slate-500 font-medium">아직 등록된 블로그 글이 없습니다.</p>
            <p className="text-slate-400 text-xs font-light">새로운 소식들이 곧 업데이트될 예정입니다.</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <article 
                key={post.slug}
                className="bg-white border border-slate-200 rounded-xl p-5 md:p-6 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="bg-sky-50 text-sky-700 border border-sky-100 text-[10px] md:text-[11px] px-2.5 py-0.5 rounded font-extrabold">
                      {post.category}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      📅 {post.date}
                    </span>
                  </div>
                  
                  <h3 className="text-base md:text-lg font-bold text-slate-900 leading-snug hover:text-sky-600 transition-colors">
                    <Link href={`/blog/${post.slug}`}>
                      {post.title}
                    </Link>
                  </h3>
                  
                  <p className="text-xs md:text-sm text-slate-500 leading-relaxed font-light line-clamp-3">
                    {post.summary}
                  </p>
                </div>

                <div className="border-t border-slate-100 pt-4 mt-5">
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {post.tags.map((tag) => (
                        <span key={tag} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <Link 
                    href={`/blog/${post.slug}`}
                    className="block text-center bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold py-2.5 rounded-lg shadow-sm transition-all"
                  >
                    글 읽어보기 →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* 하단 푸터 */}
      <footer className="bg-white border-t border-slate-200 text-slate-400 py-10">
        <div className="max-w-4xl mx-auto px-5 text-center space-y-3.5">
          <p className="text-xs md:text-sm font-semibold text-slate-500">
            📢 본 정보는 공공데이터포털(data.go.kr)의 공공 API 데이터를 바탕으로 제공됩니다.
          </p>
          <div className="flex justify-center items-center space-x-2 text-[11px] text-slate-400 font-light">
            <span>© 2026 우리 동네 생활 정보. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
