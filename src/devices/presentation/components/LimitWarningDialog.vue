<script setup>
/**
 * @component LimitWarningDialog
 * @description Modal shown when the user attempts to exceed the device limit.
 * Offers a CTA to upgrade to Premium.
 */
const props = defineProps({
  visible: { type: Boolean, default: false },
});

const emit = defineEmits(['update:visible', 'upgrade']);

function onClose()   { emit('update:visible', false); }
function onUpgrade() { emit('upgrade'); }
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
    <div class="limit-dialog-body">
      <div class="limit-dialog-icon">
        <i class="pi pi-lock" />
      </div>

      <p class="limit-dialog-title">{{ $t('devices.limitDialog.title') }}</p>

      <p class="limit-dialog-description">
        {{ $t('devices.limitDialog.description') }}
      </p>

      <pv-button
          :label="$t('devices.limitDialog.upgrade')"
          class="limit-dialog-primary"
          style="background: #F59E0B; border-color: #F59E0B; color: #0F172A;"
          @click="onUpgrade"
      />

      <button
          class="limit-dialog-dismiss"
          @click="onClose"
      >
        {{ $t('devices.limitDialog.dismiss') }}
      </button>
    </div>
  </pv-dialog>
</template>

<style scoped>
.limit-dialog-body {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  text-align: center;
}

.limit-dialog-icon {
  align-items: center;
  background: #B45309;
  border-radius: 999px;
  color: #fff;
  display: flex;
  height: 56px;
  justify-content: center;
  width: 56px;
}

.limit-dialog-icon i {
  font-size: 1.4rem;
}

.limit-dialog-title {
  color: #fff;
  font-size: 1rem;
  font-weight: 800;
  margin: 0;
}

.limit-dialog-description {
  color: #94a3b8;
  font-size: 0.875rem;
  line-height: 1.5;
  margin: 0;
}

.limit-dialog-primary {
  font-weight: 700;
  width: 100%;
}

.limit-dialog-dismiss {
  background: transparent;
  border: 0;
  color: #94a3b8;
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.25rem;
}

.limit-dialog-dismiss:hover {
  color: #fff;
}
</style>
