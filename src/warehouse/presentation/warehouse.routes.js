const warehouseList = () => import('./views/warehouse-list.vue');
const warehouseDetail = () => import('./views/warehouse-detail.vue');
const warehouseRegister = () => import('./views/warehouse-register.vue');

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
        path: 'warehouses/register',
        name: 'warehouse-register',
        component: warehouseRegister,
        meta: { title: 'Registrar Almacén' }
    },
    {
        path: 'warehouses/:id',
        name: 'warehouse-detail',
        component: warehouseDetail,
        meta: { title: 'Detalle del Almacén' }
    }
];