import { createRouter, createWebHistory } from "vue-router";
import Layout from "./shared/presentation/components/layout.vue";
import iamRoutes from "./iam/presentation/iam.routes.js";
import devicesRoutes from "./devices/devices.routes.js";
import pageNotFound from "./iam/presentation/views/page-not-found.vue";

const routes = [
    { path: '/', redirect: '/layout/devices' },
    { path: '/iam', children: iamRoutes },
    {
        path: '/layout',
        component: Layout,
        children: [
            ...devicesRoutes,
        ]
    },
    {
        path: '/:pathMatch(.*)*',
        name: 'not-found',
        component: pageNotFound,
        meta: { title: 'Page Not Found' }
    }
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

router.beforeEach((to, from, next) => {
    let baseTitle = 'LockSight';
    document.title = `${baseTitle} - ${to.meta['title'] || 'App'}`;
    return next();
});

export default router;