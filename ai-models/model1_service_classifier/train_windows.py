"""
Model 1 Training - Windows Compatible Version
Service Request Classifier for IPDC Platform
Adapted from Chinese Smart Park Systems (Alibaba ET Industrial Brain + Tencent WeCity)
"""

import os
import sys
import warnings
warnings.filterwarnings('ignore')

# Set UTF-8 encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

import pandas as pd
import numpy as np
from datetime import datetime
import joblib
import json

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report, confusion_matrix, mean_absolute_error, r2_score
import xgboost as xgb

import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns

print("\n" + "="*70)
print("  IPDC PLATFORM - MODEL 1: SMART SERVICE CLASSIFIER")
print("  Adapted from Chinese Smart Park Systems")
print("  (Alibaba ET Industrial Brain + Tencent WeCity)")
print("="*70)

# ====================================================================
# 1. LOAD DATA
# ====================================================================

print("\n[STEP 1/6] Loading training data...")

data_file = '../data/raw/service_requests_synthetic.csv'

if not os.path.exists(data_file):
    print(f"\nERROR: Data file not found: {data_file}")
    print("Please run: py ../data/generate_training_data.py")
    sys.exit(1)

df = pd.read_csv(data_file, encoding='utf-8')
print(f"  Loaded {len(df)} service requests")
print(f"  Features: {df.shape[1]} columns")
print(f"  Service types: {df['serviceType'].nunique()}")
print(f"  Priorities: {df['priority'].nunique()}")

# ====================================================================
# 2. FEATURE ENGINEERING
# ====================================================================

print("\n[STEP 2/6] Engineering features...")

# Combine text fields
df['text'] = df['title'].fillna('') + ' ' + df['description'].fillna('')

# Extract temporal features
df['createdAt'] = pd.to_datetime(df['createdAt'])
df['hour_of_day'] = df['createdAt'].dt.hour
df['day_of_week'] = df['createdAt'].dt.dayofweek

# Text length features
df['text_length'] = df['text'].str.len()
df['word_count'] = df['text'].str.split().str.len()

print(f"  Created text features: {df['text'].str.len().mean():.0f} avg chars")
print(f"  Temporal features: hour, day_of_week")
print(f"  Metadata features: text_length, word_count")

# ====================================================================
# 3. TEXT VECTORIZATION (TF-IDF)
# ====================================================================

print("\n[STEP 3/6] Vectorizing text with TF-IDF...")

vectorizer = TfidfVectorizer(
    max_features=1000,
    ngram_range=(1, 2),
    min_df=2,
    max_df=0.8,
    strip_accents='unicode'
)

X_text = vectorizer.fit_transform(df['text']).toarray()
print(f"  TF-IDF features: {X_text.shape[1]} dimensions")
print(f"  Vocabulary size: {len(vectorizer.vocabulary_)}")

# ====================================================================
# 4. PREPARE FEATURES AND LABELS
# ====================================================================

print("\n[STEP 4/6] Preparing features and labels...")

# Combine TF-IDF + metadata features
metadata_features = df[['hour_of_day', 'day_of_week', 'text_length', 'word_count']].values
scaler = StandardScaler()
metadata_scaled = scaler.fit_transform(metadata_features)

X = np.hstack([X_text, metadata_scaled])
print(f"  Total feature dimensions: {X.shape[1]}")

# Encode labels
le_service = LabelEncoder()
le_priority = LabelEncoder()

y_service = le_service.fit_transform(df['serviceType'])
y_priority = le_priority.fit_transform(df['priority'])

# Processing time (for requests that are completed)
df_completed = df[df['actual_processing_days'].notna()].copy()
if len(df_completed) > 0:
    y_time = df_completed['actual_processing_days'].values
    X_time = X[df_completed.index]
else:
    y_time = None
    X_time = None

print(f"  Service types encoded: {len(le_service.classes_)} classes")
print(f"  Priorities encoded: {len(le_priority.classes_)} classes")
print(f"  Processing time records: {len(df_completed) if y_time is not None else 0}")

# ====================================================================
# 5. TRAIN MODELS
# ====================================================================

print("\n[STEP 5/6] Training XGBoost models...")

# Create models directory
os.makedirs('models', exist_ok=True)

# Split data
X_train, X_test, y_service_train, y_service_test = train_test_split(
    X, y_service, test_size=0.2, random_state=42, stratify=y_service
)

_, _, y_priority_train, y_priority_test = train_test_split(
    X, y_priority, test_size=0.2, random_state=42, stratify=y_service
)

print(f"\n  Training set: {len(X_train)} samples")
print(f"  Test set: {len(X_test)} samples")

# -------- Model A: Service Category Classifier --------
print("\n  [1/3] Training Service Category Classifier...")

model_category = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    random_state=42,
    eval_metric='mlogloss'
)

model_category.fit(X_train, y_service_train)
y_service_pred = model_category.predict(X_test)
accuracy_service = (y_service_pred == y_service_test).mean()

print(f"        Validation Accuracy: {accuracy_service*100:.2f}%")

# -------- Model B: Priority Predictor --------
print("\n  [2/3] Training Priority Predictor...")

model_priority = xgb.XGBClassifier(
    n_estimators=100,
    max_depth=6,
    learning_rate=0.1,
    random_state=42,
    eval_metric='mlogloss'
)

model_priority.fit(X_train, y_priority_train)
y_priority_pred = model_priority.predict(X_test)
accuracy_priority = (y_priority_pred == y_priority_test).mean()

print(f"        Validation Accuracy: {accuracy_priority*100:.2f}%")

# -------- Model C: Processing Time Estimator --------
print("\n  [3/3] Training Processing Time Estimator...")

