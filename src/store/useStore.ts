import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { 
  Product, Customer, Order, ChatMessage, CartItem, OrderItem,
  Address, DeliveryPartner, ChatState, OrderStatus, TrackingEvent, Coupon
} from './types';
import { mockProducts, mockCustomers, mockDeliveryPartners, mockOrders, mockCoupons, SERVICEABLE_PINCODES } from './mockData';

interface AppState {
  // Data
  products: Product[];
  customers: Customer[];
  orders: Order[];
  deliveryPartners: DeliveryPartner[];
  
  // Current session
  currentCustomer: Customer | null;
  currentAddress: Address | null;
  selectedLocation: { latitude: number; longitude: number; pincode: string; addressType?: 'HOME'|'WORK'|'OTHER'; street?: string; area?: string; city?: string; } | null;
  currentDeliveryPartner: DeliveryPartner | null;
  cart: CartItem[];
  chatMessages: ChatMessage[];
  chatState: ChatState;
  coupons: Coupon[];
  appliedCoupon: Coupon | null;
  
  // Actions
  toggleProductStock: (productId: string) => void;
  toggleProductActive: (productId: string) => void;
  updateProductStock: (productId: string, change: number) => void;
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  addChatMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setChatState: (state: ChatState) => void;
  setCurrentCustomer: (customer: Customer | null) => void;
  setCurrentAddress: (address: Address | null) => void;
  setSelectedLocation: (location: { latitude: number; longitude: number; pincode: string; addressType?: 'HOME'|'WORK'|'OTHER' } | null) => void;
  loginDeliveryPartner: (phone: string) => boolean;
  logoutDeliveryPartner: () => void;
  togglePartnerStatus: () => void;
  createOrder: (paymentMethod: string) => Promise<string>; 
  markOrderAsPaid: (orderId: string, paymentMethod?: string) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignDeliveryPartner: (orderId: string, partnerId: string) => void;
  cancelOrder: (orderId: string) => void;
  saveNewCustomer: (customerData: Partial<Customer>) => Customer;
  demoFastForward: (orderId: string) => void;
  resetDemo: () => void;
  fetchProducts: () => Promise<void>;
  fetchDeliveryPartners: () => Promise<void>;
  fetchCustomers: () => Promise<void>;
  fetchOrders: () => Promise<void>;
  fetchCoupons: () => Promise<void>;
  addDeliveryPartner: (name: string, phone: string) => Promise<void>;
  removeDeliveryPartner: (id: string) => void;
  addProduct: (product: Partial<Product>) => void;
  
  addAddressToCustomer: (customerId: string, address: Address) => void;
  
  addCoupon: (coupon: Partial<Coupon>) => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
  getCartTotal: () => { subtotal: number; discountAmount: number; delivery: number; total: number };
  rateDeliveryPartner: (orderId: string, rating: number) => void;
  
  // Backend Integration
  fetchProducts: () => Promise<void>;
}

