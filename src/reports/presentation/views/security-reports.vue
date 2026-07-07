<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { ReportsApi } from '../../infrastructure/reports-api.js';
import { useIamStore } from '../../../iam/application/iam.store.js';
import { useWarehouseStore } from '../../../warehouse/application/warehouse.store.js';

const reportsApi = new ReportsApi();
const { t } = useI18n();
const iamStore = useIamStore();
const warehouseStore = useWarehouseStore();

const dashboard = ref(null);
const reports = ref([]);
const scheduledReports = ref([]);
const loading = ref(false);
const generating = ref(false);
const scheduling = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const today = new Date().toISOString().slice(0, 10);
const previousWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

const form = ref({
  from: previousWeek,
  to: today,
  warehouseId: '',
  format: 'PDF',
});

const scheduleForm = ref({
  name: '',
  warehouseId: '',
  frequency: 'WEEKLY',
  format: 'PDF',
  recipientEmail: '',
  startsAt: today,
});

const warehouseOptions = computed(() => [
  { value: '', label: t('reports.form.allWarehouses') },
  ...warehouseStore.warehouses.map(warehouse => ({ value: warehouse.id, label: warehouse.name })),
]);

function loadReports() {
  const companyId = iamStore.currentUser?.companyId;
  if (!companyId) return Promise.resolve();

  loading.value = true;
  errorMessage.value = '';

  const warehousesPromise = warehouseStore.warehousesLoaded
      ? Promise.resolve()
      : warehouseStore.fetchWarehouses(companyId);

  return warehousesPromise
      .then(() => Promise.all([
        reportsApi.getDashboard(companyId),
        reportsApi.getReportsByCompanyId(companyId),
        reportsApi.getScheduledByCompanyId(companyId),
      ]))
      .then(([dashboardData, reportData, scheduledData]) => {
        dashboard.value = dashboardData;
        reports.value = reportData.sort((a, b) => new Date(b.generatedAt) - new Date(a.generatedAt));
        scheduledReports.value = scheduledData.sort((a, b) => new Date(b.startsAt) - new Date(a.startsAt));
      })
      .catch(error => {
        console.error(error);
        errorMessage.value = t('reports.messages.loadError');
      })
      .finally(() => {
        loading.value = false;
      });
}

function generateReport() {
  const companyId = iamStore.currentUser?.companyId;
  if (!companyId) return;

  generating.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  reportsApi.generate({
    companyId,
    warehouseId: form.value.warehouseId ? Number(form.value.warehouseId) : null,
    from: `${form.value.from}T00:00:00`,
    to: `${form.value.to}T23:59:59`,
    format: form.value.format,
  }).then(report => {
    reports.value = [report, ...reports.value];
    successMessage.value = t('reports.messages.generated');
    return reportsApi.getDashboard(companyId).then(data => { dashboard.value = data; });
  }).catch(error => {
    console.error(error);
    errorMessage.value = t('reports.messages.generateError');
  }).finally(() => {
    generating.value = false;
  });
}

function scheduleReport() {
  const companyId = iamStore.currentUser?.companyId;
  if (!companyId || !scheduleForm.value.name.trim() || !scheduleForm.value.recipientEmail.trim()) {
    errorMessage.value = t('reports.messages.scheduleRequired');
    return;
  }

  scheduling.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  reportsApi.schedule({
    companyId,
    warehouseId: scheduleForm.value.warehouseId ? Number(scheduleForm.value.warehouseId) : null,
    name: scheduleForm.value.name.trim(),
    frequency: scheduleForm.value.frequency,
    format: scheduleForm.value.format,
    recipientEmail: scheduleForm.value.recipientEmail.trim(),
    startsAt: `${scheduleForm.value.startsAt}T09:00:00`,
  }).then(report => {
    scheduledReports.value = [report, ...scheduledReports.value];
    successMessage.value = t('reports.messages.scheduled');
  }).catch(error => {
    console.error(error);
    errorMessage.value = t('reports.messages.scheduleError');
  }).finally(() => {
    scheduling.value = false;
  });
}

