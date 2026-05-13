<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useIamStore } from '../../application/iam.store.js';
import { User } from '../../domain/model/user.entity.js';
import ToolbarContent from "../components/toolbar-content.vue";

const { t } = useI18n();
const router = useRouter();
const store = useIamStore();
const { signUp } = store;

const fullName = ref('');
const companyName = ref('');
const email = ref('');
const password = ref('');

const isSubmitting = ref(false);
const errorMessage = ref('');
//Cambiar esta parte
const onSignUp = () => {
  isSubmitting.value = true;
  errorMessage.value = '';

  if (!fullName.value || !companyName.value || !email.value || !password.value) {
    errorMessage.value = t('iam.signUp.errors.required');
    isSubmitting.value = false;
    return;
  }

  if (password.value.length < 6) {
    errorMessage.value = t('iam.signUp.errors.passwordLength');
    isSubmitting.value = false;
    return;
  }

  const newUser = new User({
    fullName: fullName.value,
    company: { tradeName: companyName.value },
    email: email.value,
    passwordHash: password.value
  });

  signUp(newUser)
      .then(success => {
        if (success) navigateBack();
      })
      .catch(error => {
        console.error(error);
        errorMessage.value = t('iam.signUp.errors.creationFailed');
      })
      .finally(() => {
        isSubmitting.value = false;
      });
};

const navigateBack = () => {
  router.push({ name: 'sign-in' });
};
</script>

<template>
  <toolbar-content></toolbar-content>

  <div class="signup-container">

    <div class="left-side">
      <div class="brand-text-container">
        <h1>LOCKSIGHT</h1>
        <h2>{{ t('iam.brand.sloganSignup') }}</h2>
        <p>{{ t('iam.brand.descSignup') }}</p>
      </div>
    </div>

    <div class="right-side">
      <div class="form-wrapper">

        <router-link to="/iam/sign-in" class="brand-link mobile-brand">
          <h1>LOCKSIGHT</h1>
        </router-link>

        <div class="signup-content">
          <h2>{{ t('iam.signUp.title') }}</h2>
          <p class="subtitle">{{ t('iam.signUp.subtitle') }}</p>

          <form @submit.prevent="onSignUp">

            <div class="field">
              <label>{{ t('iam.signUp.fullNameLabel') }}</label>
              <pv-input-text
                  v-model="fullName"
                  type="text"
                  :placeholder="t('iam.signUp.fullNamePlaceholder')"
                  class="custom-input"
              />
            </div>

            <div class="field">
              <label>Company Name</label>
              <pv-input-text
                  v-model="companyName"
                  type="text"
                  :placeholder="t('iam.signUp.companyPlaceholder')"
                  class="custom-input"
              />
            </div>

            <div class="field">
              <label>{{ t('iam.signUp.emailLabel') }}</label>
              <pv-input-text
                  v-model="email"
                  type="text"
                  placeholder="***@gmail.com"
                  class="custom-input"
              />
            </div>

            <div class="field">
              <label>{{ t('iam.signUp.passwordLabel') }}</label>
              <pv-input-text
                  v-model="password"
                  type="password"
                  placeholder="••••••"
                  class="custom-input"
              />
            </div>

            <transition name="fade">
              <p v-if="errorMessage" class="error-message">
                {{ errorMessage }}
              </p>
            </transition>

            <pv-button
                type="submit"
                :label="t('iam.signUp.startButton')"
                :loading="isSubmitting"
                class="submit-button"
            />

            <div class="login-link">
              <span class="text-gray">{{ t('iam.signUp.alreadyAccount') }} </span>
              <router-link to="/iam/sign-in">{{ t('iam.signUp.signIn') }}</router-link>
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

.signup-container {
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

.brand-text-container {
  text-align: left;
  max-width: 450px;
  padding: 0 2rem;
  margin-left: 2rem;
}

.brand-text-container h1 {
  color: #3B82F6;
  font-size: 4.5rem;
  font-weight: 800;
  margin: 0 0 1rem -4px;
  letter-spacing: 2px;
}

.brand-text-container h2 {
  color: white;
  font-size: 1.8rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
}

.brand-text-container p {
  color: #94A3B8;
  font-size: 1.1rem;
  line-height: 1.6;
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
  max-width: 420px;
  padding: 2rem;
}

.brand-link {
  text-decoration: none;
}

.mobile-brand {
  display: none;
  text-align: center;
  margin-bottom: 2rem;
  cursor: pointer;
}

.mobile-brand h1 {
  color: #3B82F6;
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: 2px;
  margin: 0;
}

.signup-content h2 {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  margin-top: 0;
}

.subtitle {
  color: #94A3B8;
  font-size: 0.95rem;
  margin-bottom: 2rem;
}

.field {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.3rem;
}

.field label {
  color: #CBD5E1;
  font-size: 0.85rem;
  margin-bottom: 0.4rem;
  font-weight: 600;
  align-self: flex-start;
}

:deep(.custom-input) {
  width: 100%;
  background: #0F172A !important;
  border: 1px solid #334155 !important;
  color: white !important;
  border-radius: 8px !important;
  padding: 0.8rem 1rem !important;
}

:deep(.custom-input::placeholder) {
  color: #64748B;
}

:deep(.custom-input:focus) {
  border-color: #3B82F6 !important;
  outline: none !important;
  box-shadow: none !important;
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

.login-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
}

.text-gray {
  color: #94A3B8;
}

.login-link a {
  color: #3B82F6;
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
}

.login-link a:hover {
  text-decoration: underline;
}

@media (max-width: 900px) {
  .signup-container {
    flex-direction: column;
  }
  .left-side {
    display: none;
  }
  .right-side {
    width: 100%;
    justify-content: flex-start;
    padding-top: 2rem;
  }
  .mobile-brand {
    display: block;
  }
}
</style>