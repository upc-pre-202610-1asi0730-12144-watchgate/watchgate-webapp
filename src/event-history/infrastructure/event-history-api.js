/**
 * @fileoverview Cliente HTTP para el módulo de Historial de Eventos.
 * Consume los endpoints del backend Locksight para obtener eventos y sensores.
 * @module event-history/infrastructure
 */

import axios from 'axios'

/**
 * Instancia de Axios configurada con la base URL del API Locksight.
 * La URL se lee desde la variable de entorno VITE_LOCKSIGHT_API_URL.
 * @type {import('axios').AxiosInstance}
 */
const http = axios.create({
    baseURL: import.meta.env.VITE_LOCKSIGHT_API_URL ?? 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
})

/**
 * API del módulo Historial de Eventos e Incidentes.
 * Contiene los métodos para obtener datos desde el servidor.
 */
export const eventHistoryApi = {
    /**
     * Obtiene el listado de eventos registrados para un almacén específico.
     * @param {string|number} warehouseId - ID del almacén
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getEvents(warehouseId) {
        return http.get(`/warehouses/${warehouseId}/events`)
    },

    /**
     * Obtiene el listado de sensores instalados en un almacén específico.
     * @param {string|number} warehouseId - ID del almacén
     * @returns {Promise<import('axios').AxiosResponse>}
     */
    getSensors(warehouseId) {
        return http.get(`/warehouses/${warehouseId}/sensors`)
    },
}