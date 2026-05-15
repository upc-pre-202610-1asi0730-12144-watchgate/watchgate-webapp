<script setup>
import { useRouter } from 'vue-router';
import LanguageSwitcher from "./language-switcher.vue";

const router = useRouter();

const onLogout = () => {
  router.push({ path: '/iam/sign-in' });
};
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
        <LanguageSwitcher />
        <pv-button
            icon="pi pi-sign-out"
            label="Logout"
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
  letter-spacing: 2px;
  font-size: 1.5rem;
}
</style>