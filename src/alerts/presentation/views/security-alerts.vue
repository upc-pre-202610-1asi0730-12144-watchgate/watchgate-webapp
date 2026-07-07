<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { AlertsApi } from '../../infrastructure/alerts-api.js';
import { useIamStore } from '../../../iam/application/iam.store.js';
import { useDevicesStore } from '../../../devices/application/devices.store.js';

const alertsApi = new AlertsApi();
const { t } = useI18n();
const iamStore = useIamStore();
const devicesStore = useDevicesStore();

const alerts = ref([]);
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const form = ref({
  type: 'DOOR_OPEN',
  severity: 'HIGH',
  description: '',
  sensorId: null,
});

const alertTypes = computed(() => [
  { value: 'DOOR_OPEN', label: t('alerts.types.doorOpen') },
  { value: 'MOTION_DETECTED', label: t('alerts.types.motionDetected') },
  { value: 'AFTER_HOURS_ACCESS', label: t('alerts.types.afterHoursAccess') },
  { value: 'CONNECTIVITY_FAILURE', label: t('alerts.types.connectivityFailure') },
]);

const severities = computed(() => [
  { value: 'LOW', label: t('alerts.severities.low') },
  { value: 'MEDIUM', label: t('alerts.severities.medium') },
  { value: 'HIGH', label: t('alerts.severities.high') },
  { value: 'CRITICAL', label: t('alerts.severities.critical') },
]);

const openAlerts = computed(() => alerts.value.filter(alert => alert.status !== 'RESOLVED').length);
const criticalAlerts = computed(() => alerts.value.filter(alert => ['HIGH', 'CRITICAL'].includes(alert.severity)).length);

function loadAlerts() {
  const companyId = iamStore.currentUser?.companyId;
  if (!companyId) return Promise.resolve();

  loading.value = true;
  errorMessage.value = '';
  return alertsApi.getByCompanyId(companyId)
      .then(data => {
        alerts.value = data.sort((a, b) => new Date(b.triggeredAt) - new Date(a.triggeredAt));
      })
      .catch(error => {
        console.error(error);
        errorMessage.value = t('alerts.messages.loadError');
      })
      .finally(() => {
        loading.value = false;
      });
}

function loadDevices() {
  const companyId = iamStore.currentUser?.companyId;
  if (companyId && !devicesStore.devicesLoaded) {
    return devicesStore.fetchDevices(companyId);
  }
  return Promise.resolve();
}

function ensureData() {
  if (iamStore.sessionLoading) return;
  Promise.all([loadAlerts(), loadDevices()]);
}

function createAlert() {
  const companyId = iamStore.currentUser?.companyId;
  if (!companyId || !form.value.sensorId || !form.value.description.trim()) {
    errorMessage.value = t('alerts.messages.required');
    return;
  }

  saving.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  alertsApi.create({
    type: form.value.type,
    severity: form.value.severity,
    description: form.value.description.trim(),
    sensorId: Number(form.value.sensorId),
    companyId,
  }).then(created => {
    alerts.value = [created, ...alerts.value];
    form.value.description = '';
    successMessage.value = t('alerts.messages.created');
  }).catch(error => {
    console.error(error);
    errorMessage.value = t('alerts.messages.createError');
  }).finally(() => {
    saving.value = false;
  });
}

function updateAlert(alertId, action) {
  errorMessage.value = '';
  successMessage.value = '';
  action(alertId)
      .then(updated => {
        alerts.value = alerts.value.map(alert => alert.id === updated.id ? updated : alert);
        successMessage.value = t('alerts.messages.updated');
      })
      .catch(error => {
        console.error(error);
        errorMessage.value = t('alerts.messages.updateError');
      });
}

function sensorLabel(sensorId) {
  const sensor = devicesStore.devices.find(device => device.id === sensorId);
  return sensor ? sensor.name : `${t('alerts.form.sensor')} ${sensorId}`;
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '-';
}

onMounted(ensureData);
watch(() => iamStore.sessionLoading, ensureData);
</script>

