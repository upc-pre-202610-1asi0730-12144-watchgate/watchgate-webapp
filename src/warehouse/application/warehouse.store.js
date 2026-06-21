import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { WarehouseApi } from "../infrastructure/warehouse.api.js";
import { WarehouseAssembler } from "../infrastructure/warehouse.assembler.js";
import { useIamStore } from "../../iam/application/iam.store.js";

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
     * Fetch all warehouses belonging to a company from the API
     * @param {number|string} companyId
     */
    function fetchWarehouses(companyId) {
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
    function getWarehouseById(id) {
        let idNum = parseInt(id);
        return warehouses.value.find(warehouse => warehouse.id === idNum);
    }

    /**
     * Create a new warehouse for the current user's company.
     * Completes companyId from the IAM store and, on success, resets
     * warehousesLoaded so warehouse-list refetches the up-to-date collection.
     * @param {{ name: string, location: string, capacity: number, operationStart?: string, operationEnd?: string }} warehouseData
     * @returns {Promise<Warehouse>}
     */
    function createWarehouse(warehouseData) {
        const iamStore = useIamStore();
        const resource = {
            ...warehouseData,
            companyId: iamStore.currentUser?.companyId
        };

        return warehouseApi.createWarehouse(resource).then(response => {
            warehousesLoaded.value = false;
            return WarehouseAssembler.toEntityFromResource(response.data);
        }).catch(error => {
            errors.value.push(error);
            throw error;
        });
    }

    /**
     * Create a new zone within a warehouse and patch it into the local
     * warehouse's zones, so warehouse-detail can show it without a refetch.
     * @param {number|string} warehouseId
     * @param {{ name: string, area: number, riskLevel: string }} zoneData
     * @returns {Promise<object>} the created WarehouseZoneResource
     */
    function createZone(warehouseId, zoneData) {
        return warehouseApi.createZone(warehouseId, zoneData).then(response => {
            const zoneResource = response.data;
            const warehouse = getWarehouseById(warehouseId);
            if (warehouse) {
                warehouse.zones = [...warehouse.zones, zoneResource];
            }
            return zoneResource;
        }).catch(error => {
            errors.value.push(error);
            throw error;
        });
    }

    return {
        warehouses,
        errors,
        warehousesLoaded,
        warehousesCount,
        fetchWarehouses,
        getWarehouseById,
        createWarehouse,
        createZone
    };
});