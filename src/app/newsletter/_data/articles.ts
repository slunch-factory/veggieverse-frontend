export interface ContentBlock {
  type: "paragraph" | "heading";
  text: string;
}

export interface ArticleImages {
  large?: string;
  small?: string[];
}

export interface Article {
  id: number;
  category: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  thumbnail: string;
  quote?: string;
  contentBeforeImages: ContentBlock[];
  images?: ArticleImages;
  contentAfterImages: ContentBlock[];
  contentAfterSmallImages: ContentBlock[];
}

export const AUTHOR_BIO: Record<string, string> = {
  Josin: "슬런치 에디터. 쉬는 것도 잘해야 한다고 믿는 사람.\n번아웃 이후 느리게 사는 법을 연습 중.",
  Huna: "사회학 전공. Z세대의 시선으로 세상을 읽습니다.\n데이터보다 이야기를 좋아해요.",
  ChaCha: "전직 배달 앱 골드 등급. 지금은 냉장고 파먹기 전문가.\n집밥이 제일 맛있다는 걸 늦게 깨달았어요.",
  Jin: "영화와 대화를 좋아합니다.\n좋은 대화는 좋은 질문에서 시작한다고 믿어요.",
  Miso: "슬런치 에디터. 비건 라이프를 실천 중.\n편의점에서도 비건 먹거리를 찾아내는 능력자.",
};

export const AUTHOR_AVATAR: Record<string, string> = {
  Josin: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  Huna: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop",
  ChaCha: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
  Jin: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop",
  Miso: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
};

