"""Check what park IDs the ML model was trained with"""
import joblib
import json

# Load label encoders
le_park = joblib.load('model3_park_recommendation/models/label_encoder_park.pkl')
le_industry = joblib.load('model3_park_recommendation/models/label_encoder_industry.pkl')
le_region = joblib.load('model3_park_recommendation/models/label_encoder_region.pkl')

print("=" * 60)
print("Park IDs in trained model:")
print(le_park.classes_)
print("=" * 60)
print("\nIndustry sectors in trained model:")
print(le_industry.classes_)
print("=" * 60)
print("\nRegions in trained model:")
print(le_region.classes_)
print("=" * 60)

# Also load feature names
with open('model3_park_recommendation/models/feature_names.json', 'r') as f:
    features = json.load(f)
print("\nFeature names:")
print(features)
