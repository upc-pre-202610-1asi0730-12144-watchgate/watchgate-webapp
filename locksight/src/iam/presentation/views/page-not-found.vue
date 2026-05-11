<script setup>
import {useRouter} from "vue-router";
import {useI18n} from "vue-i18n";

const { t } = useI18n();
const router = useRouter();
const unavailableRoute = router.currentRoute.value.fullPath;
</script>

<template>
  <div class="align-content-start justify-content-start m-4">
    <h1>no se encontro</h1>
    <p>no se encontro, { 'unavailable-route': unavailableRoute })}}</p>
    <router-link to="/layout">no se encontro</router-link>
  </div>
</template>

<style scoped>
</style>