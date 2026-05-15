<script setup lang="js">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { eventHistoryStore } from '../../application/event-history.store.js'

const router = useRouter()
const route = useRoute()

const zoomLevel = ref(1)
const liveLog = ref([])
let liveInterval = null

const MENSAJES_LIVE = [
  { titulo: 'Movimiento en Zona de Carga', desc: 'Sensor S3 disparado', tipo: 'alerta' },
  { titulo: 'Cámara Zxxd-01 Activada', desc: 'Grabación automática iniciada', tipo: 'advertencia' },
  { titulo: 'Sensor S1 (Puerta) Cerrado', desc: 'Lectura normal', tipo: 'normal' },
  { titulo: 'Sistema inicializado', desc: 'Ping de red exitoso (12ms)', tipo: 'normal' },
  { titulo: 'Acceso detectado - Zona Inv.', desc: 'Verificando credenciales', tipo: 'advertencia' },
  { titulo: 'Alerta: Temperatura elevada', desc: 'Zona de carga, sensor T2', tipo: 'alerta' },
]

const tiempoRelativo = (segundos) => {
  if (segundos < 60) return `Hace ${segundos}s`
  return `Hace ${Math.floor(segundos / 60)}m`
}

onMounted(async () => {
  const warehouseId = route.params.id
  await Promise.all([
    eventHistoryStore.loadEvents(warehouseId),
    eventHistoryStore.loadSensors(warehouseId),
  ])

  liveLog.value = MENSAJES_LIVE.map((m, i) => ({
    id: Date.now() + i,
    titulo: m.titulo,
    desc: m.desc,
    tipo: m.tipo,
    segundos: [2, 45, 180, 720, 1800, 3600][i] ?? i * 60,
  }))

  liveInterval = setInterval(() => {
    const msg = MENSAJES_LIVE[Math.floor(Math.random() * MENSAJES_LIVE.length)]
    liveLog.value.unshift({ id: Date.now(), titulo: msg.titulo, desc: msg.desc, tipo: msg.tipo, segundos: 1 })
    if (liveLog.value.length > 10) liveLog.value.pop()
  }, 8000)
})

onUnmounted(() => { if (liveInterval) clearInterval(liveInterval) })

const zoomIn  = () => { if (zoomLevel.value < 1.6) zoomLevel.value = +(zoomLevel.value + 0.1).toFixed(1) }
const zoomOut = () => { if (zoomLevel.value > 0.7) zoomLevel.value = +(zoomLevel.value - 0.1).toFixed(1) }

const irADetalle = () => {
  router.push({ name: 'warehouse-detail-events', params: { id: route.params.id } })
}

const dotClass = (sensor) => {
  const color = sensor.getColorEstado()
  if (color === '#ef4444') return 'dot-rojo'
  if (color === '#f59e0b') return 'dot-amarillo'
  return 'dot-verde'
}

const bloquearPuertas = () => {
  liveLog.value.unshift({ id: Date.now(), titulo: '🔒 Bloqueo de puertas activado', desc: 'Todas las puertas bloqueadas por operador', tipo: 'alerta', segundos: 0 })
}
</script>

<template>
  <div class="lm-page">
    <a class="lm-back-link" @click="irADetalle">← Volver al detalle del almacén</a>

    <div class="lm-heading">
      <h1 class="lm-title">Monitoreo en Vivo</h1>
      <span class="lm-badge-live">LIVE</span>
    </div>
    <p class="lm-subtitle">{{ eventHistoryStore.currentWarehouse?.nombre ?? 'Almacén' }}</p>

    <div class="lm-body">
      <!-- Panel mapa -->
      <div class="lm-map-panel">
        <div class="lm-map-wrapper">
          <div class="lm-map" :style="{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }">
            <div class="map-grid" />
            <div class="map-zone zone-carga">ZONA DE CARGA</div>
            <div class="map-zone zone-inventario">INVENTARIO</div>
            <div
                v-for="sensor in eventHistoryStore.sensors"
                :key="sensor.id"
                class="sensor-pin"
                :style="{ left: sensor.posicion.x + '%', top: sensor.posicion.y + '%' }"
            >
              <span :class="['sensor-pin-dot', dotClass(sensor)]" />
              <span class="sensor-pin-label">{{ sensor.getEtiquetaMapa() }}</span>
            </div>
          </div>
        </div>
        <div class="zoom-controls">
          <button class="zoom-btn" @click="zoomIn">+</button>
          <button class="zoom-btn" @click="zoomOut">−</button>
        </div>
      </div>

      <!-- Console Log -->
      <div class="lm-log-panel">
        <h3 class="log-title">Console Log - Live</h3>
        <ul class="log-list">
          <li v-for="(entry, idx) in liveLog" :key="entry.id" :class="['log-entry', { 'log-entry--latest': idx === 0 }]">
            <span class="log-tiempo">{{ tiempoRelativo(entry.segundos) }}</span>
            <div class="log-body">
              <span class="log-titulo">{{ entry.titulo }}</span>
              <span class="log-desc">{{ entry.desc }}</span>
            </div>
          </li>
        </ul>
        <button class="btn-lockdown" @click="bloquearPuertas">🔒 Bloquear Todas las Puertas</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.lm-page {
  color: #e6edf3;
  width: 100%;
  height: calc(100vh - 140px); /* altura fija restando topbar + padding del layout */
  display: flex;
  flex-direction: column;
}

