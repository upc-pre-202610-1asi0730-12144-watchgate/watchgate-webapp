<script setup lang="js">

import LanguageSwitcher from "../../../shared/presentation/components/language-switcher.vue";
import {useI18n} from "vue-i18n";

const { t } = useI18n();
</script>

<template>
  <pv-toolbar class="toolbar-iam">
    <template #end>
      <language-switcher/>
    </template>
  </pv-toolbar>
</template>

<style scoped>

.toolbar-iam {
  background: transparent;
  border: none;
  padding: 1.5rem 2rem;
  position: absolute;
  width: 100%;
}

</style>