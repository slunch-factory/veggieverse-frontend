import { redirect } from "next/navigation";

// 이벤트 기능 임시 숨김 — 직접 URL 접근도 홈으로 차단. 재오픈 시 아래 원본 복원.
export default function EventDetailPage() {
  redirect("/");
}

/* 원본 (이벤트 재오픈 시 복원)
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { EVENTS, getEventById, getStatusLabel, getStatusColor } from "../_data/events";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return EVENTS.map((e) => ({ id: String(e.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const event = getEventById(Number(id));
  if (!event) return { title: "이벤트 - 슬런치 팩토리" };

  return {
    title: `${event.title} - 슬런치 이벤트`,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: [{ url: event.thumbnail }],
    },
  };
}

export default async function EventDetailPage({ params }: Props) {
  const { id } = await params;
  const event = getEventById(Number(id));
  if (!event) notFound();

  const isEnded = event.status === "ended";

  return (
    <div className="bg-[var(--cream)] min-h-screen">
      {/* 상단 네비게이션 *\/}
      <div
        className="fixed left-0 right-0 z-[45] bg-white border-b border-black"
        style={{ top: "var(--header-area-h, 72px)" }}
      >
        <div className="flex items-center h-12 max-w-[1440px] mx-auto px-5">
          <Link href="/event" className="flex items-center gap-1.5 text-[14px] text-black">
            <ChevronLeft size={18} />
            이벤트 목록
          </Link>
        </div>
      </div>

      <div className="max-w-[960px] mx-auto px-6 pt-[80px] pb-16">
        {/* 히어로 이미지 *\/}
        <div className="relative w-full aspect-[16/9] bg-[#E5E5E0] overflow-hidden rounded-[4px] mb-8">
          {/* eslint-disable-next-line @next/next/no-img-element *\/}
          <img
            src={event.thumbnail}
            alt={event.title}
            className="w-full h-full object-cover"
            style={{ filter: isEnded ? "grayscale(100%)" : "none" }}
          />
          {event.badge && (
            <span className="absolute top-4 left-4 px-3 py-1.5 bg-black text-white text-[12px]">
              {event.badge}
            </span>
          )}
          <span
            className="absolute top-4 right-4 px-3 py-1.5 bg-white/95 text-[12px]"
            style={{
              color: getStatusColor(event.status),
              border: `1px solid ${getStatusColor(event.status)}`,
            }}
          >
            {getStatusLabel(event.status)}
          </span>
        </div>

        <h1 className="text-[28px] leading-[1.3] text-black mb-3">
          {event.title}
        </h1>
        <p className="text-[15px] text-[#3D3D3D] leading-[1.8] mb-6">
          {event.description}
        </p>
        <div className="flex items-center gap-4 text-[13px] text-[#9A9A9A] pb-8 border-b border-[#ddd]">
          <span>기간: {event.startDate} - {event.endDate}</span>
        </div>

        <div className="py-16 text-center text-[14px] text-[#9A9A9A]">
          이벤트 상세 내용이 여기에 표시됩니다.
        </div>
      </div>
    </div>
  );
}
*/
