const devicesRoutes = [
    {
        path: 'devices',
        name: 'devices-monitoring',
        component: () => import('@/devices/presentation/views/devices-monitoring.vue'),
        meta: {
            title: 'Dispositivos IoT',
            requiresAuth: true,
            requiredAnyPermission: ['SENSORS_MANAGE', 'ALERTS_MANAGE']
        },
    },
];
export default devicesRoutes;
