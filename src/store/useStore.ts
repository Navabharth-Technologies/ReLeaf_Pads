import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  Product, Customer, Order, ChatMessage, CartItem, OrderItem,
  Address, DeliveryPartner, ChatState, OrderStatus, TrackingEvent
} from './types';
import { mockProducts, mockCustomers, mockDeliveryPartners, mockOrders, SERVICEABLE_PINCODES } from './mockData';

interface AppState {
  // Data
  products: Product[];
  customers: Customer[];
  orders: Order[];
  deliveryPartners: DeliveryPartner[];
  
  // Current session
  currentCustomer: Customer | null;
  currentAddress: Address | null;
  currentDeliveryPartner: DeliveryPartner | null;
  cart: CartItem[];
  chatMessages: ChatMessage[];
  chatState: ChatState;
  
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
  loginDeliveryPartner: (phone: string) => boolean;
  logoutDeliveryPartner: () => void;
  togglePartnerStatus: () => void;
  createOrder: (paymentMethod: string) => string; 
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  assignDeliveryPartner: (orderId: string, partnerId: string) => void;
  cancelOrder: (orderId: string) => void;
  saveNewCustomer: (customerData: Partial<Customer>) => Customer;
  demoFastForward: (orderId: string) => void;
  resetDemo: () => void;
  addDeliveryPartner: (name: string, phone: string) => void;
  removeDeliveryPartner: (id: string) => void;
  addProduct: (product: Partial<Product>) => void;
}

const generateId = () => Math.random().toString(36).substring(2, 9);
const generateOrderId = (orders: any[]) => {
  const d = new Date();
  const dateStr = `${d.getFullYear()}${(d.getMonth()+1).toString().padStart(2, '0')}${d.getDate().toString().padStart(2, '0')}`;
  const todayOrders = orders.filter(o => o.id.startsWith(`#RL${dateStr}`));
  const nextNumber = (todayOrders.length + 1).toString().padStart(3, '0');
  return `#RL${dateStr}${nextNumber}`;
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
      currentDeliveryPartner: null,
      cart: [],
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
      
      updateCartQuantity: (productId, quantity) => set((state) => ({
        cart: quantity <= 0 
          ? state.cart.filter(item => item.product.id !== productId)
          : state.cart.map(item => item.product.id === productId ? { ...item, quantity } : item)
      })),
      
      clearCart: () => set({ cart: [] }),
      
      addChatMessage: (msg) => set((state) => ({
        chatMessages: [...state.chatMessages, {
          ...msg,
          id: generateId(),
          timestamp: new Date().toISOString()
        }]
      })),
      
      setChatState: (chatState) => set({ chatState }),
      
      setCurrentCustomer: (customer) => set({ currentCustomer: customer }),
      
      setCurrentAddress: (address) => set({ currentAddress: address }),

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
      
      createOrder: (paymentMethod) => {
        const state = get();
        if (!state.currentCustomer || !state.currentAddress || state.cart.length === 0) return '';
        
        const subtotal = state.cart.reduce((sum, item) => sum + (item.product.sellingPrice * item.quantity), 0);
        const delivery = 0; // FREE for demo
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

        const newOrder: Order = {
          id: generateOrderId(state.orders),
          customerId: state.currentCustomer.id,
          addressId: state.currentAddress.id,
          items: orderItems,
          subtotal,
          delivery,
          total: subtotal + delivery,
          paymentStatus: 'PAID',
          status: 'ORDER_PLACED',
          date: now,
          trackingEvents: [
            { id: generateId(), orderId: '', status: 'ORDER_PLACED', timestamp: now, message: 'Order Placed' },
            { id: generateId(), orderId: '', status: 'PAYMENT_CONFIRMED', timestamp: now, message: 'Payment Confirmed' }
          ]
        };
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

        set((state) => ({
          orders: [newOrder, ...state.orders],
          cart: [],
          products: updatedProducts
        }));
        
        return newOrder.id;
      },
      
      updateOrderStatus: (orderId, status) => {
        const state = get();
        const order = state.orders.find(o => o.id === orderId);
        if (!order) return;

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
      
      assignDeliveryPartner: (orderId, partnerId) => {
        const state = get();
        const partner = state.deliveryPartners.find(dp => dp.id === partnerId);
        
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

        set((state) => ({
          orders: state.orders.map(o => o.id === orderId ? {
            ...o,
            status: 'CANCELLED',
            trackingEvents: [...o.trackingEvents, newEvent],
            items: o.items.map(i => ({ ...i, itemStatus: 'CANCELLED' }))
          } : o),
          products: updatedProducts
        }));

        if (order.customerId === state.currentCustomer?.id) {
          get().addChatMessage({ sender: 'bot', text: `Your ReLeaf order ${orderId} has been cancelled successfully.`, type: 'text', orderId });
        }
      },
      
      saveNewCustomer: (customerData) => {
        const newCustomer: Customer = {
          id: generateId(),
          name: customerData.name || '',
          phone: customerData.phone || '',
          pincode: customerData.pincode || '',
          addresses: customerData.addresses || []
        };
        set((state) => ({
          customers: [...state.customers, newCustomer],
          currentCustomer: newCustomer
        }));
        return newCustomer;
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
        currentCustomer: null,
        currentAddress: null,
        cart: [],
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

      addDeliveryPartner: (name, phone) => set((state) => ({
        deliveryPartners: [
          ...state.deliveryPartners,
          {
            id: `dp_${Date.now()}`,
            name,
            phone,
            status: 'AVAILABLE',
            activeOrders: 0,
            completedOrders: 0,
            rating: 5.0
          }
        ]
      })),

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
      }))
    }),
    {
      name: 'releaf-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
