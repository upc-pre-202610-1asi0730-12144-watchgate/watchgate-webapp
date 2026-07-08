<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { UserAccessApi } from '../../infrastructure/user-access-api.js';
import { useIamStore } from '../../application/iam.store.js';
import { useWarehouseStore } from '../../../warehouse/application/warehouse.store.js';

const { t } = useI18n();
const iamStore = useIamStore();
const warehouseStore = useWarehouseStore();
const userAccessApi = new UserAccessApi();

const profiles = ref([]);
const invitations = ref([]);
const users = ref([]);
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const successMessage = ref('');

const roles = computed(() => [
  { value: 'Administrator', label: t('team.roles.administrator') },
  { value: 'OperationsManager', label: t('team.roles.operationsManager') },
  { value: 'SecurityOperator', label: t('team.roles.securityOperator') },
  { value: 'Viewer', label: t('team.roles.viewer') },
]);

const permissions = computed(() => [
  { value: 'WAREHOUSES_MANAGE', label: t('team.permissions.warehouses') },
  { value: 'SENSORS_MANAGE', label: t('team.permissions.sensors') },
  { value: 'ALERTS_MANAGE', label: t('team.permissions.alerts') },
  { value: 'REPORTS_VIEW', label: t('team.permissions.reports') },
  { value: 'BILLING_MANAGE', label: t('team.permissions.billing') },
]);

const allZones = computed(() => warehouseStore.warehouses.flatMap(warehouse =>
    warehouse.zones.map(zone => ({ ...zone, warehouseName: warehouse.name }))
));

const zoneOptions = computed(() => allZones.value.map(zone => ({
  value: zone.id,
  label: `${zone.warehouseName} - ${zone.name}`,
})));

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  role: 'SecurityOperator',
  permissions: ['ALERTS_MANAGE', 'REPORTS_VIEW'],
  zoneId: null,
});

function companyId() {
  return iamStore.currentUser?.companyId;
}

function permissionText(value) {
  return Array.isArray(value) ? value.join(',') : value;
}

function permissionsArray(value) {
  if (!value) return [];
  return String(value).split(',').map(item => item.trim()).filter(Boolean);
}

function userName(userId) {
  const user = users.value.find(item => item.id === userId);
  return user?.fullName ?? `User #${userId}`;
}

function zoneLabel(zoneId) {
  if (!zoneId) return t('team.table.allZones');
  const zone = allZones.value.find(item => item.id === zoneId);
  return zone ? `${zone.warehouseName} - ${zone.name}` : `Zone #${zoneId}`;
}

function loadData() {
  const id = companyId();
  if (!id) return Promise.resolve();

  loading.value = true;
  errorMessage.value = '';

  const warehousePromise = warehouseStore.warehousesLoaded
      ? Promise.resolve()
      : warehouseStore.fetchWarehouses(id);

  return Promise.all([
    userAccessApi.getCompanyProfiles(id),
    userAccessApi.getCompanyInvitations(id),
    userAccessApi.getUsers(),
    warehousePromise,
  ]).then(([profileData, invitationData, userData]) => {
    profiles.value = profileData;
    invitations.value = invitationData;
    users.value = userData;
  }).catch(error => {
    console.error(error);
    errorMessage.value = t('team.messages.loadError');
  }).finally(() => {
    loading.value = false;
  });
}

function createTeamUser() {
  const id = companyId();
  if (!id || saving.value) return;
  if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
    errorMessage.value = t('team.messages.required');
    return;
  }

  saving.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  userAccessApi.createTeamUser({
    companyId: id,
    fullName: form.fullName.trim(),
    email: form.email.trim(),
    password: form.password,
    role: form.role,
    permissions: permissionText(form.permissions),
    zoneId: form.zoneId || null,
  }).then(profile => {
    profiles.value = [profile, ...profiles.value.filter(item => item.userId !== profile.userId)];
    successMessage.value = t('team.messages.created');
    return userAccessApi.getUsers().then(data => { users.value = data; });
  }).catch(error => {
    console.error(error);
    errorMessage.value = t('team.messages.createError');
  }).finally(() => {
    saving.value = false;
  });
}

function updateRole(profile) {
  const id = companyId();
  if (!id || saving.value) return;
  saving.value = true;
  errorMessage.value = '';

  userAccessApi.assignAccess(profile.userId, {
    companyId: id,
    role: profile.role,
    permissions: profile.permissions,
  }).then(updated => {
    profiles.value = profiles.value.map(item => item.userId === updated.userId ? updated : item);
    successMessage.value = t('team.messages.updated');
  }).catch(error => {
    console.error(error);
    errorMessage.value = t('team.messages.updateError');
  }).finally(() => {
    saving.value = false;
  });
}

