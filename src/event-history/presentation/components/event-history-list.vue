<script setup lang="js">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import {
  eventHistoryStore,
  groupedByDate,
} from '../../application/event-history.store.js'
import { useWarehouseStore } from '../../../warehouse/application/warehouse.store.js'

const route = useRoute()
const { t } = useI18n()
const warehouseStore = useWarehouseStore()

const opcionesTipo = computed(() => [
  { label: t('eventHistory.filters.severity'), value: 'todos' },
  { label: t('alerts.severities.high'), value: 'HIGH' },
  { label: t('alerts.severities.medium'), value: 'MEDIUM' },
  { label: t('alerts.severities.low'), value: 'LOW' },
])

const opcionesCategoria = computed(() => [
  { label: t('eventHistory.filters.allEvents'), value: 'todos' },
  { label: t('eventHistory.filters.alerts'), value: 'alert' },
  { label: t('eventHistory.filters.incidents'), value: 'incident' },
])

const opcionesPeriodo = computed(() => [
  { label: t('eventHistory.filters.last7Days'), value: '7dias' },
  { label: t('eventHistory.filters.today'), value: 'hoy' },
  { label: t('eventHistory.filters.last30Days'), value: '30dias' },
])

const currentWarehouse = computed(() => warehouseStore.getWarehouseById(route.params.id))
const zoneOptions = computed(() => [
  { label: t('eventHistory.filters.allZones'), value: 'todos' },
  ...(currentWarehouse.value?.zones ?? []).map(zone => ({
    label: zone.name,
    value: zone.id,
  })),
])

onMounted(async () => {
  const warehouseId = route.params.id ?? '1'
  await Promise.all([
    eventHistoryStore.loadEvents(warehouseId),
    eventHistoryStore.loadSensors(warehouseId),
  ])

  const warehouse = warehouseStore.getWarehouseById(warehouseId)
  if (warehouse) {
    eventHistoryStore.setWarehouse({
      id: warehouse.id,
      nombre: warehouse.name,
      estado: warehouse.status,
      zones: warehouse.zones,
    })
  }
})

const onTipoChange = (e) => { eventHistoryStore.filterType = e.target.value }
const onCategoriaChange = (e) => { eventHistoryStore.filterKind = e.target.value }
const onPeriodoChange = (e) => { eventHistoryStore.filterPeriod = e.target.value }
const onFechaChange = (e) => { eventHistoryStore.filterDate = e.target.value }
const onZonaChange = (e) => { eventHistoryStore.filterZoneId = e.target.value }

const mostrarBadgeAlerta = (evento) => evento.esAlerta()
</script>

<template>
  <div class="ehl-page">
    <div class="ehl-header">
      <div class="ehl-header-left">
        <h1 class="ehl-title">{{ t('eventHistory.title') }}</h1>
        <span class="ehl-warehouse-badge">
          {{ eventHistoryStore.currentWarehouse?.nombre ?? t('eventHistory.selectWarehouse') }}
          <i class="pi pi-chevron-down" style="font-size: 0.7rem;" />
        </span>
      </div>
    </div>

    <div class="ehl-filters">
      <select class="ehl-select" :value="eventHistoryStore.filterKind" @change="onCategoriaChange">
        <option v-for="opt in opcionesCategoria" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <select class="ehl-select" :value="eventHistoryStore.filterType" @change="onTipoChange">
        <option v-for="opt in opcionesTipo" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <select class="ehl-select" :value="eventHistoryStore.filterPeriod" @change="onPeriodoChange">
        <option v-for="opt in opcionesPeriodo" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <input
          class="ehl-select"
          type="date"
          :value="eventHistoryStore.filterDate"
          @input="onFechaChange"
      />
      <select class="ehl-select" :value="eventHistoryStore.filterZoneId" @change="onZonaChange">
        <option v-for="opt in zoneOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>

    <div v-if="eventHistoryStore.errors.length" class="ehl-error">
      <i class="pi pi-exclamation-triangle" />
      <span>{{ eventHistoryStore.errors[eventHistoryStore.errors.length - 1] }}</span>
    </div>

    <div v-if="eventHistoryStore.loadingEvents" class="ehl-empty">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem; color: #2d8cff;" />
      <p>{{ t('eventHistory.loading') }}</p>
    </div>

    <template v-else>
      <div v-if="groupedByDate.length === 0" class="ehl-empty">
        <i class="pi pi-inbox" style="font-size: 2rem; color: #30363d;" />
        <p>{{ t('eventHistory.empty') }}</p>
      </div>

      <div v-for="grupo in groupedByDate" :key="grupo.fecha" class="ehl-group">
        <h2 class="ehl-group-date">{{ grupo.fecha }}</h2>
        <ul class="ehl-event-list">
          <li v-for="evento in grupo.eventos" :key="evento.key" class="ehl-event-item">
            <span class="ehl-event-barra" :style="{ backgroundColor: evento.getColor() }" />
            <div class="ehl-event-body">
              <span class="ehl-event-nombre">{{ evento.heading }}</span>
              <span class="ehl-event-desc">{{ evento.description }}</span>
            </div>
            <div class="ehl-event-right">
              <span class="ehl-event-hora">{{ evento.getFormattedTime() }}</span>
              <span class="ehl-badge-severity" :style="{ color: evento.getColor() }">{{ evento.severityLevel }}</span>
              <span class="ehl-status">{{ evento.status }}</span>
              <span v-if="mostrarBadgeAlerta(evento)" class="ehl-badge-alerta">{{ t('eventHistory.alertBadge') }}</span>
            </div>
          </li>
        </ul>
      </div>
    </template>
  </div>
