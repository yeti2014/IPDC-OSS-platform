"""
Model 2: Predictive Maintenance System - Windows Compatible
Adapted from Huawei FusionPlant & Siemens MindSphere

Predicts asset failures and maintenance needs for IPDC industrial parks
"""

import os
import sys
import warnings
warnings.filterwarnings('ignore')

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import joblib
import json

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.metrics import (
    accuracy_score, classification_report, confusion_matrix,
    mean_absolute_error, mean_squared_error, r2_score
)

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import seaborn as sns

print("\n" + "="*70)
print("  IPDC PLATFORM - MODEL 2: PREDICTIVE MAINTENANCE")
print("  Adapted from Huawei FusionPlant + Siemens MindSphere")
print("="*70)

# ====================================================================
# 1. LOAD AND PREPARE DATA
# ====================================================================

print("\n[STEP 1/6] Loading asset maintenance data...")

data_file = '../data/raw/assets_synthetic.csv'

if not os.path.exists(data_file):
    print(f"\nERROR: Data file not found: {data_file}")
    print("Please run: py ../data/generate_training_data.py")
    sys.exit(1)

df = pd.read_csv(data_file, encoding='utf-8')
print(f"  Loaded {len(df)} assets")
print(f"  Features: {df.shape[1]} columns")
print(f"  Asset categories: {df['category'].nunique()}")
print(f"  Asset conditions: {df['condition'].nunique()}")

# ====================================================================
# 2. FEATURE ENGINEERING FOR PREDICTIVE MAINTENANCE
# ====================================================================

print("\n[STEP 2/6] Engineering predictive maintenance features...")

# Convert dates
df['purchaseDate'] = pd.to_datetime(df['purchaseDate'])
df['lastMaintenanceDate'] = pd.to_datetime(df['lastMaintenanceDate'])
df['nextMaintenanceDate'] = pd.to_datetime(df['nextMaintenanceDate'])
df['warrantyExpiry'] = pd.to_datetime(df['warrantyExpiry'])

# Current timestamp
now = datetime.now()

# Derived features
df['days_until_next_maintenance'] = (df['nextMaintenanceDate'] - now).dt.days
df['warranty_active'] = (df['warrantyExpiry'] > now).astype(int)
df['age_years'] = df['age_days'] / 365.25
df['maintenance_frequency'] = df['maintenance_count'] / (df['age_days'] / 365.25 + 1)

# Create failure risk labels based on condition and maintenance status
def calculate_risk_level(row):
    """Calculate risk level based on condition, age, and maintenance"""
    score = 0

    # Condition scoring
    condition_scores = {'excellent': 0, 'good': 1, 'fair': 2, 'poor': 3, 'critical': 4}
    score += condition_scores.get(row['condition'], 2)

    # Age factor
    if row['age_years'] > 5:
        score += 2
    elif row['age_years'] > 3:
        score += 1

    # Maintenance overdue
    if row['days_since_maintenance'] > row['maintenanceInterval']:
        score += 2

    # Map to risk levels
    if score >= 6:
        return 'critical'
    elif score >= 4:
        return 'high'
    elif score >= 2:
        return 'medium'
    else:
        return 'low'

df['risk_level'] = df.apply(calculate_risk_level, axis=1)

# Binary failure prediction (will fail within 30 days)
df['will_fail_soon'] = ((df['failure_probability'] > 20) |
                         (df['condition'].isin(['poor', 'critical'])) |
                         (df['days_since_maintenance'] > df['maintenanceInterval'] * 1.5)).astype(int)

# Days until likely failure (regression target)
df['days_until_failure'] = df.apply(lambda row:
    max(1, int(100 - row['failure_probability']) if row['failure_probability'] < 90 else 1),
    axis=1
)

print(f"  Created predictive features:")
print(f"    - days_until_next_maintenance")
print(f"    - warranty_active")
print(f"    - age_years")
print(f"    - maintenance_frequency")
print(f"    - risk_level (4 categories)")
print(f"    - will_fail_soon (binary)")
print(f"    - days_until_failure (regression)")

