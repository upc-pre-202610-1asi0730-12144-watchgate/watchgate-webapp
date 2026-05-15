/**
 * @fileoverview Entidad de dominio para un Evento de Seguridad.
 * Representa un evento registrado por el sistema de monitoreo IoT del almacén.
 * @module event-history/domain/model
 */

/**
 * Clase que modela un evento de seguridad dentro del almacén.
 * Puede ser una alerta crítica, advertencia o evento normal.
 */
export class EventEntity {
    /**
     * @param {Object} params - Parámetros del evento
     * @param {string|number} params.id - Identificador único del evento
     * @param {'alerta'|'advertencia'|'normal'} params.tipo - Criticidad del evento
     * @param {string} params.nombre - Nombre descriptivo del evento
     * @param {string} params.descripcion - Descripción detallada del evento
     * @param {string} params.sensor - Sensor que originó el evento (ej. "S1")
     * @param {string} params.usuario - Usuario relacionado al evento (si aplica)
     * @param {string} params.hora - Hora del evento en formato HH:MM AM/PM
     * @param {Date} params.fecha - Fecha completa del evento
     */
    constructor({ id, tipo, nombre, descripcion, sensor, usuario, hora, fecha }) {
        this.id = id
        this.tipo = tipo           // 'alerta' | 'advertencia' | 'normal'
        this.nombre = nombre
        this.descripcion = descripcion
        this.sensor = sensor
        this.usuario = usuario
        this.hora = hora
        this.fecha = fecha instanceof Date ? fecha : new Date(fecha)
    }

    /**
     * Retorna la fecha del evento en formato legible para el historial agrupado.
     * Ejemplo: "Hoy - 23 Abr" o "Ayer - 22 Abr" o "20 Abr"
     * @returns {string} Fecha formateada
     */
    getFormattedDate() {
        const hoy = new Date()
        const ayer = new Date()
        ayer.setDate(ayer.getDate() - 1)

        const mismoAnio = (a, b) =>
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate()

        const opciones = { day: 'numeric', month: 'short' }
        const fechaCorta = this.fecha.toLocaleDateString('es-PE', opciones)

        if (mismoAnio(this.fecha, hoy)) return `Hoy - ${fechaCorta}`
        if (mismoAnio(this.fecha, ayer)) return `Ayer - ${fechaCorta}`
        return fechaCorta
    }

    /**
     * Retorna el color CSS asociado a la criticidad del evento.
     * @returns {string} Color hexadecimal o variable CSS
     */
    getColorPorTipo() {
        const colores = {
            alerta: '#ef4444',
            advertencia: '#f59e0b',
            normal: '#22c55e',
        }
        return colores[this.tipo] ?? '#6b7280'
    }

    /**
     * Indica si el evento es una alerta crítica (requiere badge "ALERTA").
     * @returns {boolean}
     */
    esAlerta() {
        return this.tipo === 'alerta'
    }
}