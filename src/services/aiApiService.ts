/**
 * AI API Service
 * Client for IPDC-OSS FastAPI Backend
 * Connects to all 3 AI models
 */

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
    priority: 'urgent' | 'high' | 'normal' | 'low';
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
  last_maintenance_date: string;
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
    urgency: 'immediate' | 'soon' | 'scheduled' | 'routine';
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
  industry_sector: 'textile' | 'garment' | 'leather' | 'pharmaceutical' | 'food-processing' | 'beverage' | 'agro-processing' | 'automotive' | 'electronics' | 'other';
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
  timeline_urgency: 'immediate' | 'medium' | 'flexible';
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

export interface ParkRecommendationRequest {
  tenant_profile: TenantProfile;
}

export interface ParkRecommendationResponse {
  success: boolean;
  data: {
    recommendations: ParkRecommendation[];
    model_confidence: 'high' | 'medium' | 'low';
    reasoning: string;
    total_parks_analyzed: number;
  };
  metadata: {
    model_version: string;
    model_type: string;
    processing_time_ms: number;
    timestamp: string;
  };
}

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  models_loaded: {
    model1_service_classifier: boolean;
    model2_predictive_maintenance: boolean;
    model3_park_recommendation: boolean;
  };
  timestamp: string;
}

// ==================== API CONFIGURATION ====================

const API_BASE_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:8000';
const API_VERSION = 'v1';

// ==================== API CLIENT CLASS ====================

class AIApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Generic fetch wrapper with error handling
   */
  private async fetchAPI<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          error: 'Unknown error occurred',
        }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ==================== HEALTH CHECK ====================

  /**
   * Check API health and model status
   */
  async healthCheck(): Promise<HealthCheckResponse> {
    return this.fetchAPI<HealthCheckResponse>('/api/health', {
      method: 'GET',
    });
  }

  // ==================== MODEL 1: SERVICE CLASSIFICATION ====================

  /**
   * Classify service request and get recommendations
   */
  async classifyService(
    request: ServiceClassificationRequest
  ): Promise<ServiceClassificationResponse> {
    const payload = {
      ...request,
      created_at: request.created_at || new Date().toISOString(),
    };

    return this.fetchAPI<ServiceClassificationResponse>(
      `/api/${API_VERSION}/classify-service`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  }

  // ==================== MODEL 2: PREDICTIVE MAINTENANCE ====================

  /**
   * Predict maintenance needs for an asset
   */
  async predictMaintenance(
    request: MaintenancePredictionRequest
  ): Promise<MaintenancePredictionResponse> {
    return this.fetchAPI<MaintenancePredictionResponse>(
      `/api/${API_VERSION}/predict-maintenance`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }

  // ==================== MODEL 3: PARK RECOMMENDATION ====================

  /**
   * Get industrial park recommendations
   */
  async recommendParks(
    request: ParkRecommendationRequest
  ): Promise<ParkRecommendationResponse> {
    return this.fetchAPI<ParkRecommendationResponse>(
      `/api/${API_VERSION}/recommend-parks`,
      {
        method: 'POST',
        body: JSON.stringify(request),
      }
    );
  }
}

// ==================== SINGLETON INSTANCE ====================

export const aiApiClient = new AIApiClient();

// ==================== CONVENIENCE EXPORTS ====================

export default {
  healthCheck: () => aiApiClient.healthCheck(),
  classifyService: (request: ServiceClassificationRequest) =>
    aiApiClient.classifyService(request),
  predictMaintenance: (request: MaintenancePredictionRequest) =>
    aiApiClient.predictMaintenance(request),
  recommendParks: (request: ParkRecommendationRequest) =>
    aiApiClient.recommendParks(request),
};
