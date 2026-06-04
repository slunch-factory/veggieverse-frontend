/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

export interface TemplateStat   { num: string; unit: string; label: string }
export interface TemplateCircle { main: string; sub: string }
export interface TemplateStrengthItem { image?: string; title: string; desc: string }
export interface TemplateServingItem  { image?: string; title: string; desc: string }
export interface TemplateCertItem     { title: string; desc: string }
export interface TemplateQnAItem      { q: string; a: string }

export interface ProductDetailTemplateData {
  /* 섹션 1 — Hero */
  hero?: { image?: string; title: string; desc: string };

  /* 섹션 2 — Intro */
  intro?: { label: string; title: string; body: string; sharingImage?: string };

  /* 섹션 3 — Feature */
  feature?: { image?: string; title: string; body: string };

  /* 섹션 4 — Process */
  process?: { image?: string; title: string; body: string; steps: string[] };

  /* 섹션 5 — Ingredient */
  ingredient?: { image?: string; title: string; body: string; detailImage?: string };

  /* 섹션 6 — Certification */
  cert?: { subtitle: string; title: string; body: string; image?: string; items: TemplateCertItem[] };

  /* 섹션 7 — Heritage */
  heritage?: { image?: string; label: string; title: string; body: string; stats: TemplateStat[] };

  /* 섹션 8 — Serving */
  serving?: { title: string; subtitle: string; centerImage?: string; items: TemplateServingItem[]; tip?: string };

  /* 섹션 9 — Strength */
  strength?: { title: string; quote: string; circles: TemplateCircle[]; items: TemplateStrengthItem[] };

  /* 섹션 10 — Reveal */
  reveal?: { image?: string; quote: string; body: string; gatheringImage?: string };

  /* 섹션 11 — Review */
  review?: { title: string; subtitle: string; items: string[] };

  /* 섹션 12 — QnA */
  qna?: { title: string; subtitle: string; items: TemplateQnAItem[] };

  /* 섹션 13 — Info */
  info?: {
    제품명?: string; 식품유형?: string; 품목보고번호?: string;
    내용량?: string; 내포장재질?: string; 유통기한?: string;
    제조원?: string; 소분원?: string; 판매원?: string;
    원료명?: string; 알레르기?: string; 참고사항?: string;
  };

  /* admin 전용 — 풀와이드 엔딩샷 이미지 */
  endingImage?: string;
}

/* ------------------------------------------------------------------ */
/*  Dynamic — admin이 백엔드 description 필드에 실어보낸 템플릿 JSON 파싱      */
/* ------------------------------------------------------------------ */

/** description 본문이 템플릿 JSON임을 식별하는 마커 (admin lib/store-desc.ts와 동일) */
const TEMPLATE_MARKER = "productDetailTemplate";

/**
 * 백엔드 product.description 문자열에서 상세 템플릿을 추출한다.
 * admin이 `{ __type: "productDetailTemplate", v, data }` 형태로 저장한 경우만 인식하고,
 * 평문 설명이거나 파싱 실패 시 null(= 하드코딩/평문 fallback)을 반환한다.
 */
export function parseDescTemplate(
  description?: string | null,
): ProductDetailTemplateData | null {
  if (!description) return null;
  try {
    const obj = JSON.parse(description) as {
      __type?: string;
      data?: ProductDetailTemplateData;
    };
    if (obj && obj.__type === TEMPLATE_MARKER && obj.data) return obj.data;
  } catch {
    // 평문 설명 — 템플릿 아님
  }
  return null;
}

/* ------------------------------------------------------------------ */
/*  Static data per slug                                               */
/* ------------------------------------------------------------------ */

