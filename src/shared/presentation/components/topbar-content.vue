<script setup>
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import LanguageSwitcher from "./language-switcher.vue";
import { PlatformApi } from '../../infrastructure/platform-api.js';
import { useIamStore } from '../../../iam/application/iam.store.js';

const router = useRouter();
const { t } = useI18n();
const iamStore = useIamStore();
const platformApi = new PlatformApi();
const appVersion = import.meta.env.VITE_APP_VERSION || '3.0.0';
const apiStatus = ref('checking');
const apiVersion = ref('');
const welcomeName = computed(() => iamStore.currentUser?.fullName || t('topbar.guest'));

const onLogout = () => {
  iamStore.logout();
  router.push({ path: '/iam/sign-in' });
};

onMounted(() => {
  platformApi.getHealth()
      .then(health => {
        apiStatus.value = 'online';
        apiVersion.value = health.version ? `API v${health.version}` : t('topbar.apiOnline');
      })
      .catch(() => {
        apiStatus.value = 'offline';
        apiVersion.value = t('topbar.apiOffline');
      });
});
</script>

<template>
  <pv-toolbar class="topbar">
    <template #start>
      <div class="flex align-items-center">
        <h2 class="brand-logo">LOCKSIGHT</h2>
      </div>
    </template>

    <template #end>
      <div class="flex align-items-center gap-3">
        <div class="welcome-status">
          <span>{{ t('topbar.welcome', { name: welcomeName }) }}</span>
        </div>
        <div class="release-status" :class="apiStatus">
          <span class="status-dot"></span>
          <span>Web v{{ appVersion }}</span>
          <small>{{ apiVersion || t('topbar.apiChecking') }}</small>
        </div>
        <LanguageSwitcher />
        <pv-button
            icon="pi pi-sign-out"
            :label="t('topbar.logout')"
            @click="onLogout"
            class="p-button-danger p-button-text"
        />
      </div>
    </template>
  </pv-toolbar>
</template>

<style scoped>
.topbar {
  background-color: #1e293b !important;
  border: none !important;
  border-radius: 0 !important;
  padding: 0.75rem 1.5rem !important;
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 1000;
  height: 70px;
}

.brand-logo {
  color: #3b82f6;
  margin: 0;
  font-weight: 800;
  letter-spacing: 0;
  font-size: 1.5rem;
}

.release-status {
  align-items: center;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #cbd5e1;
  display: flex;
  gap: 0.45rem;
  min-height: 38px;
  padding: 0.4rem 0.65rem;
}

.welcome-status {
  align-items: center;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #e5eefb;
  display: flex;
  min-height: 38px;
  max-width: 280px;
  padding: 0.4rem 0.65rem;
}

.welcome-status span {
  font-size: 0.78rem;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.release-status span:not(.status-dot) {
  font-size: 0.78rem;
  font-weight: 800;
  white-space: nowrap;
}

.release-status small {
  color: #94a3b8;
  font-size: 0.72rem;
  white-space: nowrap;
}

.status-dot {
  border-radius: 999px;
  display: inline-block;
  height: 8px;
  width: 8px;
}

.release-status.checking .status-dot {
  background: #f59e0b;
}

.release-status.online .status-dot {
  background: #22c55e;
}

.release-status.offline .status-dot {
  background: #ef4444;
}

@media (max-width: 768px) {
  .release-status {
    display: none;
  }

  .welcome-status {
    display: none;
  }
}
</style>
