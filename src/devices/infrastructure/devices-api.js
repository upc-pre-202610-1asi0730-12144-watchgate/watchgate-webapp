/**
 * @file devices-api.js
 * @description HTTP client for the /devices endpoint backed by JSON Server.
 */

const BASE_URL = 'http://localhost:3000/devices';

export class DevicesApi {
    /** @returns {Promise<object[]>} */
    static async getAll() {
        const response = await fetch(BASE_URL);
        if (!response.ok) throw new Error('Failed to fetch devices');
        return response.json();
    }

    /**
     * @param {object} resource - Plain device resource object.
     * @returns {Promise<object>}
     */
    static async create(resource) {
        const response = await fetch(BASE_URL, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(resource),
        });
        if (!response.ok) throw new Error('Failed to create device');
        return response.json();
    }

    /**
     * @param {number|string} id - Device identifier.
     * @returns {Promise<void>}
     */
    static async remove(id) {
        const response = await fetch(`${BASE_URL}/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete device');
    }
}