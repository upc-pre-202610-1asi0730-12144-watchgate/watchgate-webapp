const warehouseList = () => import('./views/warehouse-list.vue');
const warehouseDetail = () => import('./views/warehouse-detail.vue');
const warehouseRegister = () => import('./views/warehouse-register.vue');

export const warehouseRoutes = [
    {
        path: 'warehouses',
        name: 'warehouse-list',
        component: warehouseList,
        meta: { title: 'Mis Almacenes', requiresAuth: true }
    },
    {
        path: 'warehouses/register',
        name: 'warehouse-register',
        component: warehouseRegister,
        meta: { title: 'Registrar Almacen', requiresAuth: true, requiredPermission: 'WAREHOUSES_MANAGE' }
    },
    {
        path: 'warehouses/:id',
        name: 'warehouse-detail',
        component: warehouseDetail,
        meta: { title: 'Detalle del Almacen', requiresAuth: true }
    }
];
