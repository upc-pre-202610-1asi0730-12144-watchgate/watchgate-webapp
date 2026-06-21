import { http } from '../../shared/infrastructure/http.api.js';

const WAREHOUSES_ENDPOINT = import.meta.env.VITE_WAREHOUSES_ENDPOINT_PATH;

/**
 * Warehouse API Service
 * @class WarehouseApi
 * @description
 * Warehouse API service is used to communicate with the Watchgate Locksight
 * WarehouseManagement endpoints (WarehousesController).
 */
export class WarehouseApi {
    /**
     * Get all warehouses belonging to a company
     * @param {number|string} companyId
     * @returns {Promise}
     */
    getWarehousesByCompanyId(companyId) {
        return http.get(`${WAREHOUSES_ENDPOINT}/company/${companyId}`);
    }

    /**
     * Get warehouse by ID
     * @param {number|string} id
     * @returns {Promise}
     */
    getWarehouseById(id) {
        return http.get(`${WAREHOUSES_ENDPOINT}/${id}`);
    }

    /**
     * Create a new warehouse. resource must match CreateWarehouseResource:
     * { name, location, capacity, companyId, operationStart, operationEnd }
     * @param {object} warehouseResource
     * @returns {Promise}
     */
    createWarehouse(warehouseResource) {
        return http.post(WAREHOUSES_ENDPOINT, warehouseResource);
    }

    /**
     * Update an existing warehouse. resource must match UpdateWarehouseResource:
     * { name, location, capacity, operationStart, operationEnd }
     * @param {number|string} id
     * @param {object} warehouseResource
     * @returns {Promise}
     */
    updateWarehouse(id, warehouseResource) {
        return http.put(`${WAREHOUSES_ENDPOINT}/${id}`, warehouseResource);
    }

    /**
     * Create a new zone within a warehouse. resource must match
     * CreateWarehouseZoneResource: { name, area, riskLevel }
     * @param {number|string} warehouseId
     * @param {object} zoneResource
     * @returns {Promise}
     */
    createZone(warehouseId, zoneResource) {
        return http.post(`${WAREHOUSES_ENDPOINT}/${warehouseId}/zones`, zoneResource);
    }
}