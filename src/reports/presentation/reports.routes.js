const reportsRoutes = [
    {
        path: 'reports',
        name: 'security-reports',
        component: () => import('./views/security-reports.vue'),
        meta: { title: 'Reportes', requiresAuth: true },
    },
];

export default reportsRoutes;
