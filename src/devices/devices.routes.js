const devicesRoutes = [
    {
        path:      'devices',
        name:      'devices-monitoring',
        component: () => import('@/devices/presentation/views/devices-monitoring.vue'),
        meta:      { title: 'Dispositivos IoT', requiresAuth: true },
    },
];

export default devicesRoutes;