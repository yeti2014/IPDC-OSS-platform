// src/services/parkMatchingService.ts
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../config/firebase';
import {
  IndustrialPark,
  TenantProfile,
  ParkRecommendation,
  IndustryType
} from '../types/industrialPark';

/**
 * Intelligent Rule-Based SEZ (Special Economic Zone) Matcher
 *
 * This matcher uses a weighted scoring system to recommend the best industrial parks
 * for a given tenant profile. It considers multiple factors:
 *
 * 1. Industry Alignment (30%)
 * 2. Capacity & Availability (25%)
 * 3. Infrastructure Match (20%)
 * 4. Cost Efficiency (15%)
 * 5. Location Preferences (10%)
 */

class ParkMatchingService {
  // Weight distribution (must sum to 100)
  private readonly WEIGHTS = {
    INDUSTRY_ALIGNMENT: 30,
    CAPACITY_AVAILABILITY: 25,
    INFRASTRUCTURE: 20,
    COST_EFFICIENCY: 15,
    LOCATION: 10
  };

  /**
   * Get personalized park recommendations for a tenant
   */
  async getRecommendations(
    tenantProfile: TenantProfile,
    limit: number = 3
  ): Promise<ParkRecommendation[]> {
    try {
      // Fetch all active parks
      const parks = await this.fetchActiveParks();

      // Calculate match scores for each park
      const recommendations = parks
        .map(park => this.calculateMatchScore(park, tenantProfile))
        .filter(rec => rec.matchScore > 30) // Filter out poor matches
        .sort((a, b) => b.matchScore - a.matchScore) // Sort by score descending
        .slice(0, limit); // Limit results

      return recommendations;
    } catch (error) {
      console.error('Error getting park recommendations:', error);
      throw error;
    }
  }

  /**
   * Calculate comprehensive match score for a park
   */
  private calculateMatchScore(
    park: IndustrialPark,
    profile: TenantProfile
  ): ParkRecommendation {
    const scores = {
      industry: this.scoreIndustryAlignment(park, profile),
      capacity: this.scoreCapacityAvailability(park, profile),
      infrastructure: this.scoreInfrastructure(park, profile),
      cost: this.scoreCostEfficiency(park, profile),
      location: this.scoreLocation(park, profile)
    };

    // Calculate weighted total score
    const matchScore = Math.round(
      (scores.industry * this.WEIGHTS.INDUSTRY_ALIGNMENT +
        scores.capacity * this.WEIGHTS.CAPACITY_AVAILABILITY +
        scores.infrastructure * this.WEIGHTS.INFRASTRUCTURE +
        scores.cost * this.WEIGHTS.COST_EFFICIENCY +
        scores.location * this.WEIGHTS.LOCATION) / 100
    );

    // Generate reasons, pros, and cons
    const { reasons, pros, cons } = this.generateInsights(park, profile, scores);

    // Estimate monthly cost
    const estimatedMonthlyCost = this.calculateEstimatedCost(park, profile);

    return {
      park,
      matchScore,
      reasons,
      pros,
      cons,
      estimatedMonthlyCost
    };
  }

  /**
   * Score 1: Industry Alignment (30%)
   */
  private scoreIndustryAlignment(park: IndustrialPark, profile: TenantProfile): number {
    let score = 0;

    // Perfect match with primary industries
    if (park.primaryIndustries.includes(profile.industryType)) {
      score = 100;
    }
    // Good match with secondary industries
    else if (park.secondaryIndustries.includes(profile.industryType)) {
      score = 70;
    }
    // Related industries (similar industry clusters)
    else if (this.hasRelatedIndustry(park, profile.industryType)) {
      score = 50;
    }
    // No alignment
    else {
      score = 20;
    }

    return score;
  }

  /**
   * Score 2: Capacity & Availability (25%)
   */
  private scoreCapacityAvailability(park: IndustrialPark, profile: TenantProfile): number {
    let score = 0;

    // Check if park is accepting tenants
    if (!park.acceptingTenants) return 0;

    // Available space score (40% of capacity score)
    const availableAreaSqm = park.availableArea * 10000; // Convert hectares to sqm
    const areaScore = availableAreaSqm >= profile.requiredArea ? 100 : (availableAreaSqm / profile.requiredArea) * 100;
    score += areaScore * 0.4;

    // Employee capacity score (30% of capacity score)
    const employeeCapacity = park.maxEmployees - park.currentEmployees;
    const employeeScore = employeeCapacity >= profile.employeeCount ? 100 : (employeeCapacity / profile.employeeCount) * 100;
    score += employeeScore * 0.3;

    // Occupancy rate score (30% of capacity score) - prefer not too crowded
    const idealOccupancy = 70; // 70% is ideal
    const occupancyDiff = Math.abs(park.occupancyRate - idealOccupancy);
    const occupancyScore = Math.max(0, 100 - occupancyDiff * 2);
    score += occupancyScore * 0.3;

    return Math.min(100, score);
  }

