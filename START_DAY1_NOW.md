# 🚀 START DAY 1 - Model 1 Training (RIGHT NOW!)

**Date:** January 9, 2026
**Time Required:** 4-6 hours
**Goal:** Train Model 1 (Service Classifier) and achieve 80%+ accuracy

---

## ✅ **STEP 1: Check Python Environment (5 minutes)**

### Open Command Prompt and run:

```bash
cd "c:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ai-models"
python --version
```

**Expected Output:** Python 3.9+ or Python 3.10+

If Python is not installed:
1. Download Python 3.10 from https://www.python.org/downloads/
2. During installation, CHECK "Add Python to PATH"
3. Restart command prompt

---

## ✅ **STEP 2: Install Required Libraries (10 minutes)**

```bash
pip install pandas numpy scikit-learn xgboost joblib matplotlib seaborn
```

**Wait for installation to complete...**

To verify installation:
```bash
python -c "import pandas, sklearn, xgboost; print('✅ All libraries installed!')"
```

---

## ✅ **STEP 3: Generate Synthetic Training Data (2 minutes)**

```bash
cd data
python generate_synthetic_data.py
```

**Expected Output:**
```
✅ Generated 1000 synthetic requests
📊 Dataset Statistics:
   Service Types: 11
   ...
💾 Saved to: data/raw/service_requests_synthetic.csv
```

**Verify the data file was created:**
```bash
dir raw\service_requests_synthetic.csv
```

---

## ✅ **STEP 4: Train Model 1 (30-45 minutes)**

```bash
cd ..
cd model1_service_classifier
python train.py
```

### **What Will Happen:**
1. Loads 1000 synthetic service requests
2. Preprocesses text (title + description)
3. Extracts TF-IDF features (1000 dimensions)
4. Trains 3 XGBoost models:
   - **Model A:** Service Category Classifier (11 classes)
   - **Model B:** Priority Predictor (4 levels)
   - **Model C:** Processing Time Estimator (regression)
5. Evaluates on test set
6. Saves trained models to `models/` folder

### **Expected Output:**
```
🚀 Training AI models...

   [1/3] Training Service Category Classifier...
        ✅ Validation Accuracy: 87.XX%

   [2/3] Training Priority Predictor...
        ✅ Validation Accuracy: 82.XX%

   [3/3] Training Processing Time Estimator...
        ✅ Validation MAE: X.XX days

✅ MODEL TRAINING COMPLETE!

📊 Final Results:
   Category Accuracy:  85-92%
   Priority Accuracy:  80-88%
   Time Estimation MAE: 2-4 days

📁 Models saved to: model1_service_classifier/models/
```

---

## ✅ **STEP 5: Verify Models Were Saved (1 minute)**

```bash
dir models\
```

**You Should See:**
- `model_category.pkl` (XGBoost service classifier)
- `model_priority.pkl` (XGBoost priority predictor)
- `model_time.pkl` (XGBoost time estimator)
- `vectorizer.pkl` (TF-IDF vectorizer)
- `scaler.pkl` (Feature scaler)
- `label_encoder_service.pkl` (Service type encoder)
- `label_encoder_priority.pkl` (Priority encoder)
- `metadata.json` (Model info)
- `confusion_matrix_category.png` (Visualization)
- `time_prediction_scatter.png` (Visualization)

---

## ✅ **STEP 6: Review Model Performance (5 minutes)**

### Open and check these files:

1. **metadata.json** - Shows model accuracy metrics
   ```bash
   type models\metadata.json
   ```

2. **confusion_matrix_category.png** - Shows classification accuracy per service type
   - Open in Windows Photo Viewer
   - Should show high values on diagonal (correct predictions)

3. **time_prediction_scatter.png** - Shows time estimation accuracy
   - Open in Windows Photo Viewer
   - Points should be close to the red diagonal line

---

## ✅ **STEP 7: Test Model with Sample Prediction (5 minutes)**

Create a quick test script:

