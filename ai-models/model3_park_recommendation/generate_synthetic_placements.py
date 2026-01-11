"""
Generate Synthetic Tenant-Park Placement Data
Adapted from Alibaba ET Industrial Brain & Tencent WeCity

This script generates realistic tenant-park placement data for training
the park recommendation system using a cold-start approach.
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
from ethiopian_parks_data import ETHIOPIAN_PARKS

print("=" * 70)
print("  Model 3: Synthetic Tenant-Park Placement Data Generator")
print("  Adapted from Chinese Smart Park Cold-Start Strategy")
print("=" * 70)

# Configuration
RANDOM_SEED = 42
N_SAMPLES = 800  # 800 synthetic tenant placements

random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

# Industry types aligned with park focus
INDUSTRY_TYPES = [
    'textile', 'garment', 'apparel', 'leather', 'footwear',
    'pharmaceutical', 'chemical', 'medical',
    'food_processing', 'beverage', 'agro_processing', 'coffee_processing',
    'manufacturing', 'steel', 'metal', 'automotive',
    'electronics', 'horticulture'
]

# Ethiopian company name patterns
ETHIOPIAN_COMPANY_PREFIXES = [
    'Addis', 'Ethiopia', 'Nile', 'Blue Nile', 'Horn', 'African',
    'Abyssinia', 'Sheba', 'Axum', 'Lalibela', 'Gondar', 'Harar',
    'Merkato', 'Bole', 'Piassa', 'Meskel', 'Entoto'
]

COMPANY_SUFFIXES = [
    'PLC', 'Share Company', 'Manufacturing', 'Industries',
    'Textile Mill', 'Factory', 'Processing', 'Enterprise',
    'Corporation', 'Group', 'International'
]

def generate_company_name(industry):
    """Generate Ethiopian-style company name"""
    prefix = random.choice(ETHIOPIAN_COMPANY_PREFIXES)
    industry_name = industry.replace('_', ' ').title()
    suffix = random.choice(COMPANY_SUFFIXES)
    return f"{prefix} {industry_name} {suffix}"

def calculate_match_score(tenant, park):
    """
    Calculate match score between tenant and park
    Based on Chinese smart park matching algorithms
    """
    score = 0

    # 1. Industry alignment (40% weight)
    if tenant['industry'] in park['focus_industries']:
        score += 40
    elif any(ind in park['focus_industries'] for ind in get_related_industries(tenant['industry'])):
        score += 25
    else:
        score += 10

    # 2. Capacity match (25% weight)
    if park['available_land'] >= tenant['land_needed_ha']:
        score += 25
    else:
        score += 10

    # 3. Infrastructure match (20% weight)
    power_match = min(park['power_capacity_kw'] / max(tenant['power_requirement_kw'], 1), 1.0)
    water_match = min(park['water_capacity_m3'] / max(tenant['water_requirement_m3'], 1), 1.0)
    infra_score = (power_match + water_match) / 2
    score += infra_score * 20

    # 4. Location preference (10% weight)
    if tenant['preferred_region'] == park['region'] or tenant['preferred_region'] == 'any':
        score += 10
    else:
        score += 3

    # 5. Export orientation (5% weight)
    if tenant['export_oriented'] and park['has_customs_office']:
        score += 5
    elif tenant['export_oriented'] and park['distance_to_port_km'] < 400:
        score += 3
    else:
        score += 1

    return min(100, score)

def get_related_industries(industry):
    """Get related industries for partial matching"""
    relations = {
        'textile': ['garment', 'apparel'],
        'garment': ['textile', 'apparel'],
        'apparel': ['textile', 'garment'],
        'leather': ['footwear'],
        'footwear': ['leather'],
        'pharmaceutical': ['chemical', 'medical'],
        'chemical': ['pharmaceutical'],
        'food_processing': ['beverage', 'agro_processing'],
        'beverage': ['food_processing'],
        'agro_processing': ['food_processing', 'coffee_processing'],
        'coffee_processing': ['agro_processing'],
        'manufacturing': ['steel', 'metal'],
        'steel': ['metal', 'manufacturing'],
        'metal': ['steel', 'manufacturing', 'automotive'],
        'automotive': ['metal', 'manufacturing'],
    }
    return relations.get(industry, [])

def generate_tenant_profile():
    """Generate realistic tenant profile"""
    industry = random.choice(INDUSTRY_TYPES)

    # Company size varies by industry
    if industry in ['textile', 'garment', 'apparel', 'footwear']:
        employee_count = random.randint(200, 3000)
        investment_usd = random.randint(1000000, 15000000)
    elif industry in ['pharmaceutical', 'chemical']:
        employee_count = random.randint(50, 500)
        investment_usd = random.randint(2000000, 25000000)
    elif industry in ['food_processing', 'agro_processing']:
        employee_count = random.randint(100, 1000)
        investment_usd = random.randint(500000, 10000000)
    elif industry in ['steel', 'metal', 'automotive']:
        employee_count = random.randint(150, 2000)
        investment_usd = random.randint(5000000, 50000000)
    else:
        employee_count = random.randint(50, 1000)
        investment_usd = random.randint(500000, 10000000)

    # Calculate requirements based on size
    land_needed_ha = employee_count / 100 + random.uniform(0.5, 5)
    power_requirement_kw = employee_count * random.uniform(0.5, 2.0)
    water_requirement_m3 = employee_count * random.uniform(0.1, 0.5)

    # Export orientation (40% of companies are export-oriented)
    export_oriented = random.random() < 0.4

    # Region preference (60% have preference, 40% flexible)
    if random.random() < 0.6:
        preferred_region = random.choice(['Addis Ababa', 'SNNPR', 'Oromia', 'Amhara', 'Dire Dawa'])
    else:
        preferred_region = 'any'

    return {
        'tenant_id': f'TEN{random.randint(10000, 99999)}',
        'company_name': generate_company_name(industry),
        'industry': industry,
        'investment_usd': investment_usd,
        'employee_count': employee_count,
        'land_needed_ha': round(land_needed_ha, 2),
        'power_requirement_kw': round(power_requirement_kw, 1),
        'water_requirement_m3': round(water_requirement_m3, 1),
        'export_oriented': export_oriented,
        'preferred_region': preferred_region,
        'budget_min_etb': investment_usd * 0.01 * random.uniform(0.8, 1.0),
        'budget_max_etb': investment_usd * 0.02 * random.uniform(1.0, 1.5),
    }

def generate_placement(tenant):
    """
    Generate park placement for tenant
    Simulates decision-making process with some randomness
    """
    # Calculate match scores for all parks
    park_scores = []
    for park in ETHIOPIAN_PARKS:
        # Only consider operational or under_development parks
        if park['status'] in ['operational', 'under_development']:
            score = calculate_match_score(tenant, park)
            park_scores.append({
                'park': park,
                'score': score
            })

    # Sort by score
    park_scores.sort(key=lambda x: x['score'], reverse=True)

    # Chinese smart park logic: 80% choose top match, 15% choose 2nd/3rd, 5% random
    rand = random.random()
    if rand < 0.80 and len(park_scores) > 0:
        chosen = park_scores[0]
    elif rand < 0.95 and len(park_scores) > 1:
        chosen = random.choice(park_scores[1:min(3, len(park_scores))])
    else:
        chosen = random.choice(park_scores)

    # Determine if placement was successful
    # Higher scores = higher success rate
    success_probability = chosen['score'] / 100
    placement_successful = random.random() < success_probability

    # Satisfaction rating (correlated with match score)
    if placement_successful:
        satisfaction = min(5.0, chosen['score'] / 20 + random.uniform(0, 1.0))
    else:
        satisfaction = max(1.0, chosen['score'] / 30 + random.uniform(-0.5, 0.5))

    return {
        **tenant,
        'chosen_park_id': chosen['park']['park_id'],
        'chosen_park_name': chosen['park']['park_name'],
        'match_score': chosen['score'],
        'placement_successful': placement_successful,
        'satisfaction_rating': round(satisfaction, 1),
        'placement_date': datetime.now() - timedelta(days=random.randint(1, 730))
    }

def generate_dataset(n_samples):
    """Generate complete synthetic dataset"""
    print(f"\n📊 Generating {n_samples} synthetic tenant-park placements...")

    placements = []
    for i in range(n_samples):
        if (i + 1) % 100 == 0:
            print(f"   Generated {i + 1}/{n_samples} placements...")

        tenant = generate_tenant_profile()
        placement = generate_placement(tenant)
        placements.append(placement)

    df = pd.DataFrame(placements)

    # Statistics
    print("\n✅ Dataset generated successfully!")
    print(f"\n📈 Dataset Statistics:")
    print(f"   Total placements: {len(df)}")
    print(f"   Successful placements: {df['placement_successful'].sum()} ({df['placement_successful'].mean()*100:.1f}%)")
    print(f"   Average satisfaction: {df['satisfaction_rating'].mean():.2f}/5.0")
    print(f"   Average match score: {df['match_score'].mean():.1f}/100")
    print(f"\n   Industries represented: {df['industry'].nunique()}")
    print(f"   Parks used: {df['chosen_park_id'].nunique()}")
    print(f"\n   Top 3 most chosen parks:")
    for park, count in df['chosen_park_name'].value_counts().head(3).items():
        print(f"      - {park}: {count} placements")

    return df

if __name__ == '__main__':
    # Generate dataset
    df = generate_dataset(N_SAMPLES)

    # Save to CSV
    output_dir = Path(__file__).parent.parent / 'data' / 'raw'
    output_dir.mkdir(parents=True, exist_ok=True)
    output_file = output_dir / 'park_placements_synthetic.csv'

    df.to_csv(output_file, index=False)
    print(f"\n💾 Saved to: {output_file}")
    print(f"   File size: {output_file.stat().st_size / 1024:.1f} KB")

    print("\n✅ Synthetic data generation complete!")
    print("=" * 70)
