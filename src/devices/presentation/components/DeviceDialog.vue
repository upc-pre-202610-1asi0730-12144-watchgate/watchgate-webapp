<script setup>
/**
 * @component DeviceDialog
 * @description Modal form to register a new sensor (CreateSensorResource:
 * name, type, unit, zoneId). Validates required fields before emitting submit.
 */
import { reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  visible:  { type: Boolean, default: false },
  // Real WarehouseZone options: [{ label: 'Warehouse - Zone', value: zoneId }]
  zoneOptions: { type: Array, default: () => [] },
  loading:  { type: Boolean, default: false },
});

const emit = defineEmits(['update:visible', 'submit']);

const typeOptions = computed(() => [
  { label: t('devices.dialog.types.motion'), value: 'MOTION' },
  { label: t('devices.dialog.types.door'), value: 'DOOR' },
  { label: t('devices.dialog.types.temperature'), value: 'TEMPERATURE' },
  { label: t('devices.dialog.types.humidity'), value: 'HUMIDITY' },
  { label: t('devices.dialog.types.smoke'), value: 'SMOKE' },
]);

// ── Form state ──────────────────────────────────────────────────────────────
const form = reactive({
  name:   '',
  type:   null,
  unit:   '',
  zoneId: null,
});

const errors = reactive({
  name:   '',
  type:   '',
  zoneId: '',
});

const touched = reactive({
  name:   false,
  type:   false,
  zoneId: false,
});

// ── Validation ───────────────────────────────────────────────────────────────
function validate() {
  errors.name   = form.name.trim() ? '' : t('devices.dialog.errorRequired');
  errors.type   = form.type        ? '' : t('devices.dialog.errorRequired');
  errors.zoneId = form.zoneId      ? '' : t('devices.dialog.errorRequired');
  return !errors.name && !errors.type && !errors.zoneId;
}

const isValid = computed(() => form.name.trim() && form.type && form.zoneId);

function touchField(field) {
  touched[field] = true;
  validate();
}

// ── Actions ──────────────────────────────────────────────────────────────────
function onSubmit() {
  Object.keys(touched).forEach(k => (touched[k] = true));
  if (!validate()) return;
  emit('submit', { ...form, unit: form.unit.trim() || null });
}

function resetForm() {
  Object.assign(form,    { name: '', type: null, unit: '', zoneId: null });
  Object.assign(errors,  { name: '', type: '', zoneId: '' });
  Object.assign(touched, { name: false, type: false, zoneId: false });
}

function onClose() {
  emit('update:visible', false);
  resetForm();
}

defineExpose({ resetForm });
</script>

