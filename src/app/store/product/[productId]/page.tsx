"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronUp,
  Minus,
  Plus,
  ShoppingCart,
  Heart,
  Truck,
  Info,
} from "lucide-react";
import { getProductThumbnailImages } from "@/utils/productImages";

/* ------------------------------------------------------------------ */
/*  Product Data                                                       */
/* ------------------------------------------------------------------ */

interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice: number;
  description: string;
  detailDescription: string;
  spectrum: string;
  category: string;
  soldOut: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "유기농 케일 샐러드 믹스",
    price: 12900,
    originalPrice: 15900,
    description: "신선한 유기농 케일과 다양한 채소를 한번에",
    detailDescription:
      "국내 유기농 인증 농장에서 재배한 케일을 중심으로 로메인, 적채, 당근 등을 최적의 비율로 블렌딩한 샐러드 믹스입니다. 세척 없이 바로 드실 수 있으며, 신선도 유지를 위해 콜드체인 시스템으로 배송됩니다.",
    spectrum: "그린",
    category: "샐러드",
    soldOut: false,
  },
  {
    id: 2,
    name: "비건 단백질 그래놀라",
    price: 8900,
    originalPrice: 11000,
    description: "식물성 단백질이 풍부한 건강 그래놀라",
    detailDescription:
      "귀리, 아몬드, 호두, 캐슈넛 등 견과류와 병아리콩 단백질을 더한 고단백 그래놀라입니다. 메이플 시럽으로 은은한 단맛을 더했으며, 우유나 요거트와 함께 드시면 더욱 맛있습니다.",
    spectrum: "옐로우",
    category: "시리얼",
    soldOut: false,
  },
  {
    id: 3,
    name: "콜드프레스 ABC 주스",
    price: 5900,
    originalPrice: 7500,
    description: "사과, 비트, 당근을 저온 압착한 건강 주스",
    detailDescription:
      "사과(Apple), 비트(Beet), 당근(Carrot)을 저온 압착 방식으로 착즙하여 영양소 파괴를 최소화한 프리미엄 주스입니다. 1병에 약 1kg의 원물이 들어가며, 무첨가 100% 원액입니다.",
    spectrum: "레드",
    category: "음료",
    soldOut: false,
  },
  {
    id: 4,
    name: "두부 스테이크 세트",
    price: 15900,
    originalPrice: 19900,
    description: "레스토랑 퀄리티의 비건 두부 스테이크",
    detailDescription:
      "국산 콩 100%로 만든 단단한 두부를 특제 마리네이드에 재운 후 그릴에 구워낸 비건 스테이크입니다. 버섯 소스와 구운 채소가 함께 포함되어 있어 간편하게 한 끼를 완성할 수 있습니다.",
    spectrum: "브라운",
    category: "간편식",
    soldOut: false,
  },
  {
    id: 5,
    name: "아보카도 스프레드",
    price: 7500,
    originalPrice: 9000,
    description: "잘 익은 아보카도로 만든 프리미엄 스프레드",
    detailDescription:
      "멕시코산 하스 아보카도를 수확 후 48시간 내에 가공하여 신선함을 그대로 담았습니다. 레몬즙, 천일염, 올리브오일만 넣어 깔끔한 맛이 특징이며, 토스트, 샌드위치, 샐러드에 활용하기 좋습니다.",
    spectrum: "그린",
    category: "소스/잼",
    soldOut: false,
  },
  {
    id: 6,
    name: "현미 누룽지 칩",
    price: 4500,
    originalPrice: 5500,
    description: "바삭한 현미 누룽지로 만든 건강 스낵",
    detailDescription:
      "국산 현미를 전통 방식으로 누룽지를 만들어 바삭하게 구운 건강 스낵입니다. 기름에 튀기지 않아 담백하며, 간식이나 안주로 즐기기 좋습니다. 아이들 간식으로도 안심하고 드실 수 있습니다.",
    spectrum: "브라운",
    category: "스낵",
    soldOut: false,
  },
  {
    id: 7,
    name: "오트밀크 바리스타",
    price: 6900,
    originalPrice: 8500,
    description: "커피와 찰떡궁합 바리스타용 오트밀크",
    detailDescription:
      "핀란드산 귀리로 만든 바리스타 전용 오트밀크입니다. 거품이 잘 나며 커피와 섞어도 분리되지 않아 라떼 메뉴에 최적화되어 있습니다. 무가당, 무첨가로 귀리 본연의 고소한 맛을 느낄 수 있습니다.",
    spectrum: "화이트",
    category: "음료",
    soldOut: false,
  },
  {
    id: 8,
    name: "비건 김치 볶음밥",
    price: 6500,
    originalPrice: 8000,
    description: "젓갈 없이 만든 비건 김치로 볶은 볶음밥",
    detailDescription:
      "비건 김치와 국산 쌀, 두부 크럼블, 각종 채소를 넣어 만든 냉동 볶음밥입니다. 전자레인지로 5분이면 완성되는 간편식이며, 젓갈과 동물성 재료를 일체 사용하지 않았습니다.",
    spectrum: "레드",
    category: "간편식",
    soldOut: true,
  },
  {
    id: 9,
    name: "캐슈넛 치즈 소스",
    price: 9800,
    originalPrice: 12000,
    description: "유제품 없이 만든 크리미한 치즈 소스",
    detailDescription:
      "캐슈넛을 베이스로 뉴트리셔널 이스트, 레몬즙 등을 블렌딩하여 진짜 치즈처럼 크리미한 맛을 구현했습니다. 파스타, 나초, 피자 등 다양한 요리에 활용할 수 있습니다.",
    spectrum: "옐로우",
    category: "소스/잼",
    soldOut: false,
  },
  {
    id: 10,
    name: "슈퍼푸드 에너지볼",
    price: 11500,
    originalPrice: 14000,
    description: "견과류와 슈퍼푸드로 만든 에너지 간식",
    detailDescription:
      "대추야자, 아몬드, 카카오닙스, 치아시드, 코코넛 등을 뭉쳐 만든 에너지볼입니다. 한 알에 필요한 영양소가 가득하며, 운동 전후 간식이나 식사 대용으로 좋습니다. 12개입.",
    spectrum: "퍼플",
    category: "스낵",
    soldOut: false,
  },
];

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function discountRate(original: number, current: number) {
  return Math.round(((original - current) / original) * 100);
}

