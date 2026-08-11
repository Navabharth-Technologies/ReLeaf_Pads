import { Product, Customer, DeliveryPartner } from './types';

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

export const mockDeliveryPartners: DeliveryPartner[] = [
  { id: 'dp1', name: 'Rahul Kumar', phone: '+91 98765 43210', status: 'AVAILABLE', activeOrders: 0, completedOrders: 45, rating: 4.8 },
  { id: 'dp2', name: 'Suresh Kumar', phone: '+91 99887 66554', status: 'AVAILABLE', activeOrders: 0, completedOrders: 32, rating: 4.5 },
  { id: 'dp3', name: 'Manoj Kumar', phone: '+91 97421 12345', status: 'AVAILABLE', activeOrders: 0, completedOrders: 89, rating: 4.9 }
];

export const mockCustomers: Customer[] = [
  {
    id: 'c1',
    name: 'Ananya Rao',
    phone: '9876543211',
    pincode: '570023',
    addresses: [
      {
        id: 'a1',
        name: 'Ananya Rao',
        phone: '9876543211',
        houseNo: 'Flat 402, Green View Apts',
        street: 'Gokulam 3rd Stage',
        landmark: 'Near More Supermarket',
        city: 'Mysore',
        pincode: '570023'
      }
    ]
  },
  {
    id: 'c2',
    name: 'Meera Sharma',
    phone: '9988766552',
    pincode: '570004',
    addresses: [
      {
        id: 'a2',
        name: 'Meera Sharma',
        phone: '9988766552',
        houseNo: '124, 2nd Main',
        street: 'Saraswathipuram',
        landmark: 'Near Fire Station',
        city: 'Mysore',
        pincode: '570004'
      }
    ]
  },
  {
    id: 'c3',
    name: 'Kavya S',
    phone: '9742112345',
    pincode: '570001',
    addresses: [
      {
        id: 'a3',
        name: 'Kavya S',
        phone: '9742112345',
        houseNo: '45, Main Road',
        street: 'Devaraja Mohalla',
        landmark: 'Near KR Circle',
        city: 'Mysore',
        pincode: '570001'
      }
    ]
  }
];

export const SERVICEABLE_PINCODES = [
  '570001', '570002', '570004', '570005', '570006', 
  '570007', '570008', '570009', '570010', '570011', 
  '570012', '570015', '570016', '570017', '570018', 
  '570019', '570020', '570022', '570023', '570024', 
  '570025'
];

import { Order, TrackingEvent } from './types';

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

export const mockOrders: Order[] = [
  {
    id: `#RL${todayDateStr}001`,
    customerId: 'c1',
    addressId: 'a1',
    items: [
      {
        productId: 'p1',
        productName: 'Releaf Cotton Sanitary Pads – 30 Pads',
        image: '#A390E4',
        packSize: '30 Pads',
        quantity: 1,
        unitPrice: 359,
        totalPrice: 359,
        itemStatus: 'OUT_FOR_DELIVERY'
      },
      {
        productId: 'p3',
        productName: 'Releaf Cotton Sanitary Pads – 10 Pads Pack',
        image: '#A390E4',
        packSize: '10 Pads',
        quantity: 1,
        unitPrice: 139,
        totalPrice: 139,
        itemStatus: 'OUT_FOR_DELIVERY'
      }
    ],
    subtotal: 498,
    delivery: 0,
    total: 498,
    paymentStatus: 'PAID',
    status: 'OUT_FOR_DELIVERY',
    date: d1.toISOString(),
    deliveryPartnerId: 'dp1',
    trackingEvents: [
      createTracking('t1', `#RL${todayDateStr}001`, 'ORDER_PLACED', 0, d1, 'Order Placed'),
      createTracking('t2', `#RL${todayDateStr}001`, 'PAYMENT_CONFIRMED', 2, d1, 'Payment Confirmed'),
      createTracking('t3', `#RL${todayDateStr}001`, 'ORDER_CONFIRMED', 5, d1, 'Order Confirmed'),
      createTracking('t4', `#RL${todayDateStr}001`, 'PREPARING', 20, d1, 'Preparing'),
      createTracking('t5', `#RL${todayDateStr}001`, 'PACKED', 50, d1, 'Packed'),
      createTracking('t6', `#RL${todayDateStr}001`, 'ASSIGNED', 65, d1, 'Assigned Delivery Partner'),
      createTracking('t7', `#RL${todayDateStr}001`, 'OUT_FOR_DELIVERY', 80, d1, 'Out for Delivery')
    ]
  },
  {
    id: `#RL${todayDateStr}002`,
    customerId: 'c2',
    addressId: 'a2',
    items: [
      {
        productId: 'p2',
        productName: 'Releaf Cotton Sanitary Pads – 20 Pads',
        image: '#A390E4',
        packSize: '20 Pads',
        quantity: 1,
        unitPrice: 249,
        totalPrice: 249,
        itemStatus: 'PREPARING'
      }
    ],
    subtotal: 249,
    delivery: 0,
    total: 249,
    paymentStatus: 'PAID',
    status: 'PREPARING',
    date: d2.toISOString(),
    trackingEvents: [
      createTracking('t8', `#RL${todayDateStr}002`, 'ORDER_PLACED', 0, d2, 'Order Placed'),
      createTracking('t9', `#RL${todayDateStr}002`, 'PAYMENT_CONFIRMED', 1, d2, 'Payment Confirmed'),
      createTracking('t10', `#RL${todayDateStr}002`, 'ORDER_CONFIRMED', 5, d2, 'Order Confirmed'),
      createTracking('t11', `#RL${todayDateStr}002`, 'PREPARING', 15, d2, 'Preparing')
    ]
  },
  {
    id: `#RL${yesterdayDateStr}001`,
    customerId: 'c3',
    addressId: 'a3',
    items: [
      {
        productId: 'p4',
        productName: 'Releaf Panty Liners',
        image: '#A390E4',
        packSize: '20 Liners',
        quantity: 1,
        unitPrice: 154,
        totalPrice: 154,
        itemStatus: 'DELIVERED'
      }
    ],
    subtotal: 154,
    delivery: 0,
    total: 154,
    paymentStatus: 'PAID',
    status: 'DELIVERED',
    date: d3.toISOString(),
    deliveryPartnerId: 'dp2',
    trackingEvents: [
      createTracking('t12', `#RL${yesterdayDateStr}001`, 'ORDER_PLACED', 0, d3, 'Order Placed'),
      createTracking('t13', `#RL${yesterdayDateStr}001`, 'PAYMENT_CONFIRMED', 2, d3, 'Payment Confirmed'),
      createTracking('t14', `#RL${yesterdayDateStr}001`, 'ORDER_CONFIRMED', 15, d3, 'Order Confirmed'),
      createTracking('t15', `#RL${yesterdayDateStr}001`, 'PREPARING', 30, d3, 'Preparing'),
      createTracking('t16', `#RL${yesterdayDateStr}001`, 'PACKED', 60, d3, 'Packed'),
      createTracking('t17', `#RL${yesterdayDateStr}001`, 'ASSIGNED', 75, d3, 'Assigned Delivery Partner'),
      createTracking('t18', `#RL${yesterdayDateStr}001`, 'OUT_FOR_DELIVERY', 90, d3, 'Out for Delivery'),
      createTracking('t19', `#RL${yesterdayDateStr}001`, 'DELIVERED', 150, d3, 'Delivered')
    ]
  }
];
