import { Product, Customer, DeliveryPartner, Order, Coupon } from './types';

export const mockProducts: Product[] = [
  {
    id: 'p_panty',
    name: 'Releaf Period Panty',
    packSize: '1 Panty',
    mrp: 75,
    sellingPrice: 50,
    discount: 33,
    description: 'Comfortable, leak-proof Releaf Period Panty designed for ultimate comfort and protection during your period cycle.',
    imageFallback: '#E87A90',
    stock: 51,
    stockStatus: 'IN_STOCK',
    totalSold: 0,
    active: true,
  },
  {
    id: 'p1',
    name: 'Releaf Cotton Sanitary Pads – 30 Pads',
    packSize: '30 Pads',
    mrp: 414,
    sellingPrice: 359,
    discount: 13,
    description: 'Our most popular pack. Super soft, breathable cotton pads with wings. Ideal for regular to heavy flow.',
    imageFallback: '#A390E4',
    stock: 47,
    stockStatus: 'IN_STOCK',
    totalSold: 120,
    active: true,
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
    active: true,
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
    stock: 50,
    stockStatus: 'IN_STOCK',
    totalSold: 30,
    active: true,
  }
];

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
