/**
 * @file device.assembler.js
 * @description Maps SensorResource API responses to Device domain entities.
 */

import { Device } from '../domain/model/device.entity.js';

export class DeviceAssembler {
    /**
     * Converts a raw SensorResource into a Device entity.
     * @param {object} resource
     * @returns {Device}
     */
    static toEntity(resource) {
        return new Device({
            id: resource.id,
            name: resource.name,
            type: resource.type,
            status: resource.status,
            unit: resource.unit,
            lastReading: resource.lastReading,
            lastReadingAt: resource.lastReadingAt,
            zoneId: resource.zoneId,
            companyId: resource.companyId,
        });
    }
}
