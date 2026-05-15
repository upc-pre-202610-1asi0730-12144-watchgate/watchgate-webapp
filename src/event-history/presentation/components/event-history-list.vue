<script setup lang="js">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import {
  eventHistoryStore,
  groupedByDate,
} from '../../application/event-history.store.js'

const route = useRoute()

const opcionesTipo = [
  { label: 'Tipo de evento', value: 'todos' },
  { label: 'Alerta', value: 'alerta' },
  { label: 'Advertencia', value: 'advertencia' },
  { label: 'Normal', value: 'normal' },
]

const opcionesPeriodo = [
  { label: 'Últimos 7 días', value: '7dias' },
  { label: 'Hoy', value: 'hoy' },
  { label: 'Últimos 30 días', value: '30dias' },
]

onMounted(async () => {
  const warehouseId = route.params.id ?? '1'
  await Promise.all([
    eventHistoryStore.loadEvents(warehouseId),
    eventHistoryStore.loadSensors(warehouseId),
  ])
})

const onTipoChange = (e) => { eventHistoryStore.filterType = e.target.value }
const onPeriodoChange = (e) => { eventHistoryStore.filterPeriod = e.target.value }

const colorBarra = (tipo) => {
  const mapa = { alerta: '#ef4444', advertencia: '#f59e0b', normal: '#22c55e' }
  return mapa[tipo] ?? '#2d8cff'
}

const mostrarBadgeAlerta = (evento) => evento.esAlerta()
</script>

<template>
  <div class="ehl-page">
    <!-- Header -->
    <div class="ehl-header">
      <div class="ehl-header-left">
        <h1 class="ehl-title">Historial de Eventos</h1>
        <span class="ehl-warehouse-badge">
          {{ eventHistoryStore.currentWarehouse?.nombre ?? 'Seleccionar almacén' }}
          <i class="pi pi-chevron-down" style="font-size: 0.7rem;" />
        </span>
      </div>
    </div>

    <!-- Filtros -->
    <div class="ehl-filters">
      <select class="ehl-select" :value="eventHistoryStore.filterType" @change="onTipoChange">
        <option v-for="opt in opcionesTipo" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
      <select class="ehl-select" :value="eventHistoryStore.filterPeriod" @change="onPeriodoChange">
        <option v-for="opt in opcionesPeriodo" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
      </select>
    </div>

    <!-- Lista -->
    <div v-if="groupedByDate.length === 0" class="ehl-empty">
      <i class="pi pi-inbox" style="font-size: 2rem; color: #30363d;" />
      <p>No se encontraron eventos con los filtros seleccionados.</p>
    </div>

    <div v-for="grupo in groupedByDate" :key="grupo.fecha" class="ehl-group">
      <h2 class="ehl-group-date">{{ grupo.fecha }}</h2>
      <ul class="ehl-event-list">
        <li v-for="evento in grupo.eventos" :key="evento.id" class="ehl-event-item">
          <span class="ehl-event-barra" :style="{ backgroundColor: colorBarra(evento.tipo) }" />
          <div class="ehl-event-body">
            <span class="ehl-event-nombre">{{ evento.nombre }}</span>
            <span class="ehl-event-desc">{{ evento.descripcion }}</span>
          </div>
          <div class="ehl-event-right">
            <span class="ehl-event-hora">{{ evento.hora }}</span>
            <span v-if="mostrarBadgeAlerta(evento)" class="ehl-badge-alerta">ALERTA</span>
          </div>
        </li>
      </ul>
    </div>
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
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%238b949e' d='M1 1l5 5 5-5'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
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
.ehl-badge-alerta { color: #ef4444; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; }

.ehl-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 60px 0;
  color: #6e7681;
  font-size: 0.9rem;
}
</style>