  /**
   * Score 3: Infrastructure Match (20%)
   */
  private scoreInfrastructure(park: IndustrialPark, profile: TenantProfile): number {
    let score = 0;
    let totalChecks = 0;

    // Power infrastructure
    const powerInfra = park.infrastructure.find(i => i.type === 'power');
    if (powerInfra && profile.powerRequirement) {
      totalChecks++;
      if (powerInfra.available >= profile.powerRequirement) {
        score += powerInfra.quality === 'excellent' ? 100 : powerInfra.quality === 'good' ? 80 : 60;
      } else {
        score += 30; // Insufficient power
      }
    }

    // Water infrastructure
    const waterInfra = park.infrastructure.find(i => i.type === 'water');
    if (waterInfra && profile.waterRequirement) {
      totalChecks++;
      if (waterInfra.available >= profile.waterRequirement) {
        score += waterInfra.quality === 'excellent' ? 100 : waterInfra.quality === 'good' ? 80 : 60;
      } else {
        score += 30; // Insufficient water
      }
    }

    // Other critical infrastructure
    const criticalInfra = ['waste-treatment', 'telecommunications', 'roads'];
    criticalInfra.forEach(infraType => {
      const infra = park.infrastructure.find(i => i.type === infraType);
      if (infra) {
        totalChecks++;
        score += infra.quality === 'excellent' ? 100 : infra.quality === 'good' ? 80 : infra.quality === 'average' ? 60 : 40;
      }
    });

    return totalChecks > 0 ? score / totalChecks : 50; // Default to 50 if no infrastructure info
  }

  /**
   * Score 4: Cost Efficiency (15%)
   */
  private scoreCostEfficiency(park: IndustrialPark, profile: TenantProfile): number {
    const monthlyCost = this.calculateEstimatedCost(park, profile);
    const { min, max } = profile.budgetRange;

    // Perfect fit within budget
    if (monthlyCost >= min && monthlyCost <= max) {
      return 100;
    }
    // Slightly above budget
    else if (monthlyCost <= max * 1.2) {
      return 70;
    }
    // Below minimum budget (might indicate quality concerns)
    else if (monthlyCost < min) {
      return 60;
    }
    // Significantly over budget
    else {
      return Math.max(0, 100 - ((monthlyCost - max) / max) * 100);
    }
  }

  /**
   * Score 5: Location Preferences (10%)
   */
  private scoreLocation(park: IndustrialPark, profile: TenantProfile): number {
    let score = 70; // Default neutral score

    if (!profile.preferredLocation) return score;

    // Region preference
    if (profile.preferredLocation.region) {
      score += park.location.region === profile.preferredLocation.region ? 30 : -20;
    }

    // Port proximity (important for export-oriented businesses)
    if (profile.preferredLocation.nearPort && park.nearbyFacilities.port) {
      const portDistance = park.nearbyFacilities.port.distance;
      if (portDistance < 50) score += 30;
      else if (portDistance < 100) score += 15;
    }

    // Airport proximity
    if (profile.preferredLocation.nearAirport && park.nearbyFacilities.airport) {
      const airportDistance = park.nearbyFacilities.airport.distance;
      if (airportDistance < 30) score += 20;
      else if (airportDistance < 60) score += 10;
    }

    return Math.min(100, Math.max(0, score));
  }

  /**
   * Check if park has related industries
   */
  private hasRelatedIndustry(park: IndustrialPark, industryType: IndustryType): boolean {
    const relatedIndustries: Record<IndustryType, IndustryType[]> = {
      'textile': ['leather', 'agro-processing'],
      'leather': ['textile'],
      'pharmaceutical': ['food-processing'],
      'automotive': ['metal-manufacturing', 'electronics'],
      'electronics': ['automotive'],
      'food-processing': ['agro-processing', 'pharmaceutical'],
      'metal-manufacturing': ['automotive'],
      'agro-processing': ['food-processing', 'textile'],
      'other': []
    };

    const related = relatedIndustries[industryType] || [];
    return park.primaryIndustries.some(ind => related.includes(ind)) ||
      park.secondaryIndustries.some(ind => related.includes(ind));
  }

