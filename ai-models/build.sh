#!/usr/bin/env bash
# =============================================================
# IPDC-OSS AI Backend - Render Build Script
# Installs dependencies and retrains ALL 3 models on deploy
# Adapted from Alibaba ET Industrial Brain & Tencent WeCity
# =============================================================

set -e

echo "=========================================="
echo "  IPDC-OSS AI Backend - Build Script"
echo "=========================================="

# Step 1: Install dependencies
echo ""
echo "[1/5] Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements_api.txt

# Step 2: Retrain Model 1 (Service Classifier) with diverse data
echo ""
echo "[2/5] Retraining Model 1: Service Classifier..."
echo "  Using diverse training data (2200 records, 11 service types)"
cd model1_service_classifier
python train.py
cd ..
echo "  Model 1 retrained successfully!"

# Step 3: Retrain Model 2 (Predictive Maintenance) to fix numpy pickle compatibility
echo ""
echo "[3/5] Retraining Model 2: Predictive Maintenance..."
echo "  Using train_windows.py (compatible with API endpoint expectations)"
cd model2_predictive_maintenance
python train_windows.py
cd ..
echo "  Model 2 retrained successfully!"

# Step 4: Retrain Model 3 (Park Recommendation) with LightGBM
echo ""
echo "[4/5] Retraining Model 3: Park Recommendation..."
echo "  Using LightGBM Ranker (LambdaRank algorithm)"
cd model3_park_recommendation
python train.py
cd ..
echo "  Model 3 retrained successfully!"

# Step 5: Verify all models are loadable
echo ""
echo "[5/5] Verifying all models..."
python -c "
import joblib, json
from pathlib import Path

# Verify Model 1
model1_path = Path('model1_service_classifier/models')
joblib.load(model1_path / 'model_category.pkl')
joblib.load(model1_path / 'vectorizer.pkl')
m1 = json.load(open(model1_path / 'metadata.json'))
print(f'  Model 1 v{m1.get(\"version\", \"1.0\")} loaded OK')

# Verify Model 2
model2_path = Path('model2_predictive_maintenance/models')
joblib.load(model2_path / 'model_failure.pkl')
joblib.load(model2_path / 'model_days.pkl')
joblib.load(model2_path / 'model_risk.pkl')
m2 = json.load(open(model2_path / 'metadata.json'))
print(f'  Model 2 v{m2.get(\"version\", \"1.0\")} loaded OK')

# Verify Model 3
model3_path = Path('model3_park_recommendation/models')
joblib.load(model3_path / 'model_ranker.pkl')
m3 = json.load(open(model3_path / 'metadata.json'))
print(f'  Model 3 v{m3.get(\"model_version\", \"1.0\")} loaded OK')

print('  All 3 models verified!')
"

echo ""
echo "=========================================="
echo "  Build complete! All 3 models retrained."
echo "  Ready to start server."
echo "=========================================="
