"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, MessageSquare } from "lucide-react";

interface Review {
  id: number;
  productId: number;
  productName: string;
  productImage: string;
  rating: number;
  content: string;
  createdAt: string;
  helpful: number;
}

interface PendingReview {
  orderId: string;
  orderDate: string;
  productId: number;
  productName: string;
  productImage: string;
  expiresAt: string;
}

const SAMPLE_REVIEWS: Review[] = [
  { id: 1, productId: 1, productName: "볶음김치", productImage: "/veggieverse/store/thumbnails/kimchi.jpg", rating: 5, content: "정말 맛있어요! 젓갈이 없어서 걱정했는데 감칠맛이 살아있네요. 김치찌개 끓여먹으니 최고였습니다. 재구매 의사 100%입니다.", createdAt: "2024.12.10", helpful: 12 },
  { id: 2, productId: 3, productName: "시금치 뇨끼", productImage: "/veggieverse/store/thumbnails/gnocchi.jpg", rating: 4, content: "뇨끼가 쫄깃쫄깃하고 시금치 향이 은은해서 좋았어요. 소스도 맛있었는데 양이 조금 더 많았으면 좋겠네요.", createdAt: "2024.11.28", helpful: 8 },
  { id: 3, productId: 4, productName: "블루베리 타르트", productImage: "/veggieverse/store/thumbnails/blueberry-tart.jpg", rating: 5, content: "비건 디저트라고 믿기지 않을 정도로 맛있어요! 블루베리도 신선하고 타르트 크러스트도 바삭해요. 선물용으로도 좋을 것 같아요.", createdAt: "2024.11.15", helpful: 24 },
];

const SAMPLE_PENDING: PendingReview[] = [
  { orderId: "ORD-2024121501", orderDate: "2024.12.15", productId: 3, productName: "시금치 뇨끼", productImage: "/veggieverse/store/thumbnails/gnocchi.jpg", expiresAt: "2025.01.15" },
  { orderId: "ORD-2024120501", orderDate: "2024.12.05", productId: 5, productName: "비건 라자냐", productImage: "/veggieverse/store/thumbnails/lasagna.jpg", expiresAt: "2025.01.05" },
];

export default function MyReviewsPage() {
  const [activeTab, setActiveTab] = useState<"written" | "pending">("written");

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        size={14}
        strokeWidth={1.5}
        fill={i < rating ? "var(--ink)" : "transparent"}
        color={i < rating ? "var(--ink)" : "var(--neutral-stone)"}
      />
    ));

  const TABS = [
    { key: "written" as const, label: `작성한 리뷰 (${SAMPLE_REVIEWS.length})` },
    { key: "pending" as const, label: `작성 가능 (${SAMPLE_PENDING.length})` },
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
          {SAMPLE_REVIEWS.length > 0 ? (
            SAMPLE_REVIEWS.map((review) => (
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
                    <div className="flex items-center gap-0.5 mt-1 mb-1">{renderStars(review.rating)}</div>
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
          {SAMPLE_PENDING.length > 0 ? (
            SAMPLE_PENDING.map((item) => (
              <div
                key={item.orderId + item.productId}
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
                  <button type="button" className="btn btn-dark btn-sm shrink-0">
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
