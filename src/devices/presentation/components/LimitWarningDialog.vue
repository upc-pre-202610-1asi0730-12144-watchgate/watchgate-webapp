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
    <div class="flex flex-col items-center gap-4 text-center">
      <!-- Lock icon -->
      <div
          class="flex items-center justify-center rounded-full"
          style="width: 56px; height: 56px; background: #B45309;"
      >
        <i class="pi pi-lock text-white" style="font-size: 1.4rem;" />
      </div>

      <!-- Title -->
      <p class="text-white font-bold text-base">{{ $t('devices.limitDialog.title') }}</p>

      <!-- Description -->
      <p class="text-gray-400 text-sm leading-relaxed">
        {{ $t('devices.limitDialog.description') }}
      </p>

      <!-- Upgrade CTA -->
      <pv-button
          :label="$t('devices.limitDialog.upgrade')"
          class="w-full font-semibold"
          style="background: #F59E0B; border-color: #F59E0B; color: #0F172A;"
          @click="onUpgrade"
      />

      <!-- Dismiss -->
      <button
          class="text-gray-400 hover:text-white text-sm transition-colors"
          @click="onClose"
      >
        {{ $t('devices.limitDialog.dismiss') }}
      </button>
    </div>
  </pv-dialog>
</template>