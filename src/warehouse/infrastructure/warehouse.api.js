import axios from 'axios';

const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
});

const WAREHOUSES_ENDPOINT = import.meta.env.VITE_WAREHOUSES_ENDPOINT_PATH;

export class WarehouseApi {
    getWarehouses() {
        return http.get(WAREHOUSES_ENDPOINT);
    }

    getWarehouseById(id) {
        return http.get(`${WAREHOUSES_ENDPOINT}/${id}`);
    }

    createWarehouse(warehouseResource) {
        return http.post(WAREHOUSES_ENDPOINT, warehouseResource);
    }

    updateWarehouse(id, warehouseResource) {
        return http.put(`${WAREHOUSES_ENDPOINT}/${id}`, warehouseResource);
    }

    deleteWarehouse(id) {
        return http.delete(`${WAREHOUSES_ENDPOINT}/${id}`);
    }
}