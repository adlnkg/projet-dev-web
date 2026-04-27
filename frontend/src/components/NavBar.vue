<script setup>
import { ref } from 'vue'

const recherche = ref('')
const categorieChoisie = ref('')
const siteChoisi = ref('')
const filtresVisibles = ref(false)
const langue = ref('FR')
const menuLangueVisible = ref(false)
const menuMobileVisible = ref(false)
const resultats = ref([])
const recherching = ref(false)

const categories = ['NEWS', 'ANNOUNCEMENT', 'UPDATE', 'OTHER']
const sites = ['Site du Parc', 'Site Fermat', 'Site des Chênes']

function scrollVers(id) {
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    menuMobileVisible.value = false
  }
}

function changerLangue(l) {
  langue.value = l
  menuLangueVisible.value = false
}

async function lancerRecherche() {
  if (!recherche.value && !categorieChoisie.value) return
  recherching.value = true
  resultats.value = []
  try {
    let url = 'http://localhost:3000/api/actualities/search?'
    if (recherche.value) url += `keywords=${encodeURIComponent(recherche.value)}&`
    if (categorieChoisie.value) url += `type=${categorieChoisie.value}&`
    const response = await fetch(url)
    const data = await response.json()
    if (data.success) resultats.value = data.data
  } catch (e) {
    console.error('Erreur recherche', e)
  } finally {
    recherching.value = false
  }
}

function fermerRecherche() {
  filtresVisibles.value = false
  resultats.value = []
  recherche.value = ''
  categorieChoisie.value = ''
}
</script>

