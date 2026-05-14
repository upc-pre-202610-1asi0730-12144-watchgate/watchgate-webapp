<script setup>
import { ref, toRefs } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useIamStore } from '../../application/iam.store.js';
import ToolbarContent from "../components/toolbar-content.vue";

const { t } = useI18n();
const router = useRouter();
const store = useIamStore();

const { errors } = toRefs(store);
const { checkEmailExists } = store;

const form = ref({ email: '' });
const isSubmitting = ref(false);
const showSuccessMessage = ref(false);

const onRecover = () => {
  isSubmitting.value = true;
  showSuccessMessage.value = false;

  checkEmailExists(form.value.email).then(exists => {
    isSubmitting.value = false;
    if (exists) {
      showSuccessMessage.value = true;
    }
  });
};
</script>

<template>
  <toolbar-content></toolbar-content>

  <div class="recover-container">
    <div class="form-wrapper">
      <router-link to="/iam/sign-in" class="brand-link">
        <h1>LOCKSIGHT</h1>
      </router-link>

      <div class="recover-content">
        <h2>{{ t('iam.recover.title') }}</h2>
        <p class="subtitle">{{ t('iam.recover.subtitle') }}</p>

        <div v-if="showSuccessMessage" class="success-message">
          <i class="pi pi-check-circle"></i>
          <p>{{ t('iam.recover.messages.success') }}</p>
          <pv-button :label="t('iam.recover.backToLogin')" class="submit-button mt-3" @click="router.push('/iam/sign-in')" />
        </div>

        <form v-else @submit.prevent="onRecover">
          <div class="field">
            <label>{{ t('iam.recover.emailLabel') }}</label>
            <pv-input-text v-model="form.email" type="email" :placeholder="t('iam.recover.emailPlaceholder')" class="custom-input" required />
          </div>

          <div v-if="errors.length" class="error-message">
            {{ errors.map(e => t(e.message) || e.message).join(', ') }}
          </div>

          <pv-button type="submit" :label="t('iam.recover.sendButton')" :loading="isSubmitting" class="submit-button" />

          <div class="back-link">
            <router-link to="/iam/sign-in">
              <i class="pi pi-arrow-left"></i> {{ t('iam.recover.backToLogin') }}
            </router-link>
          </div>
        </form>

      </div>
    </div>
  </div>
</template>


<style scoped>

:global(html),
:global(body),
:global(#app) {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
  font-family: Inter, sans-serif;
}

.recover-container {
  width: 100vw;
  min-height: 100vh;
  display: flex;
}

.left-side {
  width: 50%;
  background: #0F172A;
  display: flex;
  justify-content: center;
  align-items: center;
}

.slogan-circle {
  width: 380px;
  height: 380px;
  background: #1E293B;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.slogan-circle h2 {
  color: white;
  font-size: 2.2rem;
  font-weight: 700;
  line-height: 1.3;
  margin: 0;
}

.right-side {
  width: 50%;
  background: #1E293B;
  display: flex;
  justify-content: center;
  align-items: center;
}

.form-wrapper {
  width: 100%;
  max-width: 450px;
  padding: 2rem;
}

.brand-title {
  color: #3B82F6;
  font-size: 2rem;
  font-weight: 800;
  letter-spacing: 2px;
  text-align: center;
  margin-bottom: 3.5rem;
  cursor: pointer;
  transition: color 0.2s ease;
}
.brand-link {
  text-decoration: none;
}

.brand-title:hover {
  color: #2563EB;
}

.recover-content h2 {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  margin-top: 0;
}

.subtitle {
  color: #94A3B8;
  font-size: 0.95rem;
  line-height: 1.5;
  margin-bottom: 2.5rem;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.5rem;
}

.field label {
  color: #CBD5E1;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  font-weight: 500;
  align-self: flex-start;
}

:deep(.custom-input) {
  width: 100%;
  background: #0F172A !important;
  border: 1px solid #334155 !important;
  color: white !important;
  border-radius: 8px !important;
  padding: 0.9rem 1rem !important;
}

:deep(.custom-input::placeholder) {
  color: #64748B;
}

:deep(.custom-input:focus) {
  border-color: #3B82F6 !important;
  outline: none !important;
  box-shadow: none !important;
}

.success-message {
  color: #10B981;
  font-size: 0.85rem;
  text-align: center;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  font-weight: 500;
}

.error-message {
  color: #EF4444;
  font-size: 0.85rem;
  text-align: center;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  font-weight: 500;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.submit-button {
  width: 100%;
  background: #3B82F6 !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 0.9rem !important;
  font-weight: 600 !important;
  color: white !important;
}

.submit-button:hover {
  background: #2563EB !important;
}

.back-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}

.text-gray {
  color: #94A3B8;
}

.back-link a {
  color: #3B82F6;
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
}

.back-link a:hover {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .recover-container {
    flex-direction: column;
  }
  .left-side {
    display: none;
  }
  .right-side {
    width: 100%;
    justify-content: flex-start;
    padding-top: 3rem;
  }
  .form-wrapper {
    width: 90%;
    padding: 1.5rem;
  }
}
</style>