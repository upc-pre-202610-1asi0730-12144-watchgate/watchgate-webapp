const warehouseList = () => import('./views/warehouse-list.vue');
const warehouseDetail = () => import('./views/warehouse-detail.vue');

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