<template>
  <div>
    <!-- BARRE SUPÉRIEURE -->
    <div class="topbar">
      <div class="topbar-links">
        <span @click="scrollVers('actualites')">ACTUALITÉS</span>
        <span class="sep">|</span>
        <span @click="scrollVers('evenements')">ÉVÉNEMENTS</span>
        <span class="sep">|</span>
        <span @click="scrollVers('contact')">CONTACT</span>
      </div>
      <div class="topbar-right">
        <div class="langue-menu">
          <span class="langue-btn" @click="menuLangueVisible = !menuLangueVisible">
            {{ langue }} ▾
          </span>
          <div class="langue-dropdown" v-if="menuLangueVisible">
            <span v-if="langue === 'FR'" @click="changerLangue('EN')">🇬🇧 EN</span>
            <span v-if="langue === 'EN'" @click="changerLangue('FR')">🇫🇷 FR</span>
          </div>
        </div>
      </div>
    </div>

    <!-- NAVBAR PRINCIPALE -->
    <nav class="navbar">
      <div class="navbar-brand">
        <svg class="navbar-logo" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg">
          <rect width="60" height="60" rx="12" fill="#1a5c9e"/>
          <text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="white" font-size="22" font-weight="800" font-family="Arial">CY</text>
        </svg>
        <div>
          <div class="navbar-name">CYTech</div>
          <div class="navbar-sub">École d'Ingénieurs</div>
        </div>
      </div>

      <!-- LIENS DESKTOP -->
      <div class="navbar-links desktop-only">
        <span class="nav-link" @click="scrollVers('quisommesnous')">QUI SOMMES NOUS</span>
        <span class="nav-link" @click="scrollVers('formations')">NOS FORMATIONS</span>
        <span class="nav-link" @click="scrollVers('objets')">OBJETS CONNECTÉS</span>
      </div>

      <!-- RECHERCHE DESKTOP -->
      <div class="navbar-search desktop-only">
        <div class="search-bar" :class="{ active: filtresVisibles }">
          <input
            v-model="recherche"
            type="text"
            placeholder="Rechercher..."
            class="search-input"
            @focus="filtresVisibles = true"
            @keyup.enter="lancerRecherche"
          />
        </div>
        <div class="search-filters" v-if="filtresVisibles">
          <div class="filters-top">
            <button class="btn-search" @click="lancerRecherche">
              {{ recherching ? 'Recherche...' : 'Rechercher' }}
            </button>
            <button class="btn-close" @click="fermerRecherche">✕</button>
          </div>
          <div class="filters-row">
            <div class="filter-field">
              <label>Type</label>
              <select v-model="categorieChoisie" class="filter-select">
                <option value="">Tous</option>
                <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
              </select>
            </div>
            <div class="filter-field">
              <label>Site</label>
              <select v-model="siteChoisi" class="filter-select">
                <option value="">Tous les sites</option>
                <option v-for="site in sites" :key="site" :value="site">{{ site }}</option>
              </select>
            </div>
          </div>
          <div class="resultats" v-if="resultats.length > 0">
            <div class="resultat-item" v-for="r in resultats" :key="r.id">
              <div class="resultat-titre">{{ r.title }}</div>
              <div class="resultat-date">{{ new Date(r.createdAt).toLocaleDateString('fr-FR') }}</div>
            </div>
          </div>
          <div class="no-resultat" v-if="!recherching && resultats.length === 0 && recherche">
            Aucun résultat trouvé.
          </div>
        </div>
      </div>

      <!-- BOUTON MENU MOBILE -->
      <button class="menu-mobile-btn mobile-only" @click="menuMobileVisible = !menuMobileVisible">
        {{ menuMobileVisible ? '✕' : '☰' }}
      </button>
    </nav>

    <!-- MENU MOBILE -->
    <div class="menu-mobile" v-if="menuMobileVisible">
      <div class="mobile-search">
        <input
          v-model="recherche"
          type="text"
          placeholder="Rechercher..."
          class="mobile-search-input"
          @keyup.enter="lancerRecherche"
        />
        <button @click="lancerRecherche" class="mobile-search-btn">🔍</button>
      </div>
      <div class="mobile-links">
        <span @click="scrollVers('quisommesnous')">QUI SOMMES NOUS</span>
        <span @click="scrollVers('formations')">NOS FORMATIONS</span>
        <span @click="scrollVers('objets')">OBJETS CONNECTÉS</span>
        <span @click="scrollVers('actualites')">ACTUALITÉS</span>
        <span @click="scrollVers('evenements')">ÉVÉNEMENTS</span>
        <span @click="scrollVers('contact')">CONTACT</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.topbar {
  background: #1a5c9e;
  color: white;
  padding: 10px 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  letter-spacing: 1px;
}
.topbar-links {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #d6e8f7;
}
.topbar-links span:not(.sep):hover { color: white; cursor: pointer; }
.topbar-right { display: flex; align-items: center; gap: 14px; color: #d6e8f7; }
.sep { color: #5a8ab8; }
.langue-menu { position: relative; }
.langue-btn { cursor: pointer; color: #d6e8f7; font-weight: 600; }
.langue-btn:hover { color: white; }
.langue-dropdown { position: absolute; top: 28px; right: 0; background: white; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); overflow: hidden; z-index: 300; min-width: 100px; }
.langue-dropdown span { display: block; padding: 10px 14px; font-size: 13px; color: #333; cursor: pointer; }
.langue-dropdown span:hover { background: #f0f5ff; color: #1a5c9e; }

.navbar {
  background: white;
  border-bottom: 2px solid #1a5c9e;
  padding: 0 2rem;
  height: 75px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}
.navbar-brand { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
.navbar-logo { height: 50px; width: 50px; }
.navbar-name { font-weight: 800; font-size: 22px; color: #0d2d5e; letter-spacing: 2px; }
.navbar-sub { font-size: 11px; color: #999; letter-spacing: 1px; text-transform: uppercase; }

.navbar-links { display: flex; align-items: center; gap: 1.5rem; }
.nav-link { font-size: 12px; font-weight: 700; color: #0d2d5e; letter-spacing: 0.8px; cursor: pointer; white-space: nowrap; padding-bottom: 4px; border-bottom: 2px solid transparent; transition: border-color 0.2s, color 0.2s; }
.nav-link:hover { color: #1a5c9e; border-bottom: 2px solid #1a5c9e; }

.navbar-search { position: relative; flex-shrink: 0; }
.search-bar { display: flex; align-items: center; border: 1.5px solid #e5e7eb; border-radius: 25px; padding: 7px 16px; transition: border-color 0.2s; }
.search-bar.active { border-color: #1a5c9e; }
.search-input { border: none; outline: none; font-size: 14px; width: 160px; color: #333; }
.search-filters { position: absolute; top: 55px; right: 0; background: white; border: 1.5px solid #e5e7eb; border-radius: 14px; padding: 1.2rem; box-shadow: 0 8px 24px rgba(0,0,0,0.1); z-index: 200; min-width: 400px; display: flex; flex-direction: column; gap: 12px; }
.filters-top { display: flex; justify-content: flex-end; gap: 8px; }
.filters-row { display: flex; gap: 12px; align-items: flex-start; }
.filter-field { display: flex; flex-direction: column; gap: 5px; flex: 1; }
.filter-field label { font-size: 11px; font-weight: 600; color: #555; }
.filter-select { padding: 8px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; outline: none; color: #333; }
.filter-select:focus { border-color: #1a5c9e; }
.btn-search { padding: 8px 18px; background: #1a5c9e; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; font-weight: 600; }
.btn-search:hover { background: #0d2d5e; }
.btn-close { padding: 8px 12px; background: #f4f4f4; color: #666; border: none; border-radius: 8px; cursor: pointer; font-size: 13px; }
.btn-close:hover { background: #e5e7eb; }
.resultats { border-top: 1px solid #e5e7eb; padding-top: 10px; display: flex; flex-direction: column; gap: 8px; max-height: 250px; overflow-y: auto; }
.resultat-item { padding: 10px 12px; border-radius: 8px; cursor: pointer; transition: background 0.15s; }
.resultat-item:hover { background: #f0f5ff; }
.resultat-titre { font-size: 14px; font-weight: 600; color: #0d2d5e; }
.resultat-date { font-size: 12px; color: #999; margin-top: 2px; }
.no-resultat { text-align: center; font-size: 13px; color: #999; padding: 10px; }

/* MENU MOBILE */
.menu-mobile-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #0d2d5e;
  padding: 4px 8px;
}
.menu-mobile {
  background: white;
  border-bottom: 2px solid #1a5c9e;
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: sticky;
  top: 75px;
  z-index: 99;
}
.mobile-search {
  display: flex;
  gap: 8px;
}
.mobile-search-input {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
}
.mobile-search-input:focus { border-color: #1a5c9e; }
.mobile-search-btn {
  padding: 10px 14px;
  background: #1a5c9e;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 16px;
}
.mobile-links {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.mobile-links span {
  padding: 10px 0;
  font-size: 14px;
  font-weight: 600;
  color: #0d2d5e;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  letter-spacing: 0.5px;
}
.mobile-links span:hover { color: #1a5c9e; }

/* RESPONSIVE */
.desktop-only { display: flex; }
.mobile-only { display: none; }

@media (max-width: 900px) {
  .desktop-only { display: none !important; }
  .mobile-only { display: block !important; }
  .topbar-links { display: none; }
  .navbar-name { font-size: 18px; }
}

@media (max-width: 480px) {
  .topbar { padding: 8px 1rem; }
  .navbar { padding: 0 1rem; }
}
</style>