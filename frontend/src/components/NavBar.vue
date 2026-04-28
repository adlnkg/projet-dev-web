<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const recherche = ref('')
const categorieChoisie = ref('')
const batimentSaisi = ref('')
const filtresVisibles = ref(false)
const langue = ref('FR')
const menuLangueVisible = ref(false)
const menuMobileVisible = ref(false)
const resultats = ref([])
const recherching = ref(false)
const hasSearched = ref(false)

const categories = [
  { value: '', label: 'Tout' },
  { value: 'event', label: 'Événements' },
  { value: 'actuality', label: 'Actualités' },
  { value: 'device', label: 'Objets connectés' },
  { value: 'area', label: 'Espaces' },
]

const typeConfig = {
  event:     { label: 'Événement',     color: '#1a5c9e', bg: '#dbeafe', icon: '📅' },
  actuality: { label: 'Actualité',     color: '#15803d', bg: '#dcfce7', icon: '📰' },
  device:    { label: 'Objet connecté',color: '#7c3aed', bg: '#ede9fe', icon: '📡' },
  area:      { label: 'Espace',        color: '#c2410c', bg: '#ffedd5', icon: '🏫' },
}

const areaTypeLabels = {
  BUILDING: 'Bâtiment',
  FLOOR: 'Étage',
  CLASSROOM: 'Salle de classe',
  TECHNICAL_ROOM: 'Salle technique',
}

function detectType(item) {
  if ('startTime' in item) return 'event'
  if ('brand' in item || 'model' in item) return 'device'
  if ('content' in item) return 'actuality'
  return 'area'
}

function getResultTitle(r) {
  return r.title ?? r.name ?? '—'
}

function getResultSubtitle(r) {
  if (r._type === 'event') {
    const parts = []
    if (r.startTime) parts.push(new Date(r.startTime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }))
    if (r.organizer) parts.push(r.organizer)
    return parts.join(' · ')
  }
  if (r._type === 'actuality') {
    return r.createdAt ? new Date(r.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  }
  if (r._type === 'device') {
    return [r.type, r.brand].filter(Boolean).join(' · ')
  }
  if (r._type === 'area') {
    return areaTypeLabels[r.type] ?? r.type ?? ''
  }
  return ''
}

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
  const kw = recherche.value.trim()
  const cat = categorieChoisie.value
  const bat = batimentSaisi.value.trim()
  if (!kw && !bat) return

  recherching.value = true
  hasSearched.value = true
  resultats.value = []

  const token = localStorage.getItem('token')
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : {}

  try {
    if (cat === 'actuality') {
      const url = `http://localhost:3000/api/actualities/search?keywords=${encodeURIComponent(kw)}`
      const res = await fetch(url)
      const data = await res.json()
      if (data.success) resultats.value = data.data.map(r => ({ ...r, _type: 'actuality' }))

    } else if (cat === 'event' || cat === 'device' || cat === 'area') {
      let url = `http://localhost:3000/api/search?keywords=${encodeURIComponent(kw)}&type=${cat}`
      if (bat) url += `&building=${encodeURIComponent(bat)}`
      const res = await fetch(url, { headers: authHeaders })
      const data = await res.json()
      if (data.success) resultats.value = data.data.map(r => ({ ...r, _type: cat }))

    } else {
      let globalUrl = `http://localhost:3000/api/search?keywords=${encodeURIComponent(kw)}`
      if (bat) globalUrl += `&building=${encodeURIComponent(bat)}`
      const actuUrl = `http://localhost:3000/api/actualities/search?keywords=${encodeURIComponent(kw)}`

      const [globalRes, actuRes] = await Promise.all([
        fetch(globalUrl, { headers: authHeaders }),
        fetch(actuUrl),
      ])
      const [globalData, actuData] = await Promise.all([
        globalRes.json(),
        actuRes.json(),
      ])

      const globalResults = globalData.success ? globalData.data.map(r => ({ ...r, _type: detectType(r) })) : []
      const actuResults = actuData.success ? actuData.data.map(r => ({ ...r, _type: 'actuality' })) : []
      resultats.value = [...globalResults, ...actuResults]
    }
  } catch (e) {
    console.error('Erreur recherche', e)
  } finally {
    recherching.value = false
  }
}

function naviguerVersResultat(r) {
  fermerRecherche()
  if (r._type === 'event') {
    router.push(`/evenements?keywords=${encodeURIComponent(getResultTitle(r))}`)
  } else if (r._type === 'actuality') {
    router.push(`/actualites?keywords=${encodeURIComponent(getResultTitle(r))}`)
  } else if (r._type === 'device') {
    router.push('/login')
  } else if (r._type === 'area') {
    if (router.currentRoute.value.path === '/') {
      scrollVers('quisommesnous')
    } else {
      router.push('/').then(() => setTimeout(() => scrollVers('quisommesnous'), 400))
    }
  }
}

