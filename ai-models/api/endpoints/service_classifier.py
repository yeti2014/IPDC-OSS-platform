"""
Model 1: Service Request Classification Endpoint
Classifies IPDC service requests into 11 categories
"""
from fastapi import APIRouter, HTTPException
from datetime import datetime
import numpy as np
import time

from api.models import (
    ServiceClassificationRequest,
    ServiceClassificationResponse,
    ErrorResponse
)
from api.utils.model_loader import get_model

router = APIRouter()


# Service type display names
SERVICE_DISPLAY_NAMES = {
    'investment_permit': 'Investment Permit',
    'business_license': 'Business License',
    'commercial_registration': 'Commercial Registration',
    'work_permit': 'Work Permit',
    'trade_name_registration': 'Trade Name Registration',
    'agreements': 'Agreements',
    'tin_issuance': 'TIN Issuance',
    'notarization': 'Notarization',
    'customs_exemption': 'Customs Exemption',
    'customs_clearance': 'Customs Clearance',
    'banking_services': 'Banking Services'
}


# Recommendations for each service type
SERVICE_RECOMMENDATIONS = {
    'investment_permit': [
        'Prepare company registration documents',
        'Submit environmental impact assessment',
        'Attend pre-screening meeting with IPDC',
        'Prepare business plan and financial projections'
    ],
    'business_license': [
        'Ensure all required documents are notarized',
        'Obtain trade name registration first',
        'Prepare lease agreement or property ownership documents',
        'Complete business license application form'
    ],
    'work_permit': [
        'Submit employee CVs and qualifications',
        'Provide employment contracts',
        'Ensure visa documentation is complete',
        'Submit company registration certificate'
    ],
    'commercial_registration': [
        'Prepare memorandum and articles of association',
        'Obtain tax identification number (TIN)',
        'Reserve company name',
        'Submit shareholder information'
    ],
    'customs_clearance': [
        'Prepare bill of lading and commercial invoice',
        'Obtain customs exemption certificate if applicable',
        'Ensure goods declaration is accurate',
        'Verify import/export documentation'
    ],
    'customs_exemption': [
        'Verify eligibility for exemption',
        'Submit investment permit documentation',
        'Prepare detailed goods list',
        'Coordinate with Ethiopian Revenues and Customs Authority'
    ],
    'banking_services': [
        'Open company bank account',
        'Arrange foreign currency services',
        'Set up payment systems',
        'Coordinate with designated bank branches'
    ],
    'tin_issuance': [
        'Complete TIN application form',
        'Submit company registration certificate',
        'Provide business address verification',
        'Register for tax obligations'
    ],
    'notarization': [
        'Bring original documents',
        'Ensure all signatories are present',
        'Prepare identification documents',
        'Pay notarization fees'
    ],
    'trade_name_registration': [
        'Check name availability',
        'Submit name reservation form',
        'Pay registration fees',
        'Obtain name clearance certificate'
    ],
    'agreements': [
        'Review agreement terms',
        'Ensure all parties are represented',
        'Prepare supporting documentation',
        'Schedule agreement signing session'
    ]
}


@router.post("/classify-service", response_model=ServiceClassificationResponse)
async def classify_service(request: ServiceClassificationRequest):
    """
    Classify a service request using AI Model 1

    This endpoint:
    1. Takes service request title and description
    2. Uses trained ML model to classify into 11 service types
    3. Predicts priority level and estimated processing time
    4. Returns recommendations for next steps

    **Service Types**: investment_permit, business_license, commercial_registration,
    work_permit, trade_name_registration, agreements, tin_issuance, notarization,
    customs_exemption, customs_clearance, banking_services
    """
    start_time = time.time()

    try:
        # Load Model 1
        model1 = get_model('model1')

        # Prepare input text
        text = f"{request.title} {request.description}"

        # Extract metadata from request
        hour = request.created_at.hour
        day_of_week = request.created_at.weekday()
        text_length = len(text)
        word_count = len(text.split())

        # Transform text using vectorizer
        X_text = model1['vectorizer'].transform([text]).toarray()

        # Prepare metadata
        metadata = np.array([[hour, day_of_week, text_length, word_count]])
        metadata_scaled = model1['scaler'].transform(metadata)

        # Combine features
        X = np.hstack([X_text, metadata_scaled])

        # ==================== PREDICTIONS ====================

        # 1. Service Type Classification
        service_pred = model1['classifier'].predict(X)[0]
        service_type = model1['label_encoder_service'].inverse_transform([service_pred])[0]
        service_proba = model1['classifier'].predict_proba(X)[0]
        confidence_score = float(np.max(service_proba))

        # 2. Priority Prediction
        priority_pred = model1['priority_model'].predict(X)[0]
        priority = model1['label_encoder_priority'].inverse_transform([priority_pred])[0]

        # 3. Time Estimation
        estimated_days = float(model1['time_model'].predict(X)[0])
        estimated_days = max(1, round(estimated_days))  # Ensure at least 1 day

        # ==================== BUILD RESPONSE ====================

        processing_time_ms = int((time.time() - start_time) * 1000)

        response_data = {
            'service_type': service_type,
            'service_type_display': SERVICE_DISPLAY_NAMES.get(service_type, service_type.replace('_', ' ').title()),
            'priority': priority,
            'estimated_processing_days': estimated_days,
            'confidence_score': round(confidence_score, 3),
            'recommendations': SERVICE_RECOMMENDATIONS.get(service_type, [
                'Contact IPDC One-Stop Service for guidance',
                'Prepare all required documentation',
                'Submit application through official channels'
            ])
        }

        metadata = {
            'model_version': model1['metadata']['version'],
            'processing_time_ms': processing_time_ms,
            'timestamp': datetime.now().isoformat()
        }

        return ServiceClassificationResponse(
            success=True,
            data=response_data,
            metadata=metadata
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error classifying service request: {str(e)}"
        )
