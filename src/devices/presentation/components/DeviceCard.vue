<script setup>
import { computed } from 'vue';

const props = defineProps({
  device: { type: Object, required: true },
  zoneLabel: { type: String, default: '' },
});

const emit = defineEmits(['toggle-status', 'record-reading', 'unlink']);

const TYPE_ICONS = {
  MOTION: 'pi-directions',
  DOOR: 'pi-lock',
  TEMPERATURE: 'pi-sun',
  HUMIDITY: 'pi-cloud',
  SMOKE: 'pi-exclamation-triangle',
};

const deviceIcon = computed(() => TYPE_ICONS[props.device.type] ?? 'pi-wifi');
const statusColor = computed(() => props.device.isOnline ? '#22C55E' : '#EF4444');
const statusLabel = computed(() => props.device.isOnline ? 'Online' : 'Offline');
const subtitle = computed(() => props.zoneLabel || `Zone #${props.device.zoneId}`);
const readingLabel = computed(() => {
  if (props.device.lastReading === null || props.device.lastReading === undefined) return '';
  return `${props.device.lastReading}${props.device.unit ? ' ' + props.device.unit : ''}`;
});
</script>

<template>
  <div class="device-card">
    <div class="device-icon">
      <i :class="`pi ${deviceIcon}`" />
    </div>

    <div class="device-info">
      <p class="device-name">{{ device.name }}</p>
      <p class="device-subtitle">
        {{ subtitle }}<span v-if="readingLabel"> - {{ readingLabel }}</span>
      </p>
    </div>

    <div class="device-status">
      <span class="status-dot" :style="{ background: statusColor }" />
      <span :style="{ color: statusColor }">{{ statusLabel }}</span>
    </div>

    <div class="device-actions">
      <button type="button" :title="$t('devices.actions.recordReading')" @click="emit('record-reading', device)">
        <i class="pi pi-chart-line" />
      </button>
      <button type="button" :title="$t('devices.actions.toggleStatus')" @click="emit('toggle-status', device)">
        <i class="pi pi-power-off" />
      </button>
      <button type="button" :title="$t('devices.actions.unlink')" @click="emit('unlink', device)">
        <i class="pi pi-times" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.device-card {
  align-items: center;
  background: #1e293b;
  border-radius: 8px;
  display: flex;
  gap: 12px;
  min-width: 0;
  padding: 12px 16px;
}

.device-icon {
  align-items: center;
  background: #0f172a;
  border-radius: 8px;
  color: #94a3b8;
  display: flex;
  flex-shrink: 0;
  height: 40px;
  justify-content: center;
  width: 40px;
}

.device-info {
  flex: 1;
  min-width: 0;
  overflow: hidden;
}

.device-name {
  color: #fff;
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-subtitle {
  color: #94a3b8;
  font-size: 0.75rem;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.device-status {
  align-items: center;
  display: flex;
  flex-shrink: 0;
  font-size: 0.75rem;
  font-weight: 500;
  gap: 6px;
}

.status-dot {
  border-radius: 50%;
  display: inline-block;
  height: 8px;
  width: 8px;
}

.device-actions {
  display: flex;
  flex-shrink: 0;
  gap: 0.35rem;
}

.device-actions button {
  align-items: center;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #cbd5e1;
  cursor: pointer;
  display: inline-flex;
  height: 32px;
  justify-content: center;
  width: 32px;
}

.device-actions button:hover {
  border-color: #3b82f6;
  color: #fff;
}
</style>
