import fs from "fs";
import path from "path";
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "src/content/posts");

export interface PostData {
  slug: string;
  title: string;
  date: string;
  summary: string;
  category: string;
  tags: string[];
  content?: string;
}

// date 필드가 Date 객체인 경우 YYYY-MM-DD 문자열로 변환 처리하는 도우미 함수입니다.
function formatDate(dateVal: any): string {
  if (!dateVal) return "";
  
  if (dateVal instanceof Date) {
    // 현지 시각 기준으로 YYYY-MM-DD 포맷을 생성하여 시차 문제를 방지합니다.
    const year = dateVal.getFullYear();
    const month = String(dateVal.getMonth() + 1).padStart(2, '0');
    const day = String(dateVal.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  if (typeof dateVal === "string") {
    // ISO 형식 등으로 날짜가 들어왔을 때 변환 시도
    const parsedDate = new Date(dateVal);
    if (!isNaN(parsedDate.getTime()) && dateVal.includes('T')) {
      const year = parsedDate.getFullYear();
      const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
      const day = String(parsedDate.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    return dateVal;
  }
  
  return String(dateVal);
}

export function getSortedPostsData(): PostData[] {
  // 폴더가 없으면 에러가 나지 않도록 빈 배열을 반환합니다.
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const allPostsData = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      
      // 마크다운 파싱 진행
      const matterResult = matter(fileContents);
      const { title, date, summary, category, tags } = matterResult.data;

      return {
        slug,
        title: title || slug,
        date: formatDate(date),
        summary: summary || "",
        category: category || "일반",
        tags: Array.isArray(tags) ? tags : [],
      };
    });

  // 날짜 최신순 정렬
  return allPostsData.sort((a, b) => {
    if (a.date < b.date) {
      return 1;
    } else if (a.date > b.date) {
      return -1;
    } else {
      return 0;
    }
  });
}

export function getAllPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => fileName.replace(/\.md$/, ""));
}

export function getPostData(slug: string): PostData | null {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const matterResult = matter(fileContents);
  const { title, date, summary, category, tags } = matterResult.data;

  return {
    slug,
    content: matterResult.content,
    title: title || slug,
    date: formatDate(date),
    summary: summary || "",
    category: category || "일반",
    tags: Array.isArray(tags) ? tags : [],
  };
}
