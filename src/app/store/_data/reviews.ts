/**
 * 목(mock) 리뷰 데이터 — 1차 외형용.
 *
 * 백엔드 리뷰 API(#86)가 오면 이 파일을 데이터 레이어로만 교체한다.
 * 컴포넌트는 아래 헬퍼(`getProductReviews` · `summarizeReviews`)와
 * 타입(`ProductReview` 등)만 의존하도록 작성한다.
 *
 * 이미지 경로는 기존 마이페이지와 동일하게 `/veggieverse/...` 리터럴을 쓰고,
 * 파일이 없으면 컴포넌트의 onError에서 graceful하게 숨긴다.
 */

export interface ProductReview {
  id: number;
  /** 어느 상품에 달린 리뷰인지 — 상품 slug로 매칭. */
  productSlug: string;
  productName: string;
  productImage: string;
  /** 가상 작성자(마스킹된 닉네임). */
  author: string;
  /** 1~5 정수 평점. */
  rating: number;
  content: string;
  /** "YYYY.MM.DD" */
  createdAt: string;
  /** 도움이 됨 카운트. */
  helpful: number;
  /** 첨부 이미지(있으면 카드에 썸네일 노출). */
  images?: string[];
  /** 내가 쓴 리뷰 여부 — 마이페이지 "작성한 리뷰" 탭에서 사용. */
  mine?: boolean;
}

export interface PendingReview {
  orderId: string;
  orderDate: string;
  productSlug: string;
  productName: string;
  productImage: string;
  /** 리뷰 작성 마감일 "YYYY.MM.DD" */
  expiresAt: string;
}

export interface ReviewSummary {
  count: number;
  /** 평균 평점(소수 1자리). 리뷰 없으면 0. */
  average: number;
  /** 평점별 개수 { 5: n, 4: n, ... 1: n }. */
  distribution: Record<number, number>;
}

const img = (file: string) => `/veggieverse/store/thumbnails/${file}`;

/** 전체 목 리뷰 풀. 다양한 평점·길이·작성자로 구성. */
export const MOCK_REVIEWS: ProductReview[] = [
  // 볶음김치 (kimchi) — 내가 쓴 리뷰 포함
  { id: 1, productSlug: "kimchi", productName: "볶음김치", productImage: img("kimchi.jpg"), author: "초록***", rating: 5, content: "정말 맛있어요! 젓갈이 없어서 걱정했는데 감칠맛이 살아있네요. 김치찌개 끓여먹으니 최고였습니다. 재구매 의사 100%입니다.", createdAt: "2024.12.10", helpful: 12, mine: true },
  { id: 2, productSlug: "kimchi", productName: "볶음김치", productImage: img("kimchi.jpg"), author: "비건맘", rating: 4, content: "적당히 익어서 바로 먹기 좋았어요. 조금 더 매콤했으면 하는 개인 취향이지만 만족합니다.", createdAt: "2024.12.02", helpful: 5 },
  { id: 3, productSlug: "kimchi", productName: "볶음김치", productImage: img("kimchi.jpg"), author: "k****", rating: 5, content: "밥도둑이에요 진짜.", createdAt: "2024.11.20", helpful: 3 },

  // 시금치 뇨끼 (spinach-gnocchi) — 내가 쓴 리뷰 포함
  { id: 4, productSlug: "spinach-gnocchi", productName: "시금치 뇨끼", productImage: img("gnocchi.jpg"), author: "현***", rating: 4, content: "뇨끼가 쫄깃쫄깃하고 시금치 향이 은은해서 좋았어요. 소스도 맛있었는데 양이 조금 더 많았으면 좋겠네요.", createdAt: "2024.11.28", helpful: 8, mine: true, images: [img("gnocchi.jpg"), img("gnocchi-plated.jpg")] },
  { id: 5, productSlug: "spinach-gnocchi", productName: "시금치 뇨끼", productImage: img("gnocchi.jpg"), author: "파스타러버", rating: 5, content: "에어프라이어에 살짝 구워서 올리브유 둘러 먹으니 식당 퀄리티네요. 아이도 잘 먹었어요. 강추합니다!", createdAt: "2024.11.10", helpful: 17 },
  { id: 6, productSlug: "spinach-gnocchi", productName: "시금치 뇨끼", productImage: img("gnocchi.jpg"), author: "soo**", rating: 3, content: "맛은 무난한데 해동 후 식감이 살짝 물러지는 느낌. 조리법을 좀 더 연구해봐야겠어요.", createdAt: "2024.10.30", helpful: 9 },

  // 블루베리 타르트 (blueberry-tart) — 내가 쓴 리뷰 포함
  { id: 7, productSlug: "blueberry-tart", productName: "블루베리 타르트", productImage: img("blueberry-tart.jpg"), author: "달콤한하루", rating: 5, content: "비건 디저트라고 믿기지 않을 정도로 맛있어요! 블루베리도 신선하고 타르트 크러스트도 바삭해요. 선물용으로도 좋을 것 같아요.", createdAt: "2024.11.15", helpful: 24, mine: true, images: [img("blueberry-tart.jpg")] },
  { id: 8, productSlug: "blueberry-tart", productName: "블루베리 타르트", productImage: img("blueberry-tart.jpg"), author: "j***", rating: 5, content: "단맛이 과하지 않고 딱 좋아요. 커피랑 먹으면 행복합니다.", createdAt: "2024.11.08", helpful: 11 },
  { id: 9, productSlug: "blueberry-tart", productName: "블루베리 타르트", productImage: img("blueberry-tart.jpg"), author: "민트초코", rating: 4, content: "맛있는데 생각보다 사이즈가 작아요. 혼자 먹기엔 딱이지만 나눠먹긴 아쉬워요.", createdAt: "2024.10.25", helpful: 6 },

  // 발사믹 드레싱 (balsamic-dressing)
  { id: 10, productSlug: "balsamic-dressing", productName: "발사믹 드레싱", productImage: img("balsamic.jpg"), author: "샐러드중독", rating: 5, content: "시중 드레싱이랑 차원이 달라요. 산미와 단맛 밸런스가 완벽합니다. 채소가 술술 들어가요.", createdAt: "2024.12.05", helpful: 19 },
  { id: 11, productSlug: "balsamic-dressing", productName: "발사믹 드레싱", productImage: img("balsamic.jpg"), author: "h****", rating: 4, content: "양이 넉넉하고 가성비 좋아요. 다만 개봉 후 빨리 먹어야 할 것 같습니다.", createdAt: "2024.11.18", helpful: 4 },

  // 비건 라자냐 (vegan-lasagna)
  { id: 12, productSlug: "vegan-lasagna", productName: "비건 라자냐", productImage: img("lasagna.jpg"), author: "오늘도채식", rating: 5, content: "고기 없이도 이렇게 든든할 수 있다니. 두부 라구가 진짜 고기 같아요. 손님 대접용으로도 손색없습니다.", createdAt: "2024.12.08", helpful: 21 },
  { id: 13, productSlug: "vegan-lasagna", productName: "비건 라자냐", productImage: img("lasagna.jpg"), author: "p**", rating: 4, content: "데우기만 하면 되니 너무 편해요. 치즈가 조금만 더 많았으면!", createdAt: "2024.11.22", helpful: 7 },
  { id: 14, productSlug: "vegan-lasagna", productName: "비건 라자냐", productImage: img("lasagna.jpg"), author: "라자냐킬러", rating: 3, content: "맛은 좋은데 배송 중에 살짝 눌렸어요. 포장이 조금 아쉬웠습니다.", createdAt: "2024.10.15", helpful: 13 },
];

