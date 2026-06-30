"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, MessageSquare } from "lucide-react";
import { StarRating } from "@/components/ui/StarRating";
import { MY_REVIEWS, PENDING_REVIEWS } from "@/app/store/_data/reviews";
import {
  ReviewWriteModal,
  type ReviewWriteTarget,
} from "./_components/ReviewWriteModal";

export default function MyReviewsPage() {
  const [activeTab, setActiveTab] = useState<"written" | "pending">("written");
  const [modalOpen, setModalOpen] = useState(false);
  const [target, setTarget] = useState<ReviewWriteTarget | null>(null);

  const openWrite = (next: ReviewWriteTarget) => {
    setTarget(next);
    setModalOpen(true);
  };

  const TABS = [
    { key: "written" as const, label: `작성한 리뷰 (${MY_REVIEWS.length})` },
    { key: "pending" as const, label: `작성 가능 (${PENDING_REVIEWS.length})` },
  ];

  return (
    <div className="mx-auto max-w-[800px]">
      {/* 탭 — TopControlBar 인라인 패턴 */}
      <div
        className="flex gap-0 mb-6"
        style={{ borderBottom: "1px solid var(--neutral-stone)" }}
      >
        {TABS.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              type="button"
              className={`flex h-[40px] items-center px-4 text-[14px] transition-colors ${
                active
                  ? "border-b-2 border-black font-bold text-black"
                  : "text-gray-400"
              }`}
              style={{ marginBottom: -1 }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "written" && (
        <div className="flex flex-col gap-4">
          {MY_REVIEWS.length > 0 ? (
            MY_REVIEWS.map((review) => (
              <div
                key={review.id}
                style={{
                  background: "var(--bg-white)",
                  border: "1px solid var(--ink)",
                  borderRadius: "var(--r-btn)",
                }}
                className="p-5"
              >
                <div className="flex gap-3 mb-4">
                  <div
                    className="shrink-0 overflow-hidden"
                    style={{
                      width: 60,
                      height: 60,
                      background: "var(--bg-off)",
                      border: "1px solid var(--neutral-stone)",
                      borderRadius: "var(--r-btn)",
                    }}
                  >
                    <Image
                      src={review.productImage}
                      alt={review.productName}
                      width={60}
                      height={60}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <p className="t-small" style={{ color: "var(--ink)" }}>{review.productName}</p>
                    <div className="mt-1 mb-1">
                      <StarRating value={review.rating} size={14} />
                    </div>
                    <p className="t-caption" style={{ color: "var(--ink-light)" }}>{review.createdAt}</p>
                  </div>
                </div>

                <p className="t-small mb-3" style={{ color: "var(--ink)", lineHeight: 1.6 }}>
                  {review.content}
                </p>

                <div className="flex items-center justify-between">
                  <span className="t-caption" style={{ color: "var(--ink-light)" }}>
                    {review.helpful}명에게 도움이 됨
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      openWrite({
                        productName: review.productName,
                        productImage: review.productImage,
                        rating: review.rating,
                        content: review.content,
                      })
                    }
                    className="btn btn-ghost btn-sm"
                    style={{ border: "1px solid var(--neutral-stone)" }}
                  >
                    수정
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState icon={MessageSquare} text="작성한 리뷰가 없습니다." />
          )}
        </div>
      )}

      {activeTab === "pending" && (
        <div className="flex flex-col gap-4">
          {PENDING_REVIEWS.length > 0 ? (
            PENDING_REVIEWS.map((item) => (
              <div
                key={item.orderId + item.productSlug}
                style={{
                  background: "var(--bg-white)",
                  border: "1px solid var(--ink)",
                  borderRadius: "var(--r-btn)",
                }}
                className="p-5"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="shrink-0 overflow-hidden"
                    style={{
                      width: 60,
                      height: 60,
                      background: "var(--bg-off)",
                      border: "1px solid var(--neutral-stone)",
                      borderRadius: "var(--r-btn)",
                    }}
                  >
                    <Image
                      src={item.productImage}
                      alt={item.productName}
                      width={60}
                      height={60}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="t-small" style={{ color: "var(--ink)" }}>{item.productName}</p>
                    <p className="t-caption mt-0.5" style={{ color: "var(--ink-light)" }}>
                      주문일: {item.orderDate}
                    </p>
                    <p className="t-caption" style={{ color: "var(--alert-red)" }}>
                      {item.expiresAt}까지 작성 가능
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      openWrite({
                        productName: item.productName,
                        productImage: item.productImage,
                      })
                    }
                    className="btn btn-dark btn-sm shrink-0"
                  >
                    리뷰 쓰기
                  </button>
                </div>
              </div>
            ))
          ) : (
            <EmptyState icon={Star} text="작성 가능한 리뷰가 없습니다." />
          )}
        </div>
      )}

      <ReviewWriteModal
        target={target}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}

function EmptyState({
  icon: Icon,
  text,
}: {
  icon: typeof MessageSquare;
  text: string;
}) {
  return (
    <div className="text-center py-20">
      <Icon size={40} color="var(--neutral-stone)" className="inline-block mb-4" />
      <p className="t-small" style={{ color: "var(--ink-light)" }}>{text}</p>
    </div>
  );
}
