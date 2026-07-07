<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { AlertsApi } from '../../infrastructure/alerts-api.js';
import { useIamStore } from '../../../iam/application/iam.store.js';
import { useDevicesStore } from '../../../devices/application/devices.store.js';

const alertsApi = new AlertsApi();
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

const alertTypes = [
  { value: 'DOOR_OPEN', label: 'Puerta abierta' },
  { value: 'MOTION_DETECTED', label: 'Movimiento detectado' },
  { value: 'AFTER_HOURS_ACCESS', label: 'Acceso fuera de horario' },
  { value: 'CONNECTIVITY_FAILURE', label: 'Falla de conectividad' },
];

const severities = [
  { value: 'LOW', label: 'Baja' },
  { value: 'MEDIUM', label: 'Media' },
  { value: 'HIGH', label: 'Alta' },
  { value: 'CRITICAL', label: 'Critica' },
];

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
        errorMessage.value = 'No se pudieron cargar las alertas.';
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
    errorMessage.value = 'Completa sensor y descripcion.';
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
    successMessage.value = 'Alerta registrada correctamente.';
  }).catch(error => {
    console.error(error);
    errorMessage.value = 'No se pudo registrar la alerta.';
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
        successMessage.value = 'Alerta actualizada.';
      })
      .catch(error => {
        console.error(error);
        errorMessage.value = 'No se pudo actualizar la alerta.';
      });
}

function sensorLabel(sensorId) {
  const sensor = devicesStore.devices.find(device => device.id === sensorId);
  return sensor ? sensor.name : `Sensor ${sensorId}`;
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
        <h1>Alertas de seguridad</h1>
        <p>Registra, atiende y resuelve alertas reales del backend.</p>
      </div>
      <div class="metrics">
        <div><strong>{{ alerts.length }}</strong><span>Total</span></div>
        <div><strong>{{ openAlerts }}</strong><span>Abiertas</span></div>
        <div><strong>{{ criticalAlerts }}</strong><span>Criticas</span></div>
      </div>
    </header>

    <section class="panel">
      <h2>Nueva alerta</h2>
      <form class="alert-form" @submit.prevent="createAlert">
        <label>
          Tipo
          <select v-model="form.type">
            <option v-for="type in alertTypes" :key="type.value" :value="type.value">{{ type.label }}</option>
          </select>
        </label>
        <label>
          Severidad
          <select v-model="form.severity">
            <option v-for="severity in severities" :key="severity.value" :value="severity.value">{{ severity.label }}</option>
          </select>
        </label>
        <label>
          Sensor
          <select v-model="form.sensorId">
            <option :value="null">Selecciona un sensor</option>
            <option v-for="device in devicesStore.devices" :key="device.id" :value="device.id">
              {{ device.name }} - {{ device.type }}
            </option>
          </select>
        </label>
        <label class="description-field">
          Descripcion
          <input v-model="form.description" placeholder="Ej. Puerta principal abierta fuera de horario" />
        </label>
        <button type="submit" :disabled="saving">{{ saving ? 'Guardando...' : 'Registrar alerta' }}</button>
      </form>
      <p v-if="!devicesStore.devices.length" class="hint">Primero registra un almacen, una zona y un dispositivo IoT.</p>
    </section>

    <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="message success">{{ successMessage }}</p>

    <section class="panel">
      <h2>Alertas registradas</h2>
      <div v-if="loading" class="empty">Cargando alertas...</div>
      <div v-else-if="!alerts.length" class="empty">Aun no hay alertas registradas.</div>
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
            <button @click="updateAlert(alert.id, alertsApi.acknowledge.bind(alertsApi))">Acknowledge</button>
            <button @click="updateAlert(alert.id, alertsApi.markAsAttended.bind(alertsApi))">Atendida</button>
            <button @click="updateAlert(alert.id, alertsApi.escalate.bind(alertsApi))">Escalar</button>
            <button @click="updateAlert(alert.id, alertsApi.flagAsFalseAlarm.bind(alertsApi))">Falsa alarma</button>
            <button @click="updateAlert(alert.id, alertsApi.resolve.bind(alertsApi))">Resolver</button>
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
