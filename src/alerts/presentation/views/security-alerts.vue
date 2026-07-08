<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { AlertsApi } from '../../infrastructure/alerts-api.js';
import { useIamStore } from '../../../iam/application/iam.store.js';
import { useDevicesStore } from '../../../devices/application/devices.store.js';
import { useWarehouseStore } from '../../../warehouse/application/warehouse.store.js';

const alertsApi = new AlertsApi();
const { t } = useI18n();
const iamStore = useIamStore();
const devicesStore = useDevicesStore();
const warehouseStore = useWarehouseStore();

const alerts = ref([]);
const incidents = ref([]);
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const actionLog = ref({});

const form = ref({
  type: 'DOOR_OPEN',
  severity: 'HIGH',
  description: '',
  sensorId: null,
});

const incidentForm = ref({
  title: 'Restricted zone incident',
  description: '',
  priority: 'HIGH',
  relatedAlertId: null,
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
const openIncidents = computed(() => incidents.value.filter(incident => incident.status !== 'CLOSED').length);
const allZones = computed(() => warehouseStore.warehouses.flatMap(warehouse =>
    warehouse.zones.map(zone => ({ ...zone, warehouseName: warehouse.name }))
));
const incidentAlertOptions = computed(() => alerts.value
    .filter(alert => alert.status !== 'RESOLVED')
    .map(alert => ({
      value: alert.id,
      label: `${alert.type} - ${sensorLabel(alert.sensorId)}`
    }))
);

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

function loadIncidents() {
  const companyId = iamStore.currentUser?.companyId;
  if (!companyId) return Promise.resolve();
  return alertsApi.getIncidentsByCompanyId(companyId)
      .then(data => {
        incidents.value = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      })
      .catch(error => {
        console.error(error);
        errorMessage.value = t('alerts.messages.incidentsLoadError');
      });
}

function loadDevices() {
  const companyId = iamStore.currentUser?.companyId;
  if (!companyId) return Promise.resolve();
  const warehousesPromise = warehouseStore.warehousesLoaded
      ? Promise.resolve()
      : warehouseStore.fetchWarehouses(companyId);
  if (!devicesStore.devicesLoaded) {
    return warehousesPromise.then(() => devicesStore.fetchDevices(companyId));
  }
  return warehousesPromise;
}

function ensureData() {
  if (iamStore.sessionLoading) return;
  Promise.all([loadAlerts(), loadDevices(), loadIncidents()]);
}

function createAlert() {
  if (!iamStore.canManageAlerts) return;
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
    appendLog(`alert-${created.id}`, `Alert created with severity ${created.severity}`);
    form.value.description = '';
    incidentForm.value.relatedAlertId = created.id;
    successMessage.value = t('alerts.messages.created');
  }).catch(error => {
    console.error(error);
    errorMessage.value = t('alerts.messages.createError');
  }).finally(() => {
    saving.value = false;
  });
}

function updateAlert(alertId, action, actionLabel = 'Updated') {
  if (!iamStore.canManageAlerts) return;
  errorMessage.value = '';
  successMessage.value = '';
  action(alertId)
      .then(updated => {
        alerts.value = alerts.value.map(alert => alert.id === updated.id ? updated : alert);
        appendLog(`alert-${updated.id}`, `${actionLabel}: status ${updated.status}, severity ${updated.severity}`);
        successMessage.value = t('alerts.messages.updated');
      })
      .catch(error => {
        console.error(error);
        errorMessage.value = t('alerts.messages.updateError');
      });
}

function classify(alert, severity) {
  updateAlert(alert.id, () => alertsApi.classifyPriority(alert.id, severity), `Classified as ${severity}`);
}

function createIncident() {
  if (!iamStore.canManageAlerts) return;
  const companyId = iamStore.currentUser?.companyId;
  if (!companyId || !incidentForm.value.title.trim() || !incidentForm.value.description.trim()) {
    errorMessage.value = t('alerts.messages.incidentRequired');
    return;
  }

  saving.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  alertsApi.createIncident({
    title: incidentForm.value.title.trim(),
    description: incidentForm.value.description.trim(),
    priority: incidentForm.value.priority,
    companyId,
    relatedAlertId: incidentForm.value.relatedAlertId ? Number(incidentForm.value.relatedAlertId) : null,
  }).then(created => {
    incidents.value = [created, ...incidents.value];
    appendLog(`incident-${created.id}`, `Incident created with priority ${created.priority}`);
    incidentForm.value.description = '';
    successMessage.value = t('alerts.messages.incidentCreated');
  }).catch(error => {
    console.error(error);
    errorMessage.value = t('alerts.messages.incidentCreateError');
  }).finally(() => {
    saving.value = false;
  });
}

