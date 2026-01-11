"""
Synthetic Data Generator for IPDC Platform AI Training
Generates realistic training data based on Ethiopian IPDC context
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random

# Ethiopian company names for realistic data
ETHIOPIAN_COMPANIES = [
    "Addis Manufacturing PLC", "Hawassa Textile Industry", "Bole Lemi Garment Factory",
    "Kombolcha Industrial Park Ltd", "Mekelle Steel Industry", "Adama Food Processing",
    "Dire Dawa Leather Factory", "Bahir Dar Pharmaceutical PLC", "Jimma Coffee Processing",
    "Gondar Ceramics Industry", "Nazret Agro Processing", "Dessie Textile Mills"
]

# Service types from ossServices.ts
OSS_SERVICE_TYPES = [
    'investment_permit', 'business_license', 'commercial_registration',
    'work_permit', 'trade_name_registration', 'agreements',
    'tin_issuance', 'notarization', 'customs_exemption',
    'customs_clearance', 'banking_services'
]

# Priorities and statuses
PRIORITIES = ['low', 'normal', 'high', 'urgent']
SERVICE_STATUSES = ['draft', 'submitted', 'under_review', 'pending_documents',
                    'approved', 'rejected', 'issued', 'expired']

# Asset categories from asset.ts
ASSET_CATEGORIES = ['machinery', 'vehicle', 'infrastructure', 'it-equipment',
                   'furniture', 'tool', 'safety-equipment', 'utility', 'other']
ASSET_STATUSES = ['operational', 'maintenance', 'repair', 'retired', 'reserved', 'damaged']
ASSET_CONDITIONS = ['excellent', 'good', 'fair', 'poor', 'critical']


def generate_synthetic_service_requests(n_samples=500):
    """
    Generate synthetic OSS service requests for Model 1 training
    Based on Chinese smart park service classification patterns
    """
    print(f"\n   🔧 Generating {n_samples} synthetic service requests...")

    data = []
    start_date = datetime.now() - timedelta(days=365)

    for i in range(n_samples):
        company = random.choice(ETHIOPIAN_COMPANIES)
        service_type = random.choice(OSS_SERVICE_TYPES)

        # Generate realistic titles based on service type
        titles = {
            'investment_permit': f"New Investment Permit Application - {company}",
            'business_license': f"Business License Renewal for {company}",
            'commercial_registration': f"Commercial Registration - {company}",
            'work_permit': f"Work Permit Application for Foreign Employee",
            'trade_name_registration': f"Trade Name Registration - {company.split()[0]} Manufacturing",
            'agreements': f"Partnership Agreement between {company} and IPDC",
            'tin_issuance': f"TIN Certificate Request - {company}",
            'notarization': f"MoU Notarization Service",
            'customs_exemption': f"Customs Duty Exemption for Raw Materials",
            'customs_clearance': f"Import Clearance - Machinery and Equipment",
            'banking_services': f"Loan Application for Working Capital"
        }

        # Generate realistic descriptions
        descriptions = {
            'investment_permit': f"{company} is applying for an investment permit for a new textile manufacturing facility in Hawassa Industrial Park. Expected capital investment: USD 5 million, creating 500 jobs.",
            'business_license': f"Request to renew business operating license for {company}. Previous license expires next month. All compliance documents attached.",
            'commercial_registration': f"{company} requires commercial registration certificate for newly established manufacturing entity. Registered capital: 10 million ETB.",
            'work_permit': f"Application for work permit for Mr. Zhang Wei (Chinese national) as Production Manager at {company}. 2-year contract. CV and employment contract attached.",
            'trade_name_registration': f"Registration of trade name '{company.split()[0]} Industries' for manufacturing and export business.",
            'agreements': f"Processing partnership agreement between {company} and IPDC for land lease and utility services.",
            'tin_issuance': f"Tax Identification Number (TIN) application for {company} to commence business operations.",
            'notarization': f"Notarization required for Memorandum of Understanding between shareholders of {company}.",
            'customs_exemption': f"Request for customs duty exemption on imported industrial machinery valued at USD 2 million as per investment permit.",
            'customs_clearance': f"Import clearance for 50 tons of raw textile materials. Bill of lading no: BL-{random.randint(10000, 99999)}.",
            'banking_services': f"Application for working capital loan of 5 million ETB for {company} expansion project."
        }

        # Priority based on service type (urgent services get higher priority)
        urgent_services = ['work_permit', 'customs_clearance', 'banking_services']
        if service_type in urgent_services:
            priority = random.choices(PRIORITIES, weights=[0.1, 0.2, 0.4, 0.3])[0]
        else:
            priority = random.choices(PRIORITIES, weights=[0.2, 0.5, 0.2, 0.1])[0]

        # Status based on age (older requests more likely to be processed)
        created_at = start_date + timedelta(days=random.randint(0, 365))
        age_days = (datetime.now() - created_at).days

        if age_days < 7:
            status = random.choice(['draft', 'submitted', 'under_review'])
        elif age_days < 30:
            status = random.choice(['under_review', 'pending_documents', 'approved'])
        else:
            status = random.choice(['approved', 'issued', 'rejected'])

        # Processing time (varies by service type and priority)
        processing_times = {
            'investment_permit': (10, 20),
            'business_license': (5, 10),
            'commercial_registration': (3, 7),
            'work_permit': (15, 25),
            'trade_name_registration': (1, 3),
            'agreements': (3, 7),
            'tin_issuance': (1, 2),
            'notarization': (1, 1),
            'customs_exemption': (7, 14),
            'customs_clearance': (3, 7),
            'banking_services': (5, 10)
        }
        min_days, max_days = processing_times.get(service_type, (5, 10))
        actual_processing_days = random.randint(min_days, max_days)

        # Adjust for priority
        if priority == 'urgent':
            actual_processing_days = int(actual_processing_days * 0.5)
        elif priority == 'low':
            actual_processing_days = int(actual_processing_days * 1.5)

        record = {
            'id': f'req_{i:04d}',
            'tenantId': f'tenant_{random.randint(1, 50):03d}',
            'tenantName': company,
            'tenantEmail': f"{company.lower().replace(' ', '.')}@example.com",
            'serviceType': service_type,
            'title': titles.get(service_type, f"{service_type.replace('_', ' ').title()} Request"),
            'description': descriptions.get(service_type, f"Request for {service_type.replace('_', ' ')}"),
            'status': status,
            'priority': priority,
            'companyName': company,
            'contactPerson': random.choice(['Abebe Bekele', 'Tigist Assefa', 'Yohannes Gebre',
                                           'Almaz Tesfaye', 'Solomon Haile']),
            'contactPhone': f'+251-91-{random.randint(1000000, 9999999)}',
            'contactEmail': f"contact@{company.lower().replace(' ', '')}.com",
            'createdAt': created_at.isoformat(),
            'updatedAt': (created_at + timedelta(days=random.randint(0, age_days))).isoformat(),
            'submittedAt': (created_at + timedelta(hours=random.randint(1, 48))).isoformat() if status != 'draft' else None,
            'actual_processing_days': actual_processing_days if status in ['approved', 'issued'] else None
        }

        data.append(record)

    df = pd.DataFrame(data)
    print(f"   ✅ Generated {len(df)} service requests")
    print(f"      Service types: {df['serviceType'].value_counts().to_dict()}")
    print(f"      Priorities: {df['priority'].value_counts().to_dict()}")

    return df


def generate_synthetic_assets(n_samples=200):
    """
    Generate synthetic assets for Model 2 training
    Based on Chinese industrial park asset management patterns
    """
    print(f"\n   🔧 Generating {n_samples} synthetic assets...")

    data = []
    start_date = datetime.now() - timedelta(days=365 * 5)  # 5 years of assets

    manufacturers = {
        'machinery': ['Siemens', 'ABB', 'Schneider Electric', 'Mitsubishi', 'Honeywell'],
        'vehicle': ['Toyota', 'Isuzu', 'Mercedes-Benz', 'Volvo', 'Hino'],
        'it-equipment': ['HP', 'Dell', 'Lenovo', 'Cisco', 'Huawei'],
        'infrastructure': ['General Electric', 'Caterpillar', 'Komatsu'],
        'utility': ['Grundfos', 'Wilo', 'KSB']
    }

    for i in range(n_samples):
        category = random.choice(ASSET_CATEGORIES)
        manufacturer = random.choice(manufacturers.get(category, ['Generic Brand']))

        # Purchase date (older assets more likely to need maintenance)
        purchase_date = start_date + timedelta(days=random.randint(0, 365 * 5))
        age_days = (datetime.now() - purchase_date).days

        # Condition degrades with age
        if age_days < 365:
            condition = random.choices(ASSET_CONDITIONS, weights=[0.4, 0.4, 0.15, 0.04, 0.01])[0]
        elif age_days < 365 * 2:
            condition = random.choices(ASSET_CONDITIONS, weights=[0.2, 0.4, 0.3, 0.08, 0.02])[0]
        elif age_days < 365 * 3:
            condition = random.choices(ASSET_CONDITIONS, weights=[0.1, 0.3, 0.4, 0.15, 0.05])[0]
        else:
            condition = random.choices(ASSET_CONDITIONS, weights=[0.05, 0.2, 0.35, 0.3, 0.1])[0]

        # Status based on condition
        if condition in ['excellent', 'good']:
            status = random.choices(ASSET_STATUSES, weights=[0.8, 0.1, 0.05, 0, 0.05, 0])[0]
        elif condition == 'fair':
            status = random.choices(ASSET_STATUSES, weights=[0.6, 0.2, 0.1, 0, 0.05, 0.05])[0]
        else:
            status = random.choices(ASSET_STATUSES, weights=[0.3, 0.3, 0.3, 0, 0.05, 0.05])[0]

        # Purchase cost based on category
        cost_ranges = {
            'machinery': (50000, 500000),
            'vehicle': (30000, 150000),
            'infrastructure': (100000, 1000000),
            'it-equipment': (1000, 10000),
            'furniture': (500, 5000),
            'tool': (100, 5000),
            'safety-equipment': (200, 10000),
            'utility': (10000, 100000),
            'other': (1000, 50000)
        }
        min_cost, max_cost = cost_ranges.get(category, (1000, 50000))
        purchase_cost = random.randint(min_cost, max_cost)

        # Depreciation rate
        depreciation_rate = random.uniform(5, 20)  # 5-20% per year
        years_old = age_days / 365.25
        current_value = max(0, purchase_cost * (1 - depreciation_rate / 100) ** years_old)

        # Maintenance interval based on category
        maintenance_intervals = {
            'machinery': 90,
            'vehicle': 120,
            'infrastructure': 180,
            'it-equipment': 365,
            'utility': 90
        }
        maintenance_interval = maintenance_intervals.get(category, 180)

        # Last maintenance (random within interval)
        days_since_maintenance = random.randint(0, maintenance_interval)
        last_maintenance_date = datetime.now() - timedelta(days=days_since_maintenance)
        next_maintenance_date = last_maintenance_date + timedelta(days=maintenance_interval)

        # Maintenance history (number of maintenance events)
        maintenance_count = int(age_days / maintenance_interval)

        # Failure probability (increases with age and poor condition)
        base_failure_prob = 5  # 5% base probability
        age_factor = min(age_days / 365 / 10, 5)  # Max 5% from age
        condition_factor = {'excellent': 0, 'good': 2, 'fair': 5, 'poor': 10, 'critical': 20}[condition]
        failure_probability = min(base_failure_prob + age_factor + condition_factor, 95)

        record = {
            'id': f'asset_{i:04d}',
            'assetCode': f'{category[:3].upper()}-{random.randint(100000, 999999)}-{random.randint(100, 999)}',
            'name': f'{manufacturer} {category.replace("-", " ").title()} #{i+1}',
            'description': f'{manufacturer} industrial {category} for manufacturing operations',
            'category': category,
            'status': status,
            'condition': condition,
            'parkId': random.choice(['hawassa-park', 'bole-lemi', 'kilinto', 'kombolcha']),
            'parkName': random.choice(['Hawassa Industrial Park', 'Bole Lemi Industrial Park',
                                      'Kilinto Industrial Park', 'Kombolcha Industrial Park']),
            'location': f'Building {random.choice(["A", "B", "C", "D"])}, Floor {random.randint(1, 3)}',
            'purchaseDate': purchase_date.isoformat(),
            'purchaseCost': purchase_cost,
            'currentValue': round(current_value, 2),
            'depreciationRate': round(depreciation_rate, 2),
            'manufacturer': manufacturer,
            'model': f'{manufacturer}-{random.randint(100, 999)}',
            'serialNumber': f'SN{random.randint(1000000, 9999999)}',
            'maintenanceInterval': maintenance_interval,
            'lastMaintenanceDate': last_maintenance_date.isoformat(),
            'nextMaintenanceDate': next_maintenance_date.isoformat(),
            'warrantyExpiry': (purchase_date + timedelta(days=365 * random.randint(1, 3))).isoformat(),
            'age_days': age_days,
            'maintenance_count': maintenance_count,
            'days_since_maintenance': days_since_maintenance,
            'failure_probability': round(failure_probability, 2),
            'createdAt': purchase_date.isoformat(),
            'updatedAt': datetime.now().isoformat()
        }

        data.append(record)

    df = pd.DataFrame(data)
    print(f"   ✅ Generated {len(df)} assets")
    print(f"      Categories: {df['category'].value_counts().to_dict()}")
    print(f"      Conditions: {df['condition'].value_counts().to_dict()}")

    return df


if __name__ == "__main__":
    # Test generation
    print("Testing synthetic data generation...\n")

    service_requests = generate_synthetic_service_requests(n_samples=100)
    print(f"\nService Requests shape: {service_requests.shape}")
    print(service_requests.head())

    assets = generate_synthetic_assets(n_samples=50)
    print(f"\nAssets shape: {assets.shape}")
    print(assets.head())
