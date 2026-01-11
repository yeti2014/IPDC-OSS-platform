"""
Model 3: Industrial Park Recommendation Endpoint
Recommends best Ethiopian industrial parks for tenants
Uses rule-based matching algorithm (Chinese smart park approach)
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
import time
from typing import List, Dict, Any

from api.models import (
    ParkRecommendationRequest,
    ParkRecommendationResponse,
    ErrorResponse
)
from api.utils.model_loader import get_model

router = APIRouter()


# ==================== ETHIOPIAN INDUSTRIAL PARKS DATABASE ====================

ETHIOPIAN_PARKS = [
    {
        'park_id': 'PARK-HWS-001',
        'park_name': 'Hawassa Industrial Park',
        'park_name_amharic': 'ሐዋሳ ኢንዱስትሪ ፓርክ',
        'region': 'SNNPR',
        'city': 'Hawassa',
        'coordinates': {'latitude': 7.0621, 'longitude': 38.4755},
        'specialization': ['textile', 'garment'],
        'total_area_hectares': 300,
        'available_land_hectares': 120,
        'power_capacity_mw': 50,
        'water_capacity_m3_day': 5000,
        'rent_etb_per_hectare_month': 110000,
        'operational_status': 'operational',
        'inauguration_year': 2016,
        'infrastructure_quality': {'power': 5, 'water': 5, 'internet': 5, 'road': 5},
        'oss_services': ['investment_permit', 'business_license', 'work_permit', 'customs_clearance', 'banking_services'],
        'port_distance_km': 350,
        'airport_distance_km': 6
    },
    {
        'park_id': 'PARK-AA-002',
        'park_name': 'Bole Lemi Industrial Park I & II',
        'park_name_amharic': 'ቦሌ ለሚ ኢንዱስትሪ ፓርክ',
        'region': 'Addis Ababa',
        'city': 'Addis Ababa',
        'coordinates': {'latitude': 8.9806, 'longitude': 38.7578},
        'specialization': ['textile', 'garment', 'leather'],
        'total_area_hectares': 156,
        'available_land_hectares': 30,
        'power_capacity_mw': 30,
        'water_capacity_m3_day': 3000,
        'rent_etb_per_hectare_month': 160000,
        'operational_status': 'operational',
        'inauguration_year': 2012,
        'infrastructure_quality': {'power': 5, 'water': 5, 'internet': 5, 'road': 5},
        'oss_services': ['investment_permit', 'business_license', 'work_permit', 'customs_clearance', 'banking_services', 'tin_issuance'],
        'port_distance_km': 800,
        'airport_distance_km': 12
    },
    {
        'park_id': 'PARK-DIR-003',
        'park_name': 'Dire Dawa Industrial Park',
        'park_name_amharic': 'ድሬዳዋ ኢንዱስትሪ ፓርክ',
        'region': 'Dire Dawa',
        'city': 'Dire Dawa',
        'coordinates': {'latitude': 9.5930, 'longitude': 41.8661},
        'specialization': ['textile', 'food_processing'],
        'total_area_hectares': 200,
        'available_land_hectares': 80,
        'power_capacity_mw': 40,
        'water_capacity_m3_day': 4000,
        'rent_etb_per_hectare_month': 80000,
        'operational_status': 'operational',
        'inauguration_year': 2018,
        'infrastructure_quality': {'power': 4, 'water': 4, 'internet': 4, 'road': 5},
        'oss_services': ['investment_permit', 'business_license', 'work_permit', 'customs_clearance'],
        'port_distance_km': 350,  # Railway to Djibouti
        'airport_distance_km': 8
    },
    {
        'park_id': 'PARK-KOM-004',
        'park_name': 'Kombolcha Industrial Park',
        'park_name_amharic': 'ኮምቦልቻ ኢንዱስትሪ ፓርክ',
        'region': 'Amhara',
        'city': 'Kombolcha',
        'coordinates': {'latitude': 11.0825, 'longitude': 39.7433},
        'specialization': ['textile', 'garment'],
        'total_area_hectares': 75,
        'available_land_hectares': 40,
        'power_capacity_mw': 20,
        'water_capacity_m3_day': 2000,
        'rent_etb_per_hectare_month': 70000,
        'operational_status': 'operational',
        'inauguration_year': 2017,
        'infrastructure_quality': {'power': 4, 'water': 4, 'internet': 3, 'road': 4},
        'oss_services': ['investment_permit', 'business_license', 'work_permit'],
        'port_distance_km': 650,
        'airport_distance_km': 25
    },
    {
        'park_id': 'PARK-MKL-005',
        'park_name': 'Mekelle Industrial Park',
        'park_name_amharic': 'መቐለ ኢንዱስትሪ ፓርክ',
        'region': 'Tigray',
        'city': 'Mekelle',
        'coordinates': {'latitude': 13.4967, 'longitude': 39.4753},
        'specialization': ['textile', 'pharmaceutical'],
        'total_area_hectares': 100,
        'available_land_hectares': 60,
        'power_capacity_mw': 25,
        'water_capacity_m3_day': 2500,
        'rent_etb_per_hectare_month': 75000,
        'operational_status': 'operational',
        'inauguration_year': 2017,
        'infrastructure_quality': {'power': 4, 'water': 4, 'internet': 4, 'road': 4},
        'oss_services': ['investment_permit', 'business_license', 'work_permit'],
        'port_distance_km': 750,
        'airport_distance_km': 10
    },
    {
        'park_id': 'PARK-ADM-006',
        'park_name': 'Adama Industrial Park',
        'park_name_amharic': 'አዳማ ኢንዱስትሪ ፓርክ',
        'region': 'Oromia',
        'city': 'Adama (Nazret)',
        'coordinates': {'latitude': 8.5400, 'longitude': 39.2675},
        'specialization': ['food_processing', 'beverage', 'textile'],
        'total_area_hectares': 100,
        'available_land_hectares': 45,
        'power_capacity_mw': 30,
        'water_capacity_m3_day': 3500,
        'rent_etb_per_hectare_month': 95000,
        'operational_status': 'operational',
        'inauguration_year': 2019,
        'infrastructure_quality': {'power': 5, 'water': 5, 'internet': 4, 'road': 5},
        'oss_services': ['investment_permit', 'business_license', 'work_permit', 'customs_clearance', 'banking_services'],
        'port_distance_km': 850,
        'airport_distance_km': 75
    },
    {
        'park_id': 'PARK-BHD-008',
        'park_name': 'Bahir Dar Industrial Park',
        'park_name_amharic': 'ባህር ዳር ኢንዱስትሪ ፓርክ',
        'region': 'Amhara',
        'city': 'Bahir Dar',
        'coordinates': {'latitude': 11.5933, 'longitude': 37.3905},
        'specialization': ['textile', 'leather', 'agro_processing'],
        'total_area_hectares': 125,
        'available_land_hectares': 70,
        'power_capacity_mw': 35,
        'water_capacity_m3_day': 3800,
        'rent_etb_per_hectare_month': 85000,
        'operational_status': 'operational',
        'inauguration_year': 2020,
        'infrastructure_quality': {'power': 4, 'water': 5, 'internet': 4, 'road': 4},
        'oss_services': ['investment_permit', 'business_license', 'work_permit', 'banking_services'],
        'port_distance_km': 900,
        'airport_distance_km': 18
    },
    {
        'park_id': 'PARK-KLSH-010',
        'park_name': 'Kilinto Leather Industrial Park',
        'park_name_amharic': 'ቂሊንጦ የቆዳ ኢንዱስትሪ ፓርክ',
        'region': 'Addis Ababa',
        'city': 'Addis Ababa (Kilinto)',
        'coordinates': {'latitude': 8.8830, 'longitude': 38.7470},
        'specialization': ['leather', 'leather_products'],
        'total_area_hectares': 156,
        'available_land_hectares': 40,
        'power_capacity_mw': 28,
        'water_capacity_m3_day': 2800,
        'rent_etb_per_hectare_month': 150000,
        'operational_status': 'operational',
        'inauguration_year': 2018,
        'infrastructure_quality': {'power': 5, 'water': 5, 'internet': 5, 'road': 5},
        'oss_services': ['investment_permit', 'business_license', 'work_permit', 'customs_clearance', 'banking_services', 'tin_issuance'],
        'port_distance_km': 800,
        'airport_distance_km': 15
    }
]


def calculate_match_score(tenant: Dict[str, Any], park: Dict[str, Any]) -> tuple[int, List[str], List[str]]:
    """
    Calculate match score using rule-based algorithm
    Returns: (score, pros, cons)
    """
    score = 0
    pros = []
    cons = []

    # 1. Industry Match (40 points max)
    industry = tenant.get('industry_sector', '').replace('_processing', '')
    if industry in park['specialization']:
        score += 40
        pros.append(f"Specialized in {industry.replace('_', ' ')} industry (perfect match)")
    elif any(spec in industry or industry in spec for spec in park['specialization']):
        score += 25
        pros.append(f"Related industry focus")
    else:
        score += 10
        cons.append(f"Not specialized in {industry.replace('_', ' ')} industry")

    # 2. Location Match (20 points max)
    preferred_region = tenant.get('preferred_region', '').lower()
    if preferred_region and preferred_region in park['city'].lower():
        score += 20
        pros.append(f"Matches preferred location: {park['city']}")
    elif preferred_region:
        score += 5
        cons.append(f"Different from preferred location")
    else:
        score += 10  # Neutral if no preference

    # 3. Land Availability (15 points max)
    required_land = tenant.get('required_land_hectares', 0)
    if required_land <= park['available_land_hectares']:
        score += 15
        pros.append(f"Available land: {park['available_land_hectares']} hectares")
    else:
        score += 5
        cons.append(f"Limited land availability")

    # 4. Power Capacity (10 points max)
    required_power = tenant.get('power_requirement_mw', 0)
    if required_power <= park['power_capacity_mw']:
        score += 10
        pros.append(f"Power capacity: {park['power_capacity_mw']} MW available")
    else:
        score += 3
        cons.append(f"Limited power capacity")

    # 5. Rent Budget (10 points max)
    rent_budget = tenant.get('rent_budget_etb_month', 0)
    estimated_rent = park['rent_etb_per_hectare_month'] * required_land
    if estimated_rent <= rent_budget:
        score += 10
        pros.append(f"Within rent budget")
    elif estimated_rent <= rent_budget * 1.2:  # Within 20% over budget
        score += 5
        cons.append(f"Slightly above rent budget (+{int((estimated_rent/rent_budget - 1) * 100)}%)")
    else:
        score += 0
        cons.append(f"Above rent budget")

    # 6. Infrastructure Quality (5 points max)
    avg_infrastructure = sum(park['infrastructure_quality'].values()) / len(park['infrastructure_quality'])
    if avg_infrastructure >= 4.5:
        score += 5
        pros.append("Excellent infrastructure quality")
    elif avg_infrastructure >= 3.5:
        score += 3
        pros.append("Good infrastructure quality")
    else:
        score += 1
        cons.append("Developing infrastructure")

    return min(100, score), pros, cons


def get_match_grade(score: int) -> str:
    """Convert score to letter grade"""
    if score >= 90:
        return "A"
    elif score >= 80:
        return "B+"
    elif score >= 70:
        return "B"
    elif score >= 60:
        return "C+"
    elif score >= 50:
        return "C"
    else:
        return "D"


def get_infrastructure_description(rating: int) -> str:
    """Convert infrastructure rating to description"""
    if rating >= 4.5:
        return "excellent"
    elif rating >= 3.5:
        return "good"
    elif rating >= 2.5:
        return "fair"
    else:
        return "developing"


@router.post("/recommend-parks", response_model=ParkRecommendationResponse)
async def recommend_parks(request: ParkRecommendationRequest):
    """
    Recommend Ethiopian industrial parks for a tenant

    This endpoint:
    1. Analyzes tenant profile (industry, size, requirements)
    2. Scores all 8 Ethiopian industrial parks
    3. Returns top 3 recommendations with detailed analysis
    4. Provides pros, cons, costs, and infrastructure details

    Uses Chinese smart park matching approach:
    - Rule-based scoring (industry, location, capacity, budget)
    - Weighted criteria (industry 40%, location 20%, capacity 25%, etc.)
    - Detailed recommendations with actionable insights
    """
    start_time = time.time()

    try:
        # Get Model 3 info
        model3 = get_model('model3')

        tenant_profile = request.tenant_profile.dict()

        # Calculate match scores for all parks
        park_scores = []
        for park in ETHIOPIAN_PARKS:
            score, pros, cons = calculate_match_score(tenant_profile, park)

            # Calculate costs
            required_land = tenant_profile.get('required_land_hectares', 5)
            monthly_rent = park['rent_etb_per_hectare_month'] * required_land
            estimated_utilities = monthly_rent * 0.35  # Estimate utilities as 35% of rent
            total_monthly = monthly_rent + estimated_utilities

            park_recommendation = {
                'park_id': park['park_id'],
                'park_name': park['park_name'],
                'park_name_amharic': park['park_name_amharic'],
                'match_score': score,
                'match_grade': get_match_grade(score),
                'location': {
                    'region': park['region'],
                    'city': park['city'],
                    'coordinates': park['coordinates']
                },
                'pros': pros[:5],  # Top 5 pros
                'cons': cons[:3] if cons else ['No significant disadvantages identified'],
                'costs': {
                    'rent_etb_month': round(monthly_rent, 2),
                    'utilities_etb_month': round(estimated_utilities, 2),
                    'total_estimated_etb_month': round(total_monthly, 2)
                },
                'infrastructure': {
                    'power_availability': get_infrastructure_description(park['infrastructure_quality']['power']),
                    'water_availability': get_infrastructure_description(park['infrastructure_quality']['water']),
                    'internet_connectivity': 'fiber_optic' if park['infrastructure_quality']['internet'] >= 4 else 'available',
                    'road_access': get_infrastructure_description(park['infrastructure_quality']['road'])
                },
                'oss_services': [s.replace('_', ' ').title() for s in park['oss_services']],
                'port_distance_km': park['port_distance_km'],
                'airport_distance_km': park['airport_distance_km']
            }

            park_scores.append((score, park_recommendation))

        # Sort by score (descending)
        park_scores.sort(key=lambda x: x[0], reverse=True)

        # Get top 3 recommendations
        top_3 = [rec for score, rec in park_scores[:3]]

        # Determine model confidence
        if top_3[0]['match_score'] >= 80:
            confidence = "high"
            reasoning = "Strong match found based on industry specialization, capacity, and location preferences."
        elif top_3[0]['match_score'] >= 60:
            confidence = "medium"
            reasoning = "Good matches found. Consider visiting top recommendations for final decision."
        else:
            confidence = "low"
            reasoning = "No perfect match found. Recommendations based on best available options. Consider adjusting requirements."

        # Build response
        processing_time_ms = int((time.time() - start_time) * 1000)

        response_data = {
            'recommendations': top_3,
            'model_confidence': confidence,
            'reasoning': reasoning,
            'total_parks_analyzed': len(ETHIOPIAN_PARKS)
        }

        metadata = {
            'model_version': model3['version'],
            'model_type': 'rule_based',
            'processing_time_ms': processing_time_ms,
            'timestamp': datetime.now().isoformat()
        }

        return ParkRecommendationResponse(
            success=True,
            data=response_data,
            metadata=metadata
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating park recommendations: {str(e)}"
        )


@router.get("/parks", tags=["Parks"])
async def get_all_parks():
    """
    Get list of all Ethiopian industrial parks
    """
    return {
        'success': True,
        'data': {
            'parks': ETHIOPIAN_PARKS,
            'total_count': len(ETHIOPIAN_PARKS)
        }
    }
