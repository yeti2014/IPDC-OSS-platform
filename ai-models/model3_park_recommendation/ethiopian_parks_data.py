"""
Ethiopian IPDC Industrial Parks Dataset
Official IPDC Facilities: 11 SEZs + 1 FTZ + 1 Industrial Village = 13 Total

Data sources:
- IPDC Official Website (https://www.ipdc.gov.et)
- Ethiopian Investment Commission (EIC)
- Industrial Parks Development Corporation (IPDC)

Last updated: February 15, 2026
"""

ETHIOPIAN_PARKS = [
    # ========== 11 SPECIAL ECONOMIC ZONES (SEZs) ==========

    # 1. Hawassa SEZ - Flagship textile hub
    {
        'park_id': 'hawassa',
        'park_name': 'Hawassa Special Economic Zone',
        'park_type': 'SEZ',
        'location': 'Hawassa',
        'region': 'SNNPR',
        'latitude': 7.0621,
        'longitude': 38.4755,
        'size_hectares': 300,
        'available_land': 120,
        'occupancy_rate': 60,
        'status': 'operational',
        'established_year': 2016,
        'focus_industries': ['textile', 'garment', 'apparel'],
        'power_capacity_kw': 50000,
        'water_capacity_m3': 5000,
        'has_customs_office': True,
        'has_logistics_center': True,
        'distance_to_airport_km': 6,
        'distance_to_port_km': 350,
        'utility_cost_score': 8,
        'incentives': ['tax_holiday', 'duty_free', 'streamlined_licensing'],
        'description': "Ethiopia's flagship SEZ, specializing in textile and garment manufacturing"
    },

    # 2. Bole Lemi SEZ I & II - Multi-sectoral, Addis Ababa
    {
        'park_id': 'bole_lemi',
        'park_name': 'Bole Lemi Special Economic Zone I & II',
        'park_type': 'SEZ',
        'location': 'Addis Ababa',
        'region': 'Addis Ababa',
        'latitude': 8.9806,
        'longitude': 38.7578,
        'size_hectares': 156,
        'available_land': 30,
        'occupancy_rate': 81,
        'status': 'operational',
        'established_year': 2012,
        'focus_industries': ['leather', 'manufacturing', 'multi_sectoral'],
        'power_capacity_kw': 30000,
        'water_capacity_m3': 3000,
        'has_customs_office': True,
        'has_logistics_center': True,
        'distance_to_airport_km': 12,
        'distance_to_port_km': 800,
        'utility_cost_score': 7,
        'incentives': ['tax_holiday', 'duty_free', 'fast_track_permits'],
        'description': 'Multi-sectoral SEZ in capital city, leather and manufacturing hub'
    },

    # 3. Kilinto SEZ - Pharmaceutical & Chemical
    {
        'park_id': 'kilinto',
        'park_name': 'Kilinto Special Economic Zone',
        'park_type': 'SEZ',
        'location': 'Addis Ababa (Kilinto)',
        'region': 'Addis Ababa',
        'latitude': 8.8830,
        'longitude': 38.7470,
        'size_hectares': 279,
        'available_land': 100,
        'occupancy_rate': 64,
        'status': 'operational',
        'established_year': 2018,
        'focus_industries': ['pharmaceutical', 'chemical', 'medical_devices'],
        'power_capacity_kw': 45000,
        'water_capacity_m3': 4500,
        'has_customs_office': True,
        'has_logistics_center': False,
        'distance_to_airport_km': 15,
        'distance_to_port_km': 800,
        'utility_cost_score': 7,
        'incentives': ['tax_holiday', 'duty_free', 'research_support'],
        'description': 'Specialized SEZ for pharmaceutical and chemical manufacturing'
    },

    # 4. Kombolcha SEZ - Textile hub in Amhara
    {
        'park_id': 'kombolcha',
        'park_name': 'Kombolcha Special Economic Zone',
        'park_type': 'SEZ',
        'location': 'Kombolcha',
        'region': 'Amhara',
        'latitude': 11.0825,
        'longitude': 39.7433,
        'size_hectares': 75,
        'available_land': 40,
        'occupancy_rate': 47,
        'status': 'operational',
        'established_year': 2017,
        'focus_industries': ['textile', 'apparel'],
        'power_capacity_kw': 20000,
        'water_capacity_m3': 2000,
        'has_customs_office': False,
        'has_logistics_center': False,
        'distance_to_airport_km': 25,
        'distance_to_port_km': 650,
        'utility_cost_score': 8,
        'incentives': ['tax_holiday', 'low_labor_cost', 'land_lease_discount'],
        'description': 'Textile-focused SEZ with competitive utility costs and labor availability'
    },

    # 5. Mekelle SEZ - Textile & Agro-processing in Tigray
    {
        'park_id': 'mekelle',
        'park_name': 'Mekelle Special Economic Zone',
        'park_type': 'SEZ',
        'location': 'Mekelle',
        'region': 'Tigray',
        'latitude': 13.4967,
        'longitude': 39.4753,
        'size_hectares': 100,
        'available_land': 60,
        'occupancy_rate': 40,
        'status': 'operational',
        'established_year': 2017,
        'focus_industries': ['textile', 'agro_processing'],
        'power_capacity_kw': 25000,
        'water_capacity_m3': 2500,
        'has_customs_office': False,
        'has_logistics_center': False,
        'distance_to_airport_km': 10,
        'distance_to_port_km': 750,
        'utility_cost_score': 6,
        'incentives': ['tax_holiday', 'reconstruction_support'],
        'description': 'SEZ in Tigray region for textile and agro-processing industries'
    },

    # 6. Adama SEZ - Food Processing & Beverage
    {
        'park_id': 'adama',
        'park_name': 'Adama Special Economic Zone',
        'park_type': 'SEZ',
        'location': 'Adama (Nazret)',
        'region': 'Oromia',
        'latitude': 8.5400,
        'longitude': 39.2675,
        'size_hectares': 100,
        'available_land': 45,
        'occupancy_rate': 55,
        'status': 'operational',
        'established_year': 2019,
        'focus_industries': ['food_processing', 'beverage', 'agro_processing'],
        'power_capacity_kw': 30000,
        'water_capacity_m3': 3500,
        'has_customs_office': True,
        'has_logistics_center': True,
        'distance_to_airport_km': 75,
        'distance_to_port_km': 850,
        'utility_cost_score': 7,
        'incentives': ['tax_holiday', 'agro_processing_support'],
        'description': 'Food and agro-processing focused SEZ on main highway'
    },

    # 7. Bahir Dar SEZ - Textile & Leather on Lake Tana
    {
        'park_id': 'bahir_dar',
        'park_name': 'Bahir Dar Special Economic Zone',
        'park_type': 'SEZ',
        'location': 'Bahir Dar',
        'region': 'Amhara',
        'latitude': 11.5933,
        'longitude': 37.3905,
        'size_hectares': 125,
        'available_land': 70,
        'occupancy_rate': 44,
        'status': 'operational',
        'established_year': 2020,
        'focus_industries': ['textile', 'leather'],
        'power_capacity_kw': 35000,
        'water_capacity_m3': 3800,
        'has_customs_office': False,
        'has_logistics_center': False,
        'distance_to_airport_km': 18,
        'distance_to_port_km': 900,
        'utility_cost_score': 7,
        'incentives': ['tax_holiday', 'tourism_integration'],
        'description': 'Textile and leather SEZ on Lake Tana'
    },

    # 8. Jimma SEZ - Coffee Processing & Agro
    {
        'park_id': 'jimma',
        'park_name': 'Jimma Special Economic Zone',
        'park_type': 'SEZ',
        'location': 'Jimma',
        'region': 'Oromia',
        'latitude': 7.6742,
        'longitude': 36.8344,
        'size_hectares': 150,
        'available_land': 90,
        'occupancy_rate': 40,
        'status': 'operational',
        'established_year': 2021,
        'focus_industries': ['coffee_processing', 'agro_processing', 'food_processing'],
        'power_capacity_kw': 25000,
        'water_capacity_m3': 3000,
        'has_customs_office': False,
        'has_logistics_center': False,
        'distance_to_airport_km': 10,
        'distance_to_port_km': 1100,
        'utility_cost_score': 6,
        'incentives': ['tax_holiday', 'coffee_export_support'],
        'description': 'Coffee capital of Ethiopia, specialized for coffee and agro-processing'
    },

    # 9. Debre Birhan SEZ - Multi-sectoral
    {
        'park_id': 'debre_birhan',
        'park_name': 'Debre Birhan Special Economic Zone',
        'park_type': 'SEZ',
        'location': 'Debre Birhan',
        'region': 'Amhara',
        'latitude': 9.6800,
        'longitude': 39.5300,
        'size_hectares': 100,
        'available_land': 65,
        'occupancy_rate': 35,
        'status': 'operational',
        'established_year': 2020,
        'focus_industries': ['manufacturing', 'multi_sectoral'],
        'power_capacity_kw': 22000,
        'water_capacity_m3': 2200,
        'has_customs_office': False,
        'has_logistics_center': False,
        'distance_to_airport_km': 130,
        'distance_to_port_km': 880,
        'utility_cost_score': 8,
        'incentives': ['tax_holiday', 'highland_climate_advantage'],
        'description': 'Multi-sectoral SEZ with highland climate advantage'
    },

    # 10. Semera SEZ - Manufacturing & Logistics in Afar
    {
        'park_id': 'semera',
        'park_name': 'Semera Special Economic Zone',
        'park_type': 'SEZ',
        'location': 'Semera',
        'region': 'Afar',
        'latitude': 11.7833,
        'longitude': 41.0167,
        'size_hectares': 120,
        'available_land': 100,
        'occupancy_rate': 17,
        'status': 'operational',
        'established_year': 2022,
        'focus_industries': ['manufacturing', 'logistics', 'agro_processing'],
        'power_capacity_kw': 20000,
        'water_capacity_m3': 2000,
        'has_customs_office': False,
        'has_logistics_center': True,
        'distance_to_airport_km': 5,
        'distance_to_port_km': 450,
        'utility_cost_score': 7,
        'incentives': ['tax_holiday', 'regional_development', 'duty_free'],
        'description': 'Strategic SEZ in Afar region with proximity to Djibouti corridor'
    },

    # 11. Arerti SEZ - Multi-sectoral in Oromia
    {
        'park_id': 'arerti',
        'park_name': 'Arerti Special Economic Zone',
        'park_type': 'SEZ',
        'location': 'Arerti',
        'region': 'Oromia',
        'latitude': 9.0200,
        'longitude': 40.3400,
        'size_hectares': 100,
        'available_land': 70,
        'occupancy_rate': 30,
        'status': 'operational',
        'established_year': 2021,
        'focus_industries': ['manufacturing', 'agro_processing', 'metal_engineering'],
        'power_capacity_kw': 25000,
        'water_capacity_m3': 2500,
        'has_customs_office': False,
        'has_logistics_center': False,
        'distance_to_airport_km': 150,
        'distance_to_port_km': 900,
        'utility_cost_score': 7,
        'incentives': ['tax_holiday', 'export_support', 'local_sourcing_benefits'],
        'description': 'Multi-sectoral SEZ in Oromia for manufacturing and agro-processing'
    },

    # ========== 1 FREE TRADE ZONE (FTZ) ==========

    # 12. Dire Dawa FTZ - Strategic logistics hub
    {
        'park_id': 'dire_dawa_ftz',
        'park_name': 'Dire Dawa Free Trade Zone',
        'park_type': 'FTZ',
        'location': 'Dire Dawa',
        'region': 'Dire Dawa',
        'latitude': 9.5930,
        'longitude': 41.8661,
        'size_hectares': 200,
        'available_land': 80,
        'occupancy_rate': 60,
        'status': 'operational',
        'established_year': 2018,
        'focus_industries': ['agro_processing', 'food_processing', 'logistics', 'manufacturing'],
        'power_capacity_kw': 40000,
        'water_capacity_m3': 4000,
        'has_customs_office': True,
        'has_logistics_center': True,
        'distance_to_airport_km': 8,
        'distance_to_port_km': 350,
        'utility_cost_score': 9,
        'incentives': ['tax_holiday', 'duty_free', 'ftz_benefits', 'port_proximity_bonus'],
        'description': 'Free Trade Zone near Djibouti port via railway, excellent for export-oriented businesses'
    },

    # ========== 1 INDUSTRIAL VILLAGE ==========

    # 13. Addis Industrial Village
    {
        'park_id': 'addis_industrial_village',
        'park_name': 'Addis Industrial Village',
        'park_type': 'Industrial Village',
        'location': 'Addis Ababa (Akaki Kality)',
        'region': 'Addis Ababa',
        'latitude': 8.9150,
        'longitude': 38.7850,
        'size_hectares': 200,
        'available_land': 85,
        'occupancy_rate': 58,
        'status': 'operational',
        'established_year': 2015,
        'focus_industries': ['leather', 'manufacturing', 'metal_engineering', 'textile'],
        'power_capacity_kw': 35000,
        'water_capacity_m3': 3500,
        'has_customs_office': True,
        'has_logistics_center': True,
        'distance_to_airport_km': 15,
        'distance_to_port_km': 800,
        'utility_cost_score': 7,
        'incentives': ['tax_holiday', 'duty_free', 'business_support'],
        'description': 'Mixed-use industrial park in Addis Ababa (Akaki Kality), leather and manufacturing hub'
    }
]


