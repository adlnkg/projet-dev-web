<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getMe, DEFAULT_AVATAR } from '../utils/user'

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

const currentUser = ref(null)
const showAdmin = computed(() => currentUser.value && (currentUser.value.role === 'ADMIN' || currentUser.value.role === 'SUPER_USER'))

onMounted(async () => {
  try {
    currentUser.value = await getMe()
  } catch (e) {
    // silent
  }
})

function goToProfile() {
  router.push('/profile')
}

function logOut() {
  localStorage.removeItem('token')
  localStorage.removeItem('email')
}

const avatarUrl = computed(() => {
  if (!currentUser.value) return DEFAULT_AVATAR
  return currentUser.value.avatarUrl || currentUser.value.avatar || DEFAULT_AVATAR
})

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

function getResultType(item, fallback = '') {
  const type = item.entityType ?? fallback ?? detectType(item)
  return String(type).toLowerCase()
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

function allerSection(id) {
  if (router.currentRoute.value.path === '/') {
    scrollVers(id)
    return
  }
  router.push('/').then(() => {
    setTimeout(() => scrollVers(id), 320)
  })
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
        <span @click="allerSection('actualites')">ACTUALITÉS</span>
        <span class="sep">|</span>
        <span @click="allerSection('evenements')">ÉVÉNEMENTS</span>
        <span class="sep">|</span>
        <span @click="router.push('/users')">UTILISATEURS</span>
        <span class="sep">|</span>
        <span @click="allerSection('contact')">CONTACT</span>
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
      <div class="navbar-brand" @click="router.push('/')" title="Accueil">
        <img src="/cytech-logo.png" alt="CYTech" class="navbar-logo" />
        <div>
          <div class="navbar-name">CYTech</div>
          <div class="navbar-sub">École d'Ingénieurs</div>
        </div>
      </div>

      <!-- LIENS DESKTOP -->
      <div class="navbar-links desktop-only">
        <span class="nav-link" @click="allerSection('quisommesnous')">QUI SOMMES NOUS</span>
        <span class="nav-link" @click="allerSection('formations')">NOS FORMATIONS</span>
        <span class="nav-link" @click="allerSection('objets')">OBJETS CONNECTÉS</span>
        <span v-if="showAdmin" class="nav-link" @click="router.push('/admin')">ADMIN</span>
        <template v-if="!currentUser">
          <button class="nav-cta" @click="router.push('/login')">S'INSCRIRE / SE CONNECTER</button>
        </template>
        <template v-else>
          <button class="avatar-btn" @click="goToProfile" :title="currentUser.firstName || currentUser.login">
            <img :src="avatarUrl" alt="avatar" class="avatar-img" />
          </button>
          <button class="nav-cta" @click="logOut">SE DÉCONNECTER</button>
        </template>
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
        <span @click="allerSection('quisommesnous')">QUI SOMMES NOUS</span>
        <span @click="allerSection('formations')">NOS FORMATIONS</span>
        <span @click="allerSection('objets')">OBJETS CONNECTÉS</span>
        <span @click="allerSection('actualites')">ACTUALITÉS</span>
        <span @click="allerSection('evenements')">ÉVÉNEMENTS</span>
        <span @click="router.push('/users')">UTILISATEURS</span>
        <span @click="allerSection('contact')">CONTACT</span>
        <span v-if="showAdmin" @click="router.push('/admin')">ADMIN</span>
        <template v-if="!currentUser">
          <button class="mobile-inscrire" @click="router.push('/login')">S'INSCRIRE / SE CONNECTER</button>
        </template>
        <template v-else>
          <div class="mobile-avatar-row" @click="goToProfile" style="display:flex;align-items:center;gap:8px;cursor:pointer;">
            <img :src="avatarUrl" alt="avatar" class="avatar-img mobile-avatar" />
            <span style="font-weight:700;color:#0d2d5e">{{ currentUser.firstName || currentUser.login }}</span>
          </div>
          <button class="mobile-inscrire" @click="logOut">SE DÉCONNECTER</button>
        </template>
      </div>
    </div>

    <!-- BACKDROP pour fermer le panneau -->
    <div class="search-backdrop" v-if="filtresVisibles" @click="fermerRecherche"></div>
  </div>
</template>

<style scoped>
.topbar {
  background: linear-gradient(90deg, #0d2d5e 0%, #1a5c9e 70%, #2563eb 100%);
  color: white;
  padding: 9px 1.4rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  letter-spacing: 1px;
  position: sticky;
  top: 0;
  z-index: 230;
}

.topbar-links {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #dbeafe;
}

.topbar-links span:not(.sep) {
  cursor: pointer;
  font-weight: 700;
  transition: color 0.15s, transform 0.15s;
}

.topbar-links span:not(.sep):hover {
  color: white;
  transform: translateY(-1px);
}

.topbar-right {
  display: flex;
  align-items: center;
}

.sep {
  color: rgba(255, 255, 255, 0.45);
}

.langue-menu {
  position: relative;
}

.langue-btn {
  cursor: pointer;
  color: #e2ecff;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.15s;
}

.langue-btn:hover {
  background: rgba(255, 255, 255, 0.16);
}

.langue-dropdown {
  position: absolute;
  top: 34px;
  right: 0;
  background: white;
  border-radius: 10px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.16);
  overflow: hidden;
  min-width: 110px;
  z-index: 300;
}

.langue-dropdown span {
  display: block;
  padding: 10px 14px;
  font-size: 13px;
  color: #1f2937;
  cursor: pointer;
}

.langue-dropdown span:hover {
  background: #eff6ff;
  color: #1a5c9e;
}

.navbar {
  height: 84px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.2rem;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
  position: sticky;
  top: 38px;
  z-index: 220;
}

.navbar-brand {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  min-width: 200px;
}

.navbar-logo {
  height: 58px;
  width: auto;
}

.navbar-name {
  font-weight: 900;
  font-size: 21px;
  color: #0d2d5e;
  letter-spacing: 1.4px;
}

.navbar-sub {
  font-size: 10px;
  color: #64748b;
  letter-spacing: 1.1px;
  text-transform: uppercase;
}

.navbar-links {
  display: flex;
  align-items: center;
  gap: 0.95rem;
}

.nav-link {
  font-size: 11px;
  font-weight: 800;
  color: #0f315f;
  letter-spacing: 0.7px;
  cursor: pointer;
  white-space: nowrap;
  padding: 8px 10px;
  border-radius: 10px;
  transition: background 0.15s, color 0.15s, transform 0.15s;
}

.nav-link:hover {
  background: #eff6ff;
  color: #1a5c9e;
  transform: translateY(-1px);
}

.nav-cta {
  background: linear-gradient(135deg, #1a5c9e 0%, #2563eb 100%);
  color: white;
  border: none;
  padding: 10px 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 800;
  font-size: 12px;
  box-shadow: 0 8px 16px rgba(26, 92, 158, 0.28);
  transition: transform 0.15s, box-shadow 0.15s;
}

.nav-cta:hover {
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(26, 92, 158, 0.34);
}

.avatar-btn {
  background: white;
  border: 2px solid #dbeafe;
  padding: 0;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s, transform 0.15s;
}

.avatar-btn:hover {
  border-color: #1a5c9e;
  transform: translateY(-1px);
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.navbar-search {
  position: relative;
  margin-left: 0.8rem;
}

.search-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid #dbe3ef;
  border-radius: 999px;
  padding: 8px 12px;
  min-width: 290px;
  background: white;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-bar.active {
  border-color: #1a5c9e;
  box-shadow: 0 0 0 4px rgba(26, 92, 158, 0.1);
}

.search-icon {
  font-size: 13px;
}

.search-input {
  border: none;
  outline: none;
  font-size: 14px;
  width: 100%;
  color: #1f2937;
  background: transparent;
}

.search-clear {
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 14px;
  line-height: 1;
}

.search-clear:hover {
  color: #0f172a;
}

.search-panel {
  position: absolute;
  top: calc(100% + 12px);
  right: 0;
  width: 460px;
  max-width: calc(100vw - 2rem);
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 16px;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
  z-index: 260;
  overflow: hidden;
}

.filters-section {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.filter-row {
  margin-bottom: 10px;
}

.filter-label {
  display: block;
  margin-bottom: 6px;
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.cat-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.cat-pill {
  padding: 6px 11px;
  border-radius: 999px;
  border: 1px solid #dbe3ef;
  background: #fff;
  color: #334155;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.15s;
}

.cat-pill:hover {
  border-color: #1a5c9e;
  color: #1a5c9e;
}

.cat-pill.active {
  background: #1a5c9e;
  border-color: #1a5c9e;
  color: white;
}

.filter-input {
  width: 100%;
  padding: 9px 11px;
  border: 1.5px solid #dbe3ef;
  border-radius: 10px;
  font-size: 13px;
  color: #1f2937;
  outline: none;
  box-sizing: border-box;
}

.filter-input:focus {
  border-color: #1a5c9e;
}

.filters-actions {
  display: flex;
  justify-content: flex-end;
}

.btn-search {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: none;
  border-radius: 10px;
  background: #1a5c9e;
  color: white;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.btn-search:hover:not(:disabled) {
  background: #0d2d5e;
}

.btn-search:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner-btn {
  width: 13px;
  height: 13px;
  border: 2px solid rgba(255, 255, 255, 0.45);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.resultats {
  max-height: 330px;
  overflow-y: auto;
}

.resultats-header {
  padding: 8px 1rem;
  font-size: 11px;
  font-weight: 800;
  color: #64748b;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  border-bottom: 1px solid #f1f5f9;
}

.resultat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 10px 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f8fafc;
  transition: background 0.12s;
}

.resultat-item:hover {
  background: #f8fbff;
}

.resultat-left {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.resultat-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 800;
  padding: 3px 8px;
  border-radius: 999px;
  width: fit-content;
}

.resultat-titre {
  color: #0d2d5e;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 320px;
}

.resultat-subtitle {
  color: #94a3b8;
  font-size: 11px;
}

.resultat-arrow {
  color: #cbd5e1;
  font-size: 18px;
}

.resultat-item:hover .resultat-arrow {
  color: #1a5c9e;
}

.no-resultat {
  text-align: center;
  padding: 1.35rem;
  color: #94a3b8;
  font-size: 13px;
}

.search-backdrop {
  position: fixed;
  inset: 0;
  z-index: 190;
  background: transparent;
}

.menu-mobile-btn {
  width: 42px;
  height: 42px;
  border: 1px solid #dbe3ef;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  color: #0d2d5e;
  font-size: 20px;
  font-weight: 700;
}

.menu-mobile {
  background: white;
  border-top: 1px solid #edf2f7;
  border-bottom: 1px solid #edf2f7;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  position: sticky;
  top: 122px;
  z-index: 200;
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.06);
}

.mobile-search {
  display: flex;
  gap: 8px;
}

.mobile-cat-select,
.mobile-search-input {
  border: 1.5px solid #dbe3ef;
  border-radius: 10px;
  padding: 10px;
  font-size: 14px;
  outline: none;
}

.mobile-search-input {
  flex: 1;
}

.mobile-cat-select:focus,
.mobile-search-input:focus {
  border-color: #1a5c9e;
}

.mobile-search-btn {
  border: none;
  border-radius: 10px;
  background: #1a5c9e;
  color: white;
  width: 42px;
  cursor: pointer;
}

.mobile-results {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.mobile-result-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border-radius: 10px;
  cursor: pointer;
  border: 1px solid #f1f5f9;
}

.mobile-result-item:hover {
  background: #f8fbff;
}

.mobile-result-titre {
  color: #0d2d5e;
  font-size: 13px;
  font-weight: 700;
}

.mobile-links {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.mobile-links span {
  padding: 10px 2px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  color: #0d2d5e;
  font-size: 14px;
  font-weight: 700;
}

.mobile-links span:hover {
  color: #1a5c9e;
}

.mobile-inscrire {
  border: none;
  border-radius: 10px;
  background: #1a5c9e;
  color: white;
  padding: 10px 12px;
  font-weight: 700;
  cursor: pointer;
}

.mobile-avatar {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  object-fit: cover;
}

.desktop-only {
  display: flex;
}

.mobile-only {
  display: none;
}

@media (max-width: 1100px) {
  .navbar-search .search-bar {
    min-width: 240px;
  }

  .nav-link {
    padding: 8px 7px;
    font-size: 10.5px;
  }
}

@media (max-width: 900px) {
  .desktop-only {
    display: none !important;
  }

  .mobile-only {
    display: block !important;
  }

  .topbar {
    padding: 8px 1rem;
  }

  .topbar-links {
    display: none;
  }

  .navbar {
    top: 34px;
    height: 76px;
    padding: 0 1rem;
  }

  .navbar-logo {
    height: 48px;
  }

  .navbar-name {
    font-size: 17px;
  }
}

@media (max-width: 480px) {
  .navbar-brand {
    min-width: unset;
  }

  .navbar-sub {
    display: none;
  }
}
</style>
