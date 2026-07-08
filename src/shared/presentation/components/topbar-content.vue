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
const showProfileMenu = ref(false);
const welcomeName = computed(() => iamStore.currentUser?.fullName || t('topbar.guest'));
const permissionLabel = computed(() => {
  return iamStore.permissions.length ? iamStore.permissions.join(', ') : t('profile.noPermissions');
});

const onLogout = () => {
  showProfileMenu.value = false;
  iamStore.logout();
  router.push({ path: '/iam/sign-in' });
};

const goToSubscription = () => {
  showProfileMenu.value = false;
  router.push({ path: '/layout/subscription' });
};

const notifySettingsSoon = () => {
  window.alert(t('profile.settingsSoon'));
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
        <div class="release-status" :class="apiStatus">
          <span class="status-dot"></span>
          <span>Web v{{ appVersion }}</span>
          <small>{{ apiVersion || t('topbar.apiChecking') }}</small>
        </div>
        <LanguageSwitcher />
        <div class="profile-menu">
          <button class="profile-trigger" type="button" @click="showProfileMenu = !showProfileMenu">
            <i class="pi pi-user" />
            <span>{{ welcomeName }}</span>
            <i class="pi pi-angle-down" />
          </button>

          <div v-if="showProfileMenu" class="profile-dropdown">
            <div class="profile-summary">
              <strong>{{ iamStore.currentUser?.fullName || t('profile.guest') }}</strong>
              <small>{{ iamStore.currentUser?.email }}</small>
            </div>
            <div class="profile-row">
              <span>{{ t('profile.role') }}</span>
              <strong>{{ iamStore.currentRole }}</strong>
            </div>
            <div class="profile-row">
              <span>{{ t('profile.company') }}</span>
              <strong>#{{ iamStore.currentUser?.companyId ?? '-' }}</strong>
            </div>
            <div class="profile-row permissions">
              <span>{{ t('profile.permissions') }}</span>
              <small>{{ permissionLabel }}</small>
            </div>
            <button
                v-if="iamStore.canManageBilling"
                class="dropdown-action"
                type="button"
                @click="goToSubscription"
            >
              <i class="pi pi-credit-card" />
              {{ t('profile.subscription') }}
            </button>
            <button class="dropdown-action" type="button" @click="notifySettingsSoon">
              <i class="pi pi-cog" />
              {{ t('nav.settings') }}
            </button>
            <button class="dropdown-action danger" type="button" @click="onLogout">
              <i class="pi pi-sign-out" />
              {{ t('profile.logout') }}
            </button>
          </div>
        </div>
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

.profile-menu {
  position: relative;
}

.profile-trigger {
  align-items: center;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 8px;
  color: #e5eefb;
  cursor: pointer;
  display: inline-flex;
  gap: 0.45rem;
  min-height: 38px;
  max-width: 240px;
  padding: 0.4rem 0.65rem;
}

.profile-trigger span {
  font-size: 0.78rem;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-dropdown {
  background: #102035;
  border: 1px solid #334155;
  border-radius: 8px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.35);
  color: #e5eefb;
  min-width: 280px;
  padding: 0.85rem;
  position: absolute;
  right: 0;
  top: calc(100% + 8px);
  z-index: 1200;
}

.profile-summary {
  border-bottom: 1px solid #1e2d42;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.65rem;
  padding-bottom: 0.65rem;
}

.profile-summary small,
.profile-row span,
.profile-row small {
  color: #94a3b8;
}

.profile-row {
  display: flex;
  gap: 0.75rem;
  justify-content: space-between;
  padding: 0.35rem 0;
}

.profile-row.permissions {
  align-items: flex-start;
  flex-direction: column;
  gap: 0.25rem;
}

.profile-row.permissions small {
  overflow-wrap: anywhere;
}

.dropdown-action {
  align-items: center;
  background: transparent;
  border: 1px solid #334155;
  border-radius: 6px;
  color: #cbd5e1;
  cursor: pointer;
  display: flex;
  gap: 0.45rem;
  justify-content: flex-start;
  margin-top: 0.5rem;
  min-height: 36px;
  padding: 0.45rem 0.65rem;
  width: 100%;
}

.dropdown-action:hover {
  border-color: #3b82f6;
  color: #fff;
}

.dropdown-action.danger {
  border-color: rgba(239, 68, 68, 0.35);
  color: #f87171;
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

  .profile-trigger span {
    display: none;
  }
}
</style>
