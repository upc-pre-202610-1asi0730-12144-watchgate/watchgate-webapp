<script setup>
import { computed, onMounted, ref } from 'vue';
import { useIamStore } from '../../../iam/application/iam.store.js';
import { SubscriptionApi } from '../../infrastructure/subscription-api.js';
import { nextMonthlyBillingDate } from '../../../shared/infrastructure/date-format.js';

const iamStore = useIamStore();
const api = new SubscriptionApi();
const plans = ref([]);
const subscriptions = ref([]);
const invoices = ref([]);
const error = ref('');
const loading = ref(false);
const message = ref('');
const showPayment = ref(false);
const pendingPlan = ref(null);
const card = ref({ number: '', holder: '', expiry: '', cvv: '' });
const companyId = computed(() => iamStore.currentUser?.companyId);
const activeSubscription = computed(() => subscriptions.value.find(item => item.status === 'ACTIVE'));
const activePlan = computed(() => plans.value.find(plan => plan.id === activeSubscription.value?.planId));
const nextBillingDate = computed(() => nextMonthlyBillingDate());

async function load() {
  if (!companyId.value) return;
  loading.value = true;
  error.value = '';
  try {
    const [planResponse, subscriptionResponse, invoiceResponse] = await Promise.all([
      api.getPlans(),
      api.getCompanySubscriptions(companyId.value),
      api.getCompanyInvoices(companyId.value)
    ]);
    plans.value = planResponse.data;
    subscriptions.value = subscriptionResponse.data;
    invoices.value = invoiceResponse.data;
  } catch (e) {
    error.value = e.response?.data?.detail || e.message;
  } finally {
    loading.value = false;
  }
}

async function selectPlan(plan) {
  pendingPlan.value = plan;
  showPayment.value = true;
}

async function pay() {
  const targetPlan = pendingPlan.value || activePlan.value;
  if (!companyId.value || !targetPlan) return;
  error.value = '';
  message.value = '';
  try {
    let subscription = activeSubscription.value;
    if (pendingPlan.value) {
      if (activeSubscription.value) {
        const response = await api.changePlan(activeSubscription.value.id, targetPlan.id);
        subscription = response.data;
      } else {
        const response = await api.createSubscription(companyId.value, targetPlan.id);
        subscription = response.data;
      }
    }
    if (subscription) await api.processPayment(subscription.id);
    message.value = `Payment processed. Next billing date: ${nextBillingDate.value}.`;
    showPayment.value = false;
    pendingPlan.value = null;
    card.value = { number: '', holder: '', expiry: '', cvv: '' };
    await load();
  } catch (e) {
    error.value = e.response?.data?.detail || e.message;
  }
}

onMounted(async () => {
  if (!iamStore.currentUser) await iamStore.restoreSession();
  await load();
});
</script>

