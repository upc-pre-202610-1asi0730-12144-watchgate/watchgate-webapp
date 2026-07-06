<script setup>
import { computed, onMounted, ref } from 'vue';
import { useIamStore } from '../../../iam/application/iam.store.js';
import { ReportsApi } from '../../infrastructure/reports-api.js';
import { formatLimaDateTime } from '../../../shared/infrastructure/date-format.js';

const iamStore = useIamStore();
const api = new ReportsApi();
const dashboard = ref(null);
const reports = ref([]);
const events = ref([]);
const error = ref('');
const message = ref('');
const generating = ref(false);
const companyId = computed(() => iamStore.currentUser?.companyId);

async function load() {
  if (!companyId.value) return;
  error.value = '';
  try {
    const [dashboardResponse, reportsResponse, eventsResponse] = await Promise.all([
      api.getDashboard(companyId.value),
      api.getCompanyReports(companyId.value),
      api.getEventLog({ companyId: companyId.value })
    ]);
    dashboard.value = dashboardResponse.data;
    reports.value = reportsResponse.data;
    events.value = eventsResponse.data;
  } catch (e) {
    error.value = e.response?.data?.detail || e.message;
  }
}

async function generate() {
  if (!companyId.value) return;
  generating.value = true;
  message.value = '';
  error.value = '';
  try {
    const response = await api.generateReport({
      companyId: companyId.value,
      title: `Security report ${formatLimaDateTime(new Date())}`,
      from: new Date(Date.now() - 7 * 86400000).toISOString(),
      to: new Date().toISOString(),
      warehouseId: null
    });
    message.value = `Report #${response.data.id} generated. You can now open its PDF.`;
    await load();
  } catch (e) {
    error.value = e.response?.data?.detail || e.message;
  } finally {
    generating.value = false;
  }
}

async function openPdf(reportId) {
  error.value = '';
  try {
    await api.downloadPdf(reportId);
  } catch (e) {
    error.value = e.response?.data?.detail || e.message;
  }
}

onMounted(async () => {
  if (!iamStore.currentUser) await iamStore.restoreSession();
  await load();
});
</script>

<template>
  <main class="page-shell">
    <header class="page-header">
      <div>
        <h1>Reports Section</h1>
        <p>Event history, consolidated dashboard and generated reports.</p>
      </div>
      <button :disabled="generating" @click="generate">{{ generating ? 'Generating...' : 'Generate report' }}</button>
    </header>

    <p v-if="error" class="alert">{{ error }}</p>
    <p v-if="message" class="success">{{ message }}</p>

    <section v-if="dashboard" class="cards">
      <article><span>Total events</span><strong>{{ dashboard.totalEvents }}</strong></article>
      <article><span>Critical</span><strong>{{ dashboard.criticalEvents }}</strong></article>
      <article><span>Resolved</span><strong>{{ dashboard.resolvedEvents }}</strong></article>
      <article><span>Open</span><strong>{{ dashboard.openEvents }}</strong></article>
    </section>

    <section class="panel">
      <h2>Generated Reports</h2>
      <div class="row head"><span>Title</span><span>Events</span><span>Critical</span><span></span></div>
      <div v-for="report in reports" :key="report.id" class="row">
        <span>{{ report.title }}</span>
        <span>{{ report.totalEvents }}</span>
        <span>{{ report.criticalEvents }}</span>
        <button @click="openPdf(report.id)">PDF</button>
      </div>
    </section>

    <section class="panel">
      <h2>Event Log</h2>
      <div class="row head"><span>Type</span><span>Severity</span><span>Status</span><span>Date</span></div>
      <div v-for="event in events.slice(0, 12)" :key="`${event.source}-${event.id}`" class="row">
        <span>{{ event.type }}</span>
        <span>{{ event.severity }}</span>
        <span>{{ event.status }}</span>
        <span>{{ formatLimaDateTime(event.occurredAt) }}</span>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page-shell { padding: 2rem; color: #e5e7eb; }
.page-header { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 1.5rem; }
h1, h2, p { margin: 0; }
p, span { color: #94a3b8; }
button, a { background: #2563eb; border: 0; color: white; border-radius: 6px; padding: .65rem .9rem; text-decoration: none; cursor: pointer; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
.cards article, .panel { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 1rem; }
.cards strong { display: block; margin-top: .5rem; font-size: 1.7rem; color: #93c5fd; }
.panel { margin-bottom: 1rem; }
.row { display: grid; grid-template-columns: 1.3fr .7fr .7fr auto; gap: .75rem; align-items: center; padding: .7rem; background: #0f172a; border-radius: 6px; margin-top: .4rem; }
.head { color: #93c5fd; font-weight: 700; }
.alert { background: #7f1d1d; color: #fecaca; padding: .75rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
.success { background: #064e3b; color: #bbf7d0; padding: .75rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
</style>
