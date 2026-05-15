import { createApp } from 'vue'
import './style.css'
import App from './app.vue'
import i18n from "./i18n.js";
import PrimeVue from 'primevue/config';
import Material from '@primeuix/themes/material';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
import { Avatar, Button, Card, Dialog, Drawer, Image,
    Menu, Menubar, Select, SelectButton, Toolbar,
    InputText, Tooltip } from "primevue";
import router from "./router.js";
import pinia from "./pinia.js";

createApp(App)
    .use(i18n)
    .use(router)
    .use(pinia)
    .use(PrimeVue, { ripple: true, theme: { preset: Material }})
    .component('pv-button', Button)
    .component('pv-select-button', SelectButton)
    .component('pv-select', Select)
    .component('pv-dialog', Dialog)
    .component('pv-avatar', Avatar)
    .component('pv-drawer', Drawer)
    .component('pv-card', Card)
    .component('pv-image', Image)
    .component('pv-toolbar', Toolbar)
    .component('pv-menu', Menu)
    .component('pv-menubar', Menubar)
    .component('pv-input-text', InputText)
    .directive('tooltip', Tooltip)
    .mount('#app');