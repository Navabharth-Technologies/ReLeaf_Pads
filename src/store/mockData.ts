import { Product, Customer, DeliveryPartner, Order, Coupon } from './types';

export const mockProducts: Product[] = [{"id":1,"name":"ReLeaf Pads (Pack of 7)","description":"Eco-friendly biodegradable sanitary pads","mrp":199,"sellingPrice":"169.00","stock":50,"imageFallback":"#E8F5E9","active":true,"stockStatus":"IN_STOCK"},{"id":2,"name":"ReLeaf Pads (Pack of 14)","description":"Eco-friendly biodegradable sanitary pads","mrp":350,"sellingPrice":"299.00","stock":100,"imageFallback":"#E8F5E9","active":true,"stockStatus":"IN_STOCK"}];
export const mockCustomers: Customer[] = [];
export const mockDeliveryPartners: DeliveryPartner[] = [];
export const mockOrders: Order[] = [];
export const mockCoupons: Coupon[] = [];

export const SERVICEABLE_PINCODES = [
  '570001', '570002', '570003', '570004', '570005',
  '570006', '570007', '570008', '570009', '570010',
  '570011', '570012', '570013', '570014', '570015',
  '570016', '570017', '570018', '570019', '570020',
  '570021', '570022', '570023', '570026'
];
