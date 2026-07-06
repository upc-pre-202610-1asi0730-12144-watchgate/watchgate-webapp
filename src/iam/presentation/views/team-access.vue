<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { useIamStore } from '../../application/iam.store.js';
import { UserAccessApi } from '../../infrastructure/user-access-api.js';

const iamStore = useIamStore();
const api = new UserAccessApi();

const invitations = ref([]);
const profiles = ref([]);
const loading = ref(false);
const message = ref('');
const error = ref('');

const companyId = computed(() => iamStore.currentUser?.companyId);
const inviteForm = reactive({
  email: '',
  role: 'OperationsManager',
  permissions: 'WAREHOUSE_READ,SENSOR_READ,ALERT_MANAGE',
  zoneId: null
});
const teamUserForm = reactive({
  fullName: 'Bardales Tejada, Luis Alexis',
  email: 'luis.bardales@locksight.dev',
  password: 'Bardales_2026',
  role: 'Viewer',
  permissions: 'WAREHOUSE_READ,SENSOR_READ,REPORT_READ',
  zoneId: null
});

async function load() {
  if (!companyId.value) return;
  loading.value = true;
  error.value = '';
  try {
    const [invitationResponse, profilesResponse] = await Promise.all([
      api.getCompanyInvitations(companyId.value),
      api.getCompanyProfiles(companyId.value)
    ]);
    invitations.value = invitationResponse.data;
    profiles.value = profilesResponse.data;
  } catch (e) {
    error.value = e.response?.data?.detail || e.message;
  } finally {
    loading.value = false;
  }
}

async function inviteUser() {
  if (!companyId.value) return;
  message.value = '';
  error.value = '';
  try {
    await api.inviteUser({
      companyId: companyId.value,
      email: inviteForm.email,
      role: inviteForm.role,
      permissions: inviteForm.permissions,
      zoneId: inviteForm.zoneId ? Number(inviteForm.zoneId) : null
    });
    inviteForm.email = '';
    message.value = 'Invitation created.';
    await load();
  } catch (e) {
    error.value = e.response?.data?.detail || e.message;
  }
}

async function createTeamUser() {
  if (!companyId.value) return;
  message.value = '';
  error.value = '';
  try {
    const response = await api.createTeamUser({
      companyId: companyId.value,
      fullName: teamUserForm.fullName,
      email: teamUserForm.email,
      password: teamUserForm.password,
      role: teamUserForm.role,
      permissions: teamUserForm.permissions,
      zoneId: teamUserForm.zoneId ? Number(teamUserForm.zoneId) : null
    });
    message.value = `Team user created. User #${response.data.userId} can sign in with ${teamUserForm.email}.`;
    await load();
  } catch (e) {
    error.value = e.response?.data?.detail || e.message;
  }
}

async function revoke(profile) {
  await api.revokeAccess(profile.userId);
  await load();
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
        <h1>User & Access Management</h1>
        <p>Invite users, review permissions and revoke access.</p>
      </div>
    </header>

    <p v-if="error" class="alert error">{{ error }}</p>
    <p v-if="message" class="alert success">{{ message }}</p>

    <section class="panel">
      <h2>Create Team User</h2>
      <form class="team-grid" @submit.prevent="createTeamUser">
        <input v-model="teamUserForm.fullName" placeholder="Full name" required>
        <input v-model="teamUserForm.email" type="email" placeholder="email@company.com" required>
        <input v-model="teamUserForm.password" placeholder="Temporary password" required>
        <select v-model="teamUserForm.role">
          <option value="Viewer">Viewer</option>
          <option value="OperationsManager">Operations Manager</option>
          <option value="Administrator">Administrator</option>
        </select>
        <input v-model="teamUserForm.permissions" placeholder="Permissions">
        <input v-model="teamUserForm.zoneId" type="number" min="1" placeholder="Restricted Zone ID">
        <button type="submit">Create user</button>
      </form>
      <p class="hint">Use Viewer for Bardales to evidence restricted monitoring access. Current backend records roles and permissions; full server-side RBAC is still outside the implemented scope.</p>
    </section>

    <section class="panel">
      <h2>Invite User</h2>
      <form class="grid-form" @submit.prevent="inviteUser">
        <input v-model="inviteForm.email" type="email" placeholder="email@company.com" required>
        <select v-model="inviteForm.role">
          <option value="OperationsManager">Operations Manager</option>
          <option value="Administrator">Administrator</option>
          <option value="Viewer">Viewer</option>
        </select>
        <input v-model="inviteForm.permissions" placeholder="Permissions">
        <input v-model="inviteForm.zoneId" type="number" min="1" placeholder="Zone ID">
        <button type="submit">Invite</button>
      </form>
    </section>

    <section class="panel">
      <h2>Invitations</h2>
      <div class="table">
        <div class="row head"><span>Email</span><span>Role</span><span>Status</span><span>Token</span></div>
        <div v-for="invitation in invitations" :key="invitation.id" class="row">
          <span>{{ invitation.email }}</span>
          <span>{{ invitation.role }}</span>
          <span>{{ invitation.status }}</span>
          <code>{{ invitation.token }}</code>
        </div>
      </div>
    </section>

    <section class="panel">
      <h2>Access Profiles</h2>
      <p v-if="loading">Loading...</p>
      <div class="table">
        <div class="row head"><span>User</span><span>Role</span><span>Zone</span><span>Status</span><span></span></div>
        <div v-for="profile in profiles" :key="profile.id" class="row">
          <span>#{{ profile.userId }}</span>
          <span>{{ profile.role }}</span>
          <span>{{ profile.restrictedZoneId || 'All' }}</span>
          <span>{{ profile.status }}</span>
          <button :disabled="profile.status === 'REVOKED'" @click="revoke(profile)">Revoke</button>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page-shell { padding: 2rem; color: #e5e7eb; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
h1, h2, p { margin: 0; }
h1 { font-size: 1.6rem; }
h2 { font-size: 1rem; margin-bottom: 1rem; }
p { color: #94a3b8; margin-top: .35rem; }
.panel { background: #111827; border: 1px solid #1f2937; border-radius: 8px; padding: 1rem; margin-bottom: 1rem; }
.grid-form { display: grid; grid-template-columns: 1.4fr 1fr 1.6fr .7fr auto; gap: .75rem; }
.team-grid { display: grid; grid-template-columns: 1.4fr 1.2fr .9fr .9fr 1.5fr .8fr auto; gap: .75rem; }
input, select { background: #0f172a; border: 1px solid #334155; border-radius: 6px; color: #e5e7eb; padding: .7rem; min-width: 0; }
button { background: #2563eb; border: 0; color: white; border-radius: 6px; padding: .7rem 1rem; cursor: pointer; }
button:disabled { opacity: .45; cursor: not-allowed; }
.table { display: grid; gap: .35rem; }
.row { display: grid; grid-template-columns: 1.3fr .8fr .7fr 1.6fr; gap: .75rem; align-items: center; padding: .7rem; background: #0f172a; border-radius: 6px; }
.row:has(button) { grid-template-columns: .7fr 1fr .7fr .7fr auto; }
.head { color: #93c5fd; font-weight: 700; }
code { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.alert { padding: .75rem 1rem; border-radius: 6px; margin-bottom: 1rem; }
.error { background: #7f1d1d; color: #fecaca; }
.success { background: #064e3b; color: #bbf7d0; }
.hint { font-size: .8rem; margin-top: .75rem; }
@media (max-width: 980px) {
  .grid-form, .team-grid { grid-template-columns: 1fr; }
}
</style>
