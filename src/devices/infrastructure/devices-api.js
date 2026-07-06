/**
 * @file devices-api.js
 * @description HTTP client for the Watchgate Locksight SensorIntegration
 * endpoints (SensorsController).
 */
import { http } from '../../shared/infrastructure/http.api.js';

const SENSORS_ENDPOINT = import.meta.env.VITE_SENSORS_ENDPOINT_PATH || '/sensors';
const SECURITY_ALERTS_ENDPOINT = import.meta.env.VITE_SECURITY_ALERTS_ENDPOINT_PATH || '/security-alerts';

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

    async unlink(sensorId) {
        const response = await http.patch(`${SENSORS_ENDPOINT}/${sensorId}/unlink`);
        return response.data;
    }

    async createSecurityAlert(resource) {
        const response = await http.post(SECURITY_ALERTS_ENDPOINT, resource);
        return response.data;
    }
}
