import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { colors } from '../../src/theme/colors';
import { useStore } from '../../src/store/useStore';
import { Send, Truck, ChevronRight } from 'lucide-react-native';
import { ChatMessage, Customer, Address } from '../../src/store/types';
import { SERVICEABLE_PINCODES } from '../../src/store/mockData';
import { useRouter } from 'expo-router';

export default function CustomerChatScreen() {
  const router = useRouter();
  const { 
    chatMessages, addChatMessage, chatState, setChatState, 
    products, addToCart, cart, clearCart, 
    customers, currentCustomer, setCurrentCustomer,
    currentAddress, setCurrentAddress, saveNewCustomer, createOrder,
    orders, deliveryPartners
  } = useStore();
  
  const [inputText, setInputText] = useState('');
  const [tempCustomer, setTempCustomer] = useState<Partial<Customer>>({});
  const [tempAddress, setTempAddress] = useState<Partial<Address>>({});
  const flatListRef = useRef<FlatList>(null);

  // Find active order for the current customer
  const activeOrder = currentCustomer 
    ? orders.find(o => o.customerId === currentCustomer.id && o.status !== 'DELIVERED' && o.status !== 'CANCELLED')
    : null;

  const activePartner = activeOrder?.deliveryPartnerId ? deliveryPartners.find(dp => dp.id === activeOrder.deliveryPartnerId) : null;

  const handleSend = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();
    
    addChatMessage({ sender: 'user', text, type: 'text' });
    setInputText('');

    setTimeout(() => {
      processStatefulResponse(text);
    }, 800);
  };

  const processStatefulResponse = (text: string) => {
    const lowerText = text.toLowerCase();
    const currentState = useStore.getState().chatState;

    if (currentState === 'CHECKING_PINCODE') {
      if (SERVICEABLE_PINCODES.includes(text)) {
        setTempCustomer({ ...tempCustomer, pincode: text });
        setTempAddress({ ...tempAddress, pincode: text });
        
        addChatMessage({
          sender: 'bot',
          text: "Great! We deliver to your area. 💚\n\nAre you an existing customer? Please enter your 10-digit mobile number.",
          type: 'text'
        });
        setChatState('COLLECTING_CUSTOMER_DETAILS');
      } else {
        addChatMessage({
          sender: 'bot',
          text: "Thank you for your interest in ReLeaf Pads. 💚\n\nAt the moment, our direct delivery service is available only within Mysore.\n\nYou can explore our products and place your order through our official website.",
          type: 'link',
          linkText: 'Visit ReLeaf Website 🌿',
          linkUrl: 'https://www.releafpads.in/'
        });
        setChatState('WELCOME');
      }
      return;
    }

    if (currentState === 'COLLECTING_CUSTOMER_DETAILS') {
      const existing = customers.find(c => c.phone === text);
      if (existing) {
        setCurrentCustomer(existing);
        if (existing.addresses.length > 0) {
          const addr = existing.addresses[0];
          setCurrentAddress(addr);
          addChatMessage({
            sender: 'bot',
            text: `Welcome back, ${existing.name}! 💚\n\nWe found your saved delivery address:\n${addr.houseNo}, ${addr.street}, ${addr.city} - ${addr.pincode}\n\nWould you like to use this address?`,
            type: 'text'
          });
          setChatState('ADDRESS_CONFIRMATION');
        } else {
          addChatMessage({
            sender: 'bot',
            text: `Welcome back, ${existing.name}! 💚\nPlease enter your complete delivery address (House No, Street, Landmark).`,
            type: 'text'
          });
          setChatState('COLLECTING_ADDRESS');
        }
      } else {
        setTempCustomer({ ...tempCustomer, phone: text });
        addChatMessage({
          sender: 'bot',
          text: "What name should we use for your delivery? 😊",
          type: 'text'
        });
        setChatState('COLLECTING_CUSTOMER_DETAILS_NAME');
      }
      return;
    }

    if (currentState === 'COLLECTING_CUSTOMER_DETAILS_NAME') {
      setTempCustomer({ ...tempCustomer, name: text });
      setTempAddress({ ...tempAddress, name: text, phone: tempCustomer.phone });
      addChatMessage({
        sender: 'bot',
        text: "Please enter your complete delivery address (House/Flat No, Street/Area, Landmark).",
        type: 'text'
      });
      setChatState('COLLECTING_ADDRESS');
      return;
    }

    if (currentState === 'COLLECTING_ADDRESS') {
      const newAddr = { ...tempAddress, street: text, city: 'Mysore', id: Math.random().toString() } as Address;
      setCurrentAddress(newAddr);
      
      if (!currentCustomer) {
        saveNewCustomer({ ...tempCustomer, addresses: [newAddr] });
      }
      
      showOrderSummary();
      return;
    }

    if (currentState === 'ADDRESS_CONFIRMATION') {
      if (lowerText.includes('yes')) {
        showOrderSummary();
      } else {
        addChatMessage({
          sender: 'bot',
          text: "Please enter your new complete delivery address.",
          type: 'text'
        });
        setChatState('COLLECTING_ADDRESS');
      }
      return;
    }

    // Advanced intent matching
    if (lowerText.includes('hi') || lowerText.includes('hello')) {
      addChatMessage({
        sender: 'bot',
        text: 'Hello! 👋 Welcome to ReLeaf Pads. How can we help you today?',
        type: 'text'
      });
      setChatState('WELCOME');
    } else if (lowerText.includes('product') || lowerText.includes('shop') || lowerText.includes('buy')) {
      addChatMessage({
        sender: 'bot',
        text: 'Here are our available ReLeaf Cotton Sanitary Pad packs:',
        type: 'products'
      });
      setChatState('BROWSING_PRODUCTS');
    } else if (lowerText.includes('track') || lowerText.includes('where is my order') || lowerText.includes('status')) {
      if (activeOrder) {
        let msg = `Your order ${activeOrder.id} is currently: ${activeOrder.status.replace(/_/g, ' ')}. 🌿\n\nWe'll let you know once it progresses.`;
        if (activeOrder.status === 'PREPARING') {
          msg = `Your order ${activeOrder.id} is currently being prepared. 🌿\n\nWe'll let you know once it has been packed and dispatched.`;
        } else if (activeOrder.status === 'OUT_FOR_DELIVERY') {
          const partner = deliveryPartners.find(dp => dp.id === activeOrder.deliveryPartnerId);
          msg = `🚚 Your order is currently out for delivery.\n\nDelivery Partner:\n${partner?.name || 'Assigned Agent'}\n${partner?.phone || ''}`;
        }
        addChatMessage({ sender: 'bot', text: msg, type: 'text' });
      } else {
        const lastOrder = currentCustomer ? orders.find(o => o.customerId === currentCustomer.id) : null;
        if (lastOrder && lastOrder.status === 'DELIVERED') {
          addChatMessage({ sender: 'bot', text: `🌿 Your last order ${lastOrder.id} has been delivered successfully.\n\nThank you for shopping with ReLeaf. 💚`, type: 'text' });
        } else {
          addChatMessage({ sender: 'bot', text: "You don't have any active orders right now. Would you like to shop for products?", type: 'text' });
        }
      }
      setChatState('WELCOME');
    } else if (lowerText.includes('order') || lowerText.includes('history')) {
       router.push('/customer/orders');
    } else if (lowerText.includes('cart')) {
      if (cart.length > 0) {
        addChatMessage({ sender: 'bot', text: "Here is your cart:", type: 'cart' });
      } else {
        addChatMessage({ sender: 'bot', text: "Your cart is empty. Would you like to see our products?", type: 'text' });
      }
    } else {
       addChatMessage({
        sender: 'bot',
        text: "I can help you shop, track an order, or check delivery.",
        type: 'text'
      });
    }
  };

  const showOrderSummary = () => {
    addChatMessage({
      sender: 'bot',
      text: "Here is your order summary. Please select a payment method to complete your order.",
      type: 'checkout'
    });
    setChatState('PAYMENT');
  };

  const handlePayment = (method: string) => {
    addChatMessage({
      sender: 'bot',
      text: "Processing payment...",
      type: 'text'
    });
    
    setTimeout(() => {
      const orderId = createOrder(method);
      addChatMessage({
        sender: 'bot',
        text: `🎉 Order Confirmed!\n\nThank you for choosing ReLeaf Pads. 💚\nYour order has been successfully placed.\n\nOrder ID: ${orderId}\n\nYour order is now being prepared with care.\nWe'll keep you updated right here.`,
        type: 'text'
      });
      setChatState('ORDER_CONFIRMED');
    }, 1500);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isBot = item.sender === 'bot';
    
    return (
      <View style={[styles.messageRow, isBot ? styles.messageRowBot : styles.messageRowUser]}>
        {isBot && (
          <View style={styles.botAvatar}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={{ width: 24, height: 24 }} 
              resizeMode="contain"
            />
          </View>
        )}
        <View style={[styles.messageBubble, isBot ? styles.bubbleBot : styles.bubbleUser]}>
          <Text style={[styles.messageText, isBot ? styles.textBot : styles.textUser]}>
            {item.text}
          </Text>
          
          {item.type === 'products' && (
             <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
               {products.filter(p => p.active).map(p => {
                 const isOut = p.stockStatus === 'OUT_OF_STOCK';
                 return (
                 <View key={p.id} style={styles.productCard}>
                   <View>
                     {p.imageUrl ? (
                       <Image source={{ uri: p.imageUrl }} style={styles.img} />
                     ) : (
                       <View style={[styles.img, { backgroundColor: p.imageFallback }]} />
                     )}
                     <Text style={styles.pName} numberOfLines={2}>{p.name}</Text>
                     <Text style={styles.pPrice}>₹{p.sellingPrice}</Text>
                   </View>
                   {isOut ? (
                     <Text style={styles.outOfStockText}>Currently Out of Stock</Text>
                   ) : (
                     <TouchableOpacity style={styles.btn} onPress={() => {
                       addToCart(p, 1);
                       addChatMessage({ sender: 'bot', text: `Added ${p.packSize} to your cart. 💚`, type: 'cart' });
                     }}>
                       <Text style={styles.btnText}>Add to Cart</Text>
                     </TouchableOpacity>
                   )}
                 </View>
               )})}
             </ScrollView>
          )}

          {item.type === 'cart' && cart.length > 0 && (
             <View style={styles.cardBlock}>
                {cart.map(c => (
                  <View key={c.product.id} style={styles.row}>
                    <Text>{c.quantity}x {c.product.packSize}</Text>
                    <Text>₹{c.product.sellingPrice * c.quantity}</Text>
                  </View>
                ))}
                <TouchableOpacity style={styles.primaryBtn} onPress={() => {
                   addChatMessage({ sender: 'bot', text: "Please enter your 6-digit delivery pincode (Mysore only).", type: 'text' });
                   setChatState('CHECKING_PINCODE');
                }}>
                  <Text style={styles.primaryBtnText}>Proceed to Checkout</Text>
                </TouchableOpacity>
             </View>
          )}

          {item.type === 'checkout' && (
             <View style={styles.cardBlock}>
                <Text style={styles.boldText}>Payment Options (Demo)</Text>
                <TouchableOpacity style={styles.paymentBtn} onPress={() => handlePayment('razorpay')}>
                  <Text style={styles.paymentBtnText}>💙 Razorpay Demo</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.paymentBtn} onPress={() => handlePayment('whatsapp')}>
                  <Text style={styles.paymentBtnText}>🟢 WhatsApp Payment Demo</Text>
                </TouchableOpacity>
             </View>
          )}

          {item.type === 'link' && (
             <TouchableOpacity style={styles.linkCard}>
               <Text style={styles.linkText}>{item.linkText}</Text>
             </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      
      {activeOrder && (
        <TouchableOpacity style={styles.activeOrderCard} onPress={() => router.push(`/customer/tracking`)}>
          <View style={styles.activeOrderContent}>
            <View style={styles.activeOrderLeft}>
              <Truck size={20} color={colors.primary} />
              <View style={styles.activeOrderDetails}>
                <Text style={styles.activeOrderTitle}>Active Order {activeOrder.id}</Text>
                <Text style={styles.activeOrderStatus}>{activeOrder.status.replace(/_/g, ' ')}</Text>
                {activePartner && (
                  <Text style={styles.activeOrderPartner}>{activePartner.name} • {activePartner.phone}</Text>
                )}
              </View>
            </View>
            <ChevronRight size={20} color={colors.primary} />
          </View>
        </TouchableOpacity>
      )}

      <FlatList
        ref={flatListRef}
        data={chatMessages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      
      {chatState === 'ADDRESS_CONFIRMATION' && (
        <View style={styles.quickReplies}>
           <TouchableOpacity style={styles.qrBtn} onPress={() => { addChatMessage({sender:'user', text:'Yes, Use This Address'}); processStatefulResponse('yes'); }}><Text style={styles.qrText}>Yes, Use This Address</Text></TouchableOpacity>
           <TouchableOpacity style={styles.qrBtn} onPress={() => { addChatMessage({sender:'user', text:'Add New Address'}); processStatefulResponse('no'); }}><Text style={styles.qrText}>Add New Address</Text></TouchableOpacity>
        </View>
      )}

      <View style={styles.quickReplies}>
         <ScrollView horizontal showsHorizontalScrollIndicator={false}>
           <TouchableOpacity style={styles.qrBtn} onPress={() => { setInputText('🛍 Shop Products'); setTimeout(handleSend,10); }}><Text style={styles.qrText}>🛍 Shop</Text></TouchableOpacity>
           <TouchableOpacity style={styles.qrBtn} onPress={() => { setInputText('📦 Track My Order'); setTimeout(handleSend,10); }}><Text style={styles.qrText}>📦 Track</Text></TouchableOpacity>
           <TouchableOpacity style={styles.qrBtn} onPress={() => router.push('/customer/orders')}><Text style={styles.qrText}>📜 My Orders</Text></TouchableOpacity>
           <TouchableOpacity style={styles.qrBtn} onPress={() => { setInputText('🛒 My Cart'); setTimeout(handleSend,10); }}><Text style={styles.qrText}>🛒 Cart</Text></TouchableOpacity>
         </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Message ReLeaf Pads..."
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleSend}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Send size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  activeOrderCard: {
    backgroundColor: colors.softPurple,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  activeOrderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  activeOrderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeOrderDetails: {
    marginLeft: 12,
  },
  activeOrderTitle: {
    fontSize: 13,
    color: colors.darkPurple,
    fontWeight: '700',
  },
  activeOrderStatus: {
    fontSize: 15,
    color: colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  activeOrderPartner: {
    fontSize: 12,
    color: colors.mutedText,
    marginTop: 2,
  },
  chatList: { padding: 16, paddingBottom: 20 },
  messageRow: { flexDirection: 'row', marginBottom: 16, alignItems: 'flex-end' },
  messageRowBot: { justifyContent: 'flex-start' },
  messageRowUser: { justifyContent: 'flex-end' },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginTop: 4,
  },
  messageBubble: { maxWidth: '85%', padding: 12, borderRadius: 16 },
  bubbleBot: { backgroundColor: colors.chatBubbleIn, borderBottomLeftRadius: 4 },
  bubbleUser: { backgroundColor: colors.chatBubbleOut, borderBottomRightRadius: 4 },
  messageText: { fontSize: 15, lineHeight: 22 },
  textBot: { color: colors.text },
  textUser: { color: colors.darkPurple },
  inputContainer: { flexDirection: 'row', padding: 12, backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.border, alignItems: 'center' },
  input: { flex: 1, backgroundColor: colors.background, borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15 },
  sendButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  quickReplies: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12 },
  qrBtn: { backgroundColor: colors.white, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, marginRight: 10, borderWidth: 1, borderColor: colors.primary },
  qrText: { color: colors.primary, fontWeight: '500' },
  carousel: { marginTop: 12, marginHorizontal: -12, paddingHorizontal: 12 },
  productCard: { width: 140, backgroundColor: colors.white, borderRadius: 12, padding: 10, marginRight: 12, borderWidth: 1, borderColor: colors.border, justifyContent: 'space-between' },
  img: { height: 80, borderRadius: 8, marginBottom: 8 },
  pName: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  pPrice: { fontSize: 14, fontWeight: '700', color: colors.darkPurple, marginBottom: 8 },
  btn: { backgroundColor: colors.softPurple, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  btnText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  outOfStockText: { color: 'red', fontSize: 12, fontWeight: '600', textAlign: 'center', marginVertical: 8 },
  cardBlock: { marginTop: 12, backgroundColor: colors.background, borderRadius: 8, padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  primaryBtnText: { color: colors.white, fontWeight: '600' },
  boldText: { fontWeight: '700', marginBottom: 12 },
  paymentBtn: { padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  paymentBtnText: { fontWeight: '600', color: colors.text },
  linkCard: { marginTop: 8, backgroundColor: colors.softPurple, padding: 10, borderRadius: 8, alignItems: 'center' },
  linkText: { color: colors.primary, fontWeight: '600' }
});
