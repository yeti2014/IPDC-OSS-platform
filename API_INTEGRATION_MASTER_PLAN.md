# 🚀 IPDC-OSS Platform - Complete API Integration Master Plan
**Ethiopian IPDC Digital Platform with AI Models & Interactive Map**
**Date:** January 11, 2026

---

## 📋 Executive Summary

### Current Status
✅ **Frontend**: React + TypeScript PWA with offline capabilities
✅ **AI Models**: 3 trained models ready for deployment
✅ **Database**: Firebase Firestore with offline persistence
✅ **Ethiopian Localization**: Amharic calendar, Ethiopian flag, cultural elements

### What We'll Build
1. **FastAPI Backend** - Python REST API server
2. **AI Model Integration** - All 3 models exposed as APIs
3. **Interactive Map Enhancement** - Real Ethiopian park data integration
4. **End-to-End Testing** - Complete workflow validation

---

## 🎯 Implementation Strategy

### Phase 1: FastAPI Backend Setup (Priority 1)
**Time**: 30 minutes
**Goal**: Create Python API server

#### Files to Create:
```
ai-models/
├── api/
│   ├── main.py                 # FastAPI app entry point
│   ├── models.py               # Pydantic request/response models
│   ├── endpoints/
│   │   ├── __init__.py
│   │   ├── service_classifier.py    # Model 1 endpoint
│   │   ├── maintenance.py           # Model 2 endpoint
│   │   └── park_recommendation.py   # Model 3 endpoint
│   ├── middleware/
│   │   ├── __init__.py
│   │   └── cors.py             # CORS configuration
│   └── utils/
│       ├── __init__.py
│       ├── model_loader.py     # Load ML models on startup
│       └── validators.py       # Input validation
├── requirements_api.txt        # API dependencies
└── start_api.bat              # Windows startup script
```

---

## 🔌 API Endpoints Design

### 1. Service Request Classification (Model 1)

**Endpoint**: `POST /api/v1/classify-service`

**Request**:
```json
{
  "title": "Investment Permit Application",
  "description": "Textile manufacturing company seeking investment permit for Hawassa Industrial Park",
  "created_at": "2026-01-11T10:30:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "service_type": "investment_permit",
    "service_type_display": "Investment Permit",
    "priority": "normal",
    "estimated_processing_days": 15,
    "confidence_score": 0.95,
    "recommendations": [
      "Prepare company registration documents",
      "Submit environmental impact assessment",
      "Attend pre-screening meeting"
    ]
  },
  "metadata": {
    "model_version": "1.0",
    "processing_time_ms": 45,
    "timestamp": "2026-01-11T10:30:01Z"
  }
}
```

---

### 2. Predictive Maintenance (Model 2)

**Endpoint**: `POST /api/v1/predict-maintenance`

**Request**:
```json
{
  "asset_id": "MAC-HWS-001",
  "asset_name": "CNC Milling Machine",
  "category": "machinery",
  "age_days": 730,
  "purchase_cost": 50000,
  "current_value": 40000,
  "condition": "fair",
  "last_maintenance_date": "2025-09-15",
  "maintenance_count": 8,
  "maintenance_interval_days": 90
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "will_fail_soon": false,
    "failure_probability": 0.15,
    "days_until_failure": 90,
    "risk_level": "medium",
    "risk_color": "#f59e0b",
    "recommended_action": "Schedule maintenance within 30 days",
    "maintenance_priority": 3,
    "estimated_cost": 5000,
    "next_maintenance_date": "2026-02-10"
  },
  "metadata": {
    "model_version": "1.0",
    "processing_time_ms": 32,
    "timestamp": "2026-01-11T10:30:01Z"
  }
}
```

---

### 3. Park Recommendation (Model 3 - To Implement)

**Endpoint**: `POST /api/v1/recommend-parks`

