/**
 * @fileoverview Ensamblador de la entidad SensorEntity.
 * Transforma SensorResource (backend real) en instancias del dominio.
 * @module event-history/infrastructure
 */

import { SensorEntity } from '../domain/model/sensor.entity.js'

export class SensorAssembler {
    /**
     * Convierte un SensorResource en una instancia de SensorEntity.
     * @param {object} resource - { id, name, type, status, unit, lastReading, lastReadingAt, zoneId, companyId }
     * @returns {SensorEntity}
     */
    static toEntityFromResource(resource) {
        return new SensorEntity({
            id: resource.id,
            name: resource.name,
            type: resource.type,
            status: resource.status,
            unit: resource.unit,
            lastReading: resource.lastReading,
            lastReadingAt: resource.lastReadingAt,
            zoneId: resource.zoneId,
            companyId: resource.companyId,
        })
    }
}
