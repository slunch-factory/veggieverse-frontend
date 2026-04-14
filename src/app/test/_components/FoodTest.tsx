"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface Answer {
  dietType?: string;
  nutritionGoals: string[];
  allergies: string[];
  spiceLevel?: string;
}

interface OptionHighlight {
  text: string;
  highlights: { word: string }[];
}

interface StepOption {
  value: string;
  label: string;
  labelEn: string;
  desc: OptionHighlight;
  emoji: string;
}

interface Step {
  id: number;
  icon: string;
  question: string;
  questionBold: string;
  subtitle: string;
  multiSelect: boolean;
  options: StepOption[];
}

const STEPS: Step[] = [
  {
    id: 1,
    icon: "🍽️",
    question: "당신의 식탁 위 ",
    questionBold: "철학",
    subtitle: "현재 실천 중이거나 관심 있는 식이유형을 선택해주세요.",
    multiSelect: false,
    options: [
      {
        value: "pesco",
        label: "페스코",
        labelEn: "Pesco",
        desc: { text: "육류는 먹지 않지만 생선과 해산물은 먹어요", highlights: [{ word: "생선" }, { word: "해산물" }] },
        emoji: "🐟",
      },
      {
        value: "vegan",
        label: "비건",
        labelEn: "Vegan",
        desc: { text: "동물성 식품을 일체 섭취하지 않고 식물성 식품만 먹어요.", highlights: [{ word: "식물성" }] },
        emoji: "🌱",
      },
      {
        value: "pollo",
        label: "폴로",
        labelEn: "Pollo",
        desc: { text: "붉은 고기는 먹지 않지만 닭고기와 유제품은 먹어요", highlights: [{ word: "닭고기" }, { word: "유제품" }] },
        emoji: "🐔",
      },
    ],
  },
  {
    id: 2,
    icon: "🎯",
    question: "나의 ",
    questionBold: "영양 목표",
    subtitle: "중요하게 생각하는 영양 목표를 모두 선택해주세요.",
    multiSelect: true,
    options: [
      {
        value: "plant-based",
        label: "플랜트 베이스드",
        labelEn: "Plant Based",
        desc: { text: "식물성 원재료 중심의 식단을 지향해요", highlights: [{ word: "식물성" }] },
        emoji: "🥬",
      },
      {
        value: "low-carb",
        label: "저탄수화물",
        labelEn: "Low Carb",
        desc: { text: "탄수화물 섭취를 줄이고 싶어요", highlights: [{ word: "탄수화물" }] },
        emoji: "🍚",
      },
      {
        value: "low-cal",
        label: "저칼로리",
        labelEn: "Low Calorie",
        desc: { text: "전체 칼로리 섭취를 낮추고 싶어요", highlights: [{ word: "칼로리" }] },
        emoji: "🪶",
      },
      {
        value: "high-protein",
        label: "고단백",
        labelEn: "High Protein",
        desc: { text: "단백질 섭취를 높이고 싶어요", highlights: [{ word: "단백질" }] },
        emoji: "💪",
      },
      {
        value: "low-sodium",
        label: "저나트륨",
        labelEn: "Low Sodium",
        desc: { text: "나트륨(소금) 섭취를 줄이고 싶어요", highlights: [{ word: "나트륨" }] },
        emoji: "🧂",
      },
    ],
  },
  {
    id: 3,
    icon: "⚠️",
    question: "혹시 ",
    questionBold: "알레르기",
    subtitle: "해당하는 항목을 모두 선택해주세요. 없으면 건너뛰셔도 됩니다.",
    multiSelect: true,
    options: [
      {
        value: "tree-nuts",
        label: "견과류",
        labelEn: "Tree Nuts",
        desc: { text: "호두, 아몬드, 캐슈넛 등에 알레르기가 있어요", highlights: [{ word: "호두" }, { word: "아몬드" }, { word: "캐슈넛" }] },
        emoji: "🥜",
      },
      {
        value: "peanuts",
        label: "땅콩",
        labelEn: "Peanuts",
        desc: { text: "땅콩 및 땅콩 가공식품에 알레르기가 있어요", highlights: [{ word: "땅콩" }] },
        emoji: "🫘",
      },
      {
        value: "dairy",
        label: "유제품",
        labelEn: "Dairy",
        desc: { text: "우유, 치즈, 버터 등 유제품에 알레르기가 있어요", highlights: [{ word: "우유" }, { word: "치즈" }, { word: "버터" }] },
        emoji: "🥛",
      },
    ],
  },
  {
    id: 4,
    icon: "🌶️",
    question: "매운맛 ",
    questionBold: "선호도",
    subtitle: "선호하는 매운맛 강도를 선택해주세요.",
    multiSelect: false,
    options: [
      {
        value: "mild",
        label: "1단계",
        labelEn: "Mild",
        desc: { text: "매운 건 잘 못 먹어요. 순한 맛이 좋아요", highlights: [{ word: "순한 맛" }] },
        emoji: "😌",
      },
      {
        value: "medium",
        label: "2단계",
        labelEn: "Medium",
        desc: { text: "적당히 매운 건 괜찮아요. 중간이 딱 좋아요", highlights: [{ word: "중간" }] },
        emoji: "😅",
      },
      {
        value: "hot",
        label: "3단계",
        labelEn: "Hot",
        desc: { text: "매울수록 좋아요. 얼큰한 맛을 즐겨요", highlights: [{ word: "얼큰한 맛" }] },
        emoji: "🔥",
      },
    ],
  },
];

