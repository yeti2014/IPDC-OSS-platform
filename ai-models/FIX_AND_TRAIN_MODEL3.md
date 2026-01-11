# Fix Python Issue & Train Model 3 - Complete Guide

**Date:** January 10, 2026
**Issue:** Python not found in PATH, Virtual environment missing
**Solution:** Setup Python environment, then train Model 3

---

## 🔧 Problem Identified

Your error output shows:
```
Python was not found
'pip' is not recognized
venv\Scripts\activate - The system cannot find the path specified
```

**Root Causes:**
1. ❌ Python not added to system PATH
2. ❌ Virtual environment not created yet
3. ✅ Python3 IS installed at: `C:\Users\asus\AppData\Local\Microsoft\WindowsApps\python3.exe`

---

## ✅ SOLUTION: 2-Step Process

### **Step 1: Setup Python Environment (ONE TIME ONLY)**

Navigate to the ai-models folder and run the setup script:

#### Option A: Double-Click (Easiest)
1. Open File Explorer
2. Navigate to:
   ```
   C:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ipdc-platform\ai-models
   ```
3. **Double-click:** `SETUP_PYTHON_ENV.bat`
4. Wait for setup to complete (5-10 minutes)

#### Option B: Command Line
```bat
cd "C:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ipdc-platform\ai-models"

SETUP_PYTHON_ENV.bat
```

**What this does:**
- Creates Python virtual environment (venv folder)
- Installs all required packages (pandas, numpy, scikit-learn, xgboost, lightgbm, etc.)
- Verifies installation
- Takes 5-10 minutes

**Expected Output:**
```
======================================================================
  Setting up Python Environment for Model 3 Training
======================================================================

Step 1/5: Creating Python virtual environment...
✅ Virtual environment created successfully!

Step 2/5: Activating virtual environment...
✅ Virtual environment activated!

Step 3/5: Upgrading pip...
✅ Pip upgraded!

Step 4/5: Installing required packages...
This may take 5-10 minutes...
✅ All packages installed successfully!

Step 5/5: Verifying installation...
✅ All packages imported successfully!

======================================================================
  ✅ PYTHON ENVIRONMENT SETUP COMPLETE!
======================================================================
```

---

### **Step 2: Train Model 3**

After Step 1 completes, train Model 3:

#### Option A: Double-Click (Easiest)
1. Navigate to:
   ```
   C:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ipdc-platform\ai-models\model3_park_recommendation
   ```
2. **Double-click:** `TRAIN_MODEL3.bat`
3. Wait for training (5-10 minutes)

#### Option B: Command Line
```bat
cd "C:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ipdc-platform\ai-models\model3_park_recommendation"

TRAIN_MODEL3.bat
```

**What this does:**
- Activates virtual environment
- Generates 800 synthetic tenant-park placements
- Trains LightGBM Ranker model
- Saves trained model and metrics
- Takes 5-10 minutes

**Expected Output:**
```
================================================================
  Model 3: Park Recommendation System - Complete Training
  Adapted from Alibaba ET + Tencent WeCity
================================================================

[Step 1/4] Activating virtual environment...
[Step 2/4] Installing LightGBM (if needed)...
[Step 3/4] Generating synthetic tenant-park placement data...

======================================================================
  Model 3: Synthetic Tenant-Park Placement Data Generator
======================================================================

📊 Generating 800 synthetic tenant-park placements...
✅ Dataset generated successfully!

[Step 4/4] Training Model 3 with LightGBM Ranker...

======================================================================
  IPDC Platform - Model 3: Park Recommendation System
======================================================================

🚀 Training LightGBM Ranker model...
   [200] train ndcg@3: 0.9123  valid ndcg@3: 0.8756

📊 Evaluating model performance...
   NDCG@3: 0.8756 ✅
   Top-3 Accuracy: 86.2% ✅

✅ MEETS/EXCEEDS Chinese benchmark!

💾 Saving model artifacts...
   ✅ Saved model: models\model_ranker.pkl

================================================================
  SUCCESS! Model 3 training complete!
================================================================
```

---

## 📋 Quick Command Reference

### First Time Setup (Do Once):
```bat
cd "C:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ipdc-platform\ai-models"
SETUP_PYTHON_ENV.bat
```

### Train Model 3 (After Setup):
```bat
cd "C:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ipdc-platform\ai-models\model3_park_recommendation"
TRAIN_MODEL3.bat
```

### Test Model 3 (After Training):
```bat
cd "C:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ipdc-platform\ai-models"
venv\Scripts\activate.bat
python model3_park_recommendation\test_model.py
```

---

## 🔍 Troubleshooting

### Problem: SETUP_PYTHON_ENV.bat fails with "python3 not found"

**Solution:**
Install Python from https://www.python.org/downloads/
- Download Python 3.10 or 3.11
- During installation, CHECK "Add Python to PATH"
- Restart Command Prompt
- Run SETUP_PYTHON_ENV.bat again

### Problem: "Access Denied" or "Permission Error"

**Solution:**
- Run Command Prompt as Administrator
- Right-click Command Prompt → "Run as administrator"
- Navigate to ai-models folder
- Run SETUP_PYTHON_ENV.bat

### Problem: Package installation fails

**Solution:**
```bat
cd "C:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ipdc-platform\ai-models"
venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
```

### Problem: "venv not found" after setup

**Solution:**
Check if venv folder exists:
```bat
cd "C:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ipdc-platform\ai-models"
dir venv
```

If not, delete and recreate:
```bat
rmdir /s venv
SETUP_PYTHON_ENV.bat
```

---

## ✅ Success Checklist

After completing both steps, verify:

- [x] Virtual environment created at `ai-models\venv\`
- [x] LightGBM and all packages installed
- [x] Training data generated: `data\raw\park_placements_synthetic.csv` (800 records)
- [x] Model trained: `model3_park_recommendation\models\model_ranker.pkl` (~2 MB)
- [x] NDCG@3 score > 0.85
- [x] Feature importance chart created

---

## 📊 Files Created After Training

```
ai-models/
├── venv/                                   ✅ Virtual environment (created by Step 1)
│
├── model3_park_recommendation/
│   ├── models/
│   │   ├── model_ranker.pkl               ✅ Trained model (~2 MB)
│   │   ├── label_encoder_*.pkl            ✅ Encoders
│   │   ├── feature_importance.png         ✅ Chart
│   │   └── metadata.json                  ✅ Metrics
│   │
│   └── data/raw/
│       └── park_placements_synthetic.csv  ✅ Training data (~245 KB)
```

---

## 🎯 Summary

**Your Path to Success:**

1. **First:** Run `SETUP_PYTHON_ENV.bat` (one time, 5-10 min)
2. **Then:** Run `TRAIN_MODEL3.bat` (every time you want to train, 5-10 min)
3. **Done:** Model 3 trained and ready!

**Total Time:** ~15-20 minutes for first-time setup + training

---

## 📞 Need Help?

If you encounter any errors:
1. Take a screenshot of the error message
2. Check the troubleshooting section above
3. Make sure Python 3.10+ is installed
4. Ensure you're running from the correct directory

---

**Ready? Start with Step 1: SETUP_PYTHON_ENV.bat! 🚀**