print(f"\n  Risk Level Distribution:")
for risk, count in df['risk_level'].value_counts().items():
    print(f"    {risk}: {count}")

print(f"\n  Failure Prediction Distribution:")
print(f"    Will fail soon: {df['will_fail_soon'].sum()}")
print(f"    Safe: {len(df) - df['will_fail_soon'].sum()}")

# ====================================================================
# 3. PREPARE FEATURES AND LABELS
# ====================================================================

print("\n[STEP 3/6] Preparing features and labels...")

# Feature columns
feature_cols = [
    'age_days', 'age_years', 'days_since_maintenance',
    'maintenance_count', 'maintenanceInterval',
    'purchaseCost', 'currentValue', 'depreciationRate',
    'failure_probability', 'maintenance_frequency',
    'warranty_active'
]

# Encode categorical features
le_category = LabelEncoder()
le_status = LabelEncoder()
le_condition = LabelEncoder()
le_risk = LabelEncoder()

df['category_encoded'] = le_category.fit_transform(df['category'])
df['status_encoded'] = le_status.fit_transform(df['status'])
df['condition_encoded'] = le_condition.fit_transform(df['condition'])

# Add encoded categories to features
feature_cols.extend(['category_encoded', 'status_encoded', 'condition_encoded'])

# Prepare feature matrix
X = df[feature_cols].copy()

# Handle any missing values
X = X.fillna(X.mean())

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

print(f"  Feature dimensions: {X_scaled.shape[1]}")
print(f"  Training samples: {len(X_scaled)}")

# Target variables
y_failure = df['will_fail_soon'].values
y_days = df['days_until_failure'].values
y_risk = le_risk.fit_transform(df['risk_level'])

print(f"  Target variables prepared:")
print(f"    - Binary failure prediction")
print(f"    - Days until failure (regression)")
print(f"    - Risk level (4 classes)")

# ====================================================================
# 4. TRAIN MODELS
# ====================================================================

print("\n[STEP 4/6] Training predictive maintenance models...")

# Create models directory
os.makedirs('models', exist_ok=True)

# Split data (80% train, 20% test)
X_train, X_test, y_failure_train, y_failure_test = train_test_split(
    X_scaled, y_failure, test_size=0.2, random_state=42, stratify=y_failure
)

_, _, y_days_train, y_days_test = train_test_split(
    X_scaled, y_days, test_size=0.2, random_state=42, stratify=y_failure
)

_, _, y_risk_train, y_risk_test = train_test_split(
    X_scaled, y_risk, test_size=0.2, random_state=42, stratify=y_failure
)

print(f"\n  Training set: {len(X_train)} samples")
print(f"  Test set: {len(X_test)} samples")

# -------- Model A: Binary Failure Predictor --------
print("\n  [1/3] Training Binary Failure Predictor...")

model_failure = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42,
    class_weight='balanced'
)

model_failure.fit(X_train, y_failure_train)
y_failure_pred = model_failure.predict(X_test)
accuracy_failure = accuracy_score(y_failure_test, y_failure_pred)

print(f"        Validation Accuracy: {accuracy_failure*100:.2f}%")

# -------- Model B: Days Until Failure (Regression) --------
print("\n  [2/3] Training Days Until Failure Estimator...")

model_days = GradientBoostingRegressor(
    n_estimators=100,
    max_depth=5,
    learning_rate=0.1,
    random_state=42
)

model_days.fit(X_train, y_days_train)
y_days_pred = model_days.predict(X_test)
mae_days = mean_absolute_error(y_days_test, y_days_pred)
r2_days = r2_score(y_days_test, y_days_pred)

print(f"        Validation MAE: {mae_days:.2f} days")
print(f"        R2 Score: {r2_days:.3f}")

