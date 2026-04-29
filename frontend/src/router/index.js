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
      path: "/actualites/:id",
      name: "actuality-detail",
      component: () => import("../views/ActualityDetailView.vue"),
    },
    {
      path: "/evenements",
      name: "evenements",
      component: () => import("../views/EvenementsView.vue"),
    },
    {
      path: "/evenements/:id",
      name: "event-detail",
      component: () => import("../views/EventDetailView.vue"),
    },
    {
      path: "/login",
      name: "auth-login",
      component: () => import("../views/AuthLoginView.vue"),
    },
    {
      path: "/login-old",
      name: "login",
      component: () => import("../views/LoginStyledView.vue"),
    },
    {
      path: "/register",
      name: "auth-signin",
      component: () => import("../views/AuthSigninView.vue"),
    },
    {
      path: "/register-old",
      name: "register-old",
      component: () => import("../views/RegisterView.vue"),
    },
    {
      path: "/verify-otp",
      name: "verify-otp",
      component: () => import("../views/AuthOTPView.vue"),
    },
    {
      path: "/profile",
      name: "profile",
      component: () => import("../views/ProfileView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/profile/:pseudo",
      name: "public-profile",
      component: () => import("../views/PublicProfileView.vue"),
    },
    {
      path: "/profile/edit",
      name: "edit-profile",
      component: () => import("../views/ProfileEditView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/user",
      name: "user",
      component: () => import("../views/UserView.vue"),
    },
    {
      path: "/users",
      name: "users-search",
      component: () => import("../views/UsersSearchView.vue"),
      meta: { requiresAuth: true },
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
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/actualities/create",
      name: "admin-actuality-create",
      component: () => import("../views/AdminActualityCreate.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/events/create",
      name: "admin-event-create",
      component: () => import("../views/AdminEventCreate.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/users",
      name: "admin-users",
      component: () => import("../views/AdminUsersView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/admin/users/:id",
      name: "admin-user-detail",
      component: () => import("../views/AdminUserDetailView.vue"),
      meta: { requiresAuth: true },
    },
    {
      path: "/connexion-requise",
      name: "auth-required",
      component: () => import("../views/AuthRequiredView.vue"),
    },
    {
      path: "/500",
      name: "server-error",
      component: () => import("../views/ServerErrorView.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      name: "not-found",
      component: () => import("../views/NotFoundView.vue"),
    },
  ],
});

router.beforeEach((to) => {
  const token = localStorage.getItem("token");
  if (to.meta.requiresAuth && !token) {
    return {
      name: "auth-required",
      query: { redirect: to.fullPath },
    };
  }
  return true;
});

export default router;
