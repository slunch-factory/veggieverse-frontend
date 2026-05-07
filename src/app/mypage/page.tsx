"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, ShoppingBag, Heart, MessageSquare, ChevronRight, Repeat } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { getOrderHistory, type OrderHistoryItem } from "@/lib/api/subscription";
import { FIXED_USER_ID } from "@/lib/api/payment";

type OrderStatus = "준비중" | "배송중" | "배송완료";
type SubscriptionStatus = "준비중" | "진행중" | "종료됨";

function deriveOrderStatus(startDate: string, endDate: string): OrderStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (today < start) return "준비중";
  if (today > end) return "배송완료";
  return "배송중";
}

function deriveSubscriptionStatus(startDate: string, endDate: string): SubscriptionStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (today < start) return "준비중";
  if (today > end) return "종료됨";
  return "진행중";
}

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function getProductSummary(order: OrderHistoryItem) {
  const names = order.products.slice(0, 2).map((p) => p.name).join(", ");
  const remaining = Math.max(0, order.products.length - 2);
  return { names, remaining };
}

const QUICK_MENU = [
  { label: "구독 내역", path: "/mypage/subscriptions", icon: Repeat },
  { label: "관심상품", path: "/mypage/wishlist", icon: Heart },
  { label: "레시피 북마크", path: "/mypage/bookmarks", icon: ShoppingBag },
  { label: "상품 리뷰", path: "/mypage/reviews", icon: MessageSquare },
  { label: "회원정보", path: "/mypage/info", icon: User },
];

export default function MyPageHome() {
  const router = useRouter();
  const { user, userProfile } = useUser();
  const profileImage = userProfile.profileImage;
  const username = user?.name || "Guest";
  const spiritName = user?.spiritName ?? null;
  const veganType = userProfile.veganType ?? null;

  const [recentOrders, setRecentOrders] = useState<OrderHistoryItem[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [recentSubs, setRecentSubs] = useState<OrderHistoryItem[] | null>(null);
  const [subsLoading, setSubsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setOrdersLoading(true);
    setSubsLoading(true);

    getOrderHistory(FIXED_USER_ID).then((res) => {
      if (cancelled) return;
      const all = res?.content ?? [];
      setRecentOrders(all.slice(0, 2));
      setOrdersLoading(false);

      const active = all.filter((o) => {
        const s = deriveSubscriptionStatus(o.startDate, o.endDate);
        return s === "진행중" || s === "준비중";
      });
      const fallback = active.length > 0 ? active : all;
      setRecentSubs(fallback.slice(0, 2));
      setSubsLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

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

      {/* 최근 구독 */}
      <Card>
        <SectionHeader title="최근 구독" moreLink="/mypage/subscriptions" />
        <div className="px-5 pb-4">
          {subsLoading ? (
            <p className="t-small text-center py-6" style={{ color: "var(--ink-light)" }}>
              불러오는 중...
            </p>
          ) : !recentSubs || recentSubs.length === 0 ? (
            <p className="t-small text-center py-6" style={{ color: "var(--ink-light)" }}>
              구독 내역이 없습니다.
            </p>
          ) : (
            <ul>
              {recentSubs.map((sub, idx) => {
                const status = deriveSubscriptionStatus(sub.startDate, sub.endDate);
                const navigate = () => router.push(`/mypage/subscriptions/${sub.orderId}`);
                return (
                  <li
                    key={sub.orderId}
                    onClick={navigate}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate();
                      }
                    }}
                    className="flex items-center justify-between gap-3 py-3 -mx-5 px-5 cursor-pointer transition-colors hover:bg-[var(--bg-pale)]"
                    style={{
                      borderTop: idx === 0 ? undefined : "1px solid var(--neutral-stone)",
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="t-small" style={{ color: "var(--ink)" }}>
                        {formatDate(sub.startDate)} – {formatDate(sub.endDate)}
                      </p>
                      <p className="t-caption mt-0.5" style={{ color: "var(--ink-light)" }}>
                        {sub.deliveryCycle}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <SubscriptionStatusBadge status={status} />
                      <p className="t-small" style={{ color: "var(--ink)" }}>
                        {sub.finalAmount.toLocaleString()}원
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </Card>

      {/* 최근 주문 */}
      <Card>
        <SectionHeader title="최근 주문" moreLink="/mypage/orders" />
        <div className="px-5 pb-4">
          {ordersLoading ? (
            <p className="t-small text-center py-6" style={{ color: "var(--ink-light)" }}>
              불러오는 중...
            </p>
          ) : !recentOrders || recentOrders.length === 0 ? (
            <p className="t-small text-center py-6" style={{ color: "var(--ink-light)" }}>
              주문 내역이 없습니다.
            </p>
          ) : (
            <ul>
              {recentOrders.map((order, idx) => {
                const { names, remaining } = getProductSummary(order);
                const navigate = () => router.push(`/mypage/orders/${order.orderId}`);
                return (
                  <li
                    key={order.orderId}
                    onClick={navigate}
                    role="link"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        navigate();
                      }
                    }}
                    className="flex items-center justify-between gap-3 py-3 -mx-5 px-5 cursor-pointer transition-colors hover:bg-[var(--bg-pale)]"
                    style={{
                      borderTop: idx === 0 ? undefined : "1px solid var(--neutral-stone)",
                    }}
                  >
                    <div className="min-w-0 flex-1">
                      <p className="t-small truncate" style={{ color: "var(--ink)" }}>
                        {names}
                        {remaining > 0 && (
                          <span style={{ color: "var(--ink-light)" }}> 외 {remaining}건</span>
                        )}
                      </p>
                      <p className="t-caption mt-0.5" style={{ color: "var(--ink-light)" }}>
                        {formatDate(order.orderDate)}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <OrderStatusBadge status={deriveOrderStatus(order.startDate, order.endDate)} />
                      <p className="t-small" style={{ color: "var(--ink)" }}>
                        {order.finalAmount.toLocaleString()}원
                      </p>
                    </div>
                  </li>
                );
              })}
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

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variant: Record<OrderStatus, { bg: string; color: string }> = {
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

function SubscriptionStatusBadge({ status }: { status: SubscriptionStatus }) {
  const variant: Record<SubscriptionStatus, { bg: string; color: string }> = {
    "준비중": { bg: "var(--point)", color: "var(--ink)" },
    "진행중": { bg: "var(--neutral-blue)", color: "var(--ink)" },
    "종료됨": { bg: "var(--bg-off)", color: "var(--ink-light)" },
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

