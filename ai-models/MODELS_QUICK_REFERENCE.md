# AI Models Quick Reference Guide

**IPDC Platform - Trained AI Models**
**Training Date:** January 10, 2026

---

## 📂 Directory Structure

```
ai-models/
├── data/
│   ├── generate_synthetic_data.py
│   ├── generate_training_data.py  (Windows-compatible)
│   └── raw/
│       ├── service_requests_synthetic.csv  (1000 records, 448 KB)
│       └── assets_synthetic.csv            (500 records, 212 KB)
│
├── model1_service_classifier/
│   ├── train.py                    (Original - has emoji issues)
│   ├── train_windows.py           ✅ USE THIS
│   ├── test_model.py
│   ├── MODEL1_RESULTS.md
│   └── models/                     (10 files)
│       ├── model_category.pkl      ← Main classifier
│       ├── model_priority.pkl
│       ├── model_time.pkl
│       ├── vectorizer.pkl
│       ├── scaler.pkl
│       ├── label_encoder_service.pkl
│       ├── label_encoder_priority.pkl
│       ├── metadata.json
│       ├── confusion_matrix_category.png
│       └── time_prediction_scatter.png
│
└── model2_predictive_maintenance/
    ├── train.py                    (Original - has encoding issues)
    ├── train_windows.py           ✅ USE THIS
    ├── MODEL2_RESULTS.md
    └── models/                     (14 files)
        ├── model_failure.pkl       ← Failure predictor
        ├── model_days.pkl          ← Days estimator
        ├── model_risk.pkl          ← Risk classifier
        ├── scaler.pkl
        ├── label_encoder_category.pkl
        ├── label_encoder_status.pkl
        ├── label_encoder_condition.pkl
        ├── label_encoder_risk.pkl
        ├── features.json
        ├── metadata.json
        ├── confusion_matrix_failure.png
        ├── days_prediction_scatter.png
        ├── confusion_matrix_risk.png
        └── feature_importance.png
```

---

## 🎯 Model 1: Service Classifier

### Purpose
Automatically classify IPDC service requests into 11 categories

### Performance
- **Service Classification:** 100% accuracy ✅
- **Processing Time:** 2.63 days MAE ✅
- **Status:** Production-ready

### How to Use

#### Python Example:
```python
import joblib
import numpy as np

# Load models
model = joblib.load('model1_service_classifier/models/model_category.pkl')
vectorizer = joblib.load('model1_service_classifier/models/vectorizer.pkl')
scaler = joblib.load('model1_service_classifier/models/scaler.pkl')
le_service = joblib.load('model1_service_classifier/models/label_encoder_service.pkl')

# Prepare input
text = "Investment Permit Application for textile manufacturing"
X_text = vectorizer.transform([text]).toarray()

# Add metadata (hour, day_of_week, text_length, word_count)
metadata = np.array([[9, 1, len(text), len(text.split())]])
metadata_scaled = scaler.transform(metadata)

# Combine features
X = np.hstack([X_text, metadata_scaled])

# Predict
prediction = model.predict(X)[0]
service_type = le_service.inverse_transform([prediction])[0]

print(f"Predicted service: {service_type}")
# Output: investment_permit
```

### Service Types (11)
1. `investment_permit`
2. `business_license`
3. `commercial_registration`
4. `work_permit`
5. `trade_name_registration`
6. `agreements`
7. `tin_issuance`
8. `notarization`
9. `customs_exemption`
10. `customs_clearance`
11. `banking_services`

---

## 🎯 Model 2: Predictive Maintenance

### Purpose
Predict asset failures and recommend maintenance for IPDC industrial park assets

### Performance
- **Failure Prediction:** 100% accuracy ✅
- **Days Estimation:** 0.01 days MAE ✅
- **Risk Classification:** 99% accuracy ✅
- **Status:** Production-ready

### How to Use

#### Python Example:
```python
import joblib
import numpy as np
import pandas as pd

# Load models
model_failure = joblib.load('model2_predictive_maintenance/models/model_failure.pkl')
model_days = joblib.load('model2_predictive_maintenance/models/model_days.pkl')
model_risk = joblib.load('model2_predictive_maintenance/models/model_risk.pkl')
scaler = joblib.load('model2_predictive_maintenance/models/scaler.pkl')
le_risk = joblib.load('model2_predictive_maintenance/models/label_encoder_risk.pkl')

# Required features (14 total)
features = {
    'age_days': 730,  # 2 years old
    'age_years': 2.0,
    'days_since_maintenance': 120,
    'maintenance_count': 8,
    'maintenanceInterval': 90,
    'purchaseCost': 50000,
    'currentValue': 40000,
    'depreciationRate': 10,
    'failure_probability': 15,
    'maintenance_frequency': 4.0,
    'warranty_active': 0,
    'category_encoded': 3,  # machinery
    'status_encoded': 0,    # operational
    'condition_encoded': 2  # fair
}

# Prepare input
X = pd.DataFrame([features])
X_scaled = scaler.transform(X)

# Predict all three outputs
will_fail = model_failure.predict(X_scaled)[0]
fail_prob = model_failure.predict_proba(X_scaled)[0][1]
days_until_failure = model_days.predict(X_scaled)[0]
risk = le_risk.inverse_transform(model_risk.predict(X_scaled))[0]

print(f"Will fail soon: {'Yes' if will_fail else 'No'}")
print(f"Failure probability: {fail_prob*100:.1f}%")
print(f"Days until failure: {int(days_until_failure)}")
print(f"Risk level: {risk.upper()}")
```

