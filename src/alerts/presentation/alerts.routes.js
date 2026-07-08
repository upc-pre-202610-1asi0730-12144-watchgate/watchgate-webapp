const alertsRoutes = [
    {
        path: 'alerts',
        name: 'security-alerts',
        component: () => import('./views/security-alerts.vue'),
        meta: { title: 'Alertas de Seguridad', requiresAuth: true, requiredPermission: 'ALERTS_MANAGE' },
    },
];

export default alertsRoutes;
