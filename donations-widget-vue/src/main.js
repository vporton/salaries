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
  // Additional Options: https://github.com/karol-f/vue-custom-element#options
});
Vue.customElement('donations-register', Register, {
  // Additional Options: https://github.com/karol-f/vue-custom-element#options
});

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