<template>
  <main class="page-shell">
    <header class="page-header">
      <div>
        <h1>Subscription & Billing</h1>
        <p>Manage plans, payment processing and receipts.</p>
        <small>Signed in as {{ iamStore.currentUser?.fullName || iamStore.currentUser?.email }} · Current plan: {{ activePlan?.name || 'No active plan' }}</small>
      </div>
      <button :disabled="!activeSubscription" @click="showPayment = true">Process payment</button>
    </header>

    <p v-if="error" class="alert">{{ error }}</p>
    <p v-if="message" class="success">{{ message }}</p>
    <p v-if="loading">Loading...</p>

    <section class="summary">
      <span>Plan</span><strong>{{ activePlan?.name || 'None selected' }}</strong>
      <span>Monthly billing</span><strong>{{ activePlan ? `$${activePlan.monthlyPrice}` : '-' }}</strong>
      <span>Next billing date</span><strong>{{ activeSubscription ? nextBillingDate : '-' }}</strong>
    </section>

    <section class="plans">
      <article v-for="plan in plans" :key="plan.id" class="panel">
        <h2>{{ plan.name }}</h2>
        <strong>${{ plan.monthlyPrice }}</strong>
        <p>{{ plan.description }}</p>
        <small>{{ plan.maxWarehouses }} warehouses · {{ plan.maxSensors }} sensors</small>
        <button @click="selectPlan(plan)">
          {{ activeSubscription?.planId === plan.id ? 'Current plan' : 'Select plan' }}
        </button>
      </article>
    </section>

    <section class="panel">
      <h2>Invoices</h2>
      <div class="row head"><span>Number</span><span>Amount</span><span>Status</span><span></span></div>
      <div v-for="invoice in invoices" :key="invoice.id" class="row">
        <span>{{ invoice.number }}</span>
        <span>{{ invoice.currency }} {{ invoice.amount }}</span>
        <span>{{ invoice.status }}</span>
        <a :href="api.receiptUrl(invoice.id)" target="_blank">Receipt</a>
      </div>
    </section>

    <div v-if="showPayment" class="modal-backdrop">
      <section class="payment-modal">
        <header>
          <h2>Payment simulation</h2>
          <button class="icon-button" @click="showPayment = false">×</button>
        </header>
        <p>Plan: {{ pendingPlan?.name || activePlan?.name }} · Next monthly charge: {{ nextBillingDate }}</p>
        <div class="payment-grid">
          <label>Card holder<input v-model="card.holder" placeholder="Luis Bardales"></label>
          <label>Card number<input v-model="card.number" inputmode="numeric" placeholder="4242 4242 4242 4242"></label>
          <label>Expiry<input v-model="card.expiry" placeholder="12/29"></label>
          <label>CVV<input v-model="card.cvv" inputmode="numeric" placeholder="123"></label>
        </div>
        <button class="pay-button" @click="pay">Confirm simulated payment</button>
      </section>
    </div>
  </main>
</template>

<style scoped>
.page-shell { padding: 2rem; color: #e5e7eb; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; }
h1, h2, p { margin: 0; }
h1 { font-size: 1.9rem; line-height: 1.1; }
p, small { color: #94a3b8; }
.plans { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 1rem; }
.panel { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 1rem; }
.panel strong { display: block; margin: .8rem 0; font-size: 1.5rem; color: #93c5fd; }
button, a { display: inline-block; background: #2563eb; border: 0; color: white; border-radius: 6px; padding: .65rem .9rem; text-decoration: none; margin-top: .9rem; cursor: pointer; }
button:disabled { opacity: .45; cursor: not-allowed; }
.row { display: grid; grid-template-columns: 1.4fr .8fr .8fr auto; gap: .75rem; align-items: center; padding: .7rem; background: #0f172a; border-radius: 6px; margin-top: .4rem; }
.head { color: #93c5fd; font-weight: 700; }
.alert { background: #7f1d1d; color: #fecaca; padding: .75rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
.success { background: #064e3b; color: #bbf7d0; padding: .75rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
.summary { display: grid; grid-template-columns: repeat(3, minmax(160px, 1fr)); gap: .5rem 1rem; background: #0f172a; border: 1px solid #1f2937; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
.summary span { color: #94a3b8; font-size: .8rem; }
.summary strong { color: #e5e7eb; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(2, 6, 23, .72); display: grid; place-items: center; z-index: 20; }
.payment-modal { width: min(520px, calc(100vw - 2rem)); background: #111827; border: 1px solid #334155; border-radius: 8px; padding: 1rem; }
.payment-modal header { display: flex; justify-content: space-between; align-items: center; margin-bottom: .75rem; }
.icon-button { width: 36px; height: 36px; border-radius: 50%; padding: 0; margin: 0; background: #1f2937; }
.payment-grid { display: grid; grid-template-columns: 1fr 1fr; gap: .75rem; margin-top: 1rem; }
.payment-grid label { display: grid; gap: .35rem; color: #cbd5e1; font-size: .85rem; }
.payment-grid input { background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #e5e7eb; padding: .65rem; min-width: 0; }
.pay-button { width: 100%; margin-top: 1rem; }
@media (max-width: 760px) {
  .page-header, .summary, .payment-grid { grid-template-columns: 1fr; display: grid; }
}
</style>
