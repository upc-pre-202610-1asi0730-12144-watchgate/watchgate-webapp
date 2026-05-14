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
  <div style="display:flex;height:100vh;background:#0F172A;font-family:Inter,sans-serif;overflow:hidden;">

    <!-- Sidebar -->
    <aside style="width:200px;min-width:200px;background:#0F172A;border-right:1px solid #1E293B;
                      display:flex;flex-direction:column;padding:24px 12px;gap:8px;flex-shrink:0;">
      <div style="padding:0 8px 16px;font-size:1.2rem;font-weight:800;color:#3B82F6;">
        LOCKSIGHT
      </div>
      <nav style="display:flex;flex-direction:column;gap:4px;flex:1;">
        <a v-for="item in navItems" :key="item.route" :href="item.route"
           style="display:block;padding:8px 12px;border-radius:8px;font-size:0.8rem;text-decoration:none;transition:background 0.15s;"
           :style="item.active ? 'background:#1E3A5F;color:#fff;font-weight:600;' : 'color:#94A3B8;'">
          {{ item.label }}
        </a>
        <div style="margin-top:auto;display:flex;flex-direction:column;gap:4px;">
          <a v-for="item in bottomNav" :key="item.route" :href="item.route"
             style="display:block;padding:8px 12px;border-radius:8px;font-size:0.8rem;color:#94A3B8;text-decoration:none;">
            {{ item.label }}
          </a>
        </div>
      </nav>
    </aside>

    <!-- Main -->
    <div style="flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;">

      <!-- Header -->
      <header style="display:flex;align-items:center;justify-content:space-between;
                           padding:20px 32px;border-bottom:1px solid #1E293B;flex-shrink:0;">
        <h1 style="margin:0;color:#fff;font-size:1.1rem;font-weight:700;">Dispositivos IoT</h1>
        <button @click="onLinkClick"
                style="background:#3B82F6;color:#fff;border:none;border-radius:8px;
                           padding:8px 16px;font-size:0.8rem;font-weight:600;cursor:pointer;">
          + Vincular nuevo dispositivo
        </button>
      </header>

      <!-- Content -->
      <main style="flex:1;overflow-y:auto;padding:24px 32px;display:flex;flex-direction:column;gap:24px;">

        <!-- Warehouse + usage -->
        <div style="display:flex;align-items:center;gap:16px;">
          <pv-select v-model="selectedWarehouse" :options="warehouseOptions"
                     option-label="label" option-value="value"
                     style="min-width:180px;font-size:0.8rem;"
                     :pt="{ root: { style: 'background:#1E293B;border-color:#334155;color:#fff;' } }" />
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
               style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:64px 0;color:#475569;">
            <i class="pi pi-wifi" style="font-size:2rem;" />
            <p style="margin:0;font-size:0.875rem;">No hay dispositivos registrados aún.</p>
          </div>
        </template>
      </main>
    </div>

    <!-- Dialogs -->
    <DeviceDialog v-model:visible="showDeviceDialog" :loading="linkLoading" @submit="onDeviceSubmit" />
    <LimitWarningDialog v-model:visible="showLimitDialog" @upgrade="showLimitDialog = false" />
    <SuccessDialog v-model:visible="showSuccessDialog" :zone="lastLinkedDevice?.zone ?? ''" />
  </div>
</template>