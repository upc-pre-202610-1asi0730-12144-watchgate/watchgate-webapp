<script setup>
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { eventHistoryStore } from '../../application/event-history.store.js';
import { useIamStore } from '../../../iam/application/iam.store.js';
import { useWarehouseStore } from '../../../warehouse/application/warehouse.store.js';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const iamStore = useIamStore();
const warehouseStore = useWarehouseStore();

const warehouseId = computed(() => route.params.id);
const warehouse = computed(() => warehouseStore.getWarehouseById(warehouseId.value));
const zones = computed(() => warehouse.value?.zones ?? []);

function goBack() {
  router.push({ name: 'warehouse-list' });
}

function zoneSensors(zoneId) {
  return eventHistoryStore.sensors.filter(sensor => Number(sensor.zoneId) === Number(zoneId));
}

function zoneEvents(zoneId) {
  const sensorIds = new Set(zoneSensors(zoneId).map(sensor => Number(sensor.id)));
  return eventHistoryStore.events
      .filter(event => !event.sensorId || sensorIds.has(Number(event.sensorId)))
      .slice(0, 6);
}

function secondsAgo(date) {
  const value = date instanceof Date ? date : new Date(date);
  return Math.max(1, Math.floor((Date.now() - value.getTime()) / 1000));
}

function relativeTime(seconds) {
  if (seconds < 60) return t('liveMonitoring.relative.seconds', { count: seconds });
  if (seconds < 3600) return t('liveMonitoring.relative.minutes', { count: Math.floor(seconds / 60) });
  return t('liveMonitoring.relative.hours', { count: Math.floor(seconds / 3600) });
}

function sensorPosition(sensor, index) {
  const seed = Number(sensor.id) || index + 1;
  return {
    left: `${12 + (seed * 31) % 76}%`,
    top: `${16 + (seed * 47) % 68}%`,
  };
}

function dotClass(sensor) {
  return sensor.status === 'ACTIVE' ? 'dot-green' : 'dot-red';
}

onMounted(async () => {
  const companyId = iamStore.currentUser?.companyId;
  if (!warehouseStore.warehousesLoaded && companyId) {
    await warehouseStore.fetchWarehouses(companyId);
  }

  await Promise.all([
    eventHistoryStore.loadEvents(warehouseId.value),
    eventHistoryStore.loadSensors(warehouseId.value),
  ]);
});
</script>

<template>
  <div class="live-page">
    <button class="back-link" type="button" @click="goBack">
      {{ t('liveMonitoring.back') }}
    </button>

    <header class="live-header">
      <div>
        <h1>{{ t('liveMonitoring.title') }}</h1>
        <p>{{ warehouse?.name ?? eventHistoryStore.currentWarehouse?.nombre ?? t('liveMonitoring.warehouseFallback') }}</p>
      </div>
      <span class="live-badge">LIVE</span>
    </header>

    <section v-if="zones.length" class="zone-list">
      <article v-for="zone in zones" :key="zone.id" class="zone-card">
        <div class="zone-title">
          <h2>{{ zone.name }}</h2>
          <span>{{ zone.riskLevel }}</span>
        </div>

        <div class="zone-content">
          <div class="map-panel">
            <div class="map">
              <div class="map-grid" />
              <div
                  v-for="(sensor, index) in zoneSensors(zone.id)"
                  :key="sensor.id"
                  class="sensor-pin"
                  :style="sensorPosition(sensor, index)"
              >
                <span :class="['sensor-dot', dotClass(sensor)]" />
                <span class="sensor-label">{{ sensor.getEtiquetaMapa() }}</span>
              </div>
              <p v-if="!zoneSensors(zone.id).length" class="map-empty">
                {{ t('liveMonitoring.emptySensors') }}
              </p>
            </div>
          </div>

          <aside class="log-panel">
            <h3>{{ t('liveMonitoring.consoleTitle') }}</h3>
            <ul>
              <li v-for="(entry, index) in zoneEvents(zone.id)" :key="entry.key" :class="{ latest: index === 0 }">
                <span>{{ relativeTime(secondsAgo(entry.occurredAt)) }}</span>
                <div>
                  <strong>{{ entry.heading }}</strong>
                  <small>{{ entry.description || entry.status }}</small>
                </div>
              </li>
              <li v-if="!zoneEvents(zone.id).length" class="empty-log">
                {{ t('liveMonitoring.emptyEvents') }}
              </li>
            </ul>
          </aside>
        </div>
      </article>
    </section>

    <p v-else class="empty-state">{{ t('liveMonitoring.emptyZones') }}</p>
  </div>