function HighlightedText({ desc }: { desc: OptionHighlight }) {
  let result = desc.text;
  const parts: (string | { highlight: string })[] = [];
  let remaining = result;

  // Sort highlights by their position in text (earliest first)
  const sortedHighlights = [...desc.highlights].sort(
    (a, b) => remaining.indexOf(a.word) - remaining.indexOf(b.word)
  );

  for (const h of sortedHighlights) {
    const idx = remaining.indexOf(h.word);
    if (idx === -1) continue;
    if (idx > 0) parts.push(remaining.slice(0, idx));
    parts.push({ highlight: h.word });
    remaining = remaining.slice(idx + h.word.length);
  }
  if (remaining) parts.push(remaining);

  return (
    <span>
      {parts.map((p, i) =>
        typeof p === "string" ? (
          <span key={i}>{p}</span>
        ) : (
          <span key={i} className="font-semibold text-[#5B8C3E] underline underline-offset-2 decoration-[#5B8C3E]/40">
            {p.highlight}
          </span>
        )
      )}
    </span>
  );
}

const LABEL_MAP: Record<string, string> = {
  vegan: "비건", pesco: "페스코", pollo: "폴로",
  "plant-based": "플랜트 베이스드", "low-carb": "저탄수화물", "low-cal": "저칼로리",
  "high-protein": "고단백", "low-sodium": "저나트륨",
  "tree-nuts": "견과류", peanuts: "땅콩", dairy: "유제품",
  mild: "1단계 (순한맛)", medium: "2단계 (중간맛)", hot: "3단계 (매운맛)",
};

