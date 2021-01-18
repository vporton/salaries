import Vue from 'vue'
import VueRouter from 'vue-router'
import Donate from '../views/Donate.vue'

Vue.use(VueRouter)

export const routes = [
  {
    path: '/',
    component: Donate,
    meta: {
      title: 'Future Software/Science Salaries + Donate/Bequest for Science and Climate',
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