function saveBlob(response, filename) {
  const url = window.URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function downloadReport(report) {
  reportsApi.download(report.id).then(response => saveBlob(response, `locksight-report-${report.id}.txt`));
}

function exportPdf(report) {
  reportsApi.exportPdf(report.id).then(response => saveBlob(response, `locksight-report-${report.id}.pdf`));
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '-';
}

onMounted(() => {
  if (!iamStore.sessionLoading) loadReports();
});

watch(() => iamStore.sessionLoading, (loading) => {
  if (!loading) loadReports();
});
</script>

<template>
  <div class="reports-view">
    <header class="page-header">
      <div>
        <h1>{{ t('reports.title') }}</h1>
        <p>{{ t('reports.subtitle') }}</p>
      </div>
    </header>

    <section class="metrics">
      <div><strong>{{ dashboard?.totalEvents ?? 0 }}</strong><span>{{ t('reports.metrics.events') }}</span></div>
      <div><strong>{{ dashboard?.openEvents ?? 0 }}</strong><span>{{ t('reports.metrics.open') }}</span></div>
      <div><strong>{{ dashboard?.resolvedEvents ?? 0 }}</strong><span>{{ t('reports.metrics.resolved') }}</span></div>
      <div><strong>{{ dashboard?.criticalEvents ?? 0 }}</strong><span>{{ t('reports.metrics.critical') }}</span></div>
    </section>

    <section class="panel">
      <h2>{{ t('reports.form.generateTitle') }}</h2>
      <form class="report-form" @submit.prevent="generateReport">
        <label>
          {{ t('reports.form.from') }}
          <input v-model="form.from" type="date" />
        </label>
        <label>
          {{ t('reports.form.to') }}
          <input v-model="form.to" type="date" />
        </label>
        <label>
          {{ t('reports.form.warehouse') }}
          <select v-model="form.warehouseId">
            <option v-for="warehouse in warehouseOptions" :key="warehouse.value" :value="warehouse.value">
              {{ warehouse.label }}
            </option>
          </select>
        </label>
        <label>
          {{ t('reports.form.format') }}
          <select v-model="form.format">
            <option value="PDF">PDF</option>
            <option value="TXT">TXT</option>
          </select>
        </label>
        <button type="submit" :disabled="generating">{{ generating ? t('reports.actions.generating') : t('reports.actions.generate') }}</button>
      </form>
    </section>

    <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="message success">{{ successMessage }}</p>

    <section class="panel">
      <h2>{{ t('reports.schedule.title') }}</h2>
      <form class="schedule-form" @submit.prevent="scheduleReport">
        <label>
          {{ t('reports.schedule.name') }}
          <input v-model="scheduleForm.name" :placeholder="t('reports.schedule.namePlaceholder')" />
        </label>
        <label>
          {{ t('reports.schedule.frequency') }}
          <select v-model="scheduleForm.frequency">
            <option value="DAILY">{{ t('reports.schedule.daily') }}</option>
            <option value="WEEKLY">{{ t('reports.schedule.weekly') }}</option>
            <option value="MONTHLY">{{ t('reports.schedule.monthly') }}</option>
          </select>
        </label>
        <label>
          {{ t('reports.form.warehouse') }}
          <select v-model="scheduleForm.warehouseId">
            <option v-for="warehouse in warehouseOptions" :key="warehouse.value" :value="warehouse.value">
              {{ warehouse.label }}
            </option>
          </select>
        </label>
        <label>
          {{ t('reports.schedule.email') }}
          <input v-model="scheduleForm.recipientEmail" type="email" placeholder="operaciones@locksight.com" />
        </label>
        <label>
          {{ t('reports.schedule.start') }}
          <input v-model="scheduleForm.startsAt" type="date" />
        </label>
        <button type="submit" :disabled="scheduling">{{ scheduling ? t('reports.actions.scheduling') : t('reports.actions.schedule') }}</button>
      </form>
    </section>

    <section class="panel">
      <h2>{{ t('reports.generated.title') }}</h2>
      <div v-if="loading" class="empty">{{ t('reports.generated.loading') }}</div>
      <div v-else-if="!reports.length" class="empty">{{ t('reports.generated.empty') }}</div>
      <div v-else class="reports-list">
        <article v-for="report in reports" :key="report.id" class="report-card">
          <div>
            <h3>{{ report.title }}</h3>
            <p>
              {{ t('reports.generated.summary', { total: report.totalEvents, critical: report.criticalEvents, resolved: report.resolvedEvents }) }}
            </p>
            <small>{{ formatDate(report.generatedAt) }}</small>
          </div>
          <div class="actions">
            <span>{{ report.status }}</span>
            <button @click="downloadReport(report)">TXT</button>
            <button @click="exportPdf(report)">PDF</button>
          </div>
        </article>
      </div>
    </section>

    <section class="panel">
      <h2>{{ t('reports.scheduled.title') }}</h2>
      <div v-if="!scheduledReports.length" class="empty">{{ t('reports.scheduled.empty') }}</div>
      <div v-else class="reports-list">
        <article v-for="report in scheduledReports" :key="report.id" class="report-card">
          <div>
            <h3>{{ report.name }}</h3>
            <p>{{ report.frequency }} - {{ report.format }} - {{ report.recipientEmail }}</p>
            <small>{{ t('reports.scheduled.startsAt', { date: formatDate(report.startsAt) }) }}</small>
          </div>
          <div class="actions">
            <span>{{ report.isActive ? t('common.activeUpper') : t('common.inactiveUpper') }}</span>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.reports-view { color: #e5eefb; display: flex; flex-direction: column; gap: 1.25rem; }
h1, h2, h3, p { margin-top: 0; }
.page-header h1 { margin-bottom: 0.4rem; font-size: 1.6rem; }
.page-header p, .empty, small { color: #94a3b8; }
.metrics { display: grid; grid-template-columns: repeat(4, minmax(140px, 1fr)); gap: 0.75rem; }
.metrics div, .panel { background: #102035; border: 1px solid #1e2d42; border-radius: 8px; padding: 1.25rem; }
.metrics strong { display: block; color: #fff; font-size: 1.6rem; }
.metrics span { color: #94a3b8; font-size: 0.8rem; }
.panel h2 { font-size: 1rem; margin-bottom: 1rem; }
.report-form, .schedule-form { display: grid; grid-template-columns: repeat(5, minmax(130px, 1fr)); gap: 0.9rem; align-items: end; }
label { display: flex; flex-direction: column; gap: 0.35rem; color: #cbd5e1; font-size: 0.85rem; }
input, select { background: #0a1726; border: 1px solid #1e2d42; color: #fff; border-radius: 6px; min-height: 42px; padding: 0.65rem 0.75rem; }
button { background: #3b82f6; border: 0; border-radius: 6px; color: #fff; cursor: pointer; font-weight: 700; min-height: 42px; padding: 0.65rem 0.85rem; }
button:disabled { opacity: 0.65; cursor: progress; }
.message { border-radius: 8px; padding: 0.8rem 1rem; margin: 0; }
.error { background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.35); }
.success { background: rgba(34, 197, 94, 0.12); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.35); }
.reports-list { display: flex; flex-direction: column; gap: 0.75rem; }
.report-card { display: flex; justify-content: space-between; gap: 1rem; background: #0a1726; border: 1px solid #1e2d42; border-radius: 8px; padding: 1rem; }
.report-card h3 { margin-bottom: 0.4rem; font-size: 1rem; }
.report-card p { color: #cbd5e1; margin-bottom: 0.4rem; }
.actions { display: flex; align-items: center; gap: 0.5rem; }
.actions span { color: #93c5fd; font-size: 0.8rem; font-weight: 800; }
.actions button { background: transparent; border: 1px solid #334155; }
@media (max-width: 900px) {
  .metrics, .report-form, .schedule-form { grid-template-columns: 1fr; }
  .report-card { flex-direction: column; }
  .actions { justify-content: flex-start; }
}
</style>