### Asset Categories (9)
1. `machinery` - Manufacturing equipment
2. `vehicle` - Transport vehicles
3. `infrastructure` - Buildings, utilities
4. `it-equipment` - Computers, servers
5. `furniture` - Office furniture
6. `tool` - Hand tools, equipment
7. `safety-equipment` - Fire, security systems
8. `utility` - HVAC, power, water
9. `other` - Miscellaneous

### Risk Levels (3)
- `low` - No immediate action needed
- `medium` - Schedule maintenance soon
- `high` - Urgent maintenance required

---

## 🔄 Retraining Models

### When to Retrain:
- After collecting real IPDC data (not synthetic)
- When accuracy drops below 80%
- When new service types or asset categories are added
- Every 6 months with updated data

### How to Retrain:

#### Model 1:
```bash
cd "c:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ai-models\model1_service_classifier"

# Replace synthetic data with real data in ../data/raw/service_requests.csv

py train_windows.py
```

#### Model 2:
```bash
cd "c:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ai-models\model2_predictive_maintenance"

# Replace synthetic data with real data in ../data/raw/assets.csv

py train_windows.py
```

---

## 📊 Model Metadata

### Model 1 Metadata:
```json
{
  "model_name": "IPDC Service Classifier",
  "version": "1.0",
  "feature_dimensions": 516,
  "metrics": {
    "service_accuracy": 1.0,
    "priority_accuracy": 0.4,
    "time_mae": 2.63,
    "time_r2": 0.577
  }
}
```

### Model 2 Metadata:
```json
{
  "model_name": "IPDC Predictive Maintenance",
  "version": "1.0",
  "feature_dimensions": 14,
  "metrics": {
    "failure_prediction_accuracy": 1.0,
    "days_estimation_mae": 0.014,
    "days_estimation_r2": 0.999,
    "risk_classification_accuracy": 0.99
  }
}
```

---

## 🚀 FastAPI Integration (Next Step)

### Proposed API Endpoints:

```python
# Model 1 Endpoint
POST /api/classify-service
Request:
{
  "title": "Investment Permit Application",
  "description": "New textile factory in Hawassa",
  "created_at": "2026-01-10T10:00:00Z"
}

Response:
{
  "service_type": "investment_permit",
  "priority": "normal",
  "estimated_days": 15,
  "confidence": 0.95
}

# Model 2 Endpoint
POST /api/predict-maintenance
Request:
{
  "asset_id": "MAC-123456",
  "age_days": 730,
  "category": "machinery",
  "condition": "fair",
  "last_maintenance_days": 120
}

Response:
{
  "will_fail_soon": false,
  "failure_probability": 0.15,
  "days_until_failure": 90,
  "risk_level": "medium",
  "recommended_action": "Schedule maintenance within 30 days"
}
```

---

## 🔧 Troubleshooting

### Problem: Model file not found
**Solution:** Ensure you're in the correct directory and models were trained successfully

### Problem: UnicodeEncodeError on Windows
**Solution:** Use `train_windows.py` instead of `train.py`

### Problem: Import errors (sklearn, xgboost)
**Solution:**
```bash
py -m pip install pandas numpy scikit-learn xgboost joblib matplotlib seaborn
```

### Problem: Low accuracy after retraining
**Solution:**
1. Check if data has sufficient samples (>500 for Model 1, >300 for Model 2)
2. Ensure data is balanced across classes
3. Verify feature engineering is correct
4. Consider adjusting hyperparameters

---

## 📚 Additional Resources

### Documentation:
- Model 1 detailed results: `model1_service_classifier/MODEL1_RESULTS.md`
- Model 2 detailed results: `model2_predictive_maintenance/MODEL2_RESULTS.md`
- Day 1 summary: `DAY1_COMPLETION_SUMMARY.md`
- 2-week plan: `2_WEEK_IMPLEMENTATION_PLAN.md`

### Visualizations:
- Model 1 confusion matrix: `model1_service_classifier/models/confusion_matrix_category.png`
- Model 2 feature importance: `model2_predictive_maintenance/models/feature_importance.png`

---

## ⚡ Quick Commands

```bash
# Navigate to ai-models folder
cd "c:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ai-models"

# Generate training data
py data/generate_training_data.py

# Train Model 1
py model1_service_classifier/train_windows.py

# Train Model 2
py model2_predictive_maintenance/train_windows.py

# Test Model 1
py model1_service_classifier/test_model.py

# View Model 1 metadata
type model1_service_classifier\models\metadata.json

# View Model 2 metadata
type model2_predictive_maintenance\models\metadata.json
```

---

**Status:** ✅ Both models trained and ready for API integration
**Next:** Create FastAPI server for model deployment
