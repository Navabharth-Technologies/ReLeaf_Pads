# ReLeaf Pads - Frontend Application Suite

Welcome to the **ReLeaf Pads Frontend Application Suite**, a modern hyperlocal e-commerce and rapid on-demand delivery operations platform designed to streamline customer sanitary pad ordering, store administration, live inventory management, and delivery logistics for eco-friendly, ultra-absorbent sanitary pads and personal hygiene essentials.

The suite consists of three interconnected components:
- 🛒 **Customer Portal**: Browse sanitary pad varieties (Day, Night, Extra-Long wings & panty liners), verify Mysuru PIN-code delivery eligibility, manage shopping cart, capture GPS/manual delivery address, apply coupons, and checkout securely via Razorpay.
- 🏢 **Owner / Admin Portal**: Manage product catalogue and imagery, update MRP and selling prices, track live inventory, assign multiple orders to delivery partners, monitor order status, configure promotional coupons, and review collection reports.
- 🛵 **Delivery Partner Portal**: View assigned delivery manifests in a continuous multi-order FIFO queue, access customer delivery locations, launch turn-by-turn Google Maps navigation with exact coordinates, and update delivery milestones in real time.

---

## 📂 Project Structure

| Component | Path | Technology | Description |
| :--- | :--- | :--- | :--- |
| **Customer Portal** | `./app/customer` | React Native / Expo | Product catalogue, cart, PIN-code check, address selection, checkout, and tracking |
| **Owner / Admin Portal** | `./app/owner` | React Native / Expo | Product catalogue, stock management, multi-order assignment, coupons, and revenue reports |
| **Delivery Partner Portal** | `./app/delivery` | React Native / Expo | Continuous assigned order manifest, customer contact, Google Maps turn-by-turn routing |
| **Legal & Compliance** | `./app/legal.tsx` | React Native / Expo | Google Play compliant Privacy Policy, terms & conditions, refund/shipping policies, and Navabharath branding |
| **Desktop Application** | `./electron` | Electron / Builder | Standalone Windows desktop client for store owner operations |
| **State & Store** | `./src/store` | Zustand / AsyncStorage | Global reactive state management and Azure REST API synchronization |
| **Shared Components** | `./src/components` | React Native | Reusable map components (`Map.native.tsx`, `Map.web.tsx`) and layout elements |

---

## ✨ Core Features

### 🛒 Customer Portal
- **Product Discovery & Cart**
  - Sanitary pad variations: Cotton-soft Regular, XL, XXL Heavy Flow, Extra-Long Night Pads & Eco-Panty Liners
  - Custom pack sizes and combo options with detailed absorption and wing descriptions
  - Real-time cart calculation (subtotal, delivery fee, and coupon deductions)
  - Live stock status badges (`IN_STOCK` / `OUT_OF_STOCK`)
