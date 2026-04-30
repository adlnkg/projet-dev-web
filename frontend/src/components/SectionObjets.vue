<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

function ouvrirObjets() {
  const token = localStorage.getItem('token')

  if (token) {
    router.push({ path: '/recherche', query: { category: 'device' } })
    return
  }
  router.push({ path: '/login', query: { redirect: '/recherche?category=device' } })
}

const images = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1400&q=80',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1400&q=80',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1400&q=80',
]

const imageActuelle = ref(0)
let interval = null

onMounted(() => {
  interval = setInterval(() => {
    imageActuelle.value = (imageActuelle.value + 1) % images.length
  }, 5000)
})

onUnmounted(() => {
  clearInterval(interval)
})
</script>

<template>
  <section class="objets-section" id="objets">
    <transition name="fade">
      <div class="objets-bg" :key="imageActuelle" :style="{ backgroundImage: `url(${images[imageActuelle]})` }"></div>
    </transition>
    <div class="objets-overlay"></div>
    <div class="objets-inner">
      <div class="objets-left">
        <p class="section-label">OBJETS CONNECTÉS</p>
        <h2 class="section-titre">Un campus<br>intelligent</h2>
        <p class="section-desc">Le campus de Cergy est équipé de centaines d'objets connectés répartis sur ses 3 sites. Capteurs, caméras, systèmes d'accès permettent d'optimiser la gestion des bâtiments.</p>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-val">100+</div>
            <div class="stat-label">Objets connectés</div>
          </div>
          <div class="stat-item">
            <div class="stat-val">3</div>
            <div class="stat-label">Sites couverts</div>
          </div>
          <div class="stat-item">
            <div class="stat-val">24/7</div>
            <div class="stat-label">Surveillance</div>
          </div>
          <div class="stat-item">
            <div class="stat-val">6</div>
            <div class="stat-label">Types de capteurs</div>
          </div>
        </div>
        <button class="btn-objets" @click="ouvrirObjets">
          Accéder aux objets connectés
        </button>
      </div>
    </div>
    <div class="indicators">
      <span v-for="(img, i) in images" :key="i" class="indicator" :class="{ active: i === imageActuelle }" @click="imageActuelle = i"></span>
    </div>
    <div class="objets-badge">
      <span class="badge-dot"></span>
      Campus connecté en temps réel
    </div>
  </section>
</template>

<style scoped>
.objets-section {
  position: relative;
  padding: 5rem 2rem;
  min-height: 500px;
  display: flex;
  align-items: center;
  overflow: hidden;
}
.objets-bg {
  position: absolute; inset: 0;
  background-size: cover; background-position: center;
}
.fade-enter-active, .fade-leave-active { transition: opacity 1s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.objets-overlay {
  position: absolute; inset: 0;
  background: rgba(5, 20, 50, 0.75); z-index: 1;
}
.objets-inner {
  position: relative; z-index: 2;
  max-width: 1100px; margin: 0 auto; width: 100%;
}
.objets-left { max-width: 600px; }
.section-label { color: #a8cbf0; font-size: 14px; font-weight: 700; letter-spacing: 1.5px; margin-bottom: 8px; }
.section-titre { color: white; font-size: 2.8rem; font-weight: 800; line-height: 1.2; margin-bottom: 16px; }
.section-desc { color: #a8cbf0; font-size: 15px; line-height: 1.7; margin-bottom: 2.5rem; }
.stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; max-width: 400px; }
.stat-item { background: rgba(255,255,255,0.1); border-radius: 14px; padding: 1.2rem 1.5rem; border-left: 4px solid #1a5c9e; }
.stat-val { color: white; font-size: 2rem; font-weight: 800; }
.stat-label { color: #a8cbf0; font-size: 13px; margin-top: 4px; }
.btn-objets {
  margin-top: 2rem;
  padding: 12px 28px;
  background: #1a5c9e; color: white;
  border: none; border-radius: 8px;
  cursor: pointer; font-size: 15px; font-weight: 600;
  transition: background 0.2s;
}
.btn-objets:hover { background: #0d2d5e; }
.indicators { position: absolute; bottom: 24px; left: 50%; transform: translateX(-50%); z-index: 2; display: flex; gap: 8px; }
.indicator { width: 10px; height: 10px; border-radius: 50%; background: rgba(255,255,255,0.4); cursor: pointer; transition: background 0.3s; }
.indicator.active { background: white; }
.objets-badge {
  position: absolute; bottom: 24px; right: 40px; z-index: 2;
  background: white; border-radius: 30px; padding: 8px 18px;
  font-size: 13px; font-weight: 600; color: #0d2d5e;
  display: flex; align-items: center; gap: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}
.badge-dot {
  width: 10px; height: 10px; background: #15803d;
  border-radius: 50%; display: inline-block;
  animation: pulse 1.5s infinite;
}
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }

@media (max-width: 768px) {
  .objets-section { padding: 3rem 1rem; min-height: 400px; }
  .section-titre { font-size: 2rem; }
  .objets-badge { right: 10px; bottom: 60px; font-size: 11px; padding: 6px 12px; }
  .stats-grid { max-width: 100%; }
}
@media (max-width: 480px) {
  .section-titre { font-size: 1.6rem; }
  .stat-val { font-size: 1.5rem; }
}
</style>