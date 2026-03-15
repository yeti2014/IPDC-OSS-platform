# 🏭 IPDC Digital Platform

**Ethiopian Industrial Parks One-Stop Service Platform**

An offline-first Progressive Web Application for managing tenant services, administrative operations, and park management in Ethiopian Industrial Parks.

---

## 📋 Project Information

**Title:** Offline-First Digital One-Stop-Shop for Ethiopian Industrial Parks Development Corporation (IPDC)

**Subtitle:** Localizing China Smart Park Model for Connectivity-Constrained Environments

**Author:** Yeti  
**Program:** MSc Software Engineering, Nankai University  
**Timeline:** 10 weeks implementation

---

## 🎯 Research Questions

1. **RQ1:** How can Chinese smart industrial park digital service models be adapted for offline-first operation in Ethiopian connectivity-constrained environments?

2. **RQ2:** What architectural patterns and technical strategies enable reliable offline-first functionality while maintaining data consistency in multi-user industrial park management systems?

3. **RQ3:** How does offline-first architecture affect user experience, system performance, and operational efficiency compared to traditional online-dependent systems in industrial park contexts?

---

## 📸 Screenshots

### Authentication
<img src="screenshots/fig_sign_in.png" alt="Sign In Page" title="Sign In" width="700"/>
<img src="screenshots/fig_sign_up.png" alt="Sign Up Page" title="Sign Up" width="700"/>

### Dashboards
<img src="screenshots/fig_tenant_dashboard.jpeg" alt="Tenant Dashboard" title="Tenant Dashboard — service requests, token balance, announcements" width="700"/>
<img src="screenshots/fig_admin_dashboard.png" alt="Admin Dashboard" title="Admin Dashboard — manage tenants, requests, and park operations" width="700"/>
<img src="screenshots/fig_operators_dashboard.png" alt="Operators Dashboard" title="Operators Dashboard — maintenance and facility management" width="700"/>

### Service Requests & Tokens
<img src="screenshots/fig_create_request.png" alt="Create Service Request" title="Submit service requests — works fully offline" width="700"/>
<img src="screenshots/fig_token_dashboard.png" alt="Digital Token System" title="Token-based credit system for park services" width="700"/>

### Offline-First & PWA
<img src="screenshots/fig_offline_status.jpg" alt="Offline Status Indicator" title="Offline mode — requests queued for sync" width="700"/>
<img src="screenshots/fig_online_status.jpg" alt="Online Status Indicator" title="Back online — automatic sync of queued requests" width="700"/>
<img src="screenshots/fig_offline_submission_evidence.jpg" alt="Offline Submission Evidence" title="Service request submitted while offline" width="700"/>
<img src="screenshots/fig_pwa_install_dialog.png" alt="PWA Install Dialog" title="Install as a native app on any device" width="700"/>
<img src="screenshots/fig_pwa_standalone.png" alt="PWA Standalone Mode" title="Running as standalone PWA — no browser chrome" width="700"/>

### Responsive Design
<img src="screenshots/fig_desktop_view.png" alt="Desktop View" title="Desktop layout" width="700"/>
<img src="screenshots/fig_mobile_view.jpg" alt="Mobile View" title="Mobile layout — fully responsive" width="400"/>

### Maps & Announcements
<img src="screenshots/fig_parks_map.png" alt="Ethiopian Industrial Parks Map" title="Interactive map of all 13 Ethiopian SEZs" width="700"/>
<img src="screenshots/fig_announcements.png" alt="Announcements" title="Park-wide announcements for tenants" width="700"/>
<img src="screenshots/fig_complaint_management.png" alt="Complaint Management" title="Admin complaint tracking and resolution" width="700"/>

### AI Features
<img src="screenshots/fig_park_recommendation.jpeg" alt="Intelligent Park Recommendation" title="AI-powered SEZ recommendation based on business profile" width="700"/>
<img src="screenshots/fig_service_classifier.jpeg" alt="AI Service Classifier" title="Automatic service request classification" width="700"/>
<img src="screenshots/fig_predictive_maintenance_1.png" alt="Predictive Maintenance" title="Asset maintenance prediction — Model 1" width="700"/>
<img src="screenshots/fig_predictive_maintenance_2.png" alt="Predictive Maintenance 2" title="Asset maintenance prediction — Model 2" width="700"/>

### AI Model Performance
<img src="screenshots/model1_confusion_matrix_category.png" alt="Model 1 Confusion Matrix" title="Service classifier — confusion matrix by category" width="700"/>
<img src="screenshots/model1_time_prediction_scatter.png" alt="Model 1 Time Prediction" title="Service classifier — time prediction scatter" width="700"/>
<img src="screenshots/model2_confusion_matrix_failure.png" alt="Model 2 Failure Matrix" title="Maintenance predictor — failure classification" width="700"/>
<img src="screenshots/model2_confusion_matrix_risk.png" alt="Model 2 Risk Matrix" title="Maintenance predictor — risk classification" width="700"/>
<img src="screenshots/model2_days_prediction_scatter.png" alt="Model 2 Days Prediction" title="Maintenance predictor — days to failure" width="700"/>
<img src="screenshots/model2_feature_importance.png" alt="Model 2 Feature Importance" title="Maintenance predictor — feature importance" width="700"/>
<img src="screenshots/model3_feature_importance.png" alt="Model 3 Feature Importance" title="Park recommendation — feature importance" width="700"/>