function closeIncident(incidentId) {
  if (!iamStore.canManageAlerts) return;
  alertsApi.closeIncident(incidentId)
      .then(updated => {
        incidents.value = incidents.value.map(incident => incident.id === updated.id ? updated : incident);
        appendLog(`incident-${updated.id}`, `Incident closed with status ${updated.status}`);
        successMessage.value = t('alerts.messages.incidentClosed');
      })
      .catch(error => {
        console.error(error);
        errorMessage.value = t('alerts.messages.incidentCloseError');
      });
}

function sensorLabel(sensorId) {
  const sensor = devicesStore.devices.find(device => device.id === sensorId);
  if (!sensor) return `${t('alerts.form.sensor')} ${sensorId}`;
  const zone = allZones.value.find(item => item.id === sensor.zoneId);
  return zone ? `${sensor.name} - ${zone.warehouseName} / ${zone.name}` : sensor.name;
}

function sensorInfo(sensorId) {
  const sensor = devicesStore.devices.find(device => device.id === sensorId);
  if (!sensor) {
    return {
      sensorName: `${t('alerts.form.sensor')} ${sensorId}`,
      warehouseName: '-',
      zoneName: '-'
    };
  }

  const zone = allZones.value.find(item => Number(item.id) === Number(sensor.zoneId));
  return {
    sensorName: sensor.name,
    warehouseName: zone?.warehouseName ?? '-',
    zoneName: zone?.name ?? '-'
  };
}

function appendLog(key, message) {
  const entry = `${new Date().toLocaleString()} - ${message}`;
  actionLog.value = {
    ...actionLog.value,
    [key]: [...(actionLog.value[key] ?? []), entry]
  };
}

function buildAlertLog(alert) {
  const info = sensorInfo(alert.sensorId);
  const lines = [
    'LockSight Alert Trace',
    `Alert ID: ${alert.id}`,
    `Type: ${alert.type}`,
    `Severity: ${alert.severity}`,
    `Status: ${alert.status}`,
    `Warehouse: ${info.warehouseName}`,
    `Zone: ${info.zoneName}`,
    `Sensor: ${info.sensorName}`,
    `Description: ${alert.description}`,
    `Triggered at: ${formatDate(alert.triggeredAt)}`,
    '',
    'Actions',
    ...(actionLog.value[`alert-${alert.id}`] ?? ['No session actions recorded.'])
  ];
  return lines.join('\n');
}

function buildIncidentLog(incident) {
  const relatedAlert = alerts.value.find(alert => Number(alert.id) === Number(incident.relatedAlertId));
  const lines = [
    'LockSight Incident Trace',
    `Incident ID: ${incident.id}`,
    `Title: ${incident.title}`,
    `Priority: ${incident.priority}`,
    `Status: ${incident.status}`,
    `Related alert: ${relatedAlert ? `${relatedAlert.type} #${relatedAlert.id}` : '-'}`,
    `Description: ${incident.description}`,
    `Created at: ${formatDate(incident.createdAt)}`,
    '',
    'Actions',
    ...(actionLog.value[`incident-${incident.id}`] ?? ['No session actions recorded.'])
  ];
  return lines.join('\n');
}

function downloadText(filename, content) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function downloadAlertTxt(alert) {
  downloadText(`alert-${alert.id}-trace.txt`, buildAlertLog(alert));
}

function downloadIncidentTxt(incident) {
  downloadText(`incident-${incident.id}-trace.txt`, buildIncidentLog(incident));
}

function printLog(title, content) {
  const win = window.open('', '_blank', 'width=820,height=900');
  if (!win) return;
  win.document.write(`
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #111827; }
          h1 { margin-top: 0; }
          pre { white-space: pre-wrap; font-size: 14px; line-height: 1.55; }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        <pre>${content.replace(/[&<>"']/g, value => ({
          '&': '&amp;',
          '<': '&lt;',
          '>': '&gt;',
          '"': '&quot;',
          "'": '&#39;'
        }[value]))}</pre>
      </body>
    </html>
  `);
  win.document.close();
  win.focus();
  win.print();
}

function downloadAlertPdf(alert) {
  printLog(`Alert ${alert.id} trace`, buildAlertLog(alert));
}

