/**
 * @fileoverview Ensamblador de la entidad SensorEntity.
 * Transforma los recursos crudos del API en instancias del dominio.
 * Sigue el mismo patrón que SourceAssembler del proyecto base.
 * @module event-history/infrastructure
 */

import { SensorEntity } from '../domain/model/sensor.entity.js'

/**
 * Clase estática que mapea la respuesta del API a entidades de sensor del dominio.
 */
export class SensorAssembler {
    /**
     * Convierte un recurso (objeto JSON del API) en una instancia de SensorEntity.
     * @param {Object} resource - Objeto crudo proveniente del backend
     * @param {string|number} resource.id
     * @param {string} resource.nombre
     * @param {string} resource.estado
     * @param {string} resource.zona
     * @param {{ x: number, y: number }} resource.posicion
     * @returns {SensorEntity}
     */
    static toEntityFromResource(resource) {
        return new SensorEntity({
            id: resource.id,
            nombre: resource.nombre ?? resource.name ?? '',
            estado: resource.estado ?? resource.status ?? 'Normal',
            zona: resource.zona ?? resource.zone ?? '',
            posicion: resource.posicion ?? resource.position ?? { x: 50, y: 50 },
        })
    }

    /**
     * Convierte la respuesta completa del API en un array de SensorEntity.
     * @param {Object[]|Object} response - Lista de recursos o respuesta envuelta en { data }
     * @returns {SensorEntity[]}
     */
    static toEntitiesFromResponse(response) {
        const list = Array.isArray(response) ? response : (response?.data ?? [])
        return list.map(resource => SensorAssembler.toEntityFromResource(resource))
    }
}