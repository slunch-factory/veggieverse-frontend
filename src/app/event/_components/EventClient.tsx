"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import TopControlBar, { type TabItem } from "@/components/store/TopControlBar";
import type { Event } from "../_data/events";
import { getStatusLabel, getStatusColor } from "../_data/events";

const EVENT_TABS: TabItem[] = [
  { id: "all", label: "All" },
  { id: "ongoing", label: "Ongoing" },
  { id: "upcoming", label: "Upcoming" },
  { id: "ended", label: "Ended" },
];

function EventCard({ event }: { event: Event }) {
  const isEnded = event.status === "ended";

  return (
    <Link
      href={`/event/${event.id}`}
      className="block"
      style={{ opacity: isEnded ? 0.6 : 1 }}
    >
      {/* 이미지 */}
      <div className="relative w-full aspect-[16/9] bg-[#E5E5E0] overflow-hidden rounded-[4px]">
        <Image
          src={event.thumbnail}
          alt={event.title}
          fill
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className="object-cover"
          style={{ filter: isEnded ? "grayscale(100%)" : "none" }}
        />

        {event.badge && (
          <span className="absolute top-3 left-3 px-2 py-1 bg-black text-white text-[11px]">
            {event.badge}
          </span>
        )}

        <span
          className="absolute top-3 right-3 px-2 py-1 bg-white/95 text-[11px]"
          style={{
            color: getStatusColor(event.status),
            border: `1px solid ${getStatusColor(event.status)}`,
          }}
        >
          {getStatusLabel(event.status)}
        </span>
      </div>

      {/* 콘텐츠 */}
      <div className="pt-4">
        <h3 className="text-[16px] leading-[1.3] text-black mb-1.5">
          {event.title}
        </h3>
        <p className="text-[13px] text-[#6B6B6B] leading-[1.5] mb-3">
          {event.description}
        </p>
        <p className="text-[12px] text-[#9A9A9A]">
          {event.startDate} - {event.endDate}
        </p>
      </div>
    </Link>
  );
}

export function EventClient({ events }: { events: Event[] }) {
  const [selectedTab, setSelectedTab] = useState("all");

  const filtered = selectedTab === "all"
    ? events
    : events.filter((e) => e.status === selectedTab);

  return (
    <div className="bg-[var(--cream)] min-h-screen">
      <TopControlBar
        tabs={EVENT_TABS}
        activeTab={selectedTab}
        onTabChange={setSelectedTab}
      />

      <div className="px-4 md:px-8 lg:px-16 py-8 pt-[64px] max-w-[1440px] mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-[120px] text-[#6B6B6B] text-[14px]">
            해당 카테고리에 이벤트가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