def get_park_by_id(park_id):
    """Get park data by ID"""
    for park in ETHIOPIAN_PARKS:
        if park['park_id'] == park_id:
            return park
    return None

def get_parks_by_industry(industry):
    """Get parks that focus on a specific industry"""
    return [p for p in ETHIOPIAN_PARKS if industry in p['focus_industries']]

def get_parks_by_type(park_type):
    """Get parks by type (SEZ, FTZ, or Industrial Village)"""
    return [p for p in ETHIOPIAN_PARKS if p['park_type'] == park_type]

def get_operational_parks():
    """Get only operational parks"""
    return [p for p in ETHIOPIAN_PARKS if p['status'] == 'operational']

def get_parks_with_customs():
    """Get parks with customs office"""
    return [p for p in ETHIOPIAN_PARKS if p['has_customs_office']]

def get_parks_summary():
    """Get summary statistics of all parks"""
    total = len(ETHIOPIAN_PARKS)
    sez_count = len([p for p in ETHIOPIAN_PARKS if p['park_type'] == 'SEZ'])
    ftz_count = len([p for p in ETHIOPIAN_PARKS if p['park_type'] == 'FTZ'])
    iv_count = len([p for p in ETHIOPIAN_PARKS if p['park_type'] == 'Industrial Village'])
    operational = len([p for p in ETHIOPIAN_PARKS if p['status'] == 'operational'])

    return {
        'total_parks': total,
        'sez_count': sez_count,
        'ftz_count': ftz_count,
        'industrial_village_count': iv_count,
        'operational': operational,
        'under_development': total - operational
    }