**Request**:
```json
{
  "tenant_profile": {
    "company_name": "Sunshine Textiles PLC",
    "industry_sector": "textile",
    "employees_count": 500,
    "investment_capital_usd": 5000000,
    "production_capacity": "10000 units/month",
    "export_percentage": 60,
    "required_land_hectares": 5,
    "power_requirement_mw": 2.5,
    "water_requirement_m3_day": 500,
    "preferred_region": "hawassa",
    "rent_budget_etb_month": 500000,
    "lease_duration_years": 10,
    "timeline_urgency": "medium"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "park_id": "PARK-HWS-001",
        "park_name": "Hawassa Industrial Park",
        "match_score": 92,
        "match_grade": "A",
        "location": {
          "region": "SNNPR",
          "city": "Hawassa",
          "coordinates": {
            "latitude": 7.0621,
            "longitude": 38.4755
          }
        },
        "pros": [
          "Specialized in textile industry (perfect match)",
          "Excellent road and port access",
          "Available land: 8 hectares",
          "Power capacity: 5 MW available"
        ],
        "cons": [
          "Slightly above rent budget (+10%)",
          "High tenant competition"
        ],
        "costs": {
          "rent_etb_month": 550000,
          "utilities_etb_month": 200000,
          "total_estimated_etb_month": 750000
        },
        "infrastructure": {
          "power_availability": "excellent",
          "water_availability": "good",
          "internet_connectivity": "fiber_optic",
          "road_access": "excellent"
        },
        "oss_services": [
          "Investment permit processing",
          "Customs clearance",
          "Banking services",
          "Trade licensing"
        ]
      },
      {
        "park_id": "PARK-AA-002",
        "park_name": "Bole Lemi Industrial Park",
        "match_score": 85,
        "match_grade": "B+",
        "location": {
          "region": "Addis Ababa",
          "city": "Addis Ababa",
          "coordinates": {
            "latitude": 8.9806,
            "longitude": 38.7578
          }
        },
        "pros": [
          "Capital city location",
          "Best infrastructure in Ethiopia",
          "Direct airport access"
        ],
        "cons": [
          "Higher costs",
          "Limited land availability",
          "Not textile-specialized"
        ],
        "costs": {
          "rent_etb_month": 800000,
          "utilities_etb_month": 250000,
          "total_estimated_etb_month": 1050000
        }
      },
      {
        "park_id": "PARK-DIR-003",
        "park_name": "Dire Dawa Industrial Park",
        "match_score": 78,
        "match_grade": "B",
        "location": {
          "region": "Dire Dawa",
          "city": "Dire Dawa",
          "coordinates": {
            "latitude": 9.5930,
            "longitude": 41.8661
          }
        },
        "pros": [
          "Lower costs",
          "Railway access to Djibouti port",
          "Growing textile sector"
        ],
        "cons": [
          "Less developed infrastructure",
          "Smaller workforce pool"
        ],
        "costs": {
          "rent_etb_month": 400000,
          "utilities_etb_month": 150000,
          "total_estimated_etb_month": 550000
        }
      }
    ],
    "model_confidence": "medium",
    "reasoning": "Recommendations based on industry matching, capacity requirements, and location preferences. Model trained with 500+ synthetic tenant profiles."
  },
  "metadata": {
    "model_version": "1.0",
    "processing_time_ms": 78,
    "timestamp": "2026-01-11T10:30:01Z"
  }
}
```

---

## 📦 Ethiopian Industrial Parks Data

### Real Parks to Include:

