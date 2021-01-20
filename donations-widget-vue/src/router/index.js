import Vue from 'vue'
import VueRouter from 'vue-router'
import DonateFull from '../views/DonateFull.vue'
import RegisterFull from '../views/RegisterFull.vue'
import { getABIs } from '../utils/AppLib'

Vue.use(VueRouter)

function createRouter() {
  const routes = [
    {
      path: '/',
      component: DonateFull,
      meta: {
        title: 'Future Salaries + Donate/Bequest for Common Good',
      },
      props: {
        default: true,
        oracleId: null,
      },
    },
    {
      path: '/register',
      component: RegisterFull,
      meta: {
        title: 'Register for Future Salaries for Common Good (free except of an Ethereum fee)',
      },
      props: {
        default: true,
        oracleId: null,
      },
    },
  ]

  return new VueRouter({
    routes
  })
}

const router = createRouter();

getABIs()
  .then(function(abis) {
    router.oracleId = abis.oracleId
  })

router.beforeEach((to, from, next) => {
  document.title = to.meta?.title
  next()
})

export default router
