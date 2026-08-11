export interface Product {
  id: string;
  name: string;
  packSize: string;
  mrp: number;
  sellingPrice: number;
  discount: number;
  description: string;
  imageFallback: string;
  imageUrl?: string;
  stock: number;
  stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
  totalSold: number;
  active: boolean;
}

export interface Address {
  id: string;
  name: string;
  phone: string;
  houseNo: string;
  street: string;
  landmark: string;
  city: string;
  pincode: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  pincode: string;
  addresses: Address[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'ORDER_PLACED' | 'PAYMENT_CONFIRMED' | 'ORDER_CONFIRMED' | 'PREPARING' | 'PACKED' | 'ASSIGNED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED';

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  status: 'AVAILABLE' | 'ASSIGNED' | 'ON_DELIVERY' | 'OFFLINE';
  activeOrders: number;
  completedOrders: number;
  rating?: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  image: string;
  packSize: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  itemStatus: OrderStatus;
}

export interface TrackingEvent {
  id: string;
  orderId: string;
  status: OrderStatus;
  timestamp: string;
  message: string;
}

export interface Order {
  id: string;
  customerId: string;
  addressId: string;
  items: OrderItem[];
  subtotal: number;
  delivery: number;
  total: number;
  paymentId?: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  date: string;
  estimatedDelivery?: string;
  deliveryPartnerId?: string;
  trackingEvents: TrackingEvent[];
}

export interface ChatMessage {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  type?: 'text' | 'products' | 'cart' | 'checkout' | 'payment' | 'order_success' | 'link';
  linkUrl?: string;
  linkText?: string;
  orderId?: string;
}

export type ChatState = 'IDLE' | 'WELCOME' | 'BROWSING_PRODUCTS' | 'PRODUCT_SELECTED' | 'CART' | 'CHECKING_PINCODE' | 'COLLECTING_CUSTOMER_DETAILS' | 'COLLECTING_CUSTOMER_DETAILS_NAME' | 'COLLECTING_ADDRESS' | 'ADDRESS_CONFIRMATION' | 'ORDER_REVIEW' | 'PAYMENT' | 'PAYMENT_SUCCESS' | 'ORDER_CONFIRMED' | 'PREPARING' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
