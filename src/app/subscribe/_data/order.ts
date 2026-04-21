import type {
  DeliveryCycle,
  DisplayMenuData,
  DurationType,
  PackComposition,
  PurchaseType,
} from "./subscription";

export interface OrderData {
  duration: DurationType;
  startDateISO: string;
  mealPlan: Record<string, DisplayMenuData>;
  purchaseType: PurchaseType;
  deliveryCycle: DeliveryCycle | "";
  packComposition: PackComposition | "";
  totalPrice: number;
}

const ORDER_STORAGE_KEY = "slunch:subscribe-order";

/** useSyncExternalStore용 snapshot 캐시 — 참조 안정화 */
let snapshotCache: { loaded: boolean; value: OrderData | null } = {
  loaded: false,
  value: null,
};

export function saveOrder(order: OrderData): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(order));
    snapshotCache = { loaded: true, value: order };
  } catch {
    /* ignore storage errors */
  }
}

export function loadOrder(): OrderData | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ORDER_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OrderData;
  } catch {
    return null;
  }
}

export function clearOrder(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ORDER_STORAGE_KEY);
  } catch {
    /* ignore */
  }
  snapshotCache = { loaded: false, value: null };
}

export function getOrderSnapshot(): OrderData | null {
  if (!snapshotCache.loaded) {
    snapshotCache = { loaded: true, value: loadOrder() };
  }
  return snapshotCache.value;
}

export const subscribeOrderStore = () => () => {};
export const getServerOrderSnapshot = (): OrderData | null => null;
