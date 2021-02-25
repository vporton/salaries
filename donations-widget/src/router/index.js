import Vue from 'vue'
import VueRouter from 'vue-router'
import VueGtag from "vue-gtag";
import DonateFull from '../views/DonateFull.vue'
import RegisterFull from '../views/RegisterFull.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'donate',
    component: DonateFull,
    meta: {
      title: 'Future Salaries + Donate/Bequest for Common Good',
    },
    props: {
      default: true,
      prefix: './',
      oracleId: null,
      ref: 'donate',
    },
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterFull,
    meta: {
      title: 'Register for Future Salaries for Common Good (free except of an Ethereum fee)',
    },
    props: {
      default: true,
      prefix: './',
      oracleId: null,
      ref: 'register',
    },
  },
]

const router = new VueRouter({
  routes,
})

router.beforeEach((to, from, next) => {
  document.title = to.meta?.title
  next()
})

Vue.use(VueGtag, {
  config: { 
    id: "G-1N4160KEQP",
    params: {
      send_page_view: false,
    },
  },
}, router)

export default router
