<script setup>
/**
 * @component DeviceDialog
 * @description Modal form to register (link) a new IoT device.
 * Validates all fields before emitting the submit event.
 */
import { ref, reactive, computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps({
  visible:  { type: Boolean, default: false },
  zones:    { type: Array,   default: () => ['Zona A', 'Zona B', 'Zona C'] },
  loading:  { type: Boolean, default: false },
});

const emit = defineEmits(['update:visible', 'submit']);

// ── Form state ──────────────────────────────────────────────────────────────
const form = reactive({
  serialNumber: '',
  name:         '',
  zone:         null,
});

const errors = reactive({
  serialNumber: '',
  name:         '',
  zone:         '',
});

const touched = reactive({
  serialNumber: false,
  name:         false,
  zone:         false,
});

// ── Validation ───────────────────────────────────────────────────────────────
function validate() {
  errors.serialNumber = form.serialNumber.trim() ? '' : t('devices.dialog.errorRequired');
  errors.name         = form.name.trim()         ? '' : t('devices.dialog.errorRequired');
  errors.zone         = form.zone                ? '' : t('devices.dialog.errorRequired');
  return !errors.serialNumber && !errors.name && !errors.zone;
}

const isValid = computed(() => form.serialNumber.trim() && form.name.trim() && form.zone);

function touchField(field) {
  touched[field] = true;
  validate();
}

// ── Actions ──────────────────────────────────────────────────────────────────
function onSubmit() {
  Object.keys(touched).forEach(k => (touched[k] = true));
  if (!validate()) return;
  emit('submit', { ...form });
}

function onClose() {
  emit('update:visible', false);
  // Reset form
  Object.assign(form,   { serialNumber: '', name: '', zone: null });
  Object.assign(errors, { serialNumber: '', name: '', zone: '' });
  Object.assign(touched, { serialNumber: false, name: false, zone: false });
}

const zoneOptions = computed(() => props.zones.map(z => ({ label: z, value: z })));
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

        <!-- Serial Number -->
        <div class="flex flex-col gap-1">
          <label class="text-xs text-gray-400">{{ $t('devices.dialog.serialNumber') }}</label>
          <pv-input-text
              v-model="form.serialNumber"
              :placeholder="$t('devices.dialog.serialNumberPlaceholder')"
              :class="['w-full text-sm', { 'p-invalid': touched.serialNumber && errors.serialNumber }]"
              :pt="{ root: { style: 'background:#1E293B; border-color:#334155; color:#fff;' } }"
              @blur="touchField('serialNumber')"
          />
          <small v-if="touched.serialNumber && errors.serialNumber" class="text-red-400 text-xs">
            {{ errors.serialNumber }}
          </small>
        </div>

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

        <!-- Zone Dropdown -->
        <div class="flex flex-col gap-1">
          <label class="text-xs text-gray-400">{{ $t('devices.dialog.zone') }}</label>
          <pv-select
              v-model="form.zone"
              :options="zoneOptions"
              option-label="label"
              option-value="value"
              :placeholder="$t('devices.dialog.zonePlaceholder')"
              :class="['w-full text-sm', { 'p-invalid': touched.zone && errors.zone }]"
              :pt="{ root: { style: 'background:#1E293B; border-color:#334155; color:#fff;' } }"
              @blur="touchField('zone')"
              @change="touchField('zone')"
          />
          <small v-if="touched.zone && errors.zone" class="text-red-400 text-xs">
            {{ errors.zone }}
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