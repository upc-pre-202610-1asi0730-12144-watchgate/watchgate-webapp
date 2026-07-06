export const userAccessRoutes = [
    {
        path: 'team',
        name: 'team-access',
        component: () => import('./views/team-access.vue'),
        meta: { title: 'Team and Access', requiresAuth: true }
    }
];
