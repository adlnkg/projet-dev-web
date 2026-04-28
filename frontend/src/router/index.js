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
      path: "/auth-login",
      name: "auth-login",
      component: () => import("../views/AuthLoginView.vue"),
    },
    {
      path: "/signin",
      name: "auth-signin",
      component: () => import("../views/AuthSigninView.vue"),
    },
    {
      path: "/admin",
      name: "admin-dashboard",
      component: () => import("../views/AdminDashboard.vue"),
    },
    {
      path: "/admin/actualities/create",
      name: "admin-actuality-create",
      component: () => import("../views/AdminActualityCreate.vue"),
    },
    {
      path: "/admin/events/create",
      name: "admin-event-create",
      component: () => import("../views/AdminEventCreate.vue"),
    },
    {
      path: "/admin/users",
      name: "admin-users",
      component: () => import("../views/AdminUsersView.vue"),
    },
    {
      path: "/admin/users/:id",
      name: "admin-user-detail",
      component: () => import("../views/AdminUserDetailView.vue"),
    },
  ],
});

export default router;
