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
import { SubscriptionApi } from '../../../subscription/infrastructure/subscription-api.js';
import DeviceCard         from '../components/DeviceCard.vue';
import DeviceDialog       from '../components/DeviceDialog.vue';
import LimitWarningDialog from '../components/LimitWarningDialog.vue';
import SuccessDialog      from '../components/SuccessDialog.vue';

const { t } = useI18n();
const store = useDevicesStore();
const warehouseStore = useWarehouseStore();
const iamStore = useIamStore();
const subscriptionApi = new SubscriptionApi();

const showDeviceDialog  = ref(false);
const showLimitDialog   = ref(false);
const showSuccessDialog = ref(false);
const lastLinkedDevice  = ref(null);
const linkLoading       = ref(false);

const usageText = computed(() => `${t('devices.usage')}: ${store.deviceCount}/${store.deviceLimit} ${t('devices.usageUnit')}`);

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

const devicesByWarehouse = computed(() => {
  return store.devices.reduce((groups, device) => {
    const warehouseName = warehouseLabelFor(device.zoneId) || t('devices.unassignedWarehouse');
    const type = device.type || 'UNKNOWN';

    if (!groups[warehouseName]) groups[warehouseName] = {};
    if (!groups[warehouseName][type]) groups[warehouseName][type] = [];

    groups[warehouseName][type].push(device);
    return groups;
  }, {});
});

const canManageSensors = computed(() => iamStore.canManageSensors);
const canDeleteSensors = computed(() => String(iamStore.currentRole).toLowerCase() === 'administrator');

function zoneFor(zoneId) {
  return allZones.value.find(z => Number(z.id) === Number(zoneId));
}

function warehouseLabelFor(zoneId) {
  return zoneFor(zoneId)?.warehouseName ?? '';
}

function zoneLabelFor(zoneId) {
  return zoneFor(zoneId)?.name ?? '';
}

function onLinkClick() {
  if (!canManageSensors.value) return;
  store.isAtLimit ? (showLimitDialog.value = true) : (showDeviceDialog.value = true);
}

async function onDeviceSubmit(payload) {
  if (!canManageSensors.value) return;
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
  subscriptionApi.getPlans()
      .then(plans => subscriptionApi.getSubscriptionsByCompanyId(companyId)
          .then(subscriptions => ({ plans, subscriptions })))
      .then(({ plans, subscriptions }) => {
        const activeSubscription = subscriptions.find(subscription => subscription.status === 'ACTIVE');
        const plan = plans.find(item => item.id === activeSubscription?.planId);
        if (plan?.maxSensors) store.setDeviceLimit(plan.maxSensors);
      })
      .catch(error => console.warn('[DevicesMonitoring] plan limits unavailable:', error));
}

async function toggleDeviceStatus(device) {
  if (!canManageSensors.value) return;
  const nextStatus = device.isOnline ? 'INACTIVE' : 'ACTIVE';
  try {
    await store.updateDeviceStatus(device.id, nextStatus);
  } catch (error) {
    console.error('[DevicesMonitoring] status error:', error);
  }
}

async function recordReading(device) {
  if (!canManageSensors.value) return;
  const defaultValue = device.type === 'MOTION' || device.type === 'DOOR' ? '1' : '24';
  const value = window.prompt(t('devices.actions.readingPrompt'), defaultValue);
  if (value === null) return;
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return;
  try {
    await store.recordDeviceReading(device.id, numericValue);
  } catch (error) {
    console.error('[DevicesMonitoring] reading error:', error);
  }
}

async function unlinkDevice(device) {
  if (!canManageSensors.value) return;
  if (!window.confirm(t('devices.actions.unlinkConfirm', { name: device.name }))) return;
  try {
    await store.unlinkDevice(device.id);
  } catch (error) {
    console.error('[DevicesMonitoring] unlink error:', error);
  }
}

async function deleteDevice(device) {
  if (!canDeleteSensors.value) return;
  if (!window.confirm(t('devices.actions.deleteConfirm', { name: device.name }))) return;
  try {
    await store.deleteDevice(device.id);
  } catch (error) {
    console.error('[DevicesMonitoring] delete error:', error);
  }
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
      <button v-if="canManageSensors"
              @click="onLinkClick"
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
      <!-- Sensors grouped by warehouse and type -->
      <section v-for="(typeGroups, warehouseName) in devicesByWarehouse" :key="warehouseName">
        <h2 style="color:#E2E8F0;font-size:0.92rem;font-weight:700;margin:0 0 12px;text-transform:uppercase;">
          {{ warehouseName }}
        </h2>

        <section v-for="(group, type) in typeGroups" :key="`${warehouseName}-${type}`" v-show="group.length">
          <h3 style="color:#94A3B8;font-size:0.75rem;font-weight:600;margin:0 0 10px;text-transform:uppercase;">
            {{ type }} ({{ group.length }})
          </h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:12px;margin-bottom:16px;">
            <DeviceCard
                v-for="d in group"
                :key="d.id"
                :device="d"
                :warehouse-label="warehouseLabelFor(d.zoneId)"
                :zone-label="zoneLabelFor(d.zoneId)"
                :can-manage="canManageSensors"
                :can-delete="canDeleteSensors"
                @toggle-status="toggleDeviceStatus"
                @record-reading="recordReading"
                @unlink="unlinkDevice"
                @delete="deleteDevice"
            />
          </div>
        </section>
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
    <LimitWarningDialog v-model:visible="showLimitDialog" :limit="store.deviceLimit" @upgrade="showLimitDialog = false" />
    <SuccessDialog v-model:visible="showSuccessDialog" :zone="`${warehouseLabelFor(lastLinkedDevice?.zoneId)} - ${zoneLabelFor(lastLinkedDevice?.zoneId)}`" />
  </div>
</template>
