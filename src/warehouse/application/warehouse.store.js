import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { WarehouseApi } from "../infrastructure/warehouse.api.js";
import { WarehouseAssembler } from "../infrastructure/warehouse.assembler.js";

const warehouseApi = new WarehouseApi();

/**
 * Warehouse store
 * @summary
 * This store is used to manage the state of the warehouses in the tracking context.
 */
export const useWarehouseStore = defineStore('warehouse', () => {
    const warehouses = ref([]);
    const errors = ref([]);
    const warehousesLoaded = ref(false);

    /**
     * Get the count of warehouses
     * @returns {number}
     */
    const warehousesCount = computed(() => {
        return warehousesLoaded.value ? warehouses.value.length : 0;
    });

    /**
     * Fetch all warehouses from the API
     */
    function fetchWarehouses() {
        warehouseApi.getWarehouses().then(response => {
            warehouses.value = WarehouseAssembler.toEntitiesFromResponse(response);
            warehousesLoaded.value = true;
        }).catch(error => {
            errors.value.push(error);
        });
    }

    /**
     * Get a specific warehouse by its ID from the local state
     * @param {number|string} id
     * @returns {Warehouse|undefined}
     */
    function getWarehouseById(id) {
        let idNum = parseInt(id);
        return warehouses.value.find(warehouse => warehouse.id === idNum);
    }

    /**
     * Add a new warehouse to the collection
     * @param {object} warehouse
     */
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