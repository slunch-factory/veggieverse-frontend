export interface EventSection {
  heading: string;
  body: string;
}

export interface Event {
  id: number;
  status: "ongoing" | "upcoming" | "ended";
  title: string;
  description: string;
  thumbnail: string;
  startDate: string;
  endDate: string;
  badge?: string;
  /** 상세 페이지 본문 섹션. */
  sections?: EventSection[];
  /** 이 이벤트로 발급 가능한 쿠폰 코드(_data/coupons.ts). */
  couponCodes?: string[];
}

export const EVENTS: Event[] = [
  {
    id: 1,
    status: "ongoing",
    title: "Winter Vegan Festival",
    description: "겨울을 따뜻하게 채워줄 비건 요리 축제",
    thumbnail: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400",
    startDate: "2024.12.01",
    endDate: "2024.12.31",
    badge: "HOT",
    couponCodes: ["WINTER3000"],
    sections: [
      { heading: "이벤트 소개", body: "한 해를 마무리하는 12월, 슬런치 팩토리가 준비한 겨울 비건 축제입니다. 따뜻한 국물 밀키트부터 든든한 라자냐까지, 추운 계절을 채워줄 식물성 요리를 특별가로 만나보세요." },
      { heading: "혜택", body: "행사 기간 동안 스토어 전 상품 2만원 이상 구매 시 3,000원 할인 쿠폰을 드립니다. 인기 겨울 밀키트는 최대 30% 추가 할인됩니다." },
      { heading: "참여 방법", body: "아래 '쿠폰 받기'로 쿠폰을 발급받은 뒤, 스토어에서 원하는 상품을 담고 결제 단계에서 적용하시면 됩니다." },
    ],
  },
  {
    id: 2,
    status: "ongoing",
    title: "New Year Special",
    description: "새해 첫 주문 20% 할인",
    thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
    startDate: "2024.12.26",
    endDate: "2025.01.05",
    couponCodes: ["NEWYEAR20"],
    sections: [
      { heading: "이벤트 소개", body: "새해를 비건으로 가볍게 시작하세요. 2025년 첫 주문에 한해 스토어 전 상품 20% 할인 쿠폰을 드립니다." },
      { heading: "혜택", body: "3만원 이상 구매 시 20% 할인. 신규/기존 회원 모두 참여 가능하며, 1인 1회 사용할 수 있습니다." },
    ],
  },
  {
    id: 3,
    status: "upcoming",
    title: "Veganuary Challenge",
    description: "1월 한 달, 비건 도전 캠페인",
    thumbnail: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400",
    startDate: "2025.01.01",
    endDate: "2025.01.31",
    couponCodes: ["VEGANUARY10"],
    sections: [
      { heading: "이벤트 소개", body: "1월 한 달간 식물성 식사에 도전하는 '비거뉴어리' 캠페인입니다. 매주 새로운 비건 레시피와 식단을 제안해 드립니다." },
      { heading: "혜택", body: "캠페인 참여자에게 기간 내 사용 가능한 10% 할인 쿠폰을 드립니다. SNS 인증 시 추첨을 통해 한 달 구독권도 증정합니다." },
    ],
  },
  {
    id: 4,
    status: "ended",
    title: "Black Friday Sale",
    description: "연중 최대 할인 이벤트",
    thumbnail: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400",
    startDate: "2024.11.22",
    endDate: "2024.11.29",
    sections: [
      { heading: "이벤트 소개", body: "연중 최대 규모의 할인 행사였습니다. 베스트셀러 밀키트와 베이커리를 한정 수량으로 특가 판매했습니다." },
      { heading: "안내", body: "본 이벤트는 종료되었습니다. 다음 시즌 행사 소식은 뉴스레터로 가장 먼저 전해드립니다." },
    ],
  },
  {
    id: 5,
    status: "ended",
    title: "Recipe Contest",
    description: "나만의 비건 레시피 공모전",
    thumbnail: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400",
    startDate: "2024.10.01",
    endDate: "2024.10.31",
    sections: [
      { heading: "이벤트 소개", body: "고객님의 창의적인 비건 레시피를 모았던 공모전입니다. 수상작은 슬런치 레시피 코너에 소개되었습니다." },
      { heading: "안내", body: "본 이벤트는 종료되었습니다. 참여해 주신 모든 분께 감사드립니다." },
    ],
  },
];

export function getEventById(id: number): Event | undefined {
  return EVENTS.find((e) => e.id === id);
}

export function getStatusLabel(status: Event["status"]) {
  switch (status) {
    case "ongoing": return "진행중";
    case "upcoming": return "예정";
    case "ended": return "종료";
  }
}

export function getStatusColor(status: Event["status"]) {
  switch (status) {
    case "ongoing": return "#000000";
    case "upcoming": return "#3fa945";
    case "ended": return "#9A9A9A";
  }
}
