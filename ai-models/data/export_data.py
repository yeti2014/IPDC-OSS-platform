"""
Data Export Script for IPDC Platform
Exports service requests and assets data from Firebase for AI model training
"""

import firebase_admin
from firebase_admin import credentials, firestore
import pandas as pd
from datetime import datetime
import json
import os
from pathlib import Path

# Initialize Firebase Admin SDK
def initialize_firebase():
    """
    Initialize Firebase Admin SDK
    IMPORTANT: You need to download your Firebase service account key JSON file
    from Firebase Console > Project Settings > Service Accounts
    """
    try:
        # Path to your Firebase service account key
        cred_path = Path(__file__).parent.parent / '.env' / 'firebase-service-account.json'

        if not cred_path.exists():
            print("❌ Firebase service account key not found!")
            print(f"   Please download it from Firebase Console and save it to:")
            print(f"   {cred_path}")
            print("\n   Steps:")
            print("   1. Go to Firebase Console > Project Settings")
            print("   2. Click 'Service Accounts' tab")
            print("   3. Click 'Generate new private key'")
            print("   4. Save the JSON file to the path above")
            return None

        cred = credentials.Certificate(str(cred_path))
        firebase_admin.initialize_app(cred)
        return firestore.client()

    except Exception as e:
        print(f"❌ Firebase initialization failed: {e}")
        return None


def export_service_requests(db, output_dir='raw'):
    """
    Export OSS service requests for Model 1 training
    """
    print("\n📦 Exporting OSS Service Requests...")

    try:
        # Fetch all service requests (adjust collection name if different)
        # Common collection names: 'serviceRequests', 'ossRequests', 'requests'
        collection_name = 'serviceRequests'  # ⚠️ UPDATE THIS IF DIFFERENT

        requests_ref = db.collection(collection_name)
        docs = requests_ref.stream()

        requests_data = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            requests_data.append(data)

        if not requests_data:
            print(f"   ⚠️  No data found in '{collection_name}' collection")
            print("   Please update the collection name in the script")
            return None

        # Convert to DataFrame
        df = pd.DataFrame(requests_data)

        # Convert timestamps
        timestamp_cols = ['createdAt', 'updatedAt', 'submittedAt', 'reviewedAt', 'approvedAt', 'issuedAt']
        for col in timestamp_cols:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col])

        # Save to CSV
        output_path = Path(__file__).parent / output_dir / 'service_requests.csv'
        output_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(output_path, index=False)

        print(f"   ✅ Exported {len(df)} service requests to {output_path}")
        print(f"   📊 Columns: {', '.join(df.columns)}")

        # Save summary
        summary = {
            'total_records': len(df),
            'date_range': {
                'earliest': df['createdAt'].min().isoformat() if 'createdAt' in df.columns else None,
                'latest': df['createdAt'].max().isoformat() if 'createdAt' in df.columns else None
            },
            'service_types': df['serviceType'].value_counts().to_dict() if 'serviceType' in df.columns else {},
            'priorities': df['priority'].value_counts().to_dict() if 'priority' in df.columns else {},
            'statuses': df['status'].value_counts().to_dict() if 'status' in df.columns else {}
        }

        summary_path = Path(__file__).parent / output_dir / 'service_requests_summary.json'
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2, default=str)

        print(f"   📋 Summary saved to {summary_path}")

        return df

    except Exception as e:
        print(f"   ❌ Export failed: {e}")
        return None


def export_assets(db, output_dir='raw'):
    """
    Export assets data for Model 2 training
    """
    print("\n📦 Exporting Assets...")

    try:
        # Fetch all assets
        collection_name = 'assets'  # ⚠️ UPDATE THIS IF DIFFERENT

        assets_ref = db.collection(collection_name)
        docs = assets_ref.stream()

        assets_data = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            assets_data.append(data)

        if not assets_data:
            print(f"   ⚠️  No data found in '{collection_name}' collection")
            return None

        # Convert to DataFrame
        df = pd.DataFrame(assets_data)

        # Convert timestamps
        timestamp_cols = ['purchaseDate', 'createdAt', 'updatedAt', 'lastMaintenanceDate',
                         'nextMaintenanceDate', 'warrantyExpiry']
        for col in timestamp_cols:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col])

        # Calculate age in days
        if 'purchaseDate' in df.columns:
            df['age_days'] = (pd.Timestamp.now() - df['purchaseDate']).dt.days

        # Save to CSV
        output_path = Path(__file__).parent / output_dir / 'assets.csv'
        output_path.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(output_path, index=False)

        print(f"   ✅ Exported {len(df)} assets to {output_path}")
        print(f"   📊 Columns: {', '.join(df.columns)}")

        # Save summary
        summary = {
            'total_records': len(df),
            'categories': df['category'].value_counts().to_dict() if 'category' in df.columns else {},
            'statuses': df['status'].value_counts().to_dict() if 'status' in df.columns else {},
            'conditions': df['condition'].value_counts().to_dict() if 'condition' in df.columns else {},
            'total_value': float(df['currentValue'].sum()) if 'currentValue' in df.columns else 0,
            'avg_age_days': float(df['age_days'].mean()) if 'age_days' in df.columns else 0
        }

        summary_path = Path(__file__).parent / output_dir / 'assets_summary.json'
        with open(summary_path, 'w') as f:
            json.dump(summary, f, indent=2, default=str)

        print(f"   📋 Summary saved to {summary_path}")

        return df

    except Exception as e:
        print(f"   ❌ Export failed: {e}")
        return None


