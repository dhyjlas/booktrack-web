import Vue from "vue";
import './plugins/axios'
import App from "./App.vue";
import router from "./router";
import store from "./store";
import './plugins/iview.js';
import './plugins/axios.js';

Vue.config.productionTip = false;
window.document.title = "图书阅读器";

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");
