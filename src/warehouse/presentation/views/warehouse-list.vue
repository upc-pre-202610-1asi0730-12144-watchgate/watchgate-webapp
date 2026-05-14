<script setup>
import { onMounted, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useWarehouseStore } from '../../application/warehouse.store.js';

const { t } = useI18n();
const router = useRouter();
const store = useWarehouseStore();
const { warehouses, warehousesLoaded, errors } = toRefs(store);
const { fetchWarehouses } = store;

onMounted(() => {
  if (!warehousesLoaded.value) {
    fetchWarehouses();
  }
});

function goToDetail(warehouseId) {
  router.push({ name: 'warehouse-detail', params: { id: warehouseId } });
}

function goToRegister() {
  router.push({ name: 'warehouse-register' });
}
</script>

<template>
  <div class="warehouse-list-view">
    <h1 class="page-title">{{ t('warehouses.title') }}</h1>

    <button class="btn-register" @click="goToRegister">
      {{ t('warehouses.register') }}
    </button>

    <div v-if="errors.length" class="text-red-500 mb-3">
      {{ t('errors.occurred') }}: {{ errors.map(e => e.message).join(', ') }}
    </div>

    <div class="warehouse-list">
      <p v-if="!warehousesLoaded" class="empty-msg">Cargando...</p>
      <p v-else-if="warehouses.length === 0" class="empty-msg">
        {{ t('warehouses.no-warehouses') }}
      </p>

      <div
          v-for="warehouse in warehouses"
          :key="warehouse.id"
          class="warehouse-card"
          :class="{ 'is-critical': warehouse.hasIncident }"
      >
        <div class="warehouse-icon" :class="{ 'icon-critical': warehouse.hasIncident }"></div>

        <div class="warehouse-info">
          <p class="warehouse-name">{{ warehouse.name }}</p>
          <p
              class="warehouse-status"
              :class="{
                                'status-active':   warehouse.status === 'active',
                                'status-critical': warehouse.status === 'critical'
                            }"
          >
            ●
            <span v-if="warehouse.status === 'active'">
                                {{ t('warehouses.status.active') }}
                            </span>
            <span v-else-if="warehouse.status === 'critical'">
                                {{ t('warehouses.status.critical-alert') }}
                            </span>
            <span v-else>
                                {{ t('warehouses.status.inactive') }}
                            </span>
          </p>
        </div>

        <div class="warehouse-event">
          <p v-if="!warehouse.hasIncident" class="event-label">
            {{ t('warehouses.last-event') }}
          </p>
          <p v-else class="event-label incident">
            {{ t('warehouses.incident-detected') }}
          </p>
          <p class="event-message">{{ warehouse.lastEventMessage }}</p>
        </div>

        <div class="warehouse-actions">
          <button
              v-if="!warehouse.hasIncident"
              class="btn-detail"
              @click="goToDetail(warehouse.id)"
          >
            {{ t('warehouses.view-detail') }}
          </button>
          <button
              v-else
              class="btn-attend"
              @click="goToDetail(warehouse.id)"
          >
            {{ t('warehouses.attend') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.warehouse-list-view {
  color: #c8d6e5;
  text-align: left;
  width: 100%;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 1.25rem;
  text-align: left;
}

.btn-register {
  background-color: #4da6ff;
  color: #fff;
  border: none;
  padding: 0.55rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: background-color 0.15s;
}

.btn-register:hover {
  background-color: #3a90e8;
}

.warehouse-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.empty-msg {
  color: #8a9bb0;
}

.warehouse-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #102035;
  border: 1px solid #1e2d42;
  border-radius: 8px;
  padding: 1rem 1.25rem;
  transition: border-color 0.15s;
}

.warehouse-card.is-critical {
  border-color: #e74c3c;
  box-shadow: 0 0 0 1px #e74c3c;
}

.warehouse-icon {
  width: 44px;
  height: 44px;
  border-radius: 6px;
  background-color: #1e3a5f;
  flex-shrink: 0;
}

.warehouse-icon.icon-critical {
  background-color: #7a1a1a;
}

.warehouse-info {
  min-width: 180px;
}

.warehouse-name {
  font-weight: 600;
  color: #fff;
  margin: 0 0 0.25rem;
}

.warehouse-status {
  font-size: 0.82rem;
  margin: 0;
}

.status-active {
  color: #2ecc71;
}

.status-critical {
  color: #e74c3c;
}

.warehouse-event {
  flex: 1;
}

.event-label {
  font-size: 0.78rem;
  color: #8a9bb0;
  margin: 0 0 0.2rem;
}

.event-label.incident {
  color: #e74c3c;
}

.event-message {
  font-size: 0.88rem;
  color: #c8d6e5;
  margin: 0;
}

.warehouse-actions {
  flex-shrink: 0;
}

.btn-detail {
  background-color: transparent;
  border: 1px solid #4da6ff;
  color: #4da6ff;
  padding: 0.45rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-detail:hover {
  background-color: #1a3a5c;
}

.btn-attend {
  background-color: #e74c3c;
  border: none;
  color: #fff;
  padding: 0.45rem 1rem;
  border-radius: 6px;
  font-size: 0.85rem;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-attend:hover {
  background-color: #c0392b;
}
</style>