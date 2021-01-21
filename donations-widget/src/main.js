import Vue from 'vue'
import wrap from '@vue/web-component-wrapper'
import App from './App.vue'
import Donate from './views/Donate.vue'
import Register from './views/Register.vue'
import router from './router'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

window.customElements.define('donations-donate', wrap(Vue, Donate));
window.customElements.define('donations-register', wrap(Vue, Register));
