<script setup>
import { computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useWarehouseStore } from '../../application/warehouse.store.js';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const store = useWarehouseStore();
const warehouseId = computed(() => route.params.id);

const warehouse = computed(() => {
  return store.getWarehouseById(warehouseId.value);
});

onMounted(() => {
  if (!store.warehousesLoaded) {
    store.fetchWarehouses();
  }
});

const latestEvents = [
  { type: 'error',   label: t('events.door-open'),         time: '10:30 AM' },
  { type: 'warning', label: t('events.motion-detected'),   time: '09:50 AM' },
  { type: 'ok',      label: t('events.authorized-access'), time: '09:00 AM' }
];

function goBack() {
  router.push({ name: 'warehouse-list' });
}
</script>

<template>
  <div class="warehouse-detail-view">
    <p class="back-link" @click="goBack">← {{ t('warehouse-detail.back') }}</p>

    <h1 class="warehouse-name">{{ warehouse?.name ?? '...' }}</h1>

    <div class="status-container">
      <span class="status-badge">● {{ t('warehouse-detail.active') }}</span>
    </div>

    <div class="panels">
      <div class="panel">
        <h2 class="panel-title">{{ t('warehouse-detail.latest-events') }}</h2>
        <div class="event-list">
          <div
              v-for="(event, index) in latestEvents"
              :key="index"
              class="event-row"
          >
            <span class="event-dot" :class="'dot-' + event.type"></span>
            <span class="event-label" :class="'label-' + event.type">{{ event.label }}</span>
            <span class="event-time">{{ event.time }}</span>
          </div>
        </div>
      </div>

      <div class="panel">
        <h2 class="panel-title">{{ t('warehouse-detail.sensor-status') }}</h2>
        <div class="sensor-list">
          <div class="sensor-row">
            <span class="sensor-label">{{ t('warehouse-detail.main-door') }}</span>
            <span class="sensor-value">{{ t('warehouse-detail.door-closed') }}</span>
          </div>
          <div class="sensor-row">
            <span class="sensor-label">{{ t('warehouse-detail.motion-sensor') }}</span>
            <span class="sensor-value">{{ t('warehouse-detail.normal') }}</span>
          </div>
          <div class="sensor-row">
            <span class="sensor-label">{{ t('warehouse-detail.network') }}</span>
            <span class="sensor-value sensor-stable">{{ t('warehouse-detail.stable') }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="detail-actions">
      <button class="btn-primary">{{ t('warehouse-detail.view-realtime') }}</button>
      <button class="btn-outline">{{ t('warehouse-detail.view-history') }}</button>
    </div>
  </div>
</template>

<style scoped>
.warehouse-detail-view {
  color: #c8d6e5;
  width: 100%;
  text-align: left;
}

.back-link {
  color: #8a9bb0;
  font-size: 0.85rem;
  cursor: pointer;
  margin-bottom: 0.75rem;
  display: inline-block;
}

.back-link:hover {
  color: #fff;
}

.warehouse-name {
  font-size: 1.8rem;
  font-weight: 700;
  color: #fff;
  margin: 0.25rem 0 0.75rem;
  text-align: left;
}

.status-container {
  text-align: left;
  margin-bottom: 1.5rem;
}

.status-badge {
  display: inline-block;
  background-color: #1a3a1a;
  color: #2ecc71;
  padding: 0.3rem 0.85rem;
  border-radius: 20px;
  font-size: 0.82rem;
}

.panels {
  display: flex;
  gap: 1.25rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  justify-content: flex-start;
}

.panel {
  flex: 1;
  min-width: 260px;
  background-color: #102035;
  border: 1px solid #1e2d42;
  border-radius: 8px;
  padding: 1.25rem;
  text-align: left;
}

.panel-title {
  font-size: 0.95rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 1rem;
}

.event-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.event-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #1e2d42;
}

.event-row:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.event-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.dot-error   { background-color: #e74c3c; }
.dot-warning { background-color: #f39c12; }
.dot-ok      { background-color: #2ecc71; }

.event-label {
  flex: 1;
  font-size: 0.88rem;
}

.label-error   { color: #e74c3c; }
.label-warning { color: #f39c12; }
.label-ok      { color: #c8d6e5; }

.event-time {
  font-size: 0.82rem;
  color: #8a9bb0;
}

.sensor-list {
  display: flex;
  flex-direction: column;
}

.sensor-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #1e2d42;
}

.sensor-row:last-child {
  border-bottom: none;
}

.sensor-label {
  font-size: 0.88rem;
  color: #8a9bb0;
}

.sensor-value {
  font-size: 0.88rem;
  font-weight: 600;
  color: #fff;
}

.sensor-stable {
  color: #2ecc71;
}

.detail-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-start;
}

.btn-primary {
  background-color: #4da6ff;
  border: none;
  color: #fff;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-primary:hover {
  background-color: #3a90e8;
}

.btn-outline {
  background-color: transparent;
  border: 1px solid #4da6ff;
  color: #4da6ff;
  padding: 0.6rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-outline:hover {
  background-color: #1a3a5c;
}
</style>