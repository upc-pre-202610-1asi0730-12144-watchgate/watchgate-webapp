/**
 * @fileoverview Entidad de dominio para un Sensor IoT del almacén.
 * Modela un dispositivo físico instalado en el almacén con posición y estado.
 * @module event-history/domain/model
 */

/**
 * Clase que modela un sensor IoT dentro de un almacén.
 * Cada sensor tiene una posición relativa (x, y en porcentaje) para ubicarlo en el mapa.
 */
export class SensorEntity {
    /**
     * @param {Object} params - Parámetros del sensor
     * @param {string|number} params.id - Identificador único del sensor
     * @param {string} params.nombre - Nombre descriptivo (ej. "S1-Puerta Principal")
     * @param {string} params.estado - Estado actual (ej. "Cerrada", "Normal", "Mov. Detectado")
     * @param {string} params.zona - Zona del almacén donde está instalado (ej. "ZONA DE CARGA")
     * @param {{ x: number, y: number }} params.posicion - Posición en porcentaje (0-100) para el mapa SVG
     */
    constructor({ id, nombre, estado, zona, posicion }) {
        this.id = id
        this.nombre = nombre
        this.estado = estado
        this.zona = zona
        /** @type {{ x: number, y: number }} */
        this.posicion = posicion ?? { x: 50, y: 50 }
    }

    /**
     * Retorna el color del punto del sensor según su estado actual.
     * Rojo = alerta activa, Amarillo = advertencia, Verde = normal.
     * @returns {string} Color hexadecimal
     */
    getColorEstado() {
        const estadosAlerta = ['alerta', 'abierta', 'fallo']
        const estadosAdvertencia = ['advertencia', 'mov. detectado', 'desconectado', 'inactivo']

        const estadoNorm = this.estado.toLowerCase()
        if (estadosAlerta.some(e => estadoNorm.includes(e))) return '#ef4444'
        if (estadosAdvertencia.some(e => estadoNorm.includes(e))) return '#f59e0b'
        return '#22c55e'
    }

    /**
     * Retorna la etiqueta corta del sensor para mostrar en el mapa (ej. "S1-Puerta").
     * @returns {string}
     */
    getEtiquetaMapa() {
        return this.nombre.length > 12 ? this.nombre.slice(0, 12) + '…' : this.nombre
    }
}