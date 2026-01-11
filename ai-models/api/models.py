"""
Pydantic Models for IPDC-OSS API
Request and Response schemas
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


# ==================== ENUMS ====================

class ServiceType(str, Enum):
    INVESTMENT_PERMIT = "investment_permit"
    BUSINESS_LICENSE = "business_license"
    COMMERCIAL_REGISTRATION = "commercial_registration"
    WORK_PERMIT = "work_permit"
    TRADE_NAME_REGISTRATION = "trade_name_registration"
    AGREEMENTS = "agreements"
    TIN_ISSUANCE = "tin_issuance"
    NOTARIZATION = "notarization"
    CUSTOMS_EXEMPTION = "customs_exemption"
    CUSTOMS_CLEARANCE = "customs_clearance"
    BANKING_SERVICES = "banking_services"


class Priority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"


class AssetCategory(str, Enum):
    MACHINERY = "machinery"
    VEHICLE = "vehicle"
    INFRASTRUCTURE = "infrastructure"
    IT_EQUIPMENT = "it-equipment"
    FURNITURE = "furniture"
    TOOL = "tool"
    SAFETY_EQUIPMENT = "safety-equipment"
    UTILITY = "utility"
    OTHER = "other"


class AssetCondition(str, Enum):
    EXCELLENT = "excellent"
    GOOD = "good"
    FAIR = "fair"
    POOR = "poor"


class RiskLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class IndustrySector(str, Enum):
    TEXTILE = "textile"
    LEATHER = "leather"
    AGRO_PROCESSING = "agro_processing"
    PHARMACEUTICAL = "pharmaceutical"
    FOOD_PROCESSING = "food_processing"
    BEVERAGE = "beverage"
    METAL_ENGINEERING = "metal_engineering"
    CHEMICAL = "chemical"
    ELECTRONICS = "electronics"
    OTHER = "other"


# ==================== MODEL 1: SERVICE CLASSIFIER ====================

class ServiceClassificationRequest(BaseModel):
    title: str = Field(..., min_length=5, max_length=500, description="Service request title")
    description: str = Field(..., min_length=10, max_length=5000, description="Detailed description")
    created_at: Optional[datetime] = Field(default_factory=datetime.now, description="Request creation timestamp")

    class Config:
        json_schema_extra = {
            "example": {
                "title": "Investment Permit Application",
                "description": "Textile manufacturing company seeking investment permit for Hawassa Industrial Park",
                "created_at": "2026-01-11T10:30:00Z"
            }
        }


class ServiceClassificationResponse(BaseModel):
    success: bool = True
    data: Dict[str, Any]
    metadata: Dict[str, Any]

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "service_type": "investment_permit",
                    "service_type_display": "Investment Permit",
                    "priority": "normal",
                    "estimated_processing_days": 15,
                    "confidence_score": 0.95,
                    "recommendations": [
                        "Prepare company registration documents",
                        "Submit environmental impact assessment"
                    ]
                },
                "metadata": {
                    "model_version": "1.0",
                    "processing_time_ms": 45,
                    "timestamp": "2026-01-11T10:30:01Z"
                }
            }
        }


# ==================== MODEL 2: PREDICTIVE MAINTENANCE ====================

class MaintenancePredictionRequest(BaseModel):
    asset_id: str = Field(..., description="Unique asset identifier")
    asset_name: str = Field(..., description="Asset name/description")
    category: AssetCategory
    age_days: int = Field(..., ge=0, description="Asset age in days")
    purchase_cost: float = Field(..., gt=0, description="Purchase cost in ETB")
    current_value: float = Field(..., gt=0, description="Current value in ETB")
    condition: AssetCondition
    last_maintenance_date: str = Field(..., description="Last maintenance date (YYYY-MM-DD)")
    maintenance_count: int = Field(..., ge=0, description="Total maintenance count")
    maintenance_interval_days: int = Field(..., gt=0, description="Expected maintenance interval")

    class Config:
        json_schema_extra = {
            "example": {
                "asset_id": "MAC-HWS-001",
                "asset_name": "CNC Milling Machine",
                "category": "machinery",
                "age_days": 730,
                "purchase_cost": 50000,
                "current_value": 40000,
                "condition": "fair",
                "last_maintenance_date": "2025-09-15",
                "maintenance_count": 8,
                "maintenance_interval_days": 90
            }
        }


class MaintenancePredictionResponse(BaseModel):
    success: bool = True
    data: Dict[str, Any]
    metadata: Dict[str, Any]

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "data": {
                    "will_fail_soon": False,
                    "failure_probability": 0.15,
                    "days_until_failure": 90,
                    "risk_level": "medium",
                    "risk_color": "#f59e0b",
                    "recommended_action": "Schedule maintenance within 30 days",
                    "maintenance_priority": 3,
                    "estimated_cost": 5000,
                    "next_maintenance_date": "2026-02-10"
                },
                "metadata": {
                    "model_version": "1.0",
                    "processing_time_ms": 32,
                    "timestamp": "2026-01-11T10:30:01Z"
                }
            }
        }


# ==================== MODEL 3: PARK RECOMMENDATION ====================

class TenantProfile(BaseModel):
    company_name: str = Field(..., min_length=2, description="Company name")
    industry_sector: IndustrySector
    employees_count: int = Field(..., gt=0, description="Number of employees")
    investment_capital_usd: float = Field(..., gt=0, description="Investment capital in USD")
    production_capacity: str = Field(..., description="Production capacity description")
    export_percentage: int = Field(..., ge=0, le=100, description="Export percentage")
    required_land_hectares: float = Field(..., gt=0, description="Required land in hectares")
    power_requirement_mw: float = Field(..., gt=0, description="Power requirement in MW")
    water_requirement_m3_day: float = Field(..., gt=0, description="Water requirement m³/day")
    preferred_region: Optional[str] = Field(None, description="Preferred region/city")
    rent_budget_etb_month: float = Field(..., gt=0, description="Monthly rent budget in ETB")
    lease_duration_years: int = Field(..., gt=0, le=99, description="Desired lease duration in years")
    timeline_urgency: str = Field(default="medium", description="Timeline urgency: low, medium, high")

    class Config:
        json_schema_extra = {
            "example": {
                "company_name": "Sunshine Textiles PLC",
                "industry_sector": "textile",
                "employees_count": 500,
                "investment_capital_usd": 5000000,
                "production_capacity": "10000 units/month",
                "export_percentage": 60,
                "required_land_hectares": 5,
                "power_requirement_mw": 2.5,
                "water_requirement_m3_day": 500,
                "preferred_region": "hawassa",
                "rent_budget_etb_month": 500000,
                "lease_duration_years": 10,
                "timeline_urgency": "medium"
            }
        }


class ParkRecommendationRequest(BaseModel):
    tenant_profile: TenantProfile


class ParkRecommendation(BaseModel):
    park_id: str
    park_name: str
    match_score: int
    match_grade: str
    location: Dict[str, Any]
    pros: List[str]
    cons: List[str]
    costs: Dict[str, float]
    infrastructure: Dict[str, str]
    oss_services: List[str]


class ParkRecommendationResponse(BaseModel):
    success: bool = True
    data: Dict[str, Any]
    metadata: Dict[str, Any]


# ==================== ERROR RESPONSES ====================

class ErrorResponse(BaseModel):
    success: bool = False
    error: str
    details: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.now)

    class Config:
        json_schema_extra = {
            "example": {
                "success": False,
                "error": "Validation Error",
                "details": "Title must be at least 5 characters long",
                "timestamp": "2026-01-11T10:30:01Z"
            }
        }


# ==================== HEALTH CHECK ====================

class HealthCheckResponse(BaseModel):
    status: str = "healthy"
    version: str = "1.0.0"
    models_loaded: Dict[str, bool]
    timestamp: datetime = Field(default_factory=datetime.now)
