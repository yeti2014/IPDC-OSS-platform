"""
Model 3: Automatic Retraining Pipeline
Adapted from Alibaba/Tencent Online Learning Strategy

This script retrains the park recommendation model with new real tenant data.
Can be triggered:
1. Automatically (every 50 new placements)
2. Scheduled (monthly cron job)
3. Manually (by admin)
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

import pandas as pd
import json
from datetime import datetime
import joblib

print("=" * 70)
print("  Model 3: Automatic Retraining Pipeline")
print("  Alibaba/Tencent Online Learning Approach")
print("=" * 70)

# Configuration
DATA_DIR = Path(__file__).parent.parent / 'data' / 'raw'
MODEL_DIR = Path(__file__).parent / 'models'
LOGS_DIR = Path(__file__).parent / 'logs'
LOGS_DIR.mkdir(exist_ok=True)

SYNTHETIC_FILE = DATA_DIR / 'park_placements_synthetic.csv'
REAL_FILE = DATA_DIR / 'park_placements_real.csv'
METADATA_FILE = MODEL_DIR / 'metadata.json'

# Retraining thresholds
MIN_REAL_PLACEMENTS = 50  # Minimum real data before retraining
RETRAIN_EVERY_N_PLACEMENTS = 50  # Retrain after every N new placements

def check_retraining_needed():
    """
    Check if model retraining is needed
    Chinese approach: Data-driven retraining triggers
    """
    print("\n🔍 Checking if retraining is needed...")

    # Check if real data exists
    if not REAL_FILE.exists():
        print("   ℹ️  No real placement data yet (cold start mode)")
        print("   ℹ️  Waiting for real tenant feedback...")
        return False, "no_real_data"

    # Load real data
    df_real = pd.read_csv(REAL_FILE)
    n_real = len(df_real)

    print(f"   📊 Real placements collected: {n_real}")

    # Check minimum threshold
    if n_real < MIN_REAL_PLACEMENTS:
        print(f"   ⏳ Need {MIN_REAL_PLACEMENTS - n_real} more placements before first retrain")
        return False, "insufficient_data"

    # Load current model metadata
    if METADATA_FILE.exists():
        with open(METADATA_FILE, 'r') as f:
            metadata = json.load(f)

        last_retrain_date = metadata.get('training_date', '')
        last_n_placements = metadata.get('n_real_placements', 0)

        print(f"   📅 Last retrained: {last_retrain_date}")
        print(f"   📊 Placements at last retrain: {last_n_placements}")

        # Check if we have enough new placements
        new_placements = n_real - last_n_placements

        if new_placements >= RETRAIN_EVERY_N_PLACEMENTS:
            print(f"   ✅ {new_placements} new placements detected")
            print(f"   🚀 Retraining trigger threshold met!")
            return True, "new_data_available"
        else:
            print(f"   ⏳ Need {RETRAIN_EVERY_N_PLACEMENTS - new_placements} more placements")
            return False, "not_enough_new_data"
    else:
        # First time retraining with real data
        print(f"   ✅ First retraining with {n_real} real placements!")
        return True, "first_retrain"

def collect_feedback_from_firebase():
    """
    Collect tenant feedback from Firebase
    This would be called by a Cloud Function or scheduled task

    Firebase Events to collect:
    - tenant_viewed_recommendation (park_id, timestamp)
    - tenant_clicked_park (park_id, timestamp)
    - tenant_applied_to_park (park_id, timestamp)
    - application_approved (park_id, satisfaction_rating)
    """
    print("\n📥 Collecting feedback from Firebase...")

    # TODO: Implement Firebase integration
    # For now, return placeholder

    print("   ℹ️  Firebase integration pending")
    print("   ℹ️  In production, this will:")
    print("      - Query Firebase for new tenant placements")
    print("      - Extract implicit feedback (clicks, applications)")
    print("      - Extract explicit feedback (satisfaction ratings)")
    print("      - Save to park_placements_real.csv")

    return None

def trigger_retraining():
    """
    Trigger model retraining with combined data
    """
    print("\n🚀 Starting retraining process...")

    # Import training module
    from train import main as train_main

    try:
        # Run training
        print("   🔄 Running training script...")
        train_main()

        print("\n   ✅ Retraining completed successfully!")

        # Log retraining event
        log_retraining_event(success=True)

        return True

    except Exception as e:
        print(f"\n   ❌ Retraining failed: {e}")
        log_retraining_event(success=False, error=str(e))
        return False

def log_retraining_event(success, error=None):
    """Log retraining event for monitoring"""
    log_file = LOGS_DIR / 'retraining_log.json'

    log_entry = {
        'timestamp': datetime.now().isoformat(),
        'success': success,
        'error': error,
        'synthetic_file': str(SYNTHETIC_FILE),
        'real_file': str(REAL_FILE) if REAL_FILE.exists() else None
    }

    # Append to log file
    logs = []
    if log_file.exists():
        with open(log_file, 'r') as f:
            logs = json.load(f)

    logs.append(log_entry)

    with open(log_file, 'w') as f:
        json.dump(logs, f, indent=2)

    print(f"\n   📝 Logged retraining event: {log_file}")

def send_admin_notification(message):
    """Send notification to admin (email/SMS)"""
    print(f"\n   📧 Admin Notification: {message}")
    # TODO: Implement email/SMS notification

def main():
    """Main retraining pipeline"""
    print("\n" + "=" * 70)
    print("  RETRAINING PIPELINE EXECUTION")
    print("=" * 70)

    # Step 1: Collect new feedback from Firebase
    collect_feedback_from_firebase()

    # Step 2: Check if retraining is needed
    should_retrain, reason = check_retraining_needed()

    if should_retrain:
        print(f"\n   ✅ Retraining needed: {reason}")

        # Step 3: Trigger retraining
        success = trigger_retraining()

        if success:
            send_admin_notification("Model 3 retrained successfully with new data!")
            print("\n   🎉 Model updated and deployed!")
        else:
            send_admin_notification("Model 3 retraining FAILED! Please check logs.")
            print("\n   ⚠️  Retraining failed. Check logs for details.")

    else:
        print(f"\n   ℹ️  Retraining not needed: {reason}")
        print(f"   ✅ Current model is up-to-date")

    print("\n" + "=" * 70)
    print("  RETRAINING PIPELINE COMPLETE")
    print("=" * 70)

if __name__ == '__main__':
    main()
