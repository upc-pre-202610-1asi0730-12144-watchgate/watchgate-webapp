/**
 * @file devices.store.js
 * @description Pinia store for managing Sensor (device) state, backed by the
 * real SensorIntegration endpoints (filtered by the current user's company).
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { DevicesApi }      from '../infrastructure/devices-api.js';
import { DeviceAssembler } from '../infrastructure/device.assembler.js';
import { useIamStore } from '../../iam/application/iam.store.js';

const devicesApi = new DevicesApi();

export const useDevicesStore = defineStore('devices', () => {
    /** @type {import('vue').Ref<import('../domain/model/device.entity.js').Device[]>} */
    const devices = ref([]);
    const loading = ref(false);
    const error   = ref(null);
    const devicesLoaded = ref(false);

    /** Maximum devices allowed by the current plan. */
    const DEVICE_LIMIT = 4;

    const deviceCount   = computed(() => devices.value.length);
    const isAtLimit     = computed(() => deviceCount.value >= DEVICE_LIMIT);

    /** Groups devices by type (e.g. MOTION, DOOR, TEMPERATURE) for the monitoring view. */
    const devicesByType = computed(() => {
        return devices.value.reduce((acc, device) => {
            const key = device.type;
            if (!acc[key]) acc[key] = [];
            acc[key].push(device);
            return acc;
        }, {});
    });

    /**
     * Loads all sensors belonging to a company from the API.
     * @param {number|string} companyId
     */
    async function fetchDevices(companyId) {
        loading.value = true;
        error.value   = null;
        try {
            const resources = await devicesApi.getAllByCompanyId(companyId);
            devices.value = resources.map(DeviceAssembler.toEntity);
            devicesLoaded.value = true;
        } catch (e) {
            console.error('fetchDevices error:', e);
            error.value = e.message;
        } finally {
            loading.value = false;
        }
    }

    /**
     * Creates a new sensor via the API and appends it to local state.
     * Completes companyId from the IAM store, matching the
     * CreateSensorResource shape: { name, type, unit, zoneId, companyId }.
     * @param {{ name: string, type: string, unit?: string, zoneId: number }} payload
     * @returns {Promise<import('../domain/model/device.entity.js').Device>}
     */
    async function addDevice(payload) {
        const iamStore = useIamStore();
        const resource = {
            name: payload.name,
            type: payload.type,
            unit: payload.unit || null,
            zoneId: payload.zoneId,
            companyId: iamStore.currentUser?.companyId
        };

        const created = await devicesApi.create(resource);
        const entity   = DeviceAssembler.toEntity(created);
        devices.value  = [...devices.value, entity];
        return entity;
    }

    return {
        devices,
        loading,
        error,
        devicesLoaded,
        deviceCount,
        isAtLimit,
        devicesByType,
        DEVICE_LIMIT,
        fetchDevices,
        addDevice,
    };
});
