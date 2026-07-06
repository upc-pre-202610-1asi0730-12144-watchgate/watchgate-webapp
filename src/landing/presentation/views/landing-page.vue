<script setup>
const metrics = [
  { value: '24/7', label: 'monitoreo operativo' },
  { value: 'IoT', label: 'sensores y alertas' },
  { value: 'DDD', label: 'servicios por contexto' },
];

const benefits = [
  {
    title: 'Alertas accionables',
    text: 'Prioriza incidentes por criticidad, sensor y almacén para reducir tiempos de respuesta.',
  },
  {
    title: 'Gestión de almacenes',
    text: 'Organiza sedes, zonas de riesgo y dispositivos conectados desde una misma experiencia.',
  },
  {
    title: 'Operación trazable',
    text: 'Conserva historial de eventos, reportes y evidencias para auditoría interna.',
  },
];
</script>

<template>
  <main class="landing-page">
    <section class="hero-section">
      <nav class="landing-nav" aria-label="Main navigation">
        <router-link class="brand" to="/">
          <span class="brand-mark">L</span>
          <span>LockSight</span>
        </router-link>

        <div class="nav-actions">
          <router-link class="nav-link" to="/iam/sign-in">Ingresar</router-link>
          <router-link class="nav-button" to="/iam/sign-up">Crear cuenta</router-link>
        </div>
      </nav>

      <div class="hero-content">
        <div class="hero-copy">
          <p class="eyebrow">Seguridad IoT para almacenes</p>
          <h1>Supervisa accesos, sensores y alertas críticas en tiempo real</h1>
          <p class="hero-text">
            LockSight centraliza la operación de seguridad de almacenes con monitoreo de sensores,
            gestión de zonas, historial de eventos y reportes para equipos logísticos.
          </p>

          <div class="hero-actions">
            <router-link class="primary-action" to="/iam/sign-up">Empezar ahora</router-link>
            <router-link class="secondary-action" to="/iam/sign-in">Ya tengo cuenta</router-link>
          </div>
        </div>

        <div class="monitor-panel" aria-label="Resumen operacional de LockSight">
          <div class="panel-header">
            <span class="status-dot"></span>
            <span>Almacén Central</span>
            <strong>Activo</strong>
          </div>

          <div class="map-area">
            <span class="zone zone-entry">Entrada</span>
            <span class="zone zone-stock">Inventario</span>
            <span class="zone zone-load">Carga</span>
            <span class="sensor sensor-one"></span>
            <span class="sensor sensor-two warning"></span>
            <span class="sensor sensor-three"></span>
          </div>

          <div class="event-list">
            <article>
              <span class="event-severity high"></span>
              <div>
                <strong>Puerta principal abierta</strong>
                <p>Sensor S1 - fuera de horario</p>
              </div>
            </article>
            <article>
              <span class="event-severity medium"></span>
              <div>
                <strong>Movimiento detectado</strong>
                <p>Zona de carga - verificación pendiente</p>
              </div>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="metrics-section" aria-label="Indicadores de propuesta">
      <div v-for="metric in metrics" :key="metric.label" class="metric">
        <strong>{{ metric.value }}</strong>
        <span>{{ metric.label }}</span>
      </div>
    </section>

    <section class="benefits-section">
      <article v-for="benefit in benefits" :key="benefit.title" class="benefit">
        <h2>{{ benefit.title }}</h2>
        <p>{{ benefit.text }}</p>
      </article>
    </section>
  </main>
</template>

<style scoped>
:global(body) {
  background: #08111f;
}

:global(#app) {
  width: 100%;
  border: 0;
  text-align: initial;
}

.landing-page {
  min-height: 100vh;
  background: #08111f;
  color: #e5edf8;
  font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.hero-section {
  min-height: 86vh;
  display: flex;
  flex-direction: column;
  padding: 24px clamp(20px, 5vw, 72px) 56px;
  background:
    linear-gradient(120deg, rgba(8, 17, 31, 0.92), rgba(8, 17, 31, 0.64)),
    url("../../../assets/hero.png") center / cover;
}

.landing-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  width: min(1160px, 100%);
  margin: 0 auto;
}

.brand,
.nav-link,
.nav-button,
.primary-action,
.secondary-action {
  text-decoration: none;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #f8fafc;
  font-weight: 800;
  font-size: 1.05rem;
  letter-spacing: 0;
}