export function FoodTest() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answer>({ nutritionGoals: [], allergies: [] });
  const [done, setDone] = useState(false);
  const [selectedAnim, setSelectedAnim] = useState<string | null>(null);

  const current = STEPS[step];
  const total = STEPS.length;
  const progress = Math.round(((step + 1) / total) * 100);

  const getSelected = (): string | string[] => {
    if (step === 0) return answers.dietType ?? "";
    if (step === 1) return answers.nutritionGoals;
    if (step === 2) return answers.allergies;
    return answers.spiceLevel ?? "";
  };

  const isOptionSelected = (value: string) => {
    const sel = getSelected();
    return Array.isArray(sel) ? sel.includes(value) : sel === value;
  };

  const handleSelect = (value: string) => {
    setSelectedAnim(value);
    setTimeout(() => setSelectedAnim(null), 400);

    if (current.multiSelect) {
      const key = step === 1 ? "nutritionGoals" : "allergies";
      setAnswers((prev) => {
        const arr = prev[key] as string[];
        return { ...prev, [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] };
      });
    } else {
      if (step === 0) setAnswers((prev) => ({ ...prev, dietType: value }));
      if (step === 3) setAnswers((prev) => ({ ...prev, spiceLevel: value }));
      setTimeout(() => {
        if (step < total - 1) setStep(step + 1);
        else setDone(true);
      }, 400);
    }
  };

  const handleNext = () => {
    if (step < total - 1) setStep(step + 1);
    else setDone(true);
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  /* ─── 결과 화면 ─── */
  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: "#F5F0E6" }}>
        <div className="max-w-lg w-full text-center animate-[fadeIn_0.5s_ease-out]">
          <div className="text-5xl mb-4 animate-[bounceIn_0.6s_ease-out]">🎉</div>
          <h2 className="text-[26px] font-bold text-[#3D3022] mb-2">설문이 완료되었습니다!</h2>
          <p className="text-[14px] text-[#8C7B6B] mb-8 leading-[1.6]">
            입력해주신 정보를 바탕으로 맞춤 식단을 추천해드릴게요.
          </p>
          <div className="bg-white/70 border border-[#E0D5C5] rounded-2xl p-6 text-left space-y-4 mb-8">
            <ResultRow label="식이유형" value={answers.dietType ? LABEL_MAP[answers.dietType] : "미선택"} />
            <ResultRow label="영양 목표" value={answers.nutritionGoals.map((v) => LABEL_MAP[v]).join(", ") || "미선택"} />
            <ResultRow label="알레르기" value={answers.allergies.map((v) => LABEL_MAP[v]).join(", ") || "없음"} />
            <ResultRow label="매운맛" value={answers.spiceLevel ? LABEL_MAP[answers.spiceLevel] : "미선택"} />
          </div>
          <button
            onClick={() => { setStep(0); setAnswers({ nutritionGoals: [], allergies: [] }); setDone(false); }}
            className="px-8 py-3 bg-[#5B8C3E] text-white text-[14px] font-medium rounded-full hover:bg-[#4A7832] transition-colors"
          >
            다시 하기
          </button>
        </div>
        <style>{`
          @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
          @keyframes bounceIn { 0% { transform: scale(0); } 60% { transform: scale(1.2); } 100% { transform: scale(1); } }
        `}</style>
      </div>
    );
  }

  /* ─── 테스트 화면 ─── */
  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F5F0E6" }}>
      {/* 프로그레스 바 */}
      <div className="px-6 pt-6 pb-2 max-w-2xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[12px] text-[#A09585] shrink-0">나에게 맞는 음식 유형 찾는중...</span>
          <div className="flex-1 h-[6px] bg-[#E0D5C5] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, background: "linear-gradient(90deg, #6BA34A, #5B8C3E)" }}
            />
          </div>
          <span
            className="text-[11px] font-semibold text-white px-2 py-0.5 rounded-full shrink-0"
            style={{ background: "#5B8C3E" }}
          >
            {progress}%
          </span>
        </div>
      </div>

      {/* 질문 영역 */}
      <div
        key={step}
        className="flex-1 flex flex-col items-center px-6 pt-6 pb-12 max-w-2xl mx-auto w-full animate-[slideUp_0.35s_ease-out]"
      >
        <span className="text-4xl mb-4">{current.icon}</span>
        <h2 className="text-[24px] font-bold text-[#3D3022] text-center mb-2">
          {current.question}<span className="text-[#5B8C3E]">{current.questionBold}</span>은?
        </h2>
        <p className="text-[14px] text-[#8C7B6B] text-center mb-8">{current.subtitle}</p>

        {current.multiSelect && (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] mb-6 bg-[#5B8C3E]/10 text-[#5B8C3E]">
            ✨ 복수 선택 가능
          </span>
        )}

        {/* 옵션 카드 리스트 */}
        <div className="w-full space-y-3">
          {current.options.map((opt) => {
            const selected = isOptionSelected(opt.value);
            const isAnimating = selectedAnim === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl border text-left transition-all duration-300 group ${
                  isAnimating ? "animate-[pop_0.3s_ease-out]" : ""
                }`}
                style={{
                  background: selected ? "#fff" : "rgba(255,255,255,0.55)",
                  borderColor: selected ? "#5B8C3E" : "#E0D5C5",
                  boxShadow: selected ? "0 2px 12px rgba(91,140,62,0.15)" : "none",
                }}
              >
                {/* 체크 원형 */}
                <div
                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200"
                  style={{
                    borderColor: selected ? "#5B8C3E" : "#C4B8A8",
                    background: selected ? "#5B8C3E" : "transparent",
                  }}
                >
                  {selected && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
                </div>

                {/* 텍스트 */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className={`text-[18px] font-bold ${selected ? "text-[#3D3022]" : "text-[#5C4E3C]"}`}>
                      {opt.label}
                    </span>
                    <span className="text-[13px] text-[#A09585]">{opt.labelEn}</span>
                  </div>
                  <p className="text-[13px] text-[#8C7B6B] leading-[1.5]">
                    <HighlightedText desc={opt.desc} />
                  </p>
                </div>

                {/* 이모지 일러스트 */}
                <span className={`text-4xl shrink-0 transition-transform duration-300 ${selected ? "scale-110" : "group-hover:scale-110"}`}>
                  {opt.emoji}
                </span>
              </button>
            );
          })}
        </div>

        {/* 네비게이션 */}
        <div className="flex items-center gap-4 mt-10">
          {step > 0 && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 px-5 py-2.5 rounded-full text-[14px] text-[#8C7B6B] border border-[#D5C9B8] hover:bg-white/60 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> 이전
            </button>
          )}
          {current.multiSelect && (
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-6 py-2.5 rounded-full text-[14px] font-medium text-white transition-colors"
              style={{ background: "#5B8C3E" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#4A7832"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#5B8C3E"; }}
            >
              {step === 2 && (getSelected() as string[]).length === 0 ? "건너뛰기" : "다음"}
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.02); } 100% { transform: scale(1); } }
      `}</style>
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-[13px] text-[#A09585]">{label}</span>
      <span className="text-[14px] font-medium text-[#3D3022]">{value}</span>
    </div>
  );
}
