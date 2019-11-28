import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "index",
      component: () => import('./views/index.vue')
    },
    {
      path: "/book",
      name: "book",
      component: () => import('./views/book.vue')
    },
    {
      path: "/content",
      name: "content",
      component: () => import('./views/content.vue')
    },
    {
      path: "/add",
      name: "add",
      component: () => import('./views/add.vue')
    },
    {
      path: "/website",
      name: "website",
      component: () => import('./views/website.vue')
    },
    {
      path: "/websiteAdd",
      name: "websiteAdd",
      component: () => import('./views/websiteAdd.vue')
    }
  ]
})
