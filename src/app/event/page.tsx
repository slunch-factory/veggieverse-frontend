import { redirect } from "next/navigation";

// 이벤트 기능 임시 숨김 — 직접 URL 접근도 홈으로 차단. 재오픈 시 아래 원본 복원.
export default function EventPage() {
  redirect("/");
}

/* 원본 (이벤트 재오픈 시 복원)
import type { Metadata } from "next";
import { EVENTS } from "./_data/events";
import { EventClient } from "./_components/EventClient";

export const metadata: Metadata = {
  title: "이벤트 - 슬런치 팩토리",
  description:
    "슬런치 팩토리의 진행 중인 이벤트, 할인, 캠페인 소식을 확인하세요.",
  openGraph: {
    title: "이벤트 - 슬런치 팩토리",
    description: "슬런치 팩토리의 진행 중인 이벤트, 할인, 캠페인 소식.",
  },
};

export default function EventPage() {
  return <EventClient events={EVENTS} />;
}
*/
