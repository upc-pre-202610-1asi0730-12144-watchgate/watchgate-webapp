/**
 * @file devices-api.js
 * @description HTTP client for the Watchgate Locksight SensorIntegration
 * endpoints (SensorsController).
 */
import { http } from '../../shared/infrastructure/http.api.js';

const SENSORS_ENDPOINT = '/sensors';

export class DevicesApi {
    /**
     * Get all sensors belonging to a company.
     * @param {number|string} companyId
     * @returns {Promise<object[]>}
     */
    async getAllByCompanyId(companyId) {
        const response = await http.get(`${SENSORS_ENDPOINT}/company/${companyId}`);
        return response.data;
    }

    /**
     * Create a new sensor. resource must match CreateSensorResource:
     * { name, type, unit, zoneId, companyId }
     * @param {object} resource
     * @returns {Promise<object>}
     */
    async create(resource) {
        const response = await http.post(SENSORS_ENDPOINT, resource);
        return response.data;
    }
}