### Performance (Lighthouse)
<img src="screenshots/fig_lighthouse_scores.png" alt="Lighthouse Scores" title="PWA Lighthouse audit scores" width="700"/>
<img src="screenshots/fig_lighthouse_meta.png" alt="Lighthouse Meta" title="Lighthouse audit metadata" width="700"/>

---

## ✨ Features

### Core Capabilities
- ✅ **Offline-First Architecture** - Basic features Works without internet connection
- ✅ **Progressive Web App (PWA)** - adjusted for different screen sizes
- ✅ **Multi-Role Support** - Tenant, Admin, Operations
- ✅ **Service Request Management** - Submit requests offline and track will be synched when online 
- ✅ **Token-Based Credit System** - Digital token management to proof the concept
- ✅ **Real-time Status Indicators** - Online/Offline detection
- ✅ **Device-Responsive Design** - Mobile, tablet, desktop
- ✅ **Automatic Sync** - Queue actions and sync when online

### Status Indicators
- 📡 Online/Offline status badges
- 📱 Device type detection (mobile/tablet/desktop)
- 🔄 Sync queue monitoring
- 🎨 Beautiful Material-UI components

---

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Material-UI (MUI)** - Component library
- **Vite** - Build tool
- **React Router** - Navigation

### Backend & Database
- **Firebase** - Backend as a Service
- **Firestore** - Cloud database
- **Firebase Auth** - Authentication
- **Dexie.js** - IndexedDB wrapper for offline storage

### PWA & Offline
- **Workbox** - Service worker management
- **vite-plugin-pwa** - PWA generation

---

## 📁 Project Structure
```
ipdc-platform/
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   │   ├── common/       # Shared components (StatusBar, etc.)
│   │   ├── auth/         # Authentication components
│   │   ├── tenant/       # Tenant-specific components
│   │   ├── admin/        # Admin components
│   │   └── operations/   # Operations components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React contexts
│   ├── services/         # Business logic
│   ├── db/               # Database setup
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── config/           # Configuration (theme, etc.)
│   ├── App.tsx           # Main app component
│   └── main.tsx          # Entry point
├── .env.example          # Environment variables template
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── package.json          # Dependencies
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 20+ and npm 10+
- Git
- Firebase account

### Installation

1. **Clone/Download the project**
```bash
   cd ipdc-platform
```

2. **Install dependencies**
```bash
   npm install
```

3. **Configure Firebase**
   - Copy `.env.example` to `.env`
   - Add your Firebase credentials
```bash
   cp .env.example .env
```

4. **Run development server**
```bash
   npm run dev
```

5. **Open in browser**
```
   http://localhost:5173
```

---

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

---

## 🎨 Status Indicators Usage

### Online/Offline Detection
```typescript
import { useOnlineStatus } from '@/hooks/useOnlineStatus';

const { isOnline, wasOffline, offlineDuration } = useOnlineStatus();
```

### Device Detection
```typescript
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

const { isMobile, isTablet, isDesktop } = useDeviceDetection();
```

### Status Bar Component
```typescript
import { StatusBar } from '@/components/common/StatusBar';

<StatusBar title="IPDC Platform" />
```

See `STATUS_INDICATORS_GUIDE.md` for complete documentation.

---

## 🗓️ Development Timeline

### Week 1-2: Foundation
- ✅ Project setup
- ✅ Theme and design system
- ✅ Status indicators
- ✅ Firebase configuration

### Week 3: Authentication
- ✅ Token management system
- ✅ User authentication

### Week 4: Service Requests
- ✅ Request submission
- ✅ Offline queue

### Week 5: Admin & Matcher
- ✅ Admin dashboard
- ✅ SEZ recommendation matcher

### Week 6-10: Advanced Features
- ✅ Operations module
- ✅ Announcements
- ✅ Sync optimization
- ✅ Testing & evaluation

---

## 📊 Testing

### Test Online/Offline
1. Open DevTools (F12)
2. Network tab → Select "Offline"
3. Watch status indicators change

### Test Device Modes
1. Resize browser window
2. Or: DevTools → Device Toolbar (Ctrl+Shift+M)
3. Watch indicators update

---

## 🤝 Contributing

This is a thesis project. Contributions are welcome after initial submission.

---

## 📄 License

Copyright (c) 2026 Yeti. All Rights Reserved.

This project is made publicly visible for academic review and portfolio purposes only.
Unauthorized copying, redistribution, or commercial use is strictly prohibited.
See the [LICENSE](LICENSE) file for full details.

---

## 📧 Contact

**Author:** Yeti  
**Institution:** Nankai University  
**Program:** MSc Software Engineering  

---

## 🎓 Thesis Information

**Advisor Approved Approach:**
- ✅ Intelligent SEZ matcher 
- ✅ 13 Ethiopian SEZs for data collection
- ✅ Bole Lemi & Hawassa for pilot testing
- ✅ Digital token system
- ✅ Lightweight offline-first frontend

- NOTE: To Enhance the Platform ## AI Models & Recommendation System

This project includes 3 trained models for tenant service classification,Asset maintenance Prediction and intelligent park recommendation
(located in `/ai-models/`).

### Running the Models Locally
1. Install backend dependencies (Python required):
   ```bash
   pip install -r requirements.txt
   ```

---

**Built with ❤️ for Ethiopian Industrial Parks (IPDC)**