function restrictZone(profile, zoneId) {
  if (!zoneId || saving.value) return;
  saving.value = true;
  errorMessage.value = '';

  userAccessApi.restrictZone(profile.userId, zoneId).then(updated => {
    profiles.value = profiles.value.map(item => item.userId === updated.userId ? updated : item);
    successMessage.value = t('team.messages.zoneRestricted');
  }).catch(error => {
    console.error(error);
    errorMessage.value = t('team.messages.updateError');
  }).finally(() => {
    saving.value = false;
  });
}

function toggleNotifications(profile) {
  saving.value = true;
  errorMessage.value = '';

  userAccessApi.updateNotificationPreferences(profile.userId, {
    emailEnabled: !profile.emailNotificationsEnabled,
    pushEnabled: profile.pushNotificationsEnabled,
    criticalOnly: profile.criticalOnlyNotifications,
  }).then(updated => {
    profiles.value = profiles.value.map(item => item.userId === updated.userId ? updated : item);
    successMessage.value = t('team.messages.preferencesUpdated');
  }).catch(error => {
    console.error(error);
    errorMessage.value = t('team.messages.updateError');
  }).finally(() => {
    saving.value = false;
  });
}

function revoke(profile) {
  if (saving.value || !window.confirm(t('team.messages.revokeConfirm'))) return;
  saving.value = true;
  errorMessage.value = '';

  userAccessApi.revokeAccess(profile.userId).then(updated => {
    profiles.value = profiles.value.map(item => item.userId === updated.userId ? updated : item);
    successMessage.value = t('team.messages.revoked');
  }).catch(error => {
    console.error(error);
    errorMessage.value = t('team.messages.updateError');
  }).finally(() => {
    saving.value = false;
  });
}

onMounted(() => {
  if (!iamStore.sessionLoading) loadData();
});

watch(() => iamStore.sessionLoading, (loading) => {
  if (!loading) loadData();
});
</script>

