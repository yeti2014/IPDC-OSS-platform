"""
Ethiopian IPDC Industrial Parks Dataset
Official IPDC Facilities: 10 SEZs + 1 FTZ + 4 Industrial Parks = 15 Total

Data sources:
- Ethiopian Investment Commission (EIC)
- Industrial Parks Development Corporation (IPDC)
- Ministry of Industry

Last updated: January 10, 2026
"""

ETHIOPIAN_PARKS = [
    # ========== 10 SPECIAL ECONOMIC ZONES (SEZs) ==========

    {
        'park_id': 'hawassa',
        'park_name': 'Hawassa Industrial Park',
        'park_type': 'SEZ',
        'location': 'Hawassa',
        'region': 'SNNPR',
        'latitude': 7.0621,
        'longitude': 38.4762,
        'size_hectares': 300,
        'available_land': 45,
        'occupancy_rate': 85,
        'status': 'operational',
        'established_year': 2016,
        'focus_industries': ['textile', 'garment', 'apparel'],
        'power_capacity_kw': 50000,
        'water_capacity_m3': 15000,
        'has_customs_office': True,
        'has_logistics_center': True,
        'distance_to_airport_km': 275,
        'distance_to_port_km': 912,  # Djibouti
        'utility_cost_score': 7,  # 1-10, higher is better
        'incentives': ['tax_holiday', 'duty_free', 'streamlined_licensing'],
        'description': 'Ethiopia\'s flagship SEZ, specializing in textile and garment manufacturing'
    },
    {
        'park_id': 'bole_lemi',
        'park_name': 'Bole Lemi Industrial Park',
        'park_type': 'SEZ',
        'location': 'Addis Ababa',
        'region': 'Addis Ababa',
        'latitude': 8.9806,
        'longitude': 38.7578,
        'size_hectares': 156,
        'available_land': 20,
        'occupancy_rate': 87,
        'status': 'operational',
        'established_year': 2014,
        'focus_industries': ['textile', 'garment', 'leather'],
        'power_capacity_kw': 40000,
        'water_capacity_m3': 12000,
        'has_customs_office': True,
        'has_logistics_center': True,
        'distance_to_airport_km': 12,
        'distance_to_port_km': 887,
        'utility_cost_score': 6,
        'incentives': ['tax_holiday', 'duty_free', 'fast_track_permits'],
        'description': 'SEZ located in capital city, excellent for garment and leather goods manufacturing'
    },
    {
        'park_id': 'kilinto',
        'park_name': 'Kilinto Industrial Park',
        'park_type': 'SEZ',
        'location': 'Addis Ababa',
        'region': 'Addis Ababa',
        'latitude': 8.9100,
        'longitude': 38.7200,
        'size_hectares': 300,
        'available_land': 80,
        'occupancy_rate': 73,
        'status': 'operational',
        'established_year': 2018,
        'focus_industries': ['pharmaceutical', 'chemical', 'medical'],
        'power_capacity_kw': 45000,
        'water_capacity_m3': 18000,
        'has_customs_office': True,
        'has_logistics_center': False,
        'distance_to_airport_km': 18,
        'distance_to_port_km': 890,
        'utility_cost_score': 7,
        'incentives': ['tax_holiday', 'duty_free', 'research_support'],
        'description': 'Specialized SEZ for pharmaceutical and chemical manufacturing'
    },
    {
        'park_id': 'kombolcha',
        'park_name': 'Kombolcha Industrial Park',
        'park_type': 'SEZ',
        'location': 'Kombolcha',
        'region': 'Amhara',
        'latitude': 11.0817,
        'longitude': 39.7433,
        'size_hectares': 300,
        'available_land': 120,
        'occupancy_rate': 60,
        'status': 'operational',
        'established_year': 2017,
        'focus_industries': ['textile', 'apparel'],
        'power_capacity_kw': 35000,
        'water_capacity_m3': 10000,
        'has_customs_office': False,
        'has_logistics_center': False,
        'distance_to_airport_km': 380,
        'distance_to_port_km': 780,
        'utility_cost_score': 8,
        'incentives': ['tax_holiday', 'low_labor_cost', 'land_lease_discount'],
        'description': 'Textile-focused SEZ with competitive utility costs and labor availability'
    },
    {
        'park_id': 'mekelle',
        'park_name': 'Mekelle Industrial Park',
        'park_type': 'SEZ',
        'location': 'Mekelle',
        'region': 'Tigray',
        'latitude': 13.4967,
        'longitude': 39.4753,
        'size_hectares': 100,
        'available_land': 85,
        'occupancy_rate': 15,
        'status': 'under_development',
        'established_year': 2019,
        'focus_industries': ['textile', 'agro_processing'],
        'power_capacity_kw': 25000,
        'water_capacity_m3': 8000,
        'has_customs_office': False,
        'has_logistics_center': False,
        'distance_to_airport_km': 8,
        'distance_to_port_km': 650,
        'utility_cost_score': 6,
        'incentives': ['tax_holiday', 'reconstruction_support'],
        'description': 'Emerging SEZ in northern region with reconstruction and development support'
    },
    {
        'park_id': 'adama',
        'park_name': 'Adama Industrial Park',
        'park_type': 'SEZ',
        'location': 'Adama',
        'region': 'Oromia',
        'latitude': 8.5400,
        'longitude': 39.2700,
        'size_hectares': 100,
        'available_land': 30,
        'occupancy_rate': 70,
        'status': 'operational',
        'established_year': 2016,
        'focus_industries': ['food_processing', 'beverage', 'agro_processing'],
        'power_capacity_kw': 30000,
        'water_capacity_m3': 12000,
        'has_customs_office': False,
        'has_logistics_center': True,
        'distance_to_airport_km': 85,
        'distance_to_port_km': 920,
        'utility_cost_score': 7,
        'incentives': ['tax_holiday', 'agro_processing_support'],
        'description': 'Food and agro-processing focused SEZ strategically located on main highway'
    },
    {
        'park_id': 'jimma',
        'park_name': 'Jimma Industrial Park',
        'park_type': 'SEZ',
        'location': 'Jimma',
        'region': 'Oromia',
        'latitude': 7.6778,
        'longitude': 36.8348,
        'size_hectares': 75,
        'available_land': 60,
        'occupancy_rate': 20,
        'status': 'under_development',
        'established_year': 2021,
        'focus_industries': ['coffee_processing', 'agro_processing'],
        'power_capacity_kw': 20000,
        'water_capacity_m3': 7000,
        'has_customs_office': False,
        'has_logistics_center': False,
        'distance_to_airport_km': 350,
        'distance_to_port_km': 1050,
        'utility_cost_score': 6,
        'incentives': ['tax_holiday', 'coffee_export_support'],
        'description': 'Coffee capital of Ethiopia, specialized SEZ for coffee and agro-processing'
    },
    {
        'park_id': 'bahir_dar',
        'park_name': 'Bahir Dar Industrial Park',
        'park_type': 'SEZ',
        'location': 'Bahir Dar',
        'region': 'Amhara',
        'latitude': 11.5933,
        'longitude': 37.3897,
        'size_hectares': 100,
        'available_land': 80,
        'occupancy_rate': 20,
        'status': 'under_development',
        'established_year': 2020,
        'focus_industries': ['textile', 'leather'],
        'power_capacity_kw': 28000,
        'water_capacity_m3': 9000,
        'has_customs_office': False,
        'has_logistics_center': False,
        'distance_to_airport_km': 12,
        'distance_to_port_km': 950,
        'utility_cost_score': 7,
        'incentives': ['tax_holiday', 'tourism_integration'],
        'description': 'Tourist city with emerging textile and leather SEZ development'
    },
    {
        'park_id': 'debre_birhan',
        'park_name': 'Debre Birhan Industrial Park',
        'park_type': 'SEZ',
        'location': 'Debre Birhan',
        'region': 'Amhara',
        'latitude': 9.6833,
        'longitude': 39.5333,
        'size_hectares': 100,
        'available_land': 75,
        'occupancy_rate': 25,
        'status': 'under_development',
        'established_year': 2019,
        'focus_industries': ['textile', 'garment'],
        'power_capacity_kw': 25000,
        'water_capacity_m3': 8000,
        'has_customs_office': False,
        'has_logistics_center': False,
        'distance_to_airport_km': 130,
        'distance_to_port_km': 920,
        'utility_cost_score': 8,
        'incentives': ['tax_holiday', 'highland_climate_advantage'],
        'description': 'Highland location SEZ with cool climate, suitable for textile manufacturing'
    },
    {
        'park_id': 'semera',
        'park_name': 'Semera Industrial Park',
        'park_type': 'SEZ',
        'location': 'Semera',
        'region': 'Afar',
        'latitude': 11.7943,
        'longitude': 40.9895,
        'size_hectares': 150,
        'available_land': 130,
        'occupancy_rate': 10,
        'status': 'under_development',
        'established_year': 2020,
        'focus_industries': ['manufacturing', 'logistics', 'agro_processing'],
        'power_capacity_kw': 30000,
        'water_capacity_m3': 10000,
        'has_customs_office': False,
        'has_logistics_center': True,
        'distance_to_airport_km': 8,
        'distance_to_port_km': 380,
        'utility_cost_score': 7,
        'incentives': ['tax_holiday', 'regional_development', 'duty_free'],
        'description': 'Strategic SEZ in Afar region with proximity to Djibouti corridor'
    },

    # ========== 1 FREE TRADE ZONE (FTZ) ==========

    {
        'park_id': 'dire_dawa_ftz',
        'park_name': 'Dire Dawa Free Trade Zone',
        'park_type': 'FTZ',
        'location': 'Dire Dawa',
        'region': 'Dire Dawa',
        'latitude': 9.6000,
        'longitude': 41.8500,
        'size_hectares': 1500,
        'available_land': 1200,
        'occupancy_rate': 20,
        'status': 'operational',
        'established_year': 2020,
        'focus_industries': ['agro_processing', 'food_processing', 'logistics', 'manufacturing'],
        'power_capacity_kw': 80000,
        'water_capacity_m3': 25000,
        'has_customs_office': True,
        'has_logistics_center': True,
        'distance_to_airport_km': 15,
        'distance_to_port_km': 320,
        'utility_cost_score': 9,
        'incentives': ['tax_holiday', 'duty_free', 'ftz_benefits', 'port_proximity_bonus'],
        'description': 'Free Trade Zone strategically located near Djibouti port, excellent for export-oriented businesses'
    },

    # ========== 4 INDUSTRIAL PARKS (Not Yet SEZs) ==========

    {
        'park_id': 'addis_industrial_village',
        'park_name': 'Addis Industrial Village (AIV)',
        'park_type': 'Industrial Park',
        'location': 'Addis Ababa',
        'region': 'Addis Ababa',
        'latitude': 9.0320,
        'longitude': 38.7469,
        'size_hectares': 50,
        'available_land': 15,
        'occupancy_rate': 70,
        'status': 'operational',
        'established_year': 1980,  # Ethiopia's oldest, modernized
        'focus_industries': ['light_manufacturing', 'food_processing', 'electronics', 'metal_works'],
        'power_capacity_kw': 20000,
        'water_capacity_m3': 8000,
        'has_customs_office': False,
        'has_logistics_center': True,
        'distance_to_airport_km': 8,
        'distance_to_port_km': 895,
        'utility_cost_score': 6,
        'incentives': ['business_support', 'sme_financing'],
        'description': 'Ethiopia\'s oldest industrial park (1980s), currently modernized. Supports SMEs and light manufacturing'
    },
    {
        'park_id': 'ict_park',
        'park_name': 'ICT Park',
        'park_type': 'Industrial Park',
        'location': 'Addis Ababa',
        'region': 'Addis Ababa',
        'latitude': 9.0050,
        'longitude': 38.7636,
        'size_hectares': 200,
        'available_land': 120,
        'occupancy_rate': 40,
        'status': 'operational',
        'established_year': 2019,
        'focus_industries': ['ict', 'software', 'electronics', 'telecommunications', 'business_process_outsourcing'],
        'power_capacity_kw': 35000,
        'water_capacity_m3': 12000,
        'has_customs_office': False,
        'has_logistics_center': True,
        'distance_to_airport_km': 10,
        'distance_to_port_km': 890,
        'utility_cost_score': 8,
        'incentives': ['tax_holiday', 'tech_innovation_support', 'high_speed_internet'],
        'description': 'Ethiopia\'s "Silicon Valley" - ICT Park dedicated to technology, software, and digital innovation (200 hectares)'
    },
    {
        'park_id': 'bole_lemi_ii',
        'park_name': 'Bole Lemi II Industrial Park',
        'park_type': 'Industrial Park',
        'location': 'Addis Ababa',
        'region': 'Addis Ababa',
        'latitude': 8.9750,
        'longitude': 38.7500,
        'size_hectares': 186,
        'available_land': 100,
        'occupancy_rate': 45,
        'status': 'operational',
        'established_year': 2018,
        'focus_industries': ['textile', 'garment', 'leather', 'manufacturing'],
        'power_capacity_kw': 45000,
        'water_capacity_m3': 14000,
        'has_customs_office': True,
        'has_logistics_center': True,
        'distance_to_airport_km': 13,
        'distance_to_port_km': 885,
        'utility_cost_score': 7,
        'incentives': ['tax_holiday', 'duty_free', 'expansion_phase_benefits'],
        'description': 'Expansion phase of Bole Lemi Industrial Park (186 hectares), focusing on textile and manufacturing'
    },
    {
        'park_id': 'arerti',
        'park_name': 'Arerti Industrial Park',
        'park_type': 'Industrial Park',
        'location': 'Arerti',
        'region': 'Oromia',
        'latitude': 8.3500,
        'longitude': 39.6500,
        'size_hectares': 150,
        'available_land': 100,
        'occupancy_rate': 33,
        'status': 'operational',
        'established_year': 2020,
        'focus_industries': ['textile', 'ceramics', 'woodwork', 'agro_processing'],
        'power_capacity_kw': 25000,
        'water_capacity_m3': 11000,
        'has_customs_office': False,
        'has_logistics_center': False,
        'distance_to_airport_km': 95,
        'distance_to_port_km': 940,
        'utility_cost_score': 7,
        'incentives': ['tax_holiday', 'export_support', 'local_sourcing_benefits'],
        'description': 'Located in Oromia (150 hectares), specializes in Textiles, Ceramics, and Woodwork'
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
    """Get parks by type (SEZ, FTZ, or Industrial Park)"""
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
    ip_count = len([p for p in ETHIOPIAN_PARKS if p['park_type'] == 'Industrial Park'])
    operational = len([p for p in ETHIOPIAN_PARKS if p['status'] == 'operational'])

    return {
        'total_parks': total,
        'sez_count': sez_count,
        'ftz_count': ftz_count,
        'industrial_park_count': ip_count,
        'operational': operational,
        'under_development': total - operational
    }

if __name__ == '__main__':
    # Print summary
    summary = get_parks_summary()
    print("=" * 70)
    print("  Ethiopian IPDC Industrial Parks - Official Dataset")
    print("=" * 70)
    print(f"\n📊 Total Facilities: {summary['total_parks']}")
    print(f"   - Special Economic Zones (SEZs): {summary['sez_count']}")
    print(f"   - Free Trade Zones (FTZ): {summary['ftz_count']}")
    print(f"   - Industrial Parks: {summary['industrial_park_count']}")
    print(f"\n✅ Operational: {summary['operational']}")
    print(f"🚧 Under Development: {summary['under_development']}")
    print("\n" + "=" * 70)
    print("\n10 SEZs:")
    sezs = [p for p in ETHIOPIAN_PARKS if p['park_type'] == 'SEZ']
    for i, park in enumerate(sezs, 1):
        print(f"   {i}. {park['park_name']} - {park['status']}")

    print("\n1 FTZ:")
    ftzs = [p for p in ETHIOPIAN_PARKS if p['park_type'] == 'FTZ']
    for park in ftzs:
        print(f"   - {park['park_name']} - {park['status']}")

    print("\n4 Industrial Parks (Not Yet SEZs):")
    ips = [p for p in ETHIOPIAN_PARKS if p['park_type'] == 'Industrial Park']
    for i, park in enumerate(ips, 1):
        print(f"   {i}. {park['park_name']} - {park['status']}")
    print("=" * 70)
