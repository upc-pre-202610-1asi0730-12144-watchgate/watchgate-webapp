import { createRouter, createWebHistory } from "vue-router";
import Layout from "./shared/presentation/components/layout.vue";
import iamRoutes from "./iam/presentation/iam.routes.js";
import pageNotFound from "./iam/presentation/views/page-not-found.vue";
import { warehouseRoutes } from "./warehouse/presentation/warehouse.routes.js";
const routes = [
    { path: '/', redirect: '/iam/sign-in' },
    {
        path: '/iam',
        children: iamRoutes
    },
    {
        path: '/layout',
        component: Layout,
        redirect: '/layout/warehouses',
        children: [
            ...warehouseRoutes
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
    routes: routes,
});

router.beforeEach((to, from, next) => {
    console.log(`Navigating from ${String(from.name)} to ${String(to.name)}`);
    let baseTitle = 'LockSight';
    document.title = `${baseTitle} - ${to.meta['title'] || 'App'}`;
    return next();
});

export default router;