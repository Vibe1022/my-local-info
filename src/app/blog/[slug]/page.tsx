import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getAllPostSlugs, getPostData } from "@/lib/posts";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Next.js 정적 내보내기(Export) 환경을 위해 빌드 중 경로 에러가 나지 않도록 빈 폴더일 경우 플레이스홀더 경로를 반환합니다.
export function generateStaticParams() {
  const slugs = getAllPostSlugs();
  if (slugs.length === 0) {
    return [{ slug: "placeholder" }];
  }
  return slugs.map((slug) => ({
    slug: slug,
  }));
}

export default async function BlogPostDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostData(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] text-slate-800 font-sans flex flex-col justify-between">
      
      {/* 상단 네비게이션 헤더 */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-[0_2px_10px_rgba(0,0,0,0.03)]">
        <div className="max-w-3xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link href="/blog" className="flex items-center space-x-2 text-slate-700 hover:text-slate-950 transition-colors">
            <span className="text-lg">←</span>
            <span className="font-bold text-sm md:text-base">블로그 목록으로</span>
          </Link>
          <span className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full font-bold border border-slate-200">
            블로그 글 읽기
          </span>
        </div>
      </nav>

      {/* 본문 영역 */}
      <main className="max-w-3xl mx-auto px-5 py-10 flex-grow w-full">
        <article className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
          
          {/* 타이틀 및 카테고리/날짜 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-block text-xs font-extrabold px-3 py-1 rounded-full bg-sky-100 text-sky-800">
                {post.category}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                📅 등록일: {post.date}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
              {post.title}
            </h2>
          </div>

          <hr className="border-slate-200" />

          {/* 태그 표시 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 마크다운 본문 파싱 & Tailwind Typography prose 적용 */}
          <div className="prose prose-slate max-w-none pt-4 pb-8 text-sm md:text-base leading-relaxed text-slate-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {post.content || ""}
            </ReactMarkdown>
          </div>

          {/* 하단 버튼 */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
            <Link 
              href="/blog"
              className="w-full text-center bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-sm font-semibold py-3.5 rounded-xl shadow-sm transition-all"
            >
              블로그 목록으로 돌아가기
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
            <span>© 2026 우리 동네 생활 정보. All rights reserved.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