.brand-mark {
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #3b82f6;
  color: white;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-link {
  color: #cbd5e1;
  font-size: 0.95rem;
  font-weight: 600;
}

.nav-button {
  color: #08111f;
  background: #e5edf8;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 0.95rem;
  font-weight: 700;
}

.hero-content {
  flex: 1;
  width: min(1160px, 100%);
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(360px, 470px);
  align-items: center;
  gap: clamp(32px, 5vw, 72px);
}

.hero-copy {
  max-width: 680px;
}

.eyebrow {
  margin: 0 0 14px;
  color: #93c5fd;
  font-size: 0.9rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-copy h1 {
  margin: 0;
  color: #f8fafc;
  font-size: clamp(2.5rem, 5vw, 4.8rem);
  line-height: 0.98;
  font-weight: 850;
  letter-spacing: 0;
}

.hero-text {
  margin: 22px 0 0;
  max-width: 620px;
  color: #cbd5e1;
  font-size: 1.08rem;
  line-height: 1.65;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 30px;
}

.primary-action,
.secondary-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  border-radius: 8px;
  padding: 0 18px;
  font-weight: 800;
}

.primary-action {
  background: #3b82f6;
  color: white;
}

.secondary-action {
  color: #e5edf8;
  border: 1px solid rgba(203, 213, 225, 0.36);
  background: rgba(15, 23, 42, 0.64);
}

.monitor-panel {
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 8px;
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.36);
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  color: #e2e8f0;
  font-weight: 700;
}

.panel-header strong {
  margin-left: auto;
  color: #22c55e;
  font-size: 0.86rem;
}

.status-dot,
.sensor,
.event-severity {
  display: inline-block;
  border-radius: 999px;
}

.status-dot {
  width: 10px;
  height: 10px;
  background: #22c55e;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.14);
}

.map-area {
  position: relative;
  height: 270px;
  margin: 18px;
  border: 1px solid rgba(148, 163, 184, 0.22);
  background:
    linear-gradient(rgba(148, 163, 184, 0.12) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.12) 1px, transparent 1px),
    rgba(8, 17, 31, 0.82);
  background-size: 42px 42px;
  border-radius: 8px;
}

.zone {
  position: absolute;
  border: 1px solid rgba(59, 130, 246, 0.44);
  background: rgba(59, 130, 246, 0.12);
  color: #bfdbfe;
  border-radius: 8px;
  padding: 8px;
  font-size: 0.78rem;
  font-weight: 700;
}

.zone-entry {
  left: 22px;
  bottom: 24px;
}

.zone-stock {
  top: 38px;
  right: 34px;
}

.zone-load {
  left: 34%;
  top: 42%;
}

.sensor {
  position: absolute;
  width: 14px;
  height: 14px;
  background: #22c55e;
  border: 3px solid #dcfce7;
}

.sensor.warning {
  background: #f59e0b;
  border-color: #fef3c7;
}

.sensor-one {
  left: 72px;
  bottom: 78px;
}

.sensor-two {
  left: 50%;
  top: 50%;
}

.sensor-three {
  right: 82px;
  top: 78px;
}

.event-list {
  display: grid;
  gap: 10px;
  padding: 0 18px 18px;
}

.event-list article {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 12px;
  border-radius: 8px;
  background: rgba(30, 41, 59, 0.82);
}

.event-list strong {
  color: #f8fafc;
  font-size: 0.92rem;
}

.event-list p {
  margin-top: 2px;
  color: #94a3b8;
  font-size: 0.82rem;
}

.event-severity {
  flex: 0 0 auto;
  width: 10px;
  height: 10px;
  margin-top: 5px;
}

.event-severity.high {
  background: #ef4444;
}

.event-severity.medium {
  background: #f59e0b;
}

.metrics-section {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  width: min(1160px, calc(100% - 40px));
  margin: -34px auto 0;
  background: #f8fafc;
  color: #0f172a;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 18px 40px rgba(0, 0, 0, 0.24);
}

.metric {
  display: grid;
  gap: 6px;
  padding: 22px;
  border-right: 1px solid #e2e8f0;
}

.metric:last-child {
  border-right: 0;
}

.metric strong {
  font-size: 1.8rem;
  color: #1d4ed8;
}

.metric span {
  color: #475569;
  font-weight: 700;
}

.benefits-section {
  width: min(1160px, calc(100% - 40px));
  margin: 56px auto 0;
  padding-bottom: 64px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}

.benefit {
  border: 1px solid rgba(148, 163, 184, 0.22);
  border-radius: 8px;
  padding: 22px;
  background: #0f172a;
}

.benefit h2 {
  margin: 0 0 10px;
  color: #f8fafc;
  font-size: 1.12rem;
  font-weight: 800;
}

.benefit p {
  color: #cbd5e1;
  line-height: 1.6;
  font-size: 0.95rem;
}

@media (max-width: 900px) {
  .hero-section {
    min-height: auto;
  }

  .landing-nav {
    align-items: flex-start;
  }

  .hero-content {
    grid-template-columns: 1fr;
    padding-top: 56px;
  }

  .monitor-panel {
    max-width: 560px;
  }

  .metrics-section,
  .benefits-section {
    grid-template-columns: 1fr;
  }

  .metric {
    border-right: 0;
    border-bottom: 1px solid #e2e8f0;
  }

  .metric:last-child {
    border-bottom: 0;
  }
}

@media (max-width: 560px) {
  .hero-section {
    padding-inline: 18px;
  }

  .nav-actions {
    gap: 8px;
  }

  .nav-link {
    display: none;
  }

  .hero-copy h1 {
    font-size: 2.35rem;
  }

  .hero-text {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .map-area {
    height: 220px;
  }
}
</style>