  /**
   * Calculate estimated monthly cost
   */
  private calculateEstimatedCost(park: IndustrialPark, profile: TenantProfile): number {
    // Rent cost
    const rentCost = park.rentPerSqm * profile.requiredArea;

    // Utility estimates
    const electricityCost = (profile.powerRequirement || 100) * 720 * park.utilityRates.electricity; // 720 hours/month
    const waterCost = (profile.waterRequirement || 50) * 30 * park.utilityRates.water; // 30 days/month
    const internetCost = park.utilityRates.internet;

    return Math.round(rentCost + electricityCost + waterCost + internetCost);
  }

  /**
   * Generate human-readable insights
   */
  private generateInsights(
    park: IndustrialPark,
    profile: TenantProfile,
    scores: any
  ): { reasons: string[]; pros: string[]; cons: string[] } {
    const reasons: string[] = [];
    const pros: string[] = [];
    const cons: string[] = [];

    // Industry alignment insights
    if (park.primaryIndustries.includes(profile.industryType)) {
      reasons.push(`Specializes in ${profile.industryType} industry`);
      pros.push('Perfect industry match with existing ecosystem');
    } else if (park.secondaryIndustries.includes(profile.industryType)) {
      reasons.push(`Supports ${profile.industryType} as secondary industry`);
      pros.push('Good industry alignment');
    }

    // Capacity insights
    if (scores.capacity > 80) {
      pros.push('Ample space and capacity available');
    } else if (scores.capacity < 50) {
      cons.push('Limited capacity - may be crowded');
    }

    // Infrastructure insights
    if (scores.infrastructure > 85) {
      pros.push('Excellent infrastructure quality');
      reasons.push('Top-tier infrastructure and utilities');
    } else if (scores.infrastructure < 60) {
      cons.push('Infrastructure may need upgrading');
    }

    // Cost insights
    if (scores.cost > 80) {
      pros.push('Within your budget range');
    } else if (scores.cost < 50) {
      cons.push('Above your preferred budget');
    }

    // Location insights
    if (park.nearbyFacilities.port && park.nearbyFacilities.port.distance < 50) {
      pros.push(`Close to ${park.nearbyFacilities.port.name} (${park.nearbyFacilities.port.distance}km)`);
      reasons.push('Strategic location for exports');
    }

    if (park.nearbyFacilities.airport) {
      pros.push(`${park.nearbyFacilities.airport.distance}km from ${park.nearbyFacilities.airport.name}`);
    }

    // Incentives
    if (park.incentives.taxHoliday > 0) {
      pros.push(`${park.incentives.taxHoliday}-year tax holiday`);
      reasons.push('Attractive tax incentives available');
    }

    if (park.incentives.customsDutyExemption) {
      pros.push('Customs duty exemption for imports');
    }

    // Occupancy
    if (park.occupancyRate > 90) {
      pros.push('High occupancy - thriving ecosystem');
      cons.push('Limited expansion space');
    } else if (park.occupancyRate < 50) {
      cons.push('Low occupancy - developing ecosystem');
      pros.push('Plenty of room for expansion');
    }

    // Quality indicators
    if (park.statistics.satisfactionRating >= 4.0) {
      pros.push(`High tenant satisfaction (${park.statistics.satisfactionRating}/5.0)`);
    }

    if (park.statistics.averageResponseTime < 24) {
      pros.push('Fast service response time');
    }

    return { reasons, pros, cons };
  }

  /**
   * Fetch all active parks from Firestore
   */
  private async fetchActiveParks(): Promise<IndustrialPark[]> {
    try {
      const q = query(
        collection(db, 'industrialParks'),
        where('isActive', '==', true)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        } as IndustrialPark;
      });
    } catch (error) {
      console.error('Error fetching parks:', error);
      throw error;
    }
  }

  /**
   * Get detailed park information
   */
  async getParkById(parkId: string): Promise<IndustrialPark | null> {
    try {
      const parks = await this.fetchActiveParks();
      return parks.find(p => p.id === parkId) || null;
    } catch (error) {
      console.error('Error fetching park:', error);
      return null;
    }
  }
}

export const parkMatchingService = new ParkMatchingService();
export default parkMatchingService;
