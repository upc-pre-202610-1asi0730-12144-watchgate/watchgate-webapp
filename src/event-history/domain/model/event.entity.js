/**
 * @fileoverview Entidad de dominio para un evento de seguridad del almacén.
 * Unifica SecurityAlertResource y AlertIncidentResource (backend real) bajo
 * un solo modelo para la vista de Historial de Eventos.
 * @module event-history/domain/model
 */

const SEVERITY_COLORS = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' }

export class EventEntity {
    /**
     * @param {Object} params
     * @param {string|number} params.id
     * @param {'alert'|'incident'} params.kind
     * @param {string} [params.type] - SecurityAlert.Type (solo alerts)
     * @param {string} [params.title] - AlertIncident.Title (solo incidents)
     * @param {string} params.description
     * @param {string} [params.severity] - LOW|MEDIUM|HIGH (solo alerts)
     * @param {string} [params.priority] - LOW|MEDIUM|HIGH (solo incidents)
     * @param {string} params.status - alerts: OPEN|ACKNOWLEDGED|RESOLVED; incidents: OPEN|CLOSED
     * @param {number} [params.sensorId] - solo alerts
     * @param {number} params.companyId
     * @param {string} [params.triggeredAt] - solo alerts
     * @param {string} [params.resolvedAt] - solo alerts
     * @param {string} [params.createdAt] - solo incidents
     * @param {string} [params.closedAt] - solo incidents
     */
    constructor({
                    id, kind, type = null, title = null, description = '',
                    severity = null, priority = null, status = '',
                    sensorId = null, companyId = null,
                    triggeredAt = null, resolvedAt = null,
                    createdAt = null, closedAt = null
                }) {
        this.id = id
        this.kind = kind
        this.type = type
        this.title = title
        this.description = description
        this.severity = severity
        this.priority = priority
        this.status = status
        this.sensorId = sensorId
        this.companyId = companyId
        this.occurredAt = new Date(triggeredAt ?? createdAt)
        this.resolvedAt = resolvedAt ? new Date(resolvedAt) : null
        this.closedAt = closedAt ? new Date(closedAt) : null
    }

    /** Unique key across alerts and incidents (their ids can collide). */
    get key() {
        return `${this.kind}-${this.id}`
    }

    /** Display title: SecurityAlert.Type for alerts, AlertIncident.Title for incidents. */
    get heading() {
        return this.kind === 'incident' ? this.title : this.type
    }

    /** Unified LOW/MEDIUM/HIGH level, sourced from severity (alerts) or priority (incidents). */
    get severityLevel() {
        return this.severity ?? this.priority ?? 'LOW'
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
        const fechaCorta = this.occurredAt.toLocaleDateString('es-PE', opciones)

        if (mismoAnio(this.occurredAt, hoy)) return `Hoy - ${fechaCorta}`
        if (mismoAnio(this.occurredAt, ayer)) return `Ayer - ${fechaCorta}`
        return fechaCorta
    }

    /** @returns {string} Hora del evento, ej. "10:30 AM" */
    getFormattedTime() {
        return this.occurredAt.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit' })
    }

    /** @returns {string} Color hexadecimal asociado a la severidad/prioridad del evento. */
    getColor() {
        return SEVERITY_COLORS[this.severityLevel] ?? '#6b7280'
    }

    /** @returns {boolean} true si es una alerta aún sin resolver (requiere badge "ALERTA"). */
    esAlerta() {
        return this.kind === 'alert' && this.status === 'OPEN'
    }
}
