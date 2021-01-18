import Vue from 'vue'
import VueRouter from 'vue-router'
import DonateFull from '../views/DonateFull.vue'
import RegisterFull from '../views/RegisterFull.vue'

Vue.use(VueRouter)

export const routes = [
  {
    path: '/',
    component: DonateFull,
    meta: {
      title: 'Future Salaries + Donate/Bequest for Common Good',
    }
  },
  {
    path: '/register',
    component: RegisterFull,
    meta: {
      title: 'Future Salaries + Donate/Bequest for Common Good',
    }
  },
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta?.title
  next()
})

export default router
