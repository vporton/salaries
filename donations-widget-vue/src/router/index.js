import Vue from 'vue'
import VueRouter from 'vue-router'
import DonateFull from '../views/DonateFull.vue'

Vue.use(VueRouter)

export const routes = [
  {
    path: '/',
    component: DonateFull,
    meta: {
      title: 'Future Salaries + Donate/Bequest for Common Good',
    }
  }
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  document.title = to.meta?.title
  next()
})

export default router
