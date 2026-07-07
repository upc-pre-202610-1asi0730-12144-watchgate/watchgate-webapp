import { http } from '../../shared/infrastructure/http.api.js';

const REPORTS_ENDPOINT = '/reports';

export class ReportsApi {
    getDashboard(companyId) {
        return http.get(`${REPORTS_ENDPOINT}/dashboard`, { params: { companyId } }).then(response => response.data);
    }

    getReportsByCompanyId(companyId) {
        return http.get(`${REPORTS_ENDPOINT}/company/${companyId}`).then(response => response.data);
    }

    generate(resource) {
        return http.post(REPORTS_ENDPOINT, resource).then(response => response.data);
    }

    download(reportId) {
        return http.get(`${REPORTS_ENDPOINT}/${reportId}/download`, { responseType: 'blob' });
    }

    exportPdf(reportId) {
        return http.get(`${REPORTS_ENDPOINT}/${reportId}/export/pdf`, { responseType: 'blob' });
    }

    schedule(resource) {
        return http.post(`${REPORTS_ENDPOINT}/schedule`, resource).then(response => response.data);
    }

    getScheduledByCompanyId(companyId) {
        return http.get(`${REPORTS_ENDPOINT}/schedule/company/${companyId}`).then(response => response.data);
    }
}
