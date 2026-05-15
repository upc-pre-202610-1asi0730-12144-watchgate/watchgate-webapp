const warehouseDetail  = () => import('./components/warehouse-detail.vue')
const liveMonitoring   = () => import('./components/live-monitoring.vue')
const eventHistoryList = () => import('./components/event-history-list.vue')

export const eventHistoryRoutes = [
    {
        path: 'warehouses/:id/detail',
        name: 'warehouse-detail-events',
        component: warehouseDetail,
        meta: { title: 'Detalle del Almacén' }
    },
    {
        path: 'warehouses/:id/live',
        name: 'live-monitoring',
        component: liveMonitoring,
        meta: { title: 'Monitoreo en Vivo' }
    },
    {
        path: 'warehouses/:id/history',
        name: 'event-history-list',
        component: eventHistoryList,
        meta: { title: 'Historial de Eventos' }
    },
    {
        path: 'history',
        redirect: { name: 'event-history-list', params: { id: '1' } }
    }
]