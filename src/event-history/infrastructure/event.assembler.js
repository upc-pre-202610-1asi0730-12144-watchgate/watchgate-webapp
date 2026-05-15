/**
 * @fileoverview Ensamblador de la entidad EventEntity.
 * Transforma los recursos crudos del API en instancias del dominio.
 * Sigue el mismo patrón que ArticleAssembler del proyecto base.
 * @module event-history/infrastructure
 */

import { EventEntity } from '../domain/model/event.entity.js'

/**
 * Clase estática que mapea la respuesta del API a entidades del dominio.
 * Desacopla la capa de infraestructura del dominio.
 */
export class EventAssembler {
    /**
     * Convierte un recurso (objeto JSON del API) en una instancia de EventEntity.
     * @param {Object} resource - Objeto crudo proveniente del backend
     * @param {string|number} resource.id
     * @param {string} resource.tipo
     * @param {string} resource.nombre
     * @param {string} resource.descripcion
     * @param {string} resource.sensor
     * @param {string} resource.usuario
     * @param {string} resource.hora
     * @param {string} resource.fecha - ISO string o fecha parseable
     * @returns {EventEntity}
     */
    static toEntityFromResource(resource) {
        return new EventEntity({
            id: resource.id,
            tipo: resource.tipo ?? 'normal',
            nombre: resource.nombre ?? resource.name ?? '',
            descripcion: resource.descripcion ?? resource.description ?? '',
            sensor: resource.sensor ?? '',
            usuario: resource.usuario ?? resource.user ?? '',
            hora: resource.hora ?? resource.time ?? '',
            fecha: resource.fecha ? new Date(resource.fecha) : new Date(),
        })
    }

    /**
     * Convierte la respuesta completa del API (array de recursos) en un array de EventEntity.
     * @param {Object[]|Object} response - Lista de recursos del API o respuesta envuelta en { data }
     * @returns {EventEntity[]}
     */
    static toEntitiesFromResponse(response) {
        const list = Array.isArray(response) ? response : (response?.data ?? [])
        return list.map(resource => EventAssembler.toEntityFromResource(resource))
    }
}