import Vue from "vue";
import "./plugins/axios";
import App from "./App.vue";
import router from "./router";
import "./plugins/element.js";

// 导入树形表格
import TreeTable from "vue-table-with-tree-grid";
// 导入富文本
import VueQuillEditor from "vue-quill-editor";
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

// 导入 Nprogress 包JS和CSS
import Nprogress from "nprogress"
import 'nprogress/nprogress.css'

import axios from "axios";
axios.defaults.baseURL = "http://127.0.0.1:8888/api/private/v1/";


// nprogres 使用，在request拦截器中，展示进度条 Nprogress.start()
// 请求拦截器，请求加上token
axios.interceptors.request.use(config => {
  // console.log(config);
  // 进度条启动
  Nprogress.start()

  config.headers.Authorization = window.sessionStorage.getItem("token");
  return config;
});

// 在response拦截器中，隐藏进度条 Nprogress.done()
axios.interceptors.response.use(config=>{
  // 进度条结束
  Nprogress.done()
  return config
})
Vue.prototype.$http = axios;

Vue.config.productionTip = false;

Vue.component("tree-table", TreeTable);

Vue.use(VueQuillEditor /* { default global options } */);

// 定义全局时间过滤器
Vue.filter("dateFormat", function(originVal) {
  const dt = new Date(originVal);
  const y = dt.getFullYear();
  const m = (dt.getMonth() + 1 + "").padStart(2, "0");
  const d = (dt.getDay()+'').padStart(2, "0");

  const hh = (dt.getHours() + "").padStart(2, "0");
  const mm = (dt.getMinutes() + "").padStart(2, "0");
  const ss = (dt.getSeconds() + "").padStart(2, "0");

  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`;
});

new Vue({
  router,
  render: h => h(App)
}).$mount("#app");
