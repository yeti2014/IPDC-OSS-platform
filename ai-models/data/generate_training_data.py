"""
Training Data Generator for Model 1 and Model 2
Generates data and saves to CSV files - Windows compatible (no emojis)
"""
import os
import sys

# Set UTF-8 encoding for Windows console
sys.stdout.reconfigure(encoding='utf-8') if hasattr(sys.stdout, 'reconfigure') else None

from generate_synthetic_data import generate_synthetic_service_requests, generate_synthetic_assets
import pandas as pd

def main():
    print("\n" + "="*60)
    print("IPDC AI MODELS - TRAINING DATA GENERATION")
    print("="*60)

    # Create directories if they don't exist
    os.makedirs('raw', exist_ok=True)
    os.makedirs('processed', exist_ok=True)

    print("\n[1/2] Generating service requests for Model 1...")
    print("      Target: 1000 samples")

    try:
        service_requests = generate_synthetic_service_requests(n_samples=1000)

        # Save to CSV
        output_file = 'raw/service_requests_synthetic.csv'
        service_requests.to_csv(output_file, index=False, encoding='utf-8')

        print(f"\n      SUCCESS: Generated {len(service_requests)} service requests")
        print(f"      Saved to: {output_file}")
        print(f"      File size: {os.path.getsize(output_file) / 1024:.1f} KB")
        print(f"\n      Dataset Statistics:")
        print(f"      - Service Types: {service_requests['serviceType'].nunique()}")
        print(f"      - Priorities: {service_requests['priority'].nunique()}")
        print(f"      - Statuses: {service_requests['status'].nunique()}")
        print(f"\n      Service Type Distribution:")
        for stype, count in service_requests['serviceType'].value_counts().head(5).items():
            print(f"        {stype}: {count}")

    except Exception as e:
        print(f"\n      ERROR: Failed to generate service requests")
        print(f"      {str(e)}")
        return False

    print("\n" + "-"*60)
    print("\n[2/2] Generating assets for Model 2...")
    print("      Target: 500 samples")

    try:
        assets = generate_synthetic_assets(n_samples=500)

        # Save to CSV
        output_file = 'raw/assets_synthetic.csv'
        assets.to_csv(output_file, index=False, encoding='utf-8')

        print(f"\n      SUCCESS: Generated {len(assets)} assets")
        print(f"      Saved to: {output_file}")
        print(f"      File size: {os.path.getsize(output_file) / 1024:.1f} KB")
        print(f"\n      Dataset Statistics:")
        print(f"      - Asset Categories: {assets['category'].nunique()}")
        print(f"      - Asset Statuses: {assets['status'].nunique()}")
        print(f"      - Asset Conditions: {assets['condition'].nunique()}")
        print(f"\n      Category Distribution:")
        for cat, count in assets['category'].value_counts().head(5).items():
            print(f"        {cat}: {count}")

    except Exception as e:
        print(f"\n      ERROR: Failed to generate assets")
        print(f"      {str(e)}")
        return False

    print("\n" + "="*60)
    print("DATA GENERATION COMPLETE!")
    print("="*60)
    print("\nNext Steps:")
    print("  1. Train Model 1: cd ../model1_service_classifier && py train.py")
    print("  2. Train Model 2: cd ../model2_predictive_maintenance && py train.py")
    print("\n")

    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
