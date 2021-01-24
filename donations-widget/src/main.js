import Vue from 'vue'
import wrap from '@vue/web-component-wrapper'
import App from './App.vue'
import Donate from './views/Donate.vue'
import Register from './views/Register.vue'
import router from './router'

Vue.config.productionTip = false

const vue = new Vue({
  router,
  render: h => h(App),
})
if (vue.$root.props === undefined) { // `@vue/web-component-wrapper` bug workaround (TODO: Report the bug.)
  vue.$root.props = {}
}
vue.$mount('#app')

window.customElements.define('donations-donate', wrap(Vue, Donate));
window.customElements.define('donations-register', wrap(Vue, Register));
