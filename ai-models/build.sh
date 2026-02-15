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
pip install matplotlib seaborn  # needed for training visualizations

# Step 2: Retrain Model 1 (Service Classifier) with diverse data
echo ""
echo "[2/3] Retraining Model 1: Service Classifier..."
echo "  Using diverse training data (2200 records, 11 service types)"
cd model1_service_classifier
python train.py
cd ..
echo "  Model 1 retrained successfully!"

# Step 3: Verify models are loadable
echo ""
echo "[3/3] Verifying all models..."
python -c "
from api.utils.model_loader import ModelLoader
loader = ModelLoader()
models = loader.get_all_models()
print(f'  Loaded {len(models)} models successfully')
for name in models:
    print(f'    - {name}: OK')
print('  All models verified!')
"

echo ""
echo "=========================================="
echo "  Build complete! Ready to start server."
echo "=========================================="
