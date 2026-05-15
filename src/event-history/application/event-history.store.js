/**
 * @fileoverview Store reactivo del módulo Historial de Eventos e Incidentes.
 * Gestiona el estado global del módulo siguiendo el mismo patrón que newsStore.
 * No usa Pinia; usa reactive() de Vue 3 de forma directa.
 * @module event-history/application
 */

import { reactive, computed } from 'vue'
import { eventHistoryApi } from '../infrastructure/event-history-api.js'
import { EventAssembler } from '../infrastructure/event.assembler.js'
import { SensorAssembler } from '../infrastructure/sensor.assembler.js'
import { EventEntity } from '../domain/model/event.entity.js'
import { SensorEntity } from '../domain/model/sensor.entity.js'

// ---------------------------------------------------------------------------
// Mock data — Se usa cuando el backend aún no está disponible
// ---------------------------------------------------------------------------

/** @type {EventEntity[]} */
const MOCK_EVENTS = [
    new EventEntity({
        id: 1,
        tipo: 'alerta',
        nombre: 'Puerta Principal Abierta',
        descripcion: 'Sensor: S1 | Fuera de horario',
        sensor: 'S1',
        usuario: '',
        hora: '10:30 AM',
        fecha: new Date(), // Hoy
    }),
    new EventEntity({
        id: 2,
        tipo: 'normal',
        nombre: 'Acceso Autorizado',
        descripcion: 'Usuario: Carlos Pérez (Admin)',
        sensor: '',
        usuario: 'Carlos Pérez',
        hora: '09:00 AM',
        fecha: new Date(), // Hoy
    }),
    new EventEntity({
        id: 3,
        tipo: 'normal',
        nombre: 'Sistema Armado',
        descripcion: 'Cierre de operaciones',
        sensor: '',
        usuario: 'Sistema',
        hora: '06:05 PM',
        fecha: (() => { const d = new Date(); d.setDate(d.getDate() - 1); return d })(), // Ayer
    }),
    new EventEntity({
        id: 4,
        tipo: 'advertencia',
        nombre: 'Movimiento Detectado',
        descripcion: 'Sensor: S3 | Zona de Carga',
        sensor: 'S3',
        usuario: '',
        hora: '09:50 AM',
        fecha: new Date(), // Hoy
    }),
]

/** @type {SensorEntity[]} */
const MOCK_SENSORS = [
    new SensorEntity({
        id: 's1',
        nombre: 'S1-Puerta',
        estado: 'Cerrada',
        zona: 'ENTRADA',
        posicion: { x: 28, y: 72 },
    }),
    new SensorEntity({
        id: 's2',
        nombre: 'S2-Movimiento',
        estado: 'Normal',
        zona: 'INVENTARIO',
        posicion: { x: 65, y: 42 },
    }),
    new SensorEntity({
        id: 's3',
        nombre: 'S3-Mov. Detectado',
        estado: 'Mov. Detectado',
        zona: 'ZONA DE CARGA',
        posicion: { x: 35, y: 42 },
    }),
]

// ---------------------------------------------------------------------------
// Estado reactivo principal del módulo
// ---------------------------------------------------------------------------

/**
 * Store reactivo del módulo de Historial de Eventos.
 * Expone el estado y los métodos de la capa de aplicación.
 */
export const eventHistoryStore = reactive({
    /** @type {EventEntity[]} Lista completa de eventos cargados */
    events: [...MOCK_EVENTS],

    /** @type {SensorEntity[]} Lista de sensores del almacén actual */
    sensors: [...MOCK_SENSORS],

    /** @type {string[]} Mensajes de error registrados */
    errors: [],

    /** @type {Object|null} Almacén actualmente seleccionado */
    currentWarehouse: {
        id: '1',
        nombre: 'Almacén Central',
        estado: 'Activo',
    },

    /** @type {string} Filtro por tipo de evento: 'todos' | 'alerta' | 'advertencia' | 'normal' */
    filterType: 'todos',

    /** @type {string} Filtro por período: '7dias' | '30dias' | 'hoy' */
    filterPeriod: '7dias',

    // -------------------------------------------------------------------------
    // Métodos de la capa de aplicación
    // -------------------------------------------------------------------------

    /**
     * Carga los eventos desde el backend para el almacén indicado.
     * Si el backend no responde, los datos mock permanecen en el store.
     * @param {string|number} warehouseId - ID del almacén
     * @returns {Promise<void>}
     */
    async loadEvents(warehouseId) {
        try {
            const response = await eventHistoryApi.getEvents(warehouseId)
            this.events = EventAssembler.toEntitiesFromResponse(response.data)
        } catch (error) {
            // En desarrollo se mantienen los datos mock; se registra el error
            console.warn('[eventHistoryStore] Backend no disponible, usando mock data:', error.message)
            this.errors.push(`Error al cargar eventos: ${error.message}`)
        }
    },

    /**
     * Carga los sensores desde el backend para el almacén indicado.
     * @param {string|number} warehouseId - ID del almacén
     * @returns {Promise<void>}
     */
    async loadSensors(warehouseId) {
        try {
            const response = await eventHistoryApi.getSensors(warehouseId)
            this.sensors = SensorAssembler.toEntitiesFromResponse(response.data)
        } catch (error) {
            console.warn('[eventHistoryStore] Backend no disponible, usando mock sensors:', error.message)
            this.errors.push(`Error al cargar sensores: ${error.message}`)
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
 * Computed que filtra los eventos según el tipo y el período seleccionados.
 * Reactivo al estado de eventHistoryStore.filterType y filterPeriod.
 * @type {import('vue').ComputedRef<EventEntity[]>}
 */
export const filteredEvents = computed(() => {
    let resultado = eventHistoryStore.events

    // Filtro por tipo de evento
    if (eventHistoryStore.filterType !== 'todos') {
        resultado = resultado.filter(e => e.tipo === eventHistoryStore.filterType)
    }

    // Filtro por período
    const ahora = new Date()
    const diasAtras = (n) => {
        const d = new Date()
        d.setDate(d.getDate() - n)
        d.setHours(0, 0, 0, 0)
        return d
    }

    if (eventHistoryStore.filterPeriod === 'hoy') {
        const inicioHoy = diasAtras(0)
        resultado = resultado.filter(e => e.fecha >= inicioHoy)
    } else if (eventHistoryStore.filterPeriod === '7dias') {
        const inicio7d = diasAtras(7)
        resultado = resultado.filter(e => e.fecha >= inicio7d)
    } else if (eventHistoryStore.filterPeriod === '30dias') {
        const inicio30d = diasAtras(30)
        resultado = resultado.filter(e => e.fecha >= inicio30d)
    }

    // Ordenar de más reciente a más antiguo
    return resultado.sort((a, b) => b.fecha - a.fecha || b.hora.localeCompare(a.hora))
})

/**
 * Computed que agrupa los eventos filtrados por fecha legible.
 * Retorna un array de { fecha: string, eventos: EventEntity[] } ordenado cronológicamente.
 * @type {import('vue').ComputedRef<Array<{ fecha: string, eventos: EventEntity[] }>>}
 */
export const groupedByDate = computed(() => {
    /** @type {Map<string, EventEntity[]>} */
    const mapa = new Map()

    for (const evento of filteredEvents.value) {
        const clave = evento.getFormattedDate()
        if (!mapa.has(clave)) mapa.set(clave, [])
        mapa.get(clave).push(evento)
    }

    // Convertir a array de grupos ordenado (más reciente primero)
    return Array.from(mapa.entries()).map(([fecha, eventos]) => ({ fecha, eventos }))
})