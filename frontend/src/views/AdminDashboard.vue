<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div class="page-container">
    <header class="page-header">
      <h1>Administration</h1>
      <p>Créer et gérer rapidement des actualités, des événements et des utilisateurs.</p>
    </header>

    <div class="admin-actions">
      <div class="card" @click="router.push('/admin/actualities/create')" style="cursor:pointer;">
        <h3>Nouvelle actualité</h3>
        <p>Créer une actualité avec image et contenu.</p>
      </div>

      <div class="card" @click="router.push('/admin/events/create')" style="cursor:pointer;">
        <h3>Nouvel événement</h3>
        <p>Créer un événement avec dates, lieu et capacité.</p>
      </div>

      <div class="card" @click="router.push('/admin/areas/create')" style="cursor:pointer;">
        <h3>Nouvelle zone</h3>
        <p>Créer une zone ou un sous-ensemble de zone selon les métadonnées du backend.</p>
      </div>

      <div class="card" @click="router.push('/admin/devices/create')" style="cursor:pointer;">
        <h3>Nouvel objet connecté</h3>
        <p>Créer un device avec ses champs spécifiques selon son type.</p>
      </div>

      <div class="card" @click="router.push('/admin/users')" style="cursor:pointer;">
        <h3>Gestion des utilisateurs</h3>
        <p>Voir, modifier et gérer les rôles des utilisateurs.</p>
      </div>
      
      <div class="card" @click="router.push('/admin/deletion-requests')" style="cursor:pointer;">
        <h3>Demandes de suppression</h3>
        <p>Valider ou refuser les suppressions d'événements et objets connectés.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container { padding: 2rem; }
.page-header h1 { margin: 0 0 .5rem; color: #0d2d5e; }
.admin-actions { display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.2rem; }
.card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem 1.2rem; width: 320px; box-shadow: 0 8px 20px rgba(0,0,0,0.06); }
.card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 1rem 1.2rem; width: 320px; box-shadow: 0 8px 20px rgba(0,0,0,0.06); transition: all 0.2s; }
.card:hover { box-shadow: 0 12px 30px rgba(0,0,0,0.1); transform: translateY(-2px); }
.card h3 { margin: 0 0 .4rem; color: #0d2d5e; }
.card p { margin: 0; color: #666; font-size: 14px; }
@media (max-width: 900px) { .admin-actions { flex-direction: column; } .card { width: 100%; } }
</style>