</template>

<style scoped>
.ehl-page {
  color: #e6edf3;
  width: 100%;
}

.ehl-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.ehl-header-left {
  display: flex;
  align-items: center;
  gap: 14px;
}

.ehl-title {
  font-size: 1.4rem;
  font-weight: 700;
  margin: 0;
  color: #e6edf3;
}

.ehl-warehouse-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.85rem;
  color: #8b949e;
  cursor: pointer;
  padding: 4px 0;
}

.ehl-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 28px;
  flex-wrap: wrap;
}

.ehl-select {
  background-color: #161b22;
  color: #e6edf3;
  border: 1px solid #30363d;
  border-radius: 6px;
  padding: 8px 28px 8px 14px;
  font-size: 0.85rem;
  cursor: pointer;
  outline: none;
  appearance: none;
  min-width: 150px;
}

.ehl-select:hover, .ehl-select:focus { border-color: #2d8cff; }

.ehl-group { margin-bottom: 28px; }

.ehl-group-date {
  font-size: 0.88rem;
  font-weight: 600;
  color: #8b949e;
  margin: 0 0 12px 0;
}

.ehl-event-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.ehl-event-item {
  display: flex;
  align-items: stretch;
  background-color: #1c2230;
  border: 1px solid #21262d;
  border-radius: 8px;
  overflow: hidden;
  min-height: 68px;
}

.ehl-event-barra { width: 4px; flex-shrink: 0; }

.ehl-event-body {
  flex: 1;
  padding: 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.ehl-event-nombre { font-size: 0.92rem; font-weight: 600; color: #e6edf3; }
.ehl-event-desc { font-size: 0.8rem; color: #8b949e; }

.ehl-event-right {
  padding: 14px 18px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  justify-content: space-between;
  gap: 6px;
}

.ehl-event-hora { font-size: 0.88rem; font-weight: 600; color: #e6edf3; white-space: nowrap; }
.ehl-badge-severity { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; }
.ehl-status { font-size: 0.72rem; color: #8b949e; text-transform: uppercase; letter-spacing: 0.04em; }
.ehl-badge-alerta { color: #ef4444; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; }

.ehl-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(239,68,68,0.12);
  border: 1px solid rgba(239,68,68,0.35);
  color: #ef4444;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.85rem;
  margin-bottom: 16px;
}

.ehl-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
  color: #6e7681;
  font-size: 0.9rem;
}

@media (max-width: 760px) {
  .ehl-header-left,
  .ehl-event-item {
    flex-direction: column;
  }

  .ehl-event-right {
    align-items: flex-start;
  }

  .ehl-select {
    width: 100%;
  }
}
</style>
