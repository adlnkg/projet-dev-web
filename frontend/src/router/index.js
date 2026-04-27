import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/actualites",
      name: "actualites",
      component: () => import("../views/ActualitesView.vue"),
    },
    {
      path: "/evenements",
      name: "evenements",
      component: () => import("../views/EvenementsView.vue"),
    },
    {
      path: "/login",
      name: "login",
      component: () => import("../views/AuthLoginView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/AuthSigninView.vue"),
    },
    {
      path: "/verify-otp",
      name: "verify-otp",
      component: () => import("../views/VerifyOTPView.vue"),
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/ProfileView.vue"),
    },
    {
      path: "/profile/edit",
      name: "edit-profile",
      component: () => import("../views/ProfileEditView.vue"),
    },
    {
      path: "/user",
      name: "user",
      component: () => import("../views/UserView.vue"),
    },
  ],
});

export default router;
