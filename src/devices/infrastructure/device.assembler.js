/**
 * @file device.assembler.js
 * @description Maps raw JSON Server responses to Device domain entities.
 */

import { Device } from '../domain/model/device.entity.js';

export class DeviceAssembler {
    /**
     * Converts a raw API resource object to a Device entity.
     * @param {object} resource - Raw JSON from the API.
     * @returns {Device}
     */
    static toEntity(resource) {
        return new Device({
            id:           resource.id,
            name:         resource.name,
            type:         resource.type,
            status:       resource.status,
            zone:         resource.zone,
            serialNumber: resource.serialNumber,
        });
    }

    /**
     * Converts a Device entity to a plain object suitable for the API.
     * @param {Device} entity
     * @returns {object}
     */
    static toResource(entity) {
        return {
            name:         entity.name,
            type:         entity.type,
            status:       entity.status,
            zone:         entity.zone,
            serialNumber: entity.serialNumber,
        };
    }
}