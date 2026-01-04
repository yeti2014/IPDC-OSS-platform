// src/services/searchService.ts
import { ServiceRequest, User } from '../types';
import { IndustrialPark } from '../types/industrialPark';
import { Announcement } from '../types';

/**
 * Advanced Search Service with Full-Text Search
 * Supports fuzzy matching, weighted scoring, and multi-field search
 */

export interface SearchResult<T> {
  item: T;
  score: number;
  matchedFields: string[];
  highlights: Record<string, string>;
}

export interface SearchOptions {
  fuzzyMatch?: boolean;
  caseSensitive?: boolean;
  wholeWord?: boolean;
  fields?: string[];
  minScore?: number;
}

class SearchService {
  /**
   * Search service requests
   */
  searchRequests(
    requests: ServiceRequest[],
    searchTerm: string,
    options: SearchOptions = {}
  ): SearchResult<ServiceRequest>[] {
    if (!searchTerm.trim()) return [];

    const {
      fuzzyMatch = true,
      caseSensitive = false,
      minScore = 0.3,
      fields = ['title', 'description', 'tenantName', 'location', 'serviceType', 'notes']
    } = options;

    const results: SearchResult<ServiceRequest>[] = [];

    for (const request of requests) {
      const searchResult = this.searchInObject(request, searchTerm, fields, {
        fuzzyMatch,
        caseSensitive
      });

      if (searchResult.score >= minScore) {
        results.push({
          item: request,
          score: searchResult.score,
          matchedFields: searchResult.matchedFields,
          highlights: searchResult.highlights
        });
      }
    }

    // Sort by score descending
    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Search industrial parks
   */
  searchParks(
    parks: IndustrialPark[],
    searchTerm: string,
    options: SearchOptions = {}
  ): SearchResult<IndustrialPark>[] {
    if (!searchTerm.trim()) return [];

    const {
      fuzzyMatch = true,
      caseSensitive = false,
      minScore = 0.3,
      fields = [
        'name',
        'description',
        'location.city',
        'location.region',
        'primaryIndustries',
        'secondaryIndustries',
        'availableServices'
      ]
    } = options;

    const results: SearchResult<IndustrialPark>[] = [];

    for (const park of parks) {
      const searchResult = this.searchInObject(park, searchTerm, fields, {
        fuzzyMatch,
        caseSensitive
      });

      if (searchResult.score >= minScore) {
        results.push({
          item: park,
          score: searchResult.score,
          matchedFields: searchResult.matchedFields,
          highlights: searchResult.highlights
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Generic search in any object
   */
  private searchInObject(
    obj: any,
    searchTerm: string,
    fields: string[],
    options: { fuzzyMatch: boolean; caseSensitive: boolean }
  ): { score: number; matchedFields: string[]; highlights: Record<string, string> } {
    let totalScore = 0;
    const matchedFields: string[] = [];
    const highlights: Record<string, string> = {};

    for (const field of fields) {
      const value = this.getNestedValue(obj, field);
      if (value === undefined || value === null) continue;

      const valueStr = Array.isArray(value) ? value.join(' ') : String(value);
      const score = this.calculateMatchScore(valueStr, searchTerm, options);

      if (score > 0) {
        totalScore += score;
        matchedFields.push(field);
        highlights[field] = this.highlightMatch(valueStr, searchTerm, options);
      }
    }

    // Normalize score by number of fields searched
    const normalizedScore = matchedFields.length > 0 ? totalScore / fields.length : 0;

    return {
      score: Math.min(normalizedScore, 1), // Cap at 1
      matchedFields,
      highlights
    };
  }

  /**
   * Calculate match score between value and search term
   */
  private calculateMatchScore(
    value: string,
    searchTerm: string,
    options: { fuzzyMatch: boolean; caseSensitive: boolean }
  ): number {
    const { fuzzyMatch, caseSensitive } = options;

    let val = caseSensitive ? value : value.toLowerCase();
    let term = caseSensitive ? searchTerm : searchTerm.toLowerCase();

    // Exact match = highest score
    if (val.includes(term)) {
      const ratio = term.length / val.length;
      return 1.0 * ratio; // Weight by how much of the value is the search term
    }

    // Fuzzy match
    if (fuzzyMatch) {
      const similarity = this.fuzzyMatch(val, term);
      return similarity > 0.6 ? similarity * 0.8 : 0; // Fuzzy matches get 80% weight
    }

    return 0;
  }

  /**
   * Fuzzy matching using Levenshtein distance
   */
  private fuzzyMatch(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;

    if (longer.length === 0) return 1.0;

    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1 // deletion
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  /**
   * Highlight matched text
   */
  private highlightMatch(
    value: string,
    searchTerm: string,
    options: { fuzzyMatch: boolean; caseSensitive: boolean }
  ): string {
    const { caseSensitive } = options;

    if (!caseSensitive) {
      const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'gi');
      return value.replace(regex, '<mark>$1</mark>');
    } else {
      const regex = new RegExp(`(${this.escapeRegex(searchTerm)})`, 'g');
      return value.replace(regex, '<mark>$1</mark>');
    }
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Escape special regex characters
   */
  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Advanced filter with multiple criteria
   */
  advancedFilter<T>(
    items: T[],
    filters: Record<string, any>,
    operators: Record<string, 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in'> = {}
  ): T[] {
    return items.filter(item => {
      for (const [field, value] of Object.entries(filters)) {
        if (value === undefined || value === null || value === '' || value === 'all') {
          continue; // Skip empty filters
        }

        const itemValue = this.getNestedValue(item, field);
        const operator = operators[field] || 'equals';

        switch (operator) {
          case 'equals':
            if (itemValue !== value) return false;
            break;
          case 'contains':
            if (!String(itemValue).toLowerCase().includes(String(value).toLowerCase())) {
              return false;
            }
            break;
          case 'gt':
            if (!(itemValue > value)) return false;
            break;
          case 'lt':
            if (!(itemValue < value)) return false;
            break;
          case 'gte':
            if (!(itemValue >= value)) return false;
            break;
          case 'lte':
            if (!(itemValue <= value)) return false;
            break;
          case 'in':
            if (!Array.isArray(value) || !value.includes(itemValue)) {
              return false;
            }
            break;
        }
      }

      return true;
    });
  }

  /**
   * Sort items by field
   */
  sortItems<T>(
    items: T[],
    sortBy: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): T[] {
    return [...items].sort((a, b) => {
      const aValue = this.getNestedValue(a, sortBy);
      const bValue = this.getNestedValue(b, sortBy);

      if (aValue === bValue) return 0;

      const comparison = aValue < bValue ? -1 : 1;
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }

  /**
   * Paginate results
   */
  paginate<T>(items: T[], page: number, pageSize: number): {
    items: T[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
  } {
    const totalPages = Math.ceil(items.length / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;

    return {
      items: items.slice(start, end),
      totalPages,
      currentPage: page,
      totalItems: items.length
    };
  }
}

export const searchService = new SearchService();
export default searchService;
