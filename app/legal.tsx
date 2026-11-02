import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors } from '../src/theme/colors';
import {
  ShieldCheck,
  FileText,
  RotateCcw,
  Truck,
  ChevronLeft,
  Building2,
  CheckCircle2,
  Lock,
  HeartHandshake,
} from 'lucide-react-native';

type TabKey = 'all' | 'privacy' | 'terms' | 'shipping' | 'refund' | 'company';

export default function LegalScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabKey>('all');

  const openLink = (url: string) => {
    Linking.openURL(url).catch(() => {});
  };

  const shouldShow = (tab: TabKey) => activeTab === 'all' || activeTab === tab;

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>Legal & Policies</Text>
          <Text style={styles.headerSubtitle}>ReLeaf Pads Official Governance</Text>
        </View>
        <View style={{ width: 40 }} />
      </View>

      {/* Filter Tabs */}
      <View style={styles.tabsWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'all' && styles.tabChipActive]}
            onPress={() => setActiveTab('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>All Policies</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'privacy' && styles.tabChipActive]}
            onPress={() => setActiveTab('privacy')}
          >
            <Text style={[styles.tabText, activeTab === 'privacy' && styles.tabTextActive]}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'terms' && styles.tabChipActive]}
            onPress={() => setActiveTab('terms')}
          >
            <Text style={[styles.tabText, activeTab === 'terms' && styles.tabTextActive]}>Terms & Conditions</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'shipping' && styles.tabChipActive]}
            onPress={() => setActiveTab('shipping')}
          >
            <Text style={[styles.tabText, activeTab === 'shipping' && styles.tabTextActive]}>Shipping Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'refund' && styles.tabChipActive]}
            onPress={() => setActiveTab('refund')}
          >
            <Text style={[styles.tabText, activeTab === 'refund' && styles.tabTextActive]}>Refund Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tabChip, activeTab === 'company' && styles.tabChipActive]}
            onPress={() => setActiveTab('company')}
          >
            <Text style={[styles.tabText, activeTab === 'company' && styles.tabTextActive]}>Technology Partner</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Compliance Hero Banner */}
        {activeTab === 'all' && (
          <View style={styles.heroBanner}>
            <View style={styles.heroIconCircle}>
              <ShieldCheck size={32} color={colors.white} />
            </View>
            <Text style={styles.heroTitle}>Trust, Safety & Transparency</Text>
            <Text style={styles.heroDescription}>
              This document outlines the standard operational terms, privacy practices, and consumer protection policies for the ReLeaf Pads Application, formulated in compliance with applicable consumer protection and digital data governance standards.
            </Text>
            <View style={styles.complianceBadgeRow}>
              <View style={styles.complianceBadge}>
                <CheckCircle2 size={14} color={colors.success} />
                <Text style={styles.complianceBadgeText}>Google Play Verified</Text>
              </View>
              <View style={styles.complianceBadge}>
                <Lock size={14} color={colors.darkPurple} />
                <Text style={styles.complianceBadgeText}>256-bit Encrypted</Text>
              </View>
              <View style={styles.complianceBadge}>
                <HeartHandshake size={14} color={colors.primary} />
                <Text style={styles.complianceBadgeText}>Consumer Protected</Text>
              </View>
            </View>
            <Text style={styles.lastUpdatedText}>Effective Date: October 2026</Text>
          </View>
        )}

        {/* SECTION 1: PRIVACY POLICY */}
        {shouldShow('privacy') && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: '#EDE9FE' }]}>
                <ShieldCheck size={22} color="#6D28D9" />
              </View>
              <View style={styles.cardHeaderTexts}>
                <Text style={styles.cardTitle}>Privacy Policy</Text>
                <Text style={styles.cardSubtitle}>How we handle and protect your personal information</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>1. Introduction & Overview</Text>
              <Text style={styles.paragraph}>
                ReLeaf Pads values your trust and is dedicated to preserving your digital privacy. This Privacy Policy details the types of personal data we collect through the ReLeaf Pads Application, how that data is processed, how it is secured, and your rights concerning your personal information.
              </Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>2. Information We Collect</Text>
              <Text style={styles.paragraph}>
                To facilitate on-demand sanitary pad delivery and provide prompt customer assistance, we collect only necessary information:
              </Text>
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldText}>Identity & Contact Details: </Text>
                    Full name, delivery address, postal pincode, and mobile telephone number.
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldText}>Precise & Approximate Location: </Text>
                    With your active consent, the application captures foreground GPS location coordinates strictly to pinpoint your doorstep for rapid dispatch, calculate delivery distance, and allow assigned delivery partners to fulfill your order. Location data is never tracked in the background when the app is closed.
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldText}>Transaction References: </Text>
                    Order summaries, purchase timestamps, payment statuses, and transaction reference identifiers issued by our payment processor. We do not store sensitive payment card numbers, CVVs, or UPI passwords on our servers.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>3. Purpose & Use of Data</Text>
              <Text style={styles.paragraph}>Your collected data is utilized exclusively for:</Text>
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>Fulfilling and delivering urgent sanitary pad orders to your specified address.</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>Assigning closest delivery personnel and facilitating route navigation.</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>Dispatching real-time order tracking updates and automated digital invoices via WhatsApp and SMS.</Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>Responding to customer support inquiries and resolving delivery issues.</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>4. Third-Party Service Providers</Text>
              <Text style={styles.paragraph}>
                We partner with trusted, industry-standard third-party services that adhere to stringent security measures:
              </Text>
              <View style={styles.bulletList}>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldText}>Razorpay Payment Gateway: </Text>
                    Handles online payments using PCI-DSS certified encryption standards.
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldText}>WhatsApp Business API: </Text>
                    Sends real-time order confirmation, delivery assignment notifications, and customer service messages.
                  </Text>
                </View>
                <View style={styles.bulletItem}>
                  <Text style={styles.bulletDot}>•</Text>
                  <Text style={styles.bulletText}>
                    <Text style={styles.boldText}>Mapping & Geolocation Services: </Text>
                    Calculates delivery distances and routes for delivery partners.
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>5. Data Security & Storage</Text>
              <Text style={styles.paragraph}>
                All transmissions between the ReLeaf Pads Application and our servers are encrypted via Transport Layer Security (TLS/HTTPS). Stored database records are protected by strict role-based access controls and industry-standard firewalls.
              </Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>6. User Data Retention & Deletion Rights</Text>
              <Text style={styles.paragraph}>
                You retain complete control over your personal data. You have the right to request access to your stored records or request complete deletion of your account and personal identifiers at any time.
              </Text>
              <Text style={styles.paragraph}>
                To request data deletion, please email our support team at <Text style={styles.linkText} onPress={() => openLink('mailto:support@releafpads.in')}>support@releafpads.in</Text> with your registered mobile phone number. Data deletion requests are verified and processed within 7 business days, excluding records mandated by statutory taxation laws.
              </Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>7. Children's Privacy</Text>
              <Text style={styles.paragraph}>
                The ReLeaf Pads Application is intended for general audience adult users or individuals with parental guidance. We do not knowingly solicit or collect personally identifiable data from minors under 13 years of age.
              </Text>
            </View>
          </View>
        )}

        {/* SECTION 2: TERMS AND CONDITIONS */}
        {shouldShow('terms') && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: '#E0F2FE' }]}>
                <FileText size={22} color="#0284C7" />
              </View>
              <View style={styles.cardHeaderTexts}>
                <Text style={styles.cardTitle}>Terms & Conditions</Text>
                <Text style={styles.cardSubtitle}>General terms governing product purchases and services</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>1. Acceptance of Agreement</Text>
              <Text style={styles.paragraph}>
                By accessing, browsing, or placing an order through the ReLeaf Pads Application, you agree to be bound by these Terms and Conditions and our Privacy Policy. If you do not agree with any portion of these terms, please discontinue use of the application.
              </Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>2. Service Eligibility & User Account</Text>
              <Text style={styles.paragraph}>
                You represent and warrant that the mobile number and address information you provide are authentic and accurate. Maintaining valid contact details is essential for proper order delivery and verification.
              </Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>3. Pricing & Product Descriptions</Text>
              <Text style={styles.paragraph}>
                All prices displayed within the application are in Indian Rupees (INR) and are inclusive of applicable goods and services taxes (GST). We strive to ensure product images, absorption capacities, and pack counts are described accurately. Prices and promotional discounts are subject to change without prior notice.
              </Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>4. Order Confirmation & Fulfillment</Text>
              <Text style={styles.paragraph}>
                Orders placed through the application constitute an offer to purchase. ReLeaf Pads reserves the right to accept or decline any order based on stock availability, delivery personnel capacity, or non-serviceable pincode constraints.
              </Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>5. Intellectual Property Rights</Text>
              <Text style={styles.paragraph}>
                All content, trademarks, graphics, UI design, logos, and software architectures featured in the ReLeaf Pads Application are proprietary properties of their respective owners and are protected by applicable intellectual property regulations.
              </Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>6. Governing Law & Jurisdiction</Text>
              <Text style={styles.paragraph}>
                These Terms and Conditions shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising in connection with the application shall be subject to the exclusive jurisdiction of the competent courts in Mysore, Karnataka.
              </Text>
            </View>
          </View>
        )}

        {/* SECTION 3: SHIPPING & DELIVERY POLICY */}
        {shouldShow('shipping') && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: '#DCFCE7' }]}>
                <Truck size={22} color="#16A34A" />
              </View>
              <View style={styles.cardHeaderTexts}>
                <Text style={styles.cardTitle}>Shipping & Delivery Policy</Text>
                <Text style={styles.cardSubtitle}>Doorstep delivery timelines and service coverage</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>1. Serviceable Areas & Pincodes</Text>
              <Text style={styles.paragraph}>
                ReLeaf Pads operates dedicated rapid delivery within designated serviceable postal pincodes in Mysore and surrounding municipal territories. The application automatically checks your pincode during order placement to verify fulfillment availability.
              </Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>2. Delivery Timelines</Text>
              <Text style={styles.paragraph}>
                Standard on-demand orders are dispatched swiftly following order confirmation. While our goal is rapid doorstep delivery, actual delivery times may fluctuate depending on weather conditions, traffic density, and order volume.
              </Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>3. Contactless & Safe Delivery</Text>
              <Text style={styles.paragraph}>
                Our delivery personnel adhere to hygienic handling standards. Customers can specify doorstep drop-off instructions or communicate directly with the delivery partner once assigned.
              </Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>4. Delivery Verification</Text>
              <Text style={styles.paragraph}>
                Upon arrival, delivery is marked complete in the system. If the recipient is unavailable at the designated address, our delivery partner will attempt to contact the customer via phone before marking the status.
              </Text>
            </View>
          </View>
        )}

        {/* SECTION 4: REFUND & CANCELLATION POLICY */}
        {shouldShow('refund') && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.cardIconBox, { backgroundColor: '#FEE2E2' }]}>
                <RotateCcw size={22} color="#DC2626" />
              </View>
              <View style={styles.cardHeaderTexts}>
                <Text style={styles.cardTitle}>Refund & Cancellation Policy</Text>
                <Text style={styles.cardSubtitle}>Hygiene safety guidelines and return resolutions</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>1. Sanitary & Hygiene Product Standards</Text>
              <Text style={styles.paragraph}>
                Due to the intimate, sterile, and personal hygiene nature of sanitary pads, items once delivered and unsealed cannot be returned or restocked under any circumstance for public health and safety considerations.
              </Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>2. Order Cancellations</Text>
              <Text style={styles.paragraph}>
                Customers may cancel an order prior to dispatch by contacting support or before the order status transitions to active delivery. Once an order has been picked up by a delivery partner, cancellation is no longer possible.
              </Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>3. Damaged or Defective Deliveries</Text>
              <Text style={styles.paragraph}>
                In the rare instance that a delivered package arrives damaged, tampered with, or defective, please contact our support team within 24 hours of delivery with photographic evidence. Upon swift verification, we will issue a free replacement or initiate a full refund.
              </Text>
            </View>

            <View style={styles.sectionBlock}>
              <Text style={styles.subHeading}>4. Refund Processing Timeframe</Text>
              <Text style={styles.paragraph}>
                Approved refunds are processed through the original payment method (Razorpay / UPI / Net Banking) within 5 to 7 business days, in adherence with banking settlement guidelines.
              </Text>
            </View>
          </View>
        )}

        {/* LEAST AND LAST CARD: POWERED BY NAVABHARATH TECHNOLOGIES */}
        {shouldShow('company') && (
          <View style={[styles.card, styles.companyCard]}>
            <View style={styles.companyCardHeader}>
              <View style={styles.logoContainer}>
                <Image
                  source={require('../assets/navabharath_logo.png')}
                  style={styles.companyLogo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.companyTitleContainer}>
                <Text style={styles.poweredBySub}>ENGINEERING EXCELLENCE</Text>
                <Text style={styles.companyMainTitle}>Powered By Navabharath Technologies</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <Text style={styles.companyDescription}>
              Navabharath Technologies is a premier enterprise digital solutions and software engineering firm. We architect secure, highly scalable, and user-centric mobile and cloud ecosystems tailored to modern commerce, healthcare logistics, and rapid on-demand fulfillment.
            </Text>

            <View style={styles.companyHighlightsGrid}>
              <View style={styles.highlightItem}>
                <ShieldCheck size={18} color={colors.darkPurple} />
                <Text style={styles.highlightText}>Enterprise-Grade Security</Text>
              </View>
              <View style={styles.highlightItem}>
                <CheckCircle2 size={18} color={colors.darkPurple} />
                <Text style={styles.highlightText}>High Availability Architecture</Text>
              </View>
              <View style={styles.highlightItem}>
                <Lock size={18} color={colors.darkPurple} />
                <Text style={styles.highlightText}>Data Privacy & Protection</Text>
              </View>
              <View style={styles.highlightItem}>
                <Building2 size={18} color={colors.darkPurple} />
                <Text style={styles.highlightText}>Continuous Innovation</Text>
              </View>
            </View>

            <View style={styles.companyFooterNotice}>
              <Text style={styles.copyrightNotice}>
                © {new Date().getFullYear()} Navabharath Technologies. All Rights Reserved.
              </Text>
              <Text style={styles.applicationNotice}>
                Designed, Engineered & Maintained for ReLeaf Pads
              </Text>
            </View>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.softPurple,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.mutedText,
    marginTop: 2,
  },
  tabsWrapper: {
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingVertical: 8,
  },
  tabsContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.softPurple,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabChipActive: {
    backgroundColor: colors.darkPurple,
    borderColor: colors.darkPurple,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.text,
  },
  tabTextActive: {
    color: colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  heroBanner: {
    backgroundColor: colors.darkPurple,
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: colors.darkPurple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  heroIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.white,
    textAlign: 'center',
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 13,
    color: '#F3E8FF',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 14,
  },
  complianceBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 12,
  },
  complianceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
    gap: 6,
  },
  complianceBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  lastUpdatedText: {
    fontSize: 11,
    color: '#DDD6FE',
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  cardIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHeaderTexts: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  cardSubtitle: {
    fontSize: 12,
    color: colors.mutedText,
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 16,
  },
  sectionBlock: {
    marginBottom: 16,
  },
  subHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.darkPurple,
    marginBottom: 6,
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.text,
    marginBottom: 8,
  },
  bulletList: {
    gap: 6,
    marginTop: 4,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletDot: {
    fontSize: 14,
    color: colors.darkPurple,
    lineHeight: 20,
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colors.text,
  },
  boldText: {
    fontWeight: '700',
    color: colors.text,
  },
  linkText: {
    color: colors.darkPurple,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  // Company Card (The Least & Last Card)
  companyCard: {
    borderColor: '#D8B4E2',
    backgroundColor: '#FCFAFD',
    marginTop: 8,
  },
  companyCardHeader: {
    alignItems: 'center',
    gap: 10,
    paddingTop: 8,
  },
  logoContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  companyLogo: {
    width: 220,
    height: 160,
  },
  companyTitleContainer: {
    alignItems: 'center',
  },
  poweredBySub: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.mutedText,
    letterSpacing: 2,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  companyMainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F2942',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  companyDescription: {
    fontSize: 13,
    lineHeight: 20,
    color: colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  companyHighlightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  highlightItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.white,
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  highlightText: {
    flex: 1,
    fontSize: 11,
    fontWeight: '600',
    color: colors.text,
  },
  companyFooterNotice: {
    alignItems: 'center',
    marginTop: 18,
    gap: 4,
  },
  copyrightNotice: {
    fontSize: 11,
    color: colors.mutedText,
    fontWeight: '600',
  },
  applicationNotice: {
    fontSize: 11,
    color: colors.darkPurple,
    fontStyle: 'italic',
  },
});
