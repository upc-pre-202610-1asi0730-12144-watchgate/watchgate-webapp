<script setup>
import TopbarContent from "./topbar-content.vue";
import SidebarContent from "./sidebar-content.vue";
</script>

<template>
  <div class="layout-wrapper">
    <topbar-content />

    <div class="layout-body">
      <sidebar-content />

      <main class="content-container">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #0f172a;
}

.layout-body {
  display: flex;
  flex: 1;
  margin-top: 70px;
}

.content-container {
  flex: 1;
  margin-left: 260px;
  padding: 2rem;
  overflow-y: auto;
}

@media (max-width: 991px) {
  .content-container {
    margin-left: 0;
  }
}
</style>