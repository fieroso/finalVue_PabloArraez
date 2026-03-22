import { createRouter, createWebHashHistory } from 'vue-router'

import InicioVista from '../views/InicioVista.vue'

const rutas = [
  {
    path: '/',
    name: 'inicio',
    component: InicioVista
  },
  {
    path: '/marcas',
    name: 'marcas',
    component: () => import('../views/MarcasVista.vue')
  },
  {
    path: '/nueva-marca',
    name: 'nuevaMarca',
    component: () => import('../views/NuevaMarcaVista.vue')
  },
  {
    path: '/modelos',
    name: 'modelos',
    component: () => import('../views/ModelosVista.vue')
  },
  {
    path: '/nuevo-modelo',
    name: 'nuevoModelo',
    component: () => import('../views/NuevoModeloVista.vue')
  },
  {
    path: '/vehiculos',
    name: 'vehiculos',
    component: () => import('../views/VehiculosVista.vue')
  },
  {
    path: '/nuevo-vehiculo',
    name: 'nuevoVehiculo',
    component: () => import('../views/NuevoVehiculoVista.vue')
  },
  {
    path: '/alquiler',
    name: 'alquiler',
    component: () => import('../views/AlquilerVista.vue')
  },
  {
    path: '/clientes',
    name: 'clientes',
    component: () => import('../views/ClientesVista.vue')
  }
]

const enrutador = createRouter({
  history: createWebHashHistory(),
  routes: rutas
})

export default enrutador
