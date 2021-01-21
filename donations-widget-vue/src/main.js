import Vue from 'vue'
import App from './App.vue'
import Donate from './views/Donate.vue'
import Register from './views/Register.vue'
import router from './router'
import vueCustomElement from 'vue-custom-element';

Vue.config.productionTip = false

// Configure Vue to ignore the element name when defined outside of Vue.
Vue.config.ignoredElements = [
  'donations-donate',
  'donations-register',
];

Vue.use(vueCustomElement);

Vue.customElement('donations-donate', Donate, {
  shadow: false,
});
Vue.customElement('donations-register', Register, {
  shadow: false,
});

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
