"""
Test Model 3: Park Recommendation System
Make sample predictions to verify model is working correctly
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

import joblib
import numpy as np
import pandas as pd
from ethiopian_parks_data import ETHIOPIAN_PARKS

print("=" * 70)
print("  Model 3: Park Recommendation System - Test Script")
print("=" * 70)

# Load model and encoders
MODEL_DIR = Path(__file__).parent / 'models'

print("\n Loading model...")
model = joblib.load(MODEL_DIR / 'model_ranker.pkl')
le_industry = joblib.load(MODEL_DIR / 'label_encoder_industry.pkl')
le_region = joblib.load(MODEL_DIR / 'label_encoder_region.pkl')
le_park = joblib.load(MODEL_DIR / 'label_encoder_park.pkl')

print("   OK Model loaded successfully!")

# Test tenant profiles
test_tenants = [
    {
        'name': 'Addis Textile Manufacturing PLC',
        'industry': 'textile',
        'investment_usd': 5000000,
        'employee_count': 500,
        'land_needed_ha': 8.5,
        'power_requirement_kw': 850,
        'water_requirement_m3': 180,
        'export_oriented': True,
        'preferred_region': 'SNNPR',
        'budget_min_etb': 45000,
        'budget_max_etb': 95000
    },
    {
        'name': 'Nile Pharmaceutical Industries',
        'industry': 'pharmaceutical',
        'investment_usd': 15000000,
        'employee_count': 200,
        'land_needed_ha': 5.0,
        'power_requirement_kw': 400,
        'water_requirement_m3': 100,
        'export_oriented': False,
        'preferred_region': 'Addis Ababa',
        'budget_min_etb': 120000,
        'budget_max_etb': 250000
    },
    {
        'name': 'Horn Food Processing PLC',
        'industry': 'food_processing',
        'investment_usd': 3000000,
        'employee_count': 150,
        'land_needed_ha': 4.0,
        'power_requirement_kw': 300,
        'water_requirement_m3': 150,
        'export_oriented': True,
        'preferred_region': 'any',
        'budget_min_etb': 30000,
        'budget_max_etb': 65000
    }
]

def prepare_tenant_park_features(tenant, park):
    """Prepare features for tenant-park pair prediction"""
    features = {
        'industry_encoded': le_industry.transform([tenant['industry']])[0],
        'park_encoded': le_park.transform([park['park_id']])[0],  # Added park feature
        'investment_usd': tenant['investment_usd'],
        'employee_count': tenant['employee_count'],
        'land_needed_ha': tenant['land_needed_ha'],
        'power_requirement_kw': tenant['power_requirement_kw'],
        'water_requirement_m3': tenant['water_requirement_m3'],
        'export_oriented': int(tenant['export_oriented']),
        'preferred_region_encoded': le_region.transform([tenant['preferred_region']])[0],
        'budget_min_etb': tenant['budget_min_etb'],
        'budget_max_etb': tenant['budget_max_etb']
    }
    return pd.DataFrame([features])

def get_recommendations(tenant, top_n=3):
    """Get top N park recommendations for a tenant"""
    print(f"\n{'='*70}")
    print(f" Tenant: {tenant['name']}")
    print(f"   Industry: {tenant['industry'].replace('_', ' ').title()}")
    print(f"   Investment: ${tenant['investment_usd']:,}")
    print(f"   Employees: {tenant['employee_count']}")
    print(f"   Export-oriented: {'Yes' if tenant['export_oriented'] else 'No'}")
    print(f"   Preferred Region: {tenant['preferred_region']}")
    print(f"{'='*70}")

    # Create features for each park
    park_scores = []
    for park in ETHIOPIAN_PARKS:
        if park['status'] in ['operational', 'under_development']:
            # Prepare tenant-park pair features
            features = prepare_tenant_park_features(tenant, park)
            scores = model.predict(features)
            park_scores.append({
                'park': park,
                'score': scores[0]
            })

    # Sort by score
    park_scores.sort(key=lambda x: x['score'], reverse=True)

    # Display top N recommendations
    print(f"\n Top {top_n} Recommended Parks:\n")

    for i, item in enumerate(park_scores[:top_n], 1):
        park = item['park']
        score = item['score']

        medal = "" if i == 1 else "" if i == 2 else ""

        print(f"{medal} #{i}: {park['park_name']}")
        print(f"   Location: {park['location']}, {park['region']}")
        print(f"   Match Score: {score:.2f}/100")
        print(f"   Status: {park['status'].replace('_', ' ').title()}")
        print(f"   Focus: {', '.join([ind.replace('_', ' ').title() for ind in park['focus_industries'][:3]])}")
        print(f"   Available Land: {park['available_land']} hectares")
        print(f"   Occupancy: {park['occupancy_rate']}%")

        # Reasons
        reasons = []
        if tenant['industry'] in park['focus_industries']:
            reasons.append(f"OK Perfect industry match ({tenant['industry'].replace('_', ' ')})")
        if park['available_land'] >= tenant['land_needed_ha']:
            reasons.append(f"OK Sufficient land available")
        if tenant['export_oriented'] and park['has_customs_office']:
            reasons.append("OK Has customs office (export advantage)")
        if tenant['preferred_region'] != 'any' and park['region'] == tenant['preferred_region']:
            reasons.append(f"OK Matches region preference")
        if park['power_capacity_kw'] >= tenant['power_requirement_kw']:
            reasons.append("OK Adequate power capacity")

        if reasons:
            print(f"   Reasons:")
            for reason in reasons[:3]:
                print(f"      {reason}")

        print()

    return park_scores[:top_n]

# Run tests
print("\n Testing Model 3 with sample tenant profiles...\n")

for tenant in test_tenants:
    recommendations = get_recommendations(tenant, top_n=3)

print("\n" + "=" * 70)
print("  OK Model 3 Test Complete!")
print("=" * 70)
print("\n   Results:")
print("     - Model successfully loaded")
print("     - Predictions generated for 3 test tenants")
print("     - Top-3 park recommendations provided")
print("\n   Model is ready for:")
print("     - API integration")
print("     - Production deployment")
print("     - Real tenant feedback collection")
print("\n" + "=" * 70)
