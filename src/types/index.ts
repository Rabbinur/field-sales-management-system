export type OrderStatus =
  | "new"
  | "pending_approval"
  | "assigned"
  | "in_transit"
  | "delivered"
  | "cancelled"
  | "offline_queued";

export type ERPSyncStatus = "synced" | "pending" | "conflict" | "not_applicable";

export interface OrderItem {
  id: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  retailPrice: number;
  totalPrice: number;
}

export interface OrderTimelineEvent {
  title: string;
  description: string;
  timestamp: string;
  completed: boolean;
  active?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  dealershipName: string;
  retailerName: string;
  retailerAddress: string;
  retailerPhone: string;
  srName: string;
  srPhone: string;
  status: OrderStatus;
  subtotal: number;
  tax: number;
  total: number;
  itemCount: number;
  createdAt: string;
  erpSyncStatus: ERPSyncStatus;
  items: OrderItem[];
  timeline: OrderTimelineEvent[];
}

export interface KPICardData {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  trendText: string;
  iconName: string;
}

export interface DealershipPerformance {
  id: string;
  name: string;
  region: string;
  activeSRs: number;
  todayOrders: number;
  revenue: number;
  completionRate: number;
}

export interface FieldActivity {
  id: string;
  srName: string;
  action: string;
  target: string;
  timestamp: string;
  type: "order" | "checkin" | "payment" | "alert";
  location?: string;
}