function formatPrice(n: number) {
  return n.toLocaleString("ko-KR");
}

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

const TABS = [
  { key: "review", label: "리뷰" },
  { key: "detail", label: "상세정보" },
  { key: "return", label: "반품/교환정보" },
  { key: "inquiry", label: "상품문의" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const product = PRODUCTS.find((p) => p.id === Number(productId));

  /* image gallery */
  const images = getProductThumbnailImages(Number(productId));
  const [mainIdx, setMainIdx] = useState(0);

  /* quantity */
  const [quantity, setQuantity] = useState(1);

  /* liked */
  const [liked, setLiked] = useState(false);

  /* tabs */
  const [activeTab, setActiveTab] = useState<TabKey>("review");
  const sectionRefs = useRef<Record<TabKey, HTMLDivElement | null>>({
    review: null,
    detail: null,
    return: null,
    inquiry: null,
  });
  const tabBarRef = useRef<HTMLDivElement | null>(null);

  const scrollToSection = (key: TabKey) => {
    setActiveTab(key);
    const el = sectionRefs.current[key];
    if (!el) return;
    const tabBarH = tabBarRef.current?.offsetHeight ?? 48;
    const y = el.getBoundingClientRect().top + window.scrollY - tabBarH - 16;
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  /* scroll spy */
  useEffect(() => {
    const handleScroll = () => {
      const tabBarH = tabBarRef.current?.offsetHeight ?? 48;
      for (let i = TABS.length - 1; i >= 0; i--) {
        const el = sectionRefs.current[TABS[i].key];
        if (el) {
          const top = el.getBoundingClientRect().top - tabBarH - 32;
          if (top <= 0) {
            setActiveTab(TABS[i].key);
            return;
          }
        }
      }
      setActiveTab(TABS[0].key);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ----- not found ----- */
  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 bg-[var(--cream)]">
        <p className="text-lg font-medium text-stone-700">
          상품을 찾을 수 없습니다.
        </p>
        <Link
          href="/store"
          className="inline-flex items-center gap-1 rounded-md bg-black px-4 py-2 text-sm text-white"
        >
          <ChevronLeft size={16} />
          스토어로 돌아가기
        </Link>
      </div>
    );
  }

  const discount = discountRate(product.originalPrice, product.price);
  const totalPrice = product.price * quantity;

  /* ================================================================ */
  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* ---- back nav ---- */}
      <div className="mx-auto max-w-6xl px-4 py-3">
        <Link
          href="/store"
          className="inline-flex items-center gap-1 text-sm text-stone-500 hover:text-stone-800"
        >
          <ChevronLeft size={16} />
          스토어
        </Link>
      </div>

      {/* ---- main two-col ---- */}
      <div className="mx-auto max-w-6xl px-4 pb-8 flex flex-col lg:flex-row gap-8">
        {/* ======== LEFT: image gallery ======== */}
        <div className="w-full lg:w-1/2">
          {/* main image */}
          <div className="relative aspect-square w-full overflow-hidden rounded-lg border border-stone-200 bg-white">
            <Image
              src={images[mainIdx]}
              alt={product.name}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            {/* slide indicators */}
            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setMainIdx(i)}
                  className={`h-2 w-2 rounded-full transition-colors ${
                    i === mainIdx ? "bg-black" : "bg-white/70"
                  }`}
                  aria-label={`이미지 ${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* thumbnails */}
          <div className="mt-3 flex gap-2 overflow-x-auto">
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setMainIdx(i)}
                className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border-2 transition-colors ${
                  i === mainIdx ? "border-black" : "border-stone-200"
                }`}
              >
                <Image
                  src={src}
                  alt={`${product.name} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </button>
            ))}
          </div>
        </div>

        {/* ======== RIGHT: product info ======== */}
        <div className="w-full lg:w-1/2">
          {/* BEST badge */}
          <span className="mb-2 inline-block rounded bg-black px-2 py-0.5 text-xs font-bold text-white">
            BEST
          </span>

          {/* name */}
          <h1 className="text-[24px] font-bold leading-tight text-stone-900">
            {product.name}
          </h1>

          {/* price */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-bold text-[#87b5e1]">
              {discount}%
            </span>
            <span className="text-2xl font-extrabold text-stone-900">
              {formatPrice(product.price)}원
            </span>
            <span className="text-sm text-stone-400 line-through">
              {formatPrice(product.originalPrice)}원
            </span>
          </div>

          {/* description */}
          <p className="mt-3 text-sm leading-relaxed text-stone-600">
            {product.description}
          </p>

          {/* tags */}
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full border border-stone-300 px-3 py-0.5 text-xs text-stone-600">
              {product.spectrum}
            </span>
            <span className="rounded-full border border-stone-300 px-3 py-0.5 text-xs text-stone-600">
              {product.category}
            </span>
          </div>

          {/* divider */}
          <div className="my-5 border-t border-black" />

          {/* purchase info */}
          <dl className="space-y-2 text-sm">
            <div className="flex">
              <dt className="w-24 flex-shrink-0 font-medium text-stone-500">
                포인트
              </dt>
              <dd className="text-stone-800">
                {formatPrice(Math.floor(product.price * 0.01))}P 적립
              </dd>
            </div>
            <div className="flex">
              <dt className="w-24 flex-shrink-0 font-medium text-stone-500">
                배송방법
              </dt>
              <dd className="text-stone-800">택배</dd>
            </div>
            <div className="flex">
              <dt className="w-24 flex-shrink-0 font-medium text-stone-500">
                배송비
              </dt>
              <dd className="text-stone-800">
                3,500원{" "}
                <span className="text-stone-400">
                  (55,000원 이상 무료)
                </span>
              </dd>
            </div>
          </dl>

          {/* 오늘출발 info box */}
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-stone-200 bg-white p-3">
            <Truck size={18} className="mt-0.5 flex-shrink-0 text-[#87b5e1]" />
            <div className="text-sm">
              <p className="font-semibold text-stone-800">오늘출발 상품</p>
              <p className="mt-0.5 text-stone-500">
                평일 14시 이전 주문 시 당일 출고됩니다.
              </p>
            </div>
            <Info size={14} className="ml-auto mt-0.5 flex-shrink-0 text-stone-400" />
          </div>

          {/* divider */}
          <div className="my-5 border-t border-black" />

          {/* quantity selector */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-stone-700">수량</span>
            <div className="flex items-center border border-black rounded">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30"
                disabled={quantity <= 1 || product.soldOut}
                aria-label="수량 감소"
              >
                <Minus size={16} />
              </button>
              <span className="flex h-9 w-12 items-center justify-center border-x border-black text-sm font-medium">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="flex h-9 w-9 items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30"
                disabled={product.soldOut}
                aria-label="수량 증가"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* divider */}
          <div className="my-5 border-t border-black" />

          {/* total price */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-stone-500">
              총 상품금액
            </span>
            <span className="text-2xl font-extrabold text-stone-900">
              {formatPrice(totalPrice)}원
            </span>
          </div>

          {/* desktop buttons (hidden on mobile) */}
          <div className="mt-6 hidden lg:flex gap-2">
            <button
              onClick={() => setLiked((v) => !v)}
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded border border-black transition-colors ${
                liked ? "bg-red-50 text-red-500" : "bg-white text-stone-600"
              }`}
              aria-label="좋아요"
            >
              <Heart size={20} fill={liked ? "currentColor" : "none"} />
            </button>
            <button
              className="flex h-12 flex-1 items-center justify-center gap-1.5 rounded border border-black bg-white text-sm font-semibold text-stone-800 hover:bg-stone-50 disabled:opacity-40"
              disabled={product.soldOut}
            >
              <ShoppingCart size={18} />
              장바구니
            </button>
            <button
              className="flex h-12 flex-1 items-center justify-center rounded bg-black text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-40"
              disabled={product.soldOut}
            >
              {product.soldOut ? "품절" : "바로구매"}
            </button>
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* TAB SECTION                                                       */}
      {/* ================================================================ */}

      <div className="mx-auto max-w-6xl px-4 pb-40 lg:pb-16">
        {/* sticky tab bar */}
        <div
          ref={tabBarRef}
          className="sticky top-0 z-30 flex border-b border-black bg-[var(--cream)]"
        >
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => scrollToSection(tab.key)}
              className={`flex-1 py-3 text-center text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "border-b-2 border-black text-stone-900"
                  : "text-stone-400 hover:text-stone-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* --- 리뷰 --- */}
        <div
          ref={(el) => { sectionRefs.current.review = el; }}
          className="pt-8"
        >
          <h2 className="text-lg font-bold text-stone-900">리뷰</h2>
          <div className="mt-4 rounded-lg border border-stone-200 bg-white p-6 text-center text-sm text-stone-400">
            아직 작성된 리뷰가 없습니다.
          </div>
        </div>

        {/* --- 상세정보 --- */}
        <div
          ref={(el) => { sectionRefs.current.detail = el; }}
          className="pt-8"
        >
          <h2 className="text-lg font-bold text-stone-900">상세정보</h2>
          <div className="mt-4 rounded-lg border border-stone-200 bg-white p-6 text-sm leading-relaxed text-stone-700">
            {product.detailDescription}
          </div>
        </div>

        {/* --- 반품/교환정보 --- */}
        <div
          ref={(el) => { sectionRefs.current.return = el; }}
          className="pt-8"
        >
          <h2 className="text-lg font-bold text-stone-900">반품/교환정보</h2>
          <div className="mt-4 space-y-3 rounded-lg border border-stone-200 bg-white p-6 text-sm leading-relaxed text-stone-700">
            <p>
              <strong>반품/교환 기한</strong>: 상품 수령일로부터 7일 이내
              신청하실 수 있습니다.
            </p>
            <p>
              <strong>반품 배송비</strong>: 고객 변심에 의한 반품 시 왕복
              배송비 5,000원이 부과됩니다.
            </p>
            <p>
              <strong>교환 불가 사유</strong>: 신선식품 특성상 단순 변심에
              의한 교환은 어려울 수 있습니다. 상품 하자 시 사진과 함께
              고객센터로 문의 바랍니다.
            </p>
          </div>
        </div>

        {/* --- 상품문의 --- */}
        <div
          ref={(el) => { sectionRefs.current.inquiry = el; }}
          className="pt-8"
        >
          <h2 className="text-lg font-bold text-stone-900">상품문의</h2>
          <div className="mt-4 rounded-lg border border-stone-200 bg-white p-6 text-center text-sm text-stone-400">
            등록된 문의가 없습니다.
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* MOBILE FIXED BOTTOM BAR                                          */}
      {/* ================================================================ */}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-stone-200 bg-white px-4 py-3 lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center gap-2">
          <button
            onClick={() => setLiked((v) => !v)}
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded border border-black transition-colors ${
              liked ? "bg-red-50 text-red-500" : "bg-white text-stone-600"
            }`}
            aria-label="좋아요"
          >
            <Heart size={20} fill={liked ? "currentColor" : "none"} />
          </button>
          <button
            className="flex h-11 flex-1 items-center justify-center gap-1.5 rounded border border-black bg-white text-sm font-semibold text-stone-800 disabled:opacity-40"
            disabled={product.soldOut}
          >
            <ShoppingCart size={18} />
            장바구니
          </button>
          <button
            className="flex h-11 flex-1 items-center justify-center rounded bg-black text-sm font-semibold text-white disabled:opacity-40"
            disabled={product.soldOut}
          >
            {product.soldOut ? "품절" : "바로구매"}
          </button>
        </div>
      </div>

      {/* scroll to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-20 right-4 z-50 flex h-10 w-10 items-center justify-center rounded-full border border-stone-300 bg-white shadow-md lg:bottom-6"
        aria-label="맨 위로"
      >
        <ChevronUp size={20} />
      </button>
    </div>
  );
}
