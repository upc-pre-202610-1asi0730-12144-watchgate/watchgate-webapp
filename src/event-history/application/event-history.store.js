/**
 * @fileoverview Store reactivo del módulo Historial de Eventos e Incidentes.
 * Gestiona el estado global del módulo siguiendo el mismo patrón original:
 * no usa Pinia; usa reactive() de Vue 3 de forma directa.
 * @module event-history/application
 */

import { reactive, computed } from 'vue'
import { eventHistoryApi } from '../infrastructure/event-history-api.js'
import { EventAssembler } from '../infrastructure/event.assembler.js'
import { SensorAssembler } from '../infrastructure/sensor.assembler.js'
import { useIamStore } from '../../iam/application/iam.store.js'
import { useWarehouseStore } from '../../warehouse/application/warehouse.store.js'
import { DevicesApi } from '../../devices/infrastructure/devices-api.js'

const devicesApi = new DevicesApi()

/**
 * Store reactivo del módulo de Historial de Eventos.
 * Expone el estado y los métodos de la capa de aplicación.
 */
export const eventHistoryStore = reactive({
    /** @type {import('../domain/model/event.entity.js').EventEntity[]} Alerts + incidents del almacén actual */
    events: [],

    /** @type {import('../domain/model/sensor.entity.js').SensorEntity[]} Sensores del almacén actual */
    sensors: [],

    /** @type {boolean} */
    loadingEvents: false,

    /** @type {boolean} */
    loadingSensors: false,

    /** @type {string[]} Mensajes de error registrados */
    errors: [],

    /** @type {Object|null} Almacén actualmente seleccionado */
    currentWarehouse: null,

    /** @type {string} Filtro por severidad/prioridad: 'todos' | 'LOW' | 'MEDIUM' | 'HIGH' */
    filterType: 'todos',

    /** @type {string} Filtro por período: '7dias' | '30dias' | 'hoy' */
    filterPeriod: '7dias',

    // -------------------------------------------------------------------------
    // Métodos de la capa de aplicación
    // -------------------------------------------------------------------------

    /**
     * Carga las alertas e incidentes de seguridad reales del almacén indicado.
     * @param {string|number} warehouseId - ID del almacén
     * @returns {Promise<void>}
     */
    async loadEvents(warehouseId) {
        this.errors = []
        this.loadingEvents = true
        try {
            const [alertsResponse, incidentsResponse] = await Promise.all([
                eventHistoryApi.getEvents(warehouseId),
                eventHistoryApi.getIncidents(warehouseId),
            ])
            const alerts = EventAssembler.alertsFromResponse(alertsResponse.data)
            const incidents = EventAssembler.incidentsFromResponse(incidentsResponse.data)
            this.events = [...alerts, ...incidents]
        } catch (error) {
            console.error('[eventHistoryStore] Error al cargar eventos:', error)
            this.events = []
            this.errors.push(`Error al cargar eventos: ${error.message}`)
        } finally {
            this.loadingEvents = false
        }
    },

    /**
     * Carga los sensores reales del almacén indicado. El backend no expone
     * "sensores por almacén" directamente (Sensor solo conoce su ZoneId), así
     * que se traen los sensores de la compañía y se filtran del lado del
     * cliente por las zonas que pertenecen a este almacén
     * (warehouseStore ya trae warehouse.zones).
     * @param {string|number} warehouseId - ID del almacén
     * @returns {Promise<void>}
     */
    async loadSensors(warehouseId) {
        this.errors = []
        this.loadingSensors = true
        try {
            const iamStore = useIamStore()
            const warehouseStore = useWarehouseStore()
            const companyId = iamStore.currentUser?.companyId
            if (!companyId) {
                this.sensors = []
                return
            }

            if (!warehouseStore.warehousesLoaded) {
                await warehouseStore.fetchWarehouses(companyId)
            }

            const warehouse = warehouseStore.getWarehouseById(warehouseId)
            const zoneIds = warehouse?.zones?.map(zone => zone.id) ?? []
            if (zoneIds.length === 0) {
                this.sensors = []
                return
            }

            const sensorResources = await devicesApi.getAllByCompanyId(companyId)
            const sensorsInWarehouse = sensorResources.filter(sensor => zoneIds.includes(sensor.zoneId))
            this.sensors = sensorsInWarehouse.map(SensorAssembler.toEntityFromResource)
        } catch (error) {
            console.error('[eventHistoryStore] Error al cargar sensores:', error)
            this.sensors = []
            this.errors.push(`Error al cargar sensores: ${error.message}`)
        } finally {
            this.loadingSensors = false
        }
    },

    /**
     * Establece el almacén activo en el store.
     * @param {{ id: string|number, nombre: string, estado: string }} warehouse
     */
    setWarehouse(warehouse) {
        this.currentWarehouse = warehouse
    },
})

// ---------------------------------------------------------------------------
// Computeds exportados por separado (no pueden ser métodos del reactive)
// ---------------------------------------------------------------------------

/**
 * Computed que filtra los eventos según la severidad y el período seleccionados.
 * Reactivo al estado de eventHistoryStore.filterType y filterPeriod.
 * @type {import('vue').ComputedRef<import('../domain/model/event.entity.js').EventEntity[]>}
 */
export const filteredEvents = computed(() => {
    let resultado = eventHistoryStore.events

    if (eventHistoryStore.filterType !== 'todos') {
        resultado = resultado.filter(e => e.severityLevel === eventHistoryStore.filterType)
    }

    const ahora = new Date()
    const diasAtras = (n) => {
        const d = new Date()
        d.setDate(d.getDate() - n)
        d.setHours(0, 0, 0, 0)
        return d
    }

    if (eventHistoryStore.filterPeriod === 'hoy') {
        const inicioHoy = diasAtras(0)
        resultado = resultado.filter(e => e.occurredAt >= inicioHoy)
    } else if (eventHistoryStore.filterPeriod === '7dias') {
        const inicio7d = diasAtras(7)
        resultado = resultado.filter(e => e.occurredAt >= inicio7d)
    } else if (eventHistoryStore.filterPeriod === '30dias') {
        const inicio30d = diasAtras(30)
        resultado = resultado.filter(e => e.occurredAt >= inicio30d)
    }

    return resultado.sort((a, b) => b.occurredAt - a.occurredAt)
})

/**
 * Computed que agrupa los eventos filtrados por fecha legible.
 * Retorna un array de { fecha: string, eventos: EventEntity[] } ordenado cronológicamente.
 * @type {import('vue').ComputedRef<Array<{ fecha: string, eventos: import('../domain/model/event.entity.js').EventEntity[] }>>}
 */
export const groupedByDate = computed(() => {
    /** @type {Map<string, import('../domain/model/event.entity.js').EventEntity[]>} */
    const mapa = new Map()

    for (const evento of filteredEvents.value) {
        const clave = evento.getFormattedDate()
        if (!mapa.has(clave)) mapa.set(clave, [])
        mapa.get(clave).push(evento)
    }

    return Array.from(mapa.entries()).map(([fecha, eventos]) => ({ fecha, eventos }))
})
