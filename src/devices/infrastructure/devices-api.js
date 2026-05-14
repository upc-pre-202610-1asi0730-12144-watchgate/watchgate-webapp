import axios from 'axios';

/**
 * Infrastructure gateway for IoT Devices bounded-context endpoints.
 * Uses environment variables for configuration.
 */
const http = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL
});

const DEVICES_ENDPOINT = import.meta.env.VITE_DEVICES_ENDPOINT_PATH;

export class DevicesApi {
    /**
     * Fetches all IoT devices from the server.
     * @returns {Promise}
     */
    getDevices() {
        return http.get(DEVICES_ENDPOINT);
    }

    /**
     * Fetches a single device by its ID.
     * @param {number|string} id
     * @returns {Promise}
     */
    getDeviceById(id) {
        return http.get(`${DEVICES_ENDPOINT}/${id}`);
    }

    /**
     * Creates a new IoT device record.
     * @param {object} deviceResource
     * @returns {Promise}
     */
    createDevice(deviceResource) {
        return http.post(DEVICES_ENDPOINT, deviceResource);
    }

    /**
     * Updates an existing IoT device.
     * @param {number|string} id
     * @param {object} deviceResource
     * @returns {Promise}
     */
    updateDevice(id, deviceResource) {
        return http.put(`${DEVICES_ENDPOINT}/${id}`, deviceResource);
    }

    /**
     * Deletes a device record.
     * @param {number|string} id
     * @returns {Promise}
     */
    deleteDevice(id) {
        return http.delete(`${DEVICES_ENDPOINT}/${id}`);
    }
}