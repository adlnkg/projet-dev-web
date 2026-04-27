<script setup>
</script>

<template>
  <section class="qui-section" id="quisommesnous">
    <div class="qui-inner">

      <div class="qui-left">
        <p class="section-label">QUI SOMMES NOUS</p>
        <h2 class="section-titre">Une école d'ingénieurs<br>tournée vers l'avenir</h2>
        <p class="section-desc">CYTech est une école d'ingénieurs de référence, formant depuis des décennies les talents de demain. Implantée sur le campus de Cergy, elle se distingue par son engagement dans l'innovation technologique et le numérique.</p>
        <p class="section-desc">À la pointe de la révolution des objets connectés, CYTech intègre l'IoT au cœur de ses formations et de son campus. Nos étudiants évoluent dans un environnement intelligent, connecté et stimulant.</p>

        <div class="valeurs-grid">
          <div class="valeur-item">
            <div class="valeur-titre">Innovation</div>
            <div class="valeur-desc">Un campus équipé des dernières technologies IoT et IA.</div>
          </div>
          <div class="valeur-item">
            <div class="valeur-titre">Excellence</div>
            <div class="valeur-desc">Des formations reconnues par les plus grandes entreprises.</div>
          </div>
          <div class="valeur-item">
            <div class="valeur-titre">Connexion</div>
            <div class="valeur-desc">Un réseau d'objets connectés pour un campus intelligent.</div>
          </div>
          <div class="valeur-item">
            <div class="valeur-titre">Avenir</div>
            <div class="valeur-desc">Former les ingénieurs qui construiront le monde de demain.</div>
          </div>
        </div>
      </div>

      <div class="qui-right">
        <img
          src="/equipe.jpg"
          alt="Équipe CYTech"
          class="qui-img"
        />
      </div>

    </div>
  </section>
</template>

<style scoped>
.qui-section {
  background: #1a5c9e;
  padding: 5rem 2rem;
  border-bottom: 1px solid #155088;
}
.qui-inner {
  max-width: 1100px;
  margin: 0 auto;
  display: flex;
  gap: 4rem;
  align-items: center;
}
.qui-left { flex: 1; }
.section-label {
  color: #a8cbf0;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 1.5px;
  margin-bottom: 8px;
}
.section-titre {
  color: white;
  font-size: 2.2rem;
  font-weight: 800;
  line-height: 1.3;
  margin-bottom: 16px;
}
.section-desc {
  color: #d6e8f7;
  font-size: 15px;
  line-height: 1.7;
  margin-bottom: 16px;
}
.valeurs-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 2rem;
}
.valeur-item {
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 1.2rem;
  border-left: 4px solid white;
  transition: transform 0.2s;
}
.valeur-item:hover {
  transform: translateY(-2px);
  background: rgba(255,255,255,0.15);
}
.valeur-titre {
  color: white;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
}
.valeur-desc {
  color: #a8cbf0;
  font-size: 13px;
  line-height: 1.5;
}
.qui-right {
  flex: 1;
  position: relative;
}
.qui-img {
  width: 100%;
  height: 400px;
  object-fit: contain;
  border-radius: 20px;
  display: block;
  background: rgba(255,255,255,0.05);
}

@media (max-width: 900px) {
  .qui-inner {
    flex-direction: column;
    gap: 2rem;
  }
  .qui-right { width: 100%; }
  .qui-img { height: 280px; }
  .section-titre { font-size: 1.7rem; }
}

@media (max-width: 480px) {
  .qui-section { padding: 3rem 1rem; }
  .valeurs-grid { grid-template-columns: 1fr; }
  .section-titre { font-size: 1.5rem; }
  .qui-img { height: 220px; }
}
</style>