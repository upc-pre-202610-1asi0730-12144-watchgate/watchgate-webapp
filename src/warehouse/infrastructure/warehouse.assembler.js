import { Warehouse } from "../domain/model/warehouse.entity.js";

/**
 * Warehouse assembler
 * @class WarehouseAssembler
 * @description
 * Warehouse assembler is used to map warehouse resources into domain entities.
 */
export class WarehouseAssembler {
    /**
     * Map a resource to a Warehouse entity
     * @param {object} resource
     * @returns {Warehouse}
     */
    static toEntityFromResource(resource) {
        return new Warehouse({ ...resource });
    }

    /**
     * Map a collection of resources from a response into entities
     * @param {object} response
     * @returns {Array<Warehouse>}
     */
    static toEntitiesFromResponse(response) {
        if (response.status !== 200) {
            console.error(`${response.status}, ${response.statusText}`);
            return [];
        }
        let resources = response.data instanceof Array ? response.data : response.data['warehouses'];

        return resources.map(resource => this.toEntityFromResource(resource));
    }
}