function fermerRecherche() {
  filtresVisibles.value = false
  resultats.value = []
  recherche.value = ''
  categorieChoisie.value = ''
  batimentSaisi.value = ''
  hasSearched.value = false
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
        <img src="/cytech-logo.png" alt="CYTech" class="navbar-logo" />
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
        <span class="nav-link btn-inscrire" @click="router.push('/register')">S'INSCRIRE</span>
      </div>

      <!-- RECHERCHE DESKTOP -->
      <div class="navbar-search desktop-only">
        <div class="search-bar" :class="{ active: filtresVisibles }">
          <span class="search-icon">🔍</span>
          <input
            v-model="recherche"
            type="text"
            placeholder="Rechercher événement, actualité..."
            class="search-input"
            @focus="filtresVisibles = true"
            @keyup.enter="lancerRecherche"
          />
          <button v-if="recherche || filtresVisibles" class="search-clear" @click.stop="fermerRecherche">✕</button>
        </div>

        <!-- PANNEAU FILTRES & RÉSULTATS -->
        <div class="search-panel" v-if="filtresVisibles">

          <!-- Filtres -->
          <div class="filters-section">
            <div class="filter-row">
              <div class="filter-field">
                <label class="filter-label">Catégorie</label>
                <div class="cat-pills">
                  <button
                    v-for="cat in categories"
                    :key="cat.value"
                    class="cat-pill"
                    :class="{ active: categorieChoisie === cat.value }"
                    @click="categorieChoisie = cat.value; hasSearched = false; resultats = []"
                  >
                    {{ cat.label }}
                  </button>
                </div>
              </div>
            </div>
            <div class="filter-row" v-if="categorieChoisie !== 'actuality'">
              <div class="filter-field">
                <label class="filter-label">Bâtiment</label>
                <input
                  v-model="batimentSaisi"
                  type="text"
                  class="filter-input"
                  placeholder="Ex: Turing, Cauchy..."
                  @keyup.enter="lancerRecherche"
                />
              </div>
            </div>
            <div class="filters-actions">
              <button class="btn-search" @click="lancerRecherche" :disabled="recherching">
                <span v-if="recherching" class="spinner-btn"></span>
                <span v-else>🔍</span>
                {{ recherching ? 'Recherche...' : 'Rechercher' }}
              </button>
            </div>
          </div>

          <!-- Résultats -->
          <div class="resultats" v-if="resultats.length > 0">
            <div class="resultats-header">
              {{ resultats.length }} résultat{{ resultats.length > 1 ? 's' : '' }}
            </div>
            <div
              class="resultat-item"
              v-for="r in resultats"
              :key="`${r._type}-${r.id}`"
              @click="naviguerVersResultat(r)"
            >
              <div class="resultat-left">
                <span
                  class="resultat-badge"
                  :style="{ color: typeConfig[r._type].color, background: typeConfig[r._type].bg }"
                >
                  {{ typeConfig[r._type].icon }} {{ typeConfig[r._type].label }}
                </span>
                <div class="resultat-titre">{{ getResultTitle(r) }}</div>
                <div class="resultat-subtitle" v-if="getResultSubtitle(r)">{{ getResultSubtitle(r) }}</div>
              </div>
              <span class="resultat-arrow">›</span>
            </div>
          </div>

          <div class="no-resultat" v-else-if="hasSearched && !recherching">
            Aucun résultat pour cette recherche.
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
        <select v-model="categorieChoisie" class="mobile-cat-select">
          <option v-for="cat in categories" :key="cat.value" :value="cat.value">{{ cat.label }}</option>
        </select>
        <input
          v-model="recherche"
          type="text"
          placeholder="Rechercher..."
          class="mobile-search-input"
          @keyup.enter="lancerRecherche"
        />
        <button @click="lancerRecherche" class="mobile-search-btn">🔍</button>
      </div>
      <div class="mobile-results" v-if="resultats.length > 0">
        <div
          class="mobile-result-item"
          v-for="r in resultats"
          :key="`mob-${r._type}-${r.id}`"
          @click="naviguerVersResultat(r)"
        >
          <span class="resultat-badge" :style="{ color: typeConfig[r._type].color, background: typeConfig[r._type].bg }">
            {{ typeConfig[r._type].icon }} {{ typeConfig[r._type].label }}
          </span>
          <span class="mobile-result-titre">{{ getResultTitle(r) }}</span>
        </div>
      </div>
      <div class="mobile-links">
        <span @click="scrollVers('quisommesnous')">QUI SOMMES NOUS</span>
        <span @click="scrollVers('formations')">NOS FORMATIONS</span>
        <span @click="scrollVers('objets')">OBJETS CONNECTÉS</span>
        <span @click="scrollVers('actualites')">ACTUALITÉS</span>
        <span @click="scrollVers('evenements')">ÉVÉNEMENTS</span>
        <span @click="scrollVers('contact')">CONTACT</span>
        <span @click="router.push('/register')" class="mobile-inscrire">S'INSCRIRE</span>
      </div>
    </div>

    <!-- BACKDROP pour fermer le panneau -->
    <div class="search-backdrop" v-if="filtresVisibles" @click="fermerRecherche"></div>
  </div>
</template>

<style scoped>
/* ── Topbar ── */
.topbar {
  background: #1a5c9e; color: white;
  padding: 10px 2rem; display: flex;
  justify-content: space-between; align-items: center;
  font-size: 13px; letter-spacing: 1px;
}
.topbar-links { display: flex; align-items: center; gap: 14px; color: #d6e8f7; }
.topbar-links span:not(.sep):hover { color: white; cursor: pointer; }
.topbar-right { display: flex; align-items: center; gap: 14px; color: #d6e8f7; }
.sep { color: #5a8ab8; }
.langue-menu { position: relative; }
.langue-btn { cursor: pointer; color: #d6e8f7; font-weight: 600; }
.langue-btn:hover { color: white; }
.langue-dropdown { position: absolute; top: 28px; right: 0; background: white; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.15); overflow: hidden; z-index: 300; min-width: 100px; }
.langue-dropdown span { display: block; padding: 10px 14px; font-size: 13px; color: #333; cursor: pointer; }
.langue-dropdown span:hover { background: #f0f5ff; color: #1a5c9e; }

/* ── Navbar ── */
.navbar {
  background: white; border-bottom: 2px solid #1a5c9e;
  padding: 0 2rem; height: 80px; display: flex;
  align-items: center; justify-content: space-between;
  position: sticky; top: 0; z-index: 200;
}
.navbar-brand { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
.navbar-logo { height: 65px; width: auto; }
.navbar-name { font-weight: 800; font-size: 22px; color: #0d2d5e; letter-spacing: 2px; }
.navbar-sub { font-size: 11px; color: #999; letter-spacing: 1px; text-transform: uppercase; }

.navbar-links { display: flex; align-items: center; gap: 1.5rem; }
.nav-link { font-size: 12px; font-weight: 700; color: #0d2d5e; letter-spacing: 0.8px; cursor: pointer; white-space: nowrap; padding-bottom: 4px; border-bottom: 2px solid transparent; transition: border-color 0.2s, color 0.2s; }
.nav-link:hover { color: #1a5c9e; border-bottom: 2px solid #1a5c9e; }
.btn-inscrire {
  background: #1a5c9e !important; color: white !important;
  padding: 8px 16px !important; border-radius: 8px !important;
  border-bottom: none !important; padding-bottom: 8px !important;
}
.btn-inscrire:hover { background: #0d2d5e !important; border-bottom: none !important; }

/* ── Barre de recherche ── */
.navbar-search { position: relative; flex-shrink: 0; }

.search-bar {
  display: flex; align-items: center; gap: 8px;
  border: 1.5px solid #e5e7eb; border-radius: 25px;
  padding: 8px 14px; transition: border-color 0.2s, box-shadow 0.2s;
  background: white;
}
.search-bar.active { border-color: #1a5c9e; box-shadow: 0 0 0 3px rgba(26,92,158,0.1); }
.search-icon { font-size: 14px; flex-shrink: 0; }
.search-input { border: none; outline: none; font-size: 14px; width: 200px; color: #333; background: transparent; }
.search-clear { background: none; border: none; cursor: pointer; color: #999; font-size: 14px; padding: 0 2px; line-height: 1; }
.search-clear:hover { color: #333; }

/* ── Panneau de recherche ── */
.search-panel {
  position: absolute; top: calc(100% + 12px); right: 0;
  background: white; border: 1.5px solid #e5e7eb; border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.12);
  z-index: 250; width: 440px;
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* ── Filtres ── */
.filters-section { padding: 1rem 1.2rem 0.8rem; border-bottom: 1px solid #f0f0f0; }
.filter-row { margin-bottom: 10px; }
.filter-label { display: block; font-size: 11px; font-weight: 700; color: #888; letter-spacing: 0.8px; text-transform: uppercase; margin-bottom: 6px; }

.cat-pills { display: flex; flex-wrap: wrap; gap: 6px; }
.cat-pill {
  padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;
  border: 1.5px solid #e5e7eb; background: white; color: #555;
  cursor: pointer; transition: all 0.15s;
}
.cat-pill:hover { border-color: #1a5c9e; color: #1a5c9e; }
.cat-pill.active { background: #1a5c9e; border-color: #1a5c9e; color: white; }

.filter-input {
  width: 100%; padding: 8px 12px; border: 1.5px solid #e5e7eb;
  border-radius: 8px; font-size: 13px; outline: none; color: #333;
  box-sizing: border-box; transition: border-color 0.2s;
}
.filter-input:focus { border-color: #1a5c9e; }

.filters-actions { display: flex; justify-content: flex-end; padding-top: 4px; }
.btn-search {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 18px; background: #1a5c9e; color: white;
  border: none; border-radius: 8px; cursor: pointer;
  font-size: 13px; font-weight: 600; transition: background 0.2s;
}
.btn-search:hover:not(:disabled) { background: #0d2d5e; }
.btn-search:disabled { opacity: 0.7; cursor: not-allowed; }
.spinner-btn {
  width: 14px; height: 14px; border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white; border-radius: 50%;
  animation: spin 0.7s linear infinite; display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* ── Résultats ── */
.resultats { max-height: 320px; overflow-y: auto; }
.resultats-header {
  padding: 8px 1.2rem 6px;
  font-size: 11px; font-weight: 700; color: #888;
  letter-spacing: 0.8px; text-transform: uppercase;
  border-bottom: 1px solid #f5f5f5;
}
.resultat-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 1.2rem; cursor: pointer;
  border-bottom: 1px solid #f5f5f5; transition: background 0.15s;
}
.resultat-item:last-child { border-bottom: none; }
.resultat-item:hover { background: #f8faff; }
.resultat-left { display: flex; flex-direction: column; gap: 3px; flex: 1; min-width: 0; }
.resultat-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 10px; font-weight: 700; padding: 2px 8px;
  border-radius: 12px; width: fit-content; letter-spacing: 0.3px;
}
.resultat-titre {
  font-size: 13px; font-weight: 600; color: #0d2d5e;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  max-width: 340px;
}
.resultat-subtitle { font-size: 11px; color: #999; }
.resultat-arrow { color: #ccc; font-size: 18px; flex-shrink: 0; margin-left: 8px; }
.resultat-item:hover .resultat-arrow { color: #1a5c9e; }

.no-resultat { text-align: center; font-size: 13px; color: #999; padding: 1.5rem 1rem; }

/* ── Backdrop ── */
.search-backdrop {
  position: fixed; inset: 0; z-index: 190;
  background: transparent;
}

/* ── Mobile ── */
.menu-mobile-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #0d2d5e; padding: 4px 8px; }
.menu-mobile {
  background: white; border-bottom: 2px solid #1a5c9e;
  padding: 1rem 2rem; display: flex; flex-direction: column; gap: 12px;
  position: sticky; top: 80px; z-index: 99;
}
.mobile-search { display: flex; gap: 8px; }
.mobile-cat-select {
  padding: 8px 10px; border: 1.5px solid #e5e7eb; border-radius: 8px;
  font-size: 13px; outline: none; color: #333; background: white;
}
.mobile-search-input { flex: 1; padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 14px; outline: none; }
.mobile-search-input:focus { border-color: #1a5c9e; }
.mobile-search-btn { padding: 10px 14px; background: #1a5c9e; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; }
.mobile-results { display: flex; flex-direction: column; gap: 4px; }
.mobile-result-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 10px; border-radius: 8px; cursor: pointer;
  border: 1px solid #f0f0f0; transition: background 0.15s;
}
.mobile-result-item:hover { background: #f0f5ff; }
.mobile-result-titre { font-size: 13px; font-weight: 600; color: #0d2d5e; }
.mobile-links { display: flex; flex-direction: column; gap: 4px; }
.mobile-links span { padding: 10px 0; font-size: 14px; font-weight: 600; color: #0d2d5e; cursor: pointer; border-bottom: 1px solid #f0f0f0; letter-spacing: 0.5px; }
.mobile-links span:hover { color: #1a5c9e; }
.mobile-inscrire {
  background: #1a5c9e !important; color: white !important;
  padding: 10px 16px !important; border-radius: 8px !important;
  text-align: center !important; border-bottom: none !important;
}

/* ── Responsive ── */
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
