const warehouseDetail = () => import('./components/warehouse-detail.vue');
const liveMonitoring = () => import('./components/live-monitoring.vue');
const eventHistoryList = () => import('./components/event-history-list.vue');
const eventHistoryOverview = () => import('./components/event-history-overview.vue');

export const eventHistoryRoutes = [
    {
        path: 'warehouses/:id/detail',
        name: 'warehouse-detail-events',
        component: warehouseDetail,
        meta: { title: 'Detalle del Almacen', requiresAuth: true }
    },
    {
        path: 'warehouses/:id/live',
        name: 'live-monitoring',
        component: liveMonitoring,
        meta: { title: 'Monitoreo en Vivo', requiresAuth: true }
    },
    {
        path: 'warehouses/:id/history',
        name: 'event-history-list',
        component: eventHistoryList,
        meta: { title: 'Historial de Eventos', requiresAuth: true }
    },
    {
        path: 'history',
        name: 'event-history-overview',
        component: eventHistoryOverview,
        meta: { title: 'Historial de Eventos', requiresAuth: true }
    }
];
