"""
Model 2: Predictive Maintenance System Training Script
Adapted from Huawei FusionPlant & Siemens MindSphere

This model predicts asset failures and recommends maintenance dates
for IPDC industrial park assets (HVAC, electrical, water, machinery).
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.ensemble import RandomForestClassifier, GradientBoostingRegressor
from sklearn.metrics import (
    accuracy_score, precision_recall_fscore_support,
    classification_report, confusion_matrix,
    mean_absolute_error, mean_squared_error, r2_score
)
import joblib
import json
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import seaborn as sns
import warnings
warnings.filterwarnings('ignore')

print("=" * 70)
print("  IPDC Platform - Model 2: Predictive Maintenance System")
print("  Adapted from Huawei FusionPlant + Siemens MindSphere")
print("=" * 70)

# Configuration
class Config:
    # Paths
    DATA_DIR = Path(__file__).parent.parent / 'data'
    RAW_DATA_DIR = DATA_DIR / 'raw'
    PROCESSED_DATA_DIR = DATA_DIR / 'processed'
    MODEL_DIR = Path(__file__).parent / 'models'

    # Data files
    ASSET_MAINTENANCE_FILE = 'asset_maintenance.csv'
    SYNTHETIC_ASSET_FILE = 'asset_maintenance_synthetic.csv'

    # Model parameters (Chinese/German industrial benchmark)
    TEST_SIZE = 0.15
    VAL_SIZE = 0.15
    RANDOM_STATE = 42

    # Random Forest for failure classification
    RF_PARAMS = {
        'n_estimators': 100,
        'max_depth': 10,
        'min_samples_split': 5,
        'min_samples_leaf': 2,
        'random_state': 42,
        'n_jobs': -1
    }

    # Gradient Boosting for days until failure
    GB_PARAMS = {
        'n_estimators': 100,
        'max_depth': 5,
        'learning_rate': 0.1,
        'random_state': 42
    }

config = Config()

# Create directories
config.MODEL_DIR.mkdir(parents=True, exist_ok=True)
config.PROCESSED_DATA_DIR.mkdir(parents=True, exist_ok=True)


def load_data():
    """Load asset maintenance data (real or synthetic)"""
    print("\n📂 Loading asset maintenance data...")

    # Try to load real data first
    real_data_path = config.RAW_DATA_DIR / config.ASSET_MAINTENANCE_FILE
    synthetic_data_path = config.RAW_DATA_DIR / config.SYNTHETIC_ASSET_FILE

    df = None
    data_source = "unknown"

    if real_data_path.exists():
        df = pd.read_csv(real_data_path)
        data_source = "real"
        print(f"   ✅ Loaded {len(df)} real asset records from Firebase")

    if synthetic_data_path.exists():
        df_synthetic = pd.read_csv(synthetic_data_path)
        if df is not None:
            df = pd.concat([df, df_synthetic], ignore_index=True)
            data_source = "combined"
            print(f"   ✅ Added {len(df_synthetic)} synthetic records (total: {len(df)})")
        else:
            df = df_synthetic
            data_source = "synthetic"
            print(f"   ✅ Loaded {len(df_synthetic)} synthetic asset maintenance records")

    if df is None or len(df) == 0:
        print("   ❌ No data found! Please run data/generate_asset_data.py first")
        sys.exit(1)

    print(f"\n   📊 Data source: {data_source}")
    print(f"   📊 Total records: {len(df)}")
    print(f"   📊 Columns: {list(df.columns)}")

    return df, data_source


def preprocess_data(df):
    """
    Preprocess asset maintenance data
    Huawei approach: time-series features + condition indicators
    """
    print("\n🔧 Preprocessing data...")

    # Handle missing values
    df = df.fillna({
        'last_maintenance_days_ago': 365,
        'temperature': 25,
        'vibration_level': 0,
        'operating_hours': 0,
        'failure_count': 0
    })

    # Calculate age in years
    df['age_years'] = df['age_months'] / 12.0

    # Calculate condition score (0-100)
    # Lower is better: young age, recent maintenance, low failures
    df['condition_score'] = (
        (df['age_months'] / 120.0 * 30) +  # Age factor (max 30 points)
        (df['last_maintenance_days_ago'] / 365.0 * 30) +  # Maintenance recency (max 30)
        (df['failure_count'] * 10) +  # Failure history (10 points each)
        (df['operating_hours'] / 20000.0 * 10)  # Usage factor (max 10)
    ).clip(0, 100)

    # Ensure target variables exist
    if 'will_fail_soon' not in df.columns:
        print("   ❌ 'will_fail_soon' column not found!")
        sys.exit(1)

    if 'days_until_failure' not in df.columns:
        print("   ⚠️  'days_until_failure' not found, using estimates")
        df['days_until_failure'] = 90

    if 'risk_level' not in df.columns:
        print("   ⚠️  'risk_level' not found, deriving from condition")
        df['risk_level'] = pd.cut(
            df['condition_score'],
            bins=[0, 25, 50, 75, 100],
            labels=['low', 'medium', 'high', 'critical']
        )

    print(f"   ✅ Preprocessed {len(df)} records")
    print(f"   📊 Asset types: {df['asset_type'].value_counts().to_dict()}")
    print(f"   📊 Will fail soon: {df['will_fail_soon'].value_counts().to_dict()}")
    print(f"   📊 Risk levels: {df['risk_level'].value_counts().to_dict()}")

    return df


def engineer_features(df, fit_scaler=True, scaler=None, le_asset=None):
    """
    Feature engineering (Huawei/Siemens approach)
    Combines sensor data with maintenance history
    """
    print("\n🔬 Engineering features...")

    # Encode asset type
    if fit_scaler:
        le_asset = LabelEncoder()
        df['asset_type_encoded'] = le_asset.fit_transform(df['asset_type'])
    else:
        df['asset_type_encoded'] = le_asset.transform(df['asset_type'])

    # Select numerical features
    feature_cols = [
        'asset_type_encoded',
        'age_months',
        'age_years',
        'last_maintenance_days_ago',
        'operating_hours',
        'failure_count',
        'temperature',
        'vibration_level',
        'condition_score'
    ]

    X = df[feature_cols].values

    # Scale features
    if fit_scaler:
        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)
    else:
        X_scaled = scaler.transform(X)

    print(f"   ✅ Features: {X_scaled.shape[1]} dimensions")
    print(f"   📊 Feature names: {feature_cols}")

    return X_scaled, scaler, le_asset, feature_cols


def prepare_targets(df):
    """Prepare target variables"""
    print("\n🎯 Preparing target variables...")

    # Binary failure prediction
    y_failure = df['will_fail_soon'].astype(int).values
    print(f"   ✅ Failure prediction: {y_failure.sum()} will fail, {len(y_failure)-y_failure.sum()} won't")

    # Days until failure (for assets that will fail)
    y_days = df['days_until_failure'].values
    print(f"   ✅ Days until failure: mean={y_days.mean():.1f}, std={y_days.std():.1f}")

    # Risk level classification
    le_risk = LabelEncoder()
    y_risk = le_risk.fit_transform(df['risk_level'].astype(str))
    print(f"   ✅ Risk levels: {list(le_risk.classes_)}")

    return y_failure, y_days, y_risk, le_risk


def split_data(X, y_failure, y_days, y_risk):
    """Split data into train/val/test sets"""
    print("\n✂️  Splitting data...")

    # First split: train+val vs test
    X_trainval, X_test, \
    y_failure_trainval, y_failure_test, \
    y_days_trainval, y_days_test, \
    y_risk_trainval, y_risk_test = train_test_split(
        X, y_failure, y_days, y_risk,
        test_size=config.TEST_SIZE,
        random_state=config.RANDOM_STATE,
        stratify=y_failure
    )

    # Second split: train vs val
    val_size_adjusted = config.VAL_SIZE / (1 - config.TEST_SIZE)
    X_train, X_val, \
    y_failure_train, y_failure_val, \
    y_days_train, y_days_val, \
    y_risk_train, y_risk_val = train_test_split(
        X_trainval, y_failure_trainval, y_days_trainval, y_risk_trainval,
        test_size=val_size_adjusted,
        random_state=config.RANDOM_STATE,
        stratify=y_failure_trainval
    )

    print(f"   ✅ Train set: {X_train.shape[0]} samples")
    print(f"   ✅ Val set: {X_val.shape[0]} samples")
    print(f"   ✅ Test set: {X_test.shape[0]} samples")

    return (X_train, X_val, X_test,
            y_failure_train, y_failure_val, y_failure_test,
            y_days_train, y_days_val, y_days_test,
            y_risk_train, y_risk_val, y_risk_test)


def train_models(X_train, X_val,
                y_failure_train, y_failure_val,
                y_days_train, y_days_val,
                y_risk_train, y_risk_val):
    """
    Train predictive maintenance models
    Huawei FusionPlant ensemble approach
    """
    print("\n🚀 Training predictive maintenance models...")
    print("   (Huawei FusionPlant + Siemens MindSphere approach)\n")

    models = {}

    # Model 1: Failure Prediction (Binary Classification)
    print("   [1/3] Training Failure Predictor...")
    model_failure = RandomForestClassifier(**config.RF_PARAMS)
    model_failure.fit(X_train, y_failure_train)

    y_failure_pred = model_failure.predict(X_val)
    acc_failure = accuracy_score(y_failure_val, y_failure_pred)
    print(f"        ✅ Validation Accuracy: {acc_failure*100:.2f}%")
    models['failure'] = model_failure

    # Model 2: Days Until Failure (Regression)
    print("\n   [2/3] Training Failure Timeline Estimator...")
    model_days = GradientBoostingRegressor(**config.GB_PARAMS)
    model_days.fit(X_train, y_days_train)

    y_days_pred = model_days.predict(X_val)
    mae_days = mean_absolute_error(y_days_val, y_days_pred)
    print(f"        ✅ Validation MAE: {mae_days:.2f} days")
    models['days'] = model_days

    # Model 3: Risk Level Classifier
    print("\n   [3/3] Training Risk Level Classifier...")
    model_risk = RandomForestClassifier(**config.RF_PARAMS)
    model_risk.fit(X_train, y_risk_train)

    y_risk_pred = model_risk.predict(X_val)
    acc_risk = accuracy_score(y_risk_val, y_risk_pred)
    print(f"        ✅ Validation Accuracy: {acc_risk*100:.2f}%")
    models['risk'] = model_risk

    print("\n   🎉 All models trained successfully!")

    return models


def evaluate_models(models, X_test,
                   y_failure_test, y_days_test, y_risk_test,
                   le_risk, feature_names):
    """Evaluate models on test set"""
    print("\n📊 Evaluating models on test set...")

    results = {}

    # Evaluate Failure Predictor
    print("\n   [1/3] Failure Predictor:")
    y_failure_pred = models['failure'].predict(X_test)
    acc = accuracy_score(y_failure_test, y_failure_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(
        y_failure_test, y_failure_pred, average='binary'
    )

    print(f"        Accuracy:  {acc*100:.2f}%")
    print(f"        Precision: {prec*100:.2f}%")
    print(f"        Recall:    {rec*100:.2f}%")
    print(f"        F1-Score:  {f1*100:.2f}%")

    results['failure'] = {
        'accuracy': float(acc),
        'precision': float(prec),
        'recall': float(rec),
        'f1_score': float(f1)
    }

    # Feature importance plot
    importances = models['failure'].feature_importances_
    indices = np.argsort(importances)[::-1]

    plt.figure(figsize=(10, 6))
    plt.bar(range(len(importances)), importances[indices])
    plt.xticks(range(len(importances)), [feature_names[i] for i in indices], rotation=45, ha='right')
    plt.title('Feature Importance - Failure Prediction')
    plt.xlabel('Features')
    plt.ylabel('Importance')
    plt.tight_layout()
    plt.savefig(config.MODEL_DIR / 'feature_importance_failure.png', dpi=300)
    print(f"        📊 Feature importance saved")

    # Evaluate Days Until Failure
    print("\n   [2/3] Failure Timeline Estimator:")
    y_days_pred = models['days'].predict(X_test)
    mae = mean_absolute_error(y_days_test, y_days_pred)
    rmse = np.sqrt(mean_squared_error(y_days_test, y_days_pred))
    r2 = r2_score(y_days_test, y_days_pred)

    print(f"        MAE:  {mae:.2f} days")
    print(f"        RMSE: {rmse:.2f} days")
    print(f"        R²:   {r2:.3f}")

    results['days'] = {
        'mae': float(mae),
        'rmse': float(rmse),
        'r2_score': float(r2)
    }

    # Scatter plot
    plt.figure(figsize=(10, 6))
    plt.scatter(y_days_test, y_days_pred, alpha=0.5)
    plt.plot([y_days_test.min(), y_days_test.max()],
             [y_days_test.min(), y_days_test.max()],
             'r--', lw=2)
    plt.xlabel('Actual Days Until Failure')
    plt.ylabel('Predicted Days Until Failure')
    plt.title('Failure Timeline Prediction')
    plt.tight_layout()
    plt.savefig(config.MODEL_DIR / 'days_prediction_scatter.png', dpi=300)
    print(f"        📊 Scatter plot saved")

    # Evaluate Risk Level Classifier
    print("\n   [3/3] Risk Level Classifier:")
    y_risk_pred = models['risk'].predict(X_test)
    acc = accuracy_score(y_risk_test, y_risk_pred)
    prec, rec, f1, _ = precision_recall_fscore_support(
        y_risk_test, y_risk_pred, average='weighted'
    )

    print(f"        Accuracy:  {acc*100:.2f}%")
    print(f"        Precision: {prec*100:.2f}%")
    print(f"        Recall:    {rec*100:.2f}%")
    print(f"        F1-Score:  {f1*100:.2f}%")

    results['risk'] = {
        'accuracy': float(acc),
        'precision': float(prec),
        'recall': float(rec),
        'f1_score': float(f1)
    }

    # Confusion matrix
    cm = confusion_matrix(y_risk_test, y_risk_pred)
    plt.figure(figsize=(8, 6))
    sns.heatmap(cm, annot=True, fmt='d', cmap='Reds',
                xticklabels=le_risk.classes_,
                yticklabels=le_risk.classes_)
    plt.title('Risk Level Confusion Matrix')
    plt.ylabel('True Label')
    plt.xlabel('Predicted Label')
    plt.tight_layout()
    plt.savefig(config.MODEL_DIR / 'confusion_matrix_risk.png', dpi=300)
    print(f"        📊 Confusion matrix saved")

    return results


def save_models(models, scaler, le_asset, le_risk, results, data_source, feature_names):
    """Save trained models and metadata"""
    print("\n💾 Saving models...")

    # Save models
    joblib.dump(models['failure'], config.MODEL_DIR / 'model_failure.pkl')
    joblib.dump(models['days'], config.MODEL_DIR / 'model_days.pkl')
    joblib.dump(models['risk'], config.MODEL_DIR / 'model_risk.pkl')
    print("   ✅ Saved trained models")

    # Save preprocessors
    joblib.dump(scaler, config.MODEL_DIR / 'scaler.pkl')
    joblib.dump(le_asset, config.MODEL_DIR / 'label_encoder_asset.pkl')
    joblib.dump(le_risk, config.MODEL_DIR / 'label_encoder_risk.pkl')
    print("   ✅ Saved preprocessors")

    # Save metadata
    metadata = {
        'model_name': 'IPDC Predictive Maintenance System',
        'model_version': '1.0.0',
        'inspiration': 'Huawei FusionPlant + Siemens MindSphere',
        'trained_date': datetime.now().isoformat(),
        'data_source': data_source,
        'asset_types': list(le_asset.classes_),
        'risk_levels': list(le_risk.classes_),
        'feature_names': feature_names,
        'num_features': len(feature_names),
        'performance': results,
        'hyperparameters': {
            'random_forest': config.RF_PARAMS,
            'gradient_boosting': config.GB_PARAMS
        }
    }

    with open(config.MODEL_DIR / 'metadata.json', 'w') as f:
        json.dump(metadata, f, indent=2)
    print("   ✅ Saved metadata")

    print(f"\n   📁 Models saved to: {config.MODEL_DIR}")


def main():
    """Main training pipeline"""
    start_time = datetime.now()

    # Load data
    df, data_source = load_data()

    # Preprocess
    df = preprocess_data(df)

    # Engineer features
    X, scaler, le_asset, feature_names = engineer_features(df, fit_scaler=True)

    # Prepare targets
    y_failure, y_days, y_risk, le_risk = prepare_targets(df)

    # Split data
    splits = split_data(X, y_failure, y_days, y_risk)
    (X_train, X_val, X_test,
     y_failure_train, y_failure_val, y_failure_test,
     y_days_train, y_days_val, y_days_test,
     y_risk_train, y_risk_val, y_risk_test) = splits

    # Train models
    models = train_models(
        X_train, X_val,
        y_failure_train, y_failure_val,
        y_days_train, y_days_val,
        y_risk_train, y_risk_val
    )

    # Evaluate models
    results = evaluate_models(
        models, X_test,
        y_failure_test, y_days_test, y_risk_test,
        le_risk, feature_names
    )

    # Save models
    save_models(models, scaler, le_asset, le_risk, results, data_source, feature_names)

    # Training complete
    duration = (datetime.now() - start_time).total_seconds()

    print("\n" + "=" * 70)
    print("  ✅ MODEL TRAINING COMPLETE!")
    print("=" * 70)
    print(f"\n  ⏱️  Training time: {duration:.1f} seconds")
    print(f"\n  📊 Final Results:")
    print(f"     Failure Prediction Accuracy: {results['failure']['accuracy']*100:.2f}%")
    print(f"     Timeline Estimation MAE:     {results['days']['mae']:.2f} days")
    print(f"     Risk Classification Accuracy: {results['risk']['accuracy']*100:.2f}%")
    print(f"\n  🎯 Industrial Benchmark Comparison:")
    print(f"     Huawei FusionPlant Failure Acc: 80-88%")
    print(f"     Our Model Failure Acc:          {results['failure']['accuracy']*100:.2f}%")
    print(f"\n  📁 Models saved to: {config.MODEL_DIR}")
    print("=" * 70)


if __name__ == "__main__":
    main()
