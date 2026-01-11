# IPDC Platform AI Models
**Chinese Smart Park Adaptation for Ethiopian IPDC Context**

## Overview
This project implements two AI models adapted from Chinese smart industrial park systems (Alibaba ET Industrial Brain & Huawei FusionPlant) for Ethiopian Industrial Park Development Corporation (IPDC).

## Models

### Model 1: Smart Service Classifier (智能服务分类系统)
**Inspired by**: Alibaba ET Industrial Brain, Tencent WeCity
**Purpose**: Automatically classify OSS service requests and predict priority levels

**Features**:
- Multi-label classification (11 service types)
- Priority prediction (low, normal, high, urgent)
- Processing time estimation
- Bilingual support (Amharic/English)

**Technology Stack**:
- Model: XGBoost + TF-IDF (lightweight, no GPU required)
- Alternative: xlm-roberta-base (multilingual BERT)
- Framework: scikit-learn, transformers
- API: FastAPI

### Model 2: Predictive Maintenance System (预测性维护)
**Inspired by**: Huawei FusionPlant
**Purpose**: Predict asset failures and recommend maintenance schedules

**Features**:
- Failure probability prediction (30/60/90 days)
- Risk level assessment (low, medium, high, critical)
- Maintenance date recommendation
- Anomaly detection

**Technology Stack**:
- Models: Ensemble (LSTM + XGBoost + Survival Analysis)
- Framework: TensorFlow/Keras, scikit-learn
- API: FastAPI

## 7-Day Implementation Timeline

### Day 1: Setup & Data Preparation
- [x] Python environment setup
- [ ] Export training data from Firebase
- [ ] Data cleaning and preprocessing
- [ ] Create training/validation/test splits

### Day 2: Model 1 Development
- [ ] Build Service Classifier (TF-IDF + XGBoost)
- [ ] Train and validate model
- [ ] Evaluate accuracy
- [ ] Export trained model

### Day 3: Model 2 Development
- [ ] Build Predictive Maintenance models
- [ ] Train ensemble (LSTM + XGBoost)
- [ ] Validate predictions
- [ ] Export trained models

### Day 4: API Development
- [ ] Create FastAPI servers for both models
- [ ] Add authentication
- [ ] Create API endpoints
- [ ] Add error handling

### Day 5: Integration & Testing
- [ ] Integrate Model 1 with React platform
- [ ] Integrate Model 2 with Asset Management
- [ ] End-to-end testing
- [ ] Performance optimization

### Day 6: Documentation & Deployment
- [ ] API documentation
- [ ] Deployment guide
- [ ] Docker containerization
- [ ] Cloud deployment (optional)

### Day 7: Thesis Writing (Chapter 4)
- [ ] System architecture diagrams
- [ ] Model methodology
- [ ] Implementation details
- [ ] Results and evaluation

## Project Structure
```
ai-models/
├── README.md
├── requirements.txt
├── .env.example
├── data/
│   ├── raw/                    # Exported Firebase data
│   ├── processed/              # Cleaned training data
│   └── export_data.py          # Data export script
├── model1_service_classifier/
│   ├── train.py                # Training script
│   ├── evaluate.py             # Evaluation script
│   ├── predict.py              # Inference script
│   ├── models/                 # Saved models
│   └── notebooks/              # Jupyter notebooks
├── model2_predictive_maintenance/
│   ├── train.py
│   ├── evaluate.py
│   ├── predict.py
│   ├── models/
│   └── notebooks/
├── api/
│   ├── main.py                 # FastAPI main app
│   ├── model1_routes.py        # Service classifier endpoints
│   ├── model2_routes.py        # Predictive maintenance endpoints
│   ├── auth.py                 # Authentication
│   └── utils.py                # Helper functions
├── tests/
│   ├── test_model1.py
│   ├── test_model2.py
│   └── test_api.py
├── deployment/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── deploy.sh
└── thesis/
    ├── chapter4_outline.md
    ├── diagrams/
    └── references.md
```

## Installation

```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

## Usage

### Training Models
```bash
# Train Model 1
python model1_service_classifier/train.py

# Train Model 2
python model2_predictive_maintenance/train.py
```

### Running API Server
```bash
# Development
uvicorn api.main:app --reload --port 8000

# Production
uvicorn api.main:app --host 0.0.0.0 --port 8000
```

### API Endpoints

**Model 1: Service Classifier**
```
POST /api/v1/classify-service
Body: {
  "title": "Investment Permit Application",
  "description": "Request for new investment permit...",
  "companyName": "ABC Manufacturing",
  "serviceType": "investment_permit"
}

Response: {
  "predicted_category": "investment_permit",
  "predicted_priority": "normal",
  "estimated_processing_days": 15,
  "confidence": 0.89
}
```

**Model 2: Predictive Maintenance**
```
POST /api/v1/predict-maintenance
Body: {
  "assetId": "xyz123",
  "assetCode": "MAC-123456-001",
  "category": "machinery",
  "purchaseDate": "2022-01-15",
  "lastMaintenanceDate": "2024-10-01",
  "condition": "good",
  "maintenanceHistory": [...]
}

Response: {
  "failure_probability": 23.5,
  "risk_level": "medium",
  "recommended_maintenance_date": "2026-02-15",
  "estimated_cost_if_failure": 15000,
  "confidence": 0.82
}
```

## Chinese Smart Park References

1. **Alibaba ET Industrial Brain** (阿里云工业大脑)
   - Service classification using NLP
   - Auto-routing and priority assignment
   - https://www.alibabacloud.com/solutions/industrial-brain

2. **Huawei FusionPlant** (华为工业互联网)
   - Predictive maintenance for industrial equipment
   - IoT + ML integration
   - https://e.huawei.com/en/solutions/industries/manufacturing

3. **Tencent WeCity** (腾讯微瓴)
   - Smart park management platform
   - AI-powered service desk
   - https://cloud.tencent.com/solution/wecity

## License
MIT License - Academic Research Purpose

## Author
[Your Name] - Master's Thesis Project
Ethiopian IPDC Platform Enhancement