export const ARTICLES: Article[] = [
  {
    id: 1,
    category: "Health",
    title: "멈춰야 보이는 것들",
    subtitle: "번아웃을 겪고 나서야 깨달은 것들",
    author: "Josin",
    date: "2024.12.10",
    thumbnail: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400",
    quote: "요즘 나는 알람을 30분 늦춰놨다. 그 30분 동안 천장을 보며 멍하니 있는다.\n아무것도 안 하는 시간. 그게 하루 중 제일 좋다.",
    contentBeforeImages: [
      { type: "paragraph", text: "작년 여름, 나는 침대에서 일어날 수가 없었다. 몸이 아픈 게 아니었다. 알람을 끄고 천장을 한 시간 동안 바라봤다. 출근해야 한다는 걸 알면서도, 그냥 아무것도 하고 싶지 않았다. 번아웃이라는 단어를 머리로는 알고 있었지만, 그게 내 이야기가 될 줄은 몰랐다." },
      { type: "paragraph", text: "돌이켜보면 신호는 있었다. 좋아하던 일이 싫어지기 시작했고, 주말에도 월요일 걱정을 했다. 친구들 만나는 게 귀찮아졌고, 취미생활은 언제 했는지 기억도 안 났다. 그런데도 나는 계속 달렸다. 멈추면 뒤처질 것 같았고, 뒤처지면 다시는 따라잡을 수 없을 것 같았다." },
    ],
    images: {
      large: "/newsletter/articles/image1.jpg",
      small: ["/newsletter/articles/image2.jpg", "/newsletter/articles/image3.jpg"],
    },
    contentAfterImages: [
      { type: "heading", text: "열심히의 함정" },
      { type: "paragraph", text: "우리는 '열심히'를 미덕으로 배웠다. 새벽까지 일하면 성실한 사람이고, 주말에도 노트북을 켜면 책임감 있는 사람이다. 쉬는 건 게으른 것이고, 여유를 부리면 도태되는 것이다. 그렇게 믿으며 살았다. 그 믿음이 나를 침대에 눕혀놓기 전까지는." },
      { type: "paragraph", text: "번아웃이 오고 나서야 깨달았다. 나는 왜 이렇게까지 달렸을까. 정말 이 일이 좋아서였을까, 아니면 멈추는 게 두려워서였을까." },
      { type: "heading", text: "노 빡빡" },
      { type: "paragraph", text: "회복하는 데 결정적이었던 건 태국 치앙마이 여행이었다. 거기서 만난 현지인이 내가 뭘 하든 이렇게 말했다. \"노 빡빡. 천천히 해도 돼. 내일 해도 돼.\" 처음엔 답답했다. 나는 돈 주고 온 관광객인데, 왜 이렇게 느긋한 거지. 근데 며칠이 지나자 그 말이 위로가 되기 시작했다." },
    ],
    contentAfterSmallImages: [
      { type: "heading", text: "쉬는 것도 일의 일부" },
      { type: "paragraph", text: "지금은 일주일에 하루, 무조건 쉬는 날을 정해두고 있다. 처음엔 불안했다. 이 시간에 다른 사람들은 일하고 있을 텐데. 근데 신기하게도 쉬고 나면 오히려 작업 효율이 올라갔다." },
      { type: "paragraph", text: "번아웃은 실패가 아니다. 몸이 보내는 신호다. 쓰러지기 전에 멈춰도 된다. 쉬는 것도 일의 일부다." },
    ],
  },
  {
    id: 2,
    category: "Culture",
    title: "2060년, 나는 마흔이 된다",
    subtitle: "초고령 사회를 앞둔 Z세대의 고민",
    author: "Huna",
    date: "2024.12.05",
    thumbnail: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400",
    quote: "2060년의 나에게 편지를 쓴다면 이렇게 쓸 것 같다.\n그때도 계속 배우고 있길. 그리고 아직도 할머니한테 전화하고 있길.",
    contentBeforeImages: [
      { type: "paragraph", text: "고등학교 사회 시간에 인구 피라미드 그래프를 봤다. 2025년 한국의 65세 이상 인구 비율은 약 20%. 2050년이 되면 40%를 넘는다고 했다." },
      { type: "paragraph", text: "막연하게 알고 있던 '고령화'가 갑자기 내 문제로 다가왔다. 뉴스에서 듣던 이야기가 아니라, 내 미래 이야기였다." },
    ],
    images: {
      large: "/newsletter/articles/image1.jpg",
      small: ["/newsletter/articles/image2.jpg", "/newsletter/articles/image3.jpg"],
    },
    contentAfterImages: [
      { type: "heading", text: "정답이 없는 시대" },
      { type: "paragraph", text: "부모님 세대에는 정답이 있었다. 좋은 대학 가고, 좋은 회사 들어가고, 정년까지 버티면 됐다. 근데 우리 세대는 다르다." },
    ],
    contentAfterSmallImages: [
      { type: "heading", text: "관계라는 자원" },
      { type: "paragraph", text: "어떤 책에서 읽었다. 초고령 사회에서 가장 중요한 자원은 돈도 기술도 아니라 '관계'라고." },
    ],
  },
  {
    id: 3,
    category: "Food",
    title: "냉장고를 열면 한 끼가 보인다",
    subtitle: "배달 앱 골드 등급이 집밥을 시작한 이유",
    author: "ChaCha",
    date: "2024.11.28",
    thumbnail: "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=400",
    quote: "냉장고를 열면 한 끼가 보인다는 말이 이제 조금 이해가 된다.\n거창한 요리를 할 필요 없다. 있는 재료로, 먹을 만큼만, 내 입맛대로. 그게 집밥이다.",
    contentBeforeImages: [
      { type: "paragraph", text: "나는 배달 앱 골드 등급이다. 자랑이 아니라 반성이다. 집밥을 해먹고 싶은 마음은 있다. 근데 퇴근하면 장 볼 힘이 없고, 주말에 장을 봐도 재료가 냉장고에서 시든다." },
    ],
    images: {
      large: "/newsletter/articles/image1.jpg",
      small: ["/newsletter/articles/image2.jpg", "/newsletter/articles/image3.jpg"],
    },
    contentAfterImages: [
      { type: "heading", text: "완벽주의라는 적" },
      { type: "paragraph", text: "집밥의 가장 큰 적은 완벽주의다. 이걸 깨닫는 데 오래 걸렸다." },
    ],
    contentAfterSmallImages: [
      { type: "heading", text: "라면도 집에서 끓이면 다르다" },
      { type: "paragraph", text: "솔직히 집밥이 제일 맛있다. 내 입맛에 맞게 간을 할 수 있으니까." },
    ],
  },
  {
    id: 4,
    category: "Life",
    title: "\"그 영화 재밌어\" 다음에 할 말",
    subtitle: "소개팅에서 영화 이야기 잘하는 법",
    author: "Jin",
    date: "2024.11.20",
    thumbnail: "https://images.unsplash.com/photo-1543362906-acfc16c67564?w=400",
    quote: "다음 소개팅에서는 이렇게 물어봐야겠다.\n'최근 본 영화 중에 제일 웃겼던 장면이 뭐예요?'",
    contentBeforeImages: [
      { type: "paragraph", text: "소개팅에서 영화 이야기를 잘 못한다. \"최근에 뭐 봤어요?\"라고 물으면 \"음... 넷플릭스에서 뭐 봤는데...\" 하다가 제목이 생각 안 나서 멈칫한다." },
    ],
    images: {
      large: "/newsletter/articles/image1.jpg",
      small: ["/newsletter/articles/image2.jpg", "/newsletter/articles/image3.jpg"],
    },
    contentAfterImages: [
      { type: "heading", text: "피해야 할 것들" },
      { type: "paragraph", text: "먼저 피해야 할 것부터 정리했다. 스포일러는 당연히 안 된다." },
    ],
    contentAfterSmallImages: [
      { type: "heading", text: "취향이 달라도 괜찮다" },
      { type: "paragraph", text: "취향이 다를 때도 기회다. 다름을 인정하고 호기심을 보이는 거다." },
    ],
  },
  {
    id: 5,
    category: "Slunch's Pick",
    title: "마음을 전하는 데 10만원은 필요 없다",
    subtitle: "3만원으로 완성하는 크리스마스 선물",
    author: "Josin",
    date: "2024.11.15",
    thumbnail: "https://images.unsplash.com/photo-1540914124281-342587941389?w=400",
    quote: "어제 편의점에 들렀다. 핫초코 스틱 3개, 마시멜로 한 봉지, 그리고 엽서 한 장.\n합계 7천원.",
    contentBeforeImages: [
      { type: "paragraph", text: "크리스마스가 다가오면 스트레스를 받는다. 뭘 선물해야 할지 모르겠고, 좋은 거 사주자니 통장이 걱정되고, 저렴한 거 사자니 성의 없어 보일까 봐 걱정된다." },
    ],
    images: {
      large: "/newsletter/articles/image1.jpg",
      small: ["/newsletter/articles/image2.jpg", "/newsletter/articles/image3.jpg"],
    },
    contentAfterImages: [
      { type: "heading", text: "비싼 선물이 좋은 선물일까" },
      { type: "paragraph", text: "곰곰이 생각해봤다. 내가 받아서 기뻤던 선물이 뭐였지?" },
    ],
    contentAfterSmallImages: [
      { type: "heading", text: "손편지의 힘" },
      { type: "paragraph", text: "손편지가 부담스러운 사람도 있을 거다. 뭐라고 써야 할지 모르겠으니까." },
    ],
  },
];

export function getArticleById(id: number): Article | undefined {
  return ARTICLES.find((a) => a.id === id);
}

export function getAdjacentArticles(id: number) {
  const idx = ARTICLES.findIndex((a) => a.id === id);
  return {
    prev: idx > 0 ? ARTICLES[idx - 1] : null,
    next: idx >= 0 && idx < ARTICLES.length - 1 ? ARTICLES[idx + 1] : null,
  };
}