# -------- Model C: Risk Level Classifier --------
print("\n  [3/3] Training Risk Level Classifier...")

model_risk = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42,
    class_weight='balanced'
)

model_risk.fit(X_train, y_risk_train)
y_risk_pred = model_risk.predict(X_test)
accuracy_risk = accuracy_score(y_risk_test, y_risk_pred)

print(f"        Validation Accuracy: {accuracy_risk*100:.2f}%")

# ====================================================================
# 5. SAVE MODELS AND VISUALIZATIONS
# ====================================================================

print("\n[STEP 5/6] Saving models and generating visualizations...")

# Save models
joblib.dump(model_failure, 'models/model_failure.pkl')
joblib.dump(model_days, 'models/model_days.pkl')
joblib.dump(model_risk, 'models/model_risk.pkl')
joblib.dump(scaler, 'models/scaler.pkl')
joblib.dump(le_category, 'models/label_encoder_category.pkl')
joblib.dump(le_status, 'models/label_encoder_status.pkl')
joblib.dump(le_condition, 'models/label_encoder_condition.pkl')
joblib.dump(le_risk, 'models/label_encoder_risk.pkl')

print("  Saved 8 model files")

# Save feature names
feature_info = {
    'feature_names': feature_cols,
    'feature_count': len(feature_cols)
}
with open('models/features.json', 'w', encoding='utf-8') as f:
    json.dump(feature_info, f, indent=2)

# Save metadata
metadata = {
    'model_name': 'IPDC Predictive Maintenance',
    'version': '1.0',
    'training_date': datetime.now().isoformat(),
    'training_samples': len(df),
    'asset_categories': list(le_category.classes_),
    'risk_levels': list(le_risk.classes_),
    'feature_dimensions': len(feature_cols),
    'metrics': {
        'failure_prediction_accuracy': float(accuracy_failure),
        'days_estimation_mae': float(mae_days),
        'days_estimation_r2': float(r2_days),
        'risk_classification_accuracy': float(accuracy_risk)
    }
}

with open('models/metadata.json', 'w', encoding='utf-8') as f:
    json.dump(metadata, f, indent=2)

print("  Saved metadata.json and features.json")

# Generate confusion matrix for failure prediction
cm_failure = confusion_matrix(y_failure_test, y_failure_pred)
plt.figure(figsize=(8, 6))
sns.heatmap(cm_failure, annot=True, fmt='d', cmap='Blues',
            xticklabels=['Safe', 'Will Fail'],
            yticklabels=['Safe', 'Will Fail'])
