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
const { signIn } = store;
const form = ref({
  email: '',
  password: ''
});

const isSubmitting = ref(false);

const onSignIn = () => {
  isSubmitting.value = true;

  signIn(form.value.email, form.value.password)
      .then(success => {
        isSubmitting.value = false;
        if (success) {
          router.push({ name: 'warehouse-list' });
        }
      });
};
</script>

<template>
  <toolbar-content></toolbar-content>

  <div class="login-container">
    <div class="left-side">
      <div class="brand-text-container">
        <h1>LOCKSIGHT</h1>
        <h2>{{ t('iam.brand.slogan') }}</h2>
        <p>
          <span class="highlight">{{ t('iam.brand.seamless') }}</span> <br>
          <span class="highlight">{{ t('iam.brand.security') }}</span>
        </p>
      </div>
    </div>

    <div class="right-side">
      <div class="form-wrapper">
        <div class="mobile-brand">
          <h1>LOCKSIGHT</h1>
        </div>

        <div class="login-content">
          <h2>{{ t('iam.signIn.title') }}</h2>
          <p class="subtitle">{{ t('iam.signIn.subtitle') }}</p>

          <form @submit.prevent="onSignIn">
            <div class="field">
              <label>{{ t('iam.signIn.emailLabel') }}</label>
              <pv-input-text v-model="form.email" type="email" :placeholder="t('iam.signIn.emailPlaceholder')" class="custom-input" required />
            </div>

            <div class="field">
              <label>{{ t('iam.signIn.passwordLabel') }}</label>
              <pv-input-text v-model="form.password" type="password" :placeholder="t('iam.signIn.passwordPlaceholder')" class="custom-input" required />
            </div>

            <div class="forgot-password">
              <router-link to="/iam/recover-password">{{ t('iam.signIn.forgot') }}</router-link>
            </div>

            <div v-if="errors.length" class="error-message">
              {{ errors.map(e => t(e.message) || e.message).join(', ') }}
            </div>

            <pv-button type="submit" :label="t('iam.signIn.loginButton')" :loading="isSubmitting" class="submit-button" />

            <div class="register-link">
              <span class="text-gray">{{ t('iam.signIn.noAccount') }} </span>
              <router-link to="/iam/sign-up">{{ t('iam.signIn.register') }}</router-link>
            </div>
          </form>
        </div>
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

.login-container {
  width: 100vw;
  min-height: 100vh;
  display: flex;
}

.left-side {
  width: 50%;
  background: #334155;
  display: flex;
  justify-content: center;
  align-items: center;
}

.brand-container {
  text-align: center;
}

.brand-container h1 {
  color: #3B82F6;
  font-size: 4.5rem;
  font-weight: 800;
  margin: 0;
  letter-spacing: 2px;
}

.brand-container p {
  color: #94A3B8;
  font-size: 1.5rem;
  margin-top: 1.3rem;
}

.right-side {
  width: 50%;
  background: #0F172A;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 480px;
  background: #1E293B;
  border-radius: 16px;
  padding: 3rem;
  box-sizing: border-box;
}

.login-card h2 {
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #94A3B8;
  margin-bottom: 2rem;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.3rem;
}

.field label {
  color: #CBD5E1;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
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

.login-button {
  width: 100%;
  margin-top: 0.2rem;
  background: #3B82F6 !important;
  border: none !important;
  border-radius: 8px !important;
  padding: 0.9rem !important;
  font-weight: 600 !important;
  color: white !important;
}

.login-button:hover {
  background: #2563EB !important;
}

.links {
  text-align: center;
  margin-top: 1rem;
}

.links a {
  color: #3B82F6;
  text-decoration: none;
  font-size: 0.9rem;
}

.register {
  text-align: center;
  color: #94A3B8;
  margin-top: 1rem;
  font-size: 0.9rem;
}

.register a {
  color: #3B82F6;
  text-decoration: none;
  margin-left: 5px;
}

@media (max-width: 900px) {
  .login-container {
    flex-direction: column;
    background: #0F172A;
  }

  .left-side {
    width: 100%;
    background: transparent;
    padding: 4rem 0 2rem 0;
  }

  .brand-container h1 {
    font-size: 2.8rem;
  }

  .brand-container p {
    font-size: 1.2rem;
  }

  .right-side {
    width: 100%;
    background: transparent;
    flex: 1;
    align-items: center;
    justify-content: center;
    padding-bottom: 4rem;
  }

  .login-card {
    width: 90%;
    max-width: 420px;
    padding: 2.5rem 2rem;
  }
}
</style>