.lm-back-link { display: inline-block; color: #8b949e; font-size: 0.82rem; cursor: pointer; margin-bottom: 10px; transition: color 0.15s; }
.lm-back-link:hover { color: #2d8cff; }

.lm-heading { display: flex; align-items: center; gap: 14px; margin-bottom: 4px; }
.lm-title { font-size: 1.8rem; font-weight: 700; margin: 0; color: #e6edf3; }
.lm-badge-live { background-color: #ef4444; color: white; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; padding: 4px 12px; border-radius: 4px; animation: pulse-live 1.5s ease-in-out infinite; }
@keyframes pulse-live { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }

.lm-subtitle { font-size: 0.9rem; color: #8b949e; margin: 0 0 20px 0; }

.lm-body {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 20px;
  flex: 1;        /* ← ocupa el espacio restante */
  min-height: 0;  /* ← clave para que flex respete el overflow */
  overflow: hidden;
}

.lm-map-panel {
  position: relative;
  background-color: #161b22;
  border: 1px solid #21262d;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.lm-map-wrapper { flex: 1; overflow: hidden; padding: 20px; }
.lm-map { position: relative; width: 100%; height: 100%; min-height: 320px; transition: transform 0.2s ease; }
.map-grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(45,140,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(45,140,255,0.06) 1px, transparent 1px); background-size: 40px 40px; }
.map-zone { position: absolute; border: 1.5px solid rgba(45,140,255,0.4); border-radius: 4px; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.08em; color: #2d8cff; padding: 6px 10px; }
.zone-carga { top: 20%; left: 10%; width: 40%; height: 55%; }
.zone-inventario { top: 20%; left: 52%; width: 35%; height: 55%; }

.sensor-pin { position: absolute; transform: translate(-50%, -50%); display: flex; flex-direction: column; align-items: center; gap: 4px; z-index: 10; }
.sensor-pin-dot { width: 16px; height: 16px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.3); display: block; }
.dot-rojo { background-color: #ef4444; animation: pulse-sensor 1.2s infinite; }
.dot-amarillo { background-color: #f59e0b; animation: pulse-sensor-yellow 1.2s infinite; }
.dot-verde { background-color: #22c55e; }
@keyframes pulse-sensor { 0%, 100% { box-shadow: 0 0 6px #ef4444; } 50% { box-shadow: 0 0 16px #ef4444; } }
@keyframes pulse-sensor-yellow { 0%, 100% { box-shadow: 0 0 6px #f59e0b; } 50% { box-shadow: 0 0 16px #f59e0b; } }
.sensor-pin-label { background-color: rgba(13,17,23,0.85); color: #e6edf3; font-size: 0.68rem; padding: 2px 6px; border-radius: 3px; white-space: nowrap; border: 1px solid #21262d; }

.zoom-controls { position: absolute; top: 16px; right: 16px; display: flex; flex-direction: column; gap: 2px; }
.zoom-btn { width: 32px; height: 32px; background-color: #1c2230; border: 1px solid #30363d; border-radius: 4px; color: #e6edf3; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.zoom-btn:hover { background-color: #2d8cff; }

.lm-log-panel {
  background-color: #1c2230;
  border: 1px solid #21262d;
  border-radius: 10px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;   /* ← clave */
  overflow: hidden; /* ← no crece */
}

.log-title { font-size: 0.9rem; font-weight: 600; color: #e6edf3; margin: 0; flex-shrink: 0; }

.log-list {
  list-style: none;
  margin: 0;
  padding: 0;
  flex: 1;          /* ← ocupa espacio disponible */
  min-height: 0;    /* ← clave para scroll interno */
  display: flex;
  flex-direction: column;
  gap: 2px;
  overflow-y: auto; /* ← scroll solo aquí adentro */
}

.log-entry { display: flex; gap: 10px; padding: 8px 10px; border-radius: 6px; border-bottom: 1px solid #21262d; flex-shrink: 0; }
.log-entry:last-child { border-bottom: none; }
.log-entry--latest { background-color: rgba(45,140,255,0.12); border-left: 3px solid #2d8cff; }
.log-tiempo { font-size: 0.72rem; color: #6e7681; white-space: nowrap; padding-top: 2px; min-width: 52px; }
.log-body { display: flex; flex-direction: column; gap: 2px; }
.log-titulo { font-size: 0.84rem; font-weight: 600; color: #e6edf3; }
.log-desc { font-size: 0.76rem; color: #8b949e; }

.btn-lockdown { background-color: #ef4444; color: white; border: none; border-radius: 6px; padding: 12px; font-size: 0.9rem; font-weight: 600; cursor: pointer; width: 100%; flex-shrink: 0; }
.btn-lockdown:hover { background-color: #dc2626; }

@media (max-width: 900px) { .lm-body { grid-template-columns: 1fr; } }
</style>