export const PRODUCT_TEMPLATE_DATA: Record<string, ProductDetailTemplateData> = {
  "blueberry-tart": {
    hero: {
      title: "통째로 즐기는\n블루베리의 깊은 풍미",
      desc: "우유와 버터 없이 만든 식물성 타르트.\n블루베리 본연의 맛을 살렸습니다.",
    },
    intro: {
      label: "Product introduction",
      title: "우유와 버터 없이\n타르트의 본질만 남기다",
      body: "식물성 버터로 구운 바삭한 크러스트 위에 신선한 과일을 듬뿍.\n동물성 재료 없이도 완벽한 맛의 균형.",
    },
    feature: {
      title: "블루베리 가득한\n식물성 타르트",
      body: "유기농 버터 대신 식물성 재료로 만든 부드러운 크림.\n한입에 퍼지는 베리의 신선한 맛.",
    },
    process: {
      title: "정성스러운 제조 공정",
      body: "슬런치의 전문 셰프팀이 직접 레시피를 개발하고 품질을 관리합니다.",
      steps: [
        "신선한 식물성 원료를 직접 손질합니다",
        "셰프팀의 레시피로 정성껏 조리합니다",
        "급속냉동으로 맛과 영양을 보존합니다",
        "금속검출기 및 품질검사 후 포장합니다",
        "냉동 콜드체인으로 안전하게 배송합니다",
      ],
    },
    ingredient: {
      title: "깨끗한 재료, 정직한 맛",
      body: "블루베리, 라즈베리, 블랙베리의 풍부한 과일 향.\n유기농 시어버터로 완성한 진한 베리의 깊은 맛.",
    },
    cert: {
      subtitle: "Certified Quality",
      title: "깨끗한 환경, 믿을 수 있는 인증",
      body: "직접 먹어본 좋은 재료만을 엄선하고, 위생적인 공장 환경에서 정성껏 만듭니다.",
      items: [
        { title: "ISO 22000", desc: "국제 식품안전경영시스템 인증" },
        { title: "FDA", desc: "미국 식품의약국 등록" },
        { title: "HALAL", desc: "할랄 식품 인증 획득" },
        { title: "HACCP", desc: "식품안전관리인증기준 적합" },
        { title: "금속검출기", desc: "전 제품 금속 이물질 검사 완료" },
      ],
    },
    heritage: {
      label: "Brand story",
      title: "8년 연속 블루리본 맛집,\n그 레시피 그대로 담았습니다",
      body: "슬런치는 2011년 홍대의 조용한 골목에서\n샐러드 구독 서비스로 시작했습니다.\n그때부터 한 가지 질문이 계속 들렸습니다.\n\n'식물성 재료만으로 정말 끝내주는 맛을 낼 수 있을까?'\n\n이 질문에 답하기 위해, 우리는 두부를 만들고 남은 재료로\n치즈와 소시지를 만들었습니다.\n수많은 실험을 통해 특별한 요리법을 만들었고,\n이것은 우리만의 기술이 되었습니다.\n그렇게 13년 동안 220가지의 놀라운 요리들을 만들었습니다.\n\n블루리본 서베이가 인정한 슬런치팩토리의 맛은\n우연이 아니라 노력의 결과입니다.\n\n특별한 식단을 넘어,\n누구나 좋아할 수밖에 없는\n최고의 맛을 선물합니다.",
      stats: [
        { num: "12", unit: "년", label: "경력 셰프팀" },
        { num: "8", unit: "년", label: "연속 블루리본" },
        { num: "14", unit: "년", label: "슬런치 역사" },
      ],
    },
    serving: {
      title: "이렇게 드셔보세요",
      subtitle: "냉동 제품을 더 맛있게 즐기는 방법",
      items: [
        { title: "전자레인지", desc: "냉동 상태에서 전자레인지 3분" },
        { title: "에어프라이어", desc: "180℃에서 5~7분 (바삭한 식감)" },
        { title: "프라이팬", desc: "약불에서 해동 후 노릇하게" },
      ],
      tip: "취향에 맞게 다양하게 활용해 보세요!",
    },
    strength: {
      title: "5가지 강점",
      quote: "왜 슬런치 블루베리 타르트인가요?",
      circles: [
        { main: "100%", sub: "식물성" },
        { main: "0", sub: "동물성 원료" },
        { main: "14년", sub: "슬런치 역사" },
        { main: "HACCP", sub: "인증 시설" },
        { main: "600g", sub: "내용량" },
      ],
      items: [
        {
          title: "100% 식물성",
          desc: "동물성 원료를 일절 사용하지 않습니다.",
        },
        {
          title: "12년 경력 셰프팀",
          desc: "전문 셰프가 직접 레시피를 개발합니다.",
        },
        {
          title: "HACCP·ISO·FDA·HALAL",
          desc: "국내외 식품 인증을 모두 갖추었습니다.",
        },
        {
          title: "위생적인 제조 환경",
          desc: "금속검출기까지 전수 검사합니다.",
        },
        {
          title: "간편한 조리",
          desc: "전자레인지 3분이면 완성됩니다.",
        },
      ],
    },
    reveal: {
      quote: "결국, 좋은 식사는 좋은 재료에서 시작됩니다.",
      body: "블루베리 타르트,\n정직한 재료와 정성스러운 레시피로 만든 특별한 디저트입니다.",
    },
    review: {
      title: "먹어본 분들의 이야기",
      subtitle: "실제 구매 후기",
      items: [
        "식물성인데 이렇게 맛있을 수 있나요?",
        "안 먹어본 친구들도 맛있다고 난리에요",
        "선물했더니 반응이 최고예요",
        "달지 않아서 매일 먹어도 괜찮아요",
        "해동만 하면 카페 디저트 수준",
        "아이 간식으로 안심이에요",
        "포장도 예뻐서 선물용으로 좋아요",
      ],
    },
    qna: {
      title: "자주 묻는 질문",
      subtitle: "궁금한 점을 확인해 보세요",
      items: [
        {
          q: "유통기한이 얼마나 되나요?",
          a: "냉동 보관 시 제조일로부터 12개월입니다.",
        },
        {
          q: "전자레인지가 없어도 조리할 수 있나요?",
          a: "네, 프라이팬이나 에어프라이어로도 조리 가능합니다.",
        },
        {
          q: "재냉동해도 되나요?",
          a: "품질 유지를 위해 재냉동은 권장하지 않습니다.",
        },
      ],
    },
    info: {
      제품명: "블루베리 타르트",
      식품유형: "빵류(가열하지않고 섭취하는 냉동식품)",
      품목보고번호: "2025041722211",
      내용량: "115g",
      유통기한: "냉동 보관 12개월",
      제조원: "슬런치 팩토리 부천 / 경기도 부천시 소사로 160번길 23-8, 지하1층",
      판매원: "㈜슬런치 팩토리(SLUNCH FACTORY) / 대전광역시 유성구 은구비로 8, 비1호",
      원료명: "냉동트리플베리(블루베리 40%, 라즈베리 30%, 블랙베리 30%) 24.6%, 밀가루(밀:미국산), 유기농비건버터(덴마크산: 유기농 시어버터나무씨앗오일, 유기농 코코넛오일, 유기농 유채유, 정제소금), 유기농 아몬드, 아몬드분말(아몬드100%,미국산), 설탕, 식물성크림, 소맥분",
      알레르기: "제품 라벨 참조",
      참고사항: "보관방법: -18℃ 이하 냉동보관 / 개봉 후 빠른 섭취 권장 / 반품·교환: 수령 후 7일 이내, 구매처 및 제조원 / 소비자상담실: 070-8633-2623",
    },
  },
  "balsamic-dressing": {
    hero: {
      title: "깊은 발사믹의\n달콤 새콤한 풍미",
      desc: "발사믹 리덕션 스타일 드레싱 300ml.",
    },
    intro: {
      label: "Product introduction",
      title: "모든 재료를 직접 블렌딩한\n식물성 소스",
      body: "화학 첨가물 없이 신선한 식물성 재료만으로 블렌딩.\n샐러드, 파스타, 디핑 어디에나.",
    },
    feature: {
      title: "발사믹 식초의\n진한 풍미 드레싱",
      body: "발효 와인식초의 깊이와 올리브유의 향.\n샐러드는 물론 구운 야채와도 완벽한 조화.",
    },
    process: {
      title: "정성스러운 제조 공정",
      body: "슬런치의 전문 셰프팀이 직접 레시피를 개발하고 품질을 관리합니다.",
      steps: [
        "신선한 식물성 원료를 직접 손질합니다",
        "셰프팀의 레시피로 블렌딩합니다",
        "위생적인 환경에서 포장합니다",
        "품질검사를 거쳐 출고합니다",
        "냉장 유통으로 신선도를 유지합니다",
      ],
    },
    ingredient: {
      title: "깨끗한 재료, 정직한 맛",
      body: "프리미엄 올리브유와 발효 발사믹의 깊은 풍미.\n은은한 단맛과 산미가 조화로운 고급 드레싱.",
    },
    cert: {
      subtitle: "Certified Quality",
      title: "깨끗한 환경, 믿을 수 있는 인증",
      body: "직접 먹어본 좋은 재료만을 엄선하고, 위생적인 공장 환경에서 정성껏 만듭니다.",
      items: [
        { title: "ISO 22000", desc: "국제 식품안전경영시스템 인증" },
        { title: "FDA", desc: "미국 식품의약국 등록" },
        { title: "HALAL", desc: "할랄 식품 인증 획득" },
        { title: "HACCP", desc: "식품안전관리인증기준 적합" },
        { title: "금속검출기", desc: "전 제품 금속 이물질 검사 완료" },
      ],
    },
    heritage: {
      label: "Brand story",
      title: "8년 연속 블루리본 맛집,\n그 레시피 그대로 담았습니다",
      body: "슬런치는 2011년 홍대의 조용한 골목에서\n샐러드 구독 서비스로 시작했습니다.\n그때부터 한 가지 질문이 계속 들렸습니다.\n\n'식물성 재료만으로 정말 끝내주는 맛을 낼 수 있을까?'\n\n이 질문에 답하기 위해, 우리는 두부를 만들고 남은 재료로\n치즈와 소시지를 만들었습니다.\n수많은 실험을 통해 특별한 요리법을 만들었고,\n이것은 우리만의 기술이 되었습니다.\n그렇게 13년 동안 220가지의 놀라운 요리들을 만들었습니다.\n\n블루리본 서베이가 인정한 슬런치팩토리의 맛은\n우연이 아니라 노력의 결과입니다.\n\n특별한 식단을 넘어,\n누구나 좋아할 수밖에 없는\n최고의 맛을 선물합니다.",
      stats: [
        { num: "12", unit: "년", label: "경력 셰프팀" },
        { num: "8", unit: "년", label: "연속 블루리본" },
        { num: "14", unit: "년", label: "슬런치 역사" },
      ],
    },
    serving: {
      title: "이렇게 드셔보세요",
      subtitle: "더 맛있게 즐기는 방법",
      items: [
        { title: "샐러드 드레싱", desc: "신선한 채소에 듬뿍 뿌려주세요" },
        { title: "토스트 스프레드", desc: "구운 빵에 발라 간단한 아침" },
        { title: "파스타 소스", desc: "면 요리에 섞어 한 끼 완성" },
        { title: "캠핑에서", desc: "캠핑 불판 위에서 간단히 데워서" },
        { title: "찌개 재료로", desc: "김치찌개, 부대찌개 베이스로 활용" },
      ],
      tip: "취향에 맞게 다양하게 활용해 보세요!",
    },
    strength: {
      title: "5가지 강점",
      quote: "왜 슬런치 발사믹 드레싱 소스인가요?",
      circles: [
        { main: "100%", sub: "식물성" },
        { main: "0", sub: "동물성 원료" },
        { main: "14년", sub: "슬런치 역사" },
        { main: "HACCP", sub: "인증 시설" },
        { main: "300g", sub: "내용량" },
      ],
      items: [
        {
          title: "100% 식물성",
          desc: "동물성 원료를 일절 사용하지 않습니다.",
        },
        {
          title: "12년 경력 셰프팀",
          desc: "전문 셰프가 직접 레시피를 개발합니다.",
        },
        {
          title: "HACCP·ISO·FDA·HALAL",
          desc: "국내외 식품 인증을 모두 갖추었습니다.",
        },
        {
          title: "위생적인 제조 환경",
          desc: "금속검출기까지 전수 검사합니다.",
        },
        {
          title: "간편한 조리",
          desc: "뿌리기만 하면 요리가 완성됩니다.",
        },
      ],
    },
    reveal: {
      quote: "결국, 좋은 식사는 좋은 재료에서 시작됩니다.",
      body: "발사믹 드레싱 소스,\n정직한 재료만으로 완성한 깨끗한 맛입니다.",
    },
    review: {
      title: "먹어본 분들의 이야기",
      subtitle: "실제 구매 후기",
      items: [
        "간편한데 맛이 진짜 좋아요",
        "건강한 식단 시작하고 제일 잘 산 제품",
        "자취생 냉동실 필수템",
        "맛이 있어서 식물성인 걸 모를 정도",
        "재구매 중입니다",
        "온 가족이 좋아해요",
        "선물용으로도 좋아요",
      ],
    },
    qna: {
      title: "자주 묻는 질문",
      subtitle: "궁금한 점을 확인해 보세요",
      items: [
        {
          q: "유통기한이 얼마나 되나요?",
          a: "냉장 보관 시 제조일로부터 6개월입니다.",
        },
        {
          q: "동물성 재료가 들어가나요?",
          a: "아니요, 100% 식물성 원료만 사용합니다.",
        },
        {
          q: "알레르기 유발 성분이 있나요?",
          a: "제품별로 다를 수 있으니 라벨을 확인해 주세요.",
        },
      ],
    },
    info: {
      제품명: "발사믹 드레싱 소스",
      내용량: "300g",
      유통기한: "냉장 보관 6개월",
      제조원: "㈜슬런치 팩토리 / 대전광역시 유성구 은구비로 8, 비1호",
      판매원: "㈜슬런치 팩토리(SLUNCH FACTORY) / 대전광역시 유성구 은구비로 8, 비1호",
      원료명: "프리모셰프혼합포마스오일(이탈리아: 포마스 올리브유 50%, 해바라기유 35%, 엑스트라버진 올리브유 15%), 발효식초[와인식초(포도,무수아황산(산화방지제))60%,포도원액39.5%,무수아황산(산화방지제),카라멜색소IV], 당류가공품(알룰로스99.95%,수크랄로스0.05%), 엑스트라버진올리브유(이탈리아), 과채주스(레몬주스99.99%,산화방지제(메타중아황산칼륨)), 굵은후추(베트남)",
      알레르기: "제품 라벨 참조",
      참고사항: "보관방법: 냉장보관(0~10℃) / 개봉 후 빠른 시일 내 섭취 권장 / 반품·교환: 수령 후 7일 이내, 구매처 및 제조원 / 소비자상담실: 070-8633-2623",
    },
  },
};