```typescript
export const ETHIOPIAN_INDUSTRIAL_PARKS = [
  {
    id: "PARK-HWS-001",
    name: "Hawassa Industrial Park",
    name_amharic: "ሐዋሳ ኢንዱስትሪ ፓርክ",
    region: "SNNPR",
    city: "Hawassa",
    coordinates: { latitude: 7.0621, longitude: 38.4755 },
    specialization: ["textile", "garment"],
    total_area_hectares: 300,
    available_land_hectares: 120,
    power_capacity_mw: 50,
    water_capacity_m3_day: 5000,
    operational_status: "operational",
    inauguration_year: 2016,
    oss_services: [
      "investment_permit",
      "business_license",
      "work_permit",
      "customs_clearance",
      "banking_services"
    ]
  },
  {
    id: "PARK-AA-002",
    name: "Bole Lemi Industrial Park I & II",
    name_amharic: "ቦሌ ለሚ ኢንዱስትሪ ፓርክ",
    region: "Addis Ababa",
    city: "Addis Ababa",
    coordinates: { latitude: 8.9806, longitude: 38.7578 },
    specialization: ["textile", "garment", "leather"],
    total_area_hectares: 156,
    available_land_hectares: 30,
    power_capacity_mw: 30,
    water_capacity_m3_day: 3000,
    operational_status: "operational",
    inauguration_year: 2012
  },
  {
    id: "PARK-DIR-003",
    name: "Dire Dawa Industrial Park",
    name_amharic: "ድሬዳዋ ኢንዱስትሪ ፓርክ",
    region: "Dire Dawa",
    city: "Dire Dawa",
    coordinates: { latitude: 9.5930, longitude: 41.8661 },
    specialization: ["textile", "food_processing"],
    total_area_hectares: 200,
    available_land_hectares: 80,
    power_capacity_mw: 40,
    water_capacity_m3_day: 4000,
    operational_status: "operational",
    inauguration_year: 2018
  },
  {
    id: "PARK-KOM-004",
    name: "Kombolcha Industrial Park",
    name_amharic: "ኮምቦልቻ ኢንዱስትሪ ፓርክ",
    region: "Amhara",
    city: "Kombolcha",
    coordinates: { latitude: 11.0825, longitude: 39.7433 },
    specialization: ["textile", "garment"],
    total_area_hectares: 75,
    available_land_hectares: 40,
    power_capacity_mw: 20,
    water_capacity_m3_day: 2000,
    operational_status: "operational",
    inauguration_year: 2017
  },
  {
    id: "PARK-MKL-005",
    name: "Mekelle Industrial Park",
    name_amharic: "መቐለ ኢንዱስትሪ ፓርክ",
    region: "Tigray",
    city: "Mekelle",
    coordinates: { latitude: 13.4967, longitude: 39.4753 },
    specialization: ["textile", "pharmaceutical"],
    total_area_hectares: 100,
    available_land_hectares: 60,
    power_capacity_mw: 25,
    water_capacity_m3_day: 2500,
    operational_status: "operational",
    inauguration_year: 2017
  },
  {
    id: "PARK-ADM-006",
    name: "Adama Industrial Park",
    name_amharic: "አዳማ ኢንዱስትሪ ፓርክ",
    region: "Oromia",
    city: "Adama (Nazret)",
    coordinates: { latitude: 8.5400, longitude: 39.2675 },
    specialization: ["food_processing", "beverage", "textile"],
    total_area_hectares: 100,
    available_land_hectares: 45,
    power_capacity_mw: 30,
    water_capacity_m3_day: 3500,
    operational_status: "operational",
    inauguration_year: 2019
  },
  {
    id: "PARK-JGG-007",
    name: "Jigjiga Agro-Processing Industrial Park",
    name_amharic: "ጅግጅጋ አግሮ-ፕሮሰሲንግ ኢንዱስትሪ ፓርክ",
    region: "Somali",
    city: "Jigjiga",
    coordinates: { latitude: 9.3500, longitude: 42.7979 },
    specialization: ["food_processing", "agro_processing"],
    total_area_hectares: 75,
    available_land_hectares: 50,
    power_capacity_mw: 15,
    water_capacity_m3_day: 1800,
    operational_status: "under_construction",
    inauguration_year: 2024
  },
  {
    id: "PARK-BHD-008",
    name: "Bahir Dar Industrial Park",
    name_amharic: "ባህር ዳር ኢንዱስትሪ ፓርክ",
    region: "Amhara",
    city: "Bahir Dar",
    coordinates: { latitude: 11.5933, longitude: 37.3905 },
    specialization: ["textile", "leather", "agro_processing"],
    total_area_hectares: 125,
    available_land_hectares: 70,
    power_capacity_mw: 35,
    water_capacity_m3_day: 3800,
    operational_status: "operational",
    inauguration_year: 2020
  },
  {
    id: "PARK-SEM-009",
    name: "Semera-Logia Industrial Park",
    name_amharic: "ሰመራ-ሎጊያ ኢንዱስትሪ ፓርክ",
    region: "Afar",
    city: "Semera",
    coordinates: { latitude: 11.7947, longitude: 41.0053 },
    specialization: ["salt_processing", "mining"],
    total_area_hectares: 100,
    available_land_hectares: 85,
    power_capacity_mw: 20,
    water_capacity_m3_day: 2000,
    operational_status: "under_construction",
    inauguration_year: 2023
  },
  {
    id: "PARK-KLSH-010",
    name: "Kilinto Leather Industrial Park",
    name_amharic: "ቂሊንጦ የቆዳ ኢንዱስትሪ ፓርክ",
    region: "Addis Ababa",
    city: "Addis Ababa (Kilinto)",
    coordinates: { latitude: 8.8830, longitude: 38.7470 },
    specialization: ["leather", "leather_products"],
    total_area_hectares: 156,
    available_land_hectares: 40,
    power_capacity_mw: 28,
    water_capacity_m3_day: 2800,
    operational_status: "operational",
    inauguration_year: 2018
  }
];
```

