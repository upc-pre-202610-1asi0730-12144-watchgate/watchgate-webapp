const warehouseList = () => import('./views/warehouse-list.vue');
const warehouseDetail = () => import('./views/warehouse-detail.vue');

/**
 * Warehouse Routing Configuration
 * @description
 * Defines the routes for the Warehouse Tracking bounded context.
 * Includes the warehouse listing and detailed monitoring views.
 */
export const warehouseRoutes = [
    {
        path: 'warehouses',
        name: 'warehouse-list',
        component: warehouseList,
        meta: { title: 'Mis Almacenes' }
    },
    {
        path: 'warehouses/:id',
        name: 'warehouse-detail',
        component: warehouseDetail,
        meta: { title: 'Detalle del Almacén' }
    }
];