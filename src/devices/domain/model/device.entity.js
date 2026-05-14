/**
 * @file device.entity.js
 * @description Represents an IoT device registered in a warehouse.
 */

export class Device {
    /** @param {object} data - Raw device data. */
    constructor({ id, name, type, status, zone, serialNumber }) {
        /** @type {number|string} */
        this.id = id;
        /** @type {string} */
        this.name = name;
        /** @type {'Sensor'|'Cámara'} */
        this.type = type;
        /** @type {'Online'|'Offline'} */
        this.status = status;
        /** @type {string} */
        this.zone = zone;
        /** @type {string} */
        this.serialNumber = serialNumber;
    }

    /** @returns {boolean} */
    get isOnline() {
        return this.status === 'Online';
    }
}