/**
 * URL 안전한 경로 생성 헬퍼
 */
const getImageUrl = (path: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_PATH || "";
  const cleanBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith("/") ? path.slice(1) : path;
  return `${cleanBase}/${cleanPath}`;
};

/**
 * 상품 ID에 해당하는 썸네일 이미지 경로 배열을 반환
 * ID는 store/page.tsx의 PRODUCTS 배열과 일치
 */
export const getProductThumbnailImages = (productId: number): string[] => {
  switch (productId) {
    case 1: // 볶음김치
      return [
        getImageUrl("store/thumbnails/kimchi/kimchi-can-1.jpg"),
        getImageUrl("store/thumbnails/kimchi/kimchi-can-2.jpg"),
        getImageUrl("store/thumbnails/kimchi/kimchi-can-3.jpg"),
        getImageUrl("store/thumbnails/kimchi/kimchi-can-4.jpg"),
        getImageUrl("store/thumbnails/kimchi/kimchi-can-5.jpg"),
      ];

    case 2: // 김치볶음밥
      return [
        getImageUrl("store/thumbnails/kimchi-fried-rice-mealkit/kimchi-mealkit-1.jpg"),
        getImageUrl("store/thumbnails/kimchi-fried-rice-mealkit/kimchi-mealkit-2.jpg"),
        getImageUrl("store/thumbnails/kimchi-fried-rice-mealkit/kimchi-mealkit-3.jpg"),
        getImageUrl("store/thumbnails/kimchi-fried-rice-mealkit/kimchi-mealkit-4.jpg"),
        getImageUrl("store/thumbnails/kimchi-fried-rice-mealkit/kimchi-mealkit-5.jpg"),
      ];

    case 3: // 시금치 뇨끼
      return [
        getImageUrl("store/thumbnails/spinach-gnocchi-mealkit/spinach-gnocchi-1.jpg"),
        getImageUrl("store/thumbnails/spinach-gnocchi-mealkit/spinach-gnocchi-2.jpg"),
        getImageUrl("store/thumbnails/spinach-gnocchi-mealkit/spinach-gnocchi-3.jpg"),
        getImageUrl("store/thumbnails/spinach-gnocchi-mealkit/spinach-gnocchi-4.jpg"),
        getImageUrl("store/thumbnails/spinach-gnocchi-mealkit/spinach-gnocchi-5.jpg"),
      ];

    case 4: // 블루베리 타르트
      return [
        getImageUrl("store/thumbnails/blueberry-tart-piece/blueberry-tart-piece-1.jpg"),
        getImageUrl("store/thumbnails/blueberry-tart-piece/blueberry-tart-piece-2.jpg"),
        getImageUrl("store/thumbnails/blueberry-tart-piece/blueberry-tart-piece-3.jpg"),
        getImageUrl("store/thumbnails/blueberry-tart-piece/blueberry-tart-piece-4.jpg"),
        getImageUrl("store/thumbnails/blueberry-tart-piece/tart-3-piece-common-1.jpg"),
      ];

    case 5: // 복숭아 타르트
      return [
        getImageUrl("store/thumbnails/peach-tart-piece/peach-tart-piece-1.jpg"),
        getImageUrl("store/thumbnails/peach-tart-piece/peach-tart-piece-2.jpg"),
        getImageUrl("store/thumbnails/peach-tart-piece/peach-tart-piece-3.jpg"),
        getImageUrl("store/thumbnails/peach-tart-piece/tart-3-piece-common-1.jpg"),
        getImageUrl("store/thumbnails/peach-tart-piece/tart-3-piece-common-2.jpg"),
      ];

    case 6: // 잠봉뵈르
      return [
        getImageUrl("store/thumbnails/jambon-beurre-mealkit/jambon-beurre-1.jpg"),
        getImageUrl("store/thumbnails/jambon-beurre-mealkit/jambon-beurre-2.jpg"),
        getImageUrl("store/thumbnails/jambon-beurre-mealkit/jambon-beurre-3.jpg"),
        getImageUrl("store/thumbnails/jambon-beurre-mealkit/jambon-beurre-4.jpg"),
        getImageUrl("store/thumbnails/jambon-beurre-mealkit/jambon-beurre-5.jpg"),
      ];

    case 7: // 자두 타르트
      return [
        getImageUrl("store/thumbnails/plum-tart-piece/plum-tart-piece-1.jpg"),
        getImageUrl("store/thumbnails/plum-tart-piece/plum-tart-piece-2.jpg"),
        getImageUrl("store/thumbnails/plum-tart-piece/tart-3-piece-common-1.jpg"),
        getImageUrl("store/thumbnails/plum-tart-piece/tart-3-piece-common-2.jpg"),
      ];

    case 8: // 피넛버터 초콜릿 타르트
      return [
        getImageUrl("store/thumbnails/peanut-butter-choco-bar/peanut-butter-choco-bar-1.jpg"),
        getImageUrl("store/thumbnails/peanut-butter-choco-bar/peanut-butter-choco-bar-2.jpg"),
        getImageUrl("store/thumbnails/peanut-butter-choco-bar/peanut-butter-choco-bar-3.jpg"),
        getImageUrl("store/thumbnails/peanut-butter-choco-bar/peanut-butter-choco-bar-4.jpg"),
        getImageUrl("store/thumbnails/peanut-butter-choco-bar/peanut-butter-choco-bar-5.jpg"),
      ];

    case 9: // 김치칼국수
      return [
        getImageUrl("store/thumbnails/kimchi/kimchi-can-1.jpg"),
        getImageUrl("store/thumbnails/kimchi/kimchi-can-2.jpg"),
      ];

    case 10: // 김치전
      return [
        getImageUrl("store/thumbnails/kimchi/kimchi-can-3.jpg"),
        getImageUrl("store/thumbnails/kimchi/kimchi-can-4.jpg"),
      ];

    case 11: // 단호박 초코 케익
      return [
        getImageUrl("store/thumbnails/peanut-butter-choco-bar/peanut-butter-choco-bar-1.jpg"),
      ];

    default:
      // 이미지가 없는 상품 (드레싱, 주먹밥 등)
      return [];
  }
};

/**
 * 홈페이지 상품 이미지 경로
 */
export const getHomeProductImage = (index: number): string => {
  const images = [
    getImageUrl("store/thumbnails/kimchi/kimchi-can-5.jpg"),
    getImageUrl("store/thumbnails/spinach-gnocchi-mealkit/spinach-gnocchi-5.jpg"),
    getImageUrl("store/thumbnails/plum-tart-piece/plum-tart-piece-1.jpg"),
    getImageUrl("store/thumbnails/peanut-butter-choco-bar/peanut-butter-choco-bar-4.jpg"),
  ];
  return images[index] || "";
};
