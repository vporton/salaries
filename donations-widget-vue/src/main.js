import Vue from 'vue'
import App from './App.vue'
import Donate from './views/Donate.vue'
import Register from './views/Register.vue'
import router from './router'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

window.customElements.define('donate', Donate);
window.customElements.define('register', Register);
