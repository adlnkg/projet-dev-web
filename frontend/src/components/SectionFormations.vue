<script setup>
const formations = [
  { id: 1, titre: 'Cycle Ingénieur', description: "Formation d'excellence en ingénierie informatique, du cycle préparatoire au diplôme d'ingénieur." },
  { id: 2, titre: 'Formation Continue', description: 'Des formations adaptées aux professionnels souhaitant se perfectionner ou se reconvertir.' },
  { id: 3, titre: 'Master Recherche', description: 'Approfondissez vos connaissances en recherche et innovation dans les domaines du numérique.' },
]
</script>

<template>
  <section class="formations-section" id="formations">
    <div class="formations-inner">
      <div class="formations-left">
        <p class="section-label">FORMATIONS</p>
        <h2 class="section-titre">Construisez votre avenir<br>avec CYTech</h2>
        <p class="section-desc">CYTech propose des formations d'excellence en ingénierie et informatique, allant du cycle ingénieur au master recherche.</p>
      </div>
      <div class="formations-cards">
        <div class="formation-card" v-for="f in formations" :key="f.id">
          <h3 class="formation-titre">{{ f.titre }}</h3>
          <p class="formation-desc">{{ f.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.formations-section {
  background: white;
  padding: 5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
}
.formations-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  gap: 4rem;
  align-items: flex-start;
}
.formations-left {
  max-width: 350px;
  flex-shrink: 0;
}
.section-label {
  color: #1a5c9e;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 1.5px;
  margin-bottom: 12px;
}
.section-titre {
  color: #0d2d5e;
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 16px;
}
.section-desc {
  color: #666;
  font-size: 16px;
  line-height: 1.7;
}
.formations-cards {
  display: flex;
  gap: 20px;
  flex: 1;
}
.formation-card {
  background: white;
  border: 2px solid #1a5c9e;
  border-radius: 14px;
  padding: 1.5rem;
  flex: 1;
  transition: background 0.2s, transform 0.15s;
}
.formation-card:hover {
  background: #f0f6ff;
  transform: translateY(-4px);
}
.formation-titre {
  color: #0d2d5e;
  font-size: 22px;
  font-weight: 700;
  margin-bottom: 10px;
}
.formation-desc {
  color: #555;
  font-size: 15px;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .formations-inner {
    flex-direction: column;
    gap: 2rem;
  }
  .formations-left {
    max-width: 100%;
  }
  .formations-cards {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .formations-section { padding: 3rem 1rem; }
  .section-titre { font-size: 1.6rem; }
}
</style>