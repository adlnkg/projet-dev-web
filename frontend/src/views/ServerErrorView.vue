<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <main class="page-wrap">
    <section class="card">
      <p class="badge">500</p>
      <h1>Erreur serveur</h1>
      <p class="desc">Une erreur interne est survenue. Merci de réessayer dans quelques instants.</p>
      <div class="actions">
        <button class="btn-primary" @click="router.push('/')">Retour accueil</button>
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
  background: #ffedd5;
  color: #c2410c;
  padding: 4px 10px;
  border-radius: 999px;
  font-weight: 700;
  margin: 0 0 0.75rem;
}
h1 { margin: 0; color: #0d2d5e; }
.desc { color: #666; margin: 0.75rem 0 1.25rem; }
.btn-primary {
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  font-weight: 700;
  cursor: pointer;
  background: #1a5c9e;
  color: #fff;
}
.btn-primary:hover { background: #0d2d5e; }
</style>
