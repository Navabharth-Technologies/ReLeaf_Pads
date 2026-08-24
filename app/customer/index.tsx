import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Image, Linking } from 'react-native';
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
    products, addToCart, updateCartQuantity, cart, clearCart,
    customers, currentCustomer, setCurrentCustomer,
    currentAddress, setCurrentAddress, saveNewCustomer, createOrder,
    orders, deliveryPartners,
    coupons, appliedCoupon, applyCoupon, removeCoupon, getCartTotal
  } = useStore();

  const [inputText, setInputText] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [tempCustomer, setTempCustomer] = useState<Partial<Customer>>({});
  const [tempAddress, setTempAddress] = useState<Partial<Address>>({});
  const flatListRef = useRef<FlatList>(null);

  // Find active order for the current customer
  const activeOrder = currentCustomer
    ? orders.find(o => o.customerId === currentCustomer.id && o.status !== 'DELIVERED' && o.status !== 'CANCELLED')
    : null;

  const activePartner = activeOrder?.deliveryPartnerId ? deliveryPartners.find(dp => dp.id === activeOrder.deliveryPartnerId) : null;

  useEffect(() => {
    // When returning from address form, chatState is set to PAYMENT.
    // If the last message isn't already the checkout message, add it.
    if (chatState === 'PAYMENT') {
      const messages = useStore.getState().chatMessages;
      const lastMsg = messages[messages.length - 1];
      if (lastMsg?.type !== 'checkout') {
        addChatMessage({
          sender: 'bot',
          text: 'Location & details confirmed! 📍\n\nPlease select a payment method to complete your order:',
          type: 'checkout'
        });
      }
    }
  }, [chatState]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    const text = inputText.trim();

    addChatMessage({ sender: 'user', text, type: 'text' });
    setInputText('');

    setTimeout(() => {
      processStatefulResponse(text);
    }, 800);
  };

  const handleTextChange = (text: string) => {
    if (chatState === 'CHECKING_PINCODE') {
      const numeric = text.replace(/[^0-9]/g, '');
      setInputText(numeric.slice(0, 6));
    } else if (chatState === 'COLLECTING_CUSTOMER_DETAILS') {
      let filtered = text.replace(/[^0-9]/g, '');
      filtered = filtered.replace(/^[^6-9]+/, '');
      filtered = filtered.replace(/(.)\1{3,}/g, '$1$1$1');
      setInputText(filtered.slice(0, 10));
    } else if (chatState === 'COLLECTING_CUSTOMER_DETAILS_NAME') {
      let filtered = text.replace(/[^a-zA-Z\s]/g, '');
      filtered = filtered.replace(/(.)\1{3,}/gi, '$1$1$1');
      setInputText(filtered);
    } else {
      setInputText(text);
    }
  };

  const processStatefulResponse = async (text: string) => {
    const lowerText = text.toLowerCase();
    const currentState = useStore.getState().chatState;

    if (currentState === 'CHECKING_PINCODE') {
      const pin = text.trim();
      if (SERVICEABLE_PINCODES.includes(pin)) {
        useStore.setState({ tempCustomer: { pincode: pin } });
        addChatMessage({
          sender: 'bot',
          text: 'Great! 🎉 We deliver to this location.\n\nPlease enter your 10-digit mobile number so we can reach you.',
          type: 'text'
        });
        setChatState('COLLECTING_CUSTOMER_DETAILS');
      } else {
        addChatMessage({
          sender: 'bot',
          text: "We're sorry! 💚\n\nAt the moment, ReLeaf Pads offers direct delivery only within Mysore.\n\nWe're working towards expanding our delivery coverage.\n\nYou can still explore our complete range and place your order through our official website.",
          type: 'link',
          linkText: 'Visit ReLeaf Website',
          linkUrl: 'https://www.releafpads.in/'
        });
        setChatState('WELCOME');
      }
      return;
    }

    // Handle phone number input
    if (currentState === 'COLLECTING_CUSTOMER_DETAILS') {
      const phoneStr = text.trim();
      const isValidPhone = /^[6-9]\d{9}$/.test(phoneStr) && !/(.)\1{3}/.test(phoneStr);

      if (isValidPhone) {
        
        try {
          const res = await fetch('https://releaf-pads-backend.onrender.com/api/customers');
          if (res.ok) {
            const data = await res.json();
            useStore.setState({ customers: data });
          }
        } catch (e) {
          console.error('Failed to sync customers before login:', e);
        }

        const latestCustomers = useStore.getState().customers;
        const existing = latestCustomers.find(c => c.phone === phoneStr);
        const savedPin = useStore.getState().tempCustomer?.pincode || '570001';
        useStore.setState((state) => ({ tempCustomer: { ...state.tempCustomer, phone: phoneStr, name: existing?.name || '' } }));

        if (existing) {
          useStore.getState().setCurrentCustomer(existing);
          if (existing.addresses && existing.addresses.length > 0) {
            addChatMessage({
              sender: 'bot',
              text: `Welcome back, ${existing.name}! 💚\n\nPlease select your delivery location:`,
              type: 'address_selection',
              existingAddresses: existing.addresses
            });
          } else {
            addChatMessage({
              sender: 'bot',
              text: `Welcome back, ${existing.name}! 💚\n\nPlease provide your delivery details to get started.`,
              type: 'location_prompt',
              pincode: savedPin
            });
          }
          setChatState('WAITING_FOR_LOCATION');
        } else {
          addChatMessage({
            sender: 'bot',
            text: 'Thanks! What is your full name?',
            type: 'text'
          });
          setChatState('COLLECTING_CUSTOMER_DETAILS_NAME');
        }
      } else {
        addChatMessage({
          sender: 'bot',
          text: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9. The same digit cannot repeat continuously more than 3 times.',
          type: 'text'
        });
      }
      return;
    }

    if (currentState === 'COLLECTING_CUSTOMER_DETAILS_NAME') {
      const nameStr = text.trim();
      const savedPin = useStore.getState().tempCustomer?.pincode || '570001';
      useStore.setState((state) => ({ tempCustomer: { ...state.tempCustomer, name: nameStr } }));

      addChatMessage({
        sender: 'bot',
        text: `Nice to meet you, ${nameStr}! 🌿\n\nPlease provide your delivery details to get started.`,
        type: 'location_prompt',
        pincode: savedPin
      });
      setChatState('WAITING_FOR_LOCATION');
      return;
    }

    // Legacy states can be ignored as address-form handles them now
    if (['COLLECTING_ADDRESS', 'ADDRESS_CONFIRMATION'].includes(currentState)) {
      showOrderSummary();
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
      const state = useStore.getState();
      const currentCustomer = state.currentCustomer;
      const orders = state.orders;
      const deliveryPartners = state.deliveryPartners;
      const activeOrder = currentCustomer ? orders.find(o => o.customerId === currentCustomer.id && o.status !== 'DELIVERED' && o.status !== 'CANCELLED') : null;

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
      const latestCart = useStore.getState().cart;
      if (latestCart.length > 0) {
        addChatMessage({ sender: 'bot', text: "Here is your cart:", type: 'cart' });
      } else {
        addChatMessage({ sender: 'bot', text: "Your cart is empty. Would you like to see our products?", type: 'text' });
      }
    } else {
      const matchedCoupon = useStore.getState().coupons.find(c => lowerText.toUpperCase().includes(c.code.toUpperCase()));
      if (matchedCoupon) {
        const res = useStore.getState().applyCoupon(matchedCoupon.code);
        if (res.success) {
          addChatMessage({ sender: 'bot', text: `Coupon ${matchedCoupon.code} added to cart. 🛒`, type: 'text' });
        } else {
          addChatMessage({ sender: 'bot', text: res.message, type: 'text' });
        }
      } else {
        addChatMessage({
          sender: 'bot',
          text: "I can help you shop, track an order, or check delivery.",
          type: 'text'
        });
      }
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

          {item.type === 'add_to_cart_success' && (
            <TouchableOpacity
              style={styles.inlineCheckoutBtn}
              onPress={() => {
                addChatMessage({ sender: 'user', text: 'View Cart & Checkout' });
                setTimeout(() => processStatefulResponse('cart'), 100);
              }}
            >
              <Text style={styles.inlineCheckoutBtnText}>View Cart & Checkout ➔</Text>
            </TouchableOpacity>
          )}

          {item.type === 'location_prompt' && (
            <View style={{ marginTop: 12, flexDirection: 'column', gap: 10 }}>
              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 0, paddingVertical: 12 }]}
                onPress={() => router.push(`/customer/location?pincode=${item.pincode || useStore.getState().tempCustomer?.pincode || '570001'}`)}
              >
                <Text style={styles.primaryBtnText}>📍 Use Current Location</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 0, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primary, paddingVertical: 12 }]}
                onPress={() => router.push(`/customer/address-form`)}
              >
                <Text style={[styles.primaryBtnText, { color: colors.primary }]}>📝 Add New Address Manually</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.type === 'address_selection' && item.existingAddresses && (
            <View style={{ marginTop: 12 }}>
              <TouchableOpacity
                style={[styles.primaryBtn, { marginTop: 0, paddingVertical: 12, marginBottom: 12 }]}
                onPress={() => router.push(`/customer/location?pincode=${useStore.getState().tempCustomer?.pincode || '570001'}`)}
              >
                <Text style={styles.primaryBtnText}>📍 Use Current Location</Text>
              </TouchableOpacity>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
                {item.existingAddresses.map((addr, idx) => (
                  <View key={idx} style={styles.addressCard}>
                    <View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                        <Text style={{ fontWeight: '700', color: colors.darkPurple, fontSize: 14 }}>
                          {addr.addressType === 'HOME' ? '🏠 ' : addr.addressType === 'WORK' ? '🏢 ' : '📍 '}{addr.addressType || 'Saved Address'}
                        </Text>
                      </View>
                      <Text style={{ color: colors.text, marginBottom: 12, fontSize: 13, lineHeight: 18 }} numberOfLines={3}>
                        {addr.houseNumber}, {addr.buildingName ? addr.buildingName + ', ' : ''}{addr.street}, {addr.area}
                      </Text>
                    </View>
                    <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                      <TouchableOpacity 
                        style={[styles.primaryBtn, { marginTop: 0, paddingVertical: 10 }]} 
                        onPress={() => {
                          useStore.getState().setCurrentAddress(addr);
                          addChatMessage({ sender: 'user', text: `Deliver to ${addr.addressType || 'Saved Address'}` });
                          setTimeout(() => showOrderSummary(), 500);
                        }}
                      >
                        <Text style={styles.primaryBtnText}>Deliver Here</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </ScrollView>
              
              <TouchableOpacity 
                style={[styles.primaryBtn, { marginTop: 12, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primary, paddingVertical: 12 }]} 
                onPress={() => router.push(`/customer/address-form`)}
              >
                <Text style={[styles.primaryBtnText, { color: colors.primary }]}>➕ Add New Address</Text>
              </TouchableOpacity>
            </View>
          )}

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
                        addChatMessage({ sender: 'bot', text: `Added ${p.packSize} to your cart. 🛒`, type: 'add_to_cart_success' });
                      }}>
                        <Text style={styles.btnText}>Add to Cart</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )
              })}
            </ScrollView>
          )}

          {item.type === 'cart' && cart.length > 0 && (
            <View style={styles.cardBlock}>
              {cart.map(c => (
                <View key={c.product.id} style={styles.row}>
                  <Text>{c.quantity}x {c.product.packSize}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ marginRight: 12 }}>₹{c.product.sellingPrice * c.quantity}</Text>
                    <TouchableOpacity onPress={() => updateCartQuantity(c.product.id, 0)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                      <Text style={{ color: 'red', fontWeight: 'bold', fontSize: 16 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <View style={styles.divider} />
              <Text style={styles.boldText}>Coupons & Offers</Text>
              {appliedCoupon ? (
                <View style={styles.appliedCouponBox}>
                  <Text style={styles.appliedCouponText}>✓ {appliedCoupon.code} Applied</Text>
                  <TouchableOpacity onPress={removeCoupon}><Text style={styles.removeCouponText}>Remove</Text></TouchableOpacity>
                </View>
              ) : (
                <View>
                  <View style={styles.couponInputContainer}>
                    <TextInput
                      style={styles.couponInput}
                      placeholder="Enter coupon code"
                      value={couponInput}
                      onChangeText={setCouponInput}
                      autoCapitalize="characters"
                    />
                    <TouchableOpacity
                      style={styles.couponApplyBtn}
                      onPress={() => {
                        if (!couponInput.trim()) return;
                        const res = applyCoupon(couponInput.trim().toUpperCase());
                        if (res.success) {
                          setCouponInput('');
                        } else {
                          addChatMessage({ sender: 'bot', text: res.message, type: 'text' });
                        }
                      }}
                    >
                      <Text style={styles.couponApplyBtnText}>Apply</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              <View style={styles.divider} />

              <View style={styles.row}>
                <Text>Subtotal</Text>
                <Text>₹{getCartTotal().subtotal}</Text>
              </View>
              {appliedCoupon && (
                <View style={styles.row}>
                  <Text style={{ color: colors.primary }}>Coupon ({appliedCoupon.code})</Text>
                  <Text style={{ color: colors.primary }}>-₹{getCartTotal().discountAmount.toFixed(2)}</Text>
                </View>
              )}
              <View style={styles.row}>
                <Text>Delivery</Text>
                <Text>FREE</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={styles.boldText}>Total</Text>
                <Text style={styles.boldText}>₹{getCartTotal().total.toFixed(2)}</Text>
              </View>

              <TouchableOpacity style={styles.primaryBtn} onPress={() => {
                if (appliedCoupon) {
                  addChatMessage({ sender: 'bot', text: `✨ Great! ${appliedCoupon.code} has been applied.\n\nYou saved ₹${getCartTotal().discountAmount.toFixed(2)} on this order. 💚`, type: 'text' });
                }
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
                <Text style={styles.paymentBtnText}>💙 Razorpay Demo (Pay ₹{getCartTotal().total.toFixed(2)})</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.paymentBtn} onPress={() => handlePayment('whatsapp')}>
                <Text style={styles.paymentBtnText}>🟢 WhatsApp Payment Demo (Pay ₹{getCartTotal().total.toFixed(2)})</Text>
              </TouchableOpacity>
            </View>
          )}

          {item.type === 'link' && (
            <TouchableOpacity style={styles.linkCard} onPress={() => item.linkUrl && Linking.openURL(item.linkUrl)}>
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
          <TouchableOpacity style={styles.qrBtn} onPress={() => { addChatMessage({ sender: 'user', text: 'Yes, Use This Address' }); processStatefulResponse('yes'); }}><Text style={styles.qrText}>Yes, Use This Address</Text></TouchableOpacity>
          <TouchableOpacity style={styles.qrBtn} onPress={() => { addChatMessage({ sender: 'user', text: 'Add New Address' }); processStatefulResponse('no'); }}><Text style={styles.qrText}>Add New Address</Text></TouchableOpacity>
        </View>
      )}

      <View style={styles.quickReplies}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity style={styles.qrBtn} onPress={() => { setInputText('🛍 Shop Products'); setTimeout(handleSend, 10); }}><Text style={styles.qrText}>🛍 Shop</Text></TouchableOpacity>
          <TouchableOpacity style={styles.qrBtn} onPress={() => { setInputText('📦 Track My Order'); setTimeout(handleSend, 10); }}><Text style={styles.qrText}>📦 Track</Text></TouchableOpacity>
          <TouchableOpacity style={styles.qrBtn} onPress={() => router.push('/customer/orders')}><Text style={styles.qrText}>📜 My Orders</Text></TouchableOpacity>
          <TouchableOpacity style={styles.qrBtn} onPress={() => { setInputText('🛒 My Cart'); setTimeout(handleSend, 10); }}><Text style={styles.qrText}>🛒 Cart</Text></TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Message ReLeaf Pads..."
          value={inputText}
          onChangeText={handleTextChange}
          onSubmitEditing={handleSend}
          keyboardType={['CHECKING_PINCODE', 'COLLECTING_CUSTOMER_DETAILS'].includes(chatState) ? 'number-pad' : 'default'}
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
  addressCard: { width: 220, backgroundColor: colors.white, borderRadius: 12, padding: 12, marginRight: 12, borderWidth: 1, borderColor: colors.border, justifyContent: 'space-between' },
  productCard: { width: 140, backgroundColor: colors.white, borderRadius: 12, padding: 10, marginRight: 12, borderWidth: 1, borderColor: colors.border, justifyContent: 'space-between' },
  img: { height: 80, borderRadius: 8, marginBottom: 8 },
  pName: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  pPrice: { fontSize: 14, fontWeight: '700', color: colors.darkPurple, marginBottom: 8 },
  btn: { backgroundColor: colors.softPurple, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  btnText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  outOfStockText: { color: 'red', fontSize: 12, fontWeight: '600', textAlign: 'center', marginVertical: 8 },
  cardBlock: { marginTop: 12, backgroundColor: colors.background, borderRadius: 8, padding: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 },
  appliedCouponBox: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: colors.softPurple, padding: 10, borderRadius: 8, marginTop: 8 },
  appliedCouponText: { color: colors.primary, fontWeight: '600' },
  removeCouponText: { color: 'red', fontWeight: '500' },
  viewOffersBtn: { padding: 10, borderWidth: 1, borderColor: colors.primary, borderRadius: 8, marginTop: 8, alignItems: 'center' },
  viewOffersBtnInline: { marginTop: 12, alignItems: 'center' },
  viewOffersText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  couponInputContainer: { flexDirection: 'row', marginTop: 8 },
  couponInput: { flex: 1, borderWidth: 1, borderColor: colors.border, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, fontSize: 14, backgroundColor: colors.white },
  couponApplyBtn: { backgroundColor: colors.primary, justifyContent: 'center', paddingHorizontal: 16, borderRadius: 8, marginLeft: 8 },
  couponApplyBtnText: { color: colors.white, fontWeight: '600' },
  couponCard: { width: 220, backgroundColor: colors.white, borderRadius: 12, padding: 12, marginRight: 12, borderWidth: 1, borderColor: colors.primary, justifyContent: 'space-between' },
  couponCode: { fontSize: 16, fontWeight: '700', color: colors.primary, marginBottom: 4 },
  couponDesc: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  couponSubDesc: { fontSize: 12, color: colors.mutedText, marginBottom: 8 },
  couponMin: { fontSize: 11, color: colors.mutedText, marginBottom: 12, fontStyle: 'italic' },
  primaryBtn: { backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  primaryBtnText: { color: colors.white, fontWeight: '600' },
  boldText: { fontWeight: '700', marginBottom: 12 },
  paymentBtn: { padding: 12, borderWidth: 1, borderColor: colors.border, borderRadius: 8, marginBottom: 8, alignItems: 'center' },
  paymentBtnText: { fontWeight: '600', color: colors.text },
  linkCard: { marginTop: 8, backgroundColor: colors.softPurple, padding: 10, borderRadius: 8, alignItems: 'center' },
  linkText: { color: colors.primary, fontWeight: '600' },
  inlineCheckoutBtn: { marginTop: 12, backgroundColor: colors.primary, paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' },
  inlineCheckoutBtnText: { color: colors.white, fontWeight: '600', fontSize: 14 }
});
