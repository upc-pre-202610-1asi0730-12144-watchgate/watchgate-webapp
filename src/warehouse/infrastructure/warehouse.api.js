import axios from 'axios';

const http = axios.create({
    baseURL: 'http://localhost:3000'
});

export class WarehouseApi {
    getWarehouses() {
        return http.get('/warehouses');
    }

    getWarehouseById(id) {
        return http.get(`/warehouses/${id}`);
    }

    createWarehouse(warehouseResource) {
        return http.post('/warehouses', warehouseResource);
    }

    updateWarehouse(id, warehouseResource) {
        return http.put(`/warehouses/${id}`, warehouseResource);
    }

    deleteWarehouse(id) {
        return http.delete(`/warehouses/${id}`);
    }
}