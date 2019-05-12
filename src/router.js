import Vue from 'vue';
import Router from 'vue-router';
//管理员
import blog from './router/blog.js';

Vue.use(Router)

export default new Router({
  // mode: 'history',
  routes: [{
      //根路径重定向
      path: '/',
      redirect: '/home',
    },
    {
      //主页面
      path: '/home',
      component: () => import('@/views/home.vue'),
      redirect: 'home/blog',
      //子路由
      children: [blog]
    },
    {
      //登录路由
      path: '/signIn',
      component: () => import('@/views/signIn.vue')
    },
  ]
})