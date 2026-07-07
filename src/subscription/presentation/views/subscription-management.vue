<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { SubscriptionApi } from '../../infrastructure/subscription-api.js';
import { useIamStore } from '../../../iam/application/iam.store.js';

const subscriptionApi = new SubscriptionApi();
const { t, locale } = useI18n();
const iamStore = useIamStore();

const plans = ref([]);
const subscriptions = ref([]);
const invoices = ref([]);
const loading = ref(false);
const actionLoading = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const activeSubscription = computed(() =>
    subscriptions.value.find(subscription => subscription.status === 'ACTIVE') ?? null
);

const currentPlan = computed(() =>
    plans.value.find(plan => plan.id === activeSubscription.value?.planId) ?? null
);

function formatMoney(value) {
    return new Intl.NumberFormat(locale.value === 'es' ? 'es-PE' : 'en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
    }).format(Number(value ?? 0));
}

function formatDate(value) {
    return value ? new Date(value).toLocaleDateString(locale.value === 'es' ? 'es-PE' : 'en-US') : '-';
}

function loadSubscriptionData() {
    const companyId = iamStore.currentUser?.companyId;
    if (!companyId) return Promise.resolve();

    loading.value = true;
    errorMessage.value = '';

    return Promise.all([
        subscriptionApi.getPlans(),
        subscriptionApi.getSubscriptionsByCompanyId(companyId),
        subscriptionApi.getInvoicesByCompanyId(companyId),
    ]).then(([plansData, subscriptionsData, invoicesData]) => {
        plans.value = plansData;
        subscriptions.value = subscriptionsData.sort((a, b) => new Date(b.startedAt) - new Date(a.startedAt));
        invoices.value = invoicesData.sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt));
    }).catch(error => {
        console.error(error);
        errorMessage.value = t('subscription.messages.loadError');
    }).finally(() => {
        loading.value = false;
    });
}

function selectPlan(plan) {
    const companyId = iamStore.currentUser?.companyId;
    if (!companyId || actionLoading.value) return;

    actionLoading.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    const request = activeSubscription.value
        ? subscriptionApi.changePlan(activeSubscription.value.id, plan.id)
        : subscriptionApi.createSubscription({ companyId, planId: plan.id });

    request.then(subscription => {
        upsertSubscription(subscription);
        successMessage.value = activeSubscription.value?.id === subscription.id
            ? t('subscription.messages.planUpdated')
            : t('subscription.messages.created');
    }).catch(error => {
        console.error(error);
        errorMessage.value = t('subscription.messages.selectError');
    }).finally(() => {
        actionLoading.value = false;
    });
}

function cancelCurrentSubscription() {
    if (!activeSubscription.value || actionLoading.value) return;

    actionLoading.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    subscriptionApi.cancelSubscription(activeSubscription.value.id)
        .then(subscription => {
            upsertSubscription(subscription);
            successMessage.value = t('subscription.messages.cancelled');
        })
        .catch(error => {
            console.error(error);
            errorMessage.value = t('subscription.messages.cancelError');
        })
        .finally(() => {
            actionLoading.value = false;
        });
}

function processPayment() {
    if (!activeSubscription.value || actionLoading.value) return;

    actionLoading.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    subscriptionApi.processPayment({
        subscriptionId: activeSubscription.value.id,
        currency: 'USD',
        providerReference: `STRIPE-${Date.now()}`,
        simulateFailure: false,
    }).then(invoice => {
        invoices.value = [invoice, ...invoices.value];
        successMessage.value = t('subscription.messages.paymentProcessed');
    }).catch(error => {
        console.error(error);
        errorMessage.value = t('subscription.messages.paymentError');
    }).finally(() => {
        actionLoading.value = false;
    });
}

function upsertSubscription(subscription) {
    const exists = subscriptions.value.some(item => item.id === subscription.id);
    subscriptions.value = exists
        ? subscriptions.value.map(item => item.id === subscription.id ? subscription : item)
        : [subscription, ...subscriptions.value];
}

