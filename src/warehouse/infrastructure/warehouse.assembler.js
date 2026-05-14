import { Warehouse } from "../domain/model/warehouse.entity.js";

/**
 * Maps warehouse resources into domain entities.
 * @class WarehouseAssembler
 */
export class WarehouseAssembler {
    static toEntityFromResource(resource) {
        return new Warehouse({ ...resource });
    }

    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['warehouses'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}