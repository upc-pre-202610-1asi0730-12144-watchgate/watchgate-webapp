<script setup>
/**
 * @component SuccessDialog
 * @description Confirmation modal shown after a device is successfully linked.
 */
const props = defineProps({
  visible:     { type: Boolean, default: false },
  deviceName:  { type: String,  default: '' },
  zone:        { type: String,  default: '' },
});

const emit = defineEmits(['update:visible']);

function onClose() { emit('update:visible', false); }
</script>

<template>
  <pv-dialog
      :visible="visible"
      @update:visible="onClose"
      modal
      :closable="false"
      :draggable="false"
      :show-header="false"
      :style="{ width: '320px', background: '#1E293B', border: 'none', borderRadius: '16px' }"
      :pt="{ content: { style: 'background:#1E293B; padding: 2rem; border-radius: 16px;' } }"
  >
    <div class="success-dialog-body">
      <div class="success-dialog-icon">
        <i class="pi pi-check" />
      </div>

      <p class="success-dialog-title">{{ $t('devices.successDialog.title') }}</p>

      <p class="success-dialog-description">
        {{ $t('devices.successDialog.description', { zone }) }}
      </p>

      <pv-button
          :label="$t('devices.successDialog.confirm')"
          class="success-dialog-primary"
          style="background: #22C55E; border-color: #22C55E; color: #0F172A;"
          @click="onClose"
      />
    </div>
  </pv-dialog>
</template>

<style scoped>
.success-dialog-body {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
}

.success-dialog-icon {
  align-items: center;
  background: #16A34A;
  border-radius: 999px;
  color: #fff;
  display: flex;
  height: 56px;
  justify-content: center;
  width: 56px;
}

.success-dialog-icon i {
  font-size: 1.4rem;
}

.success-dialog-title {
  color: #fff;
  font-size: 1rem;
  font-weight: 800;
  margin: 0;
}

.success-dialog-description {
  color: #94a3b8;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.success-dialog-primary {
  font-weight: 700;
  width: 100%;
}
</style>