</template>

<style scoped>
.live-page {
  color: #e6edf3;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: calc(100vh - 140px);
  position: relative;
  width: 100%;
}

.back-link {
  align-self: flex-start;
  background: transparent;
  border: 0;
  color: #8b949e;
  cursor: pointer;
  font-size: 0.84rem;
  padding: 0;
}

.back-link:hover {
  color: #2d8cff;
}

.live-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 16px;
}

.live-header h1 {
  color: #e6edf3;
  font-size: 1.8rem;
  margin: 0;
}

.live-header p {
  color: #8b949e;
  margin: 4px 0 0;
}

.live-badge {
  animation: pulse 1.6s infinite;
  background: #ef4444;
  border-radius: 4px;
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  padding: 6px 12px;
}

@keyframes pulse {
  50% { opacity: 0.65; }
}

.zone-list {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.zone-card {
  background: #0f172a;
  border: 1px solid #21262d;
  border-radius: 10px;
  padding: 16px;
}

.zone-title {
  align-items: center;
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.zone-title h2 {
  font-size: 1rem;
  margin: 0;
}

.zone-title span {
  color: #94a3b8;
  font-size: 0.75rem;
  font-weight: 800;
}

.zone-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 16px;
}

.map-panel,
.log-panel {
  background: #161b22;
  border: 1px solid #21262d;
  border-radius: 10px;
  min-height: 260px;
  overflow: hidden;
}

.map {
  height: 260px;
  position: relative;
}

.map-grid {
  background-image:
      linear-gradient(rgba(45, 140, 255, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(45, 140, 255, 0.08) 1px, transparent 1px);
  background-size: 38px 38px;
  inset: 0;
  position: absolute;
}

.sensor-pin {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: absolute;
  transform: translate(-50%, -50%);
  z-index: 2;
}

.sensor-dot {
  border: 2px solid rgba(255, 255, 255, 0.4);
  border-radius: 999px;
  height: 16px;
  width: 16px;
}

.dot-green {
  background: #22c55e;
}

.dot-red {
  animation: alertPulse 1.2s infinite;
  background: #ef4444;
}

@keyframes alertPulse {
  50% { box-shadow: 0 0 18px #ef4444; }
}

.sensor-label {
  background: rgba(13, 17, 23, 0.88);
  border: 1px solid #30363d;
  border-radius: 4px;
  color: #e6edf3;
  font-size: 0.7rem;
  padding: 2px 6px;
  white-space: nowrap;
}

.map-empty {
  color: #8b949e;
  left: 50%;
  margin: 0;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
}

.log-panel {
  display: flex;
  flex-direction: column;
  padding: 14px;
}

.log-panel h3 {
  font-size: 0.9rem;
  margin: 0 0 10px;
}

.log-panel ul {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
  list-style: none;
  margin: 0;
  overflow-y: auto;
  padding: 0;
}

.log-panel li {
  border-bottom: 1px solid #21262d;
  display: flex;
  gap: 10px;
  padding: 8px;
}

.log-panel li.latest {
  background: rgba(45, 140, 255, 0.12);
  border-left: 3px solid #2d8cff;
}

.log-panel li > span {
  color: #6e7681;
  flex-shrink: 0;
  font-size: 0.72rem;
  min-width: 56px;
}

.log-panel strong,
.log-panel small {
  display: block;
}

.log-panel strong {
  color: #e6edf3;
  font-size: 0.82rem;
}

.log-panel small {
  color: #8b949e;
  font-size: 0.75rem;
}

.empty-log,
.empty-state {
  color: #8b949e;
  font-size: 0.85rem;
}

@media (max-width: 900px) {
  .zone-content {
    grid-template-columns: 1fr;
  }
}
</style>
