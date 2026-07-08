import { createRouter, createWebHashHistory } from "vue-router";
import LandingPage from "./landing/presentation/views/landing-page.vue";
import Layout from "./shared/presentation/components/layout.vue";
import iamRoutes from "./iam/presentation/iam.routes.js";
import pageNotFound from "./iam/presentation/views/page-not-found.vue";
import { warehouseRoutes } from "./warehouse/presentation/warehouse.routes.js";
import devicesRoutes from "@/devices/devices.routes.js";
import { eventHistoryRoutes } from "./event-history/presentation/event-history.routes.js";
import alertsRoutes from "./alerts/presentation/alerts.routes.js";
import reportsRoutes from "./reports/presentation/reports.routes.js";
import subscriptionRoutes from "./subscription/presentation/subscription.routes.js";
import pinia from "./pinia.js";
import { useIamStore } from "./iam/application/iam.store.js";

const routes = [
    {
        path: '/',
        name: 'landing-page',
        component: LandingPage,
        meta: { title: 'Landing Page' }
    },
    {
        path: '/iam',
        children: iamRoutes
    },
    {
        path: '/layout',
        component: Layout,
        redirect: '/layout/warehouses',
        children: [
            ...warehouseRoutes,
            ...devicesRoutes,
            {
                path: 'team-access',
                name: 'team-access',
                component: () => import('./iam/presentation/views/team-access.vue'),
                meta: { title: 'Team & Access', requiresAuth: true, requiredPermission: 'TEAM_MANAGE' }
            },
            ...eventHistoryRoutes,
            ...alertsRoutes,
            ...reportsRoutes,
            ...subscriptionRoutes
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
    history: createWebHashHistory(import.meta.env.BASE_URL),
    routes: routes,
});

router.beforeEach((to, from) => {
    const iamStore = useIamStore(pinia);
    console.log(`Navigating from ${String(from.name)} to ${String(to.name)}`);
    document.title = `LockSight - ${to.meta['title'] || 'App'}`;

    if (to.meta.requiresAuth && !iamStore.currentUser && !iamStore.sessionLoading) {
        return { path: '/iam/sign-in' };
    }

    if (to.meta.requiredPermission && !iamStore.hasPermission(to.meta.requiredPermission)) {
        return { path: '/layout/warehouses' };
    }

    if (to.meta.requiredAnyPermission) {
        const hasAnyPermission = to.meta.requiredAnyPermission.some(permission => iamStore.hasPermission(permission));
        if (!hasAnyPermission) return { path: '/layout/warehouses' };
    }
});

export default router;
