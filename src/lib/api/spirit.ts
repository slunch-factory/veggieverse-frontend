import type { SurveyAnswers } from "@/app/spirit/_types";
import type { MenuData } from "@/app/subscribe/_data/subscription";
import { type ProductItem, type PlanItem, type CustomPlanResponse, mapToMenuData } from "@/lib/api/subscription";
import { apiFetch } from "@/lib/api/client";

const NUTRITION_GOAL_MAP: Record<string, string> = {
  "plant-based":  "plant_based",
  "low-carb":     "low_carb",
  "low-calories": "low_calorie",
  "high-protein": "high_protein",
  "low-sodium":   "low_sodium",
};

const ALLERGEN_MAP: Record<string, string> = {
  "tree-nuts": "tree_nuts",
  "peanuts":   "peanuts",
  "dairy":     "dairy",
  "gluten":    "gluten",
  "soy":       "soy",
  "tomato":    "tomato",
  "sulfites":  "sulfites",
};

export interface AutoPlanBody {
  dietaryType: string;
  nutritionGoals: string[];
  allergens: string[];
  spicePreference: "spicy" | "mild";
  /** 성분 기반 랭킹용 선택 재료 id (0~3). 미선택 시 [] → matchCount 전부 0(랭킹 평탄).
   *  재료 선택 UI(백엔드 핸드오프 #1) 연결 전까지는 빈 배열. */
  ingredientIds: number[];
}

/**
 * autoPlan 응답 그룹 (#230 변경).
 * matchCount = 사용자가 고른 조건을 제품이 충족한 개수.
 * 그룹은 matchCount 내림차순(잘 맞는 순)으로 정렬되어 오고, 0 그룹이 마지막.
 */
export interface AutoPlanGroup {
  matchCount: number;
  products: ProductItem[];
}

function buildAutoPlanBody(
  answers: SurveyAnswers,
  ingredientIds: number[] = [],
): AutoPlanBody {
  return {
    dietaryType: (answers[1] as string) ?? "vegan",
    nutritionGoals: ((answers[2] as string[]) ?? []).map((g) => NUTRITION_GOAL_MAP[g] ?? g),
    allergens: ((answers[3] as string[]) ?? [])
      .filter((a) => a !== "no-allergy")
      .map((a) => ALLERGEN_MAP[a] ?? a),
    spicePreference: (answers[4] as string) === "spicy-yes" ? "spicy" : "mild",
    // 재료 선택 UI(핸드오프 #1) 연결 전까지 빈 배열 → matchCount 전부 0.
    // 테스트 시 getAutoPlan(answers, { ingredientIds: [1,2,3] })로 랭킹 확인 가능.
    ingredientIds,
  };
}

// 콘솔 디버그용 — 직전 호출에서 통과한 메뉴 집합. 필터를 추가했을 때 무엇이 빠졌는지 diff로 보여준다.
let __prevAutoPlanMenus: Set<string> | null = null;

/** POST /api/v1/veggieverse/subscription/autoPlan — 설문 기반 추천 메뉴 조회
 *
 * `options.signal`로 AbortController를 받아 in-flight 요청 취소 가능.
 * Speculative prefetching에서 사용자가 답변을 변경하면 이전 요청을 abort한다.
 */
