/**
 * @fileoverview Entidad de dominio para un Sensor IoT del almacén.
 * Mapea 1:1 contra SensorResource del backend (SensorIntegration).
 * @module event-history/domain/model
 */

export class SensorEntity {
    /**
     * @param {Object} params - SensorResource real
     * @param {string|number} params.id
     * @param {string} params.name
     * @param {string} params.type - ej. 'MOTION', 'DOOR', 'TEMPERATURE'
     * @param {string} params.status - ej. 'ACTIVE', 'INACTIVE'
     * @param {string|null} [params.unit]
     * @param {number|null} [params.lastReading]
     * @param {string|null} [params.lastReadingAt]
     * @param {number} params.zoneId
     * @param {number} params.companyId
     */
    constructor({ id, name, type, status, unit = null, lastReading = null, lastReadingAt = null, zoneId, companyId }) {
        this.id = id
        this.name = name
        this.type = type
        this.status = status
        this.unit = unit
        this.lastReading = lastReading
        this.lastReadingAt = lastReadingAt ? new Date(lastReadingAt) : null
        this.zoneId = zoneId
        this.companyId = companyId

        // El backend todavía no modela una posición física para el sensor.
        // Se deriva una pseudo-posición estable a partir del id, solo para
        // tener algo determinístico que dibujar en el mapa de live-monitoring
        // hasta que existan coordenadas reales.
        const seed = Number(id) || 0
        this.posicion = { x: 15 + (seed * 37) % 70, y: 20 + (seed * 53) % 60 }
    }

    /** @returns {string} Color hexadecimal según el estado real del sensor. */
    getColorEstado() {
        return this.status === 'ACTIVE' ? '#22c55e' : '#ef4444'
    }

    /** @returns {string} Etiqueta corta del sensor para el mapa (ej. "Puerta Princ…"). */
    getEtiquetaMapa() {
        return this.name.length > 12 ? this.name.slice(0, 12) + '…' : this.name
    }
}
