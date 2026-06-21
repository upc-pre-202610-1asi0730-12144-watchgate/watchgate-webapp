/**
 * @file device.entity.js
 * @description Represents a sensor registered in a warehouse zone
 * (maps 1:1 to the backend's SensorResource).
 */

export class Device {
    /** @param {object} data - Raw sensor data. */
    constructor({ id, name, type, status, unit = null, lastReading = null, lastReadingAt = null, zoneId, companyId }) {
        /** @type {number|string} */
        this.id = id;
        /** @type {string} */
        this.name = name;
        /** @type {string} e.g. 'MOTION', 'DOOR', 'TEMPERATURE' */
        this.type = type;
        /** @type {string} e.g. 'ACTIVE', 'INACTIVE' */
        this.status = status;
        /** @type {string|null} e.g. '°C', 'ppm' */
        this.unit = unit;
        /** @type {number|null} */
        this.lastReading = lastReading;
        /** @type {Date|null} */
        this.lastReadingAt = lastReadingAt ? new Date(lastReadingAt) : null;
        /** @type {number} real WarehouseZone id */
        this.zoneId = zoneId;
        /** @type {number} */
        this.companyId = companyId;
    }

    /** @returns {boolean} */
    get isOnline() {
        return this.status === 'ACTIVE';
    }
}
