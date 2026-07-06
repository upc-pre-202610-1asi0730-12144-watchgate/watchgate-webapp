import { http } from '../../shared/infrastructure/http.api.js';

const SUBSCRIPTIONS_ENDPOINT = '/subscriptions';
const BILLING_ENDPOINT = '/billing';

export class SubscriptionApi {
    getPlans() {
        return http.get(`${SUBSCRIPTIONS_ENDPOINT}/plans`).then(response => response.data);
    }

    getSubscriptionsByCompanyId(companyId) {
        return http.get(`${SUBSCRIPTIONS_ENDPOINT}/company/${companyId}`).then(response => response.data);
    }

    createSubscription(resource) {
        return http.post(SUBSCRIPTIONS_ENDPOINT, resource).then(response => response.data);
    }

    changePlan(subscriptionId, planId) {
        return http.patch(`${SUBSCRIPTIONS_ENDPOINT}/${subscriptionId}/plan`, { planId }).then(response => response.data);
    }

    cancelSubscription(subscriptionId) {
        return http.patch(`${SUBSCRIPTIONS_ENDPOINT}/${subscriptionId}/cancel`).then(response => response.data);
    }

    processPayment(resource) {
        return http.post(`${BILLING_ENDPOINT}/payments`, resource).then(response => response.data);
    }

    getInvoicesByCompanyId(companyId) {
        return http.get(`${BILLING_ENDPOINT}/invoices/company/${companyId}`).then(response => response.data);
    }

    downloadReceipt(invoiceId) {
        return http.get(`${BILLING_ENDPOINT}/invoices/${invoiceId}/receipt`, { responseType: 'blob' });
    }
}
