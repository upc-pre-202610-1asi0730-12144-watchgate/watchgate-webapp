import { http } from '../../shared/infrastructure/http.api.js';

const SUBSCRIPTIONS_ENDPOINT = import.meta.env.VITE_SUBSCRIPTIONS_ENDPOINT_PATH || '/subscriptions';
const BILLING_ENDPOINT = import.meta.env.VITE_BILLING_ENDPOINT_PATH || '/billing';

export class SubscriptionApi {
    getPlans() {
        return http.get(`${SUBSCRIPTIONS_ENDPOINT}/plans`);
    }

    getCompanySubscriptions(companyId) {
        return http.get(`${SUBSCRIPTIONS_ENDPOINT}/company/${companyId}`);
    }

    createSubscription(companyId, planId) {
        return http.post(SUBSCRIPTIONS_ENDPOINT, { companyId, planId });
    }

    changePlan(subscriptionId, planId) {
        return http.patch(`${SUBSCRIPTIONS_ENDPOINT}/${subscriptionId}/plan`, { planId });
    }

    cancel(subscriptionId) {
        return http.patch(`${SUBSCRIPTIONS_ENDPOINT}/${subscriptionId}/cancel`);
    }

    processPayment(subscriptionId, currency = 'USD') {
        return http.post(`${BILLING_ENDPOINT}/payments`, {
            subscriptionId,
            currency,
            providerReference: `web-${Date.now()}`,
            simulateFailure: false
        });
    }

    getCompanyInvoices(companyId) {
        return http.get(`${BILLING_ENDPOINT}/invoices/company/${companyId}`);
    }

    receiptUrl(invoiceId) {
        return `${http.defaults.baseURL}${BILLING_ENDPOINT}/invoices/${invoiceId}/receipt`;
    }
}
