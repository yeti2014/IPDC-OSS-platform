"""
Model 2: Predictive Maintenance Endpoint
Predicts asset failures and maintenance needs
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
import time

from api.models import (
    MaintenancePredictionRequest,
    MaintenancePredictionResponse,
    ErrorResponse
)
from api.utils.model_loader import get_model

router = APIRouter()


# Risk level colors (matching frontend theme)
RISK_COLORS = {
    'low': '#059669',      # Green
    'medium': '#f59e0b',   # Orange/Yellow
    'high': '#dc2626'      # Red
}


# Recommended actions based on risk level
RISK_ACTIONS = {
    'low': {
        'action': 'Continue regular maintenance schedule',
        'priority': 1,
        'urgency': 'routine'
    },
    'medium': {
        'action': 'Schedule maintenance within 30 days',
        'priority': 3,
        'urgency': 'soon'
    },
    'high': {
        'action': 'Urgent maintenance required immediately',
        'priority': 5,
        'urgency': 'immediate'
    }
}


def calculate_asset_features(request: MaintenancePredictionRequest, model2: dict) -> pd.DataFrame:
    """
    Calculate all required features for Model 2 prediction
    """
    # Parse last maintenance date
    last_maintenance = datetime.strptime(request.last_maintenance_date, '%Y-%m-%d')
    days_since_maintenance = (datetime.now() - last_maintenance).days

    # Calculate age in years
    age_years = request.age_days / 365.25

    # Calculate depreciation rate
    if request.purchase_cost > 0:
        depreciation_rate = ((request.purchase_cost - request.current_value) / request.purchase_cost) * 100
    else:
        depreciation_rate = 0

    # Calculate maintenance frequency (maintenances per year)
    if request.age_days > 0:
        maintenance_frequency = (request.maintenance_count / request.age_days) * 365.25
    else:
        maintenance_frequency = 0

    # Simple failure probability estimation
    failure_probability = min(100, (days_since_maintenance / request.maintenance_interval_days) * 100)

    # Check warranty status (assume 1 year warranty for new assets)
    warranty_active = 1 if request.age_days <= 365 else 0

    # Encode categorical features
    category_encoded = model2['label_encoder_category'].transform([request.category.value])[0]
    status_encoded = model2['label_encoder_status'].transform(['operational'])[0]  # Assume operational
    condition_encoded = model2['label_encoder_condition'].transform([request.condition.value])[0]

    # Build feature dictionary (must match training features exactly)
    features = {
        'age_days': request.age_days,
        'age_years': age_years,
        'days_since_maintenance': days_since_maintenance,
        'maintenance_count': request.maintenance_count,
        'maintenanceInterval': request.maintenance_interval_days,
        'purchaseCost': request.purchase_cost,
        'currentValue': request.current_value,
        'depreciationRate': depreciation_rate,
        'failure_probability': failure_probability,
        'maintenance_frequency': maintenance_frequency,
        'warranty_active': warranty_active,
        'category_encoded': category_encoded,
        'status_encoded': status_encoded,
        'condition_encoded': condition_encoded
    }

    # Create DataFrame with exact feature order from training
    feature_order = model2['features']['feature_names']
    X = pd.DataFrame([features])[feature_order]

    return X


@router.post("/predict-maintenance", response_model=MaintenancePredictionResponse)
async def predict_maintenance(request: MaintenancePredictionRequest):
    """
    Predict asset maintenance needs using AI Model 2

    This endpoint:
    1. Analyzes asset age, condition, and maintenance history
    2. Predicts likelihood of failure
    3. Estimates days until failure
    4. Classifies risk level (low, medium, high)
    5. Recommends maintenance actions

    **Asset Categories**: machinery, vehicle, infrastructure, it-equipment,
    furniture, tool, safety-equipment, utility, other

    **Conditions**: excellent, good, fair, poor

    **Risk Levels**: low, medium, high
    """
    start_time = time.time()

    try:
        # Load Model 2
        model2 = get_model('model2')

        # Calculate all required features
        X = calculate_asset_features(request, model2)

        # Scale features
        X_scaled = model2['scaler'].transform(X)

        # ==================== PREDICTIONS ====================

        # 1. Failure Prediction (binary: will fail soon or not)
        will_fail = bool(model2['failure_model'].predict(X_scaled)[0])
        failure_proba = model2['failure_model'].predict_proba(X_scaled)[0]
        failure_probability = float(failure_proba[1])  # Probability of failure

        # 2. Days Until Failure
        days_until_failure = float(model2['days_model'].predict(X_scaled)[0])
        days_until_failure = max(0, round(days_until_failure))

        # 3. Risk Classification
        risk_pred = model2['risk_model'].predict(X_scaled)[0]
        risk_level = model2['label_encoder_risk'].inverse_transform([risk_pred])[0]

        # ==================== CALCULATE RECOMMENDATIONS ====================

        # Get risk-based action
        risk_action = RISK_ACTIONS.get(risk_level, RISK_ACTIONS['medium'])

        # Calculate next maintenance date
        last_maintenance = datetime.strptime(request.last_maintenance_date, '%Y-%m-%d')
        if will_fail:
            # If failure predicted, schedule urgent maintenance
            next_maintenance_date = datetime.now() + timedelta(days=min(7, days_until_failure // 2))
        else:
            # Schedule based on interval
            next_maintenance_date = last_maintenance + timedelta(days=request.maintenance_interval_days)

        # Estimate maintenance cost (10% of current value as baseline)
        estimated_cost = request.current_value * 0.1
        if risk_level == 'high':
            estimated_cost *= 1.5  # Higher cost for urgent repairs
        elif risk_level == 'low':
            estimated_cost *= 0.7  # Lower cost for routine maintenance

        # ==================== BUILD RESPONSE ====================

        processing_time_ms = int((time.time() - start_time) * 1000)

        response_data = {
            'will_fail_soon': will_fail,
            'failure_probability': round(failure_probability, 3),
            'days_until_failure': days_until_failure,
            'risk_level': risk_level,
            'risk_color': RISK_COLORS.get(risk_level, '#6b7280'),
            'recommended_action': risk_action['action'],
            'maintenance_priority': risk_action['priority'],
            'urgency': risk_action['urgency'],
            'estimated_cost': round(estimated_cost, 2),
            'next_maintenance_date': next_maintenance_date.strftime('%Y-%m-%d'),
            'asset_details': {
                'age_years': round(request.age_days / 365.25, 1),
                'days_since_last_maintenance': (datetime.now() - last_maintenance).days,
                'total_maintenance_count': request.maintenance_count,
                'condition': request.condition.value
            }
        }

        metadata = {
            'model_version': model2['metadata']['version'],
            'processing_time_ms': processing_time_ms,
            'timestamp': datetime.now().isoformat()
        }

        return MaintenancePredictionResponse(
            success=True,
            data=response_data,
            metadata=metadata
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error predicting maintenance: {str(e)}"
        )
