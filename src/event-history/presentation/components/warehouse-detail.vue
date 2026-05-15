<script setup lang="js">
import { onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { eventHistoryStore } from '../../application/event-history.store.js'

const router = useRouter()
const route = useRoute()

onMounted(async () => {
  const warehouseId = route.params.id
  await Promise.all([
    eventHistoryStore.loadEvents(warehouseId),
    eventHistoryStore.loadSensors(warehouseId),
  ])
})

const irAMonitoreo = () => router.push({ name: 'live-monitoring', params: { id: route.params.id } })
const irAHistorial = () => router.push({ name: 'event-history-list', params: { id: route.params.id } })
const irAAlmacenes = () => router.push({ name: 'warehouse-list' })

const colorEvento = (tipo) => {
  const mapa = { alerta: '#ef4444', advertencia: '#f59e0b', normal: '#22c55e' }
  return mapa[tipo] ?? '#6b7280'
}

const claseSensor = (estado) => {
  const e = estado.toLowerCase()
  if (e.includes('estable') || e.includes('normal') || e.includes('cerrada')) return 'sensor-ok'
  if (e.includes('alerta') || e.includes('abierta') || e.includes('detectado')) return 'sensor-alerta'
  return 'sensor-warn'
}

const ultimosEventos = () => eventHistoryStore.events.slice(0, 3)
</script>

<template>
  <div class="wh-page">
    <a class="wh-back-link" @click="irAAlmacenes">← Volver a mis almacenes</a>

    <div class="wh-heading">
      <h1 class="wh-title">{{ eventHistoryStore.currentWarehouse?.nombre ?? 'Almacén' }}</h1>
      <span class="wh-badge-activo">
        <span class="badge-dot" />
        {{ eventHistoryStore.currentWarehouse?.estado ?? 'Activo' }}
      </span>
    </div>

    <div class="wh-cards">
      <div class="wh-card">
        <h3 class="card-title">Últimos eventos</h3>
        <ul class="event-list">
          <li v-for="evento in ultimosEventos()" :key="evento.id" class="event-item">
            <span class="event-dot" :style="{ backgroundColor: colorEvento(evento.tipo) }" />
            <span class="event-nombre" :style="{ color: colorEvento(evento.tipo) }">{{ evento.nombre }}</span>
            <span class="event-hora">{{ evento.hora }}</span>
          </li>
        </ul>
      </div>

      <div class="wh-card">
        <h3 class="card-title">Estado de sensores</h3>
        <ul class="sensor-list">
          <li v-for="sensor in eventHistoryStore.sensors" :key="sensor.id" class="sensor-item">
            <span class="sensor-nombre">{{ sensor.nombre }}:</span>
            <span :class="['sensor-estado', claseSensor(sensor.estado)]">{{ sensor.estado }}</span>
          </li>
        </ul>
      </div>
    </div>

    <div class="wh-actions">
      <button class="btn-primary" @click="irAMonitoreo">Ver monitoreo en tiempo real</button>
      <button class="btn-outline" @click="irAHistorial">Ver historial completo</button>
    </div>
  </div>
</template>

<style scoped>
.wh-page { color: #e6edf3; width: 100%; }

.wh-back-link { display: inline-block; color: #8b949e; font-size: 0.82rem; cursor: pointer; margin-bottom: 14px; transition: color 0.15s; }
.wh-back-link:hover { color: #2d8cff; }

.wh-heading { display: flex; align-items: center; gap: 16px; margin-bottom: 28px; }
.wh-title { font-size: 2rem; font-weight: 700; color: #e6edf3; margin: 0; }
.wh-badge-activo { display: inline-flex; align-items: center; gap: 6px; background-color: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.3); border-radius: 20px; padding: 4px 12px; font-size: 0.8rem; font-weight: 600; }
.badge-dot { width: 7px; height: 7px; border-radius: 50%; background-color: #22c55e; }

.wh-cards { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; }
.wh-card { background-color: #1c2230; border-radius: 10px; border: 1px solid #21262d; padding: 20px 24px; }
.card-title { font-size: 0.95rem; font-weight: 600; color: #e6edf3; margin: 0 0 16px 0; }

.event-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 2px; }
.event-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #21262d; }
.event-item:last-child { border-bottom: none; }
.event-dot { width: 9px; height: 9px; border-radius: 50%; flex-shrink: 0; }
.event-nombre { flex: 1; font-size: 0.88rem; font-weight: 500; }
.event-hora { font-size: 0.82rem; color: #8b949e; }

.sensor-list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; }
.sensor-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #21262d; font-size: 0.88rem; }
.sensor-item:last-child { border-bottom: none; }
.sensor-nombre { color: #8b949e; }
.sensor-ok { color: #22c55e; font-weight: 600; }
.sensor-warn { color: #f59e0b; font-weight: 600; }
.sensor-alerta { color: #ef4444; font-weight: 600; }

.wh-actions { display: flex; gap: 16px; }
.btn-primary { background-color: #2d8cff; color: white; border: none; border-radius: 6px; padding: 12px 24px; font-size: 0.9rem; font-weight: 500; cursor: pointer; }
.btn-primary:hover { background-color: #1a7aee; }
.btn-outline { background-color: transparent; color: #2d8cff; border: 1.5px solid #2d8cff; border-radius: 6px; padding: 12px 24px; font-size: 0.9rem; font-weight: 500; cursor: pointer; }
.btn-outline:hover { background-color: rgba(45,140,255,0.1); }

@media (max-width: 768px) { .wh-cards { grid-template-columns: 1fr; } .wh-actions { flex-direction: column; } }
</style>