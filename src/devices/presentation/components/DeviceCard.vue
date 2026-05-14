<script setup>
import { computed } from 'vue';

const props = defineProps({
  device: { type: Object, required: true },
});

const deviceIcon = computed(() =>
    props.device.type === 'Sensor' ? 'pi-wifi' : 'pi-video'
);
const statusColor = computed(() =>
    props.device.isOnline ? '#22C55E' : '#EF4444'
);
const statusLabel = computed(() =>
    props.device.isOnline ? 'Online' : 'Offline'
);
</script>

<template>
  <div style="display:flex;align-items:center;gap:12px;padding:12px 16px;
                background:#1E293B;border-radius:10px;min-width:0;">
    <!-- Icon -->
    <div style="width:40px;height:40px;min-width:40px;background:#0F172A;
                    border-radius:8px;display:flex;align-items:center;justify-content:center;">
      <i :class="`pi ${deviceIcon}`" style="font-size:1rem;color:#94A3B8;" />
    </div>
    <!-- Info -->
    <div style="flex:1;min-width:0;overflow:hidden;">
      <p style="margin:0;color:#fff;font-size:0.85rem;font-weight:600;
                      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
        {{ device.name }}
      </p>
      <p style="margin:0;color:#94A3B8;font-size:0.75rem;
                      white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
        {{ device.zone }}
      </p>
    </div>
    <!-- Status -->
    <div style="display:flex;align-items:center;gap:6px;flex-shrink:0;">
            <span style="width:8px;height:8px;border-radius:50%;display:inline-block;"
                  :style="{ background: statusColor }" />
      <span style="font-size:0.75rem;font-weight:500;" :style="{ color: statusColor }">
                {{ statusLabel }}
            </span>
    </div>
  </div>
</template>