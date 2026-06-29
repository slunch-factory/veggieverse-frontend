"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { User, ShoppingBag, Heart, MessageSquare, ChevronRight, Repeat, Truck, MapPin } from "lucide-react";
import { useUser } from "@/contexts/UserContext";
import { getOrderHistory, type OrderHistoryItem } from "@/lib/api/subscription";
import {
  getStoreOrderHistory,
  type StoreOrderHistoryItem,
} from "@/lib/api/store";
import { getUserProfile } from "@/lib/api/user";
import { supabaseRenderUrl } from "@/lib/supabaseImage";
import { CountUp } from "./_components/CountUp";
import { Skeleton, SkeletonRow } from "@/components/ui/Skeleton";
import { listContainer, cardItem } from "./_components/motion";

type OrderStatus = "결제대기" | "결제완료" | "배송중" | "배송완료" | "취소됨" | "기타";
type SubscriptionStatus = "준비중" | "진행중" | "종료됨";

// 백엔드 status 코드 → 화면 라벨 매핑.
// PENDING은 주문 row가 생성됐지만 confirm이 아직 안 떨어진 상태 — "결제 대기".
// PAID는 confirm 성공으로 결제 확정 상태 — "결제 완료".
const STORE_STATUS_LABEL: Record<string, OrderStatus> = {
  PENDING: "결제대기",
  PAID: "결제완료",
  COMPLETED: "배송완료",
  SHIPPING: "배송중",
  CANCELED: "취소됨",
};