<template>
  <div class="alerts-view">
    <header class="page-header">
      <div>
        <h1>{{ t('alerts.title') }}</h1>
        <p>{{ t('alerts.subtitle') }}</p>
      </div>
      <div class="metrics">
        <div><strong>{{ alerts.length }}</strong><span>{{ t('alerts.metrics.total') }}</span></div>
        <div><strong>{{ openAlerts }}</strong><span>{{ t('alerts.metrics.open') }}</span></div>
        <div><strong>{{ criticalAlerts }}</strong><span>{{ t('alerts.metrics.critical') }}</span></div>
      </div>
    </header>

    <section class="panel">
      <h2>{{ t('alerts.form.title') }}</h2>
      <form class="alert-form" @submit.prevent="createAlert">
        <label>
          {{ t('alerts.form.type') }}
          <select v-model="form.type">
            <option v-for="type in alertTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
          </select>
        </label>
        <label>
          {{ t('alerts.form.severity') }}
          <select v-model="form.severity">
            <option v-for="severity in severities" :key="severity.value" :value="severity.value">{{ severity.label }}</option>
          </select>
        </label>
        <label>
          {{ t('alerts.form.sensor') }}
          <select v-model="form.sensorId">
            <option :value="null">{{ t('alerts.form.sensorPlaceholder') }}</option>
            <option v-for="device in devicesStore.devices" :key="device.id" :value="device.id">
              {{ device.name }} - {{ device.type }}
            </option>
          </select>
        </label>
        <label class="description-field">
          {{ t('alerts.form.description') }}
          <input v-model="form.description" :placeholder="t('alerts.form.descriptionPlaceholder')" />
        </label>
        <button type="submit" :disabled="saving">{{ saving ? t('common.saving') : t('alerts.form.submit') }}</button>
      </form>
      <p v-if="!devicesStore.devices.length" class="hint">{{ t('alerts.form.noDevices') }}</p>
    </section>

    <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="message success">{{ successMessage }}</p>

    <section class="panel">
      <h2>{{ t('alerts.list.title') }}</h2>
      <div v-if="loading" class="empty">{{ t('alerts.list.loading') }}</div>
      <div v-else-if="!alerts.length" class="empty">{{ t('alerts.list.empty') }}</div>
      <div v-else class="alerts-list">
        <article v-for="alert in alerts" :key="alert.id" class="alert-card">
          <div class="alert-main">
            <span class="severity" :class="alert.severity.toLowerCase()">{{ alert.severity }}</span>
            <h3>{{ alert.type }}</h3>
            <p>{{ alert.description }}</p>
            <small>{{ sensorLabel(alert.sensorId) }} - {{ formatDate(alert.triggeredAt) }}</small>
          </div>
          <div class="alert-side">
            <span class="status">{{ alert.status }}</span>
            <button @click="updateAlert(alert.id, alertsApi.acknowledge.bind(alertsApi))">{{ t('alerts.actions.acknowledge') }}</button>
            <button @click="updateAlert(alert.id, alertsApi.markAsAttended.bind(alertsApi))">{{ t('alerts.actions.attend') }}</button>
            <button @click="updateAlert(alert.id, alertsApi.escalate.bind(alertsApi))">{{ t('alerts.actions.escalate') }}</button>
            <button @click="updateAlert(alert.id, alertsApi.flagAsFalseAlarm.bind(alertsApi))">{{ t('alerts.actions.falseAlarm') }}</button>
            <button @click="updateAlert(alert.id, alertsApi.resolve.bind(alertsApi))">{{ t('alerts.actions.resolve') }}</button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.alerts-view { color: #e5eefb; display: flex; flex-direction: column; gap: 1.25rem; }
.page-header { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
h1, h2, h3, p { margin-top: 0; }
.page-header h1 { margin-bottom: 0.4rem; font-size: 1.6rem; }
.page-header p, .hint, .empty, small { color: #94a3b8; }
.metrics { display: flex; gap: 0.75rem; }
.metrics div { min-width: 92px; background: #102035; border: 1px solid #1e2d42; border-radius: 8px; padding: 0.85rem; }
.metrics strong { display: block; font-size: 1.45rem; color: #fff; }
.metrics span { color: #94a3b8; font-size: 0.8rem; }
.panel { background: #102035; border: 1px solid #1e2d42; border-radius: 8px; padding: 1.25rem; }
.panel h2 { font-size: 1rem; margin-bottom: 1rem; }
.alert-form { display: grid; grid-template-columns: repeat(4, minmax(160px, 1fr)); gap: 0.9rem; align-items: end; }
label { display: flex; flex-direction: column; gap: 0.35rem; color: #cbd5e1; font-size: 0.85rem; }
input, select { background: #0a1726; border: 1px solid #1e2d42; color: #fff; border-radius: 6px; padding: 0.7rem 0.8rem; min-height: 42px; }
.description-field { grid-column: span 2; }
button { background: #3b82f6; border: 0; color: #fff; border-radius: 6px; padding: 0.7rem 0.9rem; font-weight: 700; cursor: pointer; min-height: 42px; }
button:disabled { opacity: 0.65; cursor: progress; }
.message { border-radius: 8px; padding: 0.8rem 1rem; margin: 0; }
.error { background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.35); }
.success { background: rgba(34, 197, 94, 0.12); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.35); }
.alerts-list { display: flex; flex-direction: column; gap: 0.75rem; }
.alert-card { display: flex; justify-content: space-between; gap: 1rem; background: #0a1726; border: 1px solid #1e2d42; border-radius: 8px; padding: 1rem; }
.alert-main h3 { margin: 0.4rem 0; font-size: 1rem; }
.alert-main p { margin-bottom: 0.45rem; color: #cbd5e1; }
.severity { display: inline-block; border-radius: 999px; padding: 0.15rem 0.55rem; font-size: 0.72rem; font-weight: 800; }
.severity.low { background: #12351f; color: #4ade80; }
.severity.medium { background: #3a2f10; color: #fbbf24; }
.severity.high, .severity.critical { background: #3a1a1a; color: #f87171; }
.alert-side { min-width: 160px; display: flex; flex-direction: column; gap: 0.45rem; align-items: stretch; }
.alert-side button { background: transparent; border: 1px solid #334155; font-size: 0.8rem; }
.status { color: #93c5fd; font-weight: 800; font-size: 0.8rem; text-align: right; }
@media (max-width: 900px) {
  .page-header, .alert-card { flex-direction: column; }
  .metrics { flex-wrap: wrap; }
  .alert-form { grid-template-columns: 1fr; }
  .description-field { grid-column: auto; }
}
</style>