export async function getAutoPlan(
  answers: SurveyAnswers,
  options?: { signal?: AbortSignal; ingredientIds?: number[] },
): Promise<MenuData[]> {
  // 설문(질문2, multiSelect)에서 영양목표를 최소 1개 선택해야 다음 단계로 넘어갈 수 있으므로
  // nutritionGoals는 항상 1개 이상 — 백엔드 @Size(min=1)을 만족한다.
  // 예전엔 1개일 때 기본값으로 강제 2개 패딩했으나, OR 매칭 특성상 유저가 고르지 않은
  // 목표의 메뉴까지 추천에 섞여 의도와 어긋났다. 유저가 선택한 목표만 그대로 전송한다.
  const body = buildAutoPlanBody(answers, options?.ingredientIds ?? []);
  console.log("[getAutoPlan] request:", body);
  try {
    // 프록시(apiFetch) 경유 — 직접 fetch는 HTTPS↔HTTP 혼합콘텐츠/CORS로 차단됨.
    const res = await apiFetch("/api/v1/veggieverse/subscription/autoPlan", {
      method: "POST",
      body,
      auth: "auto",
      signal: options?.signal,
    });
    if (!res.ok) {
      console.error("[getAutoPlan] HTTP error:", res.status, res.statusText);
      return [];
    }
    // 응답이 matchCount 내림차순 그룹 배열 [{ matchCount, products }] 로 변경됨(#230).
    // bare 배열 / { data: [...] } 봉투 둘 다 대응. 그룹이 잘 맞는 순으로 정렬돼 오므로
    // 순서대로 펴면 추천 랭킹이 그대로 유지된다.
    const json = await res.json();
    const groups: AutoPlanGroup[] = Array.isArray(json)
      ? json
      : Array.isArray(json?.data)
        ? json.data
        : [];
    const products = groups.flatMap((g) => g?.products ?? []);

    // ── 콘솔: 필터 결과 상세 (개발자도구에서 무엇이 통과/제외됐는지·최고 매칭 확인) ──
    // 백엔드가 필터로 제외한 상품은 응답에 없으므로, "걸러진 것"은 직전 호출과의 diff로 보여준다.
    const surviving = products.map((p) => p.name);
    const survivingSet = new Set(surviving);
    const dropped = __prevAutoPlanMenus
      ? [...__prevAutoPlanMenus].filter((n) => !survivingSet.has(n))
      : [];
    const added = __prevAutoPlanMenus
      ? surviving.filter((n) => !__prevAutoPlanMenus!.has(n))
      : [];

    console.groupCollapsed(
      `%c[autoPlan] 필터 결과 — 통과 ${products.length}개` +
        (dropped.length ? ` · 직전 대비 −${dropped.length}` : "") +
        (added.length ? ` +${added.length}` : ""),
      "color:#4A7F52;font-weight:bold;",
    );
    console.log("🧪 요청 필터:", {
      dietaryType: body.dietaryType,
      nutritionGoals: body.nutritionGoals,
      allergens: body.allergens,
      spicePreference: body.spicePreference,
      ingredientIds: body.ingredientIds,
    });
    console.table(
      groups.flatMap((g) =>
        (g?.products ?? []).map((p) => ({
          메뉴: p.name,
          matchCount: g?.matchCount ?? 0,
          식단: p.dietaryType ?? "-",
          건강목표: (p.spirit?.healthGoals ?? []).join(", "),
          매움: p.spirit?.isSpicy ?? p.spirit?.spicy ? "🌶️" : "",
          알레르기: (p.spirit?.allergens ?? []).join(", "),
        })),
      ),
    );
    const top = groups[0];
    if (top?.products?.length) {
      console.log(
        `%c🏆 최고 매칭 (matchCount ${top.matchCount}):`,
        "color:#1d76db;font-weight:bold;",
        top.products.map((p) => p.name).join(", "),
      );
    }
    if (dropped.length) console.log("%c❌ 직전 필터로 빠진 메뉴:", "color:#d4513b;", dropped.join(", "));
    if (groups.length > 0 && groups.every((g) => (g?.matchCount ?? 0) === 0)) {
      console.warn(
        "⚠️ matchCount 전부 0 — ingredientIds 미전송(메인 재료 선택 미연결)이라 랭킹이 평탄합니다.",
      );
    }
    console.groupEnd();
    __prevAutoPlanMenus = survivingSet;

    return products.map(mapToMenuData);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      // 정상 취소 — 호출자가 흡수
      throw err;
    }
    console.error("[getAutoPlan] fetch failed:", err);
    return [];
  }
}

/** POST /api/v1/veggieverse/subscription/plan — 선택한 상품 목록으로 플랜 저장 */
export async function savePlan(items: PlanItem[]): Promise<CustomPlanResponse | null> {
  console.log("[savePlan] request:", { items });
  try {
    const res = await apiFetch("/api/v1/veggieverse/subscription/plan", {
      method: "POST",
      body: { items },
      auth: "auto",
    });
    if (!res.ok) {
      console.error("[savePlan] HTTP error:", res.status, res.statusText);
      return null;
    }
    const data: CustomPlanResponse = await res.json();
    console.log("%c[savePlan] ✅ 플랜 저장 성공", "color: #4A7F52; font-weight: bold;", data);
    return data;
  } catch (err) {
    console.error("[savePlan] fetch failed:", err);
    return null;
  }
}
