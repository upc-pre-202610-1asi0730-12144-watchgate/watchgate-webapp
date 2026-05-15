<script setup>
/**
 * @view DevicesMonitoring
 * @description Content-only view — sidebar is provided by the parent Layout.
 */
import { ref, computed, onMounted } from 'vue';
import { useDevicesStore } from '../../application/devices.store.js';
import DeviceCard         from '../components/DeviceCard.vue';
import DeviceDialog       from '../components/DeviceDialog.vue';
import LimitWarningDialog from '../components/LimitWarningDialog.vue';
import SuccessDialog      from '../components/SuccessDialog.vue';

const store = useDevicesStore();

const selectedWarehouse = ref('Almacén Central');
const warehouseOptions  = [
  { label: 'Almacén Central', value: 'Almacén Central' },
  { label: 'Almacén Norte',   value: 'Almacén Norte' },
  { label: 'Almacén Sur',     value: 'Almacén Sur' },
];

const showDeviceDialog  = ref(false);
const showLimitDialog   = ref(false);
const showSuccessDialog = ref(false);
const lastLinkedDevice  = ref(null);
const linkLoading       = ref(false);

const usageText = computed(() => `Uso: ${store.deviceCount}/${store.DEVICE_LIMIT} disp.`);
const sensors   = computed(() => store.devicesByType['Sensor'] ?? []);
const cameras   = computed(() => store.devicesByType['Camara'] ?? []);

function onLinkClick() {
  store.isAtLimit ? (showLimitDialog.value = true) : (showDeviceDialog.value = true);
}

async function onDeviceSubmit(payload) {
  linkLoading.value = true;
  try {
    const device = await store.addDevice({ ...payload, type: 'Sensor' });
    lastLinkedDevice.value  = device;
    showDeviceDialog.value  = false;
    showSuccessDialog.value = true;
  } catch (e) {
    console.error('[DevicesMonitoring] link error:', e);
  } finally {
    linkLoading.value = false;
  }
}

onMounted(() => store.fetchDevices());
</script>

<template>
  <div style="display:flex;flex-direction:column;gap:24px;padding:24px 32px;
                background:#0F172A;min-height:100%;font-family:Inter,sans-serif;">

    <!-- Header -->
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <h1 style="margin:0;color:#fff;font-size:1.2rem;font-weight:700;">Dispositivos IoT</h1>
      <button @click="onLinkClick"
              style="background:#3B82F6;color:#fff;border:none;border-radius:8px;
                       padding:8px 18px;font-size:0.85rem;font-weight:600;cursor:pointer;">
        + Vincular nuevo dispositivo
      </button>
    </div>

    <!-- Warehouse selector + usage -->
    <div style="display:flex;align-items:center;gap:16px;">
      <pv-select
          v-model="selectedWarehouse"
          :options="warehouseOptions"
          option-label="label"
          option-value="value"
          style="min-width:180px;"
          :pt="{ root: { style: 'background:#1E293B;border-color:#334155;color:#fff;font-size:0.85rem;' } }"
      />
      <span style="color:#94A3B8;font-size:0.85rem;">{{ usageText }}</span>
    </div>

    <!-- Loading -->
    <div v-if="store.loading" style="display:flex;justify-content:center;padding:48px 0;">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:#3B82F6;" />
    </div>

    <template v-else>
      <!-- Sensors -->
      <section v-if="sensors.length">
        <h2 style="color:#CBD5E1;font-size:0.8rem;font-weight:600;margin:0 0 12px;">
          Sensores de Acceso ({{ sensors.length }})
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;">
          <DeviceCard v-for="d in sensors" :key="d.id" :device="d" />
        </div>
      </section>

      <!-- Cameras -->
      <section v-if="cameras.length">
        <h2 style="color:#CBD5E1;font-size:0.8rem;font-weight:600;margin:0 0 12px;">
          Cámaras CCTV ({{ cameras.length }})
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;">
          <DeviceCard v-for="d in cameras" :key="d.id" :device="d" />
        </div>
      </section>

      <!-- Empty -->
      <div v-if="!sensors.length && !cameras.length"
           style="display:flex;flex-direction:column;align-items:center;gap:12px;
                        padding:64px 0;color:#475569;">
        <i class="pi pi-wifi" style="font-size:2rem;" />
        <p style="margin:0;font-size:0.875rem;">No hay dispositivos registrados aún.</p>
      </div>
    </template>

    <!-- Dialogs -->
    <DeviceDialog v-model:visible="showDeviceDialog" :loading="linkLoading" @submit="onDeviceSubmit" />
    <LimitWarningDialog v-model:visible="showLimitDialog" @upgrade="showLimitDialog = false" />
    <SuccessDialog v-model:visible="showSuccessDialog" :zone="lastLinkedDevice?.zone ?? ''" />
  </div>
</template>