if __name__ == '__main__':
    summary = get_parks_summary()
    print("=" * 70)
    print("  Ethiopian IPDC Industrial Parks - Official Dataset")
    print("=" * 70)
    print(f"\n  Total Facilities: {summary['total_parks']}")
    print(f"   - Special Economic Zones (SEZs): {summary['sez_count']}")
    print(f"   - Free Trade Zones (FTZ): {summary['ftz_count']}")
    print(f"   - Industrial Villages: {summary['industrial_village_count']}")
    print(f"\n  Operational: {summary['operational']}")
    print(f"  Under Development: {summary['under_development']}")
    print("\n" + "=" * 70)
    print("\n11 SEZs:")
    sezs = [p for p in ETHIOPIAN_PARKS if p['park_type'] == 'SEZ']
    for i, park in enumerate(sezs, 1):
        print(f"   {i}. {park['park_name']} - {park['location']}")

    print("\n1 FTZ:")
    ftzs = [p for p in ETHIOPIAN_PARKS if p['park_type'] == 'FTZ']
    for park in ftzs:
        print(f"   - {park['park_name']} - {park['location']}")

    print("\n1 Industrial Village:")
    ivs = [p for p in ETHIOPIAN_PARKS if p['park_type'] == 'Industrial Village']
    for park in ivs:
        print(f"   - {park['park_name']} - {park['location']}")
    print("=" * 70)
