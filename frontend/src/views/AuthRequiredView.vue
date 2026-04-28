<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

function goLogin() {
  const redirect = route.query.redirect ? String(route.query.redirect) : '/'
  router.push({ path: '/login', query: { redirect } })
}
</script>

<template>
  <main class="page-wrap">
    <section class="card">
      <p class="badge">401</p>
      <h1>Connexion requise</h1>
      <p class="desc">Vous devez être connecté pour accéder à cette page.</p>
      <div class="actions">
        <button class="btn-primary" @click="goLogin">Se connecter</button>
        <button class="btn-secondary" @click="router.push('/')">Retour accueil</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.page-wrap {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #f0f6ff 0%, #ffffff 100%);
}
.card {
  width: 100%;
  max-width: 520px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 12px 30px rgba(13, 45, 94, 0.08);
  padding: 2rem;
  text-align: center;
}
.badge {
  display: inline-flex;
  background: #dbeafe;
  color: #1e40af;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 700;
  margin: 0 0 0.75rem;
}
h1 { margin: 0; color: #0d2d5e; }
.desc { color: #666; margin: 0.75rem 0 1.25rem; }
.actions { display: flex; gap: 0.75rem; justify-content: center; flex-wrap: wrap; }
.btn-primary, .btn-secondary {
  border-radius: 8px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
}
.btn-primary { border: none; background: #1a5c9e; color: #fff; }
.btn-primary:hover { background: #0d2d5e; }
.btn-secondary { border: 1px solid #d1d5db; background: #fff; color: #374151; }
.btn-secondary:hover { background: #f9fafb; }
</style>
