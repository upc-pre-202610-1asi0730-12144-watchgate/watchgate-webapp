/**
 * @file devices.store.js
 * @description Pinia store for managing IoT device state (fetch, add, remove).
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { DevicesApi }      from '../infrastructure/devices-api.js';
import { DeviceAssembler } from '../infrastructure/device.assembler.js';

const devicesApi = new DevicesApi();

export const useDevicesStore = defineStore('devices', () => {
    /** @type {import('vue').Ref<import('../domain/model/device.entity.js').Device[]>} */
    const devices = ref([]);
    const loading = ref(false);
    const error   = ref(null);

    /** Maximum devices allowed by the current plan. */
    const DEVICE_LIMIT = 4;

    const deviceCount   = computed(() => devices.value.length);
    const isAtLimit     = computed(() => deviceCount.value >= DEVICE_LIMIT);

    /** Groups devices by type for the monitoring view. */
    const devicesByType = computed(() => {
        return devices.value.reduce((acc, device) => {
            const key = device.type;
            if (!acc[key]) acc[key] = [];
            acc[key].push(device);
            return acc;
        }, {});
    });

    /** Loads all devices from the API. */
    async function fetchDevices() {
        loading.value = true;
        error.value   = null;
        try {
            const resources = await devicesApi.getAll();
            console.log('devices fetched:', resources);
            devices.value = resources.map(DeviceAssembler.toEntity);
        } catch (e) {
            console.error('fetchDevices error:', e);
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Adds a new device via the API and appends it to local state.
     * @param {{ serialNumber: string, name: string, zone: string, type: string }} payload
     * @returns {Promise<import('../domain/model/device.entity.js').Device>}
     */
    async function addDevice(payload) {
        const resource = { ...payload, status: 'Online' };
        const created  = await devicesApi.create(resource);
        const entity   = DeviceAssembler.toEntity(created);
        devices.value  = [...devices.value, entity];
        return entity;
    }

    /**
     * Removes a device by id from the API and local state.
     * @param {number|string} id
     */
    async function removeDevice(id) {
        await devicesApi.remove(id);
        devices.value = devices.value.filter(d => d.id !== id);
    }

    return {
        devices,
        loading,
        error,
        deviceCount,
        isAtLimit,
        devicesByType,
        DEVICE_LIMIT,
        fetchDevices,
        addDevice,
        removeDevice,
    };
});