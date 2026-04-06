export interface Product {
  id: number;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  soldOut?: boolean;
  isNew?: boolean;
  description?: string;
}

export const PRODUCTS: Product[] = [
  { id: 1, name: "볶음김치", price: 12000, category: "밀키트", description: "깊고 진한 맛이 살아있는 볶음김치" },
  { id: 2, name: "김치볶음밥", price: 12000, originalPrice: 15000, category: "밀키트", description: "감칠맛 끝판왕, 한 그릇에 담은 김치볶음밥" },
  { id: 3, name: "시금치 뇨끼", price: 18000, originalPrice: 24000, category: "밀키트", description: "채소와 두부로 빚은 달콤짭짤 뇨끼" },
  { id: 4, name: "블루베리 타르트", price: 39000, originalPrice: 44000, category: "베이커리", description: "슬런치 팩토리 프리미엄 블루베리 타르트" },
  { id: 5, name: "복숭아 타르트", price: 32000, originalPrice: 35000, category: "베이커리", description: "달콤한 복숭아를 올린 비건 디저트" },
  { id: 6, name: "잠봉뵈르", price: 8000, originalPrice: 12000, category: "밀키트", soldOut: true, description: "슬런치 팩토리의 베스트 셀러" },
  { id: 7, name: "자두 타르트", price: 39000, originalPrice: 44000, category: "베이커리", description: "상큼한 자두를 올린 프리미엄 비건 타르트" },
  { id: 8, name: "피넛버터 초콜릿 타르트", price: 39000, originalPrice: 44000, category: "베이커리", description: "고소한 피넛버터와 진한 초콜릿의 완벽한 조합" },
  { id: 9, name: "김치칼국수", price: 15000, category: "밀키트", description: "칼칼하고 진한 야채육수의 맛" },
  { id: 10, name: "김치전", price: 18000, category: "밀키트", description: "바삭하게 구운 비건 김치전" },
  { id: 11, name: "단호박 초코 케익", price: 35000, category: "베이커리", description: "부드러운 단호박과 진한 초콜릿의 조화" },
  { id: 14, name: "페퍼로니 피자", price: 22000, category: "밀키트", soldOut: true, description: "비건 페퍼로니와 신선한 채소를 올린 비건 피자" },
  { id: 16, name: "샐러드 드레싱 5종 테스터", price: 8800, category: "소스와 오일", description: "다양한 소스 맛보고 취향 찾아요" },
  { id: 17, name: "오리엔탈 드레싱", price: 7600, category: "소스와 오일", isNew: true, description: "고소하고 산뜻한 채소 친화적 드레싱" },
  { id: 18, name: "분짜 드레싱", price: 7600, category: "소스와 오일", isNew: true, description: "베트남 감성 그대로, 상큼한 피시프리 소스" },
  { id: 19, name: "랜치 드레싱 소스", price: 9600, category: "소스와 오일", isNew: true, description: "크리미하고 진한 맛, 샐러드의 완성" },
  { id: 20, name: "발사믹 드레싱", price: 7600, category: "소스와 오일", isNew: true, description: "깊고 달콤한 산미로 어떤 샐러드든 한 단계 업" },
  { id: 21, name: "바질 페스토 드레싱", price: 9600, category: "소스와 오일", isNew: true, description: "이탈리아 허브향 가득, 파스타에도 샐러드에도" },
  { id: 22, name: "매생이 크림 펜네", price: 5200, category: "밀키트", isNew: true, description: "바다향 매생이와 고소한 크림소스의 만남" },
  { id: 23, name: "매생이 트러플 리조또", price: 6000, category: "밀키트", isNew: true, description: "트러플 향으로 한 그릇을 특별하게" },
  { id: 24, name: "매생이 페스토", price: 8800, category: "소스와 오일", isNew: true, description: "제철 매생이로 만든 초록빛 건강 페스토" },
  { id: 25, name: "감태버터", price: 9600, category: "소스와 오일", isNew: true, description: "바다내음 감태로 만든 건강한 버터 스프레드" },
  { id: 26, name: "주먹밥 5종 10봉 세트", price: 21500, category: "세트", description: "인기 주먹밥 5종, 총 10봉 세트" },
  { id: 27, name: "김치 주먹밥", price: 2650, category: "밀키트", isNew: true, description: "알싸하고 진한 김치맛이 밥알 하나하나에" },
  { id: 28, name: "간장버터 주먹밥", price: 2650, category: "밀키트", isNew: true, description: "고소한 대두버터가 황금빛 밥알에 녹아들어" },
  { id: 29, name: "참치마요 주먹밥", price: 2650, category: "밀키트", isNew: true, description: "크리미한 참치마요, 깔끔한 매운 끝맛" },
  { id: 30, name: "버섯 주먹밥", price: 2650, category: "밀키트", isNew: true, description: "향긋하게 볶은 버섯이 밥 속 깊이" },
  { id: 31, name: "불고기 주먹밥", price: 2650, category: "밀키트", isNew: true, description: "달콤 짭짤 불고기 맛에 스모키한 여운까지" },
];
