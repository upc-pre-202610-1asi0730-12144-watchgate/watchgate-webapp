<script setup>
/**
 * @view DevicesMonitoring — inline-styles rewrite for reliable layout.
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

const navItems = [
  { label: 'Mis Almacenes',        route: '/warehouses' },
  { label: 'Dispositivos IoT',     route: '/layout/devices', active: true },
  { label: 'Equipo y Accesos',     route: '/team' },
  { label: 'Historial de eventos', route: '/events' },
];
const bottomNav = [
  { label: 'Mi Suscripción', route: '/subscription' },
  { label: 'Configuración',  route: '/settings' },
];

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
  <main style="flex:1;overflow-y:auto;padding:24px 32px;display:flex;flex-direction:column;gap:24px;background:#0F172A;min-height:100vh;">

    <div style="display:flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h1 style="margin:0;color:#fff;font-size:1.5rem;font-weight:700;">Dispositivos IoT</h1>
      <button @click="onLinkClick"
              style="background:#3B82F6;color:#fff;border:none;border-radius:8px;
                      padding:8px 16px;font-size:0.8rem;font-weight:600;cursor:pointer;">
        + Vincular nuevo dispositivo
      </button>
    </div>

    <div style="display:flex;align-items:center;gap:16px;">
    </div>

  </main>

  <DeviceDialog v-model:visible="showDeviceDialog" :loading="linkLoading" @submit="onDeviceSubmit" />
  <LimitWarningDialog v-model:visible="showLimitDialog" @upgrade="showLimitDialog = false" />
  <SuccessDialog v-model:visible="showSuccessDialog" :zone="lastLinkedDevice?.zone ?? ''" />
</template>