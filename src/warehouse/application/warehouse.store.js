import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { WarehouseApi } from "../infrastructure/warehouse.api.js";
import { WarehouseAssembler } from "../infrastructure/warehouse.assembler.js";

const warehouseApi = new WarehouseApi();

export const useWarehouseStore = defineStore('warehouse', () => {
    const warehouses = ref([]);
    const errors = ref([]);
    const warehousesLoaded = ref(false);

    const warehousesCount = computed(() => {
        return warehousesLoaded.value ? warehouses.value.length : 0;
    });

    function fetchWarehouses() {
        warehouseApi.getWarehouses().then(response => {
            warehouses.value = WarehouseAssembler.toEntitiesFromResponse(response);
            warehousesLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    function getWarehouseById(id) {
        let idNum = parseInt(id);
        return warehouses.value.find(warehouse => warehouse.id === idNum);
    }

    function addWarehouse(warehouse) {
        warehouseApi.createWarehouse(warehouse).then(response => {
            const resource = response.data;
            const newWarehouse = WarehouseAssembler.toEntityFromResource(resource);
            warehouses.value.push(newWarehouse);
        }).catch(error => {
            errors.value.push(error);
        });
    }

    return {
        warehouses,
        errors,
        warehousesLoaded,
        warehousesCount,
        fetchWarehouses,
        getWarehouseById,
        addWarehouse
    };
});