<template>
  <pv-dialog
      :visible="visible"
      @update:visible="onClose"
      modal
      :closable="true"
      :draggable="false"
      :style="{ width: 'min(720px, calc(100vw - 48px))', background: '#1E293B', border: 'none' }"
      :pt="{ header: { style: 'background:#1E293B; border-bottom: 1px solid #334155;' },
               content: { style: 'background:#1E293B;' },
               footer:  { style: 'background:#1E293B;' } }"
  >
    <template #header>
      <div class="device-dialog-header">
        <button class="device-dialog-back" type="button" @click="onClose" aria-label="Back">
          <i class="pi pi-arrow-left" />
        </button>
        <span>{{ $t('devices.dialog.title') }}</span>
      </div>
    </template>

    <div class="device-dialog-content">
      <div class="device-form-card">
        <p class="section-title">{{ $t('devices.dialog.sectionTitle') }}</p>

        <!-- Device Name -->
        <div class="device-field">
          <label>{{ $t('devices.dialog.deviceName') }}</label>
          <pv-input-text
              v-model="form.name"
              :placeholder="$t('devices.dialog.deviceNamePlaceholder')"
              :class="[{ 'p-invalid': touched.name && errors.name }]"
              :pt="{ root: { style: 'background:#1E293B; border-color:#334155; color:#fff;' } }"
              @blur="touchField('name')"
          />
          <small v-if="touched.name && errors.name" class="field-error">
            {{ errors.name }}
          </small>
        </div>

        <!-- Sensor Type -->
        <div class="device-field">
          <label>{{ $t('devices.dialog.typeLabel') }}</label>
          <pv-select
              v-model="form.type"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              :placeholder="$t('devices.dialog.typePlaceholder')"
              :class="[{ 'p-invalid': touched.type && errors.type }]"
              :pt="{ root: { style: 'background:#1E293B; border-color:#334155; color:#fff;' } }"
              @blur="touchField('type')"
              @change="touchField('type')"
          />
          <small v-if="touched.type && errors.type" class="field-error">
            {{ errors.type }}
          </small>
        </div>

        <!-- Unit (optional) -->
        <div class="device-field">
          <label>{{ $t('devices.dialog.unitLabel') }}</label>
          <pv-input-text
              v-model="form.unit"
              :placeholder="$t('devices.dialog.unitPlaceholder')"
              :pt="{ root: { style: 'background:#1E293B; border-color:#334155; color:#fff;' } }"
          />
        </div>

        <!-- Zone Dropdown (real WarehouseZone ids) -->
        <div class="device-field device-field-wide">
          <label>{{ $t('devices.dialog.zone') }}</label>
          <pv-select
              v-model="form.zoneId"
              :options="zoneOptions"
              option-label="label"
              option-value="value"
              :placeholder="$t('devices.dialog.zonePlaceholder')"
              :class="[{ 'p-invalid': touched.zoneId && errors.zoneId }]"
              :pt="{ root: { style: 'background:#1E293B; border-color:#334155; color:#fff;' } }"
              @blur="touchField('zoneId')"
              @change="touchField('zoneId')"
          />
          <small v-if="touched.zoneId && errors.zoneId" class="field-error">
            {{ errors.zoneId }}
          </small>
          <small v-else-if="!zoneOptions.length" class="field-hint">
            {{ $t('devices.dialog.zoneEmpty') }}
          </small>
        </div>

        <!-- Submit button -->
        <pv-button
            :label="$t('devices.dialog.submit')"
            :loading="loading"
            :disabled="!isValid"
            class="device-submit"
            style="background: #3B82F6; border-color: #3B82F6; font-weight: 600;"
            @click="onSubmit"
        />
      </div>
    </div>
  </pv-dialog>
</template>

<style scoped>
.device-dialog-header {
  align-items: center;
  color: #fff;
  display: flex;
  font-size: 1rem;
  font-weight: 700;
  gap: 0.75rem;
}

.device-dialog-back {
  align-items: center;
  background: transparent;
  border: 0;
  color: #fff;
  cursor: pointer;
  display: inline-flex;
  font-size: 1.1rem;
  height: 32px;
  justify-content: center;
  padding: 0;
  width: 32px;
}

.device-dialog-content {
  padding: 1.25rem 0 0.25rem;
}

.device-form-card {
  background: #263146;
  border-radius: 8px;
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  padding: 1.25rem;
  width: 100%;
}

.section-title {
  color: #fff;
  font-size: 0.95rem;
  font-weight: 700;
  grid-column: 1 / -1;
  margin: 0;
}

.device-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.device-field-wide,
.device-submit {
  grid-column: 1 / -1;
}

.device-field label {
  color: #94a3b8;
  font-size: 0.78rem;
  font-weight: 600;
}

.field-error {
  color: #f87171;
  font-size: 0.75rem;
}

.field-hint {
  color: #facc15;
  font-size: 0.75rem;
}

:deep(.p-inputtext),
:deep(.p-select),
:deep(.p-button) {
  box-sizing: border-box;
  min-width: 0;
  width: 100%;
}

@media (max-width: 680px) {
  .device-form-card {
    grid-template-columns: 1fr;
  }
}
</style>
