<script setup>
const sponsors = [
  { nom: 'Google', logo: 'G' },
  { nom: 'Microsoft', logo: 'M' },
  { nom: 'Thales', logo: 'T' },
  { nom: 'Airbus', logo: 'A' },
  { nom: 'Orange', logo: 'O' },
]
</script>

<template>
  <footer class="footer" id="contact">

    <div class="sponsors-bar">
      <p class="sponsors-titre">Nos partenaires</p>
      <div class="sponsors-list">
        <div class="sponsor-item" v-for="s in sponsors" :key="s.nom">
          <div class="sponsor-logo">{{ s.logo }}</div>
          <span class="sponsor-nom">{{ s.nom }}</span>
        </div>
      </div>
    </div>

    <div class="footer-main">
      <div class="footer-inner">

        <div class="footer-col">
          <div class="footer-brand">
            <svg viewBox="0 0 60 60" class="footer-logo" xmlns="http://www.w3.org/2000/svg">
              <rect width="60" height="60" rx="12" fill="#1a5c9e"/>
              <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-size="22" font-weight="800" font-family="Arial">CY</text>
            </svg>
            <span class="footer-brand-name">CYTech</span>
          </div>
          <p class="footer-desc">École d'Ingénieurs — Campus de Cergy. Former les ingénieurs de demain dans un environnement connecté et innovant.</p>
          <div class="footer-socials">
            <a href="#" class="social-btn">f</a>
            <a href="#" class="social-btn">in</a>
            <a href="#" class="social-btn">yt</a>
          </div>
        </div>

        <div class="footer-col">
          <h4 class="footer-col-titre">Navigation</h4>
          <ul class="footer-links">
            <li>Qui sommes-nous</li>
            <li>Nos formations</li>
            <li>Objets connectés</li>
            <li>Actualités</li>
            <li>Événements</li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="footer-col-titre">Université</h4>
          <ul class="footer-links">
            <li>CY Cergy Paris Université</li>
            <li>ENT Étudiant</li>
            <li>Bibliothèque universitaire</li>
            <li>Parcoursup</li>
            <li>FAQ</li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="footer-col-titre">Contact</h4>
          <ul class="footer-links">
            <li>📍 Site du Parc, Cergy</li>
            <li>📍 Site Fermat, Cergy</li>
            <li>📍 Site des Chênes, Cergy</li>
            <li>✉️ contact@cytech.fr</li>
            <li>📞 01 34 25 00 00</li>
          </ul>
        </div>

      </div>
    </div>

    <div class="footer-bottom">
      <p>© 2025 CYTech — Tous droits réservés</p>
      <p>Mentions légales · Politique de confidentialité</p>
    </div>

  </footer>
</template>

<style scoped>
.footer { background: #f4f6f9; }

.sponsors-bar {
  background: white; border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb; padding: 2rem; text-align: center;
}
.sponsors-titre { font-size: 13px; font-weight: 700; color: #999; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 1.5rem; }
.sponsors-list { display: flex; justify-content: center; align-items: center; gap: 3rem; flex-wrap: wrap; }
.sponsor-item { display: flex; align-items: center; gap: 8px; opacity: 0.6; transition: opacity 0.2s; cursor: pointer; }
.sponsor-item:hover { opacity: 1; }
.sponsor-logo { width: 36px; height: 36px; background: #1a5c9e; color: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 16px; }
.sponsor-nom { font-weight: 700; font-size: 15px; color: #333; }

.footer-main { padding: 4rem 2rem; }
.footer-inner {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 2fr 1fr 1fr 1fr; gap: 3rem;
}
.footer-brand { display: flex; align-items: center; gap: 10px; margin-bottom: 1rem; }
.footer-logo { width: 40px; height: 40px; }
.footer-brand-name { font-weight: 800; font-size: 20px; color: #0d2d5e; letter-spacing: 2px; }
.footer-desc { font-size: 14px; color: #666; line-height: 1.7; margin-bottom: 1.5rem; }
.footer-socials { display: flex; gap: 10px; }
.social-btn {
  width: 36px; height: 36px; background: #1a5c9e; color: white;
  border-radius: 8px; display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 13px; text-decoration: none; transition: background 0.2s;
}
.social-btn:hover { background: #0d2d5e; }
.footer-col-titre { font-size: 15px; font-weight: 700; color: #0d2d5e; margin-bottom: 1rem; padding-bottom: 8px; border-bottom: 2px solid #1a5c9e; }
.footer-links { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 10px; }
.footer-links li { font-size: 14px; color: #555; cursor: pointer; transition: color 0.2s; }
.footer-links li:hover { color: #1a5c9e; }

.footer-bottom {
  background: #0d2d5e; padding: 1rem 2rem;
  display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;
}
.footer-bottom p { color: #a8cbf0; font-size: 13px; }

@media (max-width: 900px) {
  .footer-inner { grid-template-columns: 1fr 1fr; gap: 2rem; }
}
@media (max-width: 480px) {
  .footer-inner { grid-template-columns: 1fr; }
  .footer-main { padding: 2rem 1rem; }
  .footer-bottom { flex-direction: column; text-align: center; }
  .sponsors-list { gap: 1.5rem; }
}
</style>