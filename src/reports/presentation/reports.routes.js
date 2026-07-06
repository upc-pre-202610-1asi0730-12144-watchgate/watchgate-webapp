export const reportsRoutes = [
    {
        path: 'reports',
        name: 'reports-dashboard',
        component: () => import('./views/reports-dashboard.vue'),
        meta: { title: 'Reports Section', requiresAuth: true }
    }
];
