import { http } from '../../shared/infrastructure/http.api.js';

const ALERTS_ENDPOINT = '/security-alerts';

export class AlertsApi {
    getByCompanyId(companyId) {
        return http.get(`${ALERTS_ENDPOINT}/company/${companyId}`).then(response => response.data);
    }

    create(resource) {
        return http.post(ALERTS_ENDPOINT, resource).then(response => response.data);
    }

    acknowledge(alertId) {
        return http.patch(`${ALERTS_ENDPOINT}/${alertId}/acknowledge`).then(response => response.data);
    }

    markAsAttended(alertId) {
        return http.patch(`${ALERTS_ENDPOINT}/${alertId}/attend`).then(response => response.data);
    }

    escalate(alertId) {
        return http.patch(`${ALERTS_ENDPOINT}/${alertId}/escalate`).then(response => response.data);
    }

    resolve(alertId) {
        return http.patch(`${ALERTS_ENDPOINT}/${alertId}/resolve`).then(response => response.data);
    }

    flagAsFalseAlarm(alertId) {
        return http.patch(`${ALERTS_ENDPOINT}/${alertId}/false-alarm`).then(response => response.data);
    }
}
