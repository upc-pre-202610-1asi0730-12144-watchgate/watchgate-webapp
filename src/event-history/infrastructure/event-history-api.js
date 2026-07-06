/**
 * @fileoverview Cliente HTTP para el módulo de Historial de Eventos.
 * Consume los endpoints reales de SecurityAlerts del backend Locksight,
 * filtrados por warehouseId (vía el facade ACL SensorIntegration -> WarehouseManagement).
 * @module event-history/infrastructure
 */

import { http } from '../../shared/infrastructure/http.api.js'

const SECURITY_ALERTS_ENDPOINT = import.meta.env.VITE_SECURITY_ALERTS_ENDPOINT_PATH || '/security-alerts'
const REPORTS_ENDPOINT = import.meta.env.VITE_REPORTS_ENDPOINT_PATH || '/reports'

/**
 * API del módulo Historial de Eventos e Incidentes.
 */
export const eventHistoryApi = {
    /**
     * Obtiene las alertas de seguridad de un almacén.
     * @param {string|number} warehouseId
     * @returns {Promise<import('axios').AxiosResponse>} SecurityAlertResource[]
     */
    getEvents(warehouseId) {
        return http.get(`${SECURITY_ALERTS_ENDPOINT}/warehouse/${warehouseId}`)
    },

    /**
     * Obtiene los incidentes de seguridad de un almacén.
     * @param {string|number} warehouseId
     * @returns {Promise<import('axios').AxiosResponse>} AlertIncidentResource[]
     */
    getIncidents(warehouseId) {
        return http.get(`${SECURITY_ALERTS_ENDPOINT}/incidents/warehouse/${warehouseId}`)
    },

    acknowledgeAlert(alertId) {
        return http.patch(`${SECURITY_ALERTS_ENDPOINT}/${alertId}/acknowledge`)
    },

    attendAlert(alertId) {
        return http.patch(`${SECURITY_ALERTS_ENDPOINT}/${alertId}/attend`)
    },

    escalateAlert(alertId) {
        return http.patch(`${SECURITY_ALERTS_ENDPOINT}/${alertId}/escalate`)
    },

    flagFalseAlarm(alertId) {
        return http.patch(`${SECURITY_ALERTS_ENDPOINT}/${alertId}/false-alarm`)
    },

    getEventLog(params) {
        return http.get(`${REPORTS_ENDPOINT}/event-log`, { params })
    }
}
