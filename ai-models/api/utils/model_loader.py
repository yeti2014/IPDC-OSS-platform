"""
Model Loader for IPDC-OSS AI Models
Loads all trained models on startup
"""
import joblib
import json
import os
from pathlib import Path
from typing import Dict, Any


class ModelLoader:
    """Singleton class to load and store all AI models"""

    _instance = None
    _models = {}

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ModelLoader, cls).__new__(cls)
            cls._instance._load_all_models()
        return cls._instance

    def _get_base_path(self) -> Path:
        """Get base path for ai-models directory"""
        current_file = Path(__file__)
        # Navigate from api/utils/model_loader.py to ai-models/
        base_path = current_file.parent.parent.parent
        return base_path

    def _load_all_models(self):
        """Load all trained models (fault-tolerant: each model loads independently)"""
        print("Loading IPDC-OSS AI Models...")
        base_path = self._get_base_path()

        # ==================== MODEL 1: SERVICE CLASSIFIER ====================
        try:
            print("Loading Model 1: Service Classifier...")
            model1_path = base_path / "model1_service_classifier" / "models"

            self._models['model1'] = {
                'classifier': joblib.load(model1_path / "model_category.pkl"),
                'priority_model': joblib.load(model1_path / "model_priority.pkl"),
                'time_model': joblib.load(model1_path / "model_time.pkl"),
                'vectorizer': joblib.load(model1_path / "vectorizer.pkl"),
                'scaler': joblib.load(model1_path / "scaler.pkl"),
                'label_encoder_service': joblib.load(model1_path / "label_encoder_service.pkl"),
                'label_encoder_priority': joblib.load(model1_path / "label_encoder_priority.pkl"),
                'metadata': json.load(open(model1_path / "metadata.json", 'r'))
            }
            print("Model 1 loaded successfully")
        except Exception as e:
            print(f"WARNING: Model 1 (Service Classifier) failed to load: {e}")

        # ==================== MODEL 2: PREDICTIVE MAINTENANCE ====================
        try:
            print("Loading Model 2: Predictive Maintenance...")
            model2_path = base_path / "model2_predictive_maintenance" / "models"

            self._models['model2'] = {
                'failure_model': joblib.load(model2_path / "model_failure.pkl"),
                'days_model': joblib.load(model2_path / "model_days.pkl"),
                'risk_model': joblib.load(model2_path / "model_risk.pkl"),
                'scaler': joblib.load(model2_path / "scaler.pkl"),
                'label_encoder_category': joblib.load(model2_path / "label_encoder_category.pkl"),
                'label_encoder_status': joblib.load(model2_path / "label_encoder_status.pkl"),
                'label_encoder_condition': joblib.load(model2_path / "label_encoder_condition.pkl"),
                'label_encoder_risk': joblib.load(model2_path / "label_encoder_risk.pkl"),
                'features': json.load(open(model2_path / "features.json", 'r')),
                'metadata': json.load(open(model2_path / "metadata.json", 'r'))
            }
            print("Model 2 loaded successfully")
        except Exception as e:
            print(f"WARNING: Model 2 (Predictive Maintenance) failed to load: {e}")
            print("  Model 2 endpoints will return fallback responses.")

        # ==================== MODEL 3: PARK RECOMMENDATION ====================
        try:
            print("Loading Model 3: Park Recommendation...")
            model3_path = base_path / "model3_park_recommendation" / "models"

            self._models['model3'] = {
                'ranker': joblib.load(model3_path / "model_ranker.pkl"),
                'label_encoder_industry': joblib.load(model3_path / "label_encoder_industry.pkl"),
                'label_encoder_park': joblib.load(model3_path / "label_encoder_park.pkl"),
                'label_encoder_region': joblib.load(model3_path / "label_encoder_region.pkl"),
                'feature_names': json.load(open(model3_path / "feature_names.json", 'r')),
                'metadata': json.load(open(model3_path / "metadata.json", 'r'))
            }
            print("Model 3 loaded successfully")
        except Exception as e:
            print(f"WARNING: Model 3 (Park Recommendation) failed to load: {e}")
            print("  Model 3 endpoints will return fallback responses.")

        # Summary
        loaded = list(self._models.keys())
        print(f"\nModels loaded: {loaded} ({len(loaded)}/3)")
        if 'model1' in self._models:
            print(f"  Model 1 version: {self._models['model1']['metadata'].get('version', 'unknown')}")
        if 'model2' in self._models:
            print(f"  Model 2 version: {self._models['model2']['metadata'].get('version', 'unknown')}")
        if 'model3' in self._models:
            print(f"  Model 3 version: {self._models['model3']['metadata'].get('model_version', 'unknown')}")

        if not loaded:
            raise RuntimeError("FATAL: No models could be loaded. Server cannot start.")

    def get_model(self, model_name: str) -> Dict[str, Any]:
        """Get a specific model by name"""
        if model_name not in self._models:
            available = list(self._models.keys())
            raise ValueError(
                f"Model '{model_name}' is not available (failed to load due to compatibility issues). "
                f"Loaded models: {available}"
            )
        return self._models[model_name]

    def get_all_models(self) -> Dict[str, Any]:
        """Get all loaded models"""
        return self._models

    def is_model_loaded(self, model_name: str) -> bool:
        """Check if a model is loaded"""
        return model_name in self._models


# Global model loader instance
model_loader = ModelLoader()


def get_models() -> Dict[str, Any]:
    """Get all models (convenience function)"""
    return model_loader.get_all_models()


def get_model(model_name: str) -> Dict[str, Any]:
    """Get a specific model (convenience function)"""
    return model_loader.get_model(model_name)
