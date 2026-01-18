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

### Week 1-2: Foundation (Current)
- ✅ Project setup
- ✅ Theme and design system
- ✅ Status indicators
- 🔄 Firebase configuration

### Week 3: Authentication
- Token management system
- User authentication

### Week 4: Service Requests
- Request submission
- Offline queue

### Week 5: Admin & Matcher
- Admin dashboard
- SEZ recommendation matcher

### Week 6-10: Advanced Features
- Operations module
- Announcements
- Sync optimization
- Testing & evaluation

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

Academic project - Nankai University MSc Software Engineering

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
1. Install backend dependencies (, e.g., Python):
   ```bash
   pip install -r requirements.txt  

---

**Built with ❤️ for Ethiopian Industrial Parks**
