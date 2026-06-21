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
      :style="{ width: '420px', background: '#1E293B', border: 'none' }"
      :pt="{ header: { style: 'background:#1E293B; border-bottom: 1px solid #334155;' },
               content: { style: 'background:#1E293B;' },
               footer:  { style: 'background:#1E293B;' } }"
  >
    <template #header>
      <div class="flex items-center gap-2">
        <i class="pi pi-arrow-left text-white cursor-pointer" @click="onClose" />
        <span class="text-white font-semibold text-base">{{ $t('devices.dialog.title') }}</span>
      </div>
    </template>

    <div class="flex flex-col gap-5 py-4">
      <div
          class="rounded-xl p-6 flex flex-col gap-4"
          style="background: #263146;"
      >
        <p class="text-white font-semibold text-sm">{{ $t('devices.dialog.sectionTitle') }}</p>

        <!-- Device Name -->
        <div class="flex flex-col gap-1">
          <label class="text-xs text-gray-400">{{ $t('devices.dialog.deviceName') }}</label>
          <pv-input-text
              v-model="form.name"
              :placeholder="$t('devices.dialog.deviceNamePlaceholder')"
              :class="['w-full text-sm', { 'p-invalid': touched.name && errors.name }]"
              :pt="{ root: { style: 'background:#1E293B; border-color:#334155; color:#fff;' } }"
              @blur="touchField('name')"
          />
          <small v-if="touched.name && errors.name" class="text-red-400 text-xs">
            {{ errors.name }}
          </small>
        </div>

        <!-- Sensor Type -->
        <div class="flex flex-col gap-1">
          <label class="text-xs text-gray-400">{{ $t('devices.dialog.typeLabel') }}</label>
          <pv-select
              v-model="form.type"
              :options="typeOptions"
              option-label="label"
              option-value="value"
              :placeholder="$t('devices.dialog.typePlaceholder')"
              :class="['w-full text-sm', { 'p-invalid': touched.type && errors.type }]"
              :pt="{ root: { style: 'background:#1E293B; border-color:#334155; color:#fff;' } }"
              @blur="touchField('type')"
              @change="touchField('type')"
          />
          <small v-if="touched.type && errors.type" class="text-red-400 text-xs">
            {{ errors.type }}
          </small>
        </div>

        <!-- Unit (optional) -->
        <div class="flex flex-col gap-1">
          <label class="text-xs text-gray-400">{{ $t('devices.dialog.unitLabel') }}</label>
          <pv-input-text
              v-model="form.unit"
              :placeholder="$t('devices.dialog.unitPlaceholder')"
              class="w-full text-sm"
              :pt="{ root: { style: 'background:#1E293B; border-color:#334155; color:#fff;' } }"
          />
        </div>

        <!-- Zone Dropdown (real WarehouseZone ids) -->
        <div class="flex flex-col gap-1">
          <label class="text-xs text-gray-400">{{ $t('devices.dialog.zone') }}</label>
          <pv-select
              v-model="form.zoneId"
              :options="zoneOptions"
              option-label="label"
              option-value="value"
              :placeholder="$t('devices.dialog.zonePlaceholder')"
              :class="['w-full text-sm', { 'p-invalid': touched.zoneId && errors.zoneId }]"
              :pt="{ root: { style: 'background:#1E293B; border-color:#334155; color:#fff;' } }"
              @blur="touchField('zoneId')"
              @change="touchField('zoneId')"
          />
          <small v-if="touched.zoneId && errors.zoneId" class="text-red-400 text-xs">
            {{ errors.zoneId }}
          </small>
          <small v-else-if="!zoneOptions.length" class="text-yellow-400 text-xs">
            {{ $t('devices.dialog.zoneEmpty') }}
          </small>
        </div>

        <!-- Submit button -->
        <pv-button
            :label="$t('devices.dialog.submit')"
            :loading="loading"
            :disabled="!isValid"
            class="w-full mt-2"
            style="background: #3B82F6; border-color: #3B82F6; font-weight: 600;"
            @click="onSubmit"
        />
      </div>
    </div>
  </pv-dialog>
</template>