<template>
  <div class="team-view">
    <header class="page-header">
      <div>
        <h1>{{ t('team.title') }}</h1>
        <p>{{ t('team.subtitle') }}</p>
      </div>
      <div class="current-user">
        <span>{{ t('team.currentUser') }}</span>
        <strong>{{ iamStore.currentUser?.fullName }}</strong>
        <small>{{ iamStore.currentUser?.role }}</small>
      </div>
    </header>

    <p v-if="errorMessage" class="message error">{{ errorMessage }}</p>
    <p v-if="successMessage" class="message success">{{ successMessage }}</p>

    <section class="panel">
      <h2>{{ t('team.create.title') }}</h2>
      <div class="form-grid">
        <label>
          {{ t('team.create.fullName') }}
          <input v-model="form.fullName" type="text">
        </label>
        <label>
          {{ t('team.create.email') }}
          <input v-model="form.email" type="email">
        </label>
        <label>
          {{ t('team.create.password') }}
          <input v-model="form.password" type="password">
        </label>
        <label>
          {{ t('team.create.role') }}
          <select v-model="form.role">
            <option v-for="role in roles" :key="role.value" :value="role.value">{{ role.label }}</option>
          </select>
        </label>
        <label>
          {{ t('team.create.zone') }}
          <select v-model.number="form.zoneId">
            <option :value="null">{{ t('team.table.allZones') }}</option>
            <option v-for="zone in zoneOptions" :key="zone.value" :value="zone.value">{{ zone.label }}</option>
          </select>
        </label>
        <fieldset>
          <legend>{{ t('team.create.permissions') }}</legend>
          <label v-for="permission in permissions" :key="permission.value" class="check-row">
            <input v-model="form.permissions" type="checkbox" :value="permission.value">
            <span>{{ permission.label }}</span>
          </label>
        </fieldset>
      </div>
      <button class="primary" type="button" :disabled="saving" @click="createTeamUser">
        {{ saving ? t('common.saving') : t('team.create.submit') }}
      </button>
    </section>

    <section class="panel">
      <h2>{{ t('team.table.title') }}</h2>
      <div v-if="loading" class="empty">{{ t('team.table.loading') }}</div>
      <div v-else-if="!profiles.length" class="empty">{{ t('team.table.empty') }}</div>
      <div v-else class="profile-list">
        <article v-for="profile in profiles" :key="profile.id" class="profile-card">
          <div class="profile-main">
            <h3>{{ userName(profile.userId) }}</h3>
            <p>{{ zoneLabel(profile.restrictedZoneId) }}</p>
            <small>{{ t('team.table.status') }}: {{ profile.status }}</small>
          </div>
          <div class="profile-controls">
            <select v-model="profile.role" @change="updateRole(profile)">
              <option v-for="role in roles" :key="role.value" :value="role.value">{{ role.label }}</option>
            </select>
            <input v-model="profile.permissions" type="text" :aria-label="t('team.create.permissions')" @change="updateRole(profile)">
            <select :value="profile.restrictedZoneId" @change="restrictZone(profile, Number($event.target.value))">
              <option value="">{{ t('team.table.allZones') }}</option>
              <option v-for="zone in zoneOptions" :key="zone.value" :value="zone.value">{{ zone.label }}</option>
            </select>
          </div>
          <div class="profile-actions">
            <button type="button" @click="toggleNotifications(profile)">
              {{ profile.emailNotificationsEnabled ? t('team.actions.disableEmail') : t('team.actions.enableEmail') }}
            </button>
            <button class="danger" type="button" :disabled="profile.status === 'REVOKED'" @click="revoke(profile)">
              {{ t('team.actions.revoke') }}
            </button>
          </div>
        </article>
      </div>
    </section>

    <section class="panel">
      <h2>{{ t('team.invitations.title') }}</h2>
      <div v-if="!invitations.length" class="empty">{{ t('team.invitations.empty') }}</div>
      <div v-else class="invitation-list">
        <article v-for="invitation in invitations" :key="invitation.id" class="invitation-card">
          <strong>{{ invitation.email }}</strong>
          <span>{{ invitation.role }} - {{ invitation.status }}</span>
          <small>{{ invitation.token }}</small>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.team-view { color: #e5eefb; display: flex; flex-direction: column; gap: 1.25rem; }
.page-header { align-items: flex-start; display: flex; gap: 1rem; justify-content: space-between; }
h1, h2, h3, p { margin-top: 0; }
.page-header h1 { font-size: 1.6rem; margin-bottom: 0.4rem; }
.page-header p, .empty, small { color: #94a3b8; }
.current-user, .panel { background: #102035; border: 1px solid #1e2d42; border-radius: 8px; }
.current-user { min-width: 240px; padding: 1rem; }
.current-user span, .current-user small { color: #94a3b8; display: block; }
.current-user strong { display: block; margin: 0.35rem 0; }
.panel { padding: 1.25rem; }
.panel h2 { font-size: 1rem; margin-bottom: 1rem; }
.form-grid { display: grid; gap: 0.85rem; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
label, fieldset { color: #cbd5e1; display: flex; flex-direction: column; font-size: 0.85rem; gap: 0.4rem; }
fieldset { border: 1px solid #26364d; border-radius: 8px; margin: 0; padding: 0.8rem; }
legend { color: #e5eefb; padding: 0 0.25rem; }
input, select { background: #0a1726; border: 1px solid #26364d; border-radius: 6px; color: #f8fafc; min-height: 40px; padding: 0.55rem 0.65rem; width: 100%; }
.check-row { align-items: center; flex-direction: row; }
.check-row input { min-height: auto; width: auto; }
button { background: #2563eb; border: 0; border-radius: 6px; color: #fff; cursor: pointer; font-weight: 700; min-height: 40px; padding: 0.6rem 0.85rem; }
button:disabled { cursor: not-allowed; opacity: 0.55; }
button.primary { margin-top: 1rem; }
button.danger { background: #dc2626; }
.profile-list, .invitation-list { display: flex; flex-direction: column; gap: 0.75rem; }
.profile-card, .invitation-card { background: #0a1726; border: 1px solid #1e2d42; border-radius: 8px; display: grid; gap: 1rem; padding: 1rem; }
.profile-card { grid-template-columns: minmax(180px, 0.8fr) minmax(260px, 1.4fr) auto; }
.profile-main h3 { margin-bottom: 0.35rem; }
.profile-main p { color: #cbd5e1; margin-bottom: 0.35rem; }
.profile-controls { display: grid; gap: 0.65rem; grid-template-columns: repeat(3, minmax(0, 1fr)); }
.profile-actions { align-items: center; display: flex; flex-wrap: wrap; gap: 0.6rem; justify-content: flex-end; }
.invitation-card { grid-template-columns: minmax(180px, 1fr) minmax(160px, 0.6fr) minmax(220px, 1fr); }
.invitation-card small { overflow-wrap: anywhere; }
.message { border-radius: 8px; margin: 0; padding: 0.8rem 1rem; }
.error { background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.35); color: #f87171; }
.success { background: rgba(34, 197, 94, 0.12); border: 1px solid rgba(34, 197, 94, 0.35); color: #4ade80; }
@media (max-width: 980px) {
  .page-header, .profile-card, .invitation-card { display: flex; flex-direction: column; }
  .current-user { width: 100%; }
  .profile-controls { grid-template-columns: 1fr; }
  .profile-actions { justify-content: flex-start; }
}
</style>
