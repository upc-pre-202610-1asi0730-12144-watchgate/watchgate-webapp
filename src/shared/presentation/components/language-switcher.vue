<script setup>
import {useI18n} from "vue-i18n";
import { computed, watch } from "vue";
const { locale, availableLocales } = useI18n();

const options = computed(() => availableLocales.map(value => ({
  label: value.toUpperCase(),
  value,
})));

watch(locale, (value) => {
  if (!value || !availableLocales.includes(value)) {
    locale.value = 'en';
    return;
  }
  localStorage.setItem('watchgate_locale', value);
});
</script>

<template>
  <pv-select-button
      v-model="locale"
      :options="options"
      option-label="label"
      option-value="value"
      :allow-empty="false"
      aria-label="Language"
  >
    <template #option="slotProps">
      <span>{{ slotProps.option.label }}</span>
    </template>
  </pv-select-button>
</template>

<style scoped>

</style>
