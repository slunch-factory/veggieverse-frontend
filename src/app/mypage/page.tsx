"use client";

import Link from "next/link";
import { User, ShoppingBag, Heart, MessageSquare, ChevronRight } from "lucide-react";
import { useUser } from "@/contexts/UserContext";

const RECENT_ORDERS = [
  { id: "ORD-2024-001", name: "김치볶음밥 밀키트", date: "2024.12.28", status: "배송완료" as const, price: 12000 },
  { id: "ORD-2024-002", name: "시금치 뇨끼", date: "2024.12.25", status: "배송중" as const, price: 18000 },
];

const QUICK_MENU = [
  { label: "관심상품", path: "/mypage/wishlist", icon: Heart },
  { label: "레시피 북마크", path: "/mypage/bookmarks", icon: ShoppingBag },
  { label: "상품 리뷰", path: "/mypage/reviews", icon: MessageSquare },
  { label: "회원정보", path: "/mypage/info", icon: User },
];

export default function MyPageHome() {
  const { user, userProfile } = useUser();
  const profileImage = userProfile.profileImage;
  const username = user?.name || "Guest";
  const spiritName = user?.spiritName ?? null;
  const veganType = userProfile.veganType ?? null;

  return (
    <div className="mx-auto max-w-[720px] flex flex-col gap-5">
      {/* 프로필 요약 카드 */}
      <Card>
        <div className="flex items-center gap-5 px-5 py-5">
          <div
            className="flex shrink-0 items-center justify-center overflow-hidden"
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--bg-off)",
              border: "1px solid var(--ink)",
            }}
          >
            {profileImage ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={profileImage} alt="프로필" className="h-full w-full object-cover" />
            ) : (
              <User size={32} color="var(--neutral-stone)" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="t-body" style={{ color: "var(--ink)" }}>{username}</p>
            {(spiritName || veganType) && (
              <p className="t-small mt-0.5" style={{ color: "var(--ink-light)" }}>
                {[spiritName, veganType].filter(Boolean).join(" · ")}
              </p>
            )}
            <p className="t-caption mt-1" style={{ color: "var(--neutral-stone)" }}>배지 0개</p>
          </div>

          <Link
            href="/mypage/info"
            className="t-small shrink-0"
            style={{
              color: "var(--ink-light)",
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            프로필 수정
          </Link>
        </div>
      </Card>

      {/* 활동 통계 */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "레시피", value: 0 },
          { label: "댓글", value: 0 },
          { label: "좋아요", value: 0 },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col items-center justify-center py-5"
            style={{
              background: "var(--bg-white)",
              border: "1px solid var(--ink)",
              borderRadius: "var(--r-btn)",
            }}
          >
            <p className="t-h3" style={{ color: "var(--ink)" }}>{stat.value}</p>
            <p className="t-caption mt-1" style={{ color: "var(--ink-light)" }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* 최근 주문 */}
      <Card>
        <SectionHeader title="최근 주문" moreLink="/mypage/orders" />
        <div className="px-5 pb-4">
          {RECENT_ORDERS.length === 0 ? (
            <p className="t-small text-center py-6" style={{ color: "var(--ink-light)" }}>
              주문 내역이 없습니다.
            </p>
          ) : (
            <ul>
              {RECENT_ORDERS.map((order, idx) => (
                <li
                  key={order.id}
                  className="flex items-center justify-between py-3"
                  style={{
                    borderTop: idx === 0 ? undefined : "1px solid var(--neutral-stone)",
                  }}
                >
                  <div className="min-w-0">
                    <p className="t-small truncate" style={{ color: "var(--ink)" }}>{order.name}</p>
                    <p className="t-caption mt-0.5" style={{ color: "var(--ink-light)" }}>{order.date}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <OrderStatusBadge status={order.status} />
                    <p className="t-small" style={{ color: "var(--ink)" }}>
                      {order.price.toLocaleString()}원
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Card>

      {/* 빠른 메뉴 */}
      <Card>
        {QUICK_MENU.map((menu, idx) => (
          <Link
            key={menu.path}
            href={menu.path}
            className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--bg-pale)]"
            style={{
              borderTop: idx === 0 ? undefined : "1px solid var(--neutral-stone)",
            }}
          >
            <div className="flex items-center gap-3">
              <menu.icon size={16} color="var(--ink-light)" />
              <span className="t-small" style={{ color: "var(--ink)" }}>{menu.label}</span>
            </div>
            <ChevronRight size={16} color="var(--neutral-stone)" />
          </Link>
        ))}
      </Card>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: "var(--bg-white)",
        border: "1px solid var(--ink)",
        borderRadius: "var(--r-btn)",
      }}
    >
      {children}
    </div>
  );
}

function SectionHeader({ title, moreLink }: { title: string; moreLink?: string }) {
  return (
    <header
      className="flex items-center justify-between px-5 py-4"
      style={{ borderBottom: "1px solid var(--neutral-stone)" }}
    >
      <h3 className="t-h3" style={{ color: "var(--ink)" }}>{title}</h3>
      {moreLink && (
        <Link
          href={moreLink}
          className="t-caption flex items-center gap-1"
          style={{ color: "var(--ink-light)" }}
        >
          더보기
          <ChevronRight size={14} />
        </Link>
      )}
    </header>
  );
}

function OrderStatusBadge({ status }: { status: "배송중" | "배송완료" | "준비중" }) {
  const variant: Record<typeof status, { bg: string; color: string }> = {
    "준비중": { bg: "var(--point)", color: "var(--ink)" },
    "배송중": { bg: "var(--neutral-blue)", color: "var(--ink)" },
    "배송완료": { bg: "var(--bg-off)", color: "var(--ink-light)" },
  };
  const v = variant[status];
  return (
    <span
      className="inline-flex items-center"
      style={{
        background: v.bg,
        color: v.color,
        padding: "2px 8px",
        borderRadius: "var(--r-pill)",
        border: "1px solid var(--ink)",
        fontSize: 11,
        letterSpacing: "0.02em",
      }}
    >
      {status}
    </span>
  );
}
