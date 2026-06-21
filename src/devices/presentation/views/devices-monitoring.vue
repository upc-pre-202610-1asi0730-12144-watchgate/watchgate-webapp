<script setup>
/**
 * @view DevicesMonitoring
 * @description Content-only view — sidebar is provided by the parent Layout.
 * Lists real sensors (SensorIntegration) for the user's company and lets
 * them register new ones against real WarehouseZone ids.
 */
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useDevicesStore } from '../../application/devices.store.js';
import { useWarehouseStore } from '../../../warehouse/application/warehouse.store.js';
import { useIamStore } from '../../../iam/application/iam.store.js';
import DeviceCard         from '../components/DeviceCard.vue';
import DeviceDialog       from '../components/DeviceDialog.vue';
import LimitWarningDialog from '../components/LimitWarningDialog.vue';
import SuccessDialog      from '../components/SuccessDialog.vue';

const { t } = useI18n();
const store = useDevicesStore();
const warehouseStore = useWarehouseStore();
const iamStore = useIamStore();

const showDeviceDialog  = ref(false);
const showLimitDialog   = ref(false);
const showSuccessDialog = ref(false);
const lastLinkedDevice  = ref(null);
const linkLoading       = ref(false);

const usageText = computed(() => `${t('devices.usage')}: ${store.deviceCount}/${store.DEVICE_LIMIT} ${t('devices.usageUnit')}`);

// Flat list of real { id, name, warehouseId } zones across all of the
// company's warehouses, used both for the dialog's zone select and to
// resolve a human-readable zone label per device.
const allZones = computed(() => warehouseStore.warehouses.flatMap(warehouse =>
    warehouse.zones.map(zone => ({ ...zone, warehouseName: warehouse.name }))
));

const zoneOptions = computed(() => allZones.value.map(zone => ({
  label: `${zone.warehouseName} - ${zone.name}`,
  value: zone.id,
})));

function zoneLabelFor(zoneId) {
  const zone = allZones.value.find(z => z.id === zoneId);
  return zone ? `${zone.warehouseName} - ${zone.name}` : '';
}

function onLinkClick() {
  store.isAtLimit ? (showLimitDialog.value = true) : (showDeviceDialog.value = true);
}

async function onDeviceSubmit(payload) {
  linkLoading.value = true;
  try {
    const device = await store.addDevice(payload);
    lastLinkedDevice.value  = device;
    showDeviceDialog.value  = false;
    showSuccessDialog.value = true;
  } catch (e) {
    console.error('[DevicesMonitoring] link error:', e);
  } finally {
    linkLoading.value = false;
  }
}

function loadData() {
  const companyId = iamStore.currentUser?.companyId;
  if (!companyId) return;
  if (!warehouseStore.warehousesLoaded) warehouseStore.fetchWarehouses(companyId);
  if (!store.devicesLoaded) store.fetchDevices(companyId);
}

onMounted(() => {
  if (!iamStore.sessionLoading) loadData();
});

watch(() => iamStore.sessionLoading, (loading) => {
  if (!loading) loadData();
});
</script>

<template>
  <div style="display:flex;flex-direction:column;gap:24px;padding:24px 32px;
                background:#0F172A;min-height:100%;font-family:Inter,sans-serif;">

    <!-- Header -->
    <div style="display:flex;align-items:center;justify-content:space-between;">
      <h1 style="margin:0;color:#fff;font-size:1.2rem;font-weight:700;">{{ t('devices.title') }}</h1>
      <button @click="onLinkClick"
              style="background:#3B82F6;color:#fff;border:none;border-radius:8px;
                       padding:8px 18px;font-size:0.85rem;font-weight:600;cursor:pointer;">
        + {{ t('devices.linkNew') }}
      </button>
    </div>

    <!-- Usage -->
    <div style="display:flex;align-items:center;gap:16px;">
      <span style="color:#94A3B8;font-size:0.85rem;">{{ usageText }}</span>
    </div>

    <!-- Loading -->
    <div v-if="store.loading || iamStore.sessionLoading" style="display:flex;justify-content:center;padding:48px 0;">
      <i class="pi pi-spin pi-spinner" style="font-size:2rem;color:#3B82F6;" />
    </div>

    <template v-else>
      <!-- Sensors grouped by type -->
      <section v-for="(group, type) in store.devicesByType" :key="type" v-show="group.length">
        <h2 style="color:#CBD5E1;font-size:0.8rem;font-weight:600;margin:0 0 12px;text-transform:uppercase;">
          {{ type }} ({{ group.length }})
        </h2>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px;">
          <DeviceCard v-for="d in group" :key="d.id" :device="d" :zone-label="zoneLabelFor(d.zoneId)" />
        </div>
      </section>

      <!-- Empty -->
      <div v-if="!store.devices.length"
           style="display:flex;flex-direction:column;align-items:center;gap:12px;
                        padding:64px 0;color:#475569;">
        <i class="pi pi-wifi" style="font-size:2rem;" />
        <p style="margin:0;font-size:0.875rem;">{{ t('devices.empty') }}</p>
      </div>
    </template>

    <!-- Dialogs -->
    <DeviceDialog v-model:visible="showDeviceDialog" :zone-options="zoneOptions" :loading="linkLoading" @submit="onDeviceSubmit" />
    <LimitWarningDialog v-model:visible="showLimitDialog" @upgrade="showLimitDialog = false" />
    <SuccessDialog v-model:visible="showSuccessDialog" :zone="zoneLabelFor(lastLinkedDevice?.zoneId)" />
  </div>
</template>
