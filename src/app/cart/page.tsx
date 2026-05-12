"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Minus, Plus, ShoppingCart, Check, Trash2 } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useUser } from "@/contexts/UserContext";
import { deleteCartItem, getCart, syncCartAfterLogin, updateCartItemQuantity } from "@/lib/api/cart";
import { LoginModal } from "@/components/modals/LoginModal";

const SHIPPING_FEE = 3500;
const FREE_SHIPPING_THRESHOLD = 55000;

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR");
}

export default function CartPage() {
  const router = useRouter();
  const { items, updateQuantity, removeItem, syncFromServer } = useCart();
  const { isLoggedIn } = useUser();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [deleting, setDeleting] = useState<Set<number>>(new Set());
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const hydrated = useRef(false);
  const cartFetched = useRef(false);

  useEffect(() => {
    if (!hydrated.current && items.length > 0) {
      setSelected(new Set(items.map((i) => i.productId)));
      hydrated.current = true;
    }
  }, [items]);

  useEffect(() => {
    // 장바구니 페이지 진입 시 서버 카트 조회 → 백엔드를 진실 원천으로 화면 동기화
    // StrictMode 이중 실행 방지
    if (cartFetched.current) return;
    cartFetched.current = true;
    // 비회원 카트 병합이 아직 안 끝났을 수 있으므로 GET 전에 먼저 보장
    (async () => {
      const mergeResult = await syncCartAfterLogin();
      if (mergeResult === "failed") {
        // 병합 실패 시 백엔드 멤버 카트는 비어있을 수 있으므로 화면을 덮어쓰지 않음.
        // localStorage 캐시 데이터를 그대로 유지 → 비회원 추가 상품이 사라지지 않음.
        console.warn(
          "[cart] 비회원 카트 병합 실패 — localStorage 카트를 유지합니다.",
        );
        return;
      }
      const response = await getCart();
      syncFromServer(response);
    })();
  }, [syncFromServer]);

  const allChecked = items.length > 0 && selected.size === items.length;

  const toggleAll = () => {
    setSelected(allChecked ? new Set() : new Set(items.map((i) => i.productId)));
  };
  const toggleOne = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  async function handleDelete(productId: number) {
    setDeleting((prev) => new Set(prev).add(productId));
    const ok = await deleteCartItem(productId);
    if (ok) {
      removeItem(productId);
      setSelected((prev) => { const n = new Set(prev); n.delete(productId); return n; });
    }
    setDeleting((prev) => { const n = new Set(prev); n.delete(productId); return n; });
  }

  async function handleDeleteSelected() {
    const ids = [...selected];
    await Promise.all(ids.map((id) => handleDelete(id)));
  }

  async function handleQuantityChange(productId: number, newQty: number) {
    if (newQty <= 0) {
      await handleDelete(productId);
      return;
    }
    // 낙관적 업데이트 후 API 호출
    updateQuantity(productId, newQty);
    const ok = await updateCartItemQuantity(productId, newQty);
    if (!ok) {
      // 실패 시 롤백 — 현재 items에서 원래 수량 복원
      const original = items.find((i) => i.productId === productId);
      if (original) updateQuantity(productId, original.quantity);
    }
  }

  const selectedItems = useMemo(() => items.filter((i) => selected.has(i.productId)), [items, selected]);
  const selectedTotal = selectedItems.reduce((s, i) => s + i.discountedPrice * i.quantity, 0);
  const shippingFee = selectedItems.length === 0 ? 0 : selectedTotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const orderTotal = selectedTotal + shippingFee;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6" style={{ background: "var(--bg-pale)" }}>
        <ShoppingCart size={48} strokeWidth={1} style={{ color: "var(--neutral-stone)" }} />
        <div className="text-center">
          <p className="t-h3" style={{ color: "var(--ink)", marginBottom: 8 }}>장바구니가 비어 있습니다</p>
          <p className="t-small" style={{ color: "var(--ink-light)" }}>마음에 드는 상품을 담아보세요</p>
        </div>
        <Link href="/store" className="btn btn-dark btn-md">스토어 둘러보기</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-pale)" }}>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={() => {
          setIsLoginModalOpen(false);
          const ids = [...selected].join(",");
          router.push(`/order?items=${ids}`);
        }}
      />
      <div className="mx-auto max-w-5xl px-4 py-6">
        <Link href="/store" className="inline-flex items-center gap-1 t-small mb-6" style={{ color: "var(--ink-light)" }}>
          <ChevronLeft size={16} />
          스토어
        </Link>

        <h1 className="t-h2 mb-8" style={{ color: "var(--ink)" }}>장바구니</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* 상품 목록 */}
          <div className="flex-1">
            {/* 전체 선택 바 */}
            <div
              className="flex items-center justify-between px-4 py-3 mb-3"
              style={{ background: "var(--bg-white)", border: "1px solid var(--ink)", borderRadius: "var(--r-btn)" }}
            >
              <label className="chk-wrap cursor-pointer select-none">
                <input type="checkbox" checked={allChecked} onChange={toggleAll} />
                <span className="t-small" style={{ color: "var(--ink)" }}>
                  전체 선택({selected.size} / {items.length})
                </span>
              </label>
              <button
                onClick={handleDeleteSelected}
                disabled={selected.size === 0}
                className="btn btn-ghost btn-sm"
                style={{ color: "var(--ink-light)" }}
              >
                선택삭제
              </button>
            </div>

            {/* 상품 목록 */}
            <div className="flex flex-col gap-2">
              {items.map((item) => {
                const isChecked = selected.has(item.productId);
                const isDeleting = deleting.has(item.productId);
                return (
                  <div
                    key={item.productId}
                    className="flex gap-3 p-4"
                    style={{
                      background: "var(--bg-white)",
                      border: `1px solid ${isChecked ? "var(--ink)" : "var(--neutral-stone)"}`,
                      borderRadius: "var(--r-btn)",
                      opacity: isDeleting ? 0.5 : 1,
                      transition: "border-color 0.15s, opacity 0.15s",
                    }}
                  >
                    {/* 체크박스 */}
                    <label className="flex-shrink-0 flex items-start pt-1 cursor-pointer">
                      <div
                        className="relative flex items-center justify-center"
                        style={{
                          width: 18,
                          height: 18,
                          border: "1px solid var(--ink)",
                          borderRadius: 4,
                          background: isChecked ? "var(--point)" : "var(--bg-white)",
                          transition: "background 0.12s",
                          flexShrink: 0,
                        }}
                      >
                        {isChecked && <Check size={12} strokeWidth={2.5} style={{ color: "var(--ink)" }} />}
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleOne(item.productId)}
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          style={{ width: "100%", height: "100%" }}
                        />
                      </div>
                    </label>

                    {/* 이미지 */}
                    <Link href={`/store/${item.slug}`} className="flex-shrink-0">
                      <div
                        className="overflow-hidden"
                        style={{ width: 72, height: 72, borderRadius: "var(--r-btn)", background: "var(--bg-off)", border: "1px solid var(--neutral-stone)" }}
                      >
                        {item.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingCart size={18} style={{ color: "var(--neutral-stone)" }} />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0">
                          <p className="t-body truncate" style={{ color: "var(--ink)" }}>{item.name}</p>
                          {item.tagline && (
                            <p className="t-caption truncate mt-0.5" style={{ color: "var(--ink-light)" }}>{item.tagline}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDelete(item.productId)}
                          disabled={isDeleting}
                          className="flex-shrink-0 flex items-center justify-center disabled:opacity-40"
                          style={{ width: 28, height: 28, color: "var(--neutral-stone)" }}
                          aria-label="삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between flex-wrap gap-2">
                        {/* 수량 */}
                        <div className="flex items-center" style={{ border: "1px solid var(--ink)", borderRadius: "var(--r-btn)" }}>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                            disabled={isDeleting}
                            className="flex items-center justify-center disabled:opacity-30"
                            style={{ width: 30, height: 30, color: "var(--ink)" }}
                            aria-label="수량 감소"
                          >
                            <Minus size={13} />
                          </button>
                          <span
                            className="flex items-center justify-center t-small"
                            style={{ width: 34, height: 30, borderLeft: "1px solid var(--ink)", borderRight: "1px solid var(--ink)", color: "var(--ink)" }}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                            disabled={isDeleting}
                            className="flex items-center justify-center disabled:opacity-30"
                            style={{ width: 30, height: 30, color: "var(--ink)" }}
                            aria-label="수량 증가"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        {/* 가격 */}
                        <div className="text-right">
                          {item.discountRate > 0 && (
                            <p className="card-orig">{formatPrice(item.price * item.quantity)}원</p>
                          )}
                          <p style={{ fontSize: 15, color: "var(--ink)" }}>
                            {formatPrice(item.discountedPrice * item.quantity)}원
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 주문 요약 */}
          <div className="lg:w-64 flex-shrink-0">
            <div
              className="p-5 sticky"
              style={{ top: "calc(var(--header-area-h) + 16px)", background: "var(--bg-white)", border: "1px solid var(--ink)", borderRadius: "var(--r-btn)" }}
            >
              <p className="t-h3 mb-4" style={{ color: "var(--ink)" }}>주문 요약</p>

              <dl className="flex flex-col gap-3 t-small">
                <div className="flex justify-between">
                  <dt style={{ color: "var(--ink-light)" }}>선택 상품</dt>
                  <dd style={{ color: "var(--ink)" }}>{selectedItems.length}개</dd>
                </div>
                <div className="flex justify-between">
                  <dt style={{ color: "var(--ink-light)" }}>상품 금액</dt>
                  <dd style={{ color: "var(--ink)" }}>{formatPrice(selectedTotal)}원</dd>
                </div>
                <div className="flex justify-between">
                  <dt style={{ color: "var(--ink-light)" }}>배송비</dt>
                  <dd style={{ color: shippingFee === 0 && selectedItems.length > 0 ? "var(--primary)" : "var(--ink)" }}>
                    {selectedItems.length === 0 ? "-" : shippingFee === 0 ? "무료" : `${formatPrice(shippingFee)}원`}
                  </dd>
                </div>
                {selectedItems.length > 0 && selectedTotal < FREE_SHIPPING_THRESHOLD && (
                  <p className="t-caption" style={{ color: "var(--ink-light)" }}>
                    {formatPrice(FREE_SHIPPING_THRESHOLD - selectedTotal)}원 더 담으면 무료배송
                  </p>
                )}
              </dl>

              <div className="my-4" style={{ borderTop: "1px solid var(--ink)" }} />

              <div className="flex justify-between mb-5">
                <span className="t-body" style={{ color: "var(--ink)" }}>합계</span>
                <span className="t-h3" style={{ color: "var(--ink)" }}>{formatPrice(orderTotal)}원</span>
              </div>

              <button
                className="btn btn-dark w-full btn-lg"
                disabled={selectedItems.length === 0}
                onClick={() => {
                  if (!isLoggedIn) {
                    setIsLoginModalOpen(true);
                    return;
                  }
                  const ids = [...selected].join(",");
                  router.push(`/order?items=${ids}`);
                }}
              >
                {selectedItems.length > 0 ? `${selectedItems.length}개 주문하기` : "상품을 선택해주세요"}
              </button>
              <Link href="/store" className="btn btn-ghost w-full btn-md mt-2" style={{ justifyContent: "center" }}>
                쇼핑 계속하기
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
