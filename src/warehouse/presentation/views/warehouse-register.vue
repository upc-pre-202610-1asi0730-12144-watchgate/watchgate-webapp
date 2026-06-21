<script setup>
/**
 * Warehouse Register View
 * @description
 * View with a form to register a new warehouse for the user's company.
 * On submit, creates the warehouse through the store and redirects back
 * to the warehouse list.
 */
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useWarehouseStore } from '../../application/warehouse.store.js';

const { t } = useI18n();
const router = useRouter();
const store = useWarehouseStore();
const { createWarehouse } = store;

const form = ref({
  name: '',
  location: '',
  capacity: null,
  operationStart: '',
  operationEnd: ''
});

const isSubmitting = ref(false);
const errorMessage = ref('');

function goToList() {
  router.push({ name: 'warehouse-list' });
}

function onSubmit() {
  errorMessage.value = '';

  if (!form.value.name || !form.value.location || !form.value.capacity) {
    errorMessage.value = t('warehouses.registerForm.errors.required');
    return;
  }

  isSubmitting.value = true;

  const warehouseData = {
    name: form.value.name,
    location: form.value.location,
    capacity: Number(form.value.capacity),
    operationStart: form.value.operationStart || null,
    operationEnd: form.value.operationEnd || null
  };

  createWarehouse(warehouseData)
      .then(() => {
        goToList();
      })
      .catch(error => {
        console.error(error);
        errorMessage.value = t('warehouses.registerForm.errors.creationFailed');
      })
      .finally(() => {
        isSubmitting.value = false;
      });
}
</script>

<template>
  <div class="warehouse-register-view">
    <h1 class="page-title">{{ t('warehouses.registerForm.title') }}</h1>
    <p class="page-subtitle">{{ t('warehouses.registerForm.subtitle') }}</p>

    <form class="register-form" @submit.prevent="onSubmit">
      <div class="field">
        <label>{{ t('warehouses.registerForm.nameLabel') }}</label>
        <pv-input-text
            v-model="form.name"
            type="text"
            :placeholder="t('warehouses.registerForm.namePlaceholder')"
            class="custom-input"
        />
      </div>

      <div class="field">
        <label>{{ t('warehouses.registerForm.locationLabel') }}</label>
        <pv-input-text
            v-model="form.location"
            type="text"
            :placeholder="t('warehouses.registerForm.locationPlaceholder')"
            class="custom-input"
        />
      </div>

      <div class="field">
        <label>{{ t('warehouses.registerForm.capacityLabel') }}</label>
        <pv-input-text
            v-model="form.capacity"
            type="number"
            min="0"
            :placeholder="t('warehouses.registerForm.capacityPlaceholder')"
            class="custom-input"
        />
      </div>

      <div class="field-row">
        <div class="field">
          <label>{{ t('warehouses.registerForm.operationStartLabel') }}</label>
          <pv-input-text
              v-model="form.operationStart"
              type="time"
              class="custom-input"
          />
        </div>

        <div class="field">
          <label>{{ t('warehouses.registerForm.operationEndLabel') }}</label>
          <pv-input-text
              v-model="form.operationEnd"
              type="time"
              class="custom-input"
          />
        </div>
      </div>

      <transition name="fade">
        <p v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </p>
      </transition>

      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="goToList">
          {{ t('warehouses.registerForm.cancel') }}
        </button>
        <pv-button
            type="submit"
            :label="t('warehouses.registerForm.submit')"
            :loading="isSubmitting"
            class="btn-submit"
        />
      </div>
    </form>
  </div>
</template>

<style scoped>
.warehouse-register-view {
  color: #c8d6e5;
  text-align: left;
  width: 100%;
  max-width: 480px;
}

.page-title {
  font-size: 1.6rem;
  font-weight: 700;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
  text-align: left;
}

.page-subtitle {
  color: #8a9bb0;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.1rem;
  background-color: #102035;
  border: 1px solid #1e2d42;
  border-radius: 8px;
  padding: 1.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.field label {
  color: #c8d6e5;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
}

.field-row {
  display: flex;
  gap: 1rem;
}

:deep(.custom-input) {
  width: 100%;
  background: #0a1726 !important;
  border: 1px solid #1e2d42 !important;
  color: white !important;
  border-radius: 6px !important;
  padding: 0.7rem 0.9rem !important;
}

:deep(.custom-input::placeholder) {
  color: #5b7290;
}

.error-message {
  color: #e74c3c;
  font-size: 0.85rem;
  margin: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-cancel {
  background-color: transparent;
  border: 1px solid #1e2d42;
  color: #c8d6e5;
  padding: 0.55rem 1.25rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: border-color 0.15s;
}

.btn-cancel:hover {
  border-color: #4da6ff;
}

:deep(.btn-submit) {
  background: #4da6ff !important;
  border: none !important;
  border-radius: 6px !important;
  padding: 0.55rem 1.25rem !important;
  font-weight: 600 !important;
  color: #fff !important;
}

:deep(.btn-submit:hover) {
  background: #3a90e8 !important;
}
</style>
