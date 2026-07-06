const subscriptionRoutes = [
    {
        path: 'subscription',
        name: 'subscription-management',
        component: () => import('./views/subscription-management.vue'),
        meta: { title: 'Suscripcion', requiresAuth: true },
    },
];

export default subscriptionRoutes;