plt.title('Failure Prediction - Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.tight_layout()
plt.savefig('models/confusion_matrix_failure.png', dpi=150, bbox_inches='tight')
plt.close()

print("  Saved confusion_matrix_failure.png")

# Generate scatter plot for days prediction
plt.figure(figsize=(10, 8))
plt.scatter(y_days_test, y_days_pred, alpha=0.5)
plt.plot([y_days_test.min(), y_days_test.max()],
         [y_days_test.min(), y_days_test.max()],
         'r--', linewidth=2)
plt.xlabel('Actual Days Until Failure')
plt.ylabel('Predicted Days Until Failure')
plt.title(f'Days Until Failure Prediction\n(MAE: {mae_days:.2f} days, R2: {r2_days:.3f})')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.savefig('models/days_prediction_scatter.png', dpi=150, bbox_inches='tight')
plt.close()

print("  Saved days_prediction_scatter.png")

# Generate risk level confusion matrix
cm_risk = confusion_matrix(y_risk_test, y_risk_pred)
plt.figure(figsize=(10, 8))
sns.heatmap(cm_risk, annot=True, fmt='d', cmap='Oranges',
            xticklabels=le_risk.classes_,
            yticklabels=le_risk.classes_)
plt.title('Risk Level Classification - Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.tight_layout()
plt.savefig('models/confusion_matrix_risk.png', dpi=150, bbox_inches='tight')
plt.close()

print("  Saved confusion_matrix_risk.png")

# Feature importance
feature_importance = pd.DataFrame({
    'feature': feature_cols,
    'importance': model_failure.feature_importances_
}).sort_values('importance', ascending=False)

plt.figure(figsize=(12, 8))
plt.barh(range(len(feature_importance)), feature_importance['importance'])
plt.yticks(range(len(feature_importance)), feature_importance['feature'])
plt.xlabel('Importance')
plt.title('Feature Importance for Failure Prediction')
plt.tight_layout()
plt.savefig('models/feature_importance.png', dpi=150, bbox_inches='tight')
plt.close()

print("  Saved feature_importance.png")

# ====================================================================
# 6. GENERATE EXAMPLE PREDICTIONS
# ====================================================================

print("\n[STEP 6/6] Generating example predictions...")

# Select 5 sample assets
sample_indices = [10, 50, 100, 200, 300]
samples = df.iloc[sample_indices]

print("\n  Sample Predictions:")
print("  " + "-"*68)

for idx in sample_indices:
    asset = df.iloc[idx]
    X_sample = X_scaled[idx:idx+1]

    fail_prob = model_failure.predict_proba(X_sample)[0][1]
    days_pred = model_days.predict(X_sample)[0]
    risk_pred = le_risk.inverse_transform(model_risk.predict(X_sample))[0]

    print(f"\n  Asset: {asset['name'][:50]}")
    print(f"    Category: {asset['category']}")
    print(f"    Condition: {asset['condition']}")
    print(f"    Age: {asset['age_years']:.1f} years")
    print(f"    Failure Probability: {fail_prob*100:.1f}%")
    print(f"    Days Until Failure: {int(days_pred)}")
    print(f"    Risk Level: {risk_pred.upper()}")

# ====================================================================
# TRAINING COMPLETE
# ====================================================================

print("\n" + "="*70)
print("  MODEL TRAINING COMPLETE!")
print("="*70)

print("\nFinal Results:")
print(f"  Failure Prediction Accuracy: {accuracy_failure*100:.2f}%")
print(f"  Days Estimation MAE: {mae_days:.2f} days")
print(f"  Risk Classification Accuracy: {accuracy_risk*100:.2f}%")

print("\nModels saved to: model2_predictive_maintenance/models/")
print("  - model_failure.pkl")
print("  - model_days.pkl")
print("  - model_risk.pkl")
print("  - scaler.pkl")
print("  - label_encoder_*.pkl (4 files)")
print("  - features.json")
print("  - metadata.json")
print("  - confusion_matrix_failure.png")
print("  - days_prediction_scatter.png")
print("  - confusion_matrix_risk.png")
print("  - feature_importance.png")

print("\n" + "="*70)
print("  SUCCESS CRITERIA CHECK:")
print("="*70)

success = True
if accuracy_failure >= 0.75:
    print(f"  [PASS] Failure Prediction: {accuracy_failure*100:.2f}% (Target: >75%)")
else:
    print(f"  [FAIL] Failure Prediction: {accuracy_failure*100:.2f}% (Target: >75%)")
    success = False

if mae_days <= 10.0:
    print(f"  [PASS] Days Estimation MAE: {mae_days:.2f} days (Target: <10 days)")
else:
    print(f"  [FAIL] Days Estimation MAE: {mae_days:.2f} days (Target: <10 days)")
    success = False

if accuracy_risk >= 0.70:
    print(f"  [PASS] Risk Classification: {accuracy_risk*100:.2f}% (Target: >70%)")
else:
    print(f"  [FAIL] Risk Classification: {accuracy_risk*100:.2f}% (Target: >70%)")
    success = False

print("\n" + "="*70)

if success:
    print("  ALL TARGETS MET! Model 2 training successful!")
else:
    print("  Some targets not met. Consider adjusting parameters.")

print("="*70 + "\n")

sys.exit(0 if success else 1)
