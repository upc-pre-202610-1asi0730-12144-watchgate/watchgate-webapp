/**
 * Warehouse entity
 * @class Warehouse
 * @description
 * Warehouse entity is used to represent a warehouse within the Warehouse Tracking context.
 */
export class Warehouse {
    constructor({ id = 0, name = '', location = '', capacity = 0, companyId = 0, zones = [] }) {
        this.id = id;
        this.name = name;
        this.location = location;
        this.capacity = capacity;
        this.companyId = companyId;
        // Real WarehouseZone resources from the backend: { id, name, area, riskLevel, warehouseId }
        this.zones = zones;

        this.hasIncident = false;
        this.status = 'active';
        this.lastEventMessage = 'No recent events';
    }
}