def export_maintenance_records(db, output_dir='raw'):
    """
    Export maintenance records for Model 2 training
    """
    print("\n📦 Exporting Maintenance Records...")

    try:
        collection_name = 'maintenanceRecords'  # ⚠️ UPDATE THIS IF DIFFERENT

        records_ref = db.collection(collection_name)
        docs = records_ref.stream()

        records_data = []
        for doc in docs:
            data = doc.to_dict()
            data['id'] = doc.id
            records_data.append(data)

        if not records_data:
            print(f"   ⚠️  No data found in '{collection_name}' collection")
            print("   This is optional but will improve Model 2 accuracy")
            return None

        # Convert to DataFrame
        df = pd.DataFrame(records_data)

        # Convert timestamps
        timestamp_cols = ['scheduledDate', 'completedDate', 'createdAt', 'updatedAt', 'nextOccurrence']
        for col in timestamp_cols:
            if col in df.columns:
                df[col] = pd.to_datetime(df[col])

        # Save to CSV
        output_path = Path(__file__).parent / output_dir / 'maintenance_records.csv'
        df.to_csv(output_path, index=False)

        print(f"   ✅ Exported {len(df)} maintenance records to {output_path}")

        return df

    except Exception as e:
        print(f"   ⚠️  Export failed (optional): {e}")
        return None


def generate_synthetic_data_if_needed(output_dir='raw'):
    """
    Generate synthetic training data if Firebase data is insufficient
    This ensures models can be trained even with limited real data
    """
    print("\n🔧 Checking if synthetic data generation is needed...")

    # Check if we have enough real data
    service_requests_path = Path(__file__).parent / output_dir / 'service_requests.csv'
    assets_path = Path(__file__).parent / output_dir / 'assets.csv'

    need_synthetic = False

    if service_requests_path.exists():
        df = pd.read_csv(service_requests_path)
        if len(df) < 100:  # Need at least 100 samples for training
            print(f"   ⚠️  Only {len(df)} service requests found. Need at least 100.")
            need_synthetic = True
    else:
        print("   ⚠️  No service requests data found")
        need_synthetic = True

    if need_synthetic:
        print("\n   📝 Generating synthetic training data...")
        print("   (This will help train models until you have more real data)")

        # Import synthetic data generator
        from generate_synthetic_data import generate_synthetic_service_requests, generate_synthetic_assets

        # Generate synthetic data
        synthetic_requests = generate_synthetic_service_requests(n_samples=500)
        synthetic_requests.to_csv(
            Path(__file__).parent / output_dir / 'service_requests_synthetic.csv',
            index=False
        )
        print(f"   ✅ Generated 500 synthetic service requests")

        synthetic_assets = generate_synthetic_assets(n_samples=200)
        synthetic_assets.to_csv(
            Path(__file__).parent / output_dir / 'assets_synthetic.csv',
            index=False
        )
        print(f"   ✅ Generated 200 synthetic assets")

        print("\n   💡 Tip: Replace synthetic data with real data as you collect more")


def main():
    """
    Main export function
    """
    print("=" * 60)
    print("  IPDC Platform - AI Training Data Export")
    print("  Adapted from Chinese Smart Park Systems")
    print("=" * 60)

    # Initialize Firebase
    db = initialize_firebase()

    if db is None:
        print("\n❌ Cannot proceed without Firebase connection")
        print("   Please set up Firebase service account key first")
        return

    # Export data
    export_service_requests(db, output_dir='raw')
    export_assets(db, output_dir='raw')
    export_maintenance_records(db, output_dir='raw')

    # Generate synthetic data if needed
    generate_synthetic_data_if_needed(output_dir='raw')

    print("\n" + "=" * 60)
    print("  ✅ Data export completed!")
    print("  📁 Data saved to: ai-models/data/raw/")
    print("  Next step: Run data preprocessing script")
    print("=" * 60)


if __name__ == "__main__":
    main()
