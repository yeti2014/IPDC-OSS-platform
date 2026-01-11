/**
 * AI API Client Service
 * Connects React frontend to FastAPI AI models
 *
 * Available Models:
 * - Model 1: Service Classification
 * - Model 2: Predictive Maintenance
 * - Model 3: Park Recommendation
 */

const AI_API_BASE_URL = 'http://localhost:8000/api/v1';

// ==================== TYPE DEFINITIONS ====================

export interface ServiceClassificationRequest {
  title: string;
  description: string;
  created_at?: string;
}

export interface ServiceClassificationResponse {
  success: boolean;
  data: {
    service_type: string;
    service_type_display: string;
    priority: string;
    estimated_processing_days: number;
    confidence_score: number;
    recommendations: string[];
  };
  metadata: {
    model_version: string;
    processing_time_ms: number;
    timestamp: string;
  };
}

export interface MaintenancePredictionRequest {
  asset_id: string;
  asset_name: string;
  category: 'machinery' | 'vehicle' | 'infrastructure' | 'it-equipment' | 'furniture' | 'tool' | 'safety-equipment' | 'utility' | 'other';
  age_days: number;
  purchase_cost: number;
  current_value: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  last_maintenance_date: string; // YYYY-MM-DD
  maintenance_count: number;
  maintenance_interval_days: number;
}

export interface MaintenancePredictionResponse {
  success: boolean;
  data: {
    will_fail_soon: boolean;
    failure_probability: number;
    days_until_failure: number;
    risk_level: 'low' | 'medium' | 'high';
    risk_color: string;
    recommended_action: string;
    maintenance_priority: number;
    urgency: string;
    estimated_cost: number;
    next_maintenance_date: string;
    asset_details: {
      age_years: number;
      days_since_last_maintenance: number;
      total_maintenance_count: number;
      condition: string;
    };
  };
  metadata: {
    model_version: string;
    processing_time_ms: number;
    timestamp: string;
  };
}

export interface TenantProfile {
  company_name: string;
  industry_sector: string;
  employees_count: number;
  investment_capital_usd: number;
  production_capacity: string;
  export_percentage: number;
  required_land_hectares: number;
  power_requirement_mw: number;
  water_requirement_m3_day: number;
  preferred_region: string;
  rent_budget_etb_month: number;
  lease_duration_years: number;
  timeline_urgency: 'low' | 'medium' | 'high';
}

export interface ParkRecommendation {
  park_id: string;
  park_name: string;
  park_name_amharic: string;
  match_score: number;
  match_grade: string;
  location: {
    region: string;
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  pros: string[];
  cons: string[];
  costs: {
    rent_etb_month: number;
    utilities_etb_month: number;
    total_estimated_etb_month: number;
  };
  infrastructure: {
    power_availability: string;
    water_availability: string;
    internet_connectivity: string;
    road_access: string;
  };
  oss_services: string[];
  port_distance_km?: number;
  airport_distance_km?: number;
}

export interface ParkRecommendationResponse {
  success: boolean;
  data: {
    recommendations: ParkRecommendation[];
    model_confidence: 'low' | 'medium' | 'high';
    reasoning: string;
    total_parks_analyzed: number;
  };
  metadata: {
    model_version: string;
    model_type?: string;
    processing_time_ms: number;
    timestamp: string;
  };
}

// ==================== API FUNCTIONS ====================

/**
 * Model 1: Classify Service Request
 * Uses AI to automatically classify and prioritize service requests
 */
export async function classifyService(
  request: ServiceClassificationRequest
): Promise<ServiceClassificationResponse> {
  try {
    const response = await fetch(`${AI_API_BASE_URL}/classify-service`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...request,
        created_at: request.created_at || new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to classify service');
    }

    return await response.json();
  } catch (error) {
    console.error('Service classification error:', error);
    throw error;
  }
}

/**
 * Model 2: Predict Asset Maintenance
 * Predicts asset failures and recommends maintenance actions
 */
export async function predictMaintenance(
  request: MaintenancePredictionRequest
): Promise<MaintenancePredictionResponse> {
  try {
    const response = await fetch(`${AI_API_BASE_URL}/predict-maintenance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to predict maintenance');
    }

    return await response.json();
  } catch (error) {
    console.error('Maintenance prediction error:', error);
    throw error;
  }
}

/**
 * Model 3: Recommend Industrial Parks
 * Matches tenant profile with suitable Ethiopian industrial parks
 */
export async function recommendParks(
  tenantProfile: TenantProfile
): Promise<ParkRecommendationResponse> {
  try {
    const response = await fetch(`${AI_API_BASE_URL}/recommend-parks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tenant_profile: tenantProfile }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to get park recommendations');
    }

    return await response.json();
  } catch (error) {
    console.error('Park recommendation error:', error);
    throw error;
  }
}

/**
 * Health check for AI API server
 */
export async function checkAIApiHealth(): Promise<boolean> {
  try {
    // Try to fetch from any endpoint to check if server is up
    const response = await fetch(`${AI_API_BASE_URL}/classify-service`, {
      method: 'OPTIONS',
    });
    return response.ok || response.status === 405; // 405 is also fine (method not allowed but server is up)
  } catch (error) {
    console.warn('AI API server is not responding:', error);
    return false;
  }
}

/**
 * Retry wrapper for API calls
 * Useful for handling temporary network issues
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export default {
  classifyService,
  predictMaintenance,
  recommendParks,
  checkAIApiHealth,
  withRetry,
};
