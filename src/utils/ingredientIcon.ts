// 재료 이름 → 프로젝트 내 이미지 자동 매핑 유틸리티

import type React from "react";

const ingredientIconMap: Record<string, string> = {
  // 버섯류
  "버섯": "mushroom.png",
  "양송이": "mushroom.png",
  "표고": "mushroom.png",
  "새송이": "mushroom.png",
  "팽이": "mushroom.png",
  "느타리": "mushroom.png",
  "포르치니": "mushroom.png",
  "트러플": "mushroom.png",

  // 채소류
  "당근": "carrot.png",
  "양파": "garlic.png",
  "마늘": "garlic.png",
  "브로콜리": "broccoli.png",
  "감자": "potato.png",
  "고구마": "sweet potato.png",
  "토마토": "tomato.png",
  "상추": "lettuce.png",
  "양상추": "lettuce.png",
  "로메인": "lettuce.png",
  "샐러드": "lettuce.png",
  "배추": "napa cabbage.png",
  "김치": "napa cabbage.png",
  "고추": "chili pepper.png",
  "청양고추": "chili pepper.png",
  "파프리카": "pepper.png",
  "피망": "pepper.png",
  "후추": "pepper.png",
  "아스파라거스": "asparagus.png",
  "대파": "leek.png",
  "쪽파": "leek.png",
  "부추": "leek.png",
  "호박": "sweet potato.png",
  "단호박": "sweet potato.png",
  "애호박": "sweet potato.png",
  "오이": "green bean.png",
  "가지": "fig.png",
  "셀러리": "asparagus.png",
  "시금치": "lettuce.png",
  "케일": "lettuce.png",
  "루꼴라": "lettuce.png",
  "청경채": "napa cabbage.png",
  "무": "potato.png",
  "비트": "raspberry.png",
  "순무": "potato.png",
  "콜리플라워": "broccoli.png",
  "양배추": "napa cabbage.png",

  // 과일류
  "레몬": "lemon.png",
  "라임": "lemon.png",
  "오렌지": "orange.png",
  "귤": "orange.png",
  "자몽": "orange.png",
  "아보카도": "avocado.png",
  "망고": "mango.png",
  "포도": "grape.png",
  "복숭아": "peach.png",
  "키위": "kiwi.png",
  "블루베리": "blueberry.png",
  "라즈베리": "raspberry.png",
  "딸기": "raspberry.png",
  "수박": "watermelon.png",
  "참외": "watermelon.png",
  "멜론": "watermelon.png",
  "파인애플": "pineapple.png",
  "배": "pear.png",
  "사과": "peach.png",
  "석류": "raspberry.png",
  "자두": "grape.png",
  "살구": "peach.png",

  // 견과류/씨앗
  "땅콩": "peanut.png",
  "피스타치오": "pistachio.png",
  "아몬드": "peanut.png",
  "호두": "peanut.png",
  "캐슈넛": "peanut.png",
  "잣": "pistachio.png",
  "참깨": "peanut.png",
  "들깨": "peanut.png",
  "해바라기씨": "peanut.png",
  "치아씨드": "peanut.png",
  "헤이즐넛": "peanut.png",
  "마카다미아": "peanut.png",

  // 허브/향신료
  "올리브": "olive.png",
  "딜": "dill.png",
  "바질": "dill.png",
  "파슬리": "dill.png",
  "로즈마리": "dill.png",
  "타임": "dill.png",
  "오레가노": "dill.png",
  "민트": "dill.png",
  "고수": "dill.png",
  "쑥": "dill.png",
  "깻잎": "dill.png",
  "월계수": "dill.png",
  "세이지": "dill.png",
  "카레": "ginger.png",
  "큐민": "ginger.png",
  "강황": "ginger.png",
  "계피": "ginger.png",

  // 곡물/면/빵
  "쌀": "corn.png",
  "현미": "corn.png",
  "보리": "corn.png",
  "귀리": "corn.png",
  "옥수수": "corn.png",
  "파스타": "corn.png",
  "국수": "corn.png",
  "라면": "corn.png",
  "빵": "corn.png",
  "식빵": "corn.png",
  "바게트": "corn.png",
  "퀴노아": "corn.png",
  "그래놀라": "corn.png",
  "아르보리오": "corn.png",

  // 유제품/대체유
  "우유": "coconut.png",
  "크림": "coconut.png",
  "버터": "coconut.png",
  "치즈": "potato.png",
  "파마산": "potato.png",
  "모짜렐라": "potato.png",
  "체다": "potato.png",
  "리코타": "potato.png",
  "크림치즈": "potato.png",
  "요거트": "coconut.png",
  "그릭요거트": "coconut.png",
  "사워크림": "coconut.png",
  "두유": "coconut.png",
  "오트밀크": "coconut.png",
  "아몬드밀크": "coconut.png",
  "코코넛밀크": "coconut.png",

  // 소스/오일/조미료
  "간장": "olive.png",
  "된장": "peanut.png",
  "고추장": "chili pepper.png",
  "식초": "olive.png",
  "발사믹": "olive.png",
  "오일": "olive.png",
  "참기름": "olive.png",
  "들기름": "olive.png",
  "올리브오일": "olive.png",
  "카놀라유": "olive.png",
  "포도씨유": "grape.png",
  "케첩": "tomato.png",
  "마요네즈": "coconut.png",
  "머스타드": "lemon.png",

  // 단백질
  "두부": "edamame.png",
  "콩": "edamame.png",
  "렌틸콩": "edamame.png",
  "병아리콩": "edamame.png",
  "계란": "potato.png",
  "달걀": "potato.png",
  "템페": "edamame.png",
  "세이탄": "edamame.png",

  // 기타
  "육수": "carrot.png",
  "채수": "carrot.png",
  "물": "coconut.png",
  "얼음": "coconut.png",
  "해조류": "green bean.png",
  "김": "green bean.png",
  "미역": "green bean.png",
  "다시마": "green bean.png",
  "바닐라": "coconut.png",
  "코코아": "peanut.png",
  "초콜릿": "peanut.png",
};

const DEFAULT_ICON = "lettuce.png";
const BASE_PATH = "/vege_flot_img";

/**
 * 재료 이름을 기반으로 적절한 아이콘 경로를 반환합니다.
 */
export const getIngredientIcon = (ingredientName: string): string => {
  const lowerName = ingredientName.toLowerCase();

  for (const keyword of Object.keys(ingredientIconMap)) {
    if (lowerName.includes(keyword.toLowerCase())) {
      return `${BASE_PATH}/${ingredientIconMap[keyword]}`;
    }
  }

  return `${BASE_PATH}/${DEFAULT_ICON}`;
};

/**
 * 이미지 로드 실패 시 폴백 이미지로 대체하는 핸들러
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
) => {
  const target = e.target as HTMLImageElement;
  if (target.src.includes(DEFAULT_ICON)) {
    return;
  }
  target.src = `${BASE_PATH}/${DEFAULT_ICON}`;
  target.onerror = null;
};

/**
 * 여러 재료에 대해 아이콘을 매핑합니다.
 */
export const mapIngredientsToIcons = (
  ingredients: string[],
): Record<string, string> => {
  const result: Record<string, string> = {};
  for (const ingredient of ingredients) {
    result[ingredient] = getIngredientIcon(ingredient);
  }
  return result;
};
