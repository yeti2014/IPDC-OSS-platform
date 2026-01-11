"""
Quick Test Script for Model 1 - Service Classifier
Tests if the trained model can make predictions correctly
"""

import joblib
import numpy as np
import sys

print("\n" + "="*60)
print("  MODEL 1 PREDICTION TEST")
print("="*60)

# Load models
print("\n[1/3] Loading trained models...")
try:
    model = joblib.load('models/model_category.pkl')
    vectorizer = joblib.load('models/vectorizer.pkl')
    scaler = joblib.load('models/scaler.pkl')
    le_service = joblib.load('models/label_encoder_service.pkl')
    print("  Models loaded successfully")
except Exception as e:
    print(f"  ERROR: Could not load models - {e}")
    sys.exit(1)

# Test cases
test_cases = [
    {
        'text': 'Investment Permit Application for textile manufacturing facility in Hawassa Industrial Park',
        'expected': 'investment_permit'
    },
    {
        'text': 'Business License Renewal for Addis Manufacturing PLC',
        'expected': 'business_license'
    },
    {
        'text': 'Work Permit Application for foreign production manager',
        'expected': 'work_permit'
    },
    {
        'text': 'TIN Certificate Request for new company registration',
        'expected': 'tin_issuance'
    },
    {
        'text': 'Customs Duty Exemption for imported industrial machinery',
        'expected': 'customs_exemption'
    }
]

print(f"\n[2/3] Running {len(test_cases)} test predictions...\n")

correct = 0
for i, test in enumerate(test_cases, 1):
    # Prepare features
    X_text = vectorizer.transform([test['text']]).toarray()

    # Add metadata features (dummy values for testing)
    metadata = np.array([[9, 1, len(test['text']), len(test['text'].split())]])
    metadata_scaled = scaler.transform(metadata)

    X = np.hstack([X_text, metadata_scaled])

    # Predict
    prediction = model.predict(X)[0]
    predicted_service = le_service.inverse_transform([prediction])[0]

    is_correct = predicted_service == test['expected']
    if is_correct:
        correct += 1

    status = "[PASS]" if is_correct else "[FAIL]"
    print(f"  Test {i}: {status}")
    print(f"    Input: {test['text'][:60]}...")
    print(f"    Expected: {test['expected']}")
    print(f"    Predicted: {predicted_service}")
    if not is_correct:
        print(f"    MISMATCH!")
    print()

# Results
print("[3/3] Test Results:")
print(f"  Passed: {correct}/{len(test_cases)}")
print(f"  Accuracy: {correct/len(test_cases)*100:.0f}%")

print("\n" + "="*60)
if correct == len(test_cases):
    print("  ALL TESTS PASSED - Model 1 is working correctly!")
else:
    print("  Some tests failed - Model may need adjustment")
print("="*60 + "\n")

sys.exit(0 if correct == len(test_cases) else 1)