function downloadIncidentPdf(incident) {
  printLog(`Incident ${incident.id} trace`, buildIncidentLog(incident));
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
        <div><strong>{{ openIncidents }}</strong><span>{{ t('alerts.metrics.incidents') }}</span></div>
      </div>
    </header>

    <section v-if="iamStore.canManageAlerts" class="panel">
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
              {{ sensorLabel(device.id) }} - {{ device.type }}
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

    <section v-if="iamStore.canManageAlerts" class="panel">
      <h2>{{ t('alerts.incidents.title') }}</h2>
      <form class="incident-form" @submit.prevent="createIncident">
        <label>
          {{ t('alerts.incidents.name') }}
          <input v-model="incidentForm.title" type="text">
        </label>
        <label>
          {{ t('alerts.incidents.priority') }}
          <select v-model="incidentForm.priority">
            <option value="LOW">{{ t('alerts.severities.low') }}</option>
            <option value="MEDIUM">{{ t('alerts.severities.medium') }}</option>
            <option value="HIGH">{{ t('alerts.severities.high') }}</option>
          </select>
        </label>
        <label>
          {{ t('alerts.incidents.relatedAlert') }}
          <select v-model="incidentForm.relatedAlertId">
            <option :value="null">{{ t('alerts.incidents.noRelatedAlert') }}</option>
            <option v-for="alert in incidentAlertOptions" :key="alert.value" :value="alert.value">
              {{ alert.label }}
            </option>
          </select>
        </label>
        <label class="description-field">
          {{ t('alerts.form.description') }}
          <input v-model="incidentForm.description" :placeholder="t('alerts.incidents.descriptionPlaceholder')">
        </label>
        <button type="submit" :disabled="saving">{{ t('alerts.incidents.create') }}</button>
      </form>
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
            <dl class="alert-details">
              <div>
                <dt>Warehouse</dt>
                <dd>{{ sensorInfo(alert.sensorId).warehouseName }}</dd>
              </div>
              <div>
                <dt>Zone</dt>
                <dd>{{ sensorInfo(alert.sensorId).zoneName }}</dd>
              </div>
              <div>
                <dt>Sensor</dt>
                <dd>{{ sensorInfo(alert.sensorId).sensorName }}</dd>
              </div>
            </dl>
            <small>{{ formatDate(alert.triggeredAt) }}</small>
          </div>
          <div class="alert-side">
            <span class="status">{{ alert.status }}</span>
            <button v-if="iamStore.canManageAlerts" @click="updateAlert(alert.id, alertsApi.acknowledge.bind(alertsApi), t('alerts.actions.acknowledge'))">{{ t('alerts.actions.acknowledge') }}</button>
            <button v-if="iamStore.canManageAlerts" @click="updateAlert(alert.id, alertsApi.markAsAttended.bind(alertsApi), t('alerts.actions.attend'))">{{ t('alerts.actions.attend') }}</button>
            <button v-if="iamStore.canManageAlerts" @click="updateAlert(alert.id, alertsApi.escalate.bind(alertsApi), t('alerts.actions.escalate'))">{{ t('alerts.actions.escalate') }}</button>
            <button v-if="iamStore.canManageAlerts" @click="updateAlert(alert.id, alertsApi.flagAsFalseAlarm.bind(alertsApi), t('alerts.actions.falseAlarm'))">{{ t('alerts.actions.falseAlarm') }}</button>
            <button v-if="iamStore.canManageAlerts" @click="updateAlert(alert.id, alertsApi.resolve.bind(alertsApi), t('alerts.actions.resolve'))">{{ t('alerts.actions.resolve') }}</button>
            <button v-if="iamStore.canManageAlerts" @click="classify(alert, 'CRITICAL')">{{ t('alerts.actions.classifyCritical') }}</button>
            <button @click="downloadAlertTxt(alert)">TXT log</button>
            <button @click="downloadAlertPdf(alert)">PDF log</button>
          </div>
        </article>
      </div>
    </section>

    <section class="panel">
      <h2>{{ t('alerts.incidents.listTitle') }}</h2>
      <div v-if="!incidents.length" class="empty">{{ t('alerts.incidents.empty') }}</div>
      <div v-else class="alerts-list">
        <article v-for="incident in incidents" :key="incident.id" class="alert-card">
          <div class="alert-main">
            <span class="severity" :class="incident.priority.toLowerCase()">{{ incident.priority }}</span>
            <h3>{{ incident.title }}</h3>
            <p>{{ incident.description }}</p>
            <small>{{ formatDate(incident.createdAt) }}</small>
          </div>
          <div class="alert-side">
            <span class="status">{{ incident.status }}</span>
            <button v-if="iamStore.canManageAlerts" :disabled="incident.status === 'CLOSED'" @click="closeIncident(incident.id)">
              {{ t('alerts.incidents.close') }}
            </button>
            <button @click="downloadIncidentTxt(incident)">TXT log</button>
            <button @click="downloadIncidentPdf(incident)">PDF log</button>
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
.alert-form, .incident-form { display: grid; grid-template-columns: repeat(4, minmax(160px, 1fr)); gap: 0.9rem; align-items: end; }
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
.alert-details { display: grid; grid-template-columns: repeat(3, minmax(120px, 1fr)); gap: 0.55rem; margin: 0.75rem 0; }
.alert-details div { background: rgba(15, 23, 42, 0.75); border: 1px solid #1e2d42; border-radius: 6px; padding: 0.55rem; }
.alert-details dt { color: #94a3b8; font-size: 0.7rem; text-transform: uppercase; font-weight: 800; }
.alert-details dd { margin: 0.15rem 0 0; color: #e5eefb; font-size: 0.82rem; }
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
  .alert-form, .incident-form { grid-template-columns: 1fr; }
  .description-field { grid-column: auto; }
}
</style>
