import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/editor'
  },
  {
    path: '/editor',
    component: () => import('@/views/EditorDemo.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
