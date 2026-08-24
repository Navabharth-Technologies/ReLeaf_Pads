import { Product, Customer, DeliveryPartner, Coupon } from './types';

export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Releaf Cotton Sanitary Pads – 30 Pads',
    packSize: '30 Pads',
    mrp: 414,
    sellingPrice: 359,
    discount: 13,
    description: 'Our most popular pack. Super soft, breathable cotton pads with wings. Ideal for regular to heavy flow.',
    imageFallback: '#A390E4',
    stock: 50,
    stockStatus: 'IN_STOCK',
    totalSold: 120,
    active: true
  },
  {
    id: 'p2',
    name: 'Releaf Cotton Sanitary Pads – 20 Pads',
    packSize: '20 Pads',
    mrp: 278,
    sellingPrice: 249,
    discount: 10,
    description: 'Perfect for your monthly cycle. Comfortable and rash-free experience.',
    imageFallback: '#A390E4',
    stock: 35,
    stockStatus: 'IN_STOCK',
    totalSold: 85,
    active: true
  },
  {
    id: 'p3',
    name: 'Releaf Cotton Sanitary Pads – 10 Pads Pack',
    packSize: '10 Pads',
    mrp: 155,
    sellingPrice: 139,
    discount: 10,
    description: 'Travel-friendly pack. Experience the comfort of pure cotton.',
    imageFallback: '#A390E4',
    stock: 0,
    stockStatus: 'OUT_OF_STOCK',
    totalSold: 30,
    active: true
  },
  {
    id: 'p4',
    name: 'Releaf Cotton Sanitary Pads – 6 Pads Pack',
    packSize: '6 Pads',
    mrp: 85, 
    sellingPrice: 77,
    discount: 9,
    description: 'A trial pack to experience true comfort and care.',
    imageFallback: '#A390E4',
    stock: 7,
    stockStatus: 'LOW_STOCK',
    totalSold: 15,
    active: true
  }
];

export const mockDeliveryPartners: DeliveryPartner[] = [];

export const mockCustomers: Customer[] = [];

export const SERVICEABLE_PINCODES = [
  '570001', '570002', '570004', '570005', '570006', 
  '570007', '570008', '570009', '570010', '570011', 
  '570012', '570015', '570016', '570017', '570018', 
  '570019', '570020', '570022', '570023', '570024', 
  '570025'
];

import { Order, TrackingEvent } from './types';

export const mockCoupons: Coupon[] = [];

const now = new Date();
const todayDateStr = `${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}`;

const d1 = new Date(now); d1.setHours(now.getHours() - 4, 0, 0, 0);
const d2 = new Date(now); d2.setHours(now.getHours() - 2, 0, 0, 0);
const d3 = new Date(now); d3.setDate(now.getDate() - 1); d3.setHours(19, 50, 0, 0);
const yesterdayDateStr = `${d3.getFullYear()}${(d3.getMonth()+1).toString().padStart(2, '0')}${d3.getDate().toString().padStart(2, '0')}`;

const createTracking = (id: string, orderId: string, status: string, timeDiffMins: number, baseDate: Date, message: string): TrackingEvent => {
  const d = new Date(baseDate);
  d.setMinutes(d.getMinutes() + timeDiffMins);
  return { id, orderId, status, timestamp: d.toISOString(), message } as any;
};

export const mockOrders: Order[] = [];