- **Hyperlocal PIN-Code Validation**
  - Serviceable Mysuru PIN-code checks (570001 to 570026)
  - Out-of-area notification with website redirection (https://www.releafpads.in/)
  - Returning customer recognition via mobile number
- **Precision Location Capture**
  - One-click GPS pin drop via device foreground location (`expo-location`)
  - Reverse geocoding via OpenStreetMap Nominatim
  - Structured manual address form (House/Flat No., Street, Landmark, Area)
  - Saved address book for rapid repeat orders
- **Payments & Order Tracking**
  - Seamless Razorpay checkout (UPI, Credit/Debit Cards, Netbanking, Wallets)
  - Background 30-second automated payment reconciliation
  - Live order tracking timeline with timestamps
  - Automated Meta WhatsApp confirmation messages & digital invoices

---

### 🏢 Owner / Admin Portal
- **Catalogue & Inventory Management**
  - Add, edit, or deactivate sanitary pad SKUs
  - Update MRP, selling prices, discounts, and pack counts
  - Upload product images with fallback handling
  - Real-time stock tracking with one-click toggles (`IN_STOCK`, `LOW_STOCK`, `OUT_OF_STOCK`)
- **Order Processing & Fulfilment**
  - Live orders stream with customer details and item breakdown
  - Real-time payment verification indicators (`PAID`, `PENDING`)
  - **Multi-Order Assignment**: Option to assign multiple continuous orders simultaneously to the same delivery partner
  - Clean order status transitions (`CONFIRMED`, `ASSIGNED`, `OUT_FOR_DELIVERY`, `DELIVERED`)
- **Promotional Campaigns & Coupons**
  - Create general discount codes (percentage or flat discount)
  - Create influencer-attributed coupon codes
  - Configure minimum cart value and maximum discount caps
  - Real-time coupon redemption counters
- **Collection & Sales Analytics**
  - Daily and monthly gross collection summaries
  - Successfully paid order metrics
  - Net revenue, discount amounts, and order volume tracking

---

### 🛵 Delivery Partner Portal
- **Secure Authentication**
  - Quick phone-based authentication for verified riders
  - Driver profile and active duty metrics
- **Multi-Order Continuous Manifest Queue**
  - Sequential FIFO order queue: Process deliveries one after the other continuously without offline disturbance
  - Automatic progression to the next assigned order upon marking the current order delivered
  - Customer contact number with direct call trigger
  - Complete item and pack breakdown
- **Turn-by-Turn Navigation**
  - One-click launch of Google Maps navigation
  - Direct routing using customer latitude and longitude coordinates
  - Fallback to structured text address and landmark
- **Proof of Fulfilment**
  - One-click status update marking order as `DELIVERED`
  - Accurate delivered count tracking in both delivery partner and owner dashboards
  - Automatic delivery confirmation message sent to customer via WhatsApp

---

## 🎨 User Experience
- **Modern Hyperlocal E-Commerce UI**
  - Clean, trustworthy, and discreet aesthetic tailored for intimate health and hygiene
  - Smooth animations, soft purple palette (`#B08DBB`, `#82588F`), and responsive layouts
  - Multi-device compatibility (Android mobile & tablet, Web browser, Windows desktop)
- **Optimized Workflows**
  - Rapid PIN-code eligibility verification
  - Returning customer detail auto-fill
  - One-click payment and address confirmation
  - Minimal operational complexity for store owners and delivery personnel

---

## 🚀 Getting Started

### Prerequisites
- Node.js (LTS Version 20.x or higher)
- npm (v10.x or higher)
- Java Development Kit (JDK 17)
- Android Studio & Android SDK (Platform 36, Build-Tools 36.0.0)
- Expo CLI (`npx expo`)
- Physical Android Device or Emulator

### Local Development Setup
```bash
# 1. Clone repository
git clone https://github.com/Navabharth-Technologies/ReLeaf_Pads.git

# 2. Navigate to directory
cd ReLeaf_Pads

# 3. Install dependencies
npm install
```

### Start Development Server
```bash
npx expo start
```
- Press `a` to open in Android Emulator / connected device.
- Press `w` to open in Web Browser.

### Run on Android
```bash
npm run android # or npx expo run:android
```

### Run on Web
```bash
npm run web # or npx expo start --web
```

### Run Desktop Application (Windows)
```bash
cd electron
npm install
npm start
```

---

## 🛠 Deployment & Build Process

### Generate Debug APK
```bash
cd android
./gradlew assembleDebug
```
- Generated APK: `android/app/build/outputs/apk/debug/app-debug.apk`

### Generate Release APK (Standalone)
```bash
cd android
./gradlew assembleRelease
```
- Generated APK: `android/app/build/outputs/apk/release/app-release.apk`
- Root Artifact: `Releaf_Pads_Release.apk` (~109 MB)

### Generate Android App Bundle (AAB for Google Play Store)
```bash
cd android
./gradlew bundleRelease
```
- Generated AAB: `android/app/build/outputs/bundle/release/app-release.aab`
- Root Artifact: `Releaf_Pads_Release.aab` (~77 MB)
- Package Name: `com.navabharath.releafpads`

### Package Windows Desktop Executable (.exe)
```bash
# 1. Export static web bundle
npx expo export:web

# 2. Package with Electron Builder
cd electron
npm run build
```
- Generated Setup: `electron-dist/ReLeaf Pads Setup 1.0.0.exe`
- Portable Binary: `ReLeaf_Pads.exe`

### Over-The-Air (OTA) Updates
```bash
npx eas update --branch production --message "Production release update"
```

---

## 🤝 Contribution & Maintenance

This project is developed and maintained by the **Navabharath Technologies Development Team** for **ReLeaf Pads**.

- **Organization**: Navabharath Technologies
- **Official Website**: https://www.releafpads.in/
- **Backend API**: [Azure App Service](https://releafpadbackend-h0bwephqd3ctazgn.centralindia-01.azurewebsites.net/)
- **Privacy Policy**: [Live Compliance Link](https://releafpadbackend-h0bwephqd3ctazgn.centralindia-01.azurewebsites.net/privacy-policy)

For support, enhancements, or technical queries, please contact the repository administrator.

*© 2026 Navabharath Technologies. All Rights Reserved.*
