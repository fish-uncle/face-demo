import Vue from 'vue'
import './reset.less';
import App from './App'

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#root");
