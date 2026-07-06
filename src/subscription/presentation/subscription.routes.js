export const subscriptionRoutes = [
    {
        path: 'billing',
        name: 'subscription-billing',
        component: () => import('./views/billing.vue'),
        meta: { title: 'Subscription and Billing', requiresAuth: true }
    }
];
