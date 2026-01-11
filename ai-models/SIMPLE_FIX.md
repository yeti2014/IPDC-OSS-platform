# SIMPLE FIX - Train Model 3 in 2 Easy Steps

**Your Issue:** Python venv exists but packages not installed yet
**Solution:** Install packages, then train

---

## ✅ Good News!

You already have:
- ✅ Python 3.11.0 installed (via `py` command)
- ✅ Virtual environment created at `venv\`

You just need to:
- ⏳ Install required packages
- ⏳ Train Model 3

---

## 🚀 2 SIMPLE STEPS

### **Step 1: Install Packages (5-10 minutes)**

Open File Explorer and go to:
```
C:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ipdc-platform\ai-models
```

**Double-click:** `INSTALL_PACKAGES.bat`

Wait for it to complete. You'll see:
```
✅ ALL PACKAGES INSTALLED!
✅ All packages verified!
```

---

### **Step 2: Train Model 3 (5-10 minutes)**

Go to:
```
C:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ipdc-platform\ai-models\model3_park_recommendation
```

**Double-click:** `TRAIN_MODEL3.bat`

Wait for it to complete. You'll see:
```
✅ Model 3 training complete!
NDCG@3: 0.8756
```

---

## That's It! 🎉

After Step 2 completes, you'll have:
- ✅ Trained Model 3 at `models\model_ranker.pkl`
- ✅ 800 training samples
- ✅ Performance metrics
- ✅ Feature importance chart

---

## 📋 Quick Reference

**If INSTALL_PACKAGES.bat works:**
Just run it, then run TRAIN_MODEL3.bat. Done!

**If it doesn't work:**
Try manual commands in Command Prompt:

```bat
cd "C:\OSS - IPDC PLATFORM\DEPLOYABLE FINAL Digital OSS PROTOTYPE\DEPLOYABLE FINAL Digital OSS PROTOTYPE\ipdc-platform\ai-models"

venv\Scripts\activate.bat

pip install pandas numpy scikit-learn xgboost joblib matplotlib seaborn lightgbm==4.1.0

cd model3_park_recommendation

python generate_synthetic_placements.py

python train.py

python test_model.py
```

---

**Start with Step 1: INSTALL_PACKAGES.bat! 🚀**
