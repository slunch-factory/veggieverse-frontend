export interface Event {
  id: number;
  status: "ongoing" | "upcoming" | "ended";
  title: string;
  description: string;
  thumbnail: string;
  startDate: string;
  endDate: string;
  badge?: string;
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
  },
  {
    id: 2,
    status: "ongoing",
    title: "New Year Special",
    description: "새해 첫 주문 20% 할인",
    thumbnail: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400",
    startDate: "2024.12.26",
    endDate: "2025.01.05",
  },
  {
    id: 3,
    status: "upcoming",
    title: "Veganuary Challenge",
    description: "1월 한 달, 비건 도전 캠페인",
    thumbnail: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400",
    startDate: "2025.01.01",
    endDate: "2025.01.31",
  },
  {
    id: 4,
    status: "ended",
    title: "Black Friday Sale",
    description: "연중 최대 할인 이벤트",
    thumbnail: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=400",
    startDate: "2024.11.22",
    endDate: "2024.11.29",
  },
  {
    id: 5,
    status: "ended",
    title: "Recipe Contest",
    description: "나만의 비건 레시피 공모전",
    thumbnail: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=400",
    startDate: "2024.10.01",
    endDate: "2024.10.31",
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
