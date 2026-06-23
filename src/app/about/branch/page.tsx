import { redirect } from "next/navigation";

// 구 about 탭 구조 → 싱글스크롤 /about로 통합. 옛 링크 호환용 리다이렉트.
export default function AboutBranchPage() {
  redirect("/about#stores");
}