function saveReceipt(response, invoice) {
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${invoice.number}.txt`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
}

function downloadReceipt(invoice) {
    subscriptionApi.downloadReceipt(invoice.id)
        .then(response => saveReceipt(response, invoice))
        .catch(error => {
            console.error(error);
            errorMessage.value = t('subscription.messages.receiptError');
        });
}

onMounted(() => {
    if (!iamStore.sessionLoading) loadSubscriptionData();
});

watch(() => iamStore.sessionLoading, (loading) => {
    if (!loading) loadSubscriptionData();
});
</script>

<template>
  <div class="subscription-view">
    <header class="page-header">
      <div>
        <h1>{{ t('subscription.title') }}</h1>
        <p>{{ t('subscription.subtitle') }}</p>
      </div>
      <div class="current-plan">
        <span>{{ t('subscription.currentPlan') }}</span>
        <strong>{{ currentPlan?.name ?? t('subscription.noActivePlan') }}</strong>
        <small>{{ activeSubscription?.status ?? t('common.pendingUpper') }}</small>
      </div>
    </header>

    <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="message success">{{ successMessage }}</p>

    <section class="panel">
      <h2>{{ t('subscription.plans.title') }}</h2>
      <div v-if="loading" class="empty">{{ t('subscription.plans.loading') }}</div>
      <div v-else class="plans-grid">
        <article v-for="plan in plans" :key="plan.id" class="plan-card" :class="{ selected: plan.id === currentPlan?.id }">
          <div>
            <h3>{{ plan.name }}</h3>
            <p>{{ plan.description }}</p>
          </div>
          <strong class="price">{{ formatMoney(plan.monthlyPrice) }}<span>{{ t('subscription.plans.perMonth') }}</span></strong>
          <ul>
            <li>{{ t('subscription.plans.warehouseLimit', { count: plan.maxWarehouses }) }}</li>
            <li>{{ t('subscription.plans.sensorLimit', { count: plan.maxSensors }) }}</li>
          </ul>
          <button type="button" :disabled="actionLoading || plan.id === currentPlan?.id" @click="selectPlan(plan)">
            {{ plan.id === currentPlan?.id ? t('subscription.actions.activePlan') : t('subscription.actions.selectPlan') }}
          </button>
        </article>
      </div>
    </section>

    <section class="panel actions-panel">
      <div>
        <h2>{{ t('subscription.billing.title') }}</h2>
        <p>{{ t('subscription.billing.subtitle') }}</p>
      </div>
      <div class="billing-actions">
        <button type="button" :disabled="!activeSubscription || actionLoading" @click="processPayment">
          {{ t('subscription.actions.processPayment') }}
        </button>
        <button class="danger" type="button" :disabled="!activeSubscription || actionLoading" @click="cancelCurrentSubscription">
          {{ t('subscription.actions.cancel') }}
        </button>
      </div>
    </section>

    <section class="panel">
      <h2>{{ t('subscription.invoices.title') }}</h2>
      <div v-if="!invoices.length" class="empty">{{ t('subscription.invoices.empty') }}</div>
      <div v-else class="invoice-list">
        <article v-for="invoice in invoices" :key="invoice.id" class="invoice-card">
          <div>
            <h3>{{ invoice.number }}</h3>
            <p>{{ formatMoney(invoice.amount) }} {{ invoice.currency }} - {{ invoice.status }}</p>
            <small>{{ formatDate(invoice.issuedAt) }}</small>
          </div>
          <button type="button" @click="downloadReceipt(invoice)">{{ t('subscription.actions.download') }}</button>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.subscription-view { color: #e5eefb; display: flex; flex-direction: column; gap: 1.25rem; }
.page-header { display: flex; justify-content: space-between; gap: 1rem; align-items: flex-start; }
h1, h2, h3, p { margin-top: 0; }
.page-header h1 { margin-bottom: 0.4rem; font-size: 1.6rem; }
.page-header p, .empty, small, .actions-panel p { color: #94a3b8; }
.current-plan { background: #102035; border: 1px solid #1e2d42; border-radius: 8px; min-width: 220px; padding: 1rem; }
.current-plan span, .current-plan small { display: block; color: #94a3b8; }
.current-plan strong { display: block; font-size: 1.25rem; margin: 0.35rem 0; }
.panel { background: #102035; border: 1px solid #1e2d42; border-radius: 8px; padding: 1.25rem; }
.panel h2 { font-size: 1rem; margin-bottom: 1rem; }
.plans-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 0.85rem; }
.plan-card { background: #0a1726; border: 1px solid #1e2d42; border-radius: 8px; display: flex; flex-direction: column; gap: 0.85rem; padding: 1rem; }
.plan-card.selected { border-color: #3b82f6; box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.4); }
.plan-card h3 { margin-bottom: 0.35rem; }
.plan-card p, .plan-card li { color: #cbd5e1; }
.plan-card ul { margin: 0; padding-left: 1.1rem; }
.price { font-size: 1.45rem; }
.price span { color: #94a3b8; font-size: 0.85rem; margin-left: 0.2rem; }
button { background: #3b82f6; border: 0; border-radius: 6px; color: #fff; cursor: pointer; font-weight: 700; min-height: 42px; padding: 0.65rem 0.9rem; }
button:disabled { opacity: 0.6; cursor: not-allowed; }
button.danger { background: #ef4444; }
.actions-panel { display: flex; justify-content: space-between; gap: 1rem; align-items: center; }
.billing-actions { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.invoice-list { display: flex; flex-direction: column; gap: 0.75rem; }
.invoice-card { background: #0a1726; border: 1px solid #1e2d42; border-radius: 8px; display: flex; justify-content: space-between; gap: 1rem; padding: 1rem; }
.invoice-card h3 { margin-bottom: 0.35rem; }
.invoice-card p { color: #cbd5e1; margin-bottom: 0.35rem; }
.message { border-radius: 8px; padding: 0.8rem 1rem; margin: 0; }
.error { background: rgba(239, 68, 68, 0.12); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.35); }
.success { background: rgba(34, 197, 94, 0.12); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.35); }
@media (max-width: 900px) {
  .page-header, .actions-panel, .invoice-card { flex-direction: column; }
  .current-plan { width: 100%; }
}
</style>
