import type { SurveyAnswers } from "@/app/spirit/_types";
import type { MenuData } from "@/app/subscribe/_data/subscription";
import { type ProductItem, mapToMenuData } from "@/lib/api/subscription";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_PATH;

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
};

export interface SavePlanBody {
  dietaryType: string;
  nutritionGoals: string[];
  allergens: string[];
  spicePreference: "spicy" | "mild";
}

function buildPlanBody(answers: SurveyAnswers): SavePlanBody {
  return {
    dietaryType: (answers[1] as string) ?? "vegan",
    nutritionGoals: ((answers[2] as string[]) ?? []).map((g) => NUTRITION_GOAL_MAP[g] ?? g),
    allergens: ((answers[3] as string[]) ?? [])
      .filter((a) => a !== "no-allergy")
      .map((a) => ALLERGEN_MAP[a] ?? a),
    spicePreference: (answers[4] as string) === "spicy-yes" ? "spicy" : "mild",
  };
}

export async function getAutoPlan(answers: SurveyAnswers): Promise<MenuData[]> {
  const body = buildPlanBody(answers);
  if (body.nutritionGoals.length < 2) {
    const defaults = ["plant_based", "low_calorie"].filter(
      (g) => !body.nutritionGoals.includes(g),
    );
    body.nutritionGoals = [...body.nutritionGoals, ...defaults].slice(0, 2);
  }
  console.log("[getAutoPlan] request:", body);
  try {
    const res = await fetch(`${API_BASE}/api/v1/veggiverse/autoPlan`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("[getAutoPlan] HTTP error:", res.status, res.statusText);
      return [];
    }
    const data: ProductItem[] = await res.json();
    const list = Array.isArray(data) ? data : [];
    console.log("%c[getAutoPlan] ✅ 추천 메뉴 수신", "color: #4A7F52; font-weight: bold;", list.length, "개");
    return list.map(mapToMenuData);
  } catch (err) {
    console.error("[getAutoPlan] fetch failed:", err);
    return [];
  }
}

export async function savePlan(answers: SurveyAnswers): Promise<string | null> {
  const body = buildPlanBody(answers);
  console.log("[savePlan] request:", body);
  try {
    const res = await fetch(`${API_BASE}/api/v1/veggiverse/plan`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      console.error("[savePlan] HTTP error:", res.status, res.statusText);
      return null;
    }
    const data: Record<string, string> = await res.json();
    console.log("%c[savePlan] ✅ 플랜 저장 성공", "color: #4A7F52; font-weight: bold;", data);
    return data.planId ?? null;
  } catch (err) {
    console.error("[savePlan] fetch failed:", err);
    return null;
  }
}
