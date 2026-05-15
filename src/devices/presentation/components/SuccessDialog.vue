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
    <div class="flex flex-col items-center gap-4 text-center">
      <!-- Success icon -->
      <div
          class="flex items-center justify-center rounded-full"
          style="width: 56px; height: 56px; background: #16A34A;"
      >
        <i class="pi pi-check text-white" style="font-size: 1.4rem;" />
      </div>

      <!-- Title -->
      <p class="text-white font-bold text-base">{{ $t('devices.successDialog.title') }}</p>

      <!-- Description -->
      <p class="text-gray-400 text-sm leading-relaxed">
        {{ $t('devices.successDialog.description', { zone }) }}
      </p>

      <!-- Confirm button -->
      <pv-button
          :label="$t('devices.successDialog.confirm')"
          class="w-full font-semibold"
          style="background: #22C55E; border-color: #22C55E; color: #0F172A;"
          @click="onClose"
      />
    </div>
  </pv-dialog>
</template>