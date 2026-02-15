#!/usr/bin/env bash
# =============================================================
# IPDC-OSS AI Backend - Render Build Script
# Installs dependencies and retrains Model 1 with diverse data
# Adapted from Alibaba ET Industrial Brain & Tencent WeCity
# =============================================================

set -e

echo "=========================================="
echo "  IPDC-OSS AI Backend - Build Script"
echo "=========================================="

# Step 1: Install dependencies
echo ""
echo "[1/3] Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements_api.txt

# Step 2: Retrain Model 1 (Service Classifier) with diverse data
echo ""
echo "[2/3] Retraining Model 1: Service Classifier..."
echo "  Using diverse training data (2200 records, 11 service types)"
cd model1_service_classifier
python train.py
cd ..
echo "  Model 1 retrained successfully!"

# Step 3: Verify Model 1 is loadable (Models 2 & 3 verified at server startup)
echo ""
echo "[3/3] Verifying Model 1..."
python -c "
import joblib, json
from pathlib import Path

model_path = Path('model1_service_classifier/models')
classifier = joblib.load(model_path / 'model_category.pkl')
vectorizer = joblib.load(model_path / 'vectorizer.pkl')
metadata = json.load(open(model_path / 'metadata.json'))
print(f'  Model 1 v{metadata.get(\"version\", \"1.0\")} loaded OK')
print(f'  Service types: {len(metadata.get(\"service_types\", []))}')
print(f'  Training samples: {metadata.get(\"training_samples\", \"unknown\")}')
print('  Model 1 verified!')
"

echo ""
echo "=========================================="
echo "  Build complete! Ready to start server."
echo "=========================================="
