<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useWarehouseStore } from '../../application/warehouse.store.js';

const { t } = useI18n();
const router = useRouter();
const route = useRoute();
const store = useWarehouseStore();

const warehouseId = computed(() => route.params.id);
const warehouse = computed(() => store.getWarehouseById(warehouseId.value));

const openingTime = ref('');
const closingTime = ref('');
const isSaving = ref(false);
const showSuccessMsg = ref(false);

/**
 * @param {string} timeString
 * @returns {string}
 */
function formatTimeToInput(timeString) {
  if (!timeString) return '';
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    const hours = parts[0].padStart(2, '0');
    const minutes = parts[1].substring(0, 2).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  return timeString;
}

watch(warehouse, (newWarehouse) => {
  if (newWarehouse) {
    openingTime.value = formatTimeToInput(newWarehouse.openingTime);
    closingTime.value = formatTimeToInput(newWarehouse.closingTime);
  }
}, { immediate: true });

onMounted(() => {
  if (!store.warehousesLoaded) {
    store.fetchWarehouses(store.currentCompanyId || 1);
  }
});

function goBack() {
  router.push({ name: 'warehouse-list' });
}

async function saveChanges() {
  isSaving.value = true;

  const hoursData = {
    openingTime: openingTime.value,
    closingTime: closingTime.value
  };

  const success = await store.updateHours(warehouseId.value, hoursData);

  isSaving.value = false;
  if (success) {
    showSuccessMsg.value = true;
    setTimeout(() => { showSuccessMsg.value = false; }, 3000);
  } else {
    alert(t('iam.recover.messages.error'));
  }
}
</script>
<template>
  <div class="warehouse-edit-view">
    <p class="back-link" @click="goBack">← {{ t('warehouse-edit.back') }}</p>

    <h1 class="page-title">{{ t('warehouse-edit.title') }}</h1>

    <div v-if="!warehouse" class="loading-msg">Cargando datos...</div>

    <div v-else class="edit-container">
      <div class="info-header">
        <div class="warehouse-icon"></div>
        <div>
          <h2 class="warehouse-name">{{ warehouse.name }}</h2>
          <p class="warehouse-status">Status: <span>{{ warehouse.status }}</span></p>
        </div>
      </div>

      <form @submit.prevent="saveChanges" class="form-container">
        <div class="form-group">
          <label class="form-label">{{ t('warehouse-edit.opening-time') }}</label>
          <input
              type="time"
              v-model="openingTime"
              class="form-input"
              required
          />
        </div>

        <div class="form-group">
          <label class="form-label">{{ t('warehouse-edit.closing-time') }}</label>
          <input
              type="time"
              v-model="closingTime"
              class="form-input"
              required
          />
        </div>

        <p v-if="showSuccessMsg" class="success-msg">{{ t('warehouse-edit.save-success') }}</p>

        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="goBack">{{ t('warehouse-edit.cancel') }}</button>
          <button type="submit" class="btn-submit" :disabled="isSaving">
            {{ isSaving ? t('warehouse-edit.saving') : t('warehouse-edit.save') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.warehouse-edit-view {
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

.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 1.5rem;
}

.edit-container {
  background-color: #102035;
  border: 1px solid #1e2d42;
  border-radius: 8px;
  padding: 2rem;
  max-width: 600px;
}

.info-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #1e2d42;
}

.warehouse-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background-color: #1e3a5f;
}

.warehouse-name {
  font-size: 1.2rem;
  color: #fff;
  margin: 0 0 0.2rem 0;
}

.warehouse-status {
  font-size: 0.85rem;
  color: #8a9bb0;
  margin: 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  color: #8a9bb0;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  background-color: #0f172a;
  border: 1px solid #1e2d42;
  color: #fff;
  padding: 0.65rem 1rem;
  border-radius: 6px;
  font-size: 0.95rem;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #4da6ff;
}

.form-input[type="time"]::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

.success-msg {
  color: #2ecc71;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-cancel {
  background-color: transparent;
  border: 1px solid #4da6ff;
  color: #4da6ff;
  padding: 0.55rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-cancel:hover {
  background-color: #1a3a5c;
}

.btn-submit {
  background-color: #4da6ff;
  color: #fff;
  border: none;
  padding: 0.55rem 1.25rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.btn-submit:hover {
  background-color: #3a90e8;
}
.btn-submit:disabled {
  background-color: #3a5c80;
  cursor: not-allowed;
}
</style>