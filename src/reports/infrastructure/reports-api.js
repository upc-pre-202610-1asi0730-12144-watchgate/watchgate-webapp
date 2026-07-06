import { http } from '../../shared/infrastructure/http.api.js';

const REPORTS_ENDPOINT = import.meta.env.VITE_REPORTS_ENDPOINT_PATH || '/reports';

export class ReportsApi {
    getDashboard(companyId) {
        return http.get(`${REPORTS_ENDPOINT}/dashboard`, { params: { companyId } });
    }

    getEventLog(params) {
        return http.get(`${REPORTS_ENDPOINT}/event-log`, { params });
    }

    getCompanyReports(companyId) {
        return http.get(`${REPORTS_ENDPOINT}/company/${companyId}`);
    }

    generateReport(resource) {
        return http.post(REPORTS_ENDPOINT, resource);
    }

    scheduleReport(resource) {
        return http.post(`${REPORTS_ENDPOINT}/schedule`, resource);
    }

    pdfUrl(reportId) {
        return `${http.defaults.baseURL}${REPORTS_ENDPOINT}/${reportId}/export/pdf`;
    }

    async downloadPdf(reportId) {
        const response = await http.get(`${REPORTS_ENDPOINT}/${reportId}/export/pdf`, {
            responseType: 'blob'
        });
        const url = URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
        window.open(url, '_blank');
        setTimeout(() => URL.revokeObjectURL(url), 30000);
    }
}
