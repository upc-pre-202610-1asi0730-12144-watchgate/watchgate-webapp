<script setup>
import { onMounted, watch, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useIamStore } from '../../../iam/application/iam.store.js';
import { useWarehouseStore } from '../../../warehouse/application/warehouse.store.js';

const { t } = useI18n();
const router = useRouter();
const iamStore = useIamStore();
const warehouseStore = useWarehouseStore();
const { warehouses, warehousesLoaded, errors } = toRefs(warehouseStore);

function loadWarehouses() {
  if (!iamStore.sessionLoading && iamStore.currentUser?.companyId && !warehousesLoaded.value) {
    warehouseStore.fetchWarehouses(iamStore.currentUser.companyId);
  }
}

function goToHistory(warehouse) {
  router.push({ name: 'event-history-list', params: { id: warehouse.id } });
}

onMounted(loadWarehouses);

watch(() => iamStore.sessionLoading, (loading) => {
  if (!loading) loadWarehouses();
});
</script>

<template>
  <div class="history-overview">
    <header class="page-header">
      <div>
        <h1>{{ t('eventHistory.overview.title') }}</h1>
        <p>{{ t('eventHistory.overview.subtitle') }}</p>
      </div>
    </header>

    <p v-if="errors.length" class="message error">
      {{ t('eventHistory.overview.loadError') }}
    </p>

    <section class="panel">
      <div v-if="!warehousesLoaded" class="empty">{{ t('eventHistory.overview.loading') }}</div>
      <div v-else-if="!warehouses.length" class="empty">
        {{ t('eventHistory.overview.empty') }}
      </div>
      <div v-else class="warehouse-grid">
        <button
            v-for="warehouse in warehouses"
            :key="warehouse.id"
            class="warehouse-card"
            type="button"
            @click="goToHistory(warehouse)"
        >
          <strong>{{ warehouse.name }}</strong>
          <span>{{ warehouse.location || t('eventHistory.overview.noLocation') }}</span>
          <small>{{ t('eventHistory.overview.zoneCount', { count: warehouse.zones?.length ?? 0 }) }}</small>
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.history-overview { color: #e5eefb; display: flex; flex-direction: column; gap: 1.25rem; }
.page-header h1 { margin: 0 0 0.4rem; font-size: 1.6rem; }
.page-header p { margin: 0; color: #94a3b8; }
.panel { background: #102035; border: 1px solid #1e2d42; border-radius: 8px; padding: 1.25rem; }
.empty { color: #94a3b8; }
.warehouse-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 0.85rem; }
.warehouse-card {
  background: #0a1726;
  border: 1px solid #1e2d42;
  border-radius: 8px;
  color: #e5eefb;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  min-height: 110px;
  padding: 1rem;
  text-align: left;
}
.warehouse-card:hover { border-color: #3b82f6; }
.warehouse-card strong { font-size: 1rem; }
.warehouse-card span, .warehouse-card small { color: #94a3b8; }
.message { border-radius: 8px; padding: 0.8rem 1rem; margin: 0; }
.error { background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.35); }
</style>