function mapStoreOrderStatus(status: string): OrderStatus {
  return STORE_STATUS_LABEL[status] ?? "기타";
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

// 시간대별 인사 — 프로필 카드 상단에 표시.
function timeGreeting(): { text: string; emoji: string } {
  const h = new Date().getHours();
  if (h < 6) return { text: "늦은 밤이에요", emoji: "🌙" };
  if (h < 12) return { text: "좋은 아침이에요", emoji: "☀️" };
  if (h < 18) return { text: "좋은 오후예요", emoji: "🌤️" };
  return { text: "편안한 저녁이에요", emoji: "🌆" };
}

function getProductSummary(order: OrderHistoryItem | StoreOrderHistoryItem) {
  const names = order.products.slice(0, 2).map((p) => p.name).join(", ");
  const remaining = Math.max(0, order.products.length - 2);
  return { names, remaining };
}

const QUICK_MENU = [
  { label: "구독 내역", path: "/mypage/subscriptions", icon: Repeat },
  { label: "배송 조회", path: "/mypage/delivery", icon: Truck },
  { label: "배송지 관리", path: "/mypage/info/addresses", icon: MapPin },
  { label: "관심상품", path: "/mypage/wishlist", icon: Heart },
  { label: "레시피 북마크", path: "/mypage/bookmarks", icon: ShoppingBag },
  { label: "상품 리뷰", path: "/mypage/reviews", icon: MessageSquare },
  { label: "회원정보", path: "/mypage/info", icon: User },
];

export default function MyPageHome() {
  const router = useRouter();
  const { user, userProfile, isAuthenticated, isLoadingSession, profileVersion, signOut } = useUser();
  const spiritName = user?.spiritName ?? null;
  const veganType = userProfile.veganType ?? null;

  const [profileImage, setProfileImage] = useState<string | null>(userProfile.profileImage);
  // 자사몰 BE 회원 이름. Supabase user_metadata는 카카오 identity 동기화로 덮일 수 있어 신뢰 불가 → BE 값을 표시.
  const [memberName, setMemberName] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const username = memberName ?? "Guest";
  const [recentOrders, setRecentOrders] = useState<StoreOrderHistoryItem[] | null>(null);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [recentSubs, setRecentSubs] = useState<OrderHistoryItem[] | null>(null);
  const [subsLoading, setSubsLoading] = useState(true);

  // 백엔드 호출은 자사몰 프로필이 존재하는 경우(isAuthenticated)에만.
  // incomplete 상태는 ProfileGate가 /signup?step=2로 redirect — 잠깐의 윈도우에서 404를 안 부른다.
  useEffect(() => {
    if (isLoadingSession) return;
    if (!isAuthenticated) {
      setProfileLoading(false);
      return;
    }
    setProfileLoading(true);
    getUserProfile()
      .then((profile) => {
        if (!profile) return;
        if (profile.profileImageUrl) setProfileImage(profile.profileImageUrl);
        if (profile.name) setMemberName(profile.name);
      })
      .finally(() => setProfileLoading(false));
  }, [isAuthenticated, isLoadingSession, profileVersion]);

  useEffect(() => {
    if (isLoadingSession) return;
    if (!isAuthenticated) {
      setRecentOrders([]);
      setRecentSubs([]);
      setOrdersLoading(false);
      setSubsLoading(false);
      return;
    }

    let cancelled = false;
    setOrdersLoading(true);
    setSubsLoading(true);

    // 최근 상품 주문 — store API
    getStoreOrderHistory().then((res) => {
      if (cancelled) return;
      setRecentOrders((res?.content ?? []).slice(0, 2));
      setOrdersLoading(false);
    });

    // 최근 구독 — subscription API
    getOrderHistory().then((res) => {
      if (cancelled) return;
      const all = res?.content ?? [];
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
  }, [isAuthenticated, isLoadingSession]);

  const greeting = timeGreeting();
  const tags = [spiritName, veganType].filter(Boolean) as string[];

  return (
    <motion.div
      className="mx-auto max-w-[720px] flex flex-col gap-4 sm:gap-5"
      variants={listContainer}
      initial="hidden"
      animate="show"
    >
      {/* 프로필 요약 카드 */}
      <MotionCard>
        <div className="flex items-center gap-3 sm:gap-5 px-4 sm:px-5 py-4 sm:py-5">
          <div
            className="relative flex shrink-0 items-center justify-center overflow-hidden mypage-profile-avatar"
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: "var(--bg-off)",
              border: "1px solid var(--ink)",
              boxShadow: "0 0 0 3px var(--bg-white), 0 0 0 4px var(--point)",
            }}
          >
            {profileImage ? (
              <Image src={supabaseRenderUrl(profileImage, { width: 160 })} alt="프로필" fill className="object-cover" sizes="160px" decoding="async" />
            ) : (
              <User size={32} color="var(--neutral-stone)" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            {profileLoading ? (
              <>
                <Skeleton width={90} height={11} />
                <Skeleton width={130} height={17} style={{ marginTop: 6 }} />
              </>
            ) : (
              <>
                <p className="t-caption" style={{ color: "var(--ink-light)" }}>
                  {greeting.text} {greeting.emoji}
                </p>
                <p className="t-body truncate" style={{ color: "var(--ink)" }}>
                  <strong>{username}</strong>님
                </p>
              </>
            )}

            {!profileLoading && tags.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="t-caption inline-flex items-center"
                    style={{
                      background: "var(--bg-pale)",
                      color: "var(--ink-light)",
                      padding: "1px 8px",
                      borderRadius: "var(--r-pill)",
                      border: "1px solid var(--neutral-stone)",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1.5">
            <Link
              href="/mypage/info"
              className="t-small whitespace-nowrap"
              style={{ color: "var(--ink-light)", textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              프로필 수정
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="t-small whitespace-nowrap"
              style={{ color: "var(--neutral-stone)", textDecoration: "underline", textUnderlineOffset: 3 }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </MotionCard>

      {/* 활동 통계 */}
      <motion.div className="grid grid-cols-3 gap-3" variants={cardItem}>
        {[
          { label: "레시피", value: 0 },
          { label: "댓글", value: 0 },
          { label: "좋아요", value: 0 },
        ].map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 320, damping: 22 }}
            className="flex flex-col items-center justify-center py-5"
            style={{
              background: "var(--bg-white)",
              border: "1px solid var(--ink)",
              borderRadius: "var(--r-btn)",
            }}
          >
            <p className="t-h3" style={{ color: "var(--ink)" }}>
              <CountUp value={stat.value} />
            </p>
            <p className="t-caption mt-1" style={{ color: "var(--ink-light)" }}>{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* 최근 구독 */}
      <MotionCard>
        <SectionHeader title="최근 구독" moreLink="/mypage/subscriptions" />
        <div className="px-5 pb-4">
          {subsLoading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : !recentSubs || recentSubs.length === 0 ? (
            <EmptyState
              icon={Repeat}
              message="아직 구독 내역이 없어요"
              ctaLabel="구독 시작하기"
              ctaHref="/subscribe"
            />
          ) : (
            <ul>
              {recentSubs.map((sub, idx) => {
                const status = deriveSubscriptionStatus(sub.startDate, sub.endDate);
                return (
                  <ListRow
                    key={sub.orderId}
                    onNavigate={() => router.push(`/mypage/subscriptions/${sub.orderId}`)}
                    topBorder={idx !== 0}
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
                  </ListRow>
                );
              })}
            </ul>
          )}
        </div>
      </MotionCard>

      {/* 최근 주문 */}
      <MotionCard>
        <SectionHeader title="최근 주문" moreLink="/mypage/orders" />
        <div className="px-5 pb-4">
          {ordersLoading ? (
            <>
              <SkeletonRow />
              <SkeletonRow />
            </>
          ) : !recentOrders || recentOrders.length === 0 ? (
            <EmptyState
              icon={ShoppingBag}
              message="아직 주문 내역이 없어요"
              ctaLabel="스토어 둘러보기"
              ctaHref="/store"
            />
          ) : (
            <ul>
              {recentOrders.map((order, idx) => {
                const { names, remaining } = getProductSummary(order);
                return (
                  <ListRow
                    key={order.orderId}
                    onNavigate={() => router.push(`/mypage/orders/${order.orderId}`)}
                    topBorder={idx !== 0}
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
                      <OrderStatusBadge status={mapStoreOrderStatus(order.status)} />
                      <p className="t-small" style={{ color: "var(--ink)" }}>
                        {order.finalAmount.toLocaleString()}원
                      </p>
                    </div>
                  </ListRow>
                );
              })}
            </ul>
          )}
        </div>
      </MotionCard>

      {/* 빠른 메뉴 */}
      <MotionCard>
        {QUICK_MENU.map((menu, idx) => (
          <Link
            key={menu.path}
            href={menu.path}
            className="group flex items-center justify-between px-5 py-4 transition-colors hover:bg-[var(--bg-pale)]"
            style={{ borderTop: idx === 0 ? undefined : "1px solid var(--neutral-stone)" }}
          >
            <div className="flex items-center gap-3">
              <span
                className="flex items-center justify-center transition-colors group-hover:bg-[var(--point)]"
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "var(--bg-pale)",
                }}
              >
                <menu.icon size={15} color="var(--ink)" />
              </span>
              <span className="t-small" style={{ color: "var(--ink)" }}>{menu.label}</span>
            </div>
            <ChevronRight
              size={16}
              color="var(--neutral-stone)"
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        ))}
      </MotionCard>
    </motion.div>
  );
}

function MotionCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={cardItem}
      style={{
        background: "var(--bg-white)",
        border: "1px solid var(--ink)",
        borderRadius: "var(--r-btn)",
      }}
    >
      {children}
    </motion.div>
  );
}

/** 클릭 가능한 리스트 행 — 호버 배경 + 탭 시 살짝 눌림. */
function ListRow({
  children,
  onNavigate,
  topBorder,
}: {
  children: React.ReactNode;
  onNavigate: () => void;
  topBorder: boolean;
}) {
  return (
    <motion.li
      onClick={onNavigate}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onNavigate();
        }
      }}
      whileTap={{ scale: 0.985 }}
      className="flex items-center justify-between gap-3 py-3 -mx-5 px-5 cursor-pointer transition-colors hover:bg-[var(--bg-pale)]"
      style={{ borderTop: topBorder ? "1px solid var(--neutral-stone)" : undefined }}
    >
      {children}
    </motion.li>
  );
}

function EmptyState({
  icon: Icon,
  message,
  ctaLabel,
  ctaHref,
}: {
  icon: typeof Repeat;
  message: string;
  ctaLabel: string;
  ctaHref: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2.5 py-7">
      <span
        className="flex items-center justify-center"
        style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--bg-pale)" }}
      >
        <Icon size={20} color="var(--neutral-stone)" />
      </span>
      <p className="t-small" style={{ color: "var(--ink-light)" }}>{message}</p>
      <Link
        href={ctaHref}
        className="t-small inline-flex items-center gap-1"
        style={{
          background: "var(--point)",
          color: "var(--ink)",
          padding: "6px 14px",
          borderRadius: "var(--r-pill)",
          border: "1px solid var(--ink)",
        }}
      >
        {ctaLabel}
        <ChevronRight size={14} />
      </Link>
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
          className="group t-caption flex items-center gap-1"
          style={{ color: "var(--ink-light)" }}
        >
          더보기
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </header>
  );
}

function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const variant: Record<OrderStatus, { bg: string; color: string }> = {
    "결제대기": { bg: "var(--bg-white)", color: "var(--alert-red)" },
    "결제완료": { bg: "var(--point)", color: "var(--ink)" },
    "배송중": { bg: "var(--neutral-blue)", color: "var(--ink)" },
    "배송완료": { bg: "var(--bg-off)", color: "var(--ink-light)" },
    "취소됨": { bg: "var(--bg-off)", color: "var(--alert-red)" },
    "기타": { bg: "var(--bg-off)", color: "var(--ink-light)" },
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
