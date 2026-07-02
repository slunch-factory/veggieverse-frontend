/**
 * 배송 출고/도착 예정일 계산 — 결제 시각 기준(컷오프 평일 16:00).
 * 정책(memory: delivery-cutoff-policy):
 *  - 평일 16시 이전 → 당일 출고, 다음날 배송
 *  - 평일 16시 이후 → 다음날 출고, 다다음날 배송
 *  - 금요일 16시 이전 → 금 출고, 토 배송
 *  - 금요일 16시 이후 / 주말 → 월 출고, 화 배송
 * 배송일은 모든 경우 출고일 + 1일.
 * 로컬 시각(사용자 브라우저=KST) 기준이라 클라이언트에서 호출한다.
 */

export interface DeliverySchedule {
  /** 출고 예정일 (자정 기준 Date) */
  ship: Date;
  /** 도착 예정일 = 출고일 + 1일 */
  delivery: Date;
}

const CUTOFF_HOUR = 16;

function addDays(base: Date, n: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + n);
  return d;
}

export function computeDeliverySchedule(now: Date = new Date()): DeliverySchedule {
  const day = now.getDay(); // 0=일 ~ 6=토
  const hour = now.getHours();

  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  let ship: Date;
  if (day === 0) {
    ship = addDays(today, 1); // 일요일 → 월요일
  } else if (day === 6) {
    ship = addDays(today, 2); // 토요일 → 월요일
  } else if (day === 5) {
    ship = hour < CUTOFF_HOUR ? today : addDays(today, 3); // 금: 컷오프 전 당일, 후 월요일
  } else {
    ship = hour < CUTOFF_HOUR ? today : addDays(today, 1); // 월~목: 컷오프 전 당일, 후 익일
  }

  return { ship, delivery: addDays(ship, 1) };
}

const WEEKDAY_KO = ["일", "월", "화", "수", "목", "금", "토"];

/** "M월 D일(요일)" 포맷 */
export function formatDeliveryDate(d: Date): string {
  return `${d.getMonth() + 1}월 ${d.getDate()}일(${WEEKDAY_KO[d.getDay()]})`;
}
