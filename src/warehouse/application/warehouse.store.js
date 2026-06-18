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
    const currentCompanyId = ref(null);
    /**
     * Get the count of warehouses
     * @returns {number}
     */
    const warehousesCount = computed(() => {
        return warehousesLoaded.value ? warehouses.value.length : 0;
    });

    /**
     * Fetch all warehouses for a specific company from the API
     * @param {number|string} companyId
     */
    function fetchWarehouses(companyId) {
        currentCompanyId.value = parseInt(companyId);

        warehouseApi.getWarehousesByCompanyId(companyId).then(response => {
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
    function getWarehouseByID(id) {
        let idNum = parseInt(id);
        return warehouses.value.find(warehouse => warehouse.id === idNum);
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

            if (newWarehouse.companyId === currentCompanyId.value) {
                warehouses.value.push(newWarehouse);
            }
        }).catch(error => {
            errors.value.push(error);
        });
    }
    /**
     * Update warehouse operating hours
     * @param {number|string} id
     * @param {object} hours
     */
    function updateHours(id, hours) {
        return warehouseApi.updateOperatingHours(id, hours).then(response => {
            const updatedResource = response.data;

            const index = warehouses.value.findIndex(w => w.id === parseInt(id));
            if (index !== -1) {
                warehouses.value[index] = WarehouseAssembler.toEntityFromResource(updatedResource);
            }
            return true;
        }).catch(error => {
            errors.value.push(error);
            return false;
        });
    }

    return {
        warehouses,
        errors,
        warehousesLoaded,
        warehousesCount,
        currentCompanyId,
        fetchWarehouses,
        getWarehouseById,
        addWarehouse,
        updateHours
    };
});