---

## 🗺️ Interactive Map Enhancement

### Features to Add:

1. **Real Park Markers** - Plot all 10 Ethiopian industrial parks
2. **Click Details** - Show park information on marker click
3. **Industry Filtering** - Filter by specialization (textile, leather, etc.)
4. **Availability Status** - Color-code operational vs under construction
5. **Match Highlighting** - Highlight recommended parks from AI model
6. **Ethiopian Regions** - Show regional boundaries

---

## 🛠️ Step-by-Step Implementation

### Step 1: Create FastAPI Backend
```bash
cd "c:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ai-models"

# Create API structure
mkdir api api\endpoints api\middleware api\utils

# Install FastAPI dependencies
pip install fastapi uvicorn pydantic python-multipart
```

### Step 2: Implement Model 1 & 2 APIs
- Load existing trained models
- Create prediction endpoints
- Add input validation

### Step 3: Implement Model 3 (Park Recommendation)
- Create rule-based matching algorithm
- Train with synthetic tenant data
- Deploy as API endpoint

### Step 4: Frontend Integration
- Create API client service
- Update CreateRequestPage to use Model 1
- Update AssetManagementPage to use Model 2
- Create ParkRecommendationPage to use Model 3

### Step 5: Enhanced Map Integration
- Add Ethiopian park data
- Integrate with park recommendation results
- Add interactive features

---

## ⏱️ Time Estimates

| Task | Time | Priority |
|------|------|----------|
| FastAPI Backend Setup | 30 min | Critical |
| Model 1 API (Service Classifier) | 20 min | Critical |
| Model 2 API (Maintenance) | 20 min | Critical |
| Model 3 Implementation | 45 min | High |
| Frontend API Integration | 40 min | Critical |
| Map Enhancement | 30 min | High |
| Testing & Debugging | 30 min | Critical |
| **TOTAL** | **3.5 hours** | - |

---

## 🎯 Success Criteria

✅ All 3 AI models accessible via REST APIs
✅ Frontend successfully calls and displays AI predictions
✅ Interactive map shows all 10 Ethiopian industrial parks
✅ Park recommendations work end-to-end
✅ Responsive design works on mobile/tablet/desktop
✅ Ethiopian calendar and cultural elements preserved
✅ Offline-first functionality maintained

---

## 📚 Next Steps

1. ✅ **Confirm Approach** - User approval of this plan
2. 🚀 **Start Implementation** - Begin with FastAPI backend
3. 🔄 **Iterative Development** - Build and test incrementally
4. ✅ **Final Testing** - End-to-end validation
5. 📦 **Deployment Ready** - Platform complete

---

**Ready to proceed?** Let's start with FastAPI backend setup!
