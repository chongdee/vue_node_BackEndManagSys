import Vue from "vue";
import VueRouter from "vue-router";

const Login = () => import("components/Login");
const Home = () => import("components/Home");
const Welcome = () => import("components/Welcome");
const Users = () => import("components/user/Users");


Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "/login"
  },
  {
    name: "Login",
    path: "/login",
    component: Login
  },
  {
    name: "Home",
    path: "/home",
    component: Home,
    redirect: "/welcome",
    children: [
      {
        name: "Welcome",
        path: "/welcome",
        component: Welcome
      },
      {
        name: "Users",
        path: "/users",
        component: Users
      }
    ]
  }
];



const router = new VueRouter({
  routes
});

router.beforeEach((to, from, next) => {
  // to 将要访问的路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数，表示放行

  // 如果访问的是登录页，直接放行
  if (to.path === "/login") return next();
  // 获取token
  const token = window.sessionStorage.getItem("token");
  if (!token) return next("/login");
  next();
});

export default router;