/**
 * slug별 리뷰 풀에서 일부를 골라 결정적으로(deterministic) 반환.
 * 매칭 리뷰가 없으면 1차 외형이 비지 않도록 풀에서 일부를 빌려온다.
 */
export function getProductReviews(slug: string): ProductReview[] {
  const matched = MOCK_REVIEWS.filter((r) => r.productSlug === slug);
  if (matched.length > 0) return matched;
  // 폴백: slug 길이로 시작점을 정해 매번 같은 4건을 보여준다(외형 데모용).
  const start = slug.length % MOCK_REVIEWS.length;
  return [0, 1, 2, 3].map((i) => MOCK_REVIEWS[(start + i) % MOCK_REVIEWS.length]);
}

/** 리뷰 배열을 평점 요약(개수·평균·분포)으로 집계. */
export function summarizeReviews(reviews: ProductReview[]): ReviewSummary {
  const count = reviews.length;
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let sum = 0;
  for (const r of reviews) {
    const rating = Math.min(5, Math.max(1, Math.round(r.rating)));
    distribution[rating] += 1;
    sum += rating;
  }
  const average = count === 0 ? 0 : Math.round((sum / count) * 10) / 10;
  return { count, average, distribution };
}

/** 마이페이지 "작성한 리뷰" 탭용 — 내가 쓴 리뷰. */
export const MY_REVIEWS: ProductReview[] = MOCK_REVIEWS.filter((r) => r.mine);

/** 마이페이지 "작성 가능" 탭용 — 리뷰 미작성 주문 상품. */
export const PENDING_REVIEWS: PendingReview[] = [
  { orderId: "ORD-2024121501", orderDate: "2024.12.15", productSlug: "vegan-lasagna", productName: "비건 라자냐", productImage: img("lasagna.jpg"), expiresAt: "2025.01.15" },
  { orderId: "ORD-2024120501", orderDate: "2024.12.05", productSlug: "balsamic-dressing", productName: "발사믹 드레싱", productImage: img("balsamic.jpg"), expiresAt: "2025.01.05" },
];
