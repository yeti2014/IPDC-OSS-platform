# Quick Start Guide - 7 Days to Launch

## 🚀 Day-by-Day Implementation Plan

### Day 1: Setup & Data Preparation (TODAY)

#### Step 1: Install Python Environment (15 minutes)

```bash
# Navigate to ai-models directory
cd "c:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ai-models"

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
# source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

#### Step 2: Set up Firebase Service Account (10 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your IPDC project
3. Click "Project Settings" (gear icon)
4. Go to "Service Accounts" tab
5. Click "Generate new private key"
6. Save the JSON file as: `ai-models/.env/firebase-service-account.json`

#### Step 3: Export Training Data (20 minutes)

```bash
# Export real data from Firebase
python data/export_data.py
```

If you don't have much real data yet, synthetic data will be generated automatically.

#### Step 4: Test Data Export

```bash
# Check exported data
ls data/raw/
# Should see: service_requests.csv, assets.csv, etc.
```

---

### Day 2-3: Model Development

#### Model 1: Service Classifier (Day 2)

```bash
# Train Model 1
python model1_service_classifier/train.py

# Evaluate Model 1
python model1_service_classifier/evaluate.py

# Test predictions
python model1_service_classifier/predict.py
```

#### Model 2: Predictive Maintenance (Day 3)

```bash
# Train Model 2
python model2_predictive_maintenance/train.py

# Evaluate Model 2
python model2_predictive_maintenance/evaluate.py

# Test predictions
python model2_predictive_maintenance/predict.py
```

---

### Day 4: API Development

```bash
# Start API server
uvicorn api.main:app --reload --port 8000

# Test endpoints
# Open browser: http://localhost:8000/docs
```

---

### Day 5: Integration

Edit these files in your React platform:

1. **src/services/aiService.ts** - Add API calls
2. **src/components/admin/ServiceRequestDialog.tsx** - Add AI predictions
3. **src/components/admin/AssetDialog.tsx** - Add maintenance predictions

---

### Day 6: Testing & Deployment

```bash
# Run tests
pytest tests/

# Build Docker container
cd deployment
docker-compose up --build
```

---

### Day 7: Thesis Writing

Write Chapter 4 using the outline in `thesis/chapter4_outline.md`

---

## 📊 Expected Model Performance

### Model 1: Service Classifier
- **Category Accuracy**: 85-92% (Chinese benchmark)
- **Priority Accuracy**: 78-85%
- **Processing Time Estimation**: ±2 days accuracy

### Model 2: Predictive Maintenance
- **Failure Prediction Accuracy**: 75-85% (Chinese benchmark)
- **Risk Assessment**: 80-90% accuracy
- **Maintenance Date**: ±7 days accuracy

---

## 🆘 Troubleshooting

### Issue: "Firebase connection failed"
**Solution**: Make sure firebase-service-account.json is in the correct location

### Issue: "Not enough training data"
**Solution**: The script will automatically generate synthetic data

### Issue: "Module not found"
**Solution**: Make sure virtual environment is activated: `venv\Scripts\activate`

### Issue: "CUDA out of memory" (if using GPU)
**Solution**: Use CPU-only models (XGBoost + TF-IDF) instead of BERT

---

## 📞 Need Help?

1. Check the detailed README.md
2. Review Chinese smart park references
3. Check model training logs in `models/` directories

---

## 🎯 Success Criteria

By the end of 7 days, you should have:

- ✅ Two trained AI models
- ✅ Working FastAPI server
- ✅ Integration with React platform
- ✅ Chapter 4 draft completed
- ✅ System ready for deployment

---

## 🔄 Next Steps After 7 Days

1. Collect more real data to improve models
2. Fine-tune hyperparameters
3. Deploy to cloud (AWS/Azure/Google Cloud)
4. Set up monitoring and logging
5. Complete remaining thesis chapters

Good luck! 🚀🇪🇹
