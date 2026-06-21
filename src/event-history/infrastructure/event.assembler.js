/**
 * @fileoverview Ensamblador de la entidad EventEntity.
 * Transforma SecurityAlertResource / AlertIncidentResource (backend real)
 * en instancias del dominio.
 * @module event-history/infrastructure
 */

import { EventEntity } from '../domain/model/event.entity.js'

export class EventAssembler {
    /**
     * Convierte un SecurityAlertResource en un EventEntity.
     * @param {object} resource - { id, type, severity, status, description, sensorId, companyId, triggeredAt, resolvedAt }
     * @returns {EventEntity}
     */
    static fromAlertResource(resource) {
        return new EventEntity({
            id: resource.id,
            kind: 'alert',
            type: resource.type,
            description: resource.description,
            severity: resource.severity,
            status: resource.status,
            sensorId: resource.sensorId,
            companyId: resource.companyId,
            triggeredAt: resource.triggeredAt,
            resolvedAt: resource.resolvedAt,
        })
    }

    /**
     * Convierte un AlertIncidentResource en un EventEntity.
     * @param {object} resource - { id, title, description, status, priority, companyId, createdAt, closedAt }
     * @returns {EventEntity}
     */
    static fromIncidentResource(resource) {
        return new EventEntity({
            id: resource.id,
            kind: 'incident',
            title: resource.title,
            description: resource.description,
            priority: resource.priority,
            status: resource.status,
            companyId: resource.companyId,
            createdAt: resource.createdAt,
            closedAt: resource.closedAt,
        })
    }

    /** @param {object[]} data - SecurityAlertResource[] @returns {EventEntity[]} */
    static alertsFromResponse(data) {
        return (data ?? []).map(EventAssembler.fromAlertResource)
    }

    /** @param {object[]} data - AlertIncidentResource[] @returns {EventEntity[]} */
    static incidentsFromResponse(data) {
        return (data ?? []).map(EventAssembler.fromIncidentResource)
    }
}
