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
      path: "/login",
      name: "login",
      component: () => import("../views/LoginView.vue"),
    },
    {
      path: "/register",
      name: "register",
      component: () => import("../views/RegisterView.vue"),
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
    {
      path: '/login',
      name: 'auth-login',
      component: () => import('../views/AuthLoginView.vue'),
    },
    {
      path: '/signin',
      name: 'auth-signin',
      component: () => import('../views/AuthSigninView.vue'),
    },
  ],
});

export default router;
