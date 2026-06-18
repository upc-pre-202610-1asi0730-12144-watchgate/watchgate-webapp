<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { useWarehouseStore } from '../../application/warehouse.store.js';

const { t } = useI18n();
const store = useWarehouseStore();

const emit = defineEmits(['close']);

const warehouseName = ref('');
const selectedCompanyId = ref(null);
const companies = ref([]);
const isLoading = ref(false);

onMounted(async () => {
  isLoading.value = true;
  try {
    const mockApiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const response = await axios.get(`${mockApiUrl}/companies`);
    companies.value = response.data;
  } catch (error) {
    console.error("Error cargando compañías del Mock API:", error);
  } finally {
    isLoading.value = false;
  }
});

const submitForm = () => {
  if (!warehouseName.value || !selectedCompanyId.value) {
    alert("Por favor completa todos los campos.");
    return;
  }

  const newWarehouse = {
    companyId: selectedCompanyId.value,
    name: warehouseName.value
  };

  store.addWarehouse(newWarehouse);

  closeModal();
};

const closeModal = () => {
  warehouseName.value = '';
  selectedCompanyId.value = null;
  emit('close');
};
</script>

<template>
  <div class="modal-overlay" @click.self="closeModal">
    <div class="modal-content">
      <h2 class="modal-title">Registrar Nuevo Almacén</h2>

      <form @submit.prevent="submitForm" class="form-container">
        <div class="form-group">
          <label class="form-label">Compañía a la que pertenece</label>
          <select
              v-model="selectedCompanyId"
              class="form-input select-input"
              required
              :disabled="isLoading"
          >
            <option :value="null" disabled>
              {{ isLoading ? 'Cargando compañías...' : 'Selecciona una compañía' }}
            </option>
            <option v-for="company in companies" :key="company.id" :value="company.id">
              {{ company.tradeName }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label class="form-label">Nombre del Almacén</label>
          <input
              type="text"
              v-model="warehouseName"
              class="form-input"
              placeholder="Ej. Almacén Central Norte"
              required
          />
        </div>

        <div class="modal-actions">
          <button type="button" class="btn-cancel" @click="closeModal">Cancelar</button>
          <button type="submit" class="btn-submit">Guardar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background-color: #102035;
  border: 1px solid #1e2d42;
  border-radius: 8px;
  padding: 2rem;
  width: 100%;
  max-width: 450px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.modal-title {
  color: #fff;
  font-size: 1.4rem;
  margin-top: 0;
  margin-bottom: 1.5rem;
  text-align: left;
}

.form-group {
  margin-bottom: 1.25rem;
  text-align: left;
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

.select-input {
  appearance: none;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
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
</style>