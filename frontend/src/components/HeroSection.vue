<script setup>
const props = defineProps({
  actuCount: { type: Number, default: 0 },
  eventCount: { type: Number, default: 0 },
  deviceCount: { type: Number, default: 0 },
})
</script>

<template>
  <section class="hero">
    <div class="hero-content">
      <h1 class="hero-title">BIENVENUE SUR LE PORTAIL<br>DU CAMPUS DE CERGY</h1>
      <div class="hero-stats">
        <div class="hero-stat">
          <div class="hero-stat-val">{{ props.actuCount }}</div>
          <div class="hero-stat-label">Actualités</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val">{{ props.eventCount }}</div>
          <div class="hero-stat-label">Événements</div>
        </div>
        <div class="hero-stat">
          <div class="hero-stat-val">{{ props.deviceCount }}</div>
          <div class="hero-stat-label">Objets connectés</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  height: 100vh;
  background-image: url('/campus.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 0 6rem;
}
.hero-content {
  position: relative;
  z-index: 1;
  max-width: 550px;
  background: rgba(10, 30, 70, 0.6);
  padding: 2rem;
  border-radius: 16px;
}
.hero-title {
  color: white;
  font-size: 2rem;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 2rem;
  letter-spacing: 1px;
}
.hero-stats {
  display: flex;
  gap: 2rem;
}
.hero-stat {
  text-align: center;
}
.hero-stat-val {
  color: white;
  font-size: 1.8rem;
  font-weight: 800;
}
.hero-stat-label {
  color: #a8cbf0;
  font-size: 12px;
  margin-top: 2px;
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .hero {
    justify-content: center;
    padding: 0 2rem;
    align-items: flex-end;
    padding-bottom: 3rem;
  }
  .hero-content {
    max-width: 100%;
    width: 100%;
  }
  .hero-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .hero {
    height: 85vh;
    padding: 0 1rem;
    padding-bottom: 2rem;
  }
  .hero-title {
    font-size: 1.3rem;
    margin-bottom: 1.5rem;
  }
  .hero-stats {
    gap: 1rem;
  }
  .hero-stat-val {
    font-size: 1.4rem;
  }
  .hero-stat-label {
    font-size: 11px;
  }
}
</style>