'use client';

import { track } from '@vercel/analytics';

/**
 * Tracks a vehicle view event
 * @param vehicleId The ID of the vehicle viewed
 */
export function trackVehicleView(vehicleId: string) {
    track('vehicle_view', { vehicleId });
}

/**
 * Tracks a vehicle share event
 * @param vehicleId The ID of the vehicle shared
 * @param platform The platform the vehicle was shared to (e.g., 'whatsapp', 'facebook')
 */
export function trackVehicleShare(vehicleId: string, platform: string) {
    track('vehicle_share', { vehicleId, platform });
}

/**
 * Tracks search performance metrics
 * @param duration Time taken for search in milliseconds
 * @param resultsCount Number of results returned
 */
export function trackSearchPerformance(duration: number, resultsCount: number) {
    track('search_performance', { duration, resultsCount });
}

/**
 * Tracks when a user filters the vehicle list
 * @param filterType The type of filter applied (e.g., 'brand', 'price')
 * @param value The value of the filter
 */
export function trackFilterUsage(filterType: string, value: string) {
    track('filter_usage', { filterType, value });
}