if y_time is not None and len(y_time) > 100:
    X_time_train, X_time_test, y_time_train, y_time_test = train_test_split(
        X_time, y_time, test_size=0.2, random_state=42
    )

    model_time = xgb.XGBRegressor(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42
    )

    model_time.fit(X_time_train, y_time_train)
    y_time_pred = model_time.predict(X_time_test)
    mae_time = mean_absolute_error(y_time_test, y_time_pred)
    r2_time = r2_score(y_time_test, y_time_pred)

    print(f"        Validation MAE: {mae_time:.2f} days")
    print(f"        R2 Score: {r2_time:.3f}")
else:
    model_time = None
    mae_time = None
    r2_time = None
    print("        Skipped (insufficient data)")

# ====================================================================
# 6. SAVE MODELS AND VISUALIZATIONS
# ====================================================================

print("\n[STEP 6/6] Saving models and generating visualizations...")

# Save models
joblib.dump(model_category, 'models/model_category.pkl')
joblib.dump(model_priority, 'models/model_priority.pkl')
joblib.dump(vectorizer, 'models/vectorizer.pkl')
joblib.dump(scaler, 'models/scaler.pkl')
joblib.dump(le_service, 'models/label_encoder_service.pkl')
joblib.dump(le_priority, 'models/label_encoder_priority.pkl')

if model_time is not None:
    joblib.dump(model_time, 'models/model_time.pkl')

print("  Saved 7 model files")

# Save metadata
metadata = {
    'model_name': 'IPDC Service Classifier',
    'version': '1.0',
    'training_date': datetime.now().isoformat(),
    'training_samples': len(df),
    'service_types': list(le_service.classes_),
    'priorities': list(le_priority.classes_),
    'feature_dimensions': X.shape[1],
    'metrics': {
        'service_accuracy': float(accuracy_service),
        'priority_accuracy': float(accuracy_priority),
        'time_mae': float(mae_time) if mae_time is not None else None,
        'time_r2': float(r2_time) if r2_time is not None else None
    }
}

with open('models/metadata.json', 'w', encoding='utf-8') as f:
    json.dump(metadata, f, indent=2)

print("  Saved metadata.json")

# Generate confusion matrix visualization
cm = confusion_matrix(y_service_test, y_service_pred)
plt.figure(figsize=(12, 10))
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
            xticklabels=le_service.classes_,
            yticklabels=le_service.classes_)
plt.title('Service Category Classification - Confusion Matrix')
plt.xlabel('Predicted')
plt.ylabel('Actual')
plt.xticks(rotation=45, ha='right')
plt.yticks(rotation=0)
plt.tight_layout()
plt.savefig('models/confusion_matrix_category.png', dpi=150, bbox_inches='tight')
plt.close()

print("  Saved confusion_matrix_category.png")

# Generate time prediction scatter plot
if model_time is not None:
    plt.figure(figsize=(10, 8))
    plt.scatter(y_time_test, y_time_pred, alpha=0.5)
    plt.plot([y_time_test.min(), y_time_test.max()],
             [y_time_test.min(), y_time_test.max()],
             'r--', linewidth=2)
    plt.xlabel('Actual Processing Time (days)')
    plt.ylabel('Predicted Processing Time (days)')
    plt.title(f'Processing Time Prediction\n(MAE: {mae_time:.2f} days, R2: {r2_time:.3f})')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig('models/time_prediction_scatter.png', dpi=150, bbox_inches='tight')
    plt.close()

    print("  Saved time_prediction_scatter.png")

# ====================================================================
# TRAINING COMPLETE
# ====================================================================

print("\n" + "="*70)
print("  MODEL TRAINING COMPLETE!")
print("="*70)

print("\nFinal Results:")
print(f"  Category Accuracy:  {accuracy_service*100:.2f}%")
print(f"  Priority Accuracy:  {accuracy_priority*100:.2f}%")
if mae_time is not None:
    print(f"  Time Estimation MAE: {mae_time:.2f} days")

print("\nModels saved to: model1_service_classifier/models/")
print("  - model_category.pkl")
print("  - model_priority.pkl")
print("  - model_time.pkl" if model_time is not None else "  - model_time.pkl (skipped)")
print("  - vectorizer.pkl")
print("  - scaler.pkl")
print("  - label_encoder_service.pkl")
print("  - label_encoder_priority.pkl")
print("  - metadata.json")
print("  - confusion_matrix_category.png")
if model_time is not None:
    print("  - time_prediction_scatter.png")

print("\n" + "="*70)
print("  SUCCESS CRITERIA CHECK:")
print("="*70)

success = True
if accuracy_service >= 0.80:
    print(f"  [PASS] Service Category Accuracy: {accuracy_service*100:.2f}% (Target: >80%)")
else:
    print(f"  [FAIL] Service Category Accuracy: {accuracy_service*100:.2f}% (Target: >80%)")
    success = False

if accuracy_priority >= 0.75:
    print(f"  [PASS] Priority Accuracy: {accuracy_priority*100:.2f}% (Target: >75%)")
else:
    print(f"  [FAIL] Priority Accuracy: {accuracy_priority*100:.2f}% (Target: >75%)")
    success = False

if mae_time is not None:
    if mae_time <= 5.0:
        print(f"  [PASS] Time Estimation MAE: {mae_time:.2f} days (Target: <5 days)")
    else:
        print(f"  [FAIL] Time Estimation MAE: {mae_time:.2f} days (Target: <5 days)")
        success = False

print("\n" + "="*70)

if success:
    print("  ALL TARGETS MET! Ready for Model 2 training.")
else:
    print("  Some targets not met. Consider regenerating data with more samples.")

print("="*70 + "\n")

sys.exit(0 if success else 1)