const generateId = () => Math.random().toString(36).substring(2, 9);
const generateOrderId = (orders: any[]) => {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${(d.getMonth()+1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}`;
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `#RL${dateStr}-${randomSuffix}`;
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      products: mockProducts,
      customers: mockCustomers,
      orders: mockOrders,
      deliveryPartners: mockDeliveryPartners,
      
      currentCustomer: null,
      currentAddress: null,
      selectedLocation: null,
      currentDeliveryPartner: null,
      cart: [],
      coupons: mockCoupons,
      appliedCoupon: null,
      chatMessages: [
        {
          id: 'init-msg',
          sender: 'bot',
          text: "Hello! 👋 Welcome to ReLeaf Pads.\n\nWe're happy to help you with comfortable, thoughtful menstrual care. 💚\n\nWhat would you like to do today?",
          timestamp: new Date().toISOString(),
          type: 'text'
        }
      ],
      chatState: 'WELCOME',
      
      toggleProductStock: (productId) => set((state) => ({
        products: state.products.map(p => p.id === productId ? { ...p, stock: p.stock > 0 ? 0 : 50, stockStatus: p.stock > 0 ? 'OUT_OF_STOCK' : 'IN_STOCK' } : p)
      })),
      toggleProductActive: (productId) => set((state) => ({
        products: state.products.map(p => p.id === productId ? { ...p, active: !p.active } : p)
      })),

      updateProductStock: (productId, change) => set((state) => {
        return {
          products: state.products.map(p => {
            if (p.id === productId) {
              const newStock = Math.max(0, p.stock + change);
              let newStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
              if (newStock === 0) newStatus = 'OUT_OF_STOCK';
              else if (newStock <= 10) newStatus = 'LOW_STOCK';
              
              return { ...p, stock: newStock, stockStatus: newStatus };
            }
            return p;
          })
        };
      }),
      
      addToCart: (product, quantity = 1) => set((state) => {
        const existingItem = state.cart.find(item => item.product.id === product.id);
        if (existingItem) {
          return {
            cart: state.cart.map(item => 
              item.product.id === product.id 
                ? { ...item, quantity: item.quantity + quantity }
                : item
            )
          };
        }
        return { cart: [...state.cart, { product, quantity }] };
      }),
      
      updateCartQuantity: (productId, quantity) => set((state) => {
        const newCart = quantity <= 0 
          ? state.cart.filter(item => item.product.id !== productId)
          : state.cart.map(item => item.product.id === productId ? { ...item, quantity } : item);
        
        // Re-validate coupon if one is applied
        return { cart: newCart };
      }),
      
      clearCart: () => set({ cart: [], appliedCoupon: null }),
      
      addChatMessage: (msg) => set((state) => {
        let updatedMessages = state.chatMessages;
        
        if (msg.type === 'cart') {
          updatedMessages = updatedMessages.filter(m => m.type !== 'cart');
        }
        if (msg.type === 'add_to_cart_success') {
          updatedMessages = updatedMessages.filter(m => m.type !== 'add_to_cart_success');
        }

        return {
          chatMessages: [...updatedMessages, {
            ...msg,
            id: generateId(),
            timestamp: new Date().toISOString()
          }]
        };
      }),
      
      setChatState: (chatState) => set({ chatState }),
      
      setCurrentCustomer: (customer) => set({ currentCustomer: customer }),
      
      setCurrentAddress: (address) => set({ currentAddress: address }),
      
      setSelectedLocation: (location) => set({ selectedLocation: location }),

      loginDeliveryPartner: (phone) => {
        const normalize = (p: string) => {
          const d = p.replace(/\D/g, '');
          return d.length === 12 && d.startsWith('91') ? d.slice(2) : d;
        };
        const normalizedInput = normalize(phone);
        const partner = get().deliveryPartners.find(dp => normalize(dp.phone) === normalizedInput);
        if (partner) {
          set({ currentDeliveryPartner: partner });
          return true;
        }
        return false;
      },

      logoutDeliveryPartner: () => set({ currentDeliveryPartner: null }),

      togglePartnerStatus: () => set((state) => {
        if (!state.currentDeliveryPartner) return state;
        const currentStatus = state.currentDeliveryPartner.status;
        let newStatus: 'AVAILABLE' | 'OFFLINE' | 'ON_DELIVERY' | 'ASSIGNED' = currentStatus;
        
        if (currentStatus === 'AVAILABLE') newStatus = 'OFFLINE';
        else if (currentStatus === 'OFFLINE') newStatus = 'AVAILABLE';
        
        const updatedPartner = { ...state.currentDeliveryPartner, status: newStatus };
        return {
          currentDeliveryPartner: updatedPartner,
          deliveryPartners: state.deliveryPartners.map(dp => dp.id === updatedPartner.id ? updatedPartner : dp)
        };
      }),
      
      getCartTotal: () => {
        const state = get();
        const subtotal = state.cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
        let discountAmount = 0;
        
        if (state.appliedCoupon) {
          const c = state.appliedCoupon;
          if (c.discountType === 'PERCENTAGE') {
            discountAmount = subtotal * (c.discountValue / 100);
            if (c.maximumDiscount && discountAmount > c.maximumDiscount) {
              discountAmount = c.maximumDiscount;
            }
          } else {
            discountAmount = c.discountValue;
          }
          
          if (discountAmount > subtotal) {
             discountAmount = subtotal;
          }
        }
        
        const delivery = 0; // FREE for demo
        const total = subtotal - discountAmount + delivery;
        
        return { subtotal, discountAmount, delivery, total };
      },
      
      applyCoupon: (code) => {
        const state = get();
        const subtotal = state.cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
        const searchCode = code.trim().toUpperCase();
        
        const coupon = state.coupons.find(c => c.code.toUpperCase() === searchCode);
        if (!coupon) return { success: false, message: "Sorry, we couldn't find that coupon. Please check the code and try again." };
        if (!coupon.active) return { success: false, message: "This offer is currently unavailable." };
        
        if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
          return { success: false, message: "This offer has reached its usage limit." };
        }
        
        if (coupon.minimumOrderValue && subtotal < coupon.minimumOrderValue) {
          return { success: false, message: `Your order needs to be at least ₹${coupon.minimumOrderValue} to use this offer.` };
        }
        
        if (coupon.type === 'USER_SPECIFIC') {
           if (!state.currentCustomer) return { success: false, message: "Please enter your details first to check eligibility." };
           if (!coupon.eligibleUsers || !coupon.eligibleUsers.includes(state.currentCustomer.id)) {
             return { success: false, message: "This coupon isn't available for your account." };
           }
        }
        
        if (coupon.type === 'FIRST_ORDER') {
           if (!state.currentCustomer) return { success: false, message: "Please enter your details first to check eligibility." };
           const hasOrders = state.orders.some(o => o.customerId === state.currentCustomer!.id && o.status !== 'CANCELLED');
           if (hasOrders) {
             return { success: false, message: "This coupon is valid only for your first order." };
           }
        }
        
        // Success
        set({ appliedCoupon: coupon });
        return { success: true, message: `✓ ${coupon.code} Applied` };
      },
      
      removeCoupon: () => set({ appliedCoupon: null }),
      
      createOrder: async (paymentMethod) => {
        const state = get();
        if (!state.currentCustomer || !state.currentAddress || state.cart.length === 0) return '';
        
        const { subtotal, discountAmount, delivery, total } = get().getCartTotal();
        const now = new Date().toISOString();
        
        const orderItems: OrderItem[] = state.cart.map(c => ({
          productId: c.product.id,
          productName: c.product.name,
          image: c.product.imageFallback,
          packSize: c.product.packSize,
          quantity: c.quantity,
          unitPrice: c.product.sellingPrice,
          totalPrice: c.product.sellingPrice * c.quantity,
          itemStatus: 'ORDER_PLACED'
        }));
            const id = generateOrderId(state.orders);
        const newOrder: Order = {
          id,
          customerId: state.currentCustomer.id,
          addressId: state.currentAddress.id,
          deliveryAddress: state.currentAddress,
          items: orderItems,
          subtotal,
          delivery,
          total,
          paymentStatus: 'PENDING',
          status: 'ORDER_CONFIRMED',
          date: now,
          trackingEvents: [
            {
              id: generateId(),
              orderId: id,
              status: 'ORDER_CONFIRMED',
              timestamp: now,
              message: 'Order Confirmed'
            }
          ]
        };
        
        if (state.appliedCoupon) {
           newOrder.couponId = state.appliedCoupon.id;
           newOrder.couponCode = state.appliedCoupon.code;
           newOrder.discountAmount = discountAmount;
           if (state.appliedCoupon.type === 'INFLUENCER') {
             newOrder.influencerId = state.appliedCoupon.influencerId;
             newOrder.influencerName = state.appliedCoupon.influencerName;
           }
        }
        
        // POST to SQL Database
        try {
          const localUrl = 'http://192.168.1.3:5000';
          const API_URL = __DEV__ ? localUrl : 'https://releaf-pads-backend-1.onrender.com';
          const response = await fetch(`${API_URL}/api/orders/full`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: newOrder.id,
              customerId: newOrder.customerId,
              addressId: newOrder.addressId,
              couponId: newOrder.couponId,
              subtotal: newOrder.subtotal,
              delivery: newOrder.delivery,
              total: newOrder.total,
              paymentStatus: newOrder.paymentStatus,
              status: newOrder.status,
              date: newOrder.date,
              items: newOrder.items,
              trackingEvents: newOrder.trackingEvents
            })
          });
          
          if (!response.ok) {
             const errorData = await response.text();
             throw new Error(`DB Save Failed: ${errorData}`);
          }
        } catch (err) {
          console.error('Failed to save order to DB:', err);
          throw err;
        }
        
        newOrder.trackingEvents.forEach(te => te.orderId = newOrder.id);
        
        // Update product stock and totalSold
        const updatedProducts = state.products.map(p => {
          const cartItem = state.cart.find(c => c.product.id === p.id);
          if (cartItem) {
            const newStock = Math.max(0, p.stock - cartItem.quantity);
            let newStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
            if (newStock === 0) newStatus = 'OUT_OF_STOCK';
            else if (newStock <= 10) newStatus = 'LOW_STOCK';
            
            return {
              ...p,
              stock: newStock,
              stockStatus: newStatus,
              totalSold: p.totalSold + cartItem.quantity
            };
          }
          return p;
        });
        
        // Update coupon usage
        const updatedCoupons = state.coupons.map(c => {
           if (state.appliedCoupon && c.id === state.appliedCoupon.id) {
              const customerUsage = { ...(c.customerUsage || {}) };
              const customerId = state.currentCustomer!.id;
              customerUsage[customerId] = (customerUsage[customerId] || 0) + 1;
              return { ...c, usedCount: c.usedCount + 1, customerUsage };
           }
           return c;
        });
        
        // Update customer savings
        const updatedCustomers = state.customers.map(c => {
           if (c.id === state.currentCustomer!.id) {
              return { 
                ...c, 
                totalSavings: (c.totalSavings || 0) + discountAmount,
                couponsUsed: (c.couponsUsed || 0) + (state.appliedCoupon ? 1 : 0)
              };
           }
           return c;
        });

        set((state) => ({
          orders: [newOrder, ...state.orders],
          cart: [],
          appliedCoupon: null,
          products: updatedProducts,
          coupons: updatedCoupons,
          customers: updatedCustomers,
          currentCustomer: updatedCustomers.find(c => c.id === state.currentCustomer!.id) || state.currentCustomer
        }));
        
        return newOrder.id;
      },
      
      markOrderAsPaid: (orderId, paymentMethod) => {
        set((state) => {
          const updatedOrders = state.orders.map(o => {
            if (o.id === orderId) {
              return { ...o, paymentStatus: 'PAID', paymentMethod };
            }
            return o;
          });
          return { orders: updatedOrders };
        });
      },

      updateOrderStatus: (orderId, status) => {
        const state = get();
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;

        // POST to SQL Database
        fetch(`https://releaf-pads-backend-1.onrender.com/api/orders/${encodeURIComponent(orderId)}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        }).catch(err => console.error('Failed to update order status in DB:', err));

        let message = '';
        let chatText = '';
        
        switch (status) {
          case 'ORDER_CONFIRMED':
            message = 'Order Confirmed';
            chatText = `🎉 Your ReLeaf order has been confirmed!\n\nYour order ${orderId} is now being prepared with care. 💚\n\nWe'll keep you updated here.`;
            break;
          case 'PREPARING':
            message = 'Preparing';
            chatText = `🌿 Your ReLeaf order ${orderId} is now being prepared.`;
            break;
          case 'PACKED':
            message = 'Packed';
            chatText = `📦 Your ReLeaf order ${orderId} has been packed and is ready for dispatch.`;
            break;
          case 'OUT_FOR_DELIVERY':
            message = 'Out for Delivery';
            const partner = state.deliveryPartners.find(dp => dp.id === order.deliveryPartnerId);
            chatText = `🚚 ${partner?.name || 'Your delivery partner'} has picked up your ReLeaf order and is on the way!\n\nContact: ${partner?.phone || ''}\n\nYou can contact them directly for any delivery updates.`;
            break;
          case 'DELIVERED':
            message = 'Delivered';
            chatText = `🌿 Order Delivered\n\nYour ReLeaf order ${orderId} has been successfully delivered.\n\nThank you for choosing ReLeaf Pads and for trusting us with your care. 💚\n\nWe hope you have a comfortable and confident experience.\n\nThank you for shopping with ReLeaf. 🌿`;
            break;
          default:
            message = status;
        }

        const newEvent: TrackingEvent = {
          id: generateId(),
          orderId,
          status,
          timestamp: new Date().toISOString(),
          message
        };

        let updatedPartners = state.deliveryPartners;
        let updatedCurrentPartner = state.currentDeliveryPartner;

        if (status === 'OUT_FOR_DELIVERY' && order.deliveryPartnerId) {
          updatedPartners = state.deliveryPartners.map(dp => 
            dp.id === order.deliveryPartnerId ? { ...dp, status: 'ON_DELIVERY' } : dp
          );
          if (updatedCurrentPartner?.id === order.deliveryPartnerId) {
            updatedCurrentPartner = { ...updatedCurrentPartner, status: 'ON_DELIVERY' };
          }
        } else if (status === 'DELIVERED' && order.deliveryPartnerId) {
          updatedPartners = state.deliveryPartners.map(dp => 
            dp.id === order.deliveryPartnerId ? { ...dp, status: 'AVAILABLE', activeOrders: Math.max(0, dp.activeOrders - 1), completedOrders: dp.completedOrders + 1 } : dp
          );
          if (updatedCurrentPartner?.id === order.deliveryPartnerId) {
            updatedCurrentPartner = { ...updatedCurrentPartner, status: 'AVAILABLE', activeOrders: Math.max(0, updatedCurrentPartner.activeOrders - 1), completedOrders: updatedCurrentPartner.completedOrders + 1 };
          }
        }

        set((state) => ({
          orders: state.orders.map(o => {
            if (o.id === orderId) {
              return {
                ...o,
                status,
                trackingEvents: [...o.trackingEvents, newEvent],
                items: o.items.map(item => ({ ...item, itemStatus: status }))
              };
            }
            return o;
          }),
          deliveryPartners: updatedPartners,
          currentDeliveryPartner: updatedCurrentPartner
        }));

        if (chatText && order.customerId === state.currentCustomer?.id) {
          get().addChatMessage({ sender: 'bot', text: chatText, type: 'text', orderId });
        }
      },

      rateDeliveryPartner: (orderId, rating) => {
        const state = get();
        const order = state.orders.find(o => o.id === orderId);
        if (!order || !order.deliveryPartnerId) return;

        const partnerId = order.deliveryPartnerId;

        // In a real app, you would POST this rating to the backend here

        set((state) => {
          const updatedOrders = state.orders.map(o => 
            o.id === orderId ? { ...o, deliveryRating: rating } : o
          );

          const updatedPartners = state.deliveryPartners.map(dp => {
            if (dp.id === partnerId) {
              const currentRating = dp.rating || 5.0;
              const currentCount = dp.ratingsCount || 1;
              const newRating = ((currentRating * currentCount) + rating) / (currentCount + 1);
              return { ...dp, rating: newRating, ratingsCount: currentCount + 1 };
            }
            return dp;
          });

          const updatedCurrentPartner = state.currentDeliveryPartner?.id === partnerId
            ? updatedPartners.find(dp => dp.id === partnerId)
            : state.currentDeliveryPartner;

          return {
            orders: updatedOrders,
            deliveryPartners: updatedPartners,
            currentDeliveryPartner: updatedCurrentPartner || null
          };
        });
      },
      
      assignDeliveryPartner: (orderId, partnerId) => {
        const state = get();
        const partner = state.deliveryPartners.find(dp => dp.id === partnerId);
        
        // POST to SQL Database
        fetch(`https://releaf-pads-backend-1.onrender.com/api/orders/${encodeURIComponent(orderId)}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'ASSIGNED', deliveryPartnerId: partnerId })
        }).catch(err => console.error('Failed to assign partner in DB:', err));
        
        const newEvent: TrackingEvent = {
          id: generateId(),
          orderId,
          status: 'ASSIGNED',
          timestamp: new Date().toISOString(),
          message: 'Delivery Partner Assigned'
        };

        const chatText = `🚚 Your ReLeaf order has been assigned to our delivery partner, ${partner?.name || 'an agent'}.`;

        set((state) => {
          const order = state.orders.find(o => o.id === orderId);
          return {
            orders: state.orders.map(o => o.id === orderId ? { 
              ...o, 
              deliveryPartnerId: partnerId, 
              status: 'ASSIGNED',
              trackingEvents: [...o.trackingEvents, newEvent],
              items: o.items.map(i => ({ ...i, itemStatus: 'ASSIGNED' }))
            } : o),
            deliveryPartners: state.deliveryPartners.map(dp => dp.id === partnerId ? { ...dp, status: 'ASSIGNED', activeOrders: dp.activeOrders + 1 } : dp)
          };
        });

        const order = get().orders.find(o => o.id === orderId);
        if (order?.customerId === get().currentCustomer?.id) {
          get().addChatMessage({ sender: 'bot', text: chatText, type: 'text', orderId });
        }
      },

      cancelOrder: (orderId) => {
        const state = get();
        const order = state.orders.find(o => o.id === orderId);
        if (!order || ['PACKED', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED'].includes(order.status)) return;

        const newEvent: TrackingEvent = {
          id: generateId(),
          orderId,
          status: 'CANCELLED',
          timestamp: new Date().toISOString(),
          message: 'Order Cancelled'
        };

        // Restore stock
        const updatedProducts = state.products.map(p => {
          const orderItem = order.items.find(i => i.productId === p.id);
          if (orderItem) {
            const newStock = p.stock + orderItem.quantity;
            let newStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK' = 'IN_STOCK';
            if (newStock === 0) newStatus = 'OUT_OF_STOCK';
            else if (newStock <= 10) newStatus = 'LOW_STOCK';
            return { ...p, stock: newStock, stockStatus: newStatus, totalSold: Math.max(0, p.totalSold - orderItem.quantity) };
          }
          return p;
        });
        
        // Restore coupon usage
        const updatedCoupons = state.coupons.map(c => {
           if (order.couponId && c.id === order.couponId) {
             return { ...c, usedCount: Math.max(0, c.usedCount - 1) };
           }
           return c;
        });

        set((state) => ({
          orders: state.orders.map(o => o.id === orderId ? {
            ...o,
            status: 'CANCELLED',
            trackingEvents: [...o.trackingEvents, newEvent],
            items: o.items.map(i => ({ ...i, itemStatus: 'CANCELLED' }))
          } : o),
          products: updatedProducts,
          coupons: updatedCoupons
        }));

        if (order.customerId === state.currentCustomer?.id) {
          get().addChatMessage({ sender: 'bot', text: `Your ReLeaf order ${orderId} has been cancelled successfully.`, type: 'text', orderId });
        }
      },
      
      saveNewCustomer: (customerData) => {
        const id = `c_${Date.now()}`;
        const newCustomer: Customer = {
          id,
          name: customerData.name || '',
          phone: customerData.phone || '',
          pincode: customerData.pincode || '',
          addresses: customerData.addresses || []
        };
        
        // POST to SQL Database
        fetch('https://releaf-pads-backend-1.onrender.com/api/customers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCustomer)
        })
        .then(() => {
          if (newCustomer.addresses.length > 0) {
            newCustomer.addresses.forEach(addr => {
              fetch(`https://releaf-pads-backend-1.onrender.com/api/customers/${id}/addresses`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(addr)
              }).catch(err => console.error('Failed to save address to DB:', err));
            });
          }
        })
        .catch(err => console.error('Failed to save customer to DB:', err));

        set((state) => ({
          customers: [...state.customers, newCustomer],
          currentCustomer: newCustomer
        }));
        return newCustomer;
      },
      
      addAddressToCustomer: (customerId, address) => {
        fetch(`https://releaf-pads-backend-1.onrender.com/api/customers/${customerId}/addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(address)
        }).catch(err => console.error('Failed to save address to DB:', err));

        set((state) => {
          const updatedCustomers = state.customers.map(c => {
            if (c.id === customerId) {
              return { ...c, addresses: [...(c.addresses || []), address] };
            }
            return c;
          });
          const updatedCurrentCustomer = state.currentCustomer?.id === customerId 
            ? { ...state.currentCustomer, addresses: [...(state.currentCustomer.addresses || []), address] }
            : state.currentCustomer;
            
          return { customers: updatedCustomers, currentCustomer: updatedCurrentCustomer };
        });
      },
      
      demoFastForward: (orderId) => {
        const sequence: OrderStatus[] = ['ORDER_CONFIRMED', 'PREPARING', 'PACKED', 'ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
        let delay = 3000; // 3 seconds per step
        
        const runSequence = (idx: number) => {
          if (idx >= sequence.length) return;
          
          const status = sequence[idx];
          if (status === 'ASSIGNED') {
            const partner = get().deliveryPartners.find(dp => dp.status === 'AVAILABLE') || mockDeliveryPartners[0];
            get().assignDeliveryPartner(orderId, partner.id);
          } else {
            get().updateOrderStatus(orderId, status);
          }

          setTimeout(() => runSequence(idx + 1), delay);
        };
        
        runSequence(0);
      },

      resetDemo: () => set({
        products: mockProducts,
        customers: mockCustomers,
        orders: mockOrders,
        deliveryPartners: mockDeliveryPartners,
        coupons: mockCoupons,
        currentCustomer: null,
        currentAddress: null,
        selectedLocation: null,
        cart: [],
        appliedCoupon: null,
        chatState: 'WELCOME',
        chatMessages: [
          {
            id: generateId(),
            sender: 'bot',
            text: "Hello! 👋 Welcome to ReLeaf Pads.\n\nWe're happy to help you with comfortable, thoughtful menstrual care. 💚\n\nWhat would you like to do today?",
            timestamp: new Date().toISOString(),
            type: 'text'
          }
        ]
      }),

      addDeliveryPartner: async (name, phone) => {
        try {
          // POST to SQL Database
          const response = await fetch('https://releaf-pads-backend-1.onrender.com/api/delivery-partners', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, phone })
          });
          
          if (!response.ok) throw new Error('Failed to save to database');
          
          const newDp = {
            id: `dp_${Date.now()}`,
            name,
            phone,
            status: 'AVAILABLE',
            activeOrders: 0,
            completedOrders: 0,
            rating: 5.0,
            ratingsCount: 1
          };
          
          set((state) => ({
            deliveryPartners: [...state.deliveryPartners, newDp]
          }));
        } catch (error) {
          console.error("Error saving delivery partner:", error);
          alert("Failed to save to database. Is the backend running?");
        }
      },

      fetchDeliveryPartners: async () => {
        try {
          const response = await fetch('https://releaf-pads-backend-1.onrender.com/api/delivery-partners');
          const data = await response.json();
          // Map DB schema to frontend schema
          const mappedPartners = data.map((dp: any) => ({
            ...dp,
            status: dp.availabilityStatus || 'AVAILABLE',
            activeOrders: dp.activeOrders || 0,
            completedOrders: dp.completedOrders || 0,
            rating: dp.rating || 5.0
          }));
          set({ deliveryPartners: mappedPartners });
        } catch (error) {
          console.error("Failed to fetch delivery partners from DB:", error);
        }
      },

      fetchCustomers: async () => {
        try {
          const response = await fetch('https://releaf-pads-backend-1.onrender.com/api/customers');
          const data = await response.json();
          set({ customers: data });
        } catch (error) {
          console.error("Failed to fetch customers from DB:", error);
        }
      },

      fetchOrders: async () => {
        try {
          const response = await fetch('https://releaf-pads-backend-1.onrender.com/api/orders');
          const data = await response.json();
          set({ orders: data });
        } catch (error) {
          console.error("Failed to fetch orders from DB:", error);
        }
      },
      
      fetchCoupons: async () => {
        try {
          const response = await fetch('https://releaf-pads-backend-1.onrender.com/api/coupons');
          const data = await response.json();
          set({ coupons: data });
        } catch (error) {
          console.error("Failed to fetch coupons from DB:", error);
        }
      },

      removeDeliveryPartner: (id) => set((state) => ({
        deliveryPartners: state.deliveryPartners.filter(dp => dp.id !== id)
      })),

      addProduct: (product) => set((state) => ({
        products: [
          ...state.products,
          {
            id: `prod_${Date.now()}`,
            name: product.name || 'New Product',
            packSize: product.packSize || '1',
            mrp: product.mrp || 0,
            sellingPrice: product.sellingPrice || 0,
            discount: product.discount || 0,
            description: product.description || '',
            imageFallback: product.imageFallback || '#E2E8F0',
            imageUrl: product.imageUrl,
            stock: product.stock || 0,
            stockStatus: (product.stock || 0) > 0 ? 'IN_STOCK' : 'OUT_OF_STOCK',
            totalSold: 0,
            active: true
          }
        ]
      })),

      addCoupon: (coupon) => {
        const id = `coupon_${Date.now()}`;
        const newCoupon: Coupon = {
            id,
            code: coupon.code || `NEW${Date.now()}`,
            type: coupon.type || 'GENERAL',
            discountType: coupon.discountType || 'PERCENTAGE',
            discountValue: coupon.discountValue || 10,
            minimumOrderValue: coupon.minimumOrderValue,
            maximumDiscount: coupon.maximumDiscount,
            usageLimit: coupon.usageLimit,
            usedCount: 0,
            active: coupon.active ?? true,
            influencerName: coupon.influencerName
        };

        // POST to SQL Database
        fetch('https://releaf-pads-backend-1.onrender.com/api/coupons', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCoupon)
        }).catch(err => console.error('Failed to save coupon to DB:', err));

        set((state) => ({
          coupons: [...state.coupons, newCoupon]
        }));
      },

      fetchProducts: async () => {
        try {
          // You may need to change localhost to your PC's IP if running on an Android emulator or physical device.
          const response = await fetch('https://releaf-pads-backend-1.onrender.com/api/products');
          const data = await response.json();
          if (Array.isArray(data)) {
            set({ products: data });
          }
        } catch (error) {
          console.error('Failed to fetch products from backend:', error);
        }
      }
    }),
    {
      name: 'releaf-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
