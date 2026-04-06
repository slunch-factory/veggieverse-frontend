export const VEGAN_TYPES = [
  { mbti: "ENFP", name: "Bloomist", emoji: "🌻", description: "새로운 거 시도하고 나누는 거 좋아해요", color: "#F3B562" },
  { mbti: "INFP", name: "Mindgrower", emoji: "🌿", description: "내 기준이 확실해요. 조용히 생각 많은 편", color: "#A3C585" },
  { mbti: "INFJ", name: "Quiet Root", emoji: "🌱", description: "말보다 행동으로 보여주는 타입이에요", color: "#6A8A6B" },
  { mbti: "ENFJ", name: "Lightgiver", emoji: "🌼", description: "주변 사람들 챙기는 거 좋아해요", color: "#F4C97E" },
  { mbti: "ENTJ", name: "Forger", emoji: "🔥", description: "효율 중시. 뭐든 체계적으로 해요", color: "#8B7055" },
  { mbti: "ESTJ", name: "Groundtype", emoji: "🥦", description: "원칙대로 하는 게 편해요. 현실적인 편", color: "#BCA97E" },
  { mbti: "ISTJ", name: "Planter", emoji: "🌰", description: "계획 세워두는 거 좋아해요. 루틴형", color: "#9E8961" },
  { mbti: "INTJ", name: "Strategreen", emoji: "🌲", description: "분석하고 설계하는 게 재밌어요", color: "#5D7264" },
  { mbti: "ISFP", name: "Floret", emoji: "🌸", description: "예쁜 거, 감각적인 거 좋아해요", color: "#E6B7C1" },
  { mbti: "ESFP", name: "Joybean", emoji: "🍑", description: "재밌는 게 최고예요. 분위기 메이커", color: "#F6A880" },
  { mbti: "ESFJ", name: "Careleaf", emoji: "🌺", description: "다 같이 잘 먹어야 해요. 배려형", color: "#F2D68A" },
  { mbti: "ISFJ", name: "Nurturer", emoji: "🌾", description: "티 안 내고 챙기는 타입이에요", color: "#D6C6A5" },
  { mbti: "INTP", name: "Thinkroot", emoji: "🌴", description: "왜 그런지 알아야 해요. 탐구형", color: "#7F9B8A" },
  { mbti: "ENTP", name: "Sparknut", emoji: "🍋", description: "다르게 생각하는 거 좋아해요", color: "#E8D26E" },
  { mbti: "ISTP", name: "Craftbean", emoji: "🫘", description: "직접 만들어봐야 알아요. 실험형", color: "#8D8570" },
  { mbti: "ESTP", name: "Wildgrain", emoji: "🌶️", description: "일단 해보는 타입. 현장에서 즐겨요", color: "#C19F7B" },
];

export const SPIRIT_TAG_MAPPING: Record<string, string[]> = {
  ENFP: ["새로운시도", "퓨전", "즐거움"],
  INFP: ["건강", "미니멀", "감성적"],
  INFJ: ["건강", "깊은맛", "전통"],
  ENFJ: ["영양균형", "효율적", "간편조리"],
  ENTJ: ["고단백", "효율적", "간편조리"],
  ESTJ: ["영양균형", "간편조리", "전통"],
  ISTJ: ["전통", "간편조리", "효율적"],
  INTJ: ["고단백", "건강", "효율적"],
  ISFP: ["예쁜플레이팅", "감성적", "미니멀"],
  ESFP: ["즐거움", "새로운시도", "감성적"],
  ESFJ: ["영양균형", "간편조리", "전통"],
  ISFJ: ["건강", "전통", "간편조리"],
  INTP: ["새로운시도", "건강", "고단백"],
  ENTP: ["새로운시도", "퓨전", "감성적"],
  ISTP: ["간편조리", "고단백", "효율적"],
  ESTP: ["새로운시도", "즐거움", "효율적"],
};

export function getSpiritCurationMessage(spiritName: string): string {
  const messages: Record<string, string> = {
    Bloomist: "새로운 조합 좋아할 것 같아요",
    Mindgrower: "깔끔하고 건강한 거 모았어요",
    "Quiet Root": "정성 들어간 레시피예요",
    Lightgiver: "같이 먹으면 더 좋은 거예요",
    Forger: "빠르고 효율적인 거 모았어요",
    Groundtype: "영양 밸런스 좋은 거예요",
    Planter: "검증된 레시피만 모았어요",
    Strategreen: "효율 좋은 레시피예요",
    Floret: "예쁘고 감각적인 거예요",
    Joybean: "만들면서 재밌는 거예요",
    Careleaf: "푸짐하게 나눠 먹기 좋아요",
    Nurturer: "속 편하고 건강한 거예요",
    Thinkroot: "원리 이해하면 쉬운 거예요",
    Sparknut: "독특한 조합이에요",
    Craftbean: "직접 만들기 좋은 거예요",
    Wildgrain: "일단 해보기 좋은 거예요",
  };
  return messages[spiritName] || `${spiritName}에게 어울리는 레시피예요`;
}