```bash
cd ..
echo import joblib > test_model.py
echo import numpy as np >> test_model.py
echo. >> test_model.py
echo # Load models >> test_model.py
echo model = joblib.load('model1_service_classifier/models/model_category.pkl') >> test_model.py
echo vectorizer = joblib.load('model1_service_classifier/models/vectorizer.pkl') >> test_model.py
echo le_service = joblib.load('model1_service_classifier/models/label_encoder_service.pkl') >> test_model.py
echo. >> test_model.py
echo # Test prediction >> test_model.py
echo test_text = "Investment Permit Application for textile manufacturing" >> test_model.py
echo X_test = vectorizer.transform([test_text]).toarray() >> test_model.py
echo X_test = np.hstack([X_test, [[9, 1, 50, 10]]]) # Add metadata >> test_model.py
echo prediction = model.predict(X_test) >> test_model.py
echo print(f"Predicted service type: {le_service.inverse_transform(prediction)[0]}") >> test_model.py
echo. >> test_model.py

python test_model.py
```

**Expected Output:**
```
Predicted service type: investment_permit
```

✅ **If you see this, Model 1 is working correctly!**

---

## 📊 **SUCCESS CRITERIA (Check These)**

- ✅ Service Category Accuracy: **>80%** (Target: 85%+)
- ✅ Priority Accuracy: **>75%** (Target: 80%+)
- ✅ Time Estimation MAE: **<5 days** (Target: 2-4 days)
- ✅ All 8 model files saved successfully
- ✅ Visualizations generated (2 PNG files)
- ✅ Test prediction works

---

## ⚠️ **TROUBLESHOOTING**

### **Problem 1: Python not found**
**Solution:** Install Python 3.10 from python.org, check "Add to PATH"

### **Problem 2: Module not found (pandas, sklearn, etc.)**
**Solution:**
```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### **Problem 3: Training accuracy too low (<75%)**
**Possible Causes:**
- Insufficient training data (need 1000+ samples)
- Imbalanced classes (some service types have very few examples)

**Solution:** Regenerate data with more samples:
```bash
# Edit generate_synthetic_data.py, change:
# df = generate_requests(n_samples=2000, seed=42)  # Increase to 2000
```

### **Problem 4: Training takes too long (>1 hour)**
**Solution:** Reduce model complexity in `train.py`:
```python
# Change:
'n_estimators': 100  # to 50
'max_depth': 6       # to 4
```

---

## 🎯 **WHAT TO DO NEXT (After Model 1 Completes)**

### **Take Screenshots:**
1. Command prompt showing training completion
2. `confusion_matrix_category.png`
3. `time_prediction_scatter.png`
4. Directory listing showing all saved model files

### **Document Results:**
Create a file `MODEL1_RESULTS.md` with:
- Training accuracy metrics
- Test accuracy metrics
- Training time
- Screenshots

### **Update Todo List:**
✅ Mark "Generate 1000 synthetic service requests" as COMPLETED
✅ Mark "Run Model 1 training script" as COMPLETED
✅ Move to next task: "Build and train Model 2"

---

## 📅 **TIMELINE CHECK**

If you complete Model 1 today (Day 1):
- ✅ **ON SCHEDULE** - Start Day 2 tomorrow (Model 2)

If Model 1 takes 2 days:
- ⚠️ **Slight delay** - You'll need to work faster on Model 2
- Consider simplifying Model 3 or skipping the map

---

## 🆘 **NEED HELP?**

### **If stuck, ask Claude Code:**
- "Model 1 training failed with error: [paste error]"
- "Model 1 accuracy is only 65%, how to improve?"
- "How do I visualize Model 1 results?"

### **Quick Commands Reference:**
```bash
# Navigate to ai-models folder
cd "c:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ai-models"

# Generate data
python data/generate_synthetic_data.py

# Train Model 1
python model1_service_classifier/train.py

# Check if models exist
dir model1_service_classifier\models\

# View metadata
type model1_service_classifier\models\metadata.json
```

---

## ✅ **FINAL CHECKLIST FOR DAY 1**

Before ending Day 1, ensure:
- [ ] Python 3.10+ installed
- [ ] All required libraries installed
- [ ] 1000 synthetic service requests generated
- [ ] Model 1 trained successfully
- [ ] Service category accuracy >80%
- [ ] 8 model files saved
- [ ] 2 visualization PNG files created
- [ ] Screenshots taken for thesis
- [ ] Results documented in MODEL1_RESULTS.md

---

**Status:** Ready to start Model 1 training
**Estimated Time:** 4-6 hours total
**Next Task:** Day 2 - Build Model 2 (Predictive Maintenance)

---

**🚀 START NOW! Run the commands in sequence and track your progress!**
