import axios from 'axios';

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
});

const WAREHOUSES_ENDPOINT = import.meta.env.VITE_WAREHOUSES_ENDPOINT_PATH;

/**
 * Warehouse API Service
 * @class WarehouseApi
 * @description
 * Warehouse API service is used to communicate with the warehouse tracking endpoints.
 */
export class WarehouseApi {
    /**
     * Get all warehouses
     * @returns {Promise}
     */
    getWarehouses() {
        return http.get(WAREHOUSES_ENDPOINT);
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
     * Create a new warehouse
     * @param {object} warehouseResource
     * @returns {Promise}
     */
    createWarehouse(warehouseResource) {
        return http.post(WAREHOUSES_ENDPOINT, warehouseResource);
    }

    /**
     * Update an existing warehouse
     * @param {number|string} id
     * @param {object} warehouseResource
     * @returns {Promise}
     */
    updateWarehouse(id, warehouseResource) {
        return http.put(`${WAREHOUSES_ENDPOINT}/${id}`, warehouseResource);
    }

    /**
     * Delete a warehouse
     * @param {number|string} id
     * @returns {Promise}
     */
    deleteWarehouse(id) {
        return http.delete(`${WAREHOUSES_ENDPOINT}/${id}`);
    }
    /**
     * Get warehouses by Company ID
     * @param {number|string} companyId
     * @returns {Promise}
     */
    getWarehousesByCompanyId(companyId) {
        return http.get(`${WAREHOUSES_ENDPOINT}/company/${companyId}`);
    }
    /**
     * Update operating hours of a warehouse
     * @param {number|string} id
     * @param {object} hoursResource
     * @returns {Promise}
     */
    updateOperatingHours(id, hoursResource) {
        return http.put(`${WAREHOUSES_ENDPOINT}/${id}/operating-hours`, hoursResource);
    }
}