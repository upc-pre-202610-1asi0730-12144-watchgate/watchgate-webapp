<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const items = ref([
  { label: 'warehouses.title', to: '/layout/warehouses' },
  { label: 'Devices', to: '/layout/devices' },
  { label: 'Team and Acces', to: '/layout/team' },
  { label: 'History events', to: '/layout/history' }
]);
</script>

<template>
  <aside class="sidebar">
    <nav class="menu">
      <router-link
          v-for="item in items"
          :key="item.label"
          :to="item.to"
          class="menu-item"
          active-class="active"
      >
        <span>{{ t(item.label) || item.label }}</span>
      </router-link>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 260px;
  background-color: #0f172a;
  border-right: 1px solid #1e293b;
  height: calc(100vh - 70px);
  position: fixed;
  top: 70px;
  left: 0;
}

.menu {
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  gap: 0.3rem;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 0.85rem 1.25rem;
  color: #94a3b8;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 500;
  font-size: 0.95rem;
  transition: all 0.2s ease;
}

.menu-item:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.menu-item.active {
  background-color: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  font-weight: 700;
  border-left: 4px solid #3b82f6;
  padding-left: calc(1.25rem - 